package utils

import (
	"sync"
	"sync/atomic"
)

type Map[K comparable, V any] struct {
	len   int32
	store sync.Map
	mu    sync.RWMutex
}

func MapArray[T any, R any](arr []T, f func(T) R) []R {
	result := make([]R, len(arr))
	for i, v := range arr {
		result[i] = f(v)
	}
	return result
}

func (m *Map[K, V]) Load(key K) (value V, ok bool) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	v, ok := m.store.Load(key)
	if !ok {
		return
	}

	value, ok = v.(V)
	return
}

func (m *Map[K, V]) Store(key K, value V) {
	m.mu.Lock()
	defer m.mu.Unlock()
	_, loaded := m.store.Load(key)
	if !loaded {
		// increment len if not exists
		atomic.AddInt32(&m.len, 1)
	}
	m.store.Store(key, value)
}

func (m *Map[K, V]) Delete(key K) {
	m.mu.Lock()
	defer m.mu.Unlock()

	_, loaded := m.store.Load(key)
	if loaded {
		// decrement if key exists
		atomic.AddInt32(&m.len, -1)
	}
	m.store.Delete(key)
}

func (m *Map[K, V]) Range(f func(key K, value V) bool) {
	m.store.Range(func(key, value interface{}) bool {
		return f(key.(K), value.(V))
	})
}

func (m *Map[K, V]) LoadOrStore(key K, value V) (actual V, loaded bool) {
	m.mu.Lock()
	defer m.mu.Unlock()

	v, loaded := m.store.LoadOrStore(key, value)
	actual = v.(V)
	if !loaded {
		atomic.AddInt32(&m.len, 1)
	}
	return
}

func (m *Map[K, V]) LoadAndDelete(key K) (value V, loaded bool) {
	m.mu.Lock()
	defer m.mu.Unlock()

	v, loaded := m.store.LoadAndDelete(key)
	if loaded {
		value = v.(V)
		atomic.AddInt32(&m.len, -1)
	}
	return
}

func (m *Map[K, V]) Swap(key K, value V) (acutal V, swapped bool) {
	m.mu.Lock()
	defer m.mu.Unlock()

	v, swapped := m.store.Swap(key, value)
	if swapped {
		acutal = v.(V)
	}
	return
}

func (m *Map[K, V]) Clear() {
	m.mu.Lock()
	defer m.mu.Unlock()

	m.store.Range(func(key, value interface{}) bool {
		m.store.Delete(key)
		return true
	})
	atomic.StoreInt32(&m.len, 0)
}

func (m *Map[K, V]) Len() int {
	return int(atomic.LoadInt32(&m.len))
}

func (m *Map[K, V]) Exists(key K) bool {
	_, ok := m.Load(key)
	return ok
}
