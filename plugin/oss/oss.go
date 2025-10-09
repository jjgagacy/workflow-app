package oss

import "time"

const (
	OSS_TYPE_LOCAL          = "local"
	OSS_TYPE_S3             = "aws_s3"
	OSS_TYPE_TENCENT_COS    = "tencent_cos"
	OSS_TYPE_AZURE_BLOB     = "azure_blob"
	OSS_TYPE_GCS            = "gcs"
	OSS_TYPE_ALIYUN_OSS     = "aliyun_oss"
	OSS_TYPE_HUAWEI_OSS     = "huawei_obs"
	OSS_TYPE_VOLCENGINE_TOS = "volcengine_tos"
)

// OSState represents the state and metadata of an object in storage
type OSSState struct {
	Size         int64
	LastModified time.Time
}

// OSSPath represents the path or object in the object storage
type OSSPath struct {
	Path  string
	IsDir bool
}

// OSS defines the interface for Object Storage Service operations
// It provides a unified abstraction for various cloud storage services.
type OSS interface {
	// Save stores the g  friven data with the specified key in the object storage.
	// Returns an error of the operation fails.
	Save(key string, data []byte) error

	// Load retrieves the data associated with the specified key from the object
	// storage.
	// Returns the data as byte slice and an error if operation fails.
	Load(key string) ([]byte, error)

	// Exists check whether the specified key exists in the object storage.
	// Returns true if the object exists, false otherwise, and an error if the
	// check fails.
	Exists(key string) (bool, error)

	// State retrieves the current state information of the specified object.
	// Returns OSSState containing metadata and status information.
	State(key string) (OSSState, error)

	// List returns all objects in the storage that keys starting with the given
	// prefix.
	// Returns a slice of OSSPath objects representing the found items.
	List(prefix string) ([]OSSPath, error)

	// Delete removes the object with the spedified key from the storage.
	// Returns an error if the deletion fails.
	Delete(key string) error

	// Type returns an string identifier representing the type of storage information.
	// This helps in identifying the specific OSS provider (e.g. "s3", "azure", "gcs").
	Type() string
}

type S3 struct {
	UseAWS           bool
	EndPoint         string
	UsePathStyle     bool
	AccessKey        string
	SecretKey        string
	Bucket           string
	Region           string
	UseIamRole       bool
	SignatureVersion string
}

type Local struct {
	Path string
}

type AzureBlob struct {
	ConnectString string
	ContainerName string
}

type AliyunOSS struct {
	Region      string
	EndPoint    string
	AccessKey   string
	SecretKey   string
	AuthVersion string
	Path        string
	Bucket      string
	CloudBoxId  string
}

type HuaweiOBS struct {
	Bucket    string
	AccessKey string
	SecretKey string
	Server    string
	PathStyle bool
}

type VolcengineTOS struct {
	Region    string
	EndPoint  string
	AccessKey string
	SecretKey string
	Bucket    string
}

type GoogleCloudStorage struct {
	Bucket      string
	Credentials string
}

type TencentCOS struct {
	Region    string
	SecretID  string
	SecretKey string
	Bucket    string
}

type Args struct {
	S3                 *S3
	Local              *Local
	AzureBlob          *AzureBlob
	AliyunOSS          *AliyunOSS
	TencentCOS         *TencentCOS
	GoogleCloudStorage *GoogleCloudStorage
	HuaweiOBS          *HuaweiOBS
	VolcengineTOS      *VolcengineTOS
}
