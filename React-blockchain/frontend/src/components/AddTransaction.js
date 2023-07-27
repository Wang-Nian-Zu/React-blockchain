import React , {useState} from 'react';
import axios from 'axios';
import {  Form , Row, Col, Button } from 'react-bootstrap';

const AddTransaction = (props) => {
    const [transaction, setTransaction] = useState({
        amount: "",
        sender: "",
        recipient:""
    })
    const handleChange = (e) => {
        setTransaction({ ...transaction, [e.target.name]: e.target.value });
    }
    const submitForm = (e) =>{
        e.preventDefault();
        const sendData = {
           amount: transaction.amount,
           sender: transaction.sender,
           recipient:transaction.recipient
        };
        axios({
            method: "post",
            url: "/transaction/broadcast",
            dataType: "JSON",
            data: sendData
        })
            .then((res) => {
                console.log(res.data.note);
                window.location.reload();
            })
            .catch(console.error);
    }
    return(
      <Row style={{backgroundColor: 'rgba(255, 255, 128, 0.5)'}}>
          <Form onSubmit={submitForm} >
            <h2>New transaction</h2>
            <br/>
            <Row >
              <Col sm={3}>
                <Form.Control id="sender" placeholder={`sender`} className="sender" name="sender"
                  type="text"  onChange={handleChange} value={transaction.sender}/>
              </Col>
              <Col sm={1}>
                ➡️
              </Col>
              <Col sm={3}>
                 <Form.Control id="recipient" placeholder={`recipient`} className="recipient" name="recipient" 
                  type="text"  onChange={handleChange} value={transaction.recipient}/>
              </Col>  
              <Col sm={1}>
                💵💰💸
              </Col>
              <Col sm={2}>
                <Form.Control id="amount" placeholder={`amount`} className="amount" name="amount"
                type="text" onChange={handleChange} value={transaction.amount}/>
              </Col> 
              <Col sm={2}>
                <Button variant="primary" type="submit"> add transaction</Button> 
              </Col>
            </Row>
          </Form>
      </Row>
        
    );
}

export default AddTransaction;