package factory

import (
	"fmt"

	"github.com/jjgagacy/workflow-app/plugin/oss"
	"github.com/jjgagacy/workflow-app/plugin/oss/local"
)

var OSSFactory = map[string]func(oss.Args) (oss.OSS, error){
	"local": local.NewLocalStorage,
}

func Load(name string, args oss.Args) (oss.OSS, error) {
	f, ok := OSSFactory[name]
	if !ok {
		return nil, fmt.Errorf("%s is not in the provider list", name)
	}
	return f(args)
}
