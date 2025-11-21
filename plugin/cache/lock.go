package cache

import "github.com/google/uuid"

func MakeDistributedLockKey() string {
	return uuid.NewString()
}
