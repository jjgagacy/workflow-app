package utils

import (
	"fmt"
	"runtime"
	"runtime/debug"
)

// 使用 runtime 包打印当前堆栈
func PrintStack() {
	buf := make([]byte, 1024)
	n := runtime.Stack(buf, false)
	stack := string(buf[:n])
	fmt.Printf("=== Stack Trace ===\n%s\n", stack)
}

// 使用 debug 包打印所有 goroutine 的堆栈
func PrintAllStack() {
	stack := debug.Stack()
	fmt.Printf("=== Full Stack Trace ===\n%s\n", string(stack))
}
