const apiKey1 = 'P2YHBHYIS415NEZN7KA8RQ1EZ4ITGQ8AEM';
const apiKey2 = 'T8WVI5RFCUN8NQ2EX6UZII7BQQ527W9GGB';
const apiKey3 = 'GGJ76WQX1D43U78TU9HQVM9XBYBWT9C25M';
const address = '0x70F657164e5b75689b64B7fd1fA275F334f28e18';

const apiUrl1 = `https://api.bscscan.com/api?module=account&action=balance&address=${address}&apikey=${apiKey1}`;
const apiUrl2 = `https://api.bscscan.com/api?module=block&action=getblockreward&blockno=2170000&apikey=${apiKey1}`;
const apiUrl3 = `https://api.bscscan.com/api?module=stats&action=tokenCsupply
&contractaddress=0xe9e7cea3dedca5984780bafc599bd69add087d56&apikey=${apiKey1}`;

const apiRequests = [
    fetch(apiUrl1),
    fetch(apiUrl2),
    fetch(apiUrl3),
    fetch(apiUrl1),
    fetch(apiUrl2),
    fetch(apiUrl3),
    fetch(apiUrl1),
    fetch(apiUrl2),
    fetch(apiUrl3)
];

Promise.all(apiRequests)
    .then(responses => Promise.all(responses.map(response => response.json())))
    .then(data => {
        console.log("Index ", data);
    })
    .catch(error => console.error('Error:', error));

