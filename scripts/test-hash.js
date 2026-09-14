const { Barretenberg, Fr } = require("@aztec/bb.js");

async function main() {

    const bb = await Barretenberg.new();

    const a = new Fr(1n);
    const b = new Fr(10n);

    const result = await bb.pedersenHash([a,b], 0);

    console.log("JS Result : ", result.toString());

    await bb.destroy();

}

main();