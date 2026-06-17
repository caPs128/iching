// ui.js — DOM 渲染：起卦页 + 结果页

import { setApiKey } from './llm.js';

const CATEGORIES = [
  { key: '求财', emoji: '💰' },
  { key: '求官', emoji: '🏛' },
  { key: '婚姻', emoji: '💕' },
  { key: '子嗣', emoji: '👶' },
  { key: '疾病', emoji: '🏥' },
  { key: '出行', emoji: '✈' },
  { key: '诉讼', emoji: '⚖' },
  { key: '失物', emoji: '🔍' },
];

export function renderCastingAnimation() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="page casting-page">
      <div class="casting-animation">
        <div class="coins-container">
          <img class="coin coin1" src="data/coin.png" alt="铜钱">
          <img class="coin coin2" src="data/coin.png" alt="铜钱">
          <img class="coin coin3" src="data/coin.png" alt="铜钱">
        </div>
        <div class="casting-text">摇钱起卦中…</div>
        <div class="casting-subtitle">三钱成爻 · 六爻成卦</div>
        <div class="casting-progress">
          <div class="casting-bar"></div>
        </div>
      </div>
    </div>
  `;
}

export function renderDivinationPage(onCast) {
  const app = document.getElementById('app');
  const selectedCategory = { value: '求财' };

  app.innerHTML = `
    <div class="page divination-page">
      <header class="page-header">
        <h1>六爻占卜</h1>
        <p class="subtitle">增删卜易 · 野鹤老人</p>
        <button class="settings-btn" id="settingsBtn" title="设置">⚙</button>
      </header>

      <div class="category-section">
        <p class="section-label">选择占问分类</p>
        <div class="category-pills" id="categoryPills">
          ${CATEGORIES.map(c => `
            <button class="pill${c.key === '求财' ? ' active' : ''}"
                    data-category="${c.key}">
              ${c.emoji} ${c.key}
            </button>
          `).join('')}
        </div>
      </div>

      <div class="cast-section">
        <div class="taiji">☯</div>
        <p class="hint">心中默念所求之事</p>
        <button class="cast-btn" id="castBtn">
          <span class="cast-btn-text">起 卦</span>
        </button>
        <p class="cast-note">随机六爻 · 纳甲装卦 · AI 解卦</p>
      </div>

      <div class="settings-panel" id="settingsPanel" style="display:none">
        <h3>设置</h3>
        <label for="apiKeyInput">DeepSeek API Key</label>
        <input type="password" id="apiKeyInput" placeholder="sk-..." autocomplete="off" />
        <button id="saveApiKeyBtn">保存</button>
        <p class="hint">API Key 仅保存在浏览器本地</p>
      </div>
    </div>
  `;

  // 起卦按钮
  document.getElementById('castBtn').addEventListener('click', () => {
    onCast(selectedCategory.value);
  });

  // 分类选择
  document.querySelectorAll('.pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedCategory.value = btn.dataset.category;
    });
  });

  // 设置面板
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsPanel = document.getElementById('settingsPanel');
  settingsBtn.addEventListener('click', () => {
    settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
  });

  document.getElementById('saveApiKeyBtn').addEventListener('click', () => {
    const key = document.getElementById('apiKeyInput').value.trim();
    if (key) {
      setApiKey(key);
      alert('API Key 已保存');
      settingsPanel.style.display = 'none';
    }
  });

  // 回填已保存的 API Key
  const saved = localStorage.getItem('deepseek_api_key');
  if (saved) {
    document.getElementById('apiKeyInput').value = saved;
  }
}

export function renderResultPage(castResult, category, interpretation, onBack) {
  const app = document.getElementById('app');
  const { originalHexagram, changedHexagram, changingPositions,
          displayLines, dayStem, dayBranch, monthStem, monthBranch, yearStem, yearBranch } = castResult;

  const hasChanging = changingPositions.length > 0;

  app.innerHTML = `
    <div class="page result-page">
      <header class="page-header">
        <button class="back-btn" id="backBtn">← 再起一卦</button>
        <h1>占卦结果</h1>
        <p class="subtitle">${category} · ${originalHexagram.palace} · 属${originalHexagram.palaceElement}</p>
      </header>

      <div class="hexagram-hero">
        <div class="hexagram-symbol">${originalHexagram.unicode}</div>
        <h2>${originalHexagram.name}</h2>
        ${hasChanging ? `
          <div class="changed-hexagram">
            <span class="arrow">→</span>
            <span class="hexagram-symbol small">${changedHexagram.unicode}</span>
            <h3>${changedHexagram.name}</h3>
            <p class="changing-note">第${changingPositions.join('、')}爻动</p>
          </div>
        ` : '<p class="changing-note">六爻安静</p>'}
      </div>

      <div class="date-info">
        <span>年建：${yearStem || ''}${yearBranch}</span>
        <span>月建：${monthStem || ''}${monthBranch}</span>
        <span>日建：${dayStem}${dayBranch}</span>
      </div>

      <div class="lines-table">
        <h3>六爻排盘 ${hasChanging ? '<span class="changing-hint">（○ 动爻 · 箭头行为变爻）</span>' : ''}</h3>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>爻位</th><th>阴阳</th><th>纳甲</th><th>五行</th><th>六亲</th><th>六兽</th><th>世应</th>
              </tr>
            </thead>
            <tbody>
              ${displayLines.flatMap(l => {
                const rows = [];
                // 本卦行
                rows.push(`
                  <tr class="${l.isChanging ? 'changing-line' : ''}">
                    <td class="pos-name">${l.positionName}</td>
                    <td class="${l.isYang ? 'yang' : 'yin'}">
                      ${l.symbol}${l.isChanging ? ' ○' : ''}
                    </td>
                    <td>${l.nayinStem}${l.nayinBranch}</td>
                    <td>${l.element}</td>
                    <td>${l.sixQin}</td>
                    <td>${l.sixBeast}</td>
                    <td>${l.isShiYao ? '世' : l.isYingYao ? '应' : ''}</td>
                  </tr>
                `);
                // 变卦行
                if (l.isChanging && l.changedNayinStem) {
                  rows.push(`
                    <tr class="changed-sub-row">
                      <td class="pos-name">→ 变</td>
                      <td class="${l.changedNature === '阳' ? 'yang' : 'yin'}">
                        ${l.changedNature === '阳' ? '⚊' : '⚋'}
                      </td>
                      <td>${l.changedNayinStem}${l.changedNayinBranch}</td>
                      <td>${l.changedElement}</td>
                      <td>${l.changedSixQin}</td>
                      <td></td>
                      <td></td>
                    </tr>
                  `);
                }
                return rows;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="interpretation">
        <h3>🔮 白话解读</h3>
        <div class="interpretation-content" id="interpretationContent">
          ${interpretation
            ? formatInterpretation(interpretation)
            : '<p class="loading">解卦中<span class="dots"></span></p>'}
        </div>
      </div>

      <div class="original-text">
        <details>
          <summary>📖 书中原文参考</summary>
          <div class="source-content">
            <h4>卦辞</h4>
            <p>${originalHexagram.guaCi || '暂无'}</p>
            ${changingPositions.map(p => `
              <h4>${displayLines[p-1].positionName}爻辞</h4>
              <p>${originalHexagram.yaoCi?.[p] || '暂无'}</p>
            `).join('')}
            ${interpretation ? extractQuotedSources(interpretation) : ''}
          </div>
        </details>
      </div>
    </div>
  `;

  document.getElementById('backBtn').addEventListener('click', onBack);
}

function formatInterpretation(text) {
  return text
    .replace(/【原文[：:]\s*[""](.+?)[""]】/g, '<span class="quote">📖 $1</span>')
    .replace(/【原文[：:]\s*(.+?)】/g, '<span class="quote">📖 $1</span>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

function extractQuotedSources(interpretation) {
  const quotes = [];
  const re = /【原文[：:]\s*[""]?(.+?)[""]?\s*】/g;
  let m;
  while ((m = re.exec(interpretation)) !== null) {
    const text = m[1].trim();
    if (text && !quotes.includes(text)) {
      quotes.push(text);
    }
  }
  if (quotes.length === 0) return '';
  return `
    <h4>AI 引用原文</h4>
    ${quotes.map(q => `<p class="ai-quote">"${q}"</p>`).join('')}
  `;
}

export { CATEGORIES };
