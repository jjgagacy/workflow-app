package local_runtime

import (
	"bytes"
	"context"
	"fmt"
	"os"
	"os/exec"
	"path"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/jjgagacy/workflow-app/plugin/utils"
)

func (r *LocalPluginRuntime) InitNode() error {
	// TODO:

	return nil
}

func (r *LocalPluginRuntime) InitPython() error {
	// check if virtual environment exists
	if _, err := os.Stat(path.Join(r.State.WorkingPath, ".venv")); err == nil {
		// check if venv is valid
		if _, err := os.Stat(path.Join(r.State.WorkingPath, ".venv/plugin.json")); err != nil {
			// remove the venv and rebuild it
			os.RemoveAll(path.Join(r.State.WorkingPath, ".venv"))
		} else {
			pythonPath, err := filepath.Abs(path.Join(r.State.WorkingPath, ".venv/bin/python"))
			if err != nil {
				return fmt.Errorf("failed to find python: %s", err)
			}
			r.pythonInterpreterPath = pythonPath
		}
	}

	success := false

	var uvPath string
	if r.uvPath != "" {
		uvPath = r.uvPath
	} else {
		cmd := exec.Command(r.defaultPythonInterpreterPath, "-c", "from uv._find_uv import find_uv_bin; print(find_uv_bin())")
		cmd.Dir = r.State.WorkingPath
		output, err := cmd.Output()
		if err != nil {
			return fmt.Errorf("failed to find uv path: %s", err)
		}
		uvPath = strings.TrimSpace(string(output))
	}

	cmd := exec.Command(uvPath, "venv", ".venv", "--python", "3.12")
	cmd.Dir = r.State.WorkingPath
	b := bytes.NewBuffer(nil)
	cmd.Stdout = b
	cmd.Stderr = b
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("failed to created virtual environment: %s, ouput: %s", err, b.String())
	}

	defer func() {
		if !success {
			os.RemoveAll(path.Join(r.State.WorkingPath, ".venv"))
		} else {
			pluginJsonPath := path.Join(r.State.WorkingPath, ".venv/plugin.json")
			os.MkdirAll(path.Dir(pluginJsonPath), 0755)
			os.WriteFile(pluginJsonPath, []byte(`{"timestamp":`+strconv.FormatInt(time.Now().Unix(), 10)+`}`), 0644)
		}
	}()

	pythonPath, err := filepath.Abs(path.Join(r.State.WorkingPath, ".venv/bin/python"))
	if err != nil {
		return fmt.Errorf("failed to find python: %s", err)
	}

	if _, err := os.Stat(pythonPath); err != nil {
		return fmt.Errorf("failed to find python: %s", err)
	}

	r.pythonInterpreterPath = pythonPath

	// try to find requirements.txt
	requirementsPath := path.Join(r.State.WorkingPath, "requiredments.txt")
	if _, err := os.Stat(requirementsPath); err != nil {
		return fmt.Errorf("failed to find requirements.txt: %s", err)
	}

	// install dependencies
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Minute)
	defer cancel()

	args := []string{"install"}

	if r.pipMirrorUrl != "" {
		args = append(args, "-i", r.pipMirrorUrl)
	}

	args = append(args, "-r", "requirements.txt")

	if r.pipVerbose {
		args = append(args, "-vvv")
	}

	if r.pipExtraArgs != "" {
		args = append(args, strings.Split(r.pipExtraArgs, " ")...)
	}

	args = append([]string{"pip"}, args...)

	virtualEnvPath := path.Join(r.State.WorkingPath, ".venv")
	cmd = exec.CommandContext(ctx, uvPath, args...)
	cmd.Env = append(cmd.Env, "VIRTUAL_ENV="+virtualEnvPath, "PATH="+os.Getenv("PATH"))
	if r.HttpProxy != "" {
		cmd.Env = append(cmd.Env, fmt.Sprintf("HTTP_PROXY=%s", r.HttpProxy))
	}
	if r.HttpsProxy != "" {
		cmd.Env = append(cmd.Env, fmt.Sprintf("HTTPS_PROXY=%s", r.HttpsProxy))
	}
	if r.NoProxy != "" {
		cmd.Env = append(cmd.Env, fmt.Sprintf("NO_PROXY=%s", r.NoProxy))
	}
	cmd.Dir = r.State.WorkingPath

	// get stdout and stderr
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return fmt.Errorf("failed to get stdout: %s", err)
	}
	defer stdout.Close()

	stderr, err := cmd.StderrPipe()
	if err != nil {
		return fmt.Errorf("failed to get stderr: %s", err)
	}
	defer stderr.Close()

	// start command
	if err := cmd.Start(); err != nil {
		return fmt.Errorf("failed to start command: %s", err)
	}
	defer func() {
		if cmd.Process != nil {
			cmd.Process.Kill()
		}
	}()

	var errMsg strings.Builder
	var wg sync.WaitGroup
	wg.Add(2)

	lastActiveAt := time.Now()

	utils.Submit(map[string]string{
		"module":   "plugin_manager",
		"function": "InitPython",
	}, func() {
		defer wg.Done()
		// read stdout
		buf := make([]byte, 1024)
		for {
			n, err := stdout.Read(buf)
			if err != nil {
				break
			}
			utils.Info("installing %s - %s", r.Config.Identity(), string(buf[:n]))
			lastActiveAt = time.Now()
		}
	})

	utils.Submit(map[string]string{
		"module":   "plugin_manager",
		"function": "InitPython",
	}, func() {
		defer wg.Done()
		// read stderr
		buf := make([]byte, 1024)
		for {
			n, err := stderr.Read(buf)
			if err != nil && err != os.ErrClosed {
				lastActiveAt = time.Now()
				errMsg.WriteString(string(buf[:n]))
				break
			} else if err == os.ErrClosed {
				break
			}

			if n > 0 {
				errMsg.WriteString(string(buf[:n]))
				lastActiveAt = time.Now()
			}
		}
	})

	utils.Submit(map[string]string{
		"module":   "plugin_manager",
		"function": "InitPython",
	}, func() {
		ticker := time.NewTicker(5 * time.Second)
		defer ticker.Stop()

		for range ticker.C {
			if cmd.ProcessState != nil && cmd.ProcessState.Exited() {
				break
			}

			if time.Since(lastActiveAt) > time.Duration(r.pythonEnvInitTimeout)*time.Second {
				cmd.Process.Kill()
				errMsg.WriteString(fmt.Sprintf("init process exited due to no activity for %d seconds", r.pythonEnvInitTimeout))
				break
			}
		}
	})

	wg.Wait()

	if err := cmd.Wait(); err != nil {
		return fmt.Errorf("failed to install dependencies: %s, output: %s", err, errMsg.String())
	}

	compileArgs := []string{"-m", "compileall"}
	if r.pythonCompileExtraArgs != "" {
		compileArgs = append(compileArgs, strings.Split(r.pythonCompileExtraArgs, " ")...)
	}
	compileArgs = append(compileArgs, ".")

	// pre-compile the plugin to avoid costly compilation on first invocation
	compileCmd := exec.CommandContext(ctx, pythonPath, compileArgs...)
	compileCmd.Dir = r.State.WorkingPath

	// get stdout and stderr
	compileStdout, err := compileCmd.StdoutPipe()
	if err != nil {
		return fmt.Errorf("failed to get stdout: %s", err)
	}
	defer compileStdout.Close()

	compileStderr, err := compileCmd.StderrPipe()
	if err != nil {
		return fmt.Errorf("failed to get stderr: %s", err)
	}
	defer compileStderr.Close()

	// start command
	if err := compileCmd.Start(); err != nil {
		return fmt.Errorf("failed to start command: %s", err)
	}
	defer func() {
		if compileCmd.Process != nil {
			compileCmd.Process.Kill()
		}
	}()

	var cErrMsg strings.Builder
	var cWg sync.WaitGroup
	cWg.Add(2)

	utils.Submit(map[string]string{
		"module":   "plugin_manager",
		"function": "InitPython",
	}, func() {
		defer cWg.Done()

		for {
			buf := make([]byte, 1024)
			n, err := compileStdout.Read(buf)
			if err != nil {
				break
			}
			lines := strings.Split(string(buf[:n]), "\n")
			for len(lines) > 0 && len(lines[0]) == 0 {
				lines = lines[1:]
			}

			if len(lines) > 0 {
				if len(lines) > 1 {
					utils.Info("pre-compiling %s - %s...", r.Config.Identity(), lines[0])
				} else {
					utils.Info("pre-compiling %s - %s", r.Config.Identity(), lines[0])
				}
			}
		}
	})

	utils.Submit(map[string]string{
		"module":   "plugin_manager",
		"function": "InitPython",
	}, func() {
		defer cWg.Done()
		buf := make([]byte, 1024)
		for {
			n, err := compileStderr.Read(buf)
			if err != nil {
				break
			}
			cErrMsg.WriteString(string(buf[:n]))
		}
	})

	cWg.Wait()
	if err := compileCmd.Wait(); err != nil {
		utils.Warn("failed to pre-compile the plugin: %s", cErrMsg.String())
	}

	utils.Info("pre-loaded the plugin %s", r.Config.Identity())

	success = true

	return nil
}
