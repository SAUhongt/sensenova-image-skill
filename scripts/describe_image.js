#!/usr/bin/env node
/**
 * SenseNova VL 识图脚本 — OpenAI 兼容格式，调用商汤 SenseNova VL 模型。
 *
 * 用法:
 *   node describe_image.js <图片路径> [问题]
 *   node describe_image.js --url <图片链接> [问题]
 *
 * 输出: 模型对图片的描述文本
 */

const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

const BASE_URL = process.env.SENSENOVA_BASE_URL || "https://token.sensenova.cn/v1";
const API_KEY = process.env.SENSENOVA_API_KEY;

// 独立 Agent：禁用 keepAlive 以避免连接复用竞态
const agent = new https.Agent({ keepAlive: false, timeout: 0 });

function checkApiKey() {
  if (!API_KEY) {
    console.error("❌ 未配置 SENSENOVA_API_KEY 环境变量。");
    console.error("");
    console.error("请按以下步骤配置:");
    console.error("  1. 访问 https://www.sensenova.cn/ 获取 API Key");
    console.error("  2. 在 Claude Code 中运行:");
    console.error("     /update-config set SENSENOVA_API_KEY=<你的key>");
    console.error("");
    console.error("或临时设置:");
    console.error("  PowerShell: $env:SENSENOVA_API_KEY='<你的key>'");
    console.error("  Bash:       export SENSENOVA_API_KEY='<你的key>'");
    process.exit(1);
  }
}
const MODEL = process.env.SENSENOVA_VL_MODEL || "sensenova-6.7-flash-lite";

function parseArgs() {
  const argv = process.argv.slice(2);
  let imageSource = "", prompt = "", isUrl = false;

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--url" && argv[i + 1]) {
      isUrl = true;
      imageSource = argv[++i];
    } else if (!imageSource && !argv[i].startsWith("--")) {
      imageSource = argv[i];
    } else if (imageSource && !argv[i].startsWith("--")) {
      prompt = prompt ? prompt + " " + argv[i] : argv[i];
    }
  }
  if (!prompt) prompt = "请详细描述这张图片的内容。";
  return { imageSource, prompt, isUrl };
}

function resolveImageUrl(source, isUrl) {
  if (isUrl) return source;
  const resolved = path.resolve(source);
  if (!fs.existsSync(resolved)) throw new Error(`文件不存在: ${resolved}`);
  const ext = path.extname(resolved).toLowerCase().replace(".", "");
  const mimeMap = { jpg: "jpeg", jpeg: "jpeg", png: "png", gif: "gif", webp: "webp", bmp: "bmp" };
  const data = fs.readFileSync(resolved);
  return `data:image/${mimeMap[ext] || "jpeg"};base64,${data.toString("base64")}`;
}

function request(payload) {
  const url = new URL(BASE_URL.replace(/\/?$/, "/") + "chat/completions");
  const body = JSON.stringify(payload);
  const transport = url.protocol === "https:" ? https : http;

  return new Promise((resolve, reject) => {
    const req = transport.request(url, {
      method: "POST",
      agent: url.protocol === "https:" ? agent : undefined,
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
      },
    }, (res) => {
      let data = "";
      res.on("data", (c) => data += c);
      res.on("end", () => {
        if (res.statusCode >= 400) {
          return reject(new Error(`API ${res.statusCode}: ${data.slice(0, 300)}`));
        }
        try {
          resolve(JSON.parse(data)?.choices?.[0]?.message?.content || data);
        } catch {
          resolve(data);
        }
      });
    });

    // 60s 超时，识图通常 5-30s 内完成
    req.setTimeout(60000, () => {
      req.destroy(new Error("请求超时 (60s): 服务器处理时间过长或图片文件过大"));
    });

    req.on("error", (err) => {
      if (err.code === "ECONNRESET") {
        reject(new Error(`连接被服务端重置 (${err.code})。可能原因: 图片文件过大、API 负载过高。可尝试压缩图片后重试。`));
      } else if (err.code === "ETIMEDOUT" || err.code === "ECONNREFUSED") {
        reject(new Error(`无法连接 API 服务 (${err.code})。请检查网络或代理设置。`));
      } else {
        reject(err);
      }
    });

    req.write(body);
    req.end();
  });
}

async function main() {
  checkApiKey();
  const { imageSource, prompt, isUrl } = parseArgs();
  if (!imageSource) {
    console.error("用法: node describe_image.js <图片路径> [问题]");
    console.error("      node describe_image.js --url <图片链接> [问题]");
    process.exit(1);
  }
  try {
    const imageUrl = resolveImageUrl(imageSource, isUrl);
    const result = await request({
      model: MODEL,
      messages: [{
        role: "user",
        content: [
          { type: "image_url", image_url: { url: imageUrl } },
          { type: "text", text: prompt },
        ],
      }],
      stream: false,
      max_tokens: 1024,
    });
    console.log(result);
  } catch (err) {
    console.error("识图失败:", err.message);
    process.exit(1);
  }
}

main();
