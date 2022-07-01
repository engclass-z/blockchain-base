const redis = require('redis');

const CHANNELS = {
  TEST: 'TEST',
  BLOCKCHAIN: 'BLOCKCHAIN',
  TRANSACTION: 'TRANSACTION',
};

class PubSub {
  constructor({ blockchain, transactionPool, redisUrl }) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;

    this.publisher = redis.createClient(redisUrl);
    this.subscriber = redis.createClient(redisUrl);

    this.subscribeToChannels();

    this.subscriber.on(
      'message',
      (channel, message) => this.handleMessage(channel, message),
    );
  }

  handleMessage(channel, message) {
    console.log(`Message received. Channel: ${channel}. Message: ${message}.`);

    const parsedMessage = JSON.parse(message);

    switch (channel) {
      case CHANNELS.BLOCKCHAIN:
        this.blockchain.replaceChain(parsedMessage, true, () => {
          this.transactionPool.clearBlockchainTransactions({
            chain: parsedMessage,
          })
        });
        break;
      case CHANNELS.TRANSACTION:
        this.transactionPool.setTransaction(parsedMessage);
        break;
      default:
        return;
    }
  }

  subscribeToChannels() {
    Object.values(CHANNELS).forEach(channel => {
      this.subscriber.subscribe(channel);
    });
  }

  publish({ channel, message }) {
    this.subscriber.unsubscribe(channel, () => {
      this.publisher.publish(channel, message, () => {
        this.subscriber.subscribe(channel);
      });
    });
  }

  broadcastChain() {
    this.publish({
      channel: CHANNELS.BLOCKCHAIN,
      message: JSON.stringify(this.blockchain.chain),
    });
  }

  broadcastTransaction(transaction) {
    this.publish({
      channel: CHANNELS.TRANSACTION,
      message: JSON.stringify(transaction),
    });
  }
}

module.exports = PubSub;



// const PubNub = require('pubnub');
//
// const credentials = {
//   publishKey: 'pub-c-563fa220-7869-425f-94f8-2f1be75668a6',
//   subscribeKey: 'sub-c-780e9be3-2591-4fe5-b825-4a9a557a1f1c',
//   secretKey: 'sec-c-ZGYwZDYxMzktZjJjOS00NjlmLWI2ZDctYzRiNzc0ZWU2M2Vi',
//   uuid: 'cryptochain',
// };
//
// const CHANNELS = {
//   TEST: 'TEST',
// }
//
// class PubSub {
//   constructor() {
//     this.pubnub = new PubNub(credentials);
//
//     this.pubnub.subscribe({ channels: [Object.values(CHANNELS)] });
//
//     this.pubnub.addListener(this.listener());
//   }
//
//   listener() {
//     return {
//       message: messageObject => {
//         const { channel, message } = messageObject;
//
//         console.log(`Message received. Channel: ${channel}. Message: ${message}.`);
//       }
//     };
//   }
//
//   publish({ channel, message }) {
//     this.pubnub.publish({ channel, message });
//   }
// }
//
// module.exports = PubSub;
