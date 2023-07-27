import React,{useState, useEffect} from 'react';
import './App.css';
import axios from 'axios';
import { Container, Button , Table, Row, Col ,Form, Card, ListGroup} from 'react-bootstrap';
import Blockchain from './components/Blockchain';
import AddTransaction from './components/AddTransaction';
import PendingTX from './components/PendingTX.js';

function App() {
  const [chain, setChain] = useState([]);
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [networkNodes, setNetworkNodes] = useState([]);
  const [newNodeURL, setNewNodeURL] = useState("");
  const [currentNodeURL, setCurrentNodeURL] = useState("");
  const mining = (e) =>{
    axios({
      method: "get",
      url: "/mine",
      dataType: "JSON"
    })
      .then((res) => {
          console.log(res.data.note);
          window.location.reload()
      })
      .catch(console.error);
  };
  const handleChange = (e) =>{
    setNewNodeURL( e.target.value);
  };
  const connectNetworkNode = (e) => {
    var sendData = {
      "newNodeUrl" : newNodeURL
    }
    axios({
      method: "post",
      url: "/register-and-broadcast-node",
      dataType: "JSON",
      data: sendData
    })
      .then((res) => {
          console.log(res.data.note);
          window.location.reload()
      })
      .catch(console.error);
  }
  const consensus = () => {
    axios({
      method: "get",
      url: "/consensus",
      dataType: "JSON"
    })
      .then((res) => {
          console.log(res.data.note);
          window.location.reload()
      })
      .catch(console.error);
    
  };
  useEffect(() => {
        axios({
            method: "get",
            url: "/blockchain",
            dataType: "JSON"
        })
            .then((res) => {
                console.log(res.data);
                setChain(res.data.chain);
                setPendingTransactions(res.data.pendingTransactions);
                setNetworkNodes(res.data.networkNodes);
                setCurrentNodeURL(res.data.currentNodeUrl);
                console.log(process.env)
            })
            .catch(console.error);
    }, [])
  return (
    <div className="App">
      <Container className='windowContain pt-0 justify-content-center h-100 mx-auto'>
        <h1>Blockchain node</h1>
        <p>Current node's URL : {currentNodeURL} </p>
        <Row>
          <Col style={{backgroundColor: 'rgba(255, 128, 128, 0.3)'}}>
            <Form.Control name="newNodeURL" placeholder={`connect new node URL...`} type="text"
              onChange={handleChange} value={newNodeURL}/>
          </Col>
          <Col style={{backgroundColor: 'rgba(255, 128, 128, 0.3)'}}><Button varient="outline-success" onClick = {connectNetworkNode}>Connect</Button></Col>
          <Col style={{backgroundColor: 'rgb(255, 255, 128)'}}>
             <h3 className = "text-right">Connected Nodes : </h3>
          </Col>
          <Col style={{backgroundColor: 'rgb(255, 255, 128)'}}>
          {
            (networkNodes.length === 0)
            ?(
              <p > no connecting blockchain network</p>
            ):(
              <Card style={{ width: '18rem'}}>
                <ListGroup variant="flush">            
                {
                  networkNodes.map((networkNode, index)=>{
                    return(
                      <ListGroup.Item key={index} style={{backgroundColor: 'rgb(255, 255, 128)'}}>{index+1}.&nbsp;{networkNode}</ListGroup.Item>
                    );
                  })
                }
                </ListGroup>
              </Card>
            )
          }
          </Col>
        </Row>
        <hr/>
        <AddTransaction/>
        <hr/>
        <h2>Pending transactions</h2>
          <Table striped bordered hover variant="dark">
            <thead>
              <tr>
                <th>#</th>
                <th>sender</th>
                <th>recipient</th>
                <th>amount</th>
              </tr>
            </thead>
            <tbody>
              {
                (pendingTransactions !== []) && (pendingTransactions.map((pendingTransaction, index) => {
                  return(
                    <PendingTX key={index} pendingTransaction = {pendingTransaction}/>   
                  );
                }))       
              }
            </tbody>
          </Table>
          <Button variant="primary" onClick={mining}>Generate Block</Button>
        <hr/>
        <Row style={{backgroundColor: 'rgba(128, 255, 128, 0.3)'}}>
          <Col>
            <h2>Current blocks</h2> 
            <Button variant="dark" onClick={consensus}>Consensus</Button>
          </Col>
          <Blockchain chain = {chain}/>
        </Row>
      </Container>
    </div>
  );
}

export default App;
