package stream

import (
	"errors"
	"sync"

	"github.com/gammazero/deque"
)

var (
	ErrEmpty = errors.New("no data available")
)

type Stream[T any] struct {
	q         deque.Deque[T]
	mu        *sync.Mutex
	sig       chan bool
	closed    int32
	max       int
	listening bool

	onClose     []func()
	beforeClose []func()
	filter      []func() error

	err error
	// Condition variable for blocking writes when the buffer is full.
	writeCond *sync.Cond
}
