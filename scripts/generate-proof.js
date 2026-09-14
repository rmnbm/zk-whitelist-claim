const fs = require("fs");
const path = require("path");
const { Noir } = require("@noir-lang/noir_js");
const { UltraHonkBackend } = require("@aztec/bb.js");
const { Barretenberg, Fr } = require("@aztec/bb.js");
const { buildTree, getMerklePath } = require("./merkle");

async function main() {
  const circuitPath = path.resolve(
    __dirname,
    "../circuits/whitelist/target/whitelist.json"
  );
  const circuit = JSON.parse(fs.readFileSync(circuitPath, "utf8"));
  const bb = await Barretenberg.new();
  const leaves = [
    0x10bf67c31e011691ed3715360d8359cf5dd7a037252774ec25c286d71c93dca8n,
    0x1f32397e6e33c60fe739e91611f8a76e62074bb79ce0652a30a6044ec009815an,
    0x16fcd227e371b7b94689828854ae6e616b22da0b28dbc0b6d9b18f7281fb3b8an,
    0x0edda9494d7d97380e2a9bc1682714c919245c66733026a4789e5ab7a10ea7fan,
  ];
  const levels = await buildTree(bb, leaves);
  const root = levels[levels.length - 1][0];
  const { path: merklePath, indices } = getMerklePath(levels, 0);

  const nullifier = 1n;
  const recipient = 999n;
  const nullifierHashResult = await bb.pedersenHash(
    [new Fr(nullifier), new Fr(recipient)],
    0
  );
  const nullifierHash = BigInt(nullifierHashResult.toString());

  const inputs = {
    nullifier: nullifier.toString(),
    secret: "10",
    merkle_path: merklePath.map((p) => "0x" + p.toString(16)),
    path_indices: indices,
    root: "0x" + root.toString(16),
    nullifier_hash: "0x" + nullifierHash.toString(16),
    recipient: recipient.toString(),
  };

  console.log("Inputs :", inputs);

  const noir = new Noir(circuit);
  const { witness } = await noir.execute(inputs);

  console.log("Witness successfully generated !");

  const backend = new UltraHonkBackend(circuit.bytecode);
  const proof = await backend.generateProof(witness);

  console.log("Proof generated ! Size :", proof.proof.length, "bytes");

  const isValid = await backend.verifyProof(proof);
  console.log("Valid Proof :", isValid);

  await bb.destroy();
}

main().catch(console.error);