# 开发

修改代码后需要及时 build 或者 npm run dev 开启实时构建，这样 plugin 运行的插件才会读取最新的 monie-plugin 插件代码。

# tcpReaderWrite 生命周期

                  launch()
                     │
                     ▼
                connect()
                     │
             ┌───────┴────────┐
             │                │
           成功              失败
             │                │
             ▼                ▼
          alive=true      retry timer
             │                │
             │                ▼
             │             connect()
             │
       socket error
             │
             ▼
       等待 socket close
             │
             ▼
        alive=false
             │
             ▼
      scheduleReconnect()
             │
             ▼
        reconnectTimer
             │
             ▼
          connect()