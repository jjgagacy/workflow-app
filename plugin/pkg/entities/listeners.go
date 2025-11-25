package entities

import "sync"

// Broadcast is a generic pub-sub implementation for broadcasting messages to multiple listeners
// It provides thread-safe methods for adding listeners, sending messages, and cleanup.
type Broadcast[T any] struct {
	mu       *sync.RWMutex
	onClose  func()
	listener []func(T)
}

// BytesIOListener is a specialized Broadcast for byte slices
type BytesIOListener = Broadcast[[]byte]

// NewBroadcast creates and returns a new Broadcast instance
// The returned Broadcast can be used to add listeners and send messages of type T
func NewBroadcast[T any]() *Broadcast[T] {
	return &Broadcast[T]{
		mu: &sync.RWMutex{},
	}
}

// Listen registers a callback function to be called when messages are sent.
// The callback function will be invoked with the message of type T.
// This method is thread-safe and can be called concurrently.
func (b *Broadcast[T]) Listen(f func(T)) {
	b.mu.Lock()
	defer b.mu.Unlock()
	b.listener = append(b.listener, f)
}

// OnClose sets a cleanup function to be called when the Broadcast is closed.
// The provided function will be invoked when Close() is called.
func (b *Broadcast[T]) OnClose(f func()) {
	b.onClose = f
}

// Close shuts down the breadcast and executes the cleanup function if set.
// After closing, the broadcast should not be used for sending or listening.
func (b *Broadcast[T]) Close() {
	if b.onClose != nil {
		b.onClose()
	}
}

// Send broadcasts the provided data to all registered listeners.
// Each listener's callback function will be invoked synchronously with the data.
// This method is thread-safe and can be called concurrently.
func (b *Broadcast[T]) Send(data T) {
	b.mu.RLock()
	defer b.mu.RUnlock()
	for _, listener := range b.listener {
		listener(data)
	}
}
