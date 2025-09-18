package utils

import "sync"

type Map[K comparable, V any] struct {
	len   int32
	store sync.Map
	mu    sync.RWMutex
}
