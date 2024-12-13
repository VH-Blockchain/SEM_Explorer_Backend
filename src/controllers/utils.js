import { ethers } from "ethers";
import fs from "fs";
import solc from "solc";
import dotenv from 'dotenv'

dotenv.config()
// Function to fetch on-chain bytecode
const getOnChainByteCode = async () => {
    const provider = new ethers.providers.JsonRpcProvider(
        process.env.REACT_APP_RCP_URL
    );

    const onChainByteCode = await provider.getCode(
        process.env.CHAIN_PROVIDER_ADDRESS
    );
    console.log("On-chain bytecode fetched.");

    return onChainByteCode;
};

// Function to compile a Solidity contract
const compileContract = async (settings = {}) => {
    try {
        const solidityCode = fs.readFileSync(
            "C:/Users/Dell/Documents/SEM_Explorer_Backend/uploads/Test.sol",
            "utf-8"
        );
        console.log(solidityCode, "solidityCode")

        const solcSnapshot = await new Promise((resolve, reject) => {
            solc.loadRemoteVersion("v0.8.19+commit.7dd6d404", (err, snapshot) => {
                if (err) reject(new Error(`Compiler load failed: ${err.message}`));
                else resolve(snapshot);
            });
        });

        console.log("Solidity Compiler loaded successfully");

        const solcInput = {
            language: "Solidity",
            sources: {
                "TestContract.sol": { content: solidityCode },
            },
            settings: {
                optimizer: {
                    enabled: false, // Use Solidity default (disabled)
                    runs: 200,
                },
                outputSelection: {
                    "*": {
                        "*": ["abi", "evm.bytecode", "evm.deployedBytecode"]
                    }
                }
            }
        };

        const output = JSON.parse(solcSnapshot.compile(JSON.stringify(solcInput)));

        const compilationErrors = (output.errors || []).filter(
            (error) => error.severity === "error"
        );
        if (compilationErrors.length > 0) {
            console.error("Compilation errors:", compilationErrors);
            return null;
        }


        const contractName = Object.keys(output.contracts["TestContract.sol"])[0];
        const compiledBytecode =
            output.contracts["TestContract.sol"][contractName].evm.deployedBytecode.object;

        console.log("Contract compiled successfully.");
        console.log(compiledBytecode)
        return compiledBytecode;
    } catch (error) {
        console.error("Error during compilation:", error.message);
        throw error;
    }
};

// Function to compare bytecodes
// const compareBytecodes = (compiledBytecode, onChainBytecode) => {
//     // Remove metadata from the compiled bytecode (last 68 hex characters: 32 bytes + 4 for metadata length)
//     const strippedCompiled = compiledBytecode.slice(0, -68);
//     const strippedOnChain = onChainBytecode.startsWith("0x")
//         ? onChainBytecode.slice(2) // Remove '0x' prefix
//         : onChainBytecode;

//     // there is an 24 charcter diffrence in both


//     console.log(strippedCompiled, "COMPILED CODE", strippedOnChain, "ON CHAIN");
//     // Compare bytecodes
//     if (strippedCompiled === strippedOnChain) {
//         console.log("✅ The compiled bytecode matches the on-chain bytecode!");
//     } else {
//         console.log("❌ The compiled bytecode does NOT match the on-chain bytecode.");
//     }
// };
const compareBytecodes = (compiledBytecode, onChainBytecode) => {
    // Strip metadata (last 68 chars or adjust based on actual metadata size)
    const strippedCompiled = compiledBytecode.slice(0, -68);  // Typical metadata length
    const strippedOnChain = onChainBytecode.startsWith("0x")
        ? onChainBytecode.slice(2) // Remove '0x' prefix
        : onChainBytecode;

    // Strip out potential extra metadata from on-chain bytecode
    const strippedOnChainBytecode = strippedOnChain.slice(0, -68);  // Same as above, or adjust

    console.log(strippedCompiled, "COMPILED CODE", strippedOnChainBytecode, "ON CHAIN");

    if (strippedCompiled === strippedOnChainBytecode) {
        console.log("✅ The compiled bytecode matches the on-chain bytecode!");
    } else {
        console.log("❌ The compiled bytecode does NOT match the on-chain bytecode.");
    }
};

// Execute the functions
// (async () => {
//     try {
//         console.log("Fetching on-chain bytecode...");
//         const onChainBytecode = await getOnChainByteCode();

//         console.log("Compiling contract...");
//         const compiledBytecode = await compileContract();

//         if (compiledBytecode && onChainBytecode) {
//             console.log("Comparing bytecodes...");
//             compareBytecodes(compiledBytecode, onChainBytecode);
//         } else {
//             console.log("Error: Could not fetch or compile bytecode.");
//         }
//     } catch (error) {
//         console.error("An error occurred:", error.message);
//     }
// })();



await compileContract()