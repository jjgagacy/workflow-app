package utils

import (
	"sync"
	"sync/atomic"
)

type mutex struct {
	*sync.Mutex
	count int32
}

// GranularityLock provides fine-grained locking based on strings keys.
//
// NOTE: This implementation does not support reentrants locks.
// Attempting to acquire the same lock multiple times within the same
// goroutine will result in a deadlock.
type GranularityLock struct {
	m map[string]*mutex
	l sync.Mutex
}

func NewGranularityLock() *GranularityLock {
	return &GranularityLock{
		m: make(map[string]*mutex),
	}
}

// Lock locks the mutex for the given key
// If the lock is already in use, the calling goroutine
// blocks until the mutex is avaiable
//
// IMPORTANT: This lock implementation does NOT support reentrancy.
// A goroutine attemting to lock the same key must be paired with
// exactly one Unlock call for the same key in the same goroutine.
//
// Example (will DEADLOCK - do not do this):
// gl.Lock("key")
// gl.Lock("key") // DEADLCOK - same goroutine trying to lock the same key
// gl.Unlock("key")
// gl.Unlock("key")
//
// Use separate keys for nested locking requirements
func (gl *GranularityLock) Lock(key string) {
	gl.l.Lock()
	var mu *mutex
	var ok bool
	if mu, ok = gl.m[key]; !ok {
		mu = &mutex{
			Mutex: &sync.Mutex{},
			count: 1,
		}
		gl.m[key] = mu
	} else {
		atomic.AddInt32(&mu.count, 1)
	}
	gl.l.Unlock()

	mu.Lock()
}

// 尝试获取锁，如果失败立即返回
func (gl *GranularityLock) TryLock(key string) bool {
	gl.l.Lock()
	defer gl.l.Unlock()

	mu, ok := gl.m[key]
	if !ok {
		mu = &mutex{
			Mutex: &sync.Mutex{},
			count: 1,
		}
		gl.m[key] = mu
	} else {
		atomic.AddInt32(&mu.count, 1)
	}

	// 尝试获取锁
	locked := mu.TryLock()
	if !locked {
		// 获取失败，减少引用计数
		newCount := atomic.AddInt32(&mu.count, -1)
		if newCount == 0 {
			delete(gl.m, key)
		}
	}
	return locked
}

func (gl *GranularityLock) Unlock(key string) {
	gl.l.Lock()
	defer gl.l.Unlock()

	mu, ok := gl.m[key]
	if !ok {
		return
	}

	mu.Unlock()
	newCount := atomic.AddInt32(&mu.count, -1)

	if newCount == 0 {
		delete(gl.m, key)
	}
}
