package utils

import (
	"sync"
	"sync/atomic"
)

type mutex struct {
	*sync.Mutex
	count int32
}

type GranularityLock struct {
	m map[string]*mutex
	l sync.Mutex
}

func NewGranularityLock() *GranularityLock {
	return &GranularityLock{
		m: make(map[string]*mutex),
	}
}

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

	mu, ok := gl.m[key]
	if !ok {
		mu = &mutex{
			Mutex: &sync.Mutex{},
			count: 1,
		}
		gl.m[key] = mu
	}

	atomic.AddInt32(&mu.count, 1)
	gl.l.Unlock()

	// 尝试获取锁
	locked := mu.TryLock()
	if !locked {
		// 获取失败，减少引用计数
		gl.l.Unlock()
		newCount := atomic.AddInt32(&mu.count, -1)
		if newCount == 0 {
			delete(gl.m, key)
		}
		gl.l.Unlock()
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
