package entities

import "sync"

type Broadcast[T any] struct {
	mu       *sync.RWMutex
	onClose  func()
	listener []func(T)
}

type BytesIOListener = Broadcast[[]byte]

func NewBroadcast[T any]() *Broadcast[T] {
	return &Broadcast[T]{
		mu: &sync.RWMutex{},
	}
}

func (b *Broadcast[T]) Listen(f func(T)) {
	b.mu.Lock()
	defer b.mu.Unlock()
	b.listener = append(b.listener, f)
}

func (b *Broadcast[T]) OnClose(f func()) {
	b.onClose = f
}

func (b *Broadcast[T]) Close() {
	if b.onClose != nil {
		b.onClose()
	}
}

func (b *Broadcast[T]) Send(data T) {
	b.mu.RLock()
	defer b.mu.RUnlock()
	for _, listener := range b.listener {
		listener(data)
	}
}
