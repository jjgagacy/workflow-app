package backwards_invocation

import (
	"fmt"

	"github.com/jjgagacy/workflow-app/plugin/core/invocation"
	"github.com/jjgagacy/workflow-app/plugin/core/session_manager"
)

type BackwardsInvocationType = invocation.InvokeType

type BackwardsInvocationWriter interface {
	Write(event session_manager.EventStream, data any) error
	Done()
}

type BackwardsInvocation struct {
	typ             BackwardsInvocationType
	id              string
	detailedRequest map[string]any
	session         *session_manager.Session

	// writer is that writes the data to the session
	writer BackwardsInvocationWriter

	backwardsInvocation invocation.BackwardsInvocation
}

func NewBackwardsInvocation(
	typ BackwardsInvocationType,
	id string,
	session *session_manager.Session,
	writer BackwardsInvocationWriter,
	detailedRequest map[string]any,
) *BackwardsInvocation {
	return &BackwardsInvocation{
		typ:                 typ,
		id:                  id,
		detailedRequest:     detailedRequest,
		session:             session,
		writer:              writer,
		backwardsInvocation: session.BackwardsInvocation(),
	}
}

func (b *BackwardsInvocation) GetID() string {
	return b.id
}

func (b *BackwardsInvocation) WriteError(err error) {
	b.writer.Write(
		session_manager.EVENT_STREAM_RESONSE,
		NewBackwardsInvocationError(b.id, err.Error()),
	)
}

func (b *BackwardsInvocation) WriteResponse(message string, data any) {
	b.writer.Write(
		session_manager.EVENT_STREAM_RESONSE,
		NewBackwardsInvocationResponse(b.id, message, data),
	)
}

func (b *BackwardsInvocation) EndResponse() {
	b.writer.Write(
		session_manager.EVENT_STREAM_RESONSE,
		NewBackwardsInvocationEnd(b.id),
	)
}

func (b *BackwardsInvocation) Type() BackwardsInvocationType {
	return b.typ
}

func (b *BackwardsInvocation) RequestData() map[string]any {
	return b.detailedRequest
}

func (b *BackwardsInvocation) TenantID() (string, error) {
	if b.session == nil {
		return "", fmt.Errorf("session is nil")
	}
	return b.session.TenantID, nil
}

func (b *BackwardsInvocation) UserID() (string, error) {
	if b.session == nil {
		return "", fmt.Errorf("session is nil")
	}
	return b.session.UserID, nil
}
