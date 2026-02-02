package cache

import (
	"context"
	"crypto/tls"
	"errors"
	"fmt"
	"log"
	"maps"
	"reflect"
	"strings"
	"time"

	"github.com/jjgagacy/workflow-app/plugin/utils"
	"github.com/jjgagacy/workflow-app/plugin/utils/parser"
	"github.com/redis/go-redis/v9"
)

var (
	client redis.UniversalClient
	ctx    = context.Background()

	ErrDbNotInit   = errors.New("redis client not init")
	ErrNotFound    = errors.New("key not found")
	ErrLockTimeout = errors.New("lock timeout")
)

const (
	CACHE_PREFIX = "plugin_dae"
)

func getRedisOption(addr, username, password string, useSsl bool, db int) *redis.Options {
	opts := &redis.Options{
		Addr:     addr,
		Username: username,
		Password: password,
		DB:       db,
	}
	if useSsl {
		opts.TLSConfig = &tls.Config{}
	}
	return opts
}

func InitRedisClient(addr, username, password string, useSsl bool, db int) error {
	opts := getRedisOption(addr, username, password, useSsl, db)
	client = redis.NewClient(opts)

	if _, err := client.Ping(ctx).Result(); err != nil {
		return err
	}

	return nil
}

func InitRedisSentinelClient(sentinelAddrs []string, mastername, username, password, sentinelUsername, sentinelPassword string, useSsl bool, db int, socketTimeout float64) error {
	opts := &redis.FailoverOptions{
		MasterName:       mastername,
		SentinelAddrs:    sentinelAddrs,
		Username:         username,
		Password:         password,
		DB:               db,
		SentinelUsername: sentinelUsername,
		SentinelPassword: sentinelPassword,
	}

	if useSsl {
		opts.TLSConfig = &tls.Config{}
	}

	if socketTimeout > 0 {
		opts.DialTimeout = time.Duration(socketTimeout * float64(time.Second))
	}

	client = redis.NewFailoverClient(opts)

	if _, err := client.Ping(ctx).Result(); err != nil {
		return err
	}
	return nil
}

func Close() error {
	if client == nil {
		return ErrDbNotInit
	}

	return client.Close()
}

func getCmdable(cmdables ...redis.Cmdable) redis.Cmdable {
	if len(cmdables) > 0 {
		return cmdables[0]
	}
	return client
}

func serialKey(keys ...string) string {
	return strings.Join(
		append([]string{CACHE_PREFIX}, keys...),
		":",
	)
}

func store(key string, value any, time time.Duration, cmdables ...redis.Cmdable) error {
	if client == nil {
		return ErrDbNotInit
	}

	if _, ok := value.(string); !ok {
		var err error
		value, err = parser.CBORMarshal(value)
		if err != nil {
			return err
		}
	}

	return getCmdable(cmdables...).Set(ctx, key, value, time).Err()
}

func get[T any](key string, cmdables ...redis.Cmdable) (*T, error) {
	if client == nil {
		return nil, ErrDbNotInit
	}

	val, err := getCmdable(cmdables...).Get(ctx, key).Bytes()
	if err != nil {
		if err == redis.Nil {
			return nil, ErrNotFound
		}
		return nil, err
	}

	if len(val) == 0 {
		return nil, ErrNotFound
	}

	result, err := parser.CBORUnmarshal[T](val)
	return &result, err
}

func Store(key string, value any, time time.Duration, cmdables ...redis.Cmdable) error {
	return store(serialKey(key), value, time, cmdables...)
}

func Get[T any](key string, cmdables ...redis.Cmdable) (*T, error) {
	return get[T](serialKey(key), cmdables...)
}

func GetString(key string, cmdables ...redis.Cmdable) (string, error) {
	if client == nil {
		return "", ErrDbNotInit
	}

	v, err := getCmdable(cmdables...).Get(ctx, serialKey(key)).Result()
	if err != nil {
		if err == redis.Nil {
			return "", ErrNotFound
		}
	}

	return v, err
}

func del(key string, cmdables ...redis.Cmdable) (int64, error) {
	if client == nil {
		return 0, ErrDbNotInit
	}

	v, err := getCmdable(cmdables...).Del(ctx, key).Result()
	return v, err
}

func Del(key string, cmdables ...redis.Cmdable) (int64, error) {
	return del(serialKey(key), cmdables...)
}

func Exist(key string, cmdables ...redis.Cmdable) (int64, error) {
	if client == nil {
		return 0, ErrDbNotInit
	}

	return getCmdable(cmdables...).Exists(ctx, serialKey(key)).Result()
}

func Incr(key string, cmdables ...redis.Cmdable) (int64, error) {
	if client == nil {
		return 0, ErrDbNotInit
	}

	val, err := getCmdable(cmdables...).Incr(ctx, serialKey(key)).Result()
	if err != nil {
		if err == redis.Nil {
			return 0, ErrNotFound
		}
		return 0, err
	}

	return val, nil
}

func Decr(key string, cmdables ...redis.Cmdable) (int64, error) {
	if client == nil {
		return 0, ErrDbNotInit
	}

	return getCmdable(cmdables...).Decr(ctx, serialKey(key)).Result()
}

func Expire(key string, time time.Duration, cmdables ...redis.Cmdable) (bool, error) {
	if client == nil {
		return false, ErrDbNotInit
	}

	return getCmdable(cmdables...).Expire(ctx, serialKey(key), time).Result()
}

func MapSet(key string, v map[string]any, cmdables ...redis.Cmdable) error {
	if client == nil {
		return ErrDbNotInit
	}

	data := make(map[string]any)
	for field, value := range v {
		if _, ok := value.(string); !ok {
			value = utils.MarshalJson(value)
		}
		data[field] = value
	}

	return getCmdable(cmdables...).HMSet(ctx, serialKey(key), data).Err()
}

func MapSetOne(key string, field string, value any, cmdables ...redis.Cmdable) error {
	if client == nil {
		return ErrDbNotInit
	}

	if _, ok := value.(string); !ok {
		value = utils.MarshalJson(value)
	}

	return getCmdable(cmdables...).HSet(ctx, serialKey(key), field, value).Err()
}

func MapGetOne[T any](key string, field string, cmdables ...redis.Cmdable) (*T, error) {
	if client == nil {
		return nil, ErrDbNotInit
	}

	val, err := getCmdable(cmdables...).HGet(ctx, serialKey(key), field).Result()
	if err != nil {
		if err == redis.Nil {
			return nil, ErrNotFound
		}
		return nil, err
	}

	result, err := utils.UnmarshalJson[T](val)
	if err != nil {
		return nil, err
	}
	return &result, nil
}

func MapGetOneString(key string, field string, cmdables ...redis.Cmdable) (string, error) {
	if client == nil {
		return "", ErrDbNotInit
	}

	val, err := getCmdable(cmdables...).HGet(ctx, serialKey(key), field).Result()
	if err != nil {
		if err == redis.Nil {
			return "", ErrNotFound
		}
		return "", err
	}

	return val, nil
}

func MapDelOne(key string, field string, cmdables ...redis.Cmdable) error {
	if client == nil {
		return ErrDbNotInit
	}

	return getCmdable(cmdables...).HDel(ctx, serialKey(key), field).Err()
}

func MapGet[V any](key string, cmdables ...redis.Cmdable) (map[string]V, error) {
	if client == nil {
		return nil, ErrDbNotInit
	}

	val, err := getCmdable(cmdables...).HGetAll(ctx, serialKey(key)).Result()
	if err != nil {
		if err == redis.Nil {
			return nil, ErrNotFound
		}
		return nil, err
	}

	result := make(map[string]V)
	for k, v := range val {
		var out V
		if len(v) == 0 {
			result[k] = out
			continue
		}
		if len(v) > 0 && v[0] == '{' || v[0] == '[' {
			// likely json
			value, err := utils.UnmarshalJson[V](v)
			if err != nil {
				log.Printf("MapGet failed unmarshal json for field=%s: %v", k, err)
				continue
			}
			result[k] = value
		}

		if sv, ok := any(v).(V); ok {
			result[k] = sv
			continue
		}
		jsonWrapped := fmt.Sprintf(`"%s"`, v)
		out, err = utils.UnmarshalJson[V](jsonWrapped)
		if err != nil {
			log.Printf("MapGet fallback unmarshal failed for field=%s: %v", k, err)
			continue
		}

		result[k] = out
	}
	return result, nil
}

func ScanKeys(match string, cmdables ...redis.Cmdable) ([]string, error) {
	if client == nil {
		return nil, ErrDbNotInit
	}

	result := make([]string, 0)

	if err := ScanKeysAsync(match, func(keys []string) error {
		result = append(result, keys...)
		return nil
	}); err != nil {
		return nil, err
	}

	return result, nil
}

func ScanKeysAsync(match string, fn func([]string) error, cmdables ...redis.Cmdable) error {
	if client == nil {
		return ErrDbNotInit
	}

	cursor := uint64(0)
	for {
		keys, newCursor, err := getCmdable(cmdables...).Scan(ctx, cursor, match, 32).Result()
		if err != nil {
			return err
		}
		if err := fn(keys); err != nil {
			return err
		}
		if newCursor == 0 {
			break
		}
		cursor = newCursor
	}
	return nil
}

func ScanMapAsync[V any](key string, match string, fn func(map[string]V) error, cmdables ...redis.Cmdable) error {
	if client == nil {
		return ErrDbNotInit
	}

	cursor := uint64(0)
	for {
		key_values, newCursor, err := getCmdable(cmdables...).HScan(ctx, serialKey(key), cursor, match, 32).Result()
		if err != nil {
			return err
		}

		result := make(map[string]V)
		for i := 0; i < len(key_values); i += 2 {
			value, err := utils.UnmarshalJson[V](key_values[i+1])
			if err != nil {
				continue
			}
			result[key_values[i]] = value
		}
		if err := fn(result); err != nil {
			return err
		}

		if newCursor == 0 {
			break
		}
		cursor = newCursor
	}
	return nil
}

func ScanMap[V any](key string, match string, cmdables ...redis.Cmdable) (map[string]V, error) {
	if client == nil {
		return nil, ErrDbNotInit
	}

	result := make(map[string]V)

	ScanMapAsync(key, match, func(m map[string]V) error {
		maps.Copy(result, m)
		return nil
	}, cmdables...)

	return result, nil
}

func SetNX[T any](key string, value T, expire time.Duration, cmdables ...redis.Cmdable) (bool, error) {
	if client == nil {
		return false, ErrDbNotInit
	}

	bytes, err := parser.CBORMarshal(value)
	if err != nil {
		return false, err
	}

	return getCmdable(cmdables...).SetNX(ctx, serialKey(key), bytes, expire).Result()
}

func Lock(key string, token string, expire time.Duration, lockTimeout time.Duration, cmdables ...redis.Cmdable) error {
	if client == nil {
		return ErrDbNotInit
	}
	const d = 20 * time.Millisecond

	ticker := time.NewTicker(d)
	defer ticker.Stop()

	for range ticker.C {
		success, err := getCmdable(cmdables...).SetNX(ctx, serialKey(key), token, expire).Result()
		// fmt.Println("SETNX result:", success, err)
		if err != nil {
			return err
		} else if success {
			return nil
		}

		lockTimeout -= d
		if lockTimeout <= 0 {
			return ErrLockTimeout
		}
	}
	return nil
}

func Unlock(key string, token string, cmdables ...redis.Cmdable) error {
	if client == nil {
		return ErrDbNotInit
	}

	script := `
	if redis.call("GET", KEYS[1]) == ARGV[1] then
		return redis.call("DEL", KEYS[1])
	else
		return 0
	end
	`

	result, err := getCmdable(cmdables...).Eval(ctx, script, []string{serialKey(key)}, token).Result()
	if err != nil {
		return err
	}

	if result.(int64) == 0 {
		return errors.New("unlock failed: token mismatch")
	}

	return nil
}

func Transaction(fn func(redis.Pipeliner) error) error {
	if client == nil {
		return ErrDbNotInit
	}

	return client.Watch(ctx, func(tx *redis.Tx) error {
		_, err := tx.TxPipelined(ctx, func(p redis.Pipeliner) error {
			return fn(p)
		})
		if err == redis.Nil {
			return nil
		}
		return err
	})
}

func Publish(channel string, message any, cmdables ...redis.Cmdable) error {
	if client == nil {
		return ErrDbNotInit
	}

	if _, ok := message.(string); !ok {
		message = utils.MarshalJson(message)
	}

	return getCmdable(cmdables...).Publish(ctx, channel, message).Err()
}

func Subscribe[T any](channel string) (<-chan T, func()) {
	pubsub := client.Subscribe(ctx, channel)

	ch := make(chan T)
	connectionEstablished := make(chan bool)

	go func() {
		defer close(ch)
		defer close(connectionEstablished)

		alive := true
		for alive {
			rec, err := pubsub.Receive(context.Background())
			if err != nil {
				utils.Error("failed to receive message from redis: %s, will retry in 1 second", err.Error())
				time.Sleep(1 * time.Second)
				continue
			}

			switch data := rec.(type) {
			case *redis.Subscription:
				connectionEstablished <- true
			case *redis.Message:
				var v T
				if reflect.TypeOf(v).Kind() == reflect.String {
					ch <- any(data.Payload).(T)
					continue
				}
				v, err := utils.UnmarshalJson[T](data.Payload)
				if err != nil {
					// log
					utils.Warn("Subscribe message unmarshal err: %v", err)
					continue
				}
				ch <- v
			case *redis.Pong: // heartbeat
			default:
				alive = false
			}
		}
	}()

	// wait for the connection to be established
	<-connectionEstablished

	return ch, func() {
		pubsub.Close()
	}
}
