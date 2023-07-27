const Blockchain = require('./blockchain');

const chain = new Blockchain();

var bc1 = {
    "chain": [
    {
    "index": 1,
    "timestamp": 1690164913887,
    "transactions": [],
    "nonce": 100,
    "hash": "0",
    "previousBlockHash": "0"
    },
    {
    "index": 2,
    "timestamp": 1690165072875,
    "transactions": [],
    "nonce": 18140,
    "hash": "0000b9135b054d1131392c9eb9d03b0111d4b516824a03c35639e12858912100",
    "previousBlockHash": "0"
    },
    {
    "index": 3,
    "timestamp": 1690165123965,
    "transactions": [
    {
    "amount": 12.5,
    "sender": "00",
    "recipient": "ec8ba6f029c711ee86b8032cf0ca4be3",
    "transactionId": "4b61e95029c811ee86b8032cf0ca4be3"
    }
    ],
    "nonce": 28042,
    "hash": "00003dbf1b351987d0282cc69468b54cfa61738366b9ab030d701e5a14b2457e",
    "previousBlockHash": "0000b9135b054d1131392c9eb9d03b0111d4b516824a03c35639e12858912100"
    },
    {
    "index": 4,
    "timestamp": 1690165641811,
    "transactions": [
    {
    "amount": 12.5,
    "sender": "00",
    "recipient": "ec8ba6f029c711ee86b8032cf0ca4be3",
    "transactionId": "69c4626029c811ee86b8032cf0ca4be3"
    },
    {
    "amount": 124,
    "sender": "Amy",
    "recipient": "daniel"
    },
    {
    "amount": 32,
    "sender": "Frank",
    "recipient": "daniel"
    }
    ],
    "nonce": 94669,
    "hash": "000082a52f252c00583baec1d51c6edd0639a221f77b75536e200069883121ff",
    "previousBlockHash": "00003dbf1b351987d0282cc69468b54cfa61738366b9ab030d701e5a14b2457e"
    }
    ],
    "pendingTransactions": [
    {
    "amount": 12.5,
    "sender": "00",
    "recipient": "ec8ba6f029c711ee86b8032cf0ca4be3",
    "transactionId": "9e6d42b029c911ee86b8032cf0ca4be3"
    }
    ],
    "currentNodeUrl": "http://localhost:3001",
    "networkNodes": []
    };

console.log('Valid: ' + chain.chainIsValid(bc1.chain));


