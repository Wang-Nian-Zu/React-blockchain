import React from 'react';
import { Row,Col } from 'react-bootstrap';
import Block from './Block.js';

const Blockchain = (props) => {
    const {chain} = props;
    return(
        <Row>
            {chain.map((block) => {
                return (
                    <Col key={block.index} sm = {4} className="p-3">
                        <Block block={block} />
                    </Col>  
                )
            })}
        </Row>    
    );
}

export default Blockchain;