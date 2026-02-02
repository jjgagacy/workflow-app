# Monie插件

## 创建插件步骤

创建项目文件夹并进入

```bash
mkdir my-ts-project
cd my-ts-project
```

初始化 npm 项目

```bash
npm init -y
```

安装 TypeScript（作为开发依赖）

```bash
npm install typescript --save-dev
# 或者简写：
npm i -D typescript
```

初始化 TypeScript 配置

```bash
npx tsc --init
```

这会在项目根目录生成 tsconfig.json 文件。

添加开发依赖（推荐）

```bash
# 安装 Node.js 类型定义（如果项目运行在 Node.js 环境）
npm i -D @types/node
# 安装 ts-node 用于直接运行 TypeScript
npm i -D ts-node
# 安装 nodemon 用于开发时自动重启
npm i -D nodemon
```

配置 package.json scripts

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "nodemon --exec ts-node src/index.ts",
    "watch": "tsc --watch"
  }
}
```

运行项目

```bash
# 编译 TypeScript
npm run build

# 运行编译后的 JavaScript
npm start

# 开发模式（使用 ts-node 直接运行）
npm run dev

# 监听文件变化并自动编译
npm run watch
```


在 package.json 文件，添加 monie-plugin 依赖

```json
"dependencies": {
    "monie-plugin": "file:../../sdk/node/monie-plugin"
}
```

更新依赖

```bash
npm install
```
