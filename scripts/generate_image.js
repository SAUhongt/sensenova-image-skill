#!/usr/bin/env node
/**
 * SenseNova U1 Fast 信息图生成脚本
 *
 * 用法:
 *   node generate_image.js --prompt "描述文字" [--size WxH] [--n 1]
 *   node generate_image.js --file prompt.txt [--size WxH]
 *
 * 输出: JSON 格式，包含生成的图片 URL
 */

const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");

const BASE_URL = process.env.SENSENOVA_BASE_URL || "https://token.sensenova.cn/v1";
const API_KEY = process.env.SENSENOVA_API_KEY;

// 独立 Agent：禁用 keepAlive 以避免连接复用竞态
const agent = new https.Agent({ keepAlive: false, timeout: 0 });

function checkApiKey() {
  if (!API_KEY) {
    console.error("❌ 未配置 SENSENOVA_API_KEY 环境变量。");
    console.error("");
    console.error("请按以下步骤配置:");
    console.error("  1. 访问 https://token.sensenova.cn 获取 API Key");
    console.error("  2. 在 Claude Code 中运行:");
    console.error("     /update-config set SENSENOVA_API_KEY=<你的key>");
    console.error("");
    console.error("或临时设置:");
    console.error("  PowerShell: $env:SENSENOVA_API_KEY='<你的key>'");
    console.error("  Bash:       export SENSENOVA_API_KEY='<你的key>'");
    process.exit(1);
  }
}
const MODEL = "sensenova-u1-fast";

// 支持的尺寸及对应宽高比
const VALID_SIZES = [
  "1664x2496",  // 2:3
  "2496x1664",  // 3:2
  "1760x2368",  // 3:4
  "2368x1760",  // 4:3
  "1824x2272",  // 4:5
  "2272x1824",  // 5:4
  "2048x2048",  // 1:1
  "2752x1536",  // 16:9 (default)
  "1536x2752",  // 9:16
  "3072x1376",  // 21:9
  "1344x3136",  // 9:21
];

function parseArgs() {
  const argv = process.argv.slice(2);
  const opts = { prompt: "", size: "2752x1536", n: 1 };

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--prompt" && argv[i + 1]) {
      opts.prompt = argv[++i];
    } else if (argv[i] === "--file" && argv[i + 1]) {
      const filePath = path.resolve(argv[++i]);
      if (!fs.existsSync(filePath)) throw new Error(`文件不存在: ${filePath}`);
      opts.prompt = fs.readFileSync(filePath, "utf-8").trim();
    } else if (argv[i] === "--size" && argv[i + 1]) {
      opts.size = argv[++i];
    } else if (argv[i] === "--n" && argv[i + 1]) {
      opts.n = parseInt(argv[++i], 10);
    }
  }

  if (!opts.prompt) {
    // 尝试从 stdin 读取
    try {
      opts.prompt = fs.readFileSync(0, "utf-8").trim();
    } catch {}
  }

  return opts;
}

function validateSize(size) {
  if (!VALID_SIZES.includes(size)) {
    const list = VALID_SIZES.map((s) => {
      const [w, h] = s.split("x").map(Number);
      const ratio = (w / h).toFixed(2);
      return `  ${s} (${ratio})`;
    }).join("\n");
    throw new Error(`无效尺寸: ${size}\n可用尺寸:\n${list}`);
  }
}

function request(payload) {
  const url = new URL(BASE_URL.replace(/\/?$/, "/") + "images/generations");
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
          return reject(new Error(`API ${res.statusCode}: ${data.slice(0, 500)}`));
        }
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve({ raw: data });
        }
      });
    });

    // 120s 总超时，覆盖生图的完整处理时间
    req.setTimeout(120000, () => {
      req.destroy(new Error("请求超时 (120s): 服务器处理时间过长"));
    });

    req.on("error", (err) => {
      if (err.code === "ECONNRESET") {
        reject(new Error(`连接被服务端重置 (${err.code})。可能原因: API 负载过高、网络中间设备断开空闲连接。可稍后重试。`));
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
  const opts = parseArgs();
  validateSize(opts.size);

  try {
    const result = await request({
      model: MODEL,
      prompt: opts.prompt,
      size: opts.size,
      n: opts.n,
    });
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("生成失败:", err.message);
    process.exit(1);
  }
}

main();
