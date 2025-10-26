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

**方式一：Web 橋接（推薦，最簡單）**

```bash
# 啟動 Web 橋接服務器（包含 Web 客戶端）
npm run bridge

# 在瀏覽器訪問 http://localhost:3000/share.html 開始分享
```

**方式二：UDP 廣播 + Web 橋接**

```bash
# 啟動 UDP 服務器（捕獲屏幕並廣播）
npm start

# 啟動 Web 橋接服務器（連接 UDP 和 WebSocket）
npm run bridge
```

### 訪問 Web 客戶端

1. **本機訪問**：打開瀏覽器訪問 `http://localhost:3000`
2. **其他設備訪問**：
   - 確保設備連接在**同一個 WiFi** 網絡下
   - 在啟動服務器時，會顯示局域網 IP 地址（例如：`http://192.168.1.100:3000`）
   - 在其他設備瀏覽器輸入該 IP 地址和端口

### ⚠️ 重要提示

- Windows 防火牆可能阻止訪問，需要允許 Node.js 通過防火牆
- 部分路由器可能阻止設備間通信，檢查路由器設置
- 確保服務器啟動時顯示 "0.0.0.0" 而不是 "127.0.0.1"

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

1. **UDP 服務器**（可選）

   - `src/server-alternative.ts` - 推薦，使用 `screenshot-desktop` 捕獲屏幕
   - `src/server.ts` - 原始版本，需要 `robotjs`（編譯較複雜）
   - 使用 `jimp` 處理圖像
   - 使用 `zlib` 壓縮數據
   - UDP 廣播到局域網

2. **Web 橋接** (`src/bridge.ts`)（核心服務器）

   - 接收 UDP 數據或瀏覽器屏幕分享
   - 轉發到 WebSocket 推流
   - 提供 Web 客戶端服務
   - 統一的數據中轉站

3. **Web 客戶端** (`web-client/`)
   - `index.html` - 主觀看頁面
   - `share.html` - 屏幕分享頁面（使用瀏覽器原生 API）
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

1. **Cannot find module 'robotjs' 錯誤**

   - **原因**：`robotjs` 需要編譯原生模組，Windows 環境複雜
   - **解決**：直接使用 `npm run bridge` 啟動（推薦），無需安裝 `robotjs`
   - 或使用 `npm start`（使用 `server-alternative.ts`）替代

2. **連接被拒絕**

   - 檢查防火牆設置，確保端口 3000、8456、8457 已開放
   - Windows 防火牆：允許 Node.js 通過防火牆

3. **畫面卡頓**

   - 降低屏幕分辨率或降低幀率
   - 檢查網絡帶寬

4. **無法看到分享**
   - 確認在同一個 WiFi 網絡下
   - IP 地址正確

### 性能優化建議

- 使用 5GHz WiFi 網絡
- 適當調整分辨率（建議 1280x720）
- 關閉不必要的應用程序
- 使用有線網絡連接（如果可能）

## 📝 授權

ISC License
