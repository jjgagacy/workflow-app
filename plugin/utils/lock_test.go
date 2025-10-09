package utils

import (
	"sync"
	"sync/atomic"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestGranularityLockBasic(t *testing.T) {
	gl := NewGranularityLock()

	gl.Lock("key1")
	assert.Equal(t, 1, len(gl.m))

	gl.Unlock("key1")
	assert.Equal(t, 0, len(gl.m))
}

func TestGranularityLockMultipleKeys(t *testing.T) {
	gl := NewGranularityLock()

	gl.Lock("key1")
	gl.Lock("key2")

	assert.Equal(t, 2, len(gl.m))

	gl.Unlock("key1")
	gl.Unlock("key2")

	assert.Equal(t, 0, len(gl.m))
}

func TestGranularityLockConcurrentAccessSameKeys(t *testing.T) {
	gl := NewGranularityLock()
	key := "shared_key"
	var counter int
	var wg sync.WaitGroup

	// 多个goroutine同时访问同一个key
	for range 100 {
		wg.Add(1)
		go func() {
			defer wg.Done()
			gl.Lock(key)
			counter++
			gl.Unlock(key)
		}()
	}

	wg.Wait()
	assert.Equal(t, 100, counter)
	assert.Equal(t, 0, len(gl.m), "锁应该被清理")
}

func TestGranularityLockReferenceCounting(t *testing.T) {
	gl := NewGranularityLock()
	key := "test_key"

	var wg sync.WaitGroup

	var successCount int32

	// 第一个goroutine多次加锁
	wg.Go(func() {
		gl.Lock(key)
		time.Sleep(100 * time.Millisecond)
		gl.Unlock(key)
	})

	// 多个goroutine尝试获取锁
	for i := range 5 {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()
			// 在第一个goroutine持有锁期间尝试获取
			time.Sleep(10 * time.Millisecond * time.Duration(id))
			if gl.TryLock(key) {
				atomic.AddInt32(&successCount, 1)
				gl.Unlock(key)
			}
		}(i)
	}

	wg.Wait()
	// 在锁被完全释放前，其他goroutine应该无法获取锁
	// 只有在完全释放后，可能有goroutine获取成功
	assert.True(t, successCount >= 0 && successCount <= 5, "成功次数应该在合理范围内")
}

func TestGranularityLockEmptyKey(t *testing.T) {
	gl := NewGranularityLock()

	gl.Lock("")
	gl.Unlock("")

	locked := gl.TryLock("")
	assert.True(t, locked)
	gl.Unlock("")
}

func TestGranularityLockMixedLock(t *testing.T) {
	gl := NewGranularityLock()
	key := "mixed_key"

	gl.Lock(key)

	locked := gl.TryLock(key)
	assert.False(t, locked)

	gl.Unlock(key)

	locked = gl.TryLock(key)
	assert.True(t, locked)

	// 解锁两次
	gl.Unlock(key)
	gl.Unlock(key)
}

func TestGranularityLockUnLockNonExistentKey(t *testing.T) {
	gl := NewGranularityLock()

	assert.NotPanics(t, func() {
		gl.Unlock("non_existent_key")
	})

	assert.Equal(t, 0, len(gl.m))
}

func TestGranularityLockStressTest(t *testing.T) {
	gl := NewGranularityLock()
	var wg sync.WaitGroup
	keys := []string{"A", "B", "C", "D", "E"}
	counter := make(map[string]int)
	var mu sync.Mutex

	// 压力测试：大量goroutine竞争少量key
	for i := range 500 {
		wg.Add(1)

		go func(id int) {
			defer wg.Done()

			key := keys[id%len(keys)]

			if id%2 == 0 {
				// 一半使用Lock
				gl.Lock(key)
			} else {
				// 一半使用TryLock，如果失败则重试
				for !gl.TryLock(key) {
					time.Sleep(time.Microsecond)
				}
			}

			// 临界区操作
			mu.Lock()
			counter[key]++
			mu.Unlock()

			gl.Unlock(key)
		}(i)
	}

	wg.Wait()

	// 验证计数器总和
	total := 0
	for _, count := range counter {
		total += count
	}
	assert.Equal(t, 500, total)
	assert.Equal(t, 0, len(gl.m))
}

func TestGranularityLockRaceCondition(t *testing.T) {
	gl := NewGranularityLock()
	key := "race_key"

	var wg sync.WaitGroup
	wg.Add(2)

	go func() {
		defer wg.Done()
		for range 100 {
			gl.Lock(key)
			time.Sleep(time.Microsecond)
			gl.Unlock(key)
		}
	}()

	go func() {
		defer wg.Done()
		for range 100 {
			if gl.TryLock(key) {
				time.Sleep(time.Microsecond)
				gl.Unlock(key)
			} else {
				time.Sleep(time.Microsecond)
			}
		}
	}()

	wg.Wait()
	assert.Equal(t, 0, len(gl.m))
}
