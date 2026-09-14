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

function getMerklePath(levels, leafIndex) {
  const path = [];
  const indices = [];
  let index = leafIndex;

  for (let i = 0; i < levels.length - 1; i++) {
    const currentLevel = levels[i];
    const siblingIndex = index % 2 === 0 ? index + 1 : index - 1;
    const sibling = currentLevel[siblingIndex];
    path.push(sibling);
    const direction = index % 2 === 0 ? 0 : 1;
    indices.push(direction);
    index = Math.floor(index / 2);
  }

  return { path, indices };
}

module.exports = { hashPair, buildTree, getMerklePath };