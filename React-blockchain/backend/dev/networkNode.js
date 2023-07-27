// Express is a module, as are the middleware and database libraries that we use in our Express applications.
var express = require('express');

var app = express();
const bodyParser = require('body-parser'); 
const Blockchain = require('./blockchain'); 
const { v1: uuidv1 } = require('uuid'); //uuid 
const port = process.argv[2]; //讀取啟動的 port
const rp = require('request-promise');

const nodeAddress = uuidv1().split('-').join('');

const chain = new Blockchain(); //物件

app.use(bodyParser.json()); //用來解析 JSON 格式的請求資料
app.use(bodyParser.urlencoded({extended: false})); // extended 設為 false，則採用 querystring 進行解析

app.get('/blockchain', function (req, res) {
    res.send(chain); //send() 來返回字串 “Hello World!” 
});

app.post('/transaction', function(req, res){
    const newTransaction = req.body;
    const blockIndex = chain.addTransactionToPendingTransaction(newTransaction)
    res.json({note: `Transaction will be created in Block ${blockIndex}.`})
});

app.post('/transaction/broadcast', function(req,res){
    const newTransaction = chain.createNewTransaction(req.body.amount , req.body.sender, req.body.recipient);
    chain.addTransactionToPendingTransaction(newTransaction);
    
    const requestPromises = [];
    chain.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + '/transaction',
            method: 'POST',
            body: newTransaction,
            json: true
        };
        requestPromises.push(rp(requestOptions));
    });

    Promise.all(requestPromises)
    .then(data=>{
        res.json({note: ' Transaction created and broadcast successfull;'})
    })
});

//挖礦
app.get('/mine', function(req, res){
    const lastBlock = chain.getLastBlock();
    const previousBlockHash = lastBlock['hash'];
    
    const currentBlockData = {
        transactions: chain.pendingTransactions,
        index: lastBlock['index'] + 1
    }
    const nonce = chain.proofOfWork(previousBlockHash , currentBlockData);
    const blockHash = chain.hashBlock(previousBlockHash, currentBlockData, nonce);

    const newBlock = chain.createNewBlock(nonce, previousBlockHash, blockHash);

    const requestPromises = []
    //Broadcast new Block
    chain.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + '/receive-new-block',
            method : 'POST',
            body: {newBlock: newBlock},
            json: true
        }
        requestPromises.push(rp(requestOptions));
    });

    Promise.all(requestPromises)
    .then(data => {
        // miner's reward broadcast
        const requestOptions = {
            uri: chain.currentNodeUrl + '/transaction/broadcast',
            method: 'POST',
            body:{
                amount: 12.5,
                sender: "00",
                recipient: nodeAddress
            },
            json:true
        };
        return rp(requestOptions);
    })
    .then(data => {
        res.json({
            note : "New block mined successfully",
            block : newBlock
        })
    })
});

app.post('/receive-new-block', function(req,res){
    const newBlock = req.body.newBlock;
    const lastBlock = chain.getLastBlock();
    const correctHash = lastBlock.hash === newBlock.previousBlockHash;
    const correctIndex = lastBlock['index'] + 1 == newBlock['index'];

    if(correctHash && correctIndex){
        chain.chain.push(newBlock);
        chain.pendingTransactions = []; //接收新區塊，這邊也將自己的待交易池清空
        res.json({
            note: 'New Block received and accepted',
            newBlock : newBlock
        });
    }else{
        res.json({
            note: 'New Block rejected.',
            newBlock : newBlock
        });
    }
})

// register a node and broadcase it the network
app.post('/register-and-broadcast-node', function(req, res){
    const newNodeUrl = req.body.newNodeUrl;
    const notCurrentNodes = chain.currentNodeUrl !== newNodeUrl;
    if (notCurrentNodes && chain.networkNodes.indexOf(newNodeUrl) == -1) //不要重複加入重複的 URL
        chain.networkNodes.push(newNodeUrl);

    const regNodesPromises = [];
    chain.networkNodes.forEach( networkNodeUrl => {
        const requestOptions = {
            url : networkNodeUrl + '/register-node',
            method : 'POST',
            body: {newNodeUrl: newNodeUrl},
            json: true
        }

        regNodesPromises.push(rp(requestOptions));
    });

    Promise.all(regNodesPromises)
    .then(data=>{
        // use the data
        const bulkRegisterOptions = {
            url : newNodeUrl + '/register-nodes-bulk', //只有新 node 自己會接收
            method : 'POST' ,
            body : { allNetworkNodes : [...chain.networkNodes, chain.currentNodeUrl]},
            json : true
        }
        return rp(bulkRegisterOptions);
    })
    .then(data => {
        res.json({note : 'New node registerd with network successfully.'});
    });
});

//register a node with the network
app.post('/register-node',function(req, res){
    const newNodeUrl = req.body.newNodeUrl;
    const nodeNotAlreadyPresent = chain.networkNodes.indexOf(newNodeUrl) == -1;
    const notCurrentNodes = chain.currentNodeUrl !== newNodeUrl;
    if(nodeNotAlreadyPresent && notCurrentNodes) {
        chain.networkNodes.push(newNodeUrl);
    }
    res.json({note: 'New node registersd successfully with node'});
});

//register multiple nodes at once.
app.post('/register-nodes-bulk', function(req, res){
    const allNetworkNodes = req.body.allNetworkNodes;
    allNetworkNodes.forEach(networkNodeUrl => {
        const nodeNotAlreadyPresent = chain.networkNodes.indexOf(networkNodeUrl) == -1;
        const notCurrentNode = chain.currentNodeUrl !== networkNodeUrl;
        if(nodeNotAlreadyPresent && notCurrentNode){
            chain.networkNodes.push(networkNodeUrl);
        }
    });
    res.json({note: 'Bulk registeration successful.'})
});

app.get('/consensus' , function(req, res){
    const requestPromises = [];
    // 把所有人的 blockchain 資料丟過來
    chain.networkNodes.forEach(networkNodeUrl =>{
        const requestOptions = {
            uri : networkNodeUrl + '/blockchain',
            method : 'GET',
            json: true
        };

        requestPromises.push(rp(requestOptions));
    })

    Promise.all(requestPromises)
    .then(blockchains => {
        //收到以後，先定義自己的 chain 的長度之類的資訊
        const currentChainLength = chain.chain.length;
        let maxChainLength = currentChainLength;
        let newLongestChain = null;
        let newPendingTransactions = null;
        
        //比較別人的 chain 是否比自己的長
        blockchains.forEach(blockchain=>{
            if(blockchain.chain.length > maxChainLength){ //找尋最長鏈
                maxChainLength = blockchain.chain.length;
                newLongestChain = blockchain.chain;
                newPendingTransactions = blockchain.pendingTransactions;
            };
        });
        
        //驗證自己最後的最長鏈是否正確，若正確就把原來的 chain 替換掉
        if(!newLongestChain || (newLongestChain && !chain.chainIsValid(newLongestChain))){
            res.json({
                note: 'Current chain has not been replaced.',
                chain: chain.chain
            });
        }else if (newLongestChain && chain.chainIsValid(newLongestChain)){
            chain.chain = newLongestChain;
            chain.pendingTransactions = newPendingTransactions;
            res.json({
                note:'This chain has been replaced.',
                chain: chain.chain
            });
        }
    });
});

app.get('/block/:blockHash', function(req, res){
    const blockHash = req.params.blockHash;
    const correctBlock = chain.getBlock(blockHash)
    res.json({
        block: correctBlock
    })
});

app.get('/transaction/:transactionId', function(req, res){
    const transactionId = req.params.transactionId;
    const transactionData = chain.getTransaction(transactionId);
    res.json({
        transaction: transactionData.transaction,
        block: transactionData.block
    });
});

app.get('/address/:address', function(req, res){
    const address =req.params.address;
    const addressData = chain.getAddressData(address);
    res.json({
        addressData: addressData
    });
});

app.get('/block-explorer', function(req,res){
    res.sendFile('./block-explorer/index.html' , {root: __dirname});
});

app.listen(port, () =>{
    console.log(`Listening on port ${port} ....`)
})