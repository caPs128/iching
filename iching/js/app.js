// app.js — 主控制器，连接 UI ↔ Engine ↔ LLM

import { loadHexagramData } from './data.js';
import { castHexagram } from './engine.js';
import { getInterpretation, hasApiKey, loadKnowledgeBase } from './llm.js';
import { renderCastingAnimation, renderDivinationPage, renderResultPage } from './ui.js';

async function init() {
  try {
    await Promise.all([
      loadHexagramData(),
      loadKnowledgeBase(),
    ]);
    console.log('卦象数据已加载');
  } catch (err) {
    document.getElementById('app').innerHTML = `
      <div class="error-page">
        <h1>加载失败</h1>
        <p>卦象数据加载出错，请刷新页面重试。</p>
        <p class="error-detail">${err.message}</p>
      </div>
    `;
    return;
  }

  showDivinationPage();
}

function showDivinationPage() {
  renderDivinationPage(handleCast);
}

async function handleCast(category) {
  // 1. 显示摇钱动画
  renderCastingAnimation();

  // 2. 起卦
  let castResult;
  try {
    castResult = castHexagram();
  } catch (err) {
    alert('起卦出错：' + err.message);
    showDivinationPage();
    return;
  }

  // 3. 动画至少持续 2.5 秒
  await new Promise(r => setTimeout(r, 2500));

  // 4. 渲染结果页（无解读）
  renderResultPage(castResult, category, null, showDivinationPage);

  // 3. 调用 LLM 获取解读
  const interpretationEl = document.getElementById('interpretationContent');
  if (!interpretationEl) return;

  if (!hasApiKey()) {
    interpretationEl.innerHTML = `
      <div class="no-api-key">
        <p>⚠️ 未设置 API Key</p>
        <p>请返回首页点击 ⚙ 设置 DeepSeek API Key</p>
        <p class="hint">API Key 仅保存在浏览器本地</p>
      </div>
    `;
    return;
  }

  interpretationEl.innerHTML = '<p class="loading">解卦中<span class="dots"></span></p>';

  try {
    const interpretation = await getInterpretation(castResult, category);
    renderResultPage(castResult, category, interpretation, showDivinationPage);
  } catch (err) {
    if (err.message === 'NO_API_KEY') {
      interpretationEl.innerHTML = '<p>⚠️ 请先设置 API Key</p>';
    } else {
      interpretationEl.innerHTML = `
        <div class="api-error">
          <p>⚠️ 解读暂时不可用</p>
          <p class="hint">API 调用失败，请检查网络或 API Key 是否正确</p>
          <p class="hint">卦象排盘和原文参考仍可查看</p>
        </div>
      `;
    }
  }
}

// 启动
init();
