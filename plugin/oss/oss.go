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

type OSSState struct {
	Size         int64
	LastModified time.Time
}

type OSSPath struct {
	Path  string
	IsDir bool
}

type OSS interface {
	Save(key string, data []byte) error

	Load(key string) ([]byte, error)

	Exists(key string) (bool, error)

	State(key string) (OSSState, error)

	List(prefix string) ([]OSSPath, error)

	Delete(key string) error

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
