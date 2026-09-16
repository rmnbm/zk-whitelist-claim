// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {Test} from "forge-std/Test.sol";
import {WhitelistClaim} from "../src/WhitelistClaim.sol";
import {stdJson} from "forge-std/StdJson.sol";
using stdJson for string;

contract WhitelistClaimTest is Test {
    WhitelistClaim public whitelistClaim;

    bytes32 merkleRoot;
    bytes proof;
    bytes32[] publicInputs;
    bytes32 nullifierHash;

    function setUp() public {
        string memory json = vm.readFile(string.concat(vm.projectRoot(), "/../scripts/proof-data.json"));
        publicInputs = json.readBytes32Array(".publicInputs");
        merkleRoot = json.readBytes32(".merkleRoot");
        proof = json.readBytes(".proof");
        nullifierHash = json.readBytes32(".nullifierHash");
        whitelistClaim = new WhitelistClaim(merkleRoot);
    }

    function test_ValidClaimSucceeds() public {
        vm.prank(address(uint160(999)));
        whitelistClaim.claim(nullifierHash, proof, publicInputs);
    }
}