// llm.js — DeepSeek API 调用，拼装解卦 prompt，嵌入《增删卜易》原文

const API_URL = 'https://api.deepseek.com/chat/completions';
const MODEL = 'deepseek-chat';

let knowledgeBase = null; // { category: [{ chapter, content }] }

function getApiKey() {
  return localStorage.getItem('deepseek_api_key') || '';
}

export function setApiKey(key) {
  localStorage.setItem('deepseek_api_key', key);
}

export function hasApiKey() {
  return getApiKey().length > 0;
}

/**
 * 加载《增删卜易》知识库
 */
export async function loadKnowledgeBase() {
  if (knowledgeBase) return knowledgeBase;
  try {
    const resp = await fetch('data/zengshan-knowledge.json');
    if (resp.ok) {
      knowledgeBase = await resp.json();
      console.log('增删卜易知识库已加载');
    }
  } catch (e) {
    console.warn('知识库加载失败，将使用基础 prompt:', e.message);
  }
  return knowledgeBase;
}

/**
 * 构建系统 prompt — 设定角色并注入书籍原文
 */
function buildSystemPrompt(category, castResult) {
  const { originalHexagram } = castResult;

  // 提取本卦相关原文
  let bookExcerpts = '';

  if (knowledgeBase && knowledgeBase[category]) {
    const chapters = knowledgeBase[category];
    // 截取每个章节的核心内容（前1500字，保留完整断语和卦例）
    const excerpts = chapters.map(ch => {
      let text = ch.content;
      if (text.length > 1500) text = text.substring(0, 1500) + '…';
      return `【${ch.chapter}】${text}`;
    });
    bookExcerpts = '\n\n以下摘自《增删卜易》原文，你必须据此解读，不可脱离原文凭空发挥：\n\n' + excerpts.join('\n\n---\n\n');
  }

  return `你是野鹤老人——清代六爻大师、《增删卜易》的作者。你深谙纳甲筮法，一生"屡验者存之，不验者删之"。现在有人来问卦，你当以书中之法为其论断。

你的解卦必须：
1. 引用《增删卜易》原文断语——用书中原话，不是你自己编的
2. 每条论断都要有原文依据，用【原文："…"】的格式直接引用
3. 语言半文半白——像野鹤老人那样说话，既有古意又让人看得懂
4. 不要泛泛而谈——针对用户的具体卦象和分类，逐条分析

${bookExcerpts}`;
}

/**
 * 构建用户 prompt — 卦象数据 + 提问
 */
function buildUserPrompt(castResult, category) {
  const { originalHexagram, changedHexagram, changingPositions,
          displayLines, dayStem, dayBranch, monthStem, monthBranch, yearStem, yearBranch } = castResult;

  let hexagramData = `本卦：${originalHexagram.name}（${originalHexagram.palace}，属${originalHexagram.palaceElement}）
卦辞：${originalHexagram.guaCi || '暂无'}
`;

  if (changedHexagram) {
    hexagramData += `变卦：${changedHexagram.name}（${changedHexagram.palace}，属${changedHexagram.palaceElement}）
动爻：第${changingPositions.join('、')}爻
`;
  } else {
    hexagramData += '六爻皆静，无变卦。\n';
  }

  hexagramData += `日月建：年建${yearStem || ''}${yearBranch} 月建${monthStem || ''}${monthBranch} 日建${dayStem}${dayBranch}`;

  hexagramData += '\n六爻排盘：\n';
  displayLines.forEach(l => {
    const moving = l.isChanging ? ' 【动】' : '';
    const sy = l.isShiYao ? ' [世]' : l.isYingYao ? ' [应]' : '';
    hexagramData += `${l.positionName}：${l.nayinStem}${l.nayinBranch} ${l.sixQin} ${l.sixBeast}${moving}${sy}\n`;
  });

  // 动爻的爻辞
  let yaoCiText = '';
  if (changingPositions.length > 0) {
    yaoCiText = '\n动爻爻辞：\n';
    changingPositions.forEach(p => {
      const yc = originalHexagram.yaoCi?.[p];
      if (yc) yaoCiText += `${yc}\n`;
    });
  }

  return `占问分类：${category}

${hexagramData}${yaoCiText}
请依《增删卜易》之法，为此卦作断。引原文，讲道理，给结论。`;
}

/**
 * 调用 DeepSeek API 获取解读
 */
export async function getInterpretation(castResult, category) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('NO_API_KEY');
  }

  // 确保知识库已加载
  if (!knowledgeBase) {
    await loadKnowledgeBase();
  }

  const systemPrompt = buildSystemPrompt(category, castResult);
  const userPrompt = buildUserPrompt(castResult, category);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 4096,
        temperature: 0.7,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `API 错误: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (err) {
    if (err.message === 'NO_API_KEY') throw err;
    console.error('DeepSeek API 调用失败:', err);
    throw new Error('API_ERROR');
  }
}
