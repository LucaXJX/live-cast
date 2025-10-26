# Live-Cast 📺

一個基於 UDP 廣播的屏幕分享工具，專為局域網設計。

## ✨ 特性

- 🚀 **低延遲**：基於 UDP 廣播，無需建立連接
- 🎯 **局域網優化**：專為同一 WiFi 網絡設計
- 🌐 **Web 客戶端**：無需安裝，瀏覽器直接訪問
- 💻 **跨平台**：支持 Windows、macOS、Linux
- 📦 **易部署**：一鍵啟動，自動檢測 IP 地址

## 🚀 快速開始

### 安裝依賴

```bash
npm install
```

### 啟動服務

**方式一：UDP 廣播 + Web 橋接（推薦）**

```bash
# 啟動 UDP 服務器（捕獲屏幕並廣播）
npm start

# 啟動 Web 橋接服務器（連接 UDP 和 WebSocket）
npm run bridge
```

**方式二：純 UDP（需要 Electron 客戶端）**

```bash
npm start  # 啟動 UDP 服務器
cd live-cast-client
npm start  # 啟動 Electron 客戶端
```

### 訪問 Web 客戶端

1. 打開瀏覽器訪問：`http://localhost:3000`
2. 其他設備訪問：`http://[服務器IP]:3000`

## 📊 性能基準

| 解析度    | 幀率   |
| --------- | ------ |
| 1920x1080 | 5 FPS  |
| 1280x720  | 30 FPS |
| 1024x576  | 30 FPS |
| 960x540   | 30 FPS |

**注**：實際性能取決於網絡帶寬和設備性能。

## 🛠️ 技術架構

### 核心組件

1. **UDP 服務器** (`src/server.ts` 或 `src/server-alternative.ts`)

   - 使用 `screenshot-desktop` 捕獲屏幕
   - 使用 `jimp` 處理圖像
   - 使用 `zlib` 壓縮數據
   - UDP 廣播到局域網

2. **Web 橋接** (`src/bridge.ts`)

   - 接收 UDP 數據
   - 轉發到 WebSocket
   - 提供 Web 客戶端

3. **Web 客戶端** (`web-client/`)
   - `index.html` - 主觀看頁面
   - `share.html` - 屏幕分享頁面
   - 實時接收和顯示屏幕
   - 全屏支持
   - 性能監控

### 項目結構

```
live-cast/
├── src/                    # 核心服務器代碼
│   ├── server.ts          # 原始 UDP 服務器（使用 robotjs）
│   ├── server-alternative.ts  # 替代 UDP 服務器（推薦使用）
│   ├── bridge.ts          # WebSocket 橋接服務器
│   ├── client.ts          # UDP 客戶端
│   └── ...
├── web-client/            # Web 客戶端
│   ├── index.html         # 觀看頁面
│   ├── share.html         # 分享頁面
│   └── img/               # 圖片資源
├── streaming/             # 流媒體配置和腳本
├── live-cast-client/      # Electron 客戶端（可選）
├── README.md              # 項目說明
├── package.json           # 項目配置
└── tsconfig.json          # TypeScript 配置

```

**注意**：`test/` 和 `docs/` 目錄已在 `.gitignore` 中忽略

## ⚙️ 配置

### 端口配置

- UDP 服務器端口：`8456`
- UDP 客戶端端口：`8457`
- Web 服務器端口：`3000`

### 網絡要求

- 所有設備必須在同一 WiFi 網絡
- 確保防火牆允許 UDP 端口 8456-8457 和 TCP 端口 3000
- 建議使用 5GHz WiFi 以獲得更好性能

## 🐛 故障排除

### 常見問題

1. **連接被拒絕**：檢查防火牆設置，確保端口 3000、8456、8457 已開放
2. **畫面卡頓**：降低屏幕分辨率或降低幀率
3. **無法看到分享**：確認在同一個 WiFi 網絡下，IP 地址正確

### 性能優化建議

- 使用 5GHz WiFi 網絡
- 適當調整分辨率（建議 1280x720）
- 關閉不必要的應用程序
- 使用有線網絡連接（如果可能）

## 📝 授權

ISC License
