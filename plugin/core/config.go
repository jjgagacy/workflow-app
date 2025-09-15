package core

import (
	"fmt"

	"github.com/go-playground/validator/v10"
)

type Config struct {
	ServerPort uint16 `envconfig:"SERVER_PORT" validate:"required"`
	ServerKey  string `envconfig:"SERVER_KEY" validate:"required"`

	InnerApiUrl string `envconfig:"INNER_API_URL" validate:"required"`
	InnerApiKey string `envconfig:"INNER_API_KEY" validate:"required"`

	PluginStorageType      string `envconfig:"PLUGIN_STORAGE_TYPE" validate:"required"`
	PluginStorageOssBucket string `envconfig:"PLUGIN_STORAGE_OSS_BUCKET"`

	// request timeout
	PluginMaxExecutionTimeout int `envconfig:"PLUGIN_MAX_EXECUTION_TIMEOUT" validate:"required"`

	// local launching max concurrent
	PluginLocalLaunchingConcurrent int `envconfig:"PLUGIN_LOCAL_LAUNCHING_CONCURRENT" validate:"required"`

	Platform PlatformType `envconfig:"PLATFORM" validate:"required"`

	RoutinePoolSize int `envconfig:"ROUTINE_POOL_SIZE" validate:"required"`

	// redis
	RedisHost   string `envconfig:"REDIS_HOST"`
	RedisPort   uint16 `envconfig:"REDIS_PORT"`
	RedisPass   string `envconfig:"REDIS_PASSWORD"`
	RedisUser   string `envconfig:"REDIS_USERNAME"`
	RedisUseSsl bool   `envconfig:"REDIS_USE_SSL"`
	RedisDB     int    `envconfig:"REDIS_DB"`

	// redis sentinel
	RedisUseSentinel           bool    `envconfig:"REDIS_USE_SENTINEL"`
	RedisSentinels             string  `envconfig:"REDIS_SENTINELS"`
	RedisSentinelServiceName   string  `envconfig:"REDIS_SENTINEL_SERVICE_NAME"`
	RedisSentinelUsername      string  `envconfig:"REDIS_SENTINEL_USERNAME"`
	RedisSentinelPassword      string  `envconfig:"REDIS_SENTINEL_PASSWORD"`
	RedisSentinelSocketTimeout float64 `envconfig:"REDIS_SENTINEL_SOCKET_TIMEOUT"`

	// database
	DBType            string  `envconfig:"DB_TYPE" default:"postgresql"`
	DBUsername        string  `envconfig:"DB_USERNAME" validate:"required"`
	DBPassword        *string `envconfig:"DB_PASSWORD" validate:"required"`
	DBHost            string  `envconfig:"DB_HOST" validate:"required"`
	DBPort            uint16  `envconfig:"DB_PORT" validate:"required"`
	DBDatabase        string  `envconfig:"DB_DATABASE" validate:"required"`
	DBDefaultDatabase string  `envconfig:"DB_DEFAULT_DATABASE"`
	DBSslMode         string  `envconfig:"DB_SSL_MODE" validate:"required,oneof=disable require"`
	DBTimeZone        string  `envconfig:"DB_TIMEZONE" validate:"required"`

	// database connection pool settings
	DBMaxIdleConns    int    `envconfig:"DB_MAX_IDLE_CONNS" default:"10"`
	DBMaxOpenConns    int    `envconfig:"DB_MAX_OPEN_CONNS" default:"30"`
	DBConnMaxLifetime int    `envconfig:"DB_CONN_MAX_LIFETIME" default:"3600"`
	DBExtras          string `envconfig:"DB_EXTRAS"`
	DBCharset         string `envconfig:"DB_CHARSET"`

	// plugin endpoint
	PluginEndpointEnabled *bool `envconfig:"PLUGIN_ENDPOINT_ENABLED"`

	// storage
	PluginWorkingPath      string `envconfig:"PLUGIN_WORKING_PATH"` // where the plugin finally running
	PluginMediaCacheSize   uint16 `envconfig:"PLUGIN_MEDIA_CACHE_SIZE"`
	PluginMediaCachePath   string `envconfig:"PLUGIN_MEDIA_CACHE_PATH"`
	PluginInstalledPath    string `envconfig:"PLUGIN_INSTALLED_PATH" validate:"required"` // where the plugin finally installed
	PluginPackageCachePath string `envconfig:"PLUGIN_PACKAGE_CACHE_PATH"`                 // where plugin packages stored

	// persistence storage
	PersistenceStoragePath    string `envconfig:"PERSISTENCE_STORAGE_PATH"`
	PersistenceStorageMaxSize int64  `envconfig:"PERSISTENCE_STORAGE_MAX_SIZE"`

	// enable or disable third-party signature verification for plugins
	ThirdPartySignatureVerificationEnabled bool `envconfig:"THIRD_PARTY_SIGNATURE_VERIFICATION_ENABLED"  default:"false"`
	// a comma-separated list of file paths to public keys in addition to the official public key for signature verification
	ThirdPartySignatureVerificationPublicKeys []string `envconfig:"THIRD_PARTY_SIGNATURE_VERIFICATION_PUBLIC_KEYS"  default:""`

	// lifetime state management
	LifetimeCollectionHeartbeatInterval int `envconfig:"LIFETIME_COLLECTION_HEARTBEAT_INTERVAL"  validate:"required"`
	LifetimeCollectionGCInterval        int `envconfig:"LIFETIME_COLLECTION_GC_INTERVAL" validate:"required"`
	LifetimeStateGCInterval             int `envconfig:"LIFETIME_STATE_GC_INTERVAL" validate:"required"`

	PluginServerlessConnectorURL           *string `envconfig:"PLUGIN_SERVERLESS_CONNECTOR_URL"`
	PluginServerlessConnectorAPIKey        *string `envconfig:"PLUGIN_SERVERLESS_CONNECTOR_API_KEY"`
	PluginServerlessConnectorLaunchTimeout int     `envconfig:"PLUGIN_SERVERLESS_CONNECTOR_LAUNCH_TIMEOUT"`

	MaxPluginPackageSize            int64 `envconfig:"MAX_PLUGIN_PACKAGE_SIZE" validate:"required"`
	MaxBundlePackageSize            int64 `envconfig:"MAX_BUNDLE_PACKAGE_SIZE" validate:"required"`
	MaxServerlessTransactionTimeout int   `envconfig:"MAX_SERVERLESS_TRANSACTION_TIMEOUT"`

	PluginStdioBufferSize    int `envconfig:"PLUGIN_STDIO_BUFFER_SIZE" default:"1024"`
	PluginStdioMaxBufferSize int `envconfig:"PLUGIN_STDIO_MAX_BUFFER_SIZE" default:"5242880"`

	DisplayClusterLog bool `envconfig:"DISPLAY_CLUSTER_LOG"`

	// proxy settings
	HttpProxy  string `envconfig:"HTTP_PROXY"`
	HttpsProxy string `envconfig:"HTTPS_PROXY"`
	NoProxy    string `envconfig:"NO_PROXY"`

	// log settings
	HealthApiLogEnabled *bool `envconfig:"HEALTH_API_LOG_ENABLED"`

	InvocationConnectionIdleTimeout int `envconfig:"INVOCATION_CONNECTION_IDLE_TIMEOUT" validate:"required"`

	// invocation write timeout in milliseconds
	InvocationWriteTimeout int64 `envconfig:"BACKWARDS_INVOCATION_WRITE_TIMEOUT" default:"5000"`
	// invocation read timeout in milliseconds
	InvocationReadTimeout int64 `envconfig:"BACKWARDS_INVOCATION_READ_TIMEOUT" default:"240000"`
}

func (c *Config) Validate() error {
	validate := validator.New()
	err := validate.Struct(c)
	if err != nil {
		return err
	}

	switch c.Platform {
	case PLATFORM_SERVERLESS:
		if c.PluginServerlessConnectorURL == nil {
			return fmt.Errorf("plugin serverless connector url is empty")
		}
		if c.PluginServerlessConnectorAPIKey == nil {
			return fmt.Errorf("plugin serverless connector api key is empty")
		}
		if c.MaxServerlessTransactionTimeout == 0 {
			return fmt.Errorf("max serverless transaction timeout is zero")
		}
	case PLATFORM_LOCAL:
		if c.PluginWorkingPath == "" {
			return fmt.Errorf("plugin working path is empty")
		}
	default:
		return fmt.Errorf("invalid platform")
	}

	if c.PluginPackageCachePath == "" {
		return fmt.Errorf("plugin package cache path is empty")
	}
	return nil
}

type PlatformType string

const (
	PLATFORM_LOCAL      PlatformType = "local"
	PLATFORM_SERVERLESS PlatformType = "serverless"
)
