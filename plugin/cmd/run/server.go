package run

import (
	"fmt"
	"io"
	"net"
	"os"

	"github.com/jjgagacy/workflow-app/plugin/utils"
)

type StreamCreator interface {
	CreateStream(max int) *utils.Stream[client]
}

type DefaultStreamCreator struct{}

func (d *DefaultStreamCreator) CreateStream(max int) *utils.Stream[client] {
	return utils.NewStream[client](max)
}

func CreateStdioServerWithDeps(reader io.Reader, writer io.Writer, creator StreamCreator) *utils.Stream[client] {
	stream := creator.CreateStream(1)
	stream.Write(client{
		reader: reader,
		writer: writer,
		cancel: func() {
			if closer, ok := reader.(io.Closer); ok {
				closer.Close()
			}
			if closer, ok := writer.(io.Closer); ok {
				closer.Close()
			}
		},
	})
	return stream
}

// createStdioServer creates a stream of clients that are connected to the plugin
// through stdin and stdout
func createStdioServer() *utils.Stream[client] {
	creator := &DefaultStreamCreator{}
	return CreateStdioServerWithDeps(os.Stdin, os.Stdout, creator)
}

// createTCPServer creates a stream of clients that are connected to the plugin through
// TCP connection.
// It continously accepts new connections and sends them to the stream
func createTCPServer(payload *RunPluginPayload) (*utils.Stream[client], error) {
	listener, err := net.Listen("tcp", fmt.Sprintf("%s:%d", payload.TcpServerHost, payload.TcpServerPort))
	if err != nil {
		return nil, err
	}

	addr := listener.Addr().(*net.TCPAddr)
	payload.TcpServerHost = addr.IP.String()
	payload.TcpServerPort = addr.Port

	stream := utils.NewStream[client](30)

	go func() {
		for {
			conn, err := listener.Accept()
			if err != nil {
				continue
			}

			stream.Write(client{
				reader: conn,
				writer: conn,
				cancel: func() {
					conn.Close()
				},
			})
		}
	}()

	return stream, nil
}
