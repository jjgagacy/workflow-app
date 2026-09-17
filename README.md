Monie is a full-stack large model workflow platform for developing 
LLM applications.

# System requirements

Your system should meets the following minimum requirements:

- CPU >= 2 Core
- RAM >= 4 GiB

# Features

1. Workflow
2. Comprehensive model support
3. RAG Pipeline
4. Agent capabilities
5. Backend as a service

# Using Monie

- Cloud
- Self-hosting
- Enterprise custom

# 脚本

下面的命令更新插件目录所有的manifest到api
```bash
./dev/sync-plugins-declaration
```

api核心需要所有插件的 manifest 显示在插件市场（这里是否放在plugin的的配置里面？）

# 插件命令

## plugin同步必要的插件到插件目录

切换到 plugin 目录，执行命令

```bash
go run cmd/main.go package sync-packages [plugins_dir] [package_root]
```

默认他会同步 "../monie-plugins/*" 下的所有的插件到 plugin 的 PLUGIN_PACKAGE_CACHE_PATH 目录，格式为
*author/name:version*，例如 organization 是 monyii 的所有插件都在 monyii 目录中。这样当用户安装的时候
如果插件工作目录中没有正在运行的插件，就会从这里找到并运行，然后在 PLUGIN_INSTALLED_PATH 目录里。

## 清除插件运行目录所有的插件

```bash
go run cmd/main.go plugin clear cwd
```

## 启动立即运行插件，执行

```bash
go run cmd/deploy/main.go
```

插件目录 "monie-plugins" 的所有插件打包复制到 PLUGIN_INSTALLED_PATH 目录，这样 plugin daemon启动的时候会从这个目录找到所有的插件运行。

## 调试插件步骤

首先开启 plugin daemon 

```bash
cd plugin
go run main.go
```

比如调试插件 ./monie-plugins/hello 
```bash
cd ./monie-plugins/hello 
npm run watch
node dist/index.js # 执行插件
```

如果同步要修改插件sdk 需要同步运行 watch
```bash
cd ./sdk/node/monie-plugin
npm run watch
```

# Contact

# Todo

- `getPluginDeclarationsUseCache()` 方法如果新增了模型，怎么更新缓存？



