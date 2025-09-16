package oss

import "fmt"

func (l *Local) Validate() error {
	if l.Path == "" {
		return fmt.Errorf("path cannot be empty")
	}
	return nil
}
