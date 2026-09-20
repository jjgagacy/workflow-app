package cache

import (
	"errors"
	"reflect"
	"time"

	"github.com/redis/go-redis/v9"
)

func AutoSet[T any](key string, value T, context ...redis.Cmdable) error {
	if client == nil {
		return ErrDbNotInit
	}

	typeInfo := reflect.TypeOf(value)
	pkgPath := typeInfo.PkgPath()
	typeName := typeInfo.Name()
	fullTypeName := pkgPath + "." + typeName

	serialKey := serialKey("auto_type", fullTypeName, key)
	return store(serialKey, value, time.Minute*30, context...)
}

func AutoGet[T any](key string, context ...redis.Cmdable) (*T, error) {
	return AutoGetWithGetter(key, func() (*T, error) { return nil, errors.New("not found") }, context...)
}

func AutoGetWithGetter[T any](key string, getter func() (*T, error), context ...redis.Cmdable) (*T, error) {
	if client == nil {
		return nil, ErrDbNotInit
	}

	var result *T

	typeInfo := reflect.TypeFor[T]()
	pkgPath := typeInfo.PkgPath()
	typeName := typeInfo.Name()
	fullTypeName := pkgPath + "." + typeName

	serialKey := serialKey("auto_type", fullTypeName, key)
	result, err := get[T](serialKey, context...)
	if err != nil {
		if err == ErrNotFound {
			result, err := getter()
			if err != nil {
				return nil, err
			}
			if err := store(serialKey, *result, time.Minute*30, context...); err != nil {
				return nil, err
			}
			return result, nil
		}
		return nil, err
	}
	return result, nil
}

func AutoDelete[T any](key string, context ...redis.Cmdable) (int64, error) {
	if client == nil {
		return 0, ErrDbNotInit
	}

	var result T

	typeInfo := reflect.TypeOf(result)
	pkgPath := typeInfo.PkgPath()
	typeName := typeInfo.Name()
	fullTypeName := pkgPath + "." + typeName

	serialKey := serialKey("auto_type", fullTypeName, key)
	return del(serialKey, context...)
}
