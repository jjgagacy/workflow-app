package utils

import (
	"sync"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestPool(t *testing.T) {
	if IsInitPool() {
		t.Fatal("Pool should not be initialized before test")
	}

	t.Run("pool init", func(t *testing.T) {
		InitPool(5)
		defer ReleasePool()

		assert.True(t, IsInitPool(), "Pool should be initialized")
	})

	t.Run("pool repeat run", func(t *testing.T) {
		InitPool(5)
		defer ReleasePool()

		originalPool := pool

		// should be ignore
		InitPool(10)

		assert.Equal(t, originalPool, pool, "Pool should not be reinitialized")
		assert.Equal(t, 5, pool.Cap(), "Pool capacity should remain 5")
	})

	t.Run("pool task submit", func(t *testing.T) {
		InitPool(3)
		defer ReleasePool()

		var wg sync.WaitGroup
		var counter int
		var mu sync.Mutex

		// submit more tasks
		for i := 0; i < 10; i++ {
			wg.Add(1)
			Submit(map[string]string{
				"task_id":   "test_task",
				"iteration": string(rune(1)),
			}, func() {
				defer wg.Done()
				mu.Lock()
				counter++
				mu.Unlock()
				time.Sleep(10 * time.Millisecond)
			})
		}

		wg.Wait()
		assert.Equal(t, 10, counter, "All tasks should be executed")
	})

	t.Run("pool status fetch", func(t *testing.T) {
		InitPool(2)
		defer ReleasePool()

		status := FetchPoolStatus()
		assert.Equal(t, 2, status.Total, "Total should be 2")
		assert.Equal(t, 0, status.Busy, "Busy should be 0 initially")
		assert.Equal(t, 2, status.Free, "Free should be 2 initially")

		var wg sync.WaitGroup
		wg.Add(1)

		// Submit a long running task
		Submit(nil, func() {
			defer wg.Done()
			time.Sleep(100 * time.Millisecond)
		})

		// run long task with a bit time
		time.Sleep(10 * time.Millisecond)

		status = FetchPoolStatus()
		assert.Equal(t, 1, status.Busy)
		assert.Equal(t, 1, status.Free)

		wg.Wait()
	})

	t.Run("pool WithMaxRoutine", func(t *testing.T) {
		InitPool(10)
		defer ReleasePool()

		var (
			mu          sync.Mutex
			counter     int
			maxRoutines int
			startTime   = time.Now()
		)

		tasks := make([]func(), 15)
		for i := 0; i < 15; i++ {
			tasks[i] = func() {
				mu.Lock()
				counter++
				// track max routines
				current := pool.Running()
				if current > maxRoutines {
					maxRoutines = current
				}
				mu.Unlock()

				time.Sleep(50 * time.Millisecond)
			}
		}

		doneCalled := false
		done := []func(){func() {
			doneCalled = true
		}}

		WithMaxRoutineBlocking(5, tasks, done...)

		assert.Equal(t, 15, counter, "All tasks should be executed")
		assert.True(t, doneCalled, "Done callback should be called")
		assert.LessOrEqual(t, maxRoutines, 5, "Max concurrency should be limited to 5")
		assert.Greater(t, time.Since(startTime), 150*time.Millisecond, "Should take at least 150ms (3 batches of 5 tasks)")
	})
}

func TestPoolIntegration(t *testing.T) {
	t.Run("pool integration", func(t *testing.T) {
		InitPool(8)
		defer ReleasePool()

		initialStatus := FetchPoolStatus()
		assert.Equal(t, 8, initialStatus.Total)

		var result []int
		var mu sync.Mutex
		var wg sync.WaitGroup

		for i := 0; i < 20; i++ {
			wg.Add(1)
			finalI := i

			Submit(map[string]string{
				"task_type": "integration_test",
				"index":     string(rune(finalI)),
			}, func() {
				defer wg.Done()
				time.Sleep(5 * time.Millisecond)
				mu.Lock()
				result = append(result, finalI)
				mu.Unlock()
			})
		}

		wg.Wait()
		assert.Len(t, result, 20, "All integration tasks should complete")

		// test WithMaxRoutine behavior in busy pool
		limitedTasks := make([]func(), 10)
		for i := 0; i < 10; i++ {
			limitedTasks[i] = func() {
				time.Sleep(10 * time.Millisecond)
			}
		}

		start := time.Now()
		WithMaxRoutineBlocking(3, limitedTasks)
		duration := time.Since(start)

		// 30ms (10 tasks / 3 concurrenty * 10ms each)
		assert.GreaterOrEqual(t, duration, 30*time.Millisecond)
	})
}
