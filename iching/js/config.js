// config.js — 六爻占卜全局常量与映射表

// ===== 八卦（三爻卦）=====
// key: 3-bit value (bit0=初爻, bit1=二爻, bit2=三爻, 阳=1 阴=0)
export const TRIGRAMS = {
  0b000: { name: '坤', symbol: '☷', element: '土', nature: '阴' },
  0b001: { name: '震', symbol: '☳', element: '木', nature: '阳' },
  0b010: { name: '坎', symbol: '☵', element: '水', nature: '阳' },
  0b011: { name: '兑', symbol: '☱', element: '金', nature: '阴' },
  0b100: { name: '艮', symbol: '☶', element: '土', nature: '阳' },
  0b101: { name: '离', symbol: '☲', element: '火', nature: '阴' },
  0b110: { name: '巽', symbol: '☴', element: '木', nature: '阴' },
  0b111: { name: '乾', symbol: '☰', element: '金', nature: '阳' },
};

// ===== 天干 =====
export const STEMS = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];

// ===== 地支 =====
export const BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];

// ===== 五行生克 =====
// 相生：金→水→木→火→土→金
export const SHENG = { '金':'水', '水':'木', '木':'火', '火':'土', '土':'金' };
// 相克：金→木→土→水→火→金
export const KE    = { '金':'木', '木':'土', '土':'水', '水':'火', '火':'金' };

/**
 * 六亲判定：以宫属五行为主，以爻纳甲五行为客，定生克关系
 * @param {string} palaceEl — 宫属五行（金木水火土）
 * @param {string} lineEl   — 爻纳甲五行
 * @returns {string} 六亲名称
 */
export function getSixQin(palaceEl, lineEl) {
  if (SHENG[palaceEl] === lineEl) return '子孙'; // 宫生爻
  if (SHENG[lineEl] === palaceEl) return '父母'; // 爻生宫
  if (palaceEl === lineEl)         return '兄弟'; // 同五行
  if (KE[palaceEl] === lineEl)     return '妻财'; // 宫克爻
  if (KE[lineEl] === palaceEl)     return '官鬼'; // 爻克宫
  return '兄弟';
}

// ===== 六兽 =====
const BEASTS_LIST = ['青龙','朱雀','勾陈','腾蛇','白虎','玄武'];
const BEAST_START_INDEX = {
  '甲':0, '乙':0,
  '丙':1, '丁':1,
  '戊':2,
  '己':3,
  '庚':4, '辛':4,
  '壬':5, '癸':5,
};

// 按日干天干返回六兽数组（从初爻到上爻）
export function getSixBeasts(dayStem) {
  const start = BEAST_START_INDEX[dayStem] ?? 0;
  const beasts = [];
  for (let i = 0; i < 6; i++) {
    beasts.push(BEASTS_LIST[(start + i) % 6]);
  }
  return beasts;
}
