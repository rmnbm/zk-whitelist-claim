const fs = require("fs");
const path = require("path");
const { Noir } = require("@noir-lang/noir_js");
const { UltraHonkBackend, Barretenberg, Fr } = require("@aztec/bb.js");
const { buildTree, getMerklePath } = require("./merkle");

async function main() {
  const circuitPath = path.resolve(
    __dirname,
    "../circuits/whitelist/target/whitelist.json"
  );
  const circuit = JSON.parse(fs.readFileSync(circuitPath, "utf8"));
  const bb = await Barretenberg.new();
  const NUM_MEMBERS = 16;
  const leaves = [];
  for (let i = 0; i < NUM_MEMBERS; i++) {
    const nullifier = BigInt(i + 1);
    const secret = BigInt((i + 1) * 10);
    const leaf = await bb.pedersenHash([new Fr(nullifier), new Fr(secret)], 0);
    leaves.push(BigInt(leaf.toString()));
}
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
  const proof = await backend.generateProof(witness, { keccak: true });

  const isValid = await backend.verifyProof(proof, { keccak: true });
  console.log("Valid Proof :", isValid);

  const output = {
    proof: "0x" + Buffer.from(proof.proof).toString("hex"),
    publicInputs: proof.publicInputs,
    merkleRoot: "0x" + root.toString(16).padStart(64, "0"),
    nullifierHash: "0x" + nullifierHash.toString(16).padStart(64, "0"),
  };

  fs.writeFileSync(
    path.resolve(__dirname, "proof-data.json"),
    JSON.stringify(output, null, 2)
  );
  console.log("Proof data saved to proof-data.json");

  await bb.destroy();
}

main().catch(console.error);