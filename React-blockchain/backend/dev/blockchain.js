const sha256 = require('sha256');
const { v1: uuidv1 } = require('uuid');
const currentNodeUrl = process.argv[3]; //指令中第三個參數

function Blockchain() {
    this.chain = [];
    this.pendingTransactions = []; //待確認交易池
    this.currentNodeUrl = currentNodeUrl; 
    this.networkNodes = [] //區塊鏈網路的各節點

    this.createNewBlock(100, '0', '0'); // The Genesis Block
};

Blockchain.prototype.createNewBlock = function(nonce, previousBlockHash, hash){
    const newBlock = {
        index : this.chain.length + 1 ,
        timestamp : Date.now(),
        transactions : this.pendingTransactions, // 正常的 Bitcoin 是會記錄 Transaction 大小的，本實作沒有
        nonce: nonce,
        hash: hash,
        previousBlockHash: previousBlockHash
    };

    this.pendingTransactions = []; //清空待確認交易池
    this.chain.push(newBlock); //將新區塊上鏈
    return newBlock
};

Blockchain.prototype.getLastBlock = function(){
    return this.chain[this.chain.length - 1]; //回傳 chain 上的最後一個區塊 
};

Blockchain.prototype.createNewTransaction = function(amount, sender, recipient){
    const newTransaction = {
        amount : amount,
        sender : sender,
        recipient : recipient,
        transactionId: uuidv1().split('-').join('')
    };
    return newTransaction;
};

Blockchain.prototype.addTransactionToPendingTransaction = function(transactionObj){
    if(("transactionId" in transactionObj) == false){
        transactionObj["transactionId"] = uuidv1().split('-').join(''); 
    };
    this.pendingTransactions.push(transactionObj);
    return this.getLastBlock()['index'] + 1 ; //回傳該 chain 最後一個區塊編號 + 1
};

Blockchain.prototype.hashBlock = function(previousBlockHash, currentBlockData , nonce){
    const dataAsString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
    const hash = sha256(dataAsString);
    return hash;
};

Blockchain.prototype.proofOfWork = function(previousBlockHash, currentBlockData){
    let nonce = 0;
    let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
    while(hash.substring(0,4) !== '0000'){
        nonce ++;
        hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
    }
    return nonce;
};

Blockchain.prototype.chainIsValid = function(blockchain){
    var validChain = true;

    for(var i = 1 ; i < blockchain.length; i++){
        const currentBlock = blockchain[i];
        const prevBlock = blockchain[i-1];
        const blockHash = this.hashBlock(prevBlock['hash'],
                                        {
                                            transactions: currentBlock['transactions'],
                                            index : currentBlock['index'],
                                        },
                                        currentBlock['nonce']
                                    );
        if(blockHash.substring(0,4) !== '0000'){
            validChain = false;
        }
        if(currentBlock['previousBlockHash'] !== prevBlock["hash"]){
            validChain = false;
        }
    }

    const gensisBlock = blockchain[0];
    const correctNonce = gensisBlock['nonce'] === 100;
    const correctPreviousBlockHash = gensisBlock['previousBlockHash'] === '0';
    const correctHash = gensisBlock['hash'] === '0';
    const correctTransactions = gensisBlock['transactions'].length === 0;

    if(!correctNonce || !correctPreviousBlockHash || !correctHash || !correctTransactions){
        validChain = false;
    }
    return validChain
}

Blockchain.prototype.getBlock = function(blockHash){
    let correctBlock = null;
    this.chain.forEach(block => {
        if(block.hash === blockHash){
            correctBlock = block;
        }
    });
    return correctBlock;
}

Blockchain.prototype.getTransaction = function(transactionId){
    let correctTransaction = null;
    let correctBlock = null;
    this.chain.forEach(block => {
        block.transactions.forEach(transaction =>{
            if(transaction.transactionId == transactionId){
                correctTransaction = transaction;
                correctBlock = block;
            }
        });
    });

    return {
        transaction: correctTransaction,
        block: correctBlock
    }
}

Blockchain.prototype.getAddressData = function(address){
    const addressTransactions = []
    // 需要兩次的 for 迴圈去找尋該 address 是否有參與在 sender 還是 recipient
    this.chain.forEach(block => {
        block.transactions.forEach(transaction => {
            if(transaction.sender === address || transaction.recipient === address){
                addressTransactions.push(transaction);
            }
        });
    });
    //做該 address 的餘額加總
    let balance = 0;
    addressTransactions.forEach(transaction => {
        if(transaction.recipient === address){
            balance += transaction.amount;
        }
        if(transaction.sender === address){
            balance -= transaction.amount;
        }
    });

    return {
        addressTransactions: addressTransactions,
        addressBalance: balance
    }
}

module.exports = Blockchain;