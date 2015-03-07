var bitcore = require('bitcore');

// Configure the bitcoin network to use - this drives other config
var bitcoinNetwork = bitcore.Networks.testnet;  // change to livenet if in production

// Set default values for livenet
var insightUrl = 'https://insight.bitpay.com';
var connectionString = 'mongodb://localhost/microtrxgateway';

// Override values if in testnet
if(bitcoinNetwork == bitcore.Networks.testnet){
  var insightUrl = 'https://test-insight.bitpay.com';
  connectionString = 'mongodb://localhost/testnet_microtrxgateway';
}

exports.INSIGHT_URL = insightUrl;
exports.MONGO_CONNECTION_STRING = connectionString;
