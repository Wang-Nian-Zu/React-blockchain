import React from 'react';
import { Card } from 'react-bootstrap';
import TransactionData from './TransactionData.js';

const Block = (props) => {
    const { block } = props;
    return(
        <Card bg={'dark'} text={'white'}>
          <Card.Body>
            <Card.Title> #{block.index} </Card.Title>
            <Card.Subtitle className="mb-2 text-muted">TIMESTAMP : {block.timestamp}</Card.Subtitle>
            <Card.Text> ← PREV HASH：{block.previousBlockHash} </Card.Text>
            <Card.Text> THIS HASH : {block.hash} </Card.Text>
            <Card.Text> NONCE : {block.nonce} </Card.Text>
            <Card.Text>
              {
                (block.transactions.length === 0) 
                ?(<Card.Text>No transactions</Card.Text>)
                :(
                  block.transactions.map((transactionData, index)=>{
                  return(
                       <TransactionData key={index} num={index+1} transactionData = {transactionData} />
                  )})
                )
              }         
            </Card.Text>
          </Card.Body>
        </Card>
    );
}
export default Block;