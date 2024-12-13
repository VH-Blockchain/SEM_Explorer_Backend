// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Test {
    string public name;
    address public owner;

    constructor() {
        name = "MY Token";
        owner = msg.sender;
    }
}
