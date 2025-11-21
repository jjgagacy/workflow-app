package persistence

type PersistenceStorage interface {
	Save(tenantId string, pluginChecksum string, key string, data []byte) error
	Load(tenantId string, pluginChecksum string, key string) ([]byte, error)
	Delete(tenantId string, pluginChecksum string, key string) error
	StateSize(tenantId string, pluginChecksum string, key string) (int64, error)
	Exists(tenantId string, pluginChecksum string, key string) (bool, error)
}
