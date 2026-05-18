# sensenova-image-skill

[English](README.md) | **中文**

Claude Code skill，用于商汤 SenseNova 平台的图像生成与理解。

## 功能

| 能力 | 模型 | 说明 |
|------|------|------|
| **图像生成** | `sensenova-u1-fast` | 将文字描述转化为专业信息图，支持 11 种尺寸/比例 |
| **图像理解** | `sensenova-6.7-flash-lite` | 多模态视觉语言模型，描述和分析图片内容 |

## 安装

```bash
# 克隆到 Claude Code skills 目录
git clone https://github.com/SAUhongt/sensenova-image-skill.git ~/.claude/skills/sensenova-image
```

或下载 zip 解压到 `~/.claude/skills/sensenova-image/`。

## 配置

首次使用前需配置 API Key：

1. 访问 [SenseNova 平台](https://token.sensenova.cn) 获取 API Key
2. 在 Claude Code 中运行：

```
/update-config set SENSENOVA_API_KEY=<你的key>
```

或手动在 `~/.claude/settings.json` 的 `env` 中添加：

```json
{
  "env": {
    "SENSENOVA_API_KEY": "sk-xxx"
  }
}
```

未配置时，脚本会自动终止并打印中文配置指引，不会发送任何请求。

## 用法

### 图像生成

在 Claude Code 中直接对话即可触发：

- "帮我生成一张信息图"
- "把这段内容做成海报"
- "生成一张关于 XX 的数据可视化图"

Claude 会自动编排 prompt 并调用生成脚本。也可手动使用：

```bash
node scripts/generate_image.js --prompt "描述文字" --size 2752x1536
```

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `--prompt <text>` | 图像描述文本 | — |
| `--file <path>` | 从文件读取 prompt | — |
| `--size <WxH>` | 图像尺寸 | 2752x1536 |
| `--n <num>` | 生成数量 | 1 |

### 图像理解

- "这张图片里有什么？"
- "帮我描述一下这张图"

```bash
node scripts/describe_image.js "图片路径" "可选问题"
node scripts/describe_image.js --url "图片URL" "可选问题"
```

## 支持的尺寸

| 尺寸 | 比例 | 场景 |
|------|------|------|
| 2752x1536 | 16:9 | 宽屏/默认 |
| 2048x2048 | 1:1 | 方形 |
| 1536x2752 | 9:16 | 手机竖屏 |
| 1664x2496 | 2:3 | 海报竖版 |
| 3072x1376 | 21:9 | 超宽 Banner |
| 2496x1664 | 3:2 | 横版海报 |
| 1760x2368 | 3:4 | 竖版信息图 |
| 2368x1760 | 4:3 | 横版信息图 |
| 1824x2272 | 4:5 | 社交媒体竖版 |
| 2272x1824 | 5:4 | 社交媒体横版 |
| 1344x3136 | 9:21 | 超长竖版 |

## 文件结构

```
sensenova-image/
├── SKILL.md                          # Skill 主文件
├── README.md                         # 英文说明
├── README_zh.md                      # 中文说明
├── scripts/
│   ├── generate_image.js             # 生图脚本
│   └── describe_image.js             # 识图脚本
└── references/
    └── api-reference.md              # API 参数、尺寸表、prompt 技巧
```

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `SENSENOVA_BASE_URL` | API 基地址 | `https://token.sensenova.cn/v1` |
| `SENSENOVA_API_KEY` | API 密钥 | **必须配置** |
| `SENSENOVA_VL_MODEL` | 识图模型 | `sensenova-6.7-flash-lite` |

## 许可

MIT
