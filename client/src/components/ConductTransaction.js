import React, { Component } from 'react'
import { Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import history from '../history';

class ConductTransaction extends Component {
  state = { recipient: '', amount: 0 };

  updateRecipient = event => {
    this.setState({ recipient: event.target.value });
  }

  updateAmount = event => {
    this.setState({ amount: Number(event.target.value) });
  }

  conductTransaction = () => {
    const { recipient, amount } = this.state;

    fetch('/api/transact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ recipient, amount }),
    }).then(response => response.json())
      .then(json => {
        alert(json.message || json.type);
        history.push('/transaction-pool');
      });
  }

  render() {
    console.log('this.state', this.state);

    return (
      <div className="ConductTransaction">
        <Link to="/">Home</Link>

        <h3>Conduct a Transaction</h3>

        <Form.Group>
          <Form.Control
            input="text"
            placeholder="recipient"
            value={this.state.recipient}
            onChange={this.updateRecipient}
          />
        </Form.Group>

        <Form.Group>
          <Form.Control
            input="number"
            placeholder="amount"
            value={this.state.amount}
            onChange={this.updateAmount}
          />
        </Form.Group>

        <div>
          <Button
            variant="danger"
            onClick={this.conductTransaction}
          >
            Submit
          </Button>
        </div>
      </div>
    )
  }
}

export default ConductTransaction