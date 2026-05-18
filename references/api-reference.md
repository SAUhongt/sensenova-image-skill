# SenseNova Image API Reference

## 图像生成 (U1 Fast)

- **模型**: `sensenova-u1-fast`
- **端点**: `POST https://token.sensenova.cn/v1/images/generations`
- **用途**: 信息图 (Infographics) 生成，不支持图像输入
- **最大 prompt token**: 4096

### 请求参数

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| model | string | 是 | — | 固定 `sensenova-u1-fast` |
| prompt | string | 是 | — | 图像描述文本 |
| size | string | 否 | 2752x1536 | 图像尺寸 |
| n | integer | 否 | 1 | 生成数量 |

### 可用尺寸

| 尺寸 | 宽高比 | 适用场景 |
|------|--------|----------|
| 1664x2496 | 2:3 | 竖版海报 |
| 2496x1664 | 3:2 | 横版海报 |
| 1760x2368 | 3:4 | 竖版信息图 |
| 2368x1760 | 4:3 | 横版信息图 |
| 1824x2272 | 4:5 | 社交媒体竖版 |
| 2272x1824 | 5:4 | 社交媒体横版 |
| 2048x2048 | 1:1 | 方形/头像 |
| 2752x1536 | 16:9 | 默认，宽屏演示 |
| 1536x2752 | 9:16 | 手机全屏/故事 |
| 3072x1376 | 21:9 | 超宽屏/Banner |
| 1344x3136 | 9:21 | 超长竖版 |

### 响应格式

```json
{
  "created": 1713167890,
  "data": [
    { "url": "https://cdn.sensenova.dev/gen/..." }
  ]
}
```

### Prompt 编写指南

U1 Fast 专为信息图设计，prompt 质量直接影响输出效果：

1. **明确布局结构**：描述各区块的位置、大小关系（如"左中右三栏"、"上下两段"）
2. **指定配色方案**：给出主色调和辅助色（如"柔和的粉色、淡黄色和浅蓝色为主色调"）
3. **描述视觉风格**：卡通、扁平、商务、科技感等
4. **列出所有文字内容**：信息图中的标题、标签、数据点等文字需在 prompt 中明确写出
5. **指定图标/插图风格**：描述配图的类型和风格

## 图像理解 (VL 模型)

- **模型**: `sensenova-6.7-flash-lite`
- **端点**: `POST https://token.sensenova.cn/v1/chat/completions`
- **用途**: 多模态视觉语言理解，支持图像输入
- **支持的图片格式**: JPEG, PNG, GIF, WebP, BMP
- **最大输出 token**: 1024

### 请求格式 (OpenAI 兼容)

```json
{
  "model": "sensenova-6.7-flash-lite",
  "messages": [{
    "role": "user",
    "content": [
      { "type": "image_url", "image_url": { "url": "图片URL或base64 data URI" } },
      { "type": "text", "text": "请描述这张图片" }
    ]
  }],
  "stream": false,
  "max_tokens": 1024
}
```
