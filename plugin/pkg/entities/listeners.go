package entities

import "sync"

type Broadcast[T any] struct {
	mu       *sync.RWMutex
	onClose  func()
	listener []func(T)
}

type BytesIOListener = Broadcast[[]byte]
