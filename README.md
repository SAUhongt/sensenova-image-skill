# sensenova-image-skill

Claude Code skill for image generation and understanding via the SenseNova platform.

## 功能

| 能力 | 模型 | 说明 |
|------|------|------|
| **图像生成** | `sensenova-u1-fast` | 将文字描述转化为专业信息图（Infographics），支持 11 种尺寸/比例 |
| **图像理解** | `sensenova-6.7-flash-lite` | 多模态视觉语言模型，描述和分析图片内容 |

## 安装

```bash
# 克隆到 Claude Code skills 目录
git clone https://github.com/SAUhongt/sensenova-image-skill.git ~/.claude/skills/sensenova-image
```

或直接下载 zip 解压到 `~/.claude/skills/sensenova-image/`。

## 配置

首次使用前需配置 API Key：

1. 访问 [SenseNova 平台](https://www.sensenova.cn/) 获取 API Key
2. 在 Claude Code 中运行：

```
/update-config set SENSENOVA_API_KEY=<你的key>
```

或手动在 `~/.claude/settings.json` 中添加：

```json
{
  "env": {
    "SENSENOVA_API_KEY": "sk-xxx"
  }
}
```

未配置时，脚本会自动提示配置步骤，不会发送任何请求。

## 用法

### 图像生成

在 Claude Code 中直接对话即可触发：

- "帮我生成一张信息图"
- "把这段内容做成海报"
- "生成一张关于 XX 的数据可视化图"

Claude 会自动编排 prompt 并调用生成脚本。也可手动使用脚本：

```bash
node scripts/generate_image.js --prompt "描述文字" --size 2752x1536
```

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
| ... | | 共 11 种 |

完整列表见 `references/api-reference.md`。

## 文件结构

```
sensenova-image/
├── SKILL.md                          # Skill 主文件
├── README.md
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
