import dgram from "dgram";
import screenshot from "screenshot-desktop";
import jimp from "jimp";
import zlib from "zlib";

const serverPort = 8456;
const clientPort = 8457;
const max_size = 65507;

let socket = dgram.createSocket("udp4");
let frame = 0;

// 獲取廣播地址
function getBroadcastAddress(): string {
  const interfaces = require("os").networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        const addr = iface.address.split(".");
        const netmask = iface.netmask.split(".");

        if (addr.length === 4 && netmask.length === 4) {
          const broadcast = addr
            .map((a: string, i: number) => {
              return (+a | (255 ^ +netmask[i])).toString();
            })
            .join(".");

          if (
            broadcast.startsWith("192.168.") ||
            broadcast.startsWith("172.31.")
          ) {
            return broadcast;
          }
        }
      }
    }
  }

  return "255.255.255.255";
}

const broadcastAddress = getBroadcastAddress();
console.log("📡 廣播地址:", broadcastAddress);

// 壓縮配置
const paletteSize = 16;
const w = 1920;
const h = 1080;

async function captureAndSend() {
  try {
    // 使用 screenshot-desktop 捕獲屏幕
    const img = await screenshot();

    // 使用 jimp 處理圖像
    const image = await jimp.read(img);

    // 調整大小以控制數據大小（避免超過 UDP 限制）
    image.resize(960, 540);

    // 降低色深以減少數據量（使用更少的顏色）
    image.dither565(); // 使用 16-bit 顏色（565 RGB）

    // 方法1: 直接使用 JPEG 編碼（更高效）
    const jpegBuffer = await image.getBufferAsync(jimp.MIME_JPEG);

    // 如果 JPEG 仍然太大，嘗試壓縮
    let compressed = jpegBuffer;
    if (jpegBuffer.length > 60000) {
      // 進一步降低質量
      const lowQualityBuffer = await image
        .quality(40)
        .getBufferAsync(jimp.MIME_JPEG);
      compressed = lowQualityBuffer;
    }

    // 創建 UDP 消息
    const message = Buffer.alloc(max_size);
    let offset = 0;

    // 寫入鼠標位置（簡化版，實際應該獲取真實鼠標位置）
    message.writeUInt16BE(960, offset);
    offset += 2; // x
    message.writeUInt16BE(540, offset);
    offset += 2; // y

    // 寫入調色板（簡化版）
    for (let i = 0; i < paletteSize; i++) {
      message[offset++] = 255 - i * 16;
      message[offset++] = i * 16;
      message[offset++] = 128;
    }

    // 檢查總大小是否超過 UDP 限制
    const remaining = max_size - offset;

    if (compressed.length > remaining) {
      console.log(`\r⚠️  壓縮數據太大 (${compressed.length} bytes)，跳過此幀`);
      setTimeout(captureAndSend, 200);
      return;
    }

    // 寫入壓縮後的圖像
    compressed.copy(message, offset);
    offset += compressed.length;

    const len = offset;

    // 發送數據（使用 message.subarray(0, len) 確保只發送實際數據）
    socket.send(
      message.subarray(0, len),
      clientPort,
      broadcastAddress,
      (err) => {
        if (err) {
          console.error("發送錯誤:", err);
          return;
        }

        frame++;
        process.stdout.write(
          `\r  已發送 ${frame} 幀 | 大小: ${len} 字節 | 壓縮後: ${compressed.length} 字節`
        );

        // 繼續捕獲
        setTimeout(captureAndSend, 200); // 5 FPS
      }
    );
  } catch (error) {
    console.error("捕獲屏幕時出錯:", error);
    setTimeout(captureAndSend, 200);
  }
}

// 啟動 UDP 服務器
socket.bind(serverPort, () => {
  console.log("==================================================");
  console.log("🖥️  Live-Cast UDP 服務已啟動！");
  console.log("==================================================");
  console.log(`📍 服務端口: ${serverPort}`);
  console.log(`📡 廣播地址: ${broadcastAddress}`);
  console.log(`📤 客戶端口: ${clientPort}`);
  console.log("==================================================");
  console.log("使用 screenshot-desktop 進行屏幕捕獲");
  console.log("開始捕獲和廣播屏幕內容...");
  console.log("==================================================");

  socket.setBroadcast(true);

  // 開始捕獲
  captureAndSend();
});
