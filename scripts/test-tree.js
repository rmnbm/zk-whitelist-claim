const { Barretenberg, Fr } = require("@aztec/bb.js");
const { buildTree } = require("./merkle");

async function main() {
  const bb = await Barretenberg.new();

  const leaves = [
    0x10bf67c31e011691ed3715360d8359cf5dd7a037252774ec25c286d71c93dca8n,
    0x1f32397e6e33c60fe739e91611f8a76e62074bb79ce0652a30a6044ec009815an,
    0x16fcd227e371b7b94689828854ae6e616b22da0b28dbc0b6d9b18f7281fb3b8an,
    0x0edda9494d7d97380e2a9bc1682714c919245c66733026a4789e5ab7a10ea7fan,
  ];

  const levels = await buildTree(bb, leaves);
  const root = levels[levels.length - 1][0];

  console.log("Racine calculée :", "0x" + root.toString(16));
  console.log("Racine attendue : 0x019c5817ed87cfdc152bdf53122c6e3f7d335d290105f452b878102e37457cfc");

  await bb.destroy();
}

main();