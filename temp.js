import dotenv from 'dotenv'

dotenv.config();

const apiKey1 = process.env.API_KEY1
const apiKey2 = process.env.API_KEY2
const apiKey3 = process.env.API_KEY3
const address = process.env.API_KEY_ADRESS

const apiUrl1 = `${process.env.BSCSCAN_API_URL}?module=account&action=balance&address=${address}&apikey=${apiKey1}`;
const apiUrl2 = `${process.env.BSCSCAN_API_URL}?module=block&action=getblockreward&blockno=2170000&apikey=${apiKey1}`;
const apiUrl3 = `${process.env.BSCSCAN_API_URL}?module=stats&action=tokenCsupply
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

