package entities

import (
	"sync"
	"testing"
	"time"
)

func TestBroadcast_ListenAndSend(t *testing.T) {
	broadcast := NewBroadcast[int]()
	received := make(chan int, 1)

	broadcast.Listen(func(data int) {
		received <- data
	})

	expected := 42
	broadcast.Send(expected)

	select {
	case actual := <-received:
		if actual != expected {
			t.Errorf("Expected %d, got %d", expected, actual)
		}
	case <-time.After(1 * time.Second):
		t.Error("Timeout waiting for data")
	}
}

func TestBroadcast_ListenAndSendWithoutBuffer(t *testing.T) {
	broadcast := NewBroadcast[int]()
	received := make(chan int)

	broadcast.Listen(func(data int) {
		go func() {
			received <- data
		}()
	})

	expected := 42
	broadcast.Send(expected)

	select {
	case actual := <-received:
		if actual != expected {
			t.Errorf("Expected %d, got %d", expected, actual)
		}
	case <-time.After(1 * time.Second):
		t.Error("Timeout waiting for data")
	}
}

func TestBroadcast_ListenAndSendWithNewRoutine(t *testing.T) {
	broadcast := NewBroadcast[int]()
	received := make(chan int)

	broadcast.Listen(func(data int) {
		received <- data
	})

	expected := 42
	done := make(chan struct{})
	go func() {
		actual := <-received
		if actual != expected {
			t.Errorf("Expected %d, got %d", expected, actual)
		}
		close(done)
	}()

	broadcast.Send(expected)

	select {
	case <-done:
	case <-time.After(1 * time.Second):
		t.Error("Timeout waiting for data")
	}
}

func TestBroadcast_MultipleListeners(t *testing.T) {
	broadcast := NewBroadcast[string]()
	var received []string

	var mu sync.Mutex
	var wg sync.WaitGroup

	numListeners := 3
	wg.Add(numListeners)

	for range numListeners {
		broadcast.Listen(func(data string) {
			defer wg.Done()
			mu.Lock()
			received = append(received, data)
			mu.Unlock()
		})
	}

	expected := "hello world"
	broadcast.Send(expected)

	wg.Wait()

	if len(received) != numListeners {
		t.Errorf("Expected %d receivers, got %d", numListeners, len(received))
	}

	for _, data := range received {
		if data != expected {
			t.Errorf("Expected %s, got %s", expected, data)
		}
	}
}

func TestBroadcast_ConcurrentSend(t *testing.T) {
	broadcast := NewBroadcast[int]()
	received := []int{}

	var mu sync.Mutex
	var wg sync.WaitGroup

	broadcast.Listen(func(data int) {
		defer wg.Done()
		mu.Lock()
		received = append(received, data)
		mu.Unlock()
	})

	numSends := 100
	wg.Add(numSends)

	for i := range numSends {
		go func() {
			broadcast.Send(i)
		}()
	}

	wg.Wait()

	if len(received) != numSends {
		t.Errorf("Expected %d received messages, got %d", numSends, len(received))
	}
}

func TestBroadcast_GenericType(t *testing.T) {
	type CustomStruct struct {
		Name  string
		Value int
	}

	broadcast := NewBroadcast[CustomStruct]()
	received := make(chan CustomStruct, 1)

	broadcast.Listen(func(s CustomStruct) {
		received <- s
	})

	expected := CustomStruct{
		Name:  "test",
		Value: 123,
	}
	broadcast.Send(expected)

	select {
	case actual := <-received:
		if actual != expected {
			t.Errorf("Expected: %+v, got %+v", expected, actual)
		}
	case <-time.After(1 * time.Second):
		t.Error("Timeout waiting for data")
	}
}
