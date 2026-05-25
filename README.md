# LIVERMORE

利弗莫尔说是一个复古终端风格的 AI 对话应用。应用把模型回复包装成杰西·利弗莫尔的交易人格，用于围绕股票、趋势、关键点、资金管理和市场心理进行问答。

## 功能

- 利弗莫尔人格系统提示词
- 中文/英文界面切换
- 暗夜终端/复古账本主题
- 对话历史本地保存
- 用户消息编辑后重新生成
- 模型接入点配置
- 本地开发代理，避免浏览器直连时暴露 API Key
- VSCode 当前窗口内预览任务

## 技术栈

- React
- TypeScript
- Vite
- Tailwind CDN

## 默认模型配置

应用默认使用模型接入点模式：

```text
API 接入点:
https://ark.cn-beijing.volces.com/api/v3

模型接入点 ID:
ep-20251117012406-x4cpc
```

实际请求地址会自动拼接为：

```text
https://ark.cn-beijing.volces.com/api/v3/chat/completions
```

## 本地运行

需要 Node.js。

1. 安装依赖：

```bash
npm install
```

2. 创建 `.env.local`，写入 API Key：

```bash
ARK_API_KEY=your_api_key_here
```

3. 启动开发服务：

```bash
npm run dev
```

默认访问：

```text
http://localhost:3000/
```

## VSCode 预览

项目包含一个 VSCode 当前窗口预览任务：

```bash
npm run dev:vscode
```

它会启动 Vite，并在 VSCode 当前窗口中打开 `http://localhost:3000/`。

## 构建

```bash
npm run build
```

构建产物输出到 `dist/`。

## 部署说明

前端代码不会提交 `.env.local`，也不会把真实 API Key 写入仓库。

部署到 Vercel 时，需要在 Vercel 项目的环境变量中配置：

```text
ARK_API_KEY
```

注意：当前本地开发代理是 Vite dev server 中间件，主要用于本地预览。生产环境如果需要隐藏 API Key，应使用正式后端接口或 Vercel Serverless Function 转发模型请求。

## 安全注意事项

- 不要把 API Key 写入源码。
- 不要提交 `.env.local`。
- 浏览器端配置里的 API 密钥可以留空，本地开发会优先走代理。
- 如果更换模型，请填写模型接入点 ID，通常形如 `ep-...`；模型仓库 ID `cm-...` 不能直接调用。
