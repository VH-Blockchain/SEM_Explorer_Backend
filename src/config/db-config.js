import mysql from "mysql";
export const connection = mysql.createConnection({
  host: "sem-scanner-db-rds.cdkm8k222x7p.us-east-1.rds.amazonaws.com",
  user: "admin",
  port: 3306,
  password: "VhtS25562gts",
  database: "sem",
});

connection.connect(function (err) {
  if (err) {
    console.log(err, "err");
  } else {
    console.log("Connected!");
  }
});

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS userapikeydata (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    appname VARCHAR(50),
    appapikey VARCHAR(255),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    planid INT,
    FOREIGN KEY (planid) REFERENCES users(subscription_id)
  );
`;

connection.query(createTableQuery, (error, results, fields) => {
  if (error) throw error;
  console.log('Table "userapidata" created successfully');
});

const createContractTableQuery = `
  CREATE TABLE IF NOT EXISTS verifiedcontract (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contract_address VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    compiler VARCHAR(255) NOT NULL,
    licensetype VARCHAR(255) NOT NULL,
    compilerversion VARCHAR(255) NOT NULL,
    isoptimized BOOLEAN DEFAULT FALSE,
    contract_code TEXT NOT NULL,
    abi_file TEXT NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

connection.query(createContractTableQuery, (error, results, fields) => {
  if (error) throw error;
  console.log('Table "verifiedcontract" created successfully');
});

// import mysql from 'mysql'
// export const connection = mysql.createConnection({
//     host: "localhost",
//     user: "root",
//     port: 3306,
//     password: "Admin@123",
//     database: "explorer",
// })

// connection.connect(function (err) {
//     if (err) {
//         console.log(err,"err");
//     } else {
//         console.log("Connected!");
//     }
// })
