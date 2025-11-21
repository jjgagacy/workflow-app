package utils

import (
	"context"
	"fmt"
	"log"
	"runtime/debug"
	"runtime/pprof"
	"sync"
	"time"

	"github.com/getsentry/sentry-go"
	"github.com/jjgagacy/workflow-app/plugin/utils/local_sentry"
	"github.com/panjf2000/ants/v2"
)

var (
	pool        *ants.Pool
	pl          sync.Mutex
	LocalSentry *local_sentry.LocalSentry
)

type PoolStatus struct {
	Free  int `json:"free"`
	Busy  int `json:"busy"`
	Total int `json:"total"`
}

func IsInitPool() bool {
	pl.Lock()
	defer pl.Unlock()
	return pool != nil
}

func InitPool(size int, sentryOption ...sentry.ClientOptions) {
	pl.Lock()
	defer pl.Unlock()

	if pool != nil {
		return
	}

	pool, _ = ants.NewPool(size, ants.WithNonblocking(false))

	if len(sentryOption) > 0 {
		if err := sentry.Init(sentryOption[0]); err != nil {
			Error("init sentry failed: %v", err)
		}
	}
}

func Submit(labels map[string]string, f func()) {
	if labels == nil {
		labels = map[string]string{}
	}

	pool.Submit(func() {
		ll := []string{
			"LaunchedAt", time.Now().Format(time.RFC3339),
		}
		if len(labels) > 0 {
			for k, v := range labels {
				ll = append(ll, k, v)
			}
		}
		pprof.Do(context.Background(), pprof.Labels(ll...), func(ctx context.Context) {
			if LocalSentry != nil {
				defer func() {
					if r := recover(); r != nil {
						err := fmt.Errorf("panic: %v", r)
						LocalSentry.CatpureException(err, map[string]any{
							"labels": ll,
							"stack":  string(debug.Stack()),
						})
						log.Printf("Recovered from panic in task: %v", r)
						panic(r)
					}
				}()
			} else {
				defer sentry.Recover()
			}
			f()
		})
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

func ReleasePool() {
	pl.Lock()
	defer pl.Unlock()

	if pool != nil {
		pool.Release()
		pool = nil
	}
}

func WithMaxRoutineBlocking(maxRoutine int, tasks []func(), done ...func()) {
	if maxRoutine <= 0 {
		maxRoutine = 1
	}

	if maxRoutine > len(tasks) {
		maxRoutine = len(tasks)
	}

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

	// 等待所有任务完成
	wg.Wait()

	// 执行完成回调
	for _, d := range done {
		d()
	}
}
