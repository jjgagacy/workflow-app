package core

import (
	"github.com/jjgagacy/workflow-app/plugin/oss"
	"golang.org/x/exp/constraints"
)

func (config *Config) SetDefault() {
	setDefaultInt(&config.ServerPort, 5002)
	setDefaultInt(&config.RoutinePoolSize, 10000)
	setDefaultInt(&config.LifetimeCollectionGCInterval, 60)
	setDefaultInt(&config.LifetimeCollectionHeartbeatInterval, 5)
	setDefaultInt(&config.LifetimeStateGCInterval, 300)
	setDefaultInt(&config.InvocationConnectionIdleTimeout, 120)
	setDefaultInt(&config.MaxPluginPackageSize, 52428800)
	setDefaultInt(&config.MaxBundlePackageSize, 52428800*12)
	setDefaultInt(&config.MaxServerlessTransactionTimeout, 300)
	setDefaultInt(&config.PluginMaxExecutionTimeout, 10*60)
	setDefaultString(&config.PluginStorageType, oss.OSS_TYPE_LOCAL)
	setDefaultInt(&config.PluginMediaCacheSize, 1024)
	setDefaultBoolPtr(&config.PluginEndPointEnabled, true)
	setDefaultString(&config.DBSslMode, "disable")
	setDefaultString(&config.PluginInstalledPath, "plugin")
	setDefaultString(&config.PluginMediaCachePath, "assets")
	setDefaultString(&config.PersistenceStoragePath, "persistence")
	setDefaultInt(&config.PluginLocalLaunchingConcurrent, 2)
	setDefaultInt(&config.PersistenceStorageMaxSize, 100*1024*1024)
	setDefaultString(&config.PluginPackageCachePath, "plugin_packages")
	setDefaultInt(&config.InvocationWriteTimeout, 5000)
	setDefaultInt(&config.InvocationReadTimeout, 240000)
	switch config.DBType {
	case "postgresql":
		setDefaultString(&config.DBDefaultDatabase, "postgres")
	case "mysql":
		setDefaultString(&config.DBDefaultDatabase, "mysql")
	}
	setDefaultBoolPtr(&config.HealthApiLogEnabled, true)
}

func setDefaultInt[T constraints.Integer](value *T, defaultValue T) {
	if *value == 0 {
		*value = defaultValue
	}
}

func setDefaultString(value *string, defaultValue string) {
	if *value == "" {
		*value = defaultValue
	}
}

func setDefaultBoolPtr(value **bool, defaultValue bool) {
	if *value == nil {
		*value = &defaultValue
	}
}
