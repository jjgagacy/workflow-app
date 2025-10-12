package utils

import (
	"sync"
	"testing"
)

func TestMapBasicOperations(t *testing.T) {
	m := &Map[string, int]{}

	m.Store("key1", 100)
	m.Store("key2", 200)

	if val, ok := m.Load("key1"); !ok || val != 100 {
		t.Errorf("Load key1 failed, got %v, %v, want 100, true", val, ok)
	}

	if val, ok := m.Load("key2"); !ok || val != 200 {
		t.Errorf("Load key2 failed, got %v, %v, want 200, true", val, ok)
	}

	// Test non-existent key
	if _, ok := m.Load("key3"); ok {
		t.Error("Load non-existent key should return fale")
	}
}

func TestMapDelete(t *testing.T) {
	m := &Map[string, string]{}

	m.Store("name", "Alice")
	m.Store("age", "25")

	// Test delete existing key
	m.Delete("name")
	if _, ok := m.Load("name"); ok {
		t.Error("Key should be deleted")
	}

	// Test delete non-existent key (should not panic)
	m.Delete("non-existent")

	// Verify other key still exists
	if val, ok := m.Load("age"); !ok || val != "25" {
		t.Errorf("Other key should exist, got %v, %v", val, ok)
	}
}

func TestMap_Length(t *testing.T) {
	m := &Map[int, bool]{}

	// Test initial length
	if m.Len() != 0 {
		t.Errorf("Initial length should be 0, got %d", m.Len())
	}

	// Test length after storing
	m.Store(1, true)
	m.Store(2, false)
	if m.Len() != 2 {
		t.Errorf("Length after store should be 2, got %d", m.Len())
	}

	// Test length after delete
	m.Delete(1)
	if m.Len() != 1 {
		t.Errorf("Length after delete should be 1, got %d", m.Len())
	}

	// Test delete non-existent key doesn't affect length
	m.Delete(999)
	if m.Len() != 1 {
		t.Errorf("Length should remain 1 after deleting non-existent key, got %d", m.Len())
	}
}

func TestMapLoadOrStore(t *testing.T) {
	m := &Map[string, float64]{}

	actual, loaded := m.LoadOrStore("pi", 3.14)
	if loaded || actual != 3.14 {
		t.Errorf("First LoadOrStore failed, got %v, %v", actual, loaded)
	}

	// second time
	actual, loaded = m.LoadOrStore("pi", 999.0)
	if !loaded || actual != 3.14 {
		t.Errorf("Second LoadOrStore failed, got %v, %v", actual, loaded)
	}

	// verify stored value unchanged
	if val, _ := m.Load("pi"); val != 3.14 {
		t.Errorf("Value should remain 3.14, got %v", val)
	}
}

func TestMapLoadAndDelete(t *testing.T) {
	m := &Map[int, string]{}

	m.Store(42, "answer")

	// Test load and delete existing key
	val, loaded := m.LoadAndDelete(42)
	if !loaded || val != "answer" {
		t.Errorf("LoadAndDelete failed, got %v, %v", val, loaded)
	}

	// Verify key is deleted
	if _, ok := m.Load(42); ok {
		t.Error("Key should be deleted after LoadAndDelete")
	}

	// Test load and delete non-existent key
	val, loaded = m.LoadAndDelete(999)
	if loaded || val != "" {
		t.Errorf("LoadAndDelete non-existent should return false, got %v, %v", val, loaded)
	}
}

func TestMap_Swap(t *testing.T) {
	m := &Map[string, int]{}

	m.Store("count", 10)

	// Swap existing key
	old, swapped := m.Swap("count", 20)
	if !swapped || old != 10 {
		t.Errorf("Swap failed, got %v, %v", old, swapped)
	}

	// Verify new value
	if val, _ := m.Load("count"); val != 20 {
		t.Errorf("Value after swap should be 20, got %v", val)
	}

	// Swap non-existent key
	old, swapped = m.Swap("new", 30)
	if swapped || old != 0 {
		t.Errorf("Swap non-existent should return false, got %v, %v", old, swapped)
	}

	// Verify new key was stored
	if val, _ := m.Load("new"); val != 30 {
		t.Errorf("New key should be stored with value 30, got %v", val)
	}
}

func TestMapRange(t *testing.T) {
	m := &Map[int, string]{}

	expected := map[int]string{
		1: "one",
		2: "two",
		3: "three",
	}

	for k, v := range expected {
		m.Store(k, v)
	}

	visited := make(map[int]string)
	m.Range(func(key int, value string) bool {
		visited[key] = value
		return true // continue
	})

	if len(visited) != len(expected) {
		t.Errorf("Range should visit all items, got %d, want %d", len(visited), len(expected))
	}

	for k, v := range expected {
		if visited[k] != v {
			t.Errorf("Range key %d: got %v, want %v", k, visited[k], v)
		}
	}

	// Test early termination
	count := 0
	m.Range(func(key int, value string) bool {
		count++
		return count < 2 // stop after 2 items
	})
	if count != 2 {
		t.Errorf("Range should stop early, visited %d items", count)
	}

	m.Clear()
	m.Range(func(key int, value string) bool {
		return true
	})
}

func TestMapClear(t *testing.T) {
	m := &Map[string, any]{}

	m.Store("a", 1)
	m.Store("b", "hello")
	m.Store("c", []int{1, 2, 3})

	if m.Len() != 3 {
		t.Errorf("Before clear, length should be 3, got %d", m.Len())
	}

	m.Clear()

	if m.Len() != 0 {
		t.Errorf("After clear, length should be 0, got %d", m.Len())
	}

	// Verify all keys are gone
	keys := []string{"a", "b", "c"}
	for _, key := range keys {
		if _, ok := m.Load(key); ok {
			t.Errorf("Key %s should be cleared", key)
		}
	}
}

func TestMapExists(t *testing.T) {
	m := &Map[rune, bool]{}

	m.Store('x', true)

	if !m.Exists('x') {
		t.Error("Exists should return true for existing key")
	}

	if m.Exists('y') {
		t.Error("Exists should return false for non-existent key")
	}
}

func TestMapConcurrent(t *testing.T) {
	m := &Map[int, int]{}
	var wg sync.WaitGroup

	// Concurrent writers
	for i := range 100 {
		wg.Add(1)
		go func(n int) {
			defer wg.Done()
			m.Store(n, n*10)
		}(i)
	}

	// Concurrent readers
	for range 50 {
		wg.Go(func() {
			for j := range 10 {
				m.Load(j)
				m.Exists(j)
			}
		})
	}

	// Concurrent Deletes
	for i := range 30 {
		wg.Add(1)
		go func(n int) {
			defer wg.Done()
			m.Delete(n)
		}(i)
	}

	wg.Wait()

	finalLen := m.Len()
	if finalLen < 0 {
		t.Errorf("Length should be non-gegative, got %d", finalLen)
	}

	count := 0
	m.Range(func(key, value int) bool {
		count++
		return true
	})

	if count != finalLen {
		t.Errorf("Range count %d should match length %d", count, finalLen)
	}
}

func TestMapComplexType(t *testing.T) {
	type Person struct {
		Name string
		Age  int
	}

	m := &Map[string, Person]{}

	m.Store("alice", Person{"Alice", 30})
	m.Store("bob", Person{"Bob", 25})

	if val, ok := m.Load("alice"); !ok || val.Name != "Alice" {
		t.Errorf("Load struct failed, got %v", val)
	}

	// Test with slice values
	sliceMap := &Map[int, []string]{}
	sliceMap.Store(1, []string{"a", "b", "c"})

	if val, ok := sliceMap.Load(1); !ok || len(val) != 3 {
		t.Errorf("Load slice failed, got %v", val)
	}
}

func TestMapArray(t *testing.T) {
	input := []int{1, 2, 3, 4, 5}
	expected := []string{"1", "2", "3", "4", "5"}

	result := MapArray(input, func(n int) string {
		return string(rune('0' + n))
	})

	if len(result) != len(expected) {
		t.Errorf("MapArray length mismatch: got %d, want %d", len(result), len(expected))
	}

	for i, v := range result {
		if v != expected[i] {
			t.Errorf("MapArray[%d]: got %v, want %v", i, v, expected[i])
		}
	}
}

// Benchmark tests
func BenchmarkMap_Store(b *testing.B) {
	m := &Map[int, int]{}
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		m.Store(i, i*2)
	}
}

func BenchmarkMap_Load(b *testing.B) {
	m := &Map[int, int]{}
	for i := 0; i < 1000; i++ {
		m.Store(i, i*2)
	}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		m.Load(i % 1000)
	}
}
