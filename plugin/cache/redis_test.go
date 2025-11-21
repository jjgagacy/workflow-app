package cache

import (
	"errors"
	"fmt"
	"strings"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// func init() {
// 	utils.SetLogVisibility(true)
// }

const (
	TEST_PREFIX = "prefix"
)

type User struct {
	ID    string `json:"id" cbor:"id"`
	Name  string `json:"name" cbor:"name"`
	Email string `json:"email" cbor:"email"`
	Age   int    `json:"age" cbor:"age"`
}

type Product struct {
	ID    string  `json:"id" cbor:"id"`
	Name  string  `json:"name" cbor:"name"`
	Price float64 `json:"price" cbor:"price"`
}

func getConnection() error {
	return InitRedisClient("0.0.0.0:6379", "", "", false, 0)
}

func TestRedisConnection(t *testing.T) {
	if err := getConnection(); err != nil {
		t.Errorf("get redis connection failed: %v", err)
		return
	}

	if err := Close(); err != nil {
		t.Errorf("close redis client failed: %v", err)
		return
	}
}

func TestRedisTransaction(t *testing.T) {
	if err := getConnection(); err != nil {
		t.Errorf("get redis connection failed: %v", err)
		return
	}
	defer Close()

	err := Transaction(func(p redis.Pipeliner) error {
		if err := Store(
			strings.Join([]string{TEST_PREFIX, "key"}, ":"),
			"value",
			time.Second,
			p,
		); err != nil {
			t.Errorf("store key failed: %v", err)
			return err
		}

		return errors.New("test transaction error")
	})

	if err == nil {
		t.Errorf("transaction should return error")
		return
	}

	value, err := GetString(
		strings.Join([]string{TEST_PREFIX, "key"}, ":"),
	)

	if err != ErrNotFound {
		t.Errorf("key should not exists")
		return
	}

	if value != "" {
		t.Errorf("value should be empty")
		return
	}

	// test success transaction
	err = Transaction(func(p redis.Pipeliner) error {
		if err := Store(
			strings.Join([]string{TEST_PREFIX, "key"}, ":"),
			"value",
			time.Second,
			p,
		); err != nil {
			t.Errorf("store key faild: %v", err)
			return err
		}
		return nil
	})

	if err != nil {
		t.Errorf("transaction should not return error")
		return
	}

	defer Del(strings.Join([]string{TEST_PREFIX, "key"}, ":"))

	value, err = GetString(strings.Join([]string{TEST_PREFIX, "key"}, ":"))

	if err != nil {
		t.Errorf("get key faild: %v", err)
		return
	}

	if value != "value" {
		t.Errorf("value return error")
		return
	}
}

func TestIncrDecr(t *testing.T) {
	if err := getConnection(); err != nil {
		t.Errorf("get redis connection failed: %v", err)
		return
	}
	defer Close()

	t.Run("incr counter", func(t *testing.T) {
		key := "test:counter"

		result, err := Incr(key)
		require.NoError(t, err)
		assert.Equal(t, int64(1), result)

		result, err = Incr(key)
		require.NoError(t, err)
		assert.Equal(t, int64(2), result)

		Del(key)
	})

	t.Run("decr counter", func(t *testing.T) {
		key := "test-decr"

		err := Store(key, "5", time.Minute)
		require.NoError(t, err)

		result, err := Decr(key)
		require.NoError(t, err)
		assert.Equal(t, int64(4), result)
	})

	t.Run("decr non-existent key", func(t *testing.T) {
		key := "non-existent-key"

		result, err := Decr(key)
		require.NoError(t, err)
		assert.Equal(t, int64(-1), result)

		result, err = Del(key)
		require.NoError(t, err)
		assert.Equal(t, int64(1), result)
	})
}

func TestExist(t *testing.T) {
	if err := getConnection(); err != nil {
		t.Errorf("get redis connection failed: %v", err)
		return
	}
	defer Close()

	t.Run("check existing key", func(t *testing.T) {
		key := "test-existing"
		value := "exists"

		err := Store(key, value, time.Minute)
		require.NoError(t, err)

		count, err := Exist(key)
		require.NoError(t, err)
		assert.Equal(t, int64(1), count)
	})

	t.Run("check non-existent key", func(t *testing.T) {
		count, err := Exist("non-existent")
		require.NoError(t, err)
		assert.Equal(t, int64(0), count)
	})
}

func TestGetString(t *testing.T) {
	if err := getConnection(); err != nil {
		t.Errorf("get redis connection failed: %v", err)
		return
	}
	defer Close()

	t.Run("get existing string", func(t *testing.T) {
		key := "test:getstring"
		value := "test value"

		err := Store(key, value, time.Minute)
		require.NoError(t, err)

		result, err := GetString(key)
		require.NoError(t, err)
		assert.Equal(t, value, result)
	})

	t.Run("get non-existent string", func(t *testing.T) {
		result, err := GetString("non-existent-string")
		assert.ErrorIs(t, err, ErrNotFound)
		assert.Equal(t, "", result)
	})
}

func TestHashOperations(t *testing.T) {
	if err := getConnection(); err != nil {
		t.Errorf("get redis connection failed: %v", err)
		return
	}
	defer Close()

	t.Run("set and get map fields", func(t *testing.T) {
		key := "test:hash"
		data := map[string]any{
			"name":  "Alice",
			"age":   "30",
			"email": "alice@example.com",
		}

		err := MapSet(key, data)
		require.NoError(t, err)

		name, err := MapGetOneString(key, "name")
		require.NoError(t, err)
		assert.Equal(t, "Alice", name)

		result, err := MapGet[string](key)
		require.NoError(t, err)
		assert.Equal(t, map[string]string{
			"name":  "Alice",
			"age":   "30",
			"email": "alice@example.com",
		}, result)
	})

	t.Run("set single map field with struct", func(t *testing.T) {
		key := "test:hash:single"
		user := User{
			ID:   "123",
			Name: "Bob",
		}

		err := MapSetOne(key, "user:1", user)
		require.NoError(t, err)

		result, err := MapGetOne[User](key, "user:1")
		require.NoError(t, err)
		assert.Equal(t, user, *result)
	})

	t.Run("delete map field", func(t *testing.T) {
		key := "test:hash:delete"
		data := map[string]any{
			"field1": "value1",
			"field2": "value2",
		}

		err := MapSet(key, data)
		require.NoError(t, err)

		err = MapDelOne(key, "field1")
		require.NoError(t, err)

		result, err := MapGet[string](key)
		require.NoError(t, err)
		assert.Equal(t, map[string]string{
			"field2": "value2",
		}, result)
	})

	t.Run("get non-existent map field", func(t *testing.T) {
		key := "test:hash:nonexistent"

		_, err := MapGetOne[string](key, "field")
		assert.ErrorIs(t, err, ErrNotFound)

		_, err = MapGetOneString(key, "field")
		assert.ErrorIs(t, err, ErrNotFound)
	})

}

func TestRedisScanMap(t *testing.T) {
	if err := getConnection(); err != nil {
		t.Errorf("get redis connection failed: %v", err)
		return
	}
	defer Close()

	type s struct {
		Field string `json:"field"`
	}

	err := MapSetOne(strings.Join([]string{TEST_PREFIX, "map"}, ":"), "key1", s{Field: "value1"})
	if err != nil {
		t.Errorf("set map field: %v", err)
		return
	}
	defer Del(strings.Join([]string{TEST_PREFIX, "map"}, ":"))
	err = MapSetOne(strings.Join([]string{TEST_PREFIX, "map"}, ":"), "key2", s{Field: "value2"})
	if err != nil {
		t.Errorf("set map field: %v", err)
		return
	}
	err = MapSetOne(strings.Join([]string{TEST_PREFIX, "map"}, ":"), "key3", s{Field: "value3"})
	if err != nil {
		t.Errorf("set map field: %v", err)
		return
	}
	data, err := ScanMap[s](strings.Join([]string{TEST_PREFIX, "map"}, ":"), "key*")
	if err != nil {
		t.Errorf("scan map failed: %v", err)
		return
	}
	if len(data) != 3 {
		t.Errorf("scan map length should return 3, got: %d", len(data))
		return
	}

	if data["key1"].Field != "value1" {
		t.Error("map key1 should return value1")
		return
	}
	if data["key2"].Field != "value2" {
		t.Error("map key2 should return value2")
		return
	}
	if data["key3"].Field != "value3" {
		t.Error("map key3 should return value3")
		return
	}
}

func TestRedisPubSubscribe(t *testing.T) {
	if err := getConnection(); err != nil {
		t.Errorf("get redis connection failed: %v", err)
		return
	}
	defer Close()

	ch := "test-channel"

	type s struct{}

	sub, cancel := Subscribe[s](ch)
	defer cancel()

	wg := sync.WaitGroup{}

	wg.Go(func() {
		<-sub
	})

	// publish
	err := Publish(ch, s{})
	if err != nil {
		t.Errorf("publish fail: %v", err)
		return
	}

	wg.Wait()
}

func TestRedisP2A(t *testing.T) {
	if err := getConnection(); err != nil {
		t.Errorf("get redis connection failed: %v", err)
		return
	}
	defer Close()

	ch := "test-channel-p2a"

	type s struct{}

	wg := sync.WaitGroup{}
	wg.Add(3)

	swg := sync.WaitGroup{}
	swg.Add(3)

	for range 3 {
		go func() {
			sub, cancel := Subscribe[s](ch)
			swg.Done()
			defer cancel()
			<-sub
			wg.Done()
		}()
	}

	swg.Wait()

	err := Publish(ch, s{})
	if err != nil {
		t.Errorf("publish failed: %v", err)
		return
	}

	wg.Wait()
}

func TestSetAndGet(t *testing.T) {
	if err := InitRedisClient("127.0.0.1:6379", "", "", false, 0); err != nil {
		t.Fatal(err)
	}
	defer Close()

	m := map[string]string{
		"key": "hello",
	}

	err := Store(strings.Join([]string{TEST_PREFIX, "test-key"}, ":"), m, time.Minute)
	if err != nil {
		t.Fatal(err)
	}

	val, err := Get[map[string]string](strings.Join([]string{TEST_PREFIX, "test-key"}, ":"))
	if err != nil {
		t.Fatal(err)
	}
	if (*val)["key"] != "hello" {
		t.Fatalf("get should be hello")
		return
	}

	_, err = Del(strings.Join([]string{TEST_PREFIX, "test-key"}, ":"))
	if err != nil {
		t.Fatal(err)
	}

	val, err = Get[map[string]string](strings.Join([]string{TEST_PREFIX, "test-key"}, ":"))
	if err != ErrNotFound {
		t.Fatalf("get should be ErrNotFound")
	}
}

func TestLock(t *testing.T) {
	if err := InitRedisClient("127.0.0.1:6379", "", "", false, 0); err != nil {
		t.Fatal(err)
	}
	defer Close()

	const concurrent = 10
	const single_turn_time = 100

	wg := sync.WaitGroup{}
	wg.Add(concurrent)

	waitMilliseconds := int32(0)

	fn := func() {
		Lock("test-lock", "1", single_turn_time*time.Millisecond*1000, single_turn_time*time.Millisecond*1000)
		started := time.Now()
		time.Sleep(single_turn_time * time.Millisecond)
		defer func() {
			Unlock("test-lock", "1")
			atomic.AddInt32(&waitMilliseconds, int32(time.Since(started).Milliseconds()))
			wg.Done()
		}()
	}

	for range concurrent {
		go fn()
	}

	wg.Wait()

	fmt.Println("wait seconds", waitMilliseconds)

	assert.GreaterOrEqual(t, waitMilliseconds, int32(100*concurrent))
}

// 复杂的用户资料结构
type UserProfile struct {
	ID          string          `json:"id"`
	BasicInfo   BasicInfo       `json:"basic_info"`
	Preferences UserPreferences `json:"preferences"`
	Social      SocialAccounts  `json:"social_accounts"`
	Metadata    map[string]any  `json:"metadata"`
	Timestamps  TimeStamps      `json:"timestamps"`
	Tags        []string        `json:"tags"`
	Status      UserStatus      `json:"status"`
}

type BasicInfo struct {
	FirstName     string    `json:"first_name"`
	LastName      string    `json:"last_name"`
	Email         string    `json:"email"`
	Phone         string    `json:"phone"`
	BirthDate     time.Time `json:"birth_date"`
	Age           int       `json:"age"`
	Salary        float64   `json:"salary"`
	IsActive      bool      `json:"is_active"`
	MaritalStatus string    `json:"marital_status"`
}

type UserPreferences struct {
	Theme         string           `json:"theme"`
	Language      string           `json:"language"`
	Timezone      string           `json:"timezone"`
	Notifications NotificationPref `json:"notifications"`
	Privacy       PrivacySettings  `json:"privacy"`
}

type NotificationPref struct {
	Email   bool `json:"email"`
	SMS     bool `json:"sms"`
	Push    bool `json:"push"`
	Desktop bool `json:"desktop"`
}

type PrivacySettings struct {
	ProfileVisible bool     `json:"profile_visible"`
	Searchable     bool     `json:"searchable"`
	DataSharing    bool     `json:"data_sharing"`
	VisibleFields  []string `json:"visible_fields"`
	BlockedUsers   []string `json:"blocked_users"`
}

type SocialAccounts struct {
	Platforms map[string]SocialAccount `json:"platforms"`
	Stats     SocialStats              `json:"stats"`
}

type SocialAccount struct {
	Username  string    `json:"username"`
	URL       string    `json:"url"`
	Connected time.Time `json:"connected"`
	Verified  bool      `json:"verified"`
	Followers int       `json:"followers"`
}

type SocialStats struct {
	TotalFollowers int       `json:"total_followers"`
	LastActive     time.Time `json:"last_active"`
	EngagementRate float64   `json:"engagement_rate"`
}

type TimeStamps struct {
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
	LastLogin  time.Time `json:"last_login"`
	LastActive time.Time `json:"last_active"`
}

type UserStatus struct {
	Online    bool      `json:"online"`
	Status    string    `json:"status"` // away, busy, offline
	LastSeen  time.Time `json:"last_seen"`
	Device    string    `json:"device"`
	IPAddress string    `json:"ip_address"`
}

// 创建复杂的测试数据
func createComplexUserProfile() UserProfile {
	now := time.Now()

	return UserProfile{
		ID: "user_123456",
		BasicInfo: BasicInfo{
			FirstName:     "张",
			LastName:      "小明",
			Email:         "zhang.xiaoming@example.com",
			Phone:         "+86-138-0011-2233",
			BirthDate:     time.Date(1990, 5, 15, 0, 0, 0, 0, time.UTC),
			Age:           33,
			Salary:        125000.50,
			IsActive:      true,
			MaritalStatus: "married",
		},
		Preferences: UserPreferences{
			Theme:    "dark",
			Language: "zh-CN",
			Timezone: "Asia/Shanghai",
			Notifications: NotificationPref{
				Email:   true,
				SMS:     false,
				Push:    true,
				Desktop: true,
			},
			Privacy: PrivacySettings{
				ProfileVisible: true,
				Searchable:     true,
				DataSharing:    false,
				VisibleFields:  []string{"name", "email", "basic_info"},
				BlockedUsers:   []string{"spammer_1", "harasser_2"},
			},
		},
		Social: SocialAccounts{
			Platforms: map[string]SocialAccount{
				"github": {
					Username:  "zhangxiaoming",
					URL:       "https://github.com/zhangxiaoming",
					Connected: now.Add(-365 * 24 * time.Hour),
					Verified:  true,
					Followers: 245,
				},
				"twitter": {
					Username:  "@zhang_xm",
					URL:       "https://twitter.com/zhang_xm",
					Connected: now.Add(-180 * 24 * time.Hour),
					Verified:  false,
					Followers: 1200,
				},
				"linkedin": {
					Username:  "zhang-xiaoming",
					URL:       "https://linkedin.com/in/zhang-xiaoming",
					Connected: now.Add(-720 * 24 * time.Hour),
					Verified:  true,
					Followers: 500,
				},
			},
			Stats: SocialStats{
				TotalFollowers: 1945,
				LastActive:     now.Add(-2 * time.Hour),
				EngagementRate: 4.7,
			},
		},
		Metadata: map[string]any{
			"account_tier":    "premium",
			"storage_used_mb": 245.7,
			"api_calls_today": 147,
			"features":        []string{"advanced_analytics", "custom_domains", "priority_support"},
			"limits": map[string]int{
				"max_projects":     10,
				"max_team_members": 5,
				"api_rate_limit":   1000,
			},
			"billing": map[string]any{
				"plan":         "business",
				"monthly_cost": 99.99,
				"currency":     "USD",
				"next_billing": now.Add(30 * 24 * time.Hour).Format(time.RFC3339),
			},
		},
		Timestamps: TimeStamps{
			CreatedAt:  now.Add(-720 * 24 * time.Hour),
			UpdatedAt:  now.Add(-7 * 24 * time.Hour),
			LastLogin:  now.Add(-2 * time.Hour),
			LastActive: now.Add(-30 * time.Minute),
		},
		Tags: []string{
			"premium_user",
			"early_adopter",
			"tech_enthusiast",
			"open_source_contributor",
			"backend_developer",
		},
		Status: UserStatus{
			Online:    true,
			Status:    "online",
			LastSeen:  now.Add(-5 * time.Minute),
			Device:    "MacBook Pro",
			IPAddress: "192.168.1.100",
		},
	}
}

func TestComplexHashOperations(t *testing.T) {
	if err := InitRedisClient("127.0.0.1:6379", "", "", false, 0); err != nil {
		t.Fatal(err)
	}
	defer Close()

	userProfile := createComplexUserProfile()
	hashKey := "user:profile:complex"

	t.Run("store and retrieve complex user profile", func(t *testing.T) {
		profile := map[string]any{
			"basic_info":  userProfile.BasicInfo,
			"preferences": userProfile.Preferences,
			"social":      userProfile.Social,
			"metadata":    userProfile.Metadata,
			"timestamps":  userProfile.Timestamps,
			"tags":        userProfile.Tags,
			"status":      userProfile.Status,
		}

		Del(hashKey)

		err := MapSet(hashKey, profile)
		require.NoError(t, err)

		retrievedMap, err := MapGet[any](hashKey)
		require.NoError(t, err)
		assert.NotEmpty(t, retrievedMap)
		assert.Len(t, retrievedMap, 7)

		var basicInfo BasicInfo
		basicInfoPtr, err := MapGetOne[BasicInfo](hashKey, "basic_info")
		require.NoError(t, err)
		basicInfo = *basicInfoPtr
		assert.Equal(t, userProfile.BasicInfo.FirstName, basicInfo.FirstName)
		assert.Equal(t, userProfile.BasicInfo.Age, basicInfo.Age)
		assert.Equal(t, userProfile.BasicInfo.Salary, basicInfo.Salary)
		assert.Equal(t, userProfile.BasicInfo.IsActive, basicInfo.IsActive)

		var preferences UserPreferences
		preferencesPtr, err := MapGetOne[UserPreferences](hashKey, "preferences")
		require.NoError(t, err)
		preferences = *preferencesPtr
		assert.Equal(t, userProfile.Preferences.Theme, preferences.Theme)
		assert.Equal(t, userProfile.Preferences.Notifications.Email, preferences.Notifications.Email)
		assert.Equal(t, userProfile.Preferences.Privacy.VisibleFields, preferences.Privacy.VisibleFields)

		var social SocialAccounts
		socialPtr, err := MapGetOne[SocialAccounts](hashKey, "social")
		require.NoError(t, err)
		social = *socialPtr
		assert.Len(t, social.Platforms, 3)
		assert.Equal(t, userProfile.Social.Platforms["github"].Username, social.Platforms["github"].Username)
		assert.Equal(t, userProfile.Social.Stats.TotalFollowers, social.Stats.TotalFollowers)

		var metadata map[string]any
		metadataPtr, err := MapGetOne[map[string]any](hashKey, "metadata")
		require.NoError(t, err)
		metadata = *metadataPtr
		assert.Equal(t, userProfile.Metadata["account_tier"], metadata["account_tier"])
		assert.Equal(t, userProfile.Metadata["storage_used_mb"], metadata["storage_used_mb"])

		billing, ok := metadata["billing"].(map[string]any)
		assert.True(t, ok)
		assert.Equal(t, userProfile.Metadata["billing"].(map[string]any)["plan"], billing["plan"])

		var tags []string
		tagsPtr, err := MapGetOne[[]string](hashKey, "tags")
		require.NoError(t, err)
		tags = *tagsPtr
		assert.Equal(t, userProfile.Tags, tags)
		assert.Contains(t, tags, "premium_user")
		assert.Contains(t, tags, "backend_developer")

		defer Del(hashKey)
	})

	t.Run("update individual fields in complex hash", func(t *testing.T) {
		newStatus := UserStatus{
			Online:    false,
			Status:    "away",
			LastSeen:  time.Now(),
			Device:    "iPhone",
			IPAddress: "192.168.1.200",
		}

		err := MapSetOne(hashKey, "status", newStatus)
		require.NoError(t, err)

		statusPtr, err := MapGetOne[UserStatus](hashKey, "status")
		require.NoError(t, err)
		assert.Equal(t, newStatus.Online, statusPtr.Online)
		assert.Equal(t, newStatus.Device, statusPtr.Device)

		updatedMetadata := map[string]any{
			"api_calls_today": 256,
			"new_feature":     "ai_assistant",
		}
		err = MapSetOne(hashKey, "metadata_partial", updatedMetadata)
		require.NoError(t, err)
	})
}

func TestScanOperations(t *testing.T) {
	if err := InitRedisClient("127.0.0.1:6379", "", "", false, 0); err != nil {
		t.Fatal(err)
	}
	defer Close()
	prepareScanTestData(t)

	t.Run("scan keys with pattern", func(t *testing.T) {
		keys, err := ScanKeys(strings.Join([]string{CACHE_PREFIX, "*test:scan:*"}, ":"))
		require.NoError(t, err)
		assert.Len(t, keys, 3)
	})
}

func prepareScanTestData(t *testing.T) {
	testData := map[string]string{
		"test:scan:1":  "value1",
		"test:scan:2":  "value2",
		"test:scan:3":  "value3",
		"test:other:1": "other1",
	}

	for k, v := range testData {
		err := Store(k, v, time.Minute)
		require.NoError(t, err)
	}
}

func TestDistributedLock(t *testing.T) {
	if err := InitRedisClient("127.0.0.1:6379", "", "", false, 0); err != nil {
		t.Fatal(err)
	}
	defer Close()

	t.Run("Acquire and release lock", func(t *testing.T) {
		key := "test:lock"

		err := Lock(key, "1", time.Second, time.Second)
		require.NoError(t, err)

		err = Unlock(key, "1")
		require.NoError(t, err)
	})

	t.Run("Lock timeout", func(t *testing.T) {
		key := "test:lock:timeout"

		err := Lock(key, "1", time.Minute, time.Second)
		require.NoError(t, err)
		defer Unlock(key, "1")

		err = Lock(key, "1", time.Minute, 100*time.Millisecond)
		assert.ErrorIs(t, err, ErrLockTimeout)
	})

	t.Run("Concurrent lock acquisition", func(t *testing.T) {
		key := "test:lock:concurrent"
		var wg sync.WaitGroup
		successCount := 0
		var mu sync.Mutex
		token := MakeDistributedLockKey()

		for range 5 {
			wg.Go(func() {
				err := Lock(key, token, time.Second, 500*time.Millisecond)
				if err == nil {
					mu.Lock()
					successCount++
					mu.Unlock()
					// wait time
					defer func() {
						time.Sleep(500 * time.Millisecond)
						Unlock(key, token)
					}()
				}
			})
		}

		wg.Wait()
		assert.Equal(t, 1, successCount)
	})
}

func TestPublishSubscribe(t *testing.T) {
	if err := getConnection(); err != nil {
		t.Errorf("get redis connection failed: %v", err)
		return
	}
	defer Close()

	t.Run("Publish and subscribe string messages", func(t *testing.T) {
		channel := "test:channel:string"

		messages, cleanup := Subscribe[string](channel)
		defer cleanup()

		err := Publish(channel, "hello world")
		require.NoError(t, err)

		err = Publish(channel, "test message")
		require.NoError(t, err)

		select {
		case msg := <-messages:
			assert.Equal(t, "hello world", msg)
		case <-time.After(2 * time.Second):
			t.Fatal("timeout waiting for message")
		}

		select {
		case msg := <-messages:
			assert.Equal(t, "test message", msg)
		case <-time.After(2 * time.Second):
			t.Fatal("timeout waiting for second message")
		}
	})

	t.Run("Publish and subscribe int messages", func(t *testing.T) {
		channel := "test:channel:int"

		messages, cleanup := Subscribe[int](channel)
		defer cleanup()

		err := Publish(channel, 2)
		require.NoError(t, err)

		err = Publish(channel, 3)
		require.NoError(t, err)

		select {
		case msg := <-messages:
			assert.Equal(t, 2, msg)
		case <-time.After(2 * time.Second):
			t.Fatal("timeout waiting for message")
		}

		select {
		case msg := <-messages:
			assert.Equal(t, 3, msg)
		case <-time.After(2 * time.Second):
			t.Fatal("timeout waiting for second message")
		}
	})

	t.Run("publish and subscribe struct messages", func(t *testing.T) {
		channel := "test:channel:struct"

		// 启动订阅者
		messages, cleanup := Subscribe[User](channel)
		defer cleanup()

		// 发布结构体消息
		user := User{
			ID:    "123",
			Name:  "Alice",
			Email: "alice@example.com",
			Age:   30,
		}

		err := Publish(channel, user)
		require.NoError(t, err)

		// 接收消息
		select {
		case msg := <-messages:
			assert.Equal(t, user, msg)
		case <-time.After(2 * time.Second):
			t.Fatal("timeout waiting for message")
		}
	})

	t.Run("multiple subscribers", func(t *testing.T) {
		channel := "test:channel:multi"

		// 启动多个订阅者
		sub1, cleanup1 := Subscribe[string](channel)
		defer cleanup1()

		sub2, cleanup2 := Subscribe[string](channel)
		defer cleanup2()

		// 发布消息
		err := Publish(channel, "broadcast message")
		require.NoError(t, err)

		// 两个订阅者都应该收到消息
		var received1, received2 string

		select {
		case msg := <-sub1:
			received1 = msg
		case <-time.After(2 * time.Second):
			t.Fatal("timeout waiting for subscriber 1")
		}

		select {
		case msg := <-sub2:
			received2 = msg
		case <-time.After(2 * time.Second):
			t.Fatal("timeout waiting for subscriber 2")
		}

		assert.Equal(t, "broadcast message", received1)
		assert.Equal(t, "broadcast message", received2)
	})
}
