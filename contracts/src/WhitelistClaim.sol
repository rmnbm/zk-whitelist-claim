// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {HonkVerifier} from "./Verifier.sol";

contract WhitelistClaim {
    bytes32 public merkleRoot;
    mapping(bytes32 => bool) public claimedNullifiers;
    HonkVerifier public verifier;

    event Claimed(bytes32 indexed nullifierHash, address indexed recipient);
    
    constructor(bytes32 _merkleRoot){
        merkleRoot = _merkleRoot;
        verifier = new HonkVerifier();
    }

    function claim(bytes32 nullifierHash, bytes calldata _proof , bytes32[] calldata _publicInputs) external{
        require(!claimedNullifiers[nullifierHash], "Nullifier already claimed.");
        require(verifier.verify(_proof, _publicInputs), "Invalid proof.");
        bytes32 provenRecipient = _publicInputs[18];
        require(provenRecipient==bytes32(uint256(uint160(msg.sender))), "Proof not valid for this recipient");
        
        claimedNullifiers[nullifierHash] = true;

        emit Claimed(nullifierHash, msg.sender);

    }
}