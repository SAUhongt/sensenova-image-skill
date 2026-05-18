---
name: sensenova-image
description: 图像生成与理解 — 使用商汤 SenseNova 平台生成信息图（U1 Fast）和理解图片内容（VL 模型）。当用户要求生成信息图、海报、数据可视化图，或需要描述、分析、识别图片内容时使用此 skill。触发词包括：生成图片、信息图、海报、生图、识图、描述图片、图片里有什么、分析图片、generate image、infographic、describe image。
---

# SenseNova Image

## 概述

通过商汤 SenseNova API 实现两个核心能力：
1. **图像生成** — 使用 U1 Fast 模型将文字描述转化为信息图
2. **图像理解** — 使用 VL 模型描述和分析图片内容

两个能力共用同一 API 基地址和认证密钥。首次使用前需配置 API Key。

## 初次配置

在执行任何生图或识图操作前，必须先检查 `SENSENOVA_API_KEY` 环境变量是否已设置。

### 检查方式

```bash
# PowerShell
$env:SENSENOVA_API_KEY

# Bash
echo $SENSENOVA_API_KEY
```

### 若未配置

引导用户按以下步骤操作：

1. 访问 https://www.sensenova.cn/ 获取 API Key
2. 在 Claude Code 中运行：

```
/update-config set SENSENOVA_API_KEY=<用户的key>
```

这会自动写入 `~/.claude/settings.json` 中的 `env` 配置，之后 skill 脚本可自动读取。

### 脚本行为

若 `SENSENOVA_API_KEY` 未设置，脚本会自动终止并打印配置指引，不会发送任何请求。

## 能力一：图像生成

当用户要求生成信息图、海报、或任何基于文字描述的视觉内容时，使用此能力。

### 触发场景

- "帮我生成一张信息图"
- "把这段文字做成海报"
- "生成一张关于 XX 的图"
- "帮我做一个数据可视化图"

### 工作流程

1. **收集需求**：如果用户只给了原始数据/文字而非完整 prompt，先与用户确认：
   - 主题和核心信息
   - 配色偏好（可选）
   - 风格偏好（卡通/商务/科技感，可选）
   - 尺寸/比例（可选，默认 16:9）

2. **构建 Prompt**：根据用户需求，编排结构化的图像描述 prompt，包含：
   - 整体布局（分栏、分区）
   - 配色方案
   - 视觉风格
   - 所有文字内容（标题、标签、数据等）
   - 图标/插图风格

3. **调用生成脚本**：

```bash
node scripts/generate_image.js --prompt "<完整的图像描述>"
```

指定尺寸：
```bash
node scripts/generate_image.js --prompt "<描述>" --size 2048x2048
```

从文件读取 prompt：
```bash
node scripts/generate_image.js --file prompt.txt
```

4. **返回结果**：脚本输出 JSON，其中 `data[0].url` 是生成的图片链接。将 URL 展示给用户。

### 生成脚本参数

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `--prompt <text>` | 图像描述文本 | — |
| `--file <path>` | 从文件读取 prompt | — |
| `--size <WxH>` | 图像尺寸 | 2752x1536 |
| `--n <num>` | 生成数量 | 1 |

### 常用尺寸速查

| 尺寸 | 比例 | 场景 |
|------|------|------|
| 2752x1536 | 16:9 | 宽屏/默认 |
| 2048x2048 | 1:1 | 方形 |
| 1536x2752 | 9:16 | 手机竖屏 |
| 1664x2496 | 2:3 | 海报竖版 |
| 3072x1376 | 21:9 | 超宽 Banner |

完整尺寸列表见 `references/api-reference.md`。

### Prompt 编写要点

U1 Fast 专为信息图优化，prompt 质量决定输出效果：

- **明确布局**：描述区块位置关系（左中右三栏、上下两段等）
- **指定配色**：给出主色调和辅助色
- **描述风格**：卡通、扁平、商务、科技感
- **列出文字**：信息图中所有文字必须在 prompt 中明确写出
- **指定图标风格**：描述配图元素

## 能力二：图像理解

当用户要求描述、分析或识别图片内容时，使用此能力。

### 触发场景

- "这张图片里有什么？"
- "帮我描述一下这张图"
- "分析这张图片"
- "这张图讲了什么？"
- 用户在消息中附加了图片并要求分析

### 工作流程

直接调用识图脚本：

```bash
node scripts/describe_image.js "<图片路径>" "可选的问题"
```

通过 URL：
```bash
node scripts/describe_image.js --url "<图片URL>" "可选的问题"
```

### 识图脚本参数

| 参数 | 说明 |
|------|------|
| 第一个位置参数 | 本地图片路径 |
| `--url <url>` | 图片 URL（代替本地路径） |
| 第二个位置参数 | 自定义问题（默认"请详细描述这张图片的内容。"） |

## 环境变量

两个脚本支持通过环境变量覆盖默认配置：

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `SENSENOVA_BASE_URL` | API 基地址 | `https://token.sensenova.cn/v1` |
| `SENSENOVA_API_KEY` | API 密钥 | **必须配置** |
| `SENSENOVA_VL_MODEL` | 识图模型 | `sensenova-6.7-flash-lite` |

## 资源

### scripts/

- `generate_image.js` — 调用 U1 Fast 生成信息图
- `describe_image.js` — 调用 VL 模型识图

### references/

- `api-reference.md` — 完整 API 参数说明、尺寸对照表、prompt 编写指南（需要时加载）
