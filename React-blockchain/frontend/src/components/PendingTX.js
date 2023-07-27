import React from 'react';

const PendingTX = (props) =>{
    const {pendingTransaction} = props;
    return(
        <tr>
            <th>
                {pendingTransaction.transactionId}
            </th>
            <th>
                {pendingTransaction.sender}
            </th>
            <th>
                {pendingTransaction.recipient}
            </th>
            <th>
                {pendingTransaction.amount}
            </th>
        </tr>
    );
}
export default PendingTX;