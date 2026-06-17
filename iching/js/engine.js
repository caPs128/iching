// engine.js — 六爻起卦引擎
// 随机生成六爻 → 定本卦变卦 → 组装完整排盘结果

import { findByTrigrams } from './data.js';
import { TRIGRAMS, STEMS, BRANCHES, getSixBeasts } from './config.js';

const POSITION_NAMES = ['初爻','二爻','三爻','四爻','五爻','上爻'];

// 线值常量
const LINE_OLD_YIN    = 0; // 老阴 ⚋ 动 → 变阳
const LINE_YOUNG_YIN  = 1; // 少阴 ⚋ 静
const LINE_YOUNG_YANG = 2; // 少阳 ⚊ 静
const LINE_OLD_YANG   = 3; // 老阳 ⚊ 动 → 变阴

const LINE_LABELS = ['老阴','少阴','少阳','老阳'];
const LINE_SYMBOLS = ['⚋','⚋','⚊','⚊'];

/**
 * 随机生成六爻（三钱法模拟）
 * 三钱：三背=老阳(3) 两背一正=少阳(2) 一背两正=少阴(1) 三正=老阴(0)
 * 用随机数0-3模拟，等概率分布
 */
function generateSixLines() {
  const lines = [];
  const changingPositions = [];
  for (let i = 0; i < 6; i++) {
    const rand = Math.floor(Math.random() * 4);
    lines.push(rand);
    if (rand === LINE_OLD_YIN || rand === LINE_OLD_YANG) {
      changingPositions.push(i + 1); // 1-indexed
    }
  }
  return { lines, changingPositions };
}

/**
 * 六爻数组 → 上下卦
 * lines 索引: 0=初爻 ... 5=上爻
 * 下卦=初二三爻(0,1,2), 上卦=四五上爻(3,4,5)
 */
function linesToTrigrams(lines) {
  const toBit = (line) => (line >= LINE_YOUNG_YANG) ? 1 : 0;
  // bit0=初爻(下卦初爻), bit1=二爻(下卦中爻), bit2=三爻(下卦上爻)
  const lowerBits = (toBit(lines[0]) << 0) | (toBit(lines[1]) << 1) | (toBit(lines[2]) << 2);
  // bit0=四爻(上卦初爻), bit1=五爻(上卦中爻), bit2=上爻(上卦上爻)
  const upperBits = (toBit(lines[3]) << 0) | (toBit(lines[4]) << 1) | (toBit(lines[5]) << 2);
  return {
    lowerTrigram: TRIGRAMS[lowerBits]?.name || '坤',
    upperTrigram: TRIGRAMS[upperBits]?.name || '坤',
  };
}

/**
 * 翻转动爻得到变卦的六爻
 */
function getChangedLines(originalLines, changingPositions) {
  const changed = [...originalLines];
  for (const pos of changingPositions) {
    const idx = pos - 1;
    if (changed[idx] === LINE_OLD_YIN) changed[idx] = LINE_YOUNG_YANG;
    if (changed[idx] === LINE_OLD_YANG) changed[idx] = LINE_YOUNG_YIN;
  }
  return changed;
}

/**
 * 获取当前日期的天干地支（真农历：lunar-javascript 库）
 * 回退方案：简化近似算法
 */
function getCurrentDayStemBranch() {
  // 尝试使用真农历库
  if (typeof Solar !== 'undefined' && typeof Lunar !== 'undefined') {
    try {
      const solar = Solar.fromDate(new Date());
      const lunar = solar.getLunar();

      const yearGZ = lunar.getYearInGanZhi();   // e.g. "丙午"
      const monthGZ = lunar.getMonthInGanZhi(); // e.g. "甲午"
      const dayGZ = lunar.getDayInGanZhi();     // e.g. "壬戌"

      return {
        dayStem: dayGZ.charAt(0),
        dayBranch: dayGZ.charAt(1),
        monthBranch: monthGZ.charAt(1),
        monthStem: monthGZ.charAt(0),
        yearBranch: yearGZ.charAt(1),
        yearStem: yearGZ.charAt(0),
      };
    } catch (e) {
      console.warn('真农历计算失败，回退到近似算法:', e.message);
    }
  }

  // 回退：简化近似算法（基准: 2024-01-01 = 甲子日）
  const today = new Date();
  const reference = new Date(2024, 0, 1);
  const diffDays = Math.floor((today - reference) / (1000 * 60 * 60 * 24));
  const stemIndex = ((diffDays % 10) + 10) % 10;
  const branchIndex = ((diffDays % 12) + 12) % 12;

  return {
    dayStem: STEMS[stemIndex],
    dayBranch: BRANCHES[branchIndex],
    monthBranch: BRANCHES[getMonthBranchIndex(today)],
    monthStem: STEMS[(stemIndex * 2) % 10], // 近似
    yearBranch: BRANCHES[getYearBranchIndex(today)],
    yearStem: STEMS[(getYearBranchIndex(today)) % 10], // 近似
  };
}

function getMonthBranchIndex(date) {
  const m = date.getMonth();
  return (m + 1) % 12;
}

function getYearBranchIndex(date) {
  const year = date.getFullYear();
  return ((year - 2020) % 12 + 12) % 12;
}

/**
 * 主函数：执行完整起卦
 */
export function castHexagram() {
  // 1. 生成随机六爻
  const { lines: originalLines, changingPositions } = generateSixLines();

  // 2. 定本卦
  const { upperTrigram, lowerTrigram } = linesToTrigrams(originalLines);
  const originalHexagram = findByTrigrams(upperTrigram, lowerTrigram);
  if (!originalHexagram) {
    throw new Error(`找不到卦: ${upperTrigram}-${lowerTrigram}`);
  }

  // 3. 定变卦（如果有动爻）
  let changedHexagram = null;
  if (changingPositions.length > 0) {
    const changedLines = getChangedLines(originalLines, changingPositions);
    const { upperTrigram: chUpper, lowerTrigram: chLower } = linesToTrigrams(changedLines);
    changedHexagram = findByTrigrams(chUpper, chLower);
  }

  // 4. 获取日月建
  const { dayStem, dayBranch, monthBranch, yearBranch } = getCurrentDayStemBranch();

  // 5. 六兽
  const sixBeasts = getSixBeasts(dayStem);

  // 6. 组装每爻的完整显示数据
  const displayLines = originalHexagram.lines.map((lineData, idx) => {
    const pos = idx + 1;
    const originalLineValue = originalLines[idx];
    const isChanging = changingPositions.includes(pos);

    const isYang = originalLineValue >= LINE_YOUNG_YANG;
    const symbol = isYang ? '⚊' : '⚋';

    // 变卦对应爻的数据
    let changedLineData = null;
    if (changedHexagram && isChanging) {
      changedLineData = changedHexagram.lines[idx];
    }

    return {
      position: pos,
      positionName: POSITION_NAMES[idx],
      symbol,
      isYang,
      isChanging,
      originalLineValue,
      lineLabel: LINE_LABELS[originalLineValue],
      nayinStem: lineData.nayinStem,
      nayinBranch: lineData.nayinBranch,
      element: lineData.element,
      sixQin: lineData.sixQin,
      sixBeast: sixBeasts[idx],
      isShiYao: pos === originalHexagram.shiYao,
      isYingYao: pos === originalHexagram.yingYao,
      changedNayinStem: changedLineData?.nayinStem || null,
      changedNayinBranch: changedLineData?.nayinBranch || null,
      changedElement: changedLineData?.element || null,
      changedSixQin: changedLineData?.sixQin || null,
      changedNature: changedLineData?.nature || null,
    };
  });

  return {
    originalHexagram,
    changedHexagram,
    changingPositions,
    displayLines,
    dayStem,
    dayBranch,
    monthBranch,
    yearBranch,
    sixBeasts,
  };
}

export { POSITION_NAMES, LINE_OLD_YIN, LINE_YOUNG_YIN, LINE_YOUNG_YANG, LINE_OLD_YANG };
