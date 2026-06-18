// llm.js — DeepSeek API 调用，拼装解卦 prompt，嵌入《增删卜易》原文

const API_URL = 'https://api.deepseek.com/chat/completions';
const MODEL = 'deepseek-v4-pro';

let knowledgeBase = null;
let knowledgeBasePromise = null; // 防止并发重复加载

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
  if (knowledgeBasePromise) return knowledgeBasePromise;
  knowledgeBasePromise = (async () => {
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
  })();
  return knowledgeBasePromise;
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

===== 语言铁律 =====
你必须严格遵守以下语言规则，每次回答不可偏离：

【必须使用的语言特征】
- 判断句式："此乃…之象也""断曰：…""…者，…也"
- 转折衔接："然…""殊不知…""幸得…""独不宜…"
- 论断收尾："…之故耳""…之征验也""…不可为法"
- 命主称呼："卦主""来人""占者""此人"
- 时间表述："目下""刻下""不日""迟则…"

【绝对禁止】
- 禁止出现现代口语词汇：不许用"搞定""靠谱""说白了""大概率""总的来说""建议你""请注意"
- 禁止白话长句连篇：每句不超过30字，长短交错
- 禁止无据猜测：任何一句判断都必须有卦象或原文支撑
- 禁止写成现代散文或议论文格式

===== 输出结构（每次严格按此顺序） =====

一、卦象总断
开篇即断吉凶大义，点明本卦在此占问分类下的核心含义。须引卦辞或书中总纲。一至两句即可，不可冗长。

二、逐爻分析
从初爻到上爻，逐条审视。每爻须言明：
- 爻位阴阳动静（静爻/动爻）
- 纳甲五行六亲六兽
- 与世应、日月建的关系（生克冲合）
- 在此分类下的具体应事
- 有动爻者，兼看变爻

三、综合论断
综合各爻之象，得出最终结论。必须引用《增删卜易》原文至少一条，以【原文："…"】格式标注。

四、应期推断（若有动爻）
依书中之法断应期。若六爻安静则略过。

===== 引用规则 =====
- 每段引用必须冠以【原文："…"】标记
- 引用后必须跟一句白话阐释，说明此原文如何应到当前卦象
- 不得引用知识库以外的文字充作原文

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
