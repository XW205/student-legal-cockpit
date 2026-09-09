# MCP / Skill 插件说明与调用方式（法护启航 UI 改版）

## 一、本环境实际可用的工具（MCP / Skill）
| 名称 | 类型 | 用途 | 本改版是否使用 |
| --- | --- | --- | --- |
| OpenAI Artifact Template Picker | MCP | 文档/演示文稿/表格模板选择 | 未用于网页 UI（面向 Office/Google 文档） |
| imagegen | Skill | 位图生成/编辑 | 未使用：本项目视觉以原生 CSS/SVG/Canvas 实现，避免引入位图素材体积 |
| 浏览器自动化（Playwright） | 内置 | 端到端验证页面与交互 | 已用于 7 页导航/测评/清单回归测试 |

> 说明：当前会话的 MCP 服务中没有可直接“联网下载安装”的网页 UI 设计 / 前端组件库 / 图标库 MCP 插件（artifacts 工具面向文档表格）。因此本改版采用**原生 HTML+CSS+JS + 系统图标/Unicode 符号**落地，效果等效专业 Web UI；如需进一步接入第三方 MCP 插件，见下方清单与接入步骤（需在目标环境的 MCP 配置中安装）。

## 二、推荐的 MCP/Skill 插件（可按需接入）
| 插件/技能 | 作用 | 下载/调用方式（示例） |
| --- | --- | --- |
| 网页设计 MCP（如 `web-design-mcp` / Figma 相关 MCP） | 生成页面线框/设计稿、读取 Figma 设计 token | `npx -y @your-scope/web-design-mcp`；或在 Codex MCP 配置中加 `{ "mcpServers": { "webdesign": { "command": "npx", "args": ["-y", "web-design-mcp"] } } }`，之后通过 `@webdesign` 调用 |
| 前端组件库生成（如 shadcn/ui / Mantine CLI / v0） | 直接产出可用组件源码 | `npx shadcn@latest add card button` 等（组件源码落地到项目）；MCP 包装见对应仓库 README |
| 图标素材 MCP / API（Iconify） | 按需取高质量线性图标 | 网页端 `<script src="https://code.iconify.design/3/3.1.0/iconify.min.js">` 或 MCP 中 `iconify.search("shield")`；本项目为避免联网依赖采用文本符号 |
| 配色/设计 token MCP | 生成品牌色板与可访问性校验 | 由社区工具提供（如 `design-tokens-mcp`），接入方式同上 |
| OpenArt / imagegen Skill（本环境已具备） | 项目主视觉/封面插图 | 本会话图片工具按需调用，未强制接入以保持单文件轻量 |

## 三、如何在 Codex 环境调用上述插件
1. 在 Codex 配置（或项目 `.codex/` 配置）的 MCP servers 中登记插件（command 用 `npx -y <package>`，注意联网）；
2. 重启/刷新后，对话中即可按 `@插件名` 或工具调用方式唤起；
3. 下载的高质量资源（组件源码、图标、色板）放入 `assets/` 或按组件目录落地，再从 index.html 引用。
4. 若用于本仓库开发分支 `ui/professional-redesign`，建议组件源码直接内联到 `index.html`（保持单文件可双击运行），图标使用 Iconify 按需抽取内联为 `<svg>`。

## 四、边界说明
- 本项目定位“演示原型 + 答辩”，优先保证单文件可运行、离线可用、数据本地化；
- 真实商用建议：接入设计 token 与组件库流水线、真实地图（GIS/高德）+ 真实服务点数据、后端存储与实名认证。