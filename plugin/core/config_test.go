package core

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func stringPtr(s string) *string {
	return &s
}

func boolPtr(b bool) *bool {
	return &b
}

func TestConfigValidate(t *testing.T) {
	// 定义测试用的常量
	testConnectorURL := "https://api.example.com"
	testAPIKey := "test-api-key-123"
	testWorkingPath := "/tmp/plugins"
	testCachePath := "/tmp/cache"
	testTimeout := 30

	baseConfig := Config{
		ServerPort: 8080,
		ServerKey:  "default_server_key",

		InnerApiUrl: "http:/localhost:8080",
		InnerApiKey: "default_key",

		// 插件存储配置
		PluginStorageType:      "local",
		PluginStorageOssBucket: "",

		// 超时和并发配置
		PluginMaxExecutionTimeout:      30000,
		PluginLocalLaunchingConcurrent: 10,

		// 平台和协程池配置
		Platform:        PLATFORM_LOCAL,
		RoutinePoolSize: 100,

		// 数据库配置
		DBType:            "postgresql",
		DBUsername:        "postgres",
		DBPassword:        stringPtr("pass"),
		DBHost:            "localhost",
		DBPort:            5432,
		DBDatabase:        "mydb",
		DBDefaultDatabase: "postgres",
		DBSslMode:         "disable",

		// 数据库连接池配置
		DBMaxIdleConns:    10,
		DBMaxOpenConns:    30,
		DBConnMaxLifetime: 3600,
		DBExtras:          "",
		DBCharset:         "utf8",
		DBTimeZone:        "Asia/Shanghai",

		// 插件端点配置
		PluginEndPointEnabled:           boolPtr(true),
		InvocationConnectionIdleTimeout: 500,

		// 存储路径配置
		PluginWorkingPath:      "/tmp/plugins",
		PluginMediaCacheSize:   100,
		PluginMediaCachePath:   "/tmp/media-cache",
		PluginInstalledPath:    "/opt/plugins/installed",
		PluginPackageCachePath: "/opt/plugins/cache",

		// 持久化存储配置
		PersistenceStoragePath:    "/var/lib/persistence",
		PersistenceStorageMaxSize: 1073741824, // 1GB

		// 签名验证配置
		ThirdPartySignatureVerificationEnabled:    false,
		ThirdPartySignatureVerificationPublicKeys: []string{},

		// 生命周期管理配置
		LifetimeCollectionHeartbeatInterval: 30,
		LifetimeCollectionGCInterval:        300,
		LifetimeStateGCInterval:             3600,

		// Serverless 配置
		PluginServerlessConnectorURL:           stringPtr("https://api.example.com"),
		PluginServerlessConnectorAPIKey:        stringPtr("serverless-api-key"),
		PluginServerlessConnectorLaunchTimeout: 30,

		// 包大小限制配置
		MaxPluginPackageSize:            104857600, // 100MB
		MaxBundlePackageSize:            524288000, // 500MB
		MaxServerlessTransactionTimeout: 300,

		// 标准IO缓冲配置
		PluginStdioBufferSize:    1024,
		PluginStdioMaxBufferSize: 5242880,

		// 日志和显示配置
		DisplayClusterLog: true,

		// 代理配置
		HttpProxy:  "",
		HttpsProxy: "",
		NoProxy:    "",

		// 健康检查日志配置
		HealthApiLogEnabled: boolPtr(false),

		// 调用超时配置
		InvocationWriteTimeout: 5000,
		InvocationReadTimeout:  240000,
	}

	tests := []struct {
		name    string
		config  *Config
		wantErr bool
		errMsg  string
	}{
		// 有效的 Serverless 配置
		{
			name: "valid_serveless_config",
			config: func() *Config {
				cfg := baseConfig
				cfg.Platform = PLATFORM_SERVERLESS
				cfg.PluginServerlessConnectorURL = stringPtr(testConnectorURL)
				cfg.MaxServerlessTransactionTimeout = testTimeout
				cfg.PluginPackageCachePath = testCachePath
				return &cfg
			}(),
			wantErr: false,
		},
		// 有效的 Local 配置
		{
			name: "valid_local_config",
			config: func() *Config {
				cfg := baseConfig
				cfg.Platform = PLATFORM_LOCAL
				cfg.PluginWorkingPath = testWorkingPath
				cfg.PluginPackageCachePath = testCachePath
				return &cfg
			}(),
			wantErr: false,
		},
		// Serverless 平台缺少 URL
		{
			name: "serverless_missing_url",
			config: func() *Config {
				cfg := baseConfig
				cfg.Platform = PLATFORM_SERVERLESS
				cfg.PluginServerlessConnectorURL = nil
				cfg.PluginServerlessConnectorAPIKey = stringPtr(testAPIKey)
				cfg.MaxServerlessTransactionTimeout = testTimeout
				cfg.PluginPackageCachePath = testCachePath
				return &cfg
			}(),
			wantErr: true,
			errMsg:  "plugin serverless connector url is empty",
		},
		// Serverless 平台缺少 API Key
		{
			name: "serverless_missing_api_key",
			config: func() *Config {
				cfg := baseConfig
				cfg.Platform = PLATFORM_SERVERLESS
				cfg.PluginServerlessConnectorURL = stringPtr(testConnectorURL)
				cfg.PluginServerlessConnectorAPIKey = nil
				cfg.MaxServerlessTransactionTimeout = testTimeout
				cfg.PluginPackageCachePath = testCachePath
				return &cfg
			}(),
			wantErr: true,
			errMsg:  "plugin serverless connector api key is empty",
		},
		// Serverless 平台超时时间为零
		{
			name: "serverless_zero_timeout",
			config: func() *Config {
				cfg := baseConfig
				cfg.Platform = PLATFORM_SERVERLESS
				cfg.PluginServerlessConnectorURL = stringPtr(testConnectorURL)
				cfg.PluginServerlessConnectorAPIKey = stringPtr(testAPIKey)
				cfg.MaxServerlessTransactionTimeout = 0
				cfg.PluginPackageCachePath = testCachePath
				return &cfg
			}(),
			wantErr: true,
			errMsg:  "max serverless transaction timeout is zero",
		},
		// Serverless 平台空字符串 URL
		{
			name: "serverless_empty_url",
			config: func() *Config {
				cfg := baseConfig
				cfg.Platform = PLATFORM_SERVERLESS
				cfg.PluginServerlessConnectorURL = nil
				cfg.PluginServerlessConnectorAPIKey = stringPtr(testAPIKey)
				cfg.MaxServerlessTransactionTimeout = testTimeout
				cfg.PluginPackageCachePath = testCachePath
				return &cfg
			}(),
			wantErr: true,
			errMsg:  "plugin serverless connector url is empty",
		},
		// Serverless 平台空字符串 API Key
		{
			name: "serverless_empty_api_key",
			config: func() *Config {
				cfg := baseConfig
				cfg.Platform = PLATFORM_SERVERLESS
				cfg.PluginServerlessConnectorURL = stringPtr(testConnectorURL)
				cfg.PluginServerlessConnectorAPIKey = nil
				cfg.MaxServerlessTransactionTimeout = testTimeout
				cfg.PluginPackageCachePath = testCachePath
				return &cfg
			}(),
			wantErr: true,
			errMsg:  "plugin serverless connector api key is empty",
		},
		// Local 平台缺少工作路径
		{
			name: "local_missing_working_path",
			config: func() *Config {
				cfg := baseConfig
				cfg.Platform = PLATFORM_LOCAL
				cfg.PluginWorkingPath = ""
				cfg.PluginPackageCachePath = testCachePath
				return &cfg
			}(),
			wantErr: true,
			errMsg:  "plugin working path is empty",
		},
		// 缺少缓存路径（所有平台都需要）
		{
			name: "missing_cache_path",
			config: func() *Config {
				cfg := baseConfig
				cfg.Platform = PLATFORM_SERVERLESS
				cfg.PluginServerlessConnectorURL = stringPtr(testConnectorURL)
				cfg.PluginServerlessConnectorAPIKey = stringPtr(testAPIKey)
				cfg.MaxServerlessTransactionTimeout = testTimeout
				cfg.PluginPackageCachePath = ""
				return &cfg
			}(),
			wantErr: true,
			errMsg:  "plugin package cache path is empty",
		},
		// 无效的平台类型
		{
			name: "invalid_platform",
			config: func() *Config {
				cfg := baseConfig
				cfg.Platform = "INVALID_PLATFORM"
				cfg.PluginPackageCachePath = testCachePath
				return &cfg
			}(),
			wantErr: true,
			errMsg:  "invalid platform",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.config.Validate()

			if tt.wantErr {
				assert.Error(t, err)
				if tt.errMsg != "" {
					assert.Contains(t, err.Error(), tt.errMsg)
				}
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

// 测试 validator 标签验证
func TestConfig_ValidatorTags(t *testing.T) {
	baseConfig := Config{
		ServerPort:                          8080,
		ServerKey:                           "test-key",
		InnerApiUrl:                         "http://localhost:8080",
		InnerApiKey:                         "test-key",
		PluginStorageType:                   "local",
		PluginMaxExecutionTimeout:           30000,
		PluginLocalLaunchingConcurrent:      10,
		Platform:                            PLATFORM_LOCAL,
		RoutinePoolSize:                     100,
		DBUsername:                          "user",
		DBPassword:                          stringPtr("pass"),
		DBHost:                              "localhost",
		DBPort:                              5432,
		DBDatabase:                          "db",
		DBDefaultDatabase:                   "postgres",
		DBSslMode:                           "disable",
		PluginInstalledPath:                 "/tmp",
		LifetimeCollectionHeartbeatInterval: 30,
		LifetimeCollectionGCInterval:        300,
		LifetimeStateGCInterval:             3600,
		MaxPluginPackageSize:                100,
		MaxBundlePackageSize:                500,
		PluginPackageCachePath:              "/tmp/cache",
		PluginWorkingPath:                   "/tmp/plugins",
	}

	tests := []struct {
		name    string
		config  *Config
		wantErr bool
	}{
		{
			name: "missing_server_port",
			config: func() *Config {
				cfg := baseConfig
				cfg.ServerPort = 0
				return &cfg
			}(),
			wantErr: true,
		},
		{
			name: "missing_server_key",
			config: func() *Config {
				cfg := baseConfig
				cfg.ServerKey = ""
				return &cfg
			}(),
			wantErr: true,
		},
		{
			name: "missing_inner_api_url",
			config: func() *Config {
				cfg := baseConfig
				cfg.InnerApiUrl = ""
				return &cfg
			}(),
			wantErr: true,
		},
		{
			name: "valid_config",
			config: func() *Config {
				return &baseConfig
			}(),
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.config.Validate()

			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}
