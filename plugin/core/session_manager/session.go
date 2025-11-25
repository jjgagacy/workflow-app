package session_manager

import (
	"errors"
	"fmt"
	"sync"

	"github.com/google/uuid"
	"github.com/jjgagacy/workflow-app/plugin/core/invocation"
	"github.com/jjgagacy/workflow-app/plugin/core/plugin_daemon/access_types"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/utils"
)

var (
	sessions map[string]*Session
	mu       sync.RWMutex
)

type Session struct {
	ID                  string                         `json:"id"`
	runtime             plugin_entities.PluginLifetime `json:"-"`
	backwardsInvocation invocation.BackwardsInvocation `json:"-"`

	TenantID               string                                 `json:"tenant_id"`
	UserID                 string                                 `json:"user_id"`
	PluginUniqueIdentifier plugin_entities.PluginUniqueIdentifier `json:"plugin_unique_identifier"`
	AccessType             access_types.PluginAccessType          `json:"access_type"`
	AccessAction           access_types.PluginAccessAction        `json:"access_action"`
	Declaration            *plugin_entities.PluginDeclaration     `json:"declaration"`

	ConversationID *string        `json:"conversation_id"`
	MessageID      *string        `json:"message_id"`
	AppID          *string        `json:"app_id"`
	EndPointID     *string        `json:"endpoint_id"`
	Context        map[string]any `json:"context"`
}

func sessionKey(id string) string {
	return fmt.Sprintf("session_key:%s", id)
}

type SessionPayload struct {
	TenantID               string                                 `json:"tenant_id"`
	UserID                 string                                 `json:"user_id"`
	PluginUniqueIdentifier plugin_entities.PluginUniqueIdentifier `json:"plugin_unique_identifier"`
	AccessType             access_types.PluginAccessType          `json:"access_type"`
	AccessAction           access_types.PluginAccessAction        `json:"access_action"`
	Declaration            *plugin_entities.PluginDeclaration     `json:"declaration"`
	BackwardsInvocation    invocation.BackwardsInvocation         `json:"backwards_invocation"`
	IgnoreCache            bool                                   `json:"ignore_cache"`
	ConversationID         *string                                `json:"conversation_id"`
	MessageID              *string                                `json:"message_id"`
	AppID                  *string                                `json:"app_id"`
	EndPointID             *string                                `json:"endpoint_id"`
	Context                map[string]any                         `json:"context"`
}

func NewSession(payload SessionPayload) *Session {
	s := &Session{
		ID:                     uuid.New().String(),
		TenantID:               payload.TenantID,
		UserID:                 payload.UserID,
		PluginUniqueIdentifier: payload.PluginUniqueIdentifier,
		AccessType:             payload.AccessType,
		AccessAction:           payload.AccessAction,
		Declaration:            payload.Declaration,
		backwardsInvocation:    payload.BackwardsInvocation,
		ConversationID:         payload.ConversationID,
		MessageID:              payload.MessageID,
		AppID:                  payload.AppID,
		EndPointID:             payload.EndPointID,
		Context:                payload.Context,
	}

	mu.Lock()
	sessions[s.ID] = s
	mu.Unlock()

	if !payload.IgnoreCache {
		// todo
	}
	return s
}

type GetSessionPayload struct {
	ID          string `json:"id"`
	IgnoreCache bool   `json:"ignore_cache"`
}

func GetSession(payload GetSessionPayload) (*Session, error) {
	mu.Lock()
	session := sessions[payload.ID]
	mu.Unlock()

	if session == nil {
		// todo get from cache
	}
	return session, nil
}

type DeleteSessionPayload struct {
	ID          string `json:"id"`
	IgnoreCache bool   `json:"ignore_cache"`
}

func DeleteSession(payload DeleteSessionPayload) {
	mu.Lock()
	delete(sessions, payload.ID)
	mu.Unlock()

	if !payload.IgnoreCache {
		// todo delete from cache
	}
}

type CloseSessionPayload struct {
	IgnoreCache bool `json:"ignore_cache"`
}

func (s *Session) Close(payload CloseSessionPayload) {
	DeleteSession(DeleteSessionPayload{
		ID:          s.ID,
		IgnoreCache: payload.IgnoreCache,
	})
}

func (s *Session) BindRuntime(runtime plugin_entities.PluginLifetime) {
	s.runtime = runtime
}

func (s *Session) Runtime() plugin_entities.PluginLifetime {
	return s.runtime
}

func (s *Session) BindBackwardsInvocation(backwardsInvocation invocation.BackwardsInvocation) {
	s.backwardsInvocation = backwardsInvocation
}

func (s *Session) BackwardsInvocation() invocation.BackwardsInvocation {
	return s.backwardsInvocation
}

type EventStream string

const (
	EVENT_STREAM_REQUEST EventStream = "request"
	EVENT_STREAM_RESONSE EventStream = "response"
)

func (s *Session) Message(event EventStream, data any) []byte {
	return utils.MarshalJsonBytes(map[string]any{
		"session_id":      s.ID,
		"conversation_id": s.ConversationID,
		"message_id":      s.MessageID,
		"app_id":          s.AppID,
		"endpoint_id":     s.EndPointID,
		"context":         s.Context,
		"event":           event,
		"data":            data,
	})
}

func (s *Session) Write(event EventStream, action access_types.PluginAccessAction, data any) error {
	if s.runtime == nil {
		return errors.New("runtime not found")
	}
	s.runtime.Write(s.ID, action, s.Message(event, data))
	return nil
}
