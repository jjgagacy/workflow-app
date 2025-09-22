package utils

import (
	"errors"
	"sync"
	"sync/atomic"

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
	filter      []func(T) error

	err error

	// Condition variable for blocking when queue is full
	writeCond *sync.Cond
}

func NewStream[T any](max int) *Stream[T] {
	mu := &sync.Mutex{}
	return &Stream[T]{
		mu:        mu,
		sig:       make(chan bool),
		max:       max,
		writeCond: sync.NewCond(mu),
	}
}

func (s *Stream[T]) Filter(f func(T) error) {
	s.filter = append(s.filter, f)
}

func (s *Stream[T]) OnClose(f func()) {
	s.onClose = append(s.onClose, f)
}

func (s *Stream[T]) BeforeClose(f func()) {
	s.beforeClose = append(s.beforeClose, f)
}

func (s *Stream[T]) Next() bool {
	s.mu.Lock()
	if s.closed == 1 && s.q.Len() == 0 && s.err == nil {
		s.mu.Unlock()
		return false
	}

	if s.q.Len() > 0 || s.err != nil {
		s.mu.Unlock()
		return true
	}

	s.listening = true
	defer func() {
		s.listening = false
	}()

	s.mu.Unlock()
	return <-s.sig
}

func (s *Stream[T]) Read() (T, error) {
	s.mu.Lock()

	if s.q.Len() > 0 {
		data := s.q.PopFront()
		// Signal any waiting writers
		s.writeCond.Signal()
		filters := s.filter
		s.mu.Unlock()

		for _, f := range filters {
			err := f(data)
			if err != nil {
				s.Close()
				return data, err
			}
		}
		return data, nil
	}

	var data T
	if s.err != nil {
		err := s.err
		s.err = nil
		s.mu.Unlock()
		return data, err
	}
	s.mu.Unlock()
	return data, ErrEmpty
}

func (s *Stream[T]) Close() {
	if !atomic.CompareAndSwapInt32(&s.closed, 0, 1) {
		return
	}

	for _, f := range s.beforeClose {
		f()
	}

	// close signal channel
	select {
	case s.sig <- false:
	default:
	}
	close(s.sig)

	// Notify any writers
	s.mu.Lock()
	s.writeCond.Broadcast()
	s.mu.Unlock()

	for _, f := range s.onClose {
		f()
	}
}

func (s *Stream[T]) IsClosed() bool {
	return atomic.LoadInt32(&s.closed) == 1
}

func (s *Stream[T]) Size() int {
	s.mu.Lock()
	defer s.mu.Unlock()

	return s.q.Len()
}

func (s *Stream[T]) WriteError(err error) {
	if atomic.LoadInt32(&s.closed) == 1 {
		return
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	s.err = err

	if s.q.Len() == 0 {
		if s.listening {
			s.sig <- true
		}
	}
}

func (s *Stream[T]) Write(data T) error {
	if atomic.LoadInt32(&s.closed) == 1 {
		return nil
	}

	s.mu.Lock()

	if s.q.Len() >= s.max {
		s.mu.Unlock()
		return errors.New("queue is full")
	}

	s.q.PushBack(data)
	if s.q.Len() == 1 {
		if s.listening {
			s.sig <- true
		}
	}

	s.mu.Unlock()
	return nil
}

func (s *Stream[T]) WriteBlocking(data T) {
	if atomic.LoadInt32(&s.closed) == 1 {
		return
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	// Wait until there's space in the queue
	for s.q.Len() >= s.max && atomic.LoadInt32(&s.closed) == 0 {
		s.writeCond.Wait()
	}
	// Check if the stream is closed while waiting
	if atomic.LoadInt32(&s.closed) == 1 {
		return
	}

	s.q.PushBack(data)
	if s.q.Len() == 1 {
		if s.listening {
			s.sig <- true
		}
	}
}

func (s *Stream[T]) Async(f func(T)) error {
	for s.Next() {
		data, err := s.Read()
		if err != nil {
			return err
		}
		f(data)
	}

	return nil
}
