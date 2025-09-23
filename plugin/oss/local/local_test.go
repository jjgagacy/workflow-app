package local

import (
	"fmt"
	"os"
	"path/filepath"
	"testing"
	"time"

	"github.com/jjgagacy/workflow-app/plugin/oss"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestNewLocalStorage(t *testing.T) {
	t.Run("create local storage success", func(t *testing.T) {
		tmpDir := t.TempDir()

		args := oss.Args{
			Local: &oss.Local{Path: tmpDir},
		}

		storage, err := NewLocalStorage(args)
		require.NoError(t, err)
		assert.NotNil(t, storage)
		assert.Equal(t, oss.OSS_TYPE_LOCAL, storage.Type())
	})

	t.Run("empty args", func(t *testing.T) {
		args := oss.Args{Local: nil}

		storage, err := NewLocalStorage(args)
		assert.Error(t, err)
		assert.Nil(t, storage)
		assert.Contains(t, err.Error(), "cannot find Local storage argument")
	})

	t.Run("automatic create directory", func(t *testing.T) {
		tmpDir := filepath.Join(t.TempDir(), "nonexistent", "subdir")

		args := oss.Args{
			Local: &oss.Local{Path: tmpDir},
		}

		storage, err := NewLocalStorage(args)
		require.NoError(t, err)
		assert.NotNil(t, storage)

		// check directory
		_, err = os.Stat(tmpDir)
		assert.NoError(t, err)
	})
}

func TestLocalStorageSaveAndLoad(t *testing.T) {
	tmpDir := t.TempDir()
	storage := &LocalStorage{root: tmpDir}

	t.Run("save and load", func(t *testing.T) {
		key := "test/file.txt"
		expectedData := []byte("Hello, World!")

		err := storage.Save(key, expectedData)
		require.NoError(t, err)

		// check file exists
		exists, err := storage.Exists(key)
		require.NoError(t, err)
		assert.True(t, exists)

		actualData, err := storage.Load(key)
		require.NoError(t, err)
		assert.Equal(t, expectedData, actualData)
	})

	t.Run("save deep directory", func(t *testing.T) {
		key := "deep/nest/dir/file.txt"
		data := []byte("deep file content")

		err := storage.Save(key, data)
		require.NoError(t, err)

		loadedData, err := storage.Load(key)
		require.NoError(t, err)
		assert.Equal(t, data, loadedData)
	})

	t.Run("load non-exist file", func(t *testing.T) {
		key := "nonexistent/file.txt"
		data, err := storage.Load(key)
		assert.Error(t, err)
		assert.Nil(t, data)
		assert.True(t, os.IsNotExist(err))
	})
}

func TestLocalStorageDelete(t *testing.T) {
	tmpDir := t.TempDir()
	storage := &LocalStorage{root: tmpDir}

	t.Run("delete file", func(t *testing.T) {
		key := "to_delete.txt"
		data := []byte("content to be `deleted")

		err := storage.Save(key, data)
		require.NoError(t, err)

		exists, err := storage.Exists(key)
		assert.NoError(t, err)
		assert.True(t, exists)

		err = storage.Delete(key)
		require.NoError(t, err)

		exists, err = storage.Exists(key)
		require.NoError(t, err)
		assert.False(t, exists)
	})

	t.Run("delete directory", func(t *testing.T) {
		dirKey := "directory/to/delete"
		fileKey := filepath.Join(dirKey, "file.txt")
		data := []byte("file in directory")

		err := storage.Save(fileKey, data)
		require.NoError(t, err)

		// delete whole directory
		err = storage.Delete(dirKey)
		require.NoError(t, err)

		exists, err := storage.Exists(fileKey)
		require.NoError(t, err)
		assert.False(t, exists)

		exists, err = storage.Exists(dirKey)
		assert.NoError(t, err)
		assert.False(t, exists)
	})

	t.Run("delete non-existent dir", func(t *testing.T) {
		key := "nonexistent/path"

		err := storage.Delete(key)
		require.NoError(t, err)
	})
}

func TestLocalStorageExists(t *testing.T) {
	tmpDir := t.TempDir()
	storage := &LocalStorage{root: tmpDir}

	t.Run("file exists", func(t *testing.T) {
		key := "existing_file.txt"
		data := []byte("content")

		err := storage.Save(key, data)
		require.NoError(t, err)

		exists, err := storage.Exists(key)
		require.NoError(t, err)
		assert.True(t, exists)
	})

	t.Run("file not exists", func(t *testing.T) {
		key := "nonexistent_file.txt"

		exists, err := storage.Exists(key)
		require.NoError(t, err)
		assert.False(t, exists)
	})

	t.Run("directory exists", func(t *testing.T) {
		key := "existing_dir/file.txt"
		data := []byte("content")

		err := storage.Save(key, data)
		require.NoError(t, err)

		dirKey := "existing_dir"
		exists, err := storage.Exists(dirKey)
		require.NoError(t, err)
		assert.True(t, exists)
	})
}

func TestLocalStorageList(t *testing.T) {
	tmpDir := t.TempDir()
	storage := &LocalStorage{root: tmpDir}

	testFiles := []string{
		"prefix/file1.txt",
		"prefix/subdir/file2.txt",
		"prefix/subdir/file3.txt",
		"other/file4.txt",
		"prefix_file5.txt", // 不应该被匹配到
	}

	for _, file := range testFiles {
		err := storage.Save(file, []byte("content"))
		require.NoError(t, err)
	}

	t.Run("list files with prefix", func(t *testing.T) {
		paths, err := storage.List("prefix")
		require.NoError(t, err)

		expectedPaths := map[string]bool{
			"file1.txt":        false, // 文件
			"subdir":           true,  // 目录
			"subdir/file2.txt": false,
			"subdir/file3.txt": false,
		}

		assert.Len(t, paths, len(expectedPaths))
		for _, path := range paths {
			isDir, exists := expectedPaths[path.Path]
			assert.True(t, exists, "error path: %s", path.Path)
			assert.Equal(t, isDir, path.IsDir, "path %s not match", path.Path)
		}
	})

	t.Run("list non-exists prefix", func(t *testing.T) {
		paths, err := storage.List("nonexistent")
		require.NoError(t, err)
		assert.Empty(t, paths)
	})

	t.Run("list empty prefix", func(t *testing.T) {
		paths, err := storage.List("")
		require.NoError(t, err)

		assert.Greater(t, len(paths), 0)

		hasPrefix := false
		hasOther := false
		for _, path := range paths {
			if path.Path == "prefix" && path.IsDir {
				hasPrefix = true
			}
			if path.Path == "other" && path.IsDir {
				hasOther = true
			}
		}

		assert.True(t, hasPrefix)
		assert.True(t, hasOther)
	})
}

func TestLocalStorageState(t *testing.T) {
	tmpDir := t.TempDir()
	storage := &LocalStorage{root: tmpDir}

	t.Run("get file state", func(t *testing.T) {
		key := "test_file.txt"
		data := []byte("file content")
		expectedSize := int64(len(data))

		err := storage.Save(key, data)
		require.NoError(t, err)

		// make timestamp different
		time.Sleep(10 * time.Millisecond)
		state, err := storage.State(key)
		require.NoError(t, err)

		assert.Equal(t, expectedSize, state.Size)
		assert.False(t, state.LastModified.IsZero())
	})

	t.Run("get nonexists file state", func(t *testing.T) {
		key := "nonexistent-file.txt"

		state, err := storage.State(key)
		assert.Error(t, err)
		assert.True(t, os.IsNotExist(err))
		assert.Equal(t, oss.OSSState{}, state)
	})

	t.Run("get dir state", func(t *testing.T) {
		dirKey := "test_dir"
		fileKey := filepath.Join(dirKey, "file.txt")

		err := storage.Save(fileKey, []byte("content"))
		require.NoError(t, err)

		state, err := storage.State(dirKey)
		require.NoError(t, err)

		assert.True(t, state.Size >= 0)
		assert.False(t, state.LastModified.IsZero())
	})
}

func TestLocalStorageType(t *testing.T) {
	tmpDir := t.TempDir()
	storage := &LocalStorage{root: tmpDir}

	assert.Equal(t, oss.OSS_TYPE_LOCAL, storage.Type())
}

func TestLocalStorageConcurrentAccess(t *testing.T) {
	tmpDir := t.TempDir()
	storage := &LocalStorage{root: tmpDir}

	const goroutines = 10
	const operations = 20

	done := make(chan bool)

	for i := 0; i < goroutines; i++ {
		go func(id int) {
			for j := 0; j < operations; j++ {
				key := filepath.Join("concurrent", fmt.Sprintf("worker%d", id), fmt.Sprintf("file%d", j))

				data := []byte(key)

				err := storage.Save(key, data)
				assert.NoError(t, err)

				exists, err := storage.Exists(key)
				assert.NoError(t, err)
				assert.True(t, exists)

				loadedData, err := storage.Load(key)
				assert.NoError(t, err)
				assert.Equal(t, data, loadedData)

				state, err := storage.State(key)
				assert.NoError(t, err)
				assert.Equal(t, int64(len(data)), state.Size)
			}
			done <- true
		}(i)
	}

	for i := 0; i < goroutines; i++ {
		<-done
	}

	paths, err := storage.List("concurrent")
	assert.NoError(t, err)
	assert.Len(t, paths, goroutines+goroutines*operations) // 10 dirs + 200 files
}

func TestLocalStorage_SpecialCharacters(t *testing.T) {
	tmpDir := t.TempDir()
	storage := &LocalStorage{root: tmpDir}

	testCases := []struct {
		name string
		key  string
	}{
		{"空格", "file with spaces.txt"},
		{"中文", "中文文件.txt"},
		{"特殊字符", "file-with-special-@#$%.txt"},
		{"多层路径", "path/with/../special/./chars.txt"},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			data := []byte("content for " + tc.name)

			err := storage.Save(tc.key, data)
			require.NoError(t, err)

			loadedData, err := storage.Load(tc.key)
			require.NoError(t, err)
			assert.Equal(t, data, loadedData)

			exists, err := storage.Exists(tc.key)
			require.NoError(t, err)
			assert.True(t, exists)

			// 清理
			err = storage.Delete(tc.key)
			require.NoError(t, err)
		})
	}
}
