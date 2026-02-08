package local_runtime

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path"
	"sync"

	"github.com/jjgagacy/workflow-app/plugin/core/constants"
	"github.com/jjgagacy/workflow-app/plugin/core/plugin_daemon/access_types"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/utils"
)

func (r *LocalPluginRuntime) gc() {
	if r.waitChan != nil {
		close(r.waitChan)
		r.waitChan = nil
	}
}

func (r *LocalPluginRuntime) Type() plugin_entities.PluginRuntimeType {
	return plugin_entities.PLUGIN_RUNTIME_TYPE_LOCAL
}

type PackageJSON struct {
	Name         string            `json:"name"`
	Version      string            `json:"version"`
	Dependencies map[string]string `json:"dependencies"`
}

func (r *LocalPluginRuntime) getCmd() (*exec.Cmd, error) {
	switch r.Config.Meta.Runner.Language {
	case constants.Node:
		cmd := exec.Command(r.nodeExecutePath, r.Config.Meta.Runner.EntryPoint)
		cmd.Dir = r.State.WorkingPath
		cmd.Env = cmd.Environ()
		if r.HttpsProxy != "" {
			cmd.Env = append(cmd.Env, fmt.Sprintf("HTTPS_PROXY=%s", r.HttpsProxy))
		}
		if r.HttpProxy != "" {
			cmd.Env = append(cmd.Env, fmt.Sprintf("HTTP_PROXY=%s", r.HttpProxy))
		}
		if r.NoProxy != "" {
			cmd.Env = append(cmd.Env, fmt.Sprintf("NO_PROXY=%s", r.NoProxy))
		}
		// fmt.Println("====", r.nodeExecutePath, r.Config.Meta.Runner.EntryPoint)
		return cmd, nil
	case constants.Python:
		cmd := exec.Command(r.pythonInterpreterPath, "-m", r.Config.Meta.Runner.EntryPoint)
		cmd.Dir = r.State.WorkingPath
		cmd.Env = cmd.Environ()
		if r.HttpsProxy != "" {
			cmd.Env = append(cmd.Env, fmt.Sprintf("HTTPS_PROXY=%s", r.HttpsProxy))
		}
		if r.HttpProxy != "" {
			cmd.Env = append(cmd.Env, fmt.Sprintf("HTTP_PROXY=%s", r.HttpProxy))
		}
		if r.NoProxy != "" {
			cmd.Env = append(cmd.Env, fmt.Sprintf("NO_PROXY=%s", r.NoProxy))
		}
		return cmd, nil
	}

	return nil, fmt.Errorf("unsupported language: %s", r.Config.Meta.Runner.Language)
}

func (r *LocalPluginRuntime) moniePluginCheck() {
	if r.Config.Meta.Runner.Language != constants.Node {
		return
	}
	content, err := os.ReadFile(path.Join(r.State.WorkingPath, "package.json"))
	if err != nil {
		return
	}
	var pkg PackageJSON
	if err := json.Unmarshal(content, &pkg); err != nil {
		return
	}
	if pkg.Dependencies == nil {
		return
	}

	hasMoniePlugin := false
	for dep := range pkg.Dependencies {
		if dep == "monie-plugin" {
			hasMoniePlugin = true
			break
		}
	}
	if !hasMoniePlugin {
		return
	}

	cmd := exec.Command("npm", "update", "monie-plugin")
	cmd.Dir = r.State.WorkingPath
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	if err := cmd.Run(); err != nil {
		utils.Warn("update monie-plugin error: %v\n", err.Error())
		return
	}
}

func (r *LocalPluginRuntime) StartPlugin() error {
	defer utils.Info("plugin %s stopped", r.Config.Identity())

	if r.isNotFirstStart {
		r.SetRestarting()
	} else {
		r.SetLaunching()
		r.isNotFirstStart = true
	}
	// check monie plugin
	r.moniePluginCheck()
	// reset waitChan
	r.waitChan = make(chan bool)
	cmd, err := r.getCmd()
	if err != nil {
		return err
	}

	cmd.Dir = r.State.WorkingPath
	cmd.Env = append(cmd.Environ(), "INSTALL_METHOD=local", "PATH="+os.Getenv("PATH"))

	// get stdin
	stdin, err := cmd.StdinPipe()
	if err != nil {
		return fmt.Errorf("get stdin pipe failed: %s", err.Error())
	}
	defer stdin.Close()

	// get stdout
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return fmt.Errorf("get stdout pipe failed: %s", err.Error())
	}
	defer stdout.Close()

	// get stderr
	stderr, err := cmd.StderrPipe()
	if err != nil {
		return fmt.Errorf("get stderr pipe failed: %s", err.Error())
	}
	defer stderr.Close()

	// start command
	if err := cmd.Start(); err != nil {
		return fmt.Errorf("start plugin failed: %s", err.Error())
	}

	// stdio
	r.stdioHolder = newStdioHolder(r.Config.Identity(), stdin, stdout, stderr, &StdioHolderConfig{
		StdoutBufferSize:    r.stdoutBufferSize,
		StdoutMaxBufferSize: r.stdoutMaxBufferSize,
	})
	defer r.stdioHolder.Stop()

	defer func() {
		// wait for plugin to exit
		originalErr := cmd.Wait()
		if originalErr != nil {
			var err error
			if r.stdioHolder != nil {
				stdioErr := r.stdioHolder.Error()
				if stdioErr != nil {
					err = errors.Join(originalErr, stdioErr)
				} else {
					err = originalErr
				}
			} else {
				err = originalErr
			}
			if err != nil {
				utils.Error("plugin %s exited with error: %s", r.Config.Identity(), err.Error())
			} else {
				utils.Error("plugin %s exited with unknown error", r.Config.Identity())
			}
		}

		r.gc()
	}()

	// ensure the plugin process is killed after the plugin exit
	defer cmd.Process.Kill()

	utils.Info("plugin %s started", r.Config.Identity())

	wg := sync.WaitGroup{}
	wg.Add(2)

	// listen to the plugin stdout
	utils.Submit(map[string]string{
		"module":   "plugin_manager",
		"type":     "local",
		"function": "StartStdout",
	}, func() {
		defer wg.Done()
		r.stdioHolder.StartStdout(func() {})
	})

	// listen to the plugin stderr
	utils.Submit(map[string]string{
		"module":   "plugin_manager",
		"type":     "local",
		"function": "StartStderr",
	}, func() {
		wg.Done()
		r.stdioHolder.StartStderr()
	})

	// send started event
	r.waitChanLock.Lock()
	for _, c := range r.waitStartChan {
		select {
		case c <- true:
		default:
		}
	}
	r.waitChanLock.Unlock()

	// wait for plugin to exit
	err = r.stdioHolder.Wait()
	if err != nil {
		return errors.Join(err, r.stdioHolder.Error())
	}

	wg.Wait()
	// plugin has exited
	return nil
}

// Wait returns a channel that will be closed when the plugin stops
func (r *LocalPluginRuntime) Wait() (<-chan bool, error) {
	if r.waitChan == nil {
		return nil, errors.New("plugin not started")
	}
	return r.waitChan, nil
}

// WaitStarted returns a channel that will receive true when the plugin starts
func (r *LocalPluginRuntime) WaitStarted() <-chan bool {
	c := make(chan bool)
	r.waitChanLock.Lock()
	r.waitStartChan = append(r.waitStartChan, c)
	r.waitChanLock.Unlock()
	return c
}

// WaitStopped returns a channel that will receive true when the plugins stops
func (r *LocalPluginRuntime) WaitStopped() <-chan bool {
	c := make(chan bool)
	r.waitChanLock.Lock()
	r.waitStopChan = append(r.waitStopChan, c)
	r.waitChanLock.Unlock()
	return c
}

// Stop stops the plugin
func (r *LocalPluginRuntime) Stop() {
	r.PluginRuntime.Stop()

	if r.stdioHolder != nil {
		r.stdioHolder.Stop()
	}
}

func (r *LocalPluginRuntime) Listen(sessionId string) *entities.Broadcast[plugin_entities.SessionMessage] {
	listener := entities.NewBroadcast[plugin_entities.SessionMessage]()
	listener.OnClose(func() {
		r.stdioHolder.removeEventListener(sessionId)
	})
	r.stdioHolder.setEventListener(sessionId, func(b []byte) {
		data, err := utils.UnmarshalJsonBytes[plugin_entities.SessionMessage](b)
		if err != nil {
			utils.Error("unmarshal json failed: %s, failed to parse session message", err.Error())
			return
		}
		listener.Send(data)
	})
	return listener
}

func (r *LocalPluginRuntime) Write(sessionId string, action access_types.PluginAccessAction, data []byte) {
	r.stdioHolder.write(append(data, '\n'))
}
