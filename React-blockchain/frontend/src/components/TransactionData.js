import React ,{useState} from 'react';
import { Button, Modal, Row } from 'react-bootstrap';

const TransactionData = (props) =>{
    const {transactionData} = props;
    const [show,setShow] = useState(false);
    const DetailTransaction = () => {
       setShow(true);
    }
    const handleClose = () => {
      setShow(false);
    }
    return(
    <div>
      <Modal
        show={show}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header>
          <Modal.Title>TxID : {transactionData.transactionId}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <p style={{ color: "red" }}>Sender : {transactionData.sender}</p>
          </Row>
          <Row>
            <p style={{ color: "blue" }}>Recipient : {transactionData.recipient}</p>
          </Row>
          <Row>
            <p style={{ color: "black" }}>Amount : {transactionData.amount}</p>
          </Row>        
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>取消</Button>
        </Modal.Footer>
      </Modal>
      <Button variant="success" onClick={DetailTransaction}>txId : {transactionData.transactionId}</Button> 
    </div>
      
    );
}
export default TransactionData;