package utils

import (
	"errors"
	"sync"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestBasicOperations(t *testing.T) {
	t.Run("stream basic read write", func(t *testing.T) {
		stream := NewStream[int](10)

		err := stream.Write(1)
		assert.NoError(t, err)
		err = stream.Write(2)
		assert.NoError(t, err)

		assert.True(t, stream.Next())
		data, err := stream.Read()
		assert.NoError(t, err)
		assert.Equal(t, 1, data)

		assert.True(t, stream.Next())
		data, err = stream.Read()
		assert.NoError(t, err)
		assert.Equal(t, 2, data)

		stream.Close()
	})

	t.Run("stream read empty stream", func(t *testing.T) {
		stream := NewStream[int](10)
		defer stream.Close()

		_, err := stream.Read()
		assert.Equal(t, ErrEmpty, err)
	})
}

func TestStreamConcurrentOperations(t *testing.T) {
	t.Run("stream more producers and consumers", func(t *testing.T) {
		stream := NewStream[int](100)
		var wg sync.WaitGroup
		results := make([]int, 0)
		var resultMu sync.Mutex

		// start 3 producers
		for i := range 3 {
			wg.Add(1)
			go func(producerID int) {
				defer wg.Done()
				for j := range 10 {
					value := producerID*100 + j
					stream.Write(value)
					time.Sleep(time.Millisecond)
				}
			}(i)
		}

		// start 2 consumers
		for i := range 2 {
			wg.Add(1)
			go func(consumerID int) {
				defer wg.Done()
				for stream.Next() {
					data, err := stream.Read()
					if err != nil {
						if errors.Is(err, ErrEmpty) {
							continue
						}
						break
					}
					resultMu.Lock()
					results = append(results, data)
					resultMu.Unlock()
				}
			}(i)
		}

		// wait for all
		time.Sleep(100 * time.Millisecond)

		stream.Close()
		wg.Wait()

		assert.Len(t, results, 30)
	})
}

func TestStreamBlockingWrite(t *testing.T) {
	t.Run("stream blocking writing", func(t *testing.T) {
		stream := NewStream[int](2)

		stream.Write(1)
		stream.Write(2)

		var wg sync.WaitGroup
		wg.Go(func() {
			stream.WriteBlocking(3)
			stream.WriteBlocking(4)
		})

		time.Sleep(10 * time.Millisecond)
		data, err := stream.Read()
		assert.NoError(t, err)
		assert.Equal(t, 1, data)

		assert.True(t, stream.Next())
		data, err = stream.Read()
		assert.NoError(t, err)
		assert.Equal(t, 2, data)

		wg.Wait()
		stream.Close()
	})
}

func TestStreamCloseBehavior(t *testing.T) {
	t.Run("stream close behavior", func(t *testing.T) {
		stream := NewStream[int](10)
		closeCalled := false
		beforeCloseCalled := false

		stream.OnClose(func() {
			closeCalled = true
		})

		stream.BeforeClose(func() {
			beforeCloseCalled = true
		})

		stream.Write(1)
		stream.Close()

		// test duplicate
		stream.Close()

		assert.True(t, beforeCloseCalled)
		assert.True(t, closeCalled)
		assert.True(t, stream.IsClosed())

		err := stream.Write(2)
		assert.NoError(t, err)

		// can read remain data after closed
		assert.True(t, stream.Next())
		data, err := stream.Read()
		assert.NoError(t, err)
		assert.Equal(t, 1, data)

		assert.False(t, stream.Next())
	})
}

func TestStreamFilter(t *testing.T) {
	t.Run("stream filter testing", func(t *testing.T) {
		stream := NewStream[int](10)
		customErr := errors.New("filter error")

		stream.Filter(func(data int) error {
			if data%2 != 0 {
				return customErr
			}
			return nil
		})

		err := stream.Write(2)
		assert.NoError(t, err)

		// error when reading
		err = stream.Write(3)
		assert.NoError(t, err)

		assert.True(t, stream.Next())
		data, err := stream.Read()
		assert.NoError(t, err)
		assert.Equal(t, 2, data)

		assert.True(t, stream.Next())
		_, err = stream.Read()
		assert.Equal(t, customErr, err)
		assert.True(t, stream.IsClosed())
	})
}

func TestStreamErrorHandling(t *testing.T) {
	t.Run("stream error handling", func(t *testing.T) {
		stream := NewStream[int](10)
		customErr := errors.New("custom error")

		stream.Write(1)
		stream.Write(2)

		stream.WriteError(customErr)

		assert.True(t, stream.Next())
		data, err := stream.Read()
		assert.NoError(t, err)
		assert.Equal(t, 1, data)

		assert.True(t, stream.Next())
		data, err = stream.Read()
		assert.NoError(t, err)
		assert.Equal(t, 2, data)

		// then reads customErr
		assert.True(t, stream.Next())
		_, err = stream.Read()
		assert.Equal(t, customErr, err)
	})
}

func TestStreamAsyncProcessing(t *testing.T) {
	t.Run("stream async processing", func(t *testing.T) {
		stream := NewStream[int](10)
		processed := make([]int, 0)
		var mu sync.Mutex

		for i := range 5 {
			stream.Write(i)
		}
		stream.Close()

		err := stream.Async(func(data int) {
			mu.Lock()
			defer mu.Unlock()
			processed = append(processed, data*2)
		})
		assert.NoError(t, err)
		assert.Equal(t, []int{0, 2, 4, 6, 8}, processed)
	})
}

func TestStreamSizeAndStatus(t *testing.T) {
	t.Run("stream size and status", func(t *testing.T) {
		stream := NewStream[int](10)

		assert.Equal(t, 0, stream.Size())
		assert.False(t, stream.IsClosed())

		stream.Write(1)
		stream.Write(2)
		assert.Equal(t, 2, stream.Size())

		stream.Close()
		assert.True(t, stream.IsClosed())
	})
}

func TestStream_NextWithPendingData(t *testing.T) {
	t.Run("stream with pending data", func(t *testing.T) {
		stream := NewStream[int](10)

		stream.Write(1)
		stream.Write(2)
		stream.Close()

		assert.True(t, stream.Next())
		data, err := stream.Read()
		assert.NoError(t, err)
		assert.Equal(t, 1, data)

		assert.True(t, stream.Next())
		data, err = stream.Read()
		assert.NoError(t, err)
		assert.Equal(t, 2, data)

		assert.False(t, stream.Next())
	})
}

func TestStream_EdgeCases(t *testing.T) {
	t.Run("stream edge cases", func(t *testing.T) {
		stream := NewStream[int](0)
		err := stream.Write(1)
		assert.Error(t, err)

		stream = NewStream[int](1)
		err = stream.Write(1)
		assert.NoError(t, err)
		err = stream.Write(2)
		assert.Error(t, err)
	})
}
