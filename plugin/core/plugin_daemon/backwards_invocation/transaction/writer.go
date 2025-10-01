package transaction

import (
	"github.com/jjgagacy/workflow-app/plugin/core/plugin_daemon/backwards_invocation"
	"github.com/jjgagacy/workflow-app/plugin/core/session_manager"
)

type FullDuplexTransactionWriter struct {
	session *session_manager.Session

	backwards_invocation.BackwardsInvocationWriter
}

func NewFullDuplexEventWriter(session *session_manager.Session) *FullDuplexTransactionWriter {
	return &FullDuplexTransactionWriter{
		session: session,
	}
}

func (w *FullDuplexTransactionWriter) Write(event session_manager.EventStream, data any) error {
	return w.session.Write(event, "", data)
}

func (w *FullDuplexTransactionWriter) Done() {
}
