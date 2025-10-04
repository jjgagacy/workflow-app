package utils

import "math/rand/v2"

func RandomString(length int) string {
	const pool = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, length)
	for i := range b {
		b[i] = pool[rand.IntN(len(pool))]
	}
	return string(b)
}

func RandomLowercaseString(length int) string {
	const pool = "abcdefghijklmnopqrstuvwxyz0123456789"
	b := make([]byte, length)
	for i := range b {
		b[i] = pool[rand.IntN(len(pool))]
	}
	return string(b)
}
