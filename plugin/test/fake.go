package test

import (
	"log"

	"github.com/jjgagacy/workflow-app/plugin/core"
)

func DefaultTestConfig() *core.Config {
	config := &core.Config{
		// --- server ---
		ServerPort: 8080,
		ServerKey:  "test-server-key",

		InnerApiUrl: "http://127.0.0.1:9999",
		InnerApiKey: "test-inner-api-key",

		// --- plugin storage ---
		PluginStorageType:      "local",
		PluginStorageLocalRoot: "./storage",

		PluginWorkingPath: "./cwd",

		// --- plugin execution ---
		PluginMaxExecutionTimeout:      60,
		PluginLocalLaunchingConcurrent: 1,

		// --- platform ---
		Platform: "local",

		// --- routine pool ---
		RoutinePoolSize: 4,

		// --- database (fake but valid) ---
		DBUsername:        "alex",
		DBPassword:        ptr("123"),
		DBHost:            "127.0.0.1",
		DBPort:            5432,
		DBDatabase:        "workflow_plugin",
		DBSslMode:         "disable",
		DBTimeZone:        "UTC",
		DBDefaultDatabase: "postgres",
		DBType:            "postgresql",

		RedisHost: "127.0.0.1",
		RedisPort: 6379,
		RedisPass: "",
		RedisDB:   0,

		// --- plugin install ---
		PluginInstalledPath: "./plugin",

		// --- lifetime ---
		LifetimeCollectionHeartbeatInterval: 10,
		LifetimeCollectionGCInterval:        60,
		LifetimeStateGCInterval:             60,

		// --- limits ---
		MaxPluginPackageSize:            10 * 1024 * 1024,
		MaxBundlePackageSize:            10 * 1024 * 1024,
		MaxServerlessTransactionTimeout: 60,

		// --- invocation ---
		InvocationConnectionIdleTimeout: 60,

		// --- python ---
		PythonInterpreterPath: "/usr/bin/python3",
		PythonEnvInitTimeout:  30,

		// --- node ---
		NodeExecutePath:    "/usr/bin/node",
		NodeEnvInitTimeout: 30,
	}

	config.SetDefault()

	if err := config.Validate(); err != nil {
		log.Fatalf("Invalid configuration: %s", err.Error())
	}

	return config
}

func ptr[T any](v T) *T {
	return &v
}
