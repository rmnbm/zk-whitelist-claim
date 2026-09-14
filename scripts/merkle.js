const { Barretenberg, Fr } = require("@aztec/bb.js");

async function hashPair(bb, a, b) {
  const result = await bb.pedersenHash([new Fr(a), new Fr(b)], 0);
  return BigInt(result.toString());
}

async function buildTree(bb, leaves) {
  const levels = [leaves];
  while (levels[levels.length - 1].length > 1) {
    const currentLevel = levels[levels.length - 1];
    const nextLevel = [];
    for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = currentLevel[i + 1] || left;
        nextLevel.push(await hashPair(bb, left, right));
    }
    levels.push(nextLevel);
  }
  return levels;
}

module.exports = { hashPair, buildTree };