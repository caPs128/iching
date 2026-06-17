// config.js — 六爻占卜全局常量与映射表

// ===== 八宫 =====
export const PALACES = {
  qian: { name: '乾宫', element: '金' },
  dui:  { name: '兑宫', element: '金' },
  li:   { name: '离宫', element: '火' },
  zhen: { name: '震宫', element: '木' },
  xun:  { name: '巽宫', element: '木' },
  kan:  { name: '坎宫', element: '水' },
  gen:  { name: '艮宫', element: '土' },
  kun:  { name: '坤宫', element: '土' },
};

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

// 地支 → 五行
export const BRANCH_ELEMENT = {
  '子':'水','丑':'土','寅':'木','卯':'木','辰':'土','巳':'火',
  '午':'火','未':'土','申':'金','酉':'金','戌':'土','亥':'水',
};

// ===== 五行生克 =====
const SHENG = { '金':'水', '水':'木', '木':'火', '火':'土', '土':'金' };
const KE    = { '金':'木', '木':'土', '土':'水', '水':'火', '火':'金' };

// 六亲：给出"我"的五行和对方五行，返回六亲名
export function getSixQin(myElement, lineElement) {
  if (SHENG[myElement] === lineElement) return '子孙';   // 我生者
  if (SHENG[lineElement] === myElement) return '父母';    // 生我者
  if (lineElement === myElement)         return '兄弟';   // 同我者
  if (KE[myElement] === lineElement)     return '妻财';   // 我克者
  if (KE[lineElement] === myElement)     return '官鬼';   // 克我者
  return '兄弟';
}

// 用神映射：分类 → 对应六亲
export const YONGSHEN = {
  '求财': '妻财',
  '求官': '官鬼',
  '婚姻': '妻财',
  '子嗣': '子孙',
  '疾病': '官鬼',
  '出行': '子孙',
  '诉讼': '官鬼',
  '失物': '妻财',
};

// ===== 六兽 =====
const BEASTS_LIST = ['青龙','朱雀','勾陈','腾蛇','白虎','玄武'];
const BEAST_START_INDEX = {
  '甲':0, '乙':0,   // 甲乙日起青龙
  '丙':1, '丁':1,   // 丙丁日起朱雀
  '戊':2,           // 戊日起勾陈
  '己':3,           // 己日起腾蛇
  '庚':4, '辛':4,   // 庚辛日起白虎
  '壬':5, '癸':5,   // 壬癸日起玄武
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

// ===== 纳甲规则 =====
export const NAYIN_RULES = {
  '乾': { stemLower: '甲', stemUpper: '壬', branches: ['子','寅','辰','午','申','戌'] },
  '震': { stemLower: '庚', stemUpper: '庚', branches: ['子','寅','辰','午','申','戌'] },
  '坎': { stemLower: '戊', stemUpper: '戊', branches: ['寅','辰','午','申','戌','子'] },
  '艮': { stemLower: '丙', stemUpper: '丙', branches: ['辰','午','申','戌','子','寅'] },
  '坤': { stemLower: '乙', stemUpper: '癸', branches: ['未','巳','卯','丑','亥','酉'] },
  '巽': { stemLower: '辛', stemUpper: '辛', branches: ['丑','亥','酉','未','巳','卯'] },
  '离': { stemLower: '己', stemUpper: '己', branches: ['卯','丑','亥','酉','未','巳'] },
  '兑': { stemLower: '丁', stemUpper: '丁', branches: ['巳','卯','丑','亥','酉','未'] },
};

// ===== 八宫卦序 =====
export const PALACE_HEXAGRAMS = {
  '乾宫': [
    { upper:'乾', lower:'乾' }, // 1. 乾为天 世6
    { upper:'乾', lower:'巽' }, // 2. 天风姤 世1
    { upper:'乾', lower:'艮' }, // 3. 天山遁 世2
    { upper:'乾', lower:'坤' }, // 4. 天地否 世3
    { upper:'巽', lower:'坤' }, // 5. 风地观 世4
    { upper:'艮', lower:'坤' }, // 6. 山地剥 世5
    { upper:'离', lower:'坤' }, // 7. 火地晋 世4(游魂)
    { upper:'离', lower:'乾' }, // 8. 火天大有 世3(归魂)
  ],
  '兑宫': [
    { upper:'兑', lower:'兑' },
    { upper:'兑', lower:'坎' },
    { upper:'兑', lower:'坤' },
    { upper:'兑', lower:'艮' },
    { upper:'坎', lower:'艮' },
    { upper:'坤', lower:'艮' },
    { upper:'震', lower:'艮' },
    { upper:'震', lower:'兑' },
  ],
  '离宫': [
    { upper:'离', lower:'离' },
    { upper:'离', lower:'艮' },
    { upper:'离', lower:'乾' },
    { upper:'离', lower:'坎' },
    { upper:'艮', lower:'坎' },
    { upper:'乾', lower:'坎' },
    { upper:'巽', lower:'坎' },
    { upper:'巽', lower:'离' },
  ],
  '震宫': [
    { upper:'震', lower:'震' },
    { upper:'震', lower:'坤' },
    { upper:'震', lower:'坎' },
    { upper:'震', lower:'巽' },
    { upper:'坤', lower:'巽' },
    { upper:'坎', lower:'巽' },
    { upper:'兑', lower:'巽' },
    { upper:'兑', lower:'震' },
  ],
  '巽宫': [
    { upper:'巽', lower:'巽' },
    { upper:'巽', lower:'乾' },
    { upper:'巽', lower:'离' },
    { upper:'巽', lower:'震' },
    { upper:'乾', lower:'震' },
    { upper:'离', lower:'震' },
    { upper:'艮', lower:'震' },
    { upper:'艮', lower:'巽' },
  ],
  '坎宫': [
    { upper:'坎', lower:'坎' },
    { upper:'坎', lower:'兑' },
    { upper:'坎', lower:'震' },
    { upper:'坎', lower:'离' },
    { upper:'兑', lower:'离' },
    { upper:'震', lower:'离' },
    { upper:'坤', lower:'离' },
    { upper:'坤', lower:'坎' },
  ],
  '艮宫': [
    { upper:'艮', lower:'艮' },
    { upper:'艮', lower:'离' },
    { upper:'艮', lower:'乾' },
    { upper:'艮', lower:'兑' },
    { upper:'离', lower:'兑' },
    { upper:'乾', lower:'兑' },
    { upper:'巽', lower:'兑' },
    { upper:'巽', lower:'艮' },
  ],
  '坤宫': [
    { upper:'坤', lower:'坤' },
    { upper:'坤', lower:'震' },
    { upper:'坤', lower:'兑' },
    { upper:'坤', lower:'乾' },
    { upper:'震', lower:'乾' },
    { upper:'兑', lower:'乾' },
    { upper:'坎', lower:'乾' },
    { upper:'坎', lower:'坤' },
  ],
};

// 世应位置表
export const SHI_YING_POSITIONS = {
  1: { shi: 6, ying: 3 },
  2: { shi: 1, ying: 4 },
  3: { shi: 2, ying: 5 },
  4: { shi: 3, ying: 6 },
  5: { shi: 4, ying: 1 },
  6: { shi: 5, ying: 2 },
  7: { shi: 4, ying: 1 }, // 游魂
  8: { shi: 3, ying: 6 }, // 归魂
};

// Unicode 六十四卦符号（按周易卦序从 U+4DC0 开始）
export function getHexagramUnicode(id) {
  return String.fromCodePoint(0x4DC0 + id - 1);
}
