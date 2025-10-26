import dgram from "dgram";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import express from "express";
import path from "path";
import os from "os";

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server);

const UDP_PORT = 8457; // 客戶端接收端口
const WEB_PORT = 3000;

// 靜態文件服務
app.use(express.static(path.join(__dirname, "..", "web-client")));

// 獲取本機 IP
function getLocalIP(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}

// UDP 接收器
const udpSocket = dgram.createSocket("udp4");

// 存儲連接的 WebSocket 客戶端
let connectedClients = new Set();

// 性能統計
let frameCount = 0;
let lastStatsTime = Date.now();

// UDP 數據處理
udpSocket.on("message", (msg, rinfo) => {
  // 將 UDP 數據轉發給所有連接的 WebSocket 客戶端
  if (connectedClients.size > 0) {
    // 將 Buffer 轉為 Base64 以便在 WebSocket 中傳輸
    const dataUrl = `data:image/png;base64,${msg.toString("base64")}`;

    io.emit("frame", {
      data: dataUrl,
      timestamp: Date.now(),
    });
  }
});

udpSocket.on("error", (err) => {
  console.error("UDP 錯誤:", err);
});

// WebSocket 連接處理
io.on("connection", (socket) => {
  console.log("✅ Web 客戶端連接:", socket.id);
  connectedClients.add(socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Web 客戶端斷開:", socket.id);
    connectedClients.delete(socket.id);
  });

  // 處理瀏覽器分享的屏幕數據
  socket.on("screen-data", (data) => {
    // 只在開始/停止時輸出日誌
    if (data.stop) {
      console.log("📤 收到停止信號");
    } else {
      // 統計 FPS
      frameCount++;
      const now = Date.now();
      if (now - lastStatsTime > 5000) {
        console.log(
          `📊 5秒內處理了 ${frameCount} 幀，平均 ${(frameCount / 5).toFixed(
            1
          )} FPS`
        );
        frameCount = 0;
        lastStatsTime = now;
      }
    }
    // 轉發給所有觀看者（包括發送者自己）
    io.emit("frame", data);
  });

  socket.emit("connected", {
    message: "已連接到橋接服務器",
    connectedClients: connectedClients.size,
  });
});

// 啟動 UDP 監聽
udpSocket.bind(UDP_PORT, () => {
  console.log(`📡 UDP 服務器監聽端口: ${UDP_PORT}`);

  // 啟動 Web 服務器
  server.listen(WEB_PORT, "0.0.0.0", () => {
    const localIP = getLocalIP();
    console.log("==================================================");
    console.log("🌐 Web 橋接服務器已啟動！");
    console.log("==================================================");
    console.log(`📍 本機訪問: http://localhost:${WEB_PORT}`);
    console.log(`🌐 局域網訪問: http://${localIP}:${WEB_PORT}`);
    console.log("==================================================");
    console.log("📡 UDP 接收端口:", UDP_PORT);
    console.log("💡 確保設備連接在同一 WiFi 網絡下");
    console.log("==================================================");
  });
});
