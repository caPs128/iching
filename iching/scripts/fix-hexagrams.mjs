// fix-hexagrams.mjs — 修复64卦上下卦、宫位、世应、六亲数据
import { readFileSync, writeFileSync } from 'fs';

const data = JSON.parse(readFileSync('data/hexagrams.json', 'utf-8'));

// 正确的64卦数据（周易卦序）
const CORRECT = [
  [1,  '乾为天',   '乾','乾', '乾宫','金',1, 6,3],
  [2,  '坤为地',   '坤','坤', '坤宫','土',1, 6,3],
  [3,  '水雷屯',   '坎','震', '坎宫','水',3, 2,5],
  [4,  '山水蒙',   '艮','坎', '离宫','火',5, 4,1],
  [5,  '水天需',   '坎','乾', '坤宫','土',7, 4,1],
  [6,  '天水讼',   '乾','坎', '离宫','火',7, 4,1],
  [7,  '地水师',   '坤','坎', '坎宫','水',8, 3,6],
  [8,  '水地比',   '坎','坤', '坤宫','土',8, 3,6],
  [9,  '风天小畜', '巽','乾', '巽宫','木',2, 1,4],
  [10, '天泽履',   '乾','兑', '艮宫','土',6, 5,2],
  [11, '地天泰',   '坤','乾', '坤宫','土',4, 3,6],
  [12, '天地否',   '乾','坤', '乾宫','金',4, 3,6],
  [13, '天火同人', '乾','离', '离宫','火',8, 3,6],
  [14, '火天大有', '离','乾', '乾宫','金',8, 3,6],
  [15, '地山谦',   '坤','艮', '兑宫','金',6, 5,2],
  [16, '雷地豫',   '震','坤', '震宫','木',2, 1,4],
  [17, '泽雷随',   '兑','震', '震宫','木',8, 3,6],
  [18, '山风蛊',   '艮','巽', '巽宫','木',8, 3,6],
  [19, '地泽临',   '坤','兑', '坤宫','土',3, 2,5],
  [20, '风地观',   '巽','坤', '乾宫','金',5, 4,1],
  [21, '火雷噬嗑', '离','震', '巽宫','木',6, 5,2],
  [22, '山火贲',   '艮','离', '艮宫','土',2, 1,4],
  [23, '山地剥',   '艮','坤', '乾宫','金',6, 5,2],
  [24, '地雷复',   '坤','震', '坤宫','土',2, 1,4],
  [25, '天雷无妄', '乾','震', '巽宫','木',5, 4,1],
  [26, '山天大畜', '艮','乾', '艮宫','土',3, 2,5],
  [27, '山雷颐',   '艮','震', '巽宫','木',7, 4,1],
  [28, '泽风大过', '兑','巽', '震宫','木',7, 4,1],
  [29, '坎为水',   '坎','坎', '坎宫','水',1, 6,3],
  [30, '离为火',   '离','离', '离宫','火',1, 6,3],
  [31, '泽山咸',   '兑','艮', '兑宫','金',4, 3,6],
  [32, '雷风恒',   '震','巽', '震宫','木',4, 3,6],
  [33, '天山遁',   '乾','艮', '乾宫','金',3, 2,5],
  [34, '雷天大壮', '震','乾', '坤宫','土',5, 4,1],
  [35, '火地晋',   '离','坤', '乾宫','金',7, 4,1],
  [36, '地火明夷', '坤','离', '坎宫','水',7, 4,1],
  [37, '风火家人', '巽','离', '巽宫','木',3, 2,5],
  [38, '火泽睽',   '离','兑', '艮宫','土',5, 4,1],
  [39, '水山蹇',   '坎','艮', '兑宫','金',5, 4,1],
  [40, '雷水解',   '震','坎', '震宫','木',3, 2,5],
  [41, '山泽损',   '艮','兑', '艮宫','土',4, 3,6],
  [42, '风雷益',   '巽','震', '巽宫','木',4, 3,6],
  [43, '泽天夬',   '兑','乾', '坤宫','土',6, 5,2],
  [44, '天风姤',   '乾','巽', '乾宫','金',2, 1,4],
  [45, '泽地萃',   '兑','坤', '兑宫','金',3, 2,5],
  [46, '地风升',   '坤','巽', '震宫','木',5, 4,1],
  [47, '泽水困',   '兑','坎', '兑宫','金',2, 1,4],
  [48, '水风井',   '坎','巽', '震宫','木',6, 5,2],
  [49, '泽火革',   '兑','离', '坎宫','水',5, 4,1],
  [50, '火风鼎',   '离','巽', '离宫','火',3, 2,5],
  [51, '震为雷',   '震','震', '震宫','木',1, 6,3],
  [52, '艮为山',   '艮','艮', '艮宫','土',1, 6,3],
  [53, '风山渐',   '巽','艮', '艮宫','土',8, 3,6],
  [54, '雷泽归妹', '震','兑', '兑宫','金',8, 3,6],
  [55, '雷火丰',   '震','离', '坎宫','水',6, 5,2],
  [56, '火山旅',   '离','艮', '离宫','火',2, 1,4],
  [57, '巽为风',   '巽','巽', '巽宫','木',1, 6,3],
  [58, '兑为泽',   '兑','兑', '兑宫','金',1, 6,3],
  [59, '风水涣',   '巽','坎', '离宫','火',6, 5,2],
  [60, '水泽节',   '坎','兑', '坎宫','水',2, 1,4],
  [61, '风泽中孚', '巽','兑', '艮宫','土',7, 4,1],
  [62, '雷山小过', '震','艮', '兑宫','金',7, 4,1],
  [63, '水火既济', '坎','离', '坎宫','水',4, 3,6],
  [64, '火水未济', '离','坎', '离宫','火',4, 3,6],
];

const NAYIN_RULES = {
  '乾': { stemLower: '甲', stemUpper: '壬', branches: ['子','寅','辰','午','申','戌'] },
  '震': { stemLower: '庚', stemUpper: '庚', branches: ['子','寅','辰','午','申','戌'] },
  '坎': { stemLower: '戊', stemUpper: '戊', branches: ['寅','辰','午','申','戌','子'] },
  '艮': { stemLower: '丙', stemUpper: '丙', branches: ['辰','午','申','戌','子','寅'] },
  '坤': { stemLower: '乙', stemUpper: '癸', branches: ['未','巳','卯','丑','亥','酉'] },
  '巽': { stemLower: '辛', stemUpper: '辛', branches: ['丑','亥','酉','未','巳','卯'] },
  '离': { stemLower: '己', stemUpper: '己', branches: ['卯','丑','亥','酉','未','巳'] },
  '兑': { stemLower: '丁', stemUpper: '丁', branches: ['巳','卯','丑','亥','酉','未'] },
};

const TRIGRAM_YINYANG = {
  '乾': ['阳','阳','阳'], '坤': ['阴','阴','阴'],
  '震': ['阳','阴','阴'], '坎': ['阴','阳','阴'],
  '艮': ['阴','阴','阳'], '巽': ['阴','阳','阳'],
  '离': ['阳','阴','阳'], '兑': ['阳','阳','阴'],
};

const BRANCH_ELEMENT = {
  '子':'水','丑':'土','寅':'木','卯':'木','辰':'土','巳':'火',
  '午':'火','未':'土','申':'金','酉':'金','戌':'土','亥':'水',
};

const SHENG = { '金':'水', '水':'木', '木':'火', '火':'土', '土':'金' };
const KE    = { '金':'木', '木':'土', '土':'水', '水':'火', '火':'金' };

function getSixQin(palaceEl, lineEl) {
  if (SHENG[palaceEl] === lineEl) return '子孙';
  if (SHENG[lineEl] === palaceEl) return '父母';
  if (palaceEl === lineEl)         return '兄弟';
  if (KE[palaceEl] === lineEl)     return '妻财';
  if (KE[lineEl] === palaceEl)     return '官鬼';
  return '兄弟';
}

const positionNames = ['初爻','二爻','三爻','四爻','五爻','上爻'];
let fixed = 0;

for (const [id, name, upper, lower, palace, palaceEl, palaceIdx, shi, ying] of CORRECT) {
  const h = data.find(x => x.id === id);
  if (!h) { console.log(`MISSING: ${id} ${name}`); continue; }

  h.name = name;
  h.upperTrigram = upper;
  h.lowerTrigram = lower;
  h.palace = palace;
  h.palaceElement = palaceEl;
  h.palaceIndex = palaceIdx;
  h.shiYao = shi;
  h.yingYao = ying;

  h.lines = [];
  for (let pos = 1; pos <= 6; pos++) {
    const isUpper = pos >= 4;
    const trigramName = isUpper ? upper : lower;
    const nayin = NAYIN_RULES[trigramName];
    const branch = nayin.branches[pos - 1];
    const stem = isUpper ? nayin.stemUpper : nayin.stemLower;
    const element = BRANCH_ELEMENT[branch];
    const sixQin = getSixQin(palaceEl, element);
    const posInTrigram = (pos - 1) % 3;
    const nature = TRIGRAM_YINYANG[trigramName][posInTrigram];

    h.lines.push({
      position: pos,
      positionName: positionNames[pos - 1],
      nature,
      nayinStem: stem,
      nayinBranch: branch,
      element,
      sixQin,
    });
  }

  fixed++;
}

writeFileSync('data/hexagrams.json', JSON.stringify(data, null, 2), 'utf-8');
console.log(`Fixed: ${fixed}/64 hexagrams`);

// Verify key hexagrams
console.log('\n验证关键卦象:');
const verify = [
  [1,  '乾为天',  ['子孙','妻财','父母','官鬼','兄弟','父母']],
  [2,  '坤为地',  ['兄弟','父母','官鬼','兄弟','妻财','子孙']],
  [3,  '水雷屯',  ['兄弟','子孙','官鬼','父母','官鬼','兄弟']],
  [29, '坎为水',  ['兄弟','官鬼','妻财','父母','官鬼','兄弟']],
  [30, '离为火',  ['父母','子孙','官鬼','妻财','子孙','兄弟']],
  [63, '水火既济',['兄弟','官鬼','父母','妻财','官鬼','子孙']],
  [64, '火水未济',['父母','子孙','兄弟','妻财','子孙','兄弟']],
];

let allOk = true;
for (const [id, name, expected] of verify) {
  const h = data.find(x => x.id === id);
  const actual = h.lines.map(l => l.sixQin);
  const ok = expected.every((e, i) => e === actual[i]);
  const status = ok ? 'OK' : 'FAIL';
  if (!ok) allOk = false;
  console.log(`${status} 卦${id} ${h.name}: 上${h.upperTrigram}下${h.lowerTrigram} 宫:${h.palace}[${h.palaceIndex}] 世${h.shiYao}应${h.yingYao}`);
  if (!ok) console.log(`  期望: ${expected.join(',')}`);
  if (!ok) console.log(`  实际: ${actual.join(',')}`);
}

// Check all hexagrams have valid trigrams
const validTrigrams = ['乾','坤','震','坎','艮','巽','离','兑'];
let trigramOk = true;
for (const h of data) {
  if (!validTrigrams.includes(h.upperTrigram) || !validTrigrams.includes(h.lowerTrigram)) {
    console.log(`INVALID: 卦${h.id} ${h.name} 上${h.upperTrigram}下${h.lowerTrigram}`);
    trigramOk = false;
  }
}
if (trigramOk) console.log('\n全部64卦上下卦合法 ✅');

// Check all 8 palaces have exactly 8 hexagrams
const palaceCount = {};
for (const h of data) {
  palaceCount[h.palace] = (palaceCount[h.palace] || 0) + 1;
}
let palaceOk = true;
for (const [p, c] of Object.entries(palaceCount)) {
  if (c !== 8) { console.log(`宫${p}: ${c}卦 (应为8)`); palaceOk = false; }
}
if (palaceOk) console.log('八宫各8卦 ✅');

console.log(`\n${allOk && trigramOk && palaceOk ? '✅ 全部验证通过' : '❌ 仍有问题需要修复'}`);
