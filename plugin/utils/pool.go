package utils

import (
	"sync"
	"time"

	"github.com/getsentry/sentry-go"
	"github.com/panjf2000/ants/v2"
)

var (
	pool *ants.Pool
	mu   sync.Mutex
)

type PoolStatus struct {
	Free  int `json:"free"`
	Busy  int `json:"busy"`
	Total int `json:"total"`
}

func IsInit() bool {
	mu.Lock()
	defer mu.Unlock()
	return pool != nil
}

func InitPool(size int, sentryOption ...sentry.ClientOptions) {
	mu.Lock()
	defer mu.Unlock()

	if pool != nil {
		return
	}

	pool, _ = ants.NewPool(size, ants.WithNonblocking(false))

	if len(sentryOption) > 0 {
		// todo use sentry
	}
}

func Submit(labels map[string]string, f func()) {
	if labels == nil {
		labels = map[string]string{}
	}

	pool.Submit(func() {
		label := []string{
			"LaunchedAt", time.Now().Format(time.RFC3339),
		}
		if len(labels) > 0 {
			for k, v := range labels {
				label = append(label, k, v)
			}
		}
		f()
	})
}

func FetchPoolStatus() *PoolStatus {
	return &PoolStatus{
		Free:  pool.Free(),
		Busy:  pool.Running(),
		Total: pool.Cap(),
	}
}

func WithMaxRoutine(maxRoutine int, tasks []func(), done ...func()) {
	if maxRoutine <= 0 {
		maxRoutine = 1
	}

	if maxRoutine > len(tasks) {
		maxRoutine = len(tasks)
	}

	Submit(map[string]string{
		"module":   "routine",
		"function": "WithMaxRoutine",
	}, func() {
		var wg sync.WaitGroup
		sem := make(chan struct{}, maxRoutine)

		for _, task := range tasks {
			wg.Add(1)
			sem <- struct{}{}
			go func(tsk func()) {
				defer wg.Done()
				defer func() { <-sem }()
				tsk()
			}(task)
		}
		wg.Wait()
		for _, d := range done {
			d()
		}
	})
}
