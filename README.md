# 六爻占卜 — 增删卜易

基于《增删卜易》（野鹤老人著）的六爻纳甲占卜网页。

## 使用方法
1. 在设置中填入 DeepSeek API Key
2. 选择占卜分类（求财/求官/婚姻等）
3. 点击"起卦"
4. 查看白话解读 + 书中原文

## 数据生成
运行 `node scripts/generate-data.mjs` 生成 `data/hexagrams.json`

## 本地运行

项目使用 ES Modules，需要通过 HTTP 服务器打开（不能直接双击 HTML）：

```bash
# 方式一：用 Python
python3 -m http.server 8080

# 方式二：用 Node.js
npx serve .

# 方式三：用 VS Code Live Server 插件
```

然后打开 `http://localhost:8080`

## 获取 API Key

在 [https://platform.deepseek.com/](https://platform.deepseek.com/) 注册并获取 API Key。
