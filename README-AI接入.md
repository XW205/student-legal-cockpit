# 法护启航 · 接入「夫子·明察」司法大模型说明

> 目标：让网页 AI 助手中“保证能回答不同的法律问题”的答案来自
> **山东大学 irlab-sdu 开源的夫子·明察司法大模型**（`SDUIRLab/fuzi-mingcha-v1_0`，
> ChatGLM-6B 底座微调的中文司法大模型，支持法律问答/法条引用/案例分析）。

## 一、架构

```
浏览器 index.html（AI 助手页）
   │  点击 ⚙️ 设置 → 选择「夫子·明察（本地模型）」
   ▼
http://127.0.0.1:8001/v1/chat/completions   （本项目 FastAPI 代理，已开 CORS）
   ▼
http://127.0.0.1:8000/v1/chat/completions   （vLLM OpenAI 兼容服务，加载模型权重）
```

- 前端默认填写的服务地址是 `http://127.0.0.1:8001/v1`（代理）。
- 也可以**直连 vLLM**：设置地址填 `http://127.0.0.1:8000/v1`，但需给 vLLM 加
  `--allowed-origins "*"` 或 `--allowed-origins "null"`（用浏览器直接打开本地文件时）才能跨域。
- 未连接模型服务时，页面自动回退到**离线演示回答**，演示不会中断。

## 二、环境要求

- 一台带 **NVIDIA GPU（显存 ≥ 16GB，建议 24GB）** 的电脑（模型约 13GB FP16）；
- Python 3.10+、pip、CUDA 环境；
- 建议使用 vLLM 提供服务（HF 官方页也推荐 vLLM）。

## 三、部署步骤（以 vLLM 为例）

### 1. 下载模型权重（约 13GB，二选一）
```bash
# HuggingFace
pip install -U huggingface_hub
huggingface-cli download SDUIRLab/fuzi-mingcha-v1_0 --local-dir models/fuzi-mingcha-v1_0

# 或魔搭（国内更快）
pip install -U modelscope
modelscope download --model furyton/fuzi-mingcha-v1_0 --local_dir models/fuzi-mingcha-v1_0
```

### 2. 启动 vLLM（OpenAI 兼容服务，默认端口 8000）
```bash
pip install -U vllm
# 方式 A：直接使用 HF 仓库名（需联网拉权重）
vllm serve SDUIRLab/fuzi-mingcha-v1_0 \
  --served-model-name fuzi-mingcha-v1_0 \
  --port 8000 --max-model-len 8192 --gpu-memory-utilization 0.9

# 方式 B：使用已下载到本地的权重
vllm serve ./models/fuzi-mingcha-v1_0 \
  --served-model-name fuzi-mingcha-v1_0 \
  --port 8000 --max-model-len 8192 --gpu-memory-utilization 0.9
```
验证：浏览器打开 `http://127.0.0.1:8000/v1/models`，应能看到模型列表。

### 3. 启动本项目代理（处理跨域，端口 8001）
```bash
pip install -r backend/requirements.txt
python backend/fuzi_proxy.py
```
看到日志 `法护启航代理启动： http://127.0.0.1:8001/v1` 即成功。

### 4. 在网页中启用
1. 双击打开 `index.html`；
2. 进入「AI 助手」→ 点右上角 ⚙️；
3. 模式选 **🎓 夫子·明察（本地模型）**；
4. 服务地址保持 `http://127.0.0.1:8001/v1`（或直连 vLLM 的 8000 地址）；
5. 模型名称 `fuzi-mingcha-v1_0`；
6. 点 **🔌 测试连接** → 显示绿色“已连接”；
7. 点 **💾 保存并应用**，回到对话即可向模型自由提问任何法律问题。

> 说明：前端会把“系统提示（法小航角色/引用法条/分步骤/免责声明）+
> 多轮对话历史”发给模型；模型回答会直接展示在对话气泡中。

## 四、不同法律问题覆盖

- **在线（模型模式）**：任意法律问题 → 夫子·明察直接生成回答（租房、兼职欠薪、合同、
  消费退费、人身侵权、网络侵权、校园贷等均可）；
- **离线（演示模式）**：内置 6 大高频场景 + 8 类关键词分类兜底回答，
  保证没有模型服务时也能演示“回答不同法律问题”，但内容为演示文案。

## 五、常见问题排查

| 现象 | 原因与处理 |
| --- | --- |
| 测试连接 ❌ 连接失败 | 代理/vLLM 未启动；地址端口不对；先分别访问 `/health` 与 `:8000/v1/models` 验证 |
| HTTP 400 Bad Request | 模型名称与 vLLM 启动参数 `--served-model-name` 不一致；或 `max_tokens` 超出 `--max-model-len` |
| CORS 报错 | 直连 vLLM 时需加 `--allowed-origins "*"`；建议直接用本项目代理（已开 CORS） |
| 显存不足 OOM | 调小 `--gpu-memory-utilization`；或改用 4bit/8bit 量化加载 |
| 回答为空 | 模型仍在加载 / 上下文超长，缩短多轮历史或调大 `--max-model-len` |

## 六、合规与免责

- 仓库代码：Apache-2.0；**模型权重遵循 ChatGLM-6B Model License**；
  官方声明夫子·明察**仅供学术研究使用，不得用于商业用途**。
- 页面/回答均标注“仅供参考，不构成法律意见”；重大事项请咨询执业律师或拨打 12348。
- 若无法本地部署 GPU 模型，可仅用离线演示模式完成答辩展示，再把“已预留真实模型接入”
  作为架构亮点说明。