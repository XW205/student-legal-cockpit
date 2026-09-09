# 法护启航 · UI 界面设计说明（v2.1 政务 / 公益风格）

> 项目：法护启航——AI 赋能大学生全周期法律风险防护平台（面向昆明呈贡大学城大学生）
> 本次改动范围：`index.html`（结构重排为 7 个页面）、`styles.css`（全新设计系统）、`app.js`（**未改动**，全部功能逻辑保留）；新增本文档。
> 运行方式：直接双击 `index.html`，或拖入 Chrome / Edge；在线版已部署 GitHub Pages。

---

## 0. 一页看懂：7 页面信息架构

| 导航 | 内部 page id | 页面定位 | 主要模块 |
|---|---|---|---|
| 首页 | `page-home` | 项目介绍 + 功能总入口 | Hero（简介 + 搜索）· 项目简介 · 6 张核心功能卡 · 高频场景直达 · 3 张风险科普卡 |
| AI 风险测评 | `page-quiz` | 问卷表单 + 风险画像 | 20 题问卷（进度条）· 风险等级结果 · 5 大领域风险画像 chips · 等级说明 |
| AI 合同审查 | `page-review` | 上传 / 扫描 / 报告 | 上传区 + 粘贴区 · 扫描动画 · 失败页 · 评分报告 / 风险筛选 / 导出 |
| 维权导航 | `page-ai` | 问答交互界面 | 场景入口列表 · 对话视图（AI 法律助手“法小航”）· 快捷追问 · 法律依据折叠卡 |
| 证据急救 | `page-rights` | 证据清单 + 时间轴 | 本机档案登录 · 证据清单 · 一键证据链 / 时间轴 · 法援通道 |
| 线下法律服务地图 | `page-map` | 可交互地图点位 | 指标条 · 交互式片区点位地图 · 类型筛选 / 热力 / 刷新 · 右侧详情面板 |
| 关于我们 | `page-about` | 调研介绍 + 团队 | 项目背景 · 调研发现 · 服务模式 · 团队分工 · 合规声明 |

> 说明：为最大程度复用已验证的功能逻辑，`page-ai`（AI 问答）承担“维权导航——问答交互界面”职责，地图点位点击后即展示该片区的类型构成、典型案例与**维权指引**，符合“线下法律服务地图”的交互定位。后续如需把点位切换为纯机构点位（高校法援中心 / 调解室 / 仲裁 / 法院），只需替换 JS 中的 `MAP_DATA` 与 `TYPE_META`。

---

## 1. 配色规范（稳重柔和 · 蓝紫色系 · 适配法律公益）

设计令牌集中在 `styles.css` 的 `:root`，全站通过 CSS 变量引用，后续换肤只改这一处。

| 令牌 | 色值 | 用途 |
|---|---|---|
| `--brand` / `--brand-600` | `#4338CA` / `#4F46E5` | 主色（靛蓝）：按钮、链接、激活态、图标 |
| `--brand-deep` | `#2C2A7D` | 深藏蓝：标题、正文强调、Hero 深底 |
| `--violet` | `#6D5AE0` | 辅色（紫）：主渐变收尾色，克制点缀 |
| `--grad` | 120° 靛蓝→紫渐变 | 主 CTA / 重点卡 / 状态底 |
| `--bg` | `#F4F5FA` | 页面浅底（灰蓝，低饱和） |
| `--card` | `#FFFFFF` | 卡片 / 内容面 |
| `--ink` | `#1C2440` | 正文主色（深藏蓝，非纯黑，更柔和） |
| `--slate` / `--muted` | `#525D78` / `#8A93AD` | 次级文字 / 弱文字 |
| `--line` | `#E4E7F1` | 分割线 / 描边 |
| `--high / --mid / --low` | `#DC2626 / #D97706 / #059669` | 风险语义色（红 / 黄 / 绿），仅用于风险等级与告警 |
| 语义浅底 | `--high-soft / --mid-soft / --low-soft` | 风险标签、状态 chip 底色 |

使用规则：大面积只用浅灰蓝底 + 白卡 + 深藏蓝文字；品牌色仅用于主操作、导航激活、重点卡图标与渐变 Hero；**禁止**霓虹渐变、多彩装饰与卡通插画。

## 2. 字体规范

- 字体栈：`PingFang SC / Hiragino Sans GB / Microsoft YaHei / Noto Sans CJK SC / Segoe UI / system-ui`（不依赖网络字体，双击即用；如需更正式的标题字形可另行引入思源宋体做展示标题，需保持离线降级）。
- 字号层级：Hero 大标题 52px（移动 36px）→ 页面 H2 26px → 卡片标题 15–17px → 正文 13.5–15px → 辅助说明 11–12.5px。
- 字重：标题 700–900，正文 400；行高正文 1.7–2.0（中文阅读友好）。
- 数字 / 指标用大号字重 900 突出，如 Hero 指标、评分、统计卡。

## 3. 页面排版说明

统一采用「居中容器 `.wrap`（最大 1180px）+ 顶部吸顶导航 + 卡片网格 + 页脚」的网站式布局（区别于旧版 App 式底部导航）：

- **顶部导航**：桌面端为横向 7 项导航 + 品牌 + “公益演示”标识；移动端折叠为抽屉菜单（汉堡按钮），导航项复用 `.nav-item`，由 `showPage()` 统一高亮。
- **Hero**：首页与各功能页顶部使用低饱和靛蓝→紫渐变 + 细网格纹理 + 大标题，克制无动画；只有关键元素（雷达扫描、输入中气泡、点位脉冲）保留轻量动效。
- **卡片**：白底、圆角 16–20px、弱阴影（`--shadow` 系列），信息分区使用 `.card` / `.mod-card` / `.know-card` 等。
- **图表**：不引入图表库——合同报告用 SVG 圆环评分（`gauge`）、地图用类型占比条（`type-bar`）+ 侧栏条形分布（`.mbar`），测评结果用进度条 + chips，全部为原生实现、离线可用。
- **表单**：统一输入框 / 下拉 / 文本域样式（`.fm`、`.rl-field`、`#contractText` 等），聚焦描边为品牌色。
- **响应式断点**：≤960px 导航折叠 + 双栏变单栏；≤640px 移动端单栏 + 卡片堆叠 + 地图高度压缩；含 `prefers-reduced-motion` 支持。

---

## 4. 页面交互逻辑标注（供后续开发）

> app.js 全量逻辑未改动，以下为**页面 → 关键元素 → 事件 → 处理函数**对照，便于二次开发定位。

### 通用
- 导航切换：任意 `.nav-item[data-page]` 点击 → `showPage(id)`（唯一页面切换入口，负责激活 `.page`、同步导航高亮、滚动到顶）。
- 跨页跳转：任意 `[data-nav]` 元素（首页功能卡、科普卡、地图“咨询 AI”等）→ 文档级事件委托；若目标是 `page-ai` 且带 `data-q` 则直接 `askAI(问题)` 进入对话。

### ① 首页（page-home）
| 元素 | 事件 | 行为 |
|---|---|---|
| `#homeSearch` / `#homeInput` | submit | `askAI(输入)` → 跳维权导航并提问 |
| `.hot-tag[data-q]` | click | 填充问题并 `askAI` |
| `#quizStart`（测评页内） | click | 进入 / 重测问卷 |
| 功能卡 / 场景按钮 `[data-nav]` | click | 跨页跳转 |

### ② AI 风险测评（page-quiz）
| 元素 | 事件 | 行为 |
|---|---|---|
| `#quizStart` / `#qrAgain` | click | `quizReset()` 初始化进度、分数、分领域得分 |
| `#quizOpts .quiz-opt`（JS 生成） | click | 累加分数 → 下一题 / `showQuizResult()` |
| `#quizBar` / `#quizStep` | 渲染 | 进度条 + “题目 n / 20 · 领域” |
| `#qrDim`（JS 生成 `.qd-chip`） | — | 5 大领域风险高低 chips（颜色由 `quizRiskColor` 决定） |
| `#qrAi` | click | 跳维权导航咨询 |

### ③ AI 合同审查（page-review）
| 元素 | 事件 | 行为 |
|---|---|---|
| `#uploadZone` | click / dragover / drop | `pickFiles` → `setFile`（本地抽文：TXT 直读；PDF/Word/图片按需 CDN 加载解析库） |
| `#scanBtn`（文件） / `#txtScanBtn`（粘贴） | click | `startScan()`：进入扫描动画 |
| `#fillSampleBtn` | click | 填入示例租房合同 |
| `#stage-scan .scan-step` | — | `setStep(i, doing/done)` 逐步点亮；`#scanBar` 进度 |
| 失败页 `#failRetryBtn / #failEditBtn / #failDemoBtn` | click | 重试 / 返回修改 / 查看离线演示报告 |
| 报告区 | — | `#gaugeBar` SVG 圆环动画 + `#scoreNum` 数字滚动 → `#riskList` 风险卡（点击头部展开 `reason/fix/law`）→ `.f-btn` 按等级筛选 → `#lowBlock` 低风险折叠 → `#exportBtn` 导出 TXT |
| `#reportAiBtn` | click | 带着报告语境咨询 AI |

### ④ 维权导航（page-ai）
| 元素 | 事件 | 行为 |
|---|---|---|
| `.qa-card[data-key]` | click | `openChat(key)`：隐藏场景列表、进入对话 |
| `#chatForm` / `#chatInput` | submit | 离线模式 `botReply`；云端模式 `askModel` |
| `#chatSuggests .cs-chip`（JS 生成） | click | 快捷追问 / 返回问题列表 |
| `#chatBack` | click | `backToList()` |
| `#chatClear` | click | 清空对话并中断进行中请求 |
| `#aiSetBtn` | click | 打开 AI 接入弹窗（离线演示 ⇄ DeepSeek 双模式） |
| 回答气泡 | — | `renderMd` Markdown 渲染；命中法条引用自动追加可折叠「法律依据」卡（`LAW_DB`） |

### ⑤ 证据急救（page-rights）
| 元素 | 事件 | 行为 |
|---|---|---|
| `#rlTabLogin / #rlTabReg` | click | 登录 / 注册视图切换（`.rl-form` grid 显示） |
| `#rlRegBtn / #rlLoginBtn / #pfLogoutBtn` | click | 本机档案 注册/登录/退出（localStorage，`rlApplyState` 控制 `#rightsLogin` 与 `#rightsContent` 显隐） |
| `#evAddBtn` → `#evFiles` | change | 选文件（≤2MB 校验）→ `showEvForm()` 待保存清单（`.ev-pi` 可移除） |
| `#evSaveBtn` | click | Base64 存入 localStorage（`#evCount` 更新）→ `renderEvList` |
| `.ev-mini`（JS 生成） | click | 打开 / 下载、删除单份证据 |
| `#evChainBtn` | click | `evChainRender()`：完整度 + 覆盖 tags + 时间轴（`.chain-step`）+ 叙述 + 缺失提示 |
| `#evExportTxtBtn` | click | 导出证据链 TXT |
| `#callBtn` / `#clinicBtn` | click | 演示提示（12348 / 附近法援点；后者同时可跳服务地图） |

### ⑥ 线下法律服务地图（page-map）
| 元素 | 事件 | 行为 |
|---|---|---|
| `.t-chip[data-t]` | click | 类型筛选 → `renderMapAll()` |
| `.pin-node`（JS 生成） | click | `selectPin(id)`：热力重算 + 点位高亮 + `renderPinDetail(id)` |
| `#detailPanel` | — | 总览：类型占比条形图（`.mbar`）+ Top3 片区（`.rank-row`）；详情：指标格 + 类型构成 + 典型案例 + 维权指引 + “咨询 AI / 附近法援点” |
| `#heatBtn` | click | 热力层开关 |
| `#refreshBtn` | click | `refreshData()` 模拟实时刷新 |
| `#typeBar` / `#tbLegend` | — | 类型占比条与图例 |

### ⑦ 关于我们（page-about）
纯静态内容区（背景 / 调研 / 服务模式 / 团队 / 声明），无 JS 依赖，文案建议在正式答辩前替换为真实调研报告结论。

---

## 5. MCP / Skill 插件加载说明

### 5.1 本次实现说明（诚实声明）
在当前运行环境中，`list_mcp_resources` 未返回任何已连接的 UI / 组件 / 图标 MCP 资源服务器，因此本次 UI **未虚构加载插件**：图标采用**内联 SVG Sprite**（`index.html` 顶部 `<symbol>` 库，约 30 个线性图标），字体采用系统字体栈，图表为原生 HTML/CSS/SVG——**零运行期网络依赖、双击离线可用**，同时满足“禁止简陋 demo、专业质感”的要求。

### 5.2 推荐加载的 MCP / Skill（联网增强方案，供后续接入）
接入方法（Codex 桌面端）：在设置 / 插件市场安装对应 MCP 服务器并启用，随后在本任务会话中即可通过工具调用；命令行方式示例：

```bash
# 通用：将 MCP 服务器加入 Codex 配置
codex mcp add <server-name> -- <启动命令>     # 之后在本会话内可直接调用该 MCP 工具
codex mcp list                                 # 查看已连接服务器
```

| 用途 | 推荐 MCP / Skill | 调用目的 |
|---|---|---|
| 图标素材 | Lucide / Iconify 类 MCP（如 `lucide-mcp`、图标查询 MCP） | 拉取高质量开源线性图标并生成 SVG 替换当前 Sprite |
| 前端组件 | 组件库 MCP（如 Tailwind UI / shadcn 相关 Skill、`mcp-ui-components`） | 生成卡片、按钮、表单等可访问组件片段 |
| 配色 / 设计令牌 | 设计资源 MCP（Figma 桥接类 `@figma/mcp`、`design-tokens` 类） | 对齐官方 VI / 设计稿取色 |
| 图表 | ECharts / Chart.js Skill 或 CDN | 若需更复杂统计图（风险趋势、雷达画像），可增量引入并保留离线降级 |
| 网页截图验证 | 浏览器自动化 Skill（Playwright / Puppeteer） | 自动截图校验桌面 + 移动端效果 |

> 注意事项：引入第三方 CDN（图标字体、图表库、字体）时必须保留**加载失败降级**（本项目现有模式：`marked` 失败回退纯文本、PDF 解析库按需加载），保证断网双击仍可用；不要因此破坏“零构建、三件套”的仓库约定。

---

## 6. 数据接入点（后续开发提示）

| 数据 | 位置（app.js） | 说明 |
|---|---|---|
| 测评题库 / 领域 | `QUIZ` / `QUIZ_DIMS` | 替换题库即可更新测评 |
| AI 场景 / 离线答案 | `SCEN` / `offlineAnswer` / `fallbackAns` | 维权导航离线演示语料 |
| 法条库 | `LAW_DB` | 聊天“法律依据”卡数据源 |
| 合同风险示例 | `RISK` / `LOW_TIPS` / `SAMPLE_CONTRACT` | 离线演示报告数据 |
| 地图点位 | `MAP_DATA` / `TYPE_META` | **接真实数据只需替换此处**（含机构服务点位字段扩展） |
| 证据 / 档案 | localStorage `fahq_*` | 前端原型存储；正式版改 IndexedDB + 服务端 |
| AI 模型 | 设置弹窗（DeepSeek OpenAI 兼容接口） | Key 仅存本机，不入库 |

---

## 7. 本次改动自检清单

- [x] 7 个导航页面均可切换，无 JS 报错（app.js 未改动，DOM id 契约校验通过：185 个 id 无重复、app.js 引用 id 全部存在）
- [x] 配色切换为蓝紫政务/公益风格；无卡通插画、无过度动画
- [x] 桌面端顶部导航 + 移动端抽屉菜单；网格卡片布局响应式
- [x] 原有全部功能保留：20 题测评、AI 问答（离线 / DeepSeek）、合同上传 / 扫描 / 报告 / 导出、证据清单 / 证据链 / 时间轴、地图点位交互、12348 指引