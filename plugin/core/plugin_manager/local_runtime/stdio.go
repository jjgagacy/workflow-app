package local_runtime

type stdioHolder struct {
}

type StdioHolderConfig struct {
	StdoutBufferSize    int
	StdoutMaxBufferSize int
}
