// data.js — 加载 hexagrams.json 并提供查询接口

let hexagrams = [];
let hexagramMap = {}; // "{upperTrigram}-{lowerTrigram}" → hexagram
let hexagramById = {}; // id → hexagram

export async function loadHexagramData() {
  try {
    const response = await fetch('data/hexagrams.json');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    hexagrams = await response.json();
    buildLookupMap();
    return hexagrams;
  } catch (err) {
    console.error('加载卦象数据失败:', err);
    throw err;
  }
}

function buildLookupMap() {
  hexagramMap = {};
  hexagramById = {};
  for (const h of hexagrams) {
    const key = `${h.upperTrigram}-${h.lowerTrigram}`;
    hexagramMap[key] = h;
    hexagramById[h.id] = h;
  }
}

// 通过上下卦查找
export function findByTrigrams(upperTrigram, lowerTrigram) {
  const key = `${upperTrigram}-${lowerTrigram}`;
  return hexagramMap[key] || null;
}

// 通过ID查找 (1-64)
export function findById(id) {
  return hexagramById[id] || null;
}

// 获取所有卦
export function getAllHexagrams() {
  return hexagrams;
}

// 检查数据是否已加载
export function isDataLoaded() {
  return hexagrams.length > 0;
}
