package invocation

type InvocationDaemonPayload struct {
	BaseUrl      string
	Key          string
	WriteTimeout int64
	ReadTimeout  int64
}

func NewInvocationDaemon(payload InvocationDaemonPayload) (BackwardsInvocation, error) {
	panic("not impl")
}
