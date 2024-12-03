import { connection } from "../config/db-config.js";
import fs from "fs";
import solc from "solc";
import { Web3 } from "web3";

function trimByteCode(bytecode) {
  const targetSubstring = "a2646970667358221220";
  const last22Characters = bytecode.slice(-22); // Get the last 22 characters

  // Find the index of the target substring
  const index = bytecode.indexOf(targetSubstring);

  if (index !== -1) {
    // Remove characters after the target substring and append the last 22 characters
    const result =
      bytecode.slice(0, index + targetSubstring.length) + last22Characters;
    return result;
  }
}

const loadSolcCompiler = async (version) => {
  return new Promise((resolve, reject) => {
    solc.loadRemoteVersion(version, (err, solc) => {
      if (err) {
        reject(err);
      } else {
        resolve(solc);
      }
    });
  });
};

export async function verifySingleFileContract(req, res) {
  console.log("Api called.........");
  const solidityCode = fs.readFileSync(req.file.path, "utf-8");
  const {
    contractAddress,
    compilerVersion,
    licensetype,
    compiler,
    isoptimized,
  } = req.body;
  var input = {
    language: "Solidity",
    sources: {
      file: {
        content: solidityCode,
      },
    },
    settings: {
      outputSelection: {
        "*": {
          "*": ["*"],
        },
      },
    },
  };
  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  const contractName = Object.keys(output.contracts.file)[0];
  const metadata = output.contracts.file[contractName].metadata;
  const web3 = new Web3("http://localhost:9951");
  solc.loadRemoteVersion(req.body.compilerVersion, async (err, solc) => {
    if (!err) {
      const compiledCode = solc.compile(JSON.stringify(input));
      const compiledContract = JSON.parse(compiledCode);
      if (compiledContract.errors) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: compiledContract.errors });
      } else {
        var ccbytecode =
          compiledContract.contracts.file[contractName].evm.bytecode.object;
        // trim bytecode_from_blockchain123
        var trimmed_ccbytecode = "0x" + trimByteCode(ccbytecode);
        const dpbytecode =
          compiledContract.contracts.file[contractName].evm.deployedBytecode
            .object;
        // trim bytecode_from_blockchain456
        var trimmed_dpbytecode = "0x" + trimByteCode(dpbytecode);
        const fetchaddressbytecode = await web3.eth.getCode(
          req.body.contractAddress,
          "latest"
        );
        const bytecode_from_blockchain = trimByteCode(fetchaddressbytecode);
        // console.log("*************************Contract creation BYTECODE from CHAIN: TX HASH************************************ \n\n\n");

        // const transaction = await web3.eth.getTransaction("0x0937cd7ec932b9abf02e85f53af7199d8d092968bb59e1861fc07a317e2146a5");
        // const transactBytecode = transaction.data;
        // console.log(transactBytecode,"Contract creation BYTECODE from CHAIN \n\n");

        // console.log("****************************TRIMMED Contract creation BYTECODE from CHAIN: TX HASH*********************************\n\n");

        // const trimmedtxhashbc = trimByteCode(transactBytecode);
        // console.log(trimmedtxhashbc,"Trimmed Contract creation BYTECODE from CHAIN \n\n");

        // if (trimmed_dpbytecode === bytecode_from_blockchain && trimmed_ccbytecode === trimmedtxhashbc)  {
        if (trimmed_dpbytecode === bytecode_from_blockchain) {
          var contractabi = JSON.stringify(
            compiledContract.contracts.file[contractName].abi
          );
          const sql = `INSERT INTO verifiedcontract (contract_address, filename, compiler, licensetype, compilerversion, isoptimized, contract_code, abi_file) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
          const values = [
            contractAddress,
            contractName,
            compiler,
            licensetype,
            compilerVersion,
            isoptimized,
            solidityCode,
            contractabi,
          ];
          connection.query(sql, values, (err, result) => {
            if (err) {
              console.log(err, "ER");
              fs.unlinkSync(req.file.path);
              return res
                .status(500)
                .json({ error: "Error storing contract data" });
            }
            fs.unlinkSync(req.file.path);
            return res
              .status(201)
              .json({ message: "Contract verified successfully" });
          });
        } else {
          fs.unlinkSync(req.file.path);
          return res
            .status(201)
            .json({ message: "Contract verification failed" });
        }
      }
    } else {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: err.message });
    }
  });
}

export async function verifyMultiFileContract(req, res) {
  var files = req.files;
  let verificationResults = []; // Array to store verification results
  let verificationPassed = false; // Flag to track if any verification passed

  try {
    // Extract data from request body
    const {
      contractAddress,
      compilerVersion,
      licensetype,
      compiler,
      isoptimized,
    } = req.body;

    // Perform any operations needed with the received data
    console.log("Received data:");
    console.log("Contract Address:", contractAddress);
    console.log("Compiler Version:", compilerVersion);
    console.log("License Type:", licensetype);
    console.log("Compiler:", compiler);
    console.log("Is Optimized:", isoptimized);
    console.log(files, "files multi");

    // Compile the contracts
    const sources = {};
    files.forEach((file) => {
      const content = fs.readFileSync(file.path, "utf-8");
      sources[file.originalname] = {
        content,
      };
      console.log(sources, "sources");
    });

    const input = {
      language: "Solidity",
      sources: sources,
      settings: {
        outputSelection: {
          "*": {
            "*": ["*"],
          },
        },
      },
    };

    const solc = await loadSolcCompiler(compilerVersion);
    const output = JSON.parse(solc.compile(JSON.stringify(input)));
    // console.log(output, "outerput");
    // console.log(output.errors[0].message, "output error");

    // Process the compiled contracts
    for (const fileName in output.sources) {
      for (const contractName in output.contracts[fileName]) {
        const deployedByteCode =
          output.contracts[fileName][contractName].evm.deployedBytecode.object;
        console.log("Contract Name:", contractName + "\n");
        console.log(deployedByteCode, "deployedByteCode \n\n");

        // Verification logic - compare bytecode with deployed bytecode on blockchain
        const web3 = new Web3("http://localhost:9951"); // Initialize Web3 with your Infura endpoint

        // Get deployed bytecode from the blockchain
        const fetchedBytecode = await web3.eth.getCode(contractAddress);
        console.log(fetchedBytecode, "deployedchain bytecode");

        //TRIMEDD HERE
        const trimmed_bytecode_from_chain = trimByteCode(fetchedBytecode);
        console.log(
          trimmed_bytecode_from_chain,
          "trimmed_bytecode_from_blockchain \n\n"
        );
        const trimmedDeployedByteCode = "0x" + trimByteCode(deployedByteCode);
        console.log(trimmedDeployedByteCode, "trimmedBytecodeB4compiled \n\n");

        // Compare deployed bytecode with compiled bytecode
        const verificationResult = {
          fileName: fileName,
          contractName: contractName,
          success: trimmed_bytecode_from_chain === trimmedDeployedByteCode,
        };
        verificationResults.push(verificationResult);
        if (verificationResult.success) {
          console.log(`Contract ${contractName} verified successfully.`);
          verificationPassed = true;
        } else {
          console.log(`Contract ${contractName} verified failed.`);
        }
      }
    }

    if (verificationPassed) {
      files.forEach((file) => {
        fs.unlinkSync(file.path);
      });

      return res.status(200).json({
        message: "Verified successfully",
        verificationResults: verificationResults,
      });
    } else {
      files.forEach((file) => {
        fs.unlinkSync(file.path);
      });

      return res.status(400).json({
        message: "Verification failed",
        verificationResults: verificationResults,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    files.forEach((file) => {
      fs.unlinkSync(file.path);
    });

    return res.status(500).json({
      error: error.message, // Send error message in response
    });
  }
}

export async function getVerifiedContract(req, res) {
  const address = req.query.address;
  if (!address) {
    return res.status(400).send("No addresses provided");
  }

  if (address) {
    let temp = "SELECT * FROM verifiedcontract WHERE contract_address = ?";

    connection.query(temp, [address], function (error, queryResponse, fields) {
      if (error) {
        return res.json({ verified: false });
      } else {
        if (!queryResponse || queryResponse.length === 0) {
          return res.json({ verified: false });
        } else {
          return res.json({ response: queryResponse, verified: true });
        }
      }
    });
  } else {
    return res.send("Invalid request");
  }
}
