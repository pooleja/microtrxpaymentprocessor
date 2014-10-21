var request = require('request');

var PaymentsService = require('./service/paymentsService.js');
var paymentSvc = new PaymentsService();

// Setup the mongodb connection
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/microtrxgateway');
var Payment = require('./models/simple/payment.js');

var Env = require('./config/env.js');

var bitcore = require('bitcore');
var RpcClient = bitcore.RpcClient;
var rpcConfig = require('./config/rpc.js');
var rpc = new RpcClient(rpcConfig.config);

var HierarchicalKey = bitcore.HierarchicalKey;
var Keys = require('./config/keys.js');
var WalletKey = bitcore.WalletKey;
var Builder = bitcore.TransactionBuilder;

var ReadWriteLock = require('rwlock');
var lock = new ReadWriteLock();

var transactionEvent = 'tx';
var transactionRoom = 'inv';

console.log("Attempting connection.");
var socket = require('socket.io-client')(Env.INSIGHT_URL);

socket.on('connect', function() {
   console.log("Connected.");

   // Join the room to get notifications of new transactions
   socket.emit('subscribe', transactionRoom);
});

socket.on(transactionEvent, function(data) {
   console.log("Transaction received.");

   // use data.txid to look up the transaction
   var url = Env.INSIGHT_URL + "/api/tx/" + data.txid;

   request({url:url, json:true}, function (error, response, body) {

     if (error || response.statusCode != 200) {
       console.log("Error getting transaction id: " + data.txid);
       return;
     }

     body.vout.map( function(vout) {

      if(!vout.scriptPubKey.addresses){
        console.log("Failure to find addresses in vout, so skipping " + body.txid);
        return;
      }

      vout.scriptPubKey.addresses.map(function(address){

         lock.readLock(function (readRelease) {

            Payment.findOne({paymentAddress: address}, function(err, currentPayment){

               if (err) {
                  console.log("Error finding payment: " + address + " with error" + err);
                  readRelease();
                  return;
               }

               // Not found
               if(!currentPayment){
                  readRelease();
                  return;
               }

               // Need to process the payment
               console.log("Incoming payment detected for " + address);
               lock.writeLock(function (writeRelease) {

                   // Get the record again to ensure it has the latest version
                   Payment.findOne({paymentAddress: address}, function(err, writePayment){
                     if (err) {
                        console.log("Error finding payment: " + address + " with error" + err);
                        writeRelease();
                        return;
                     }

                     // Not found
                     if(!writePayment){
                        console.log("Something very very bad happened while trying to find " + address);
                        writeRelease();
                        return;
                     }

                     // Relay the payment to the target address

                     // Get unspent outputs from the paymentAddress
                     var utxoUrl = Env.INSIGHT_URL + "/api/addr/" + address + "/utxo";
                     request({url: utxoUrl, json: true}, function (error, response, unspents) {
                        if (error || response.statusCode != 200) {
                         console.log("Error getting unspent transactions for : " + address);
                         writeRelease();
                         return;
                       }

                        // Build a transaction with all inputs going to clientAddress
                        var rawValue =  paymentSvc.getUnspentTotals(unspents);
                        var totalValue = rawValue - Env.DEFAULT_FEE;

                        // Check to see if the requested payment has been received yet
                        if(rawValue < writePayment.amountRequested || totalValue <= 0){
                          console.log("Only partial payment received for : " + address  + " with unspents of " + rawValue + " and requested amount " + writePayment.amountRequested);

                          // Update the record in the DB with the amount received so far
                          updatedTotalReceived(writePayment, function(error){
                              if(error)
                                console.log(error);

                              writeRelease();
                              return;
                           });

                          return;
                        }

                        var trxOpts = {
                           fee: Env.DEFAULT_FEE,
                           spendUnconfirmed: true
                        };

                        var outs = [{
                            address: currentPayment.clientAddress,
                            amount: totalValue,
                          }];

                        var hkey = new HierarchicalKey(Keys.extendedPrivateKeyString);
                        var newKey = new WalletKey({network: Env.NETWORK});
                        newKey.privKey = hkey.derive('m/' + currentPayment.keyId).eckey;
                        var keys = [
                         newKey
                        ];

                        var tx = new Builder(trxOpts)
                         .setUnspent(unspents)
                         .setOutputs(outs)
                         .sign(keys)
                         .build();

                        // Send via RPC in bitcoind
                        rpc.sendRawTransaction(tx.serialize().toString('hex'), function(err, ret){
                           if (err) {
                              console.log("Failed sending transaction from " + address + " to " + currentPayment.clientAddress);
                              writeRelease();
                              return;
                           }

                           // Update the DB with the amount received
                           updatedTotalReceived(writePayment, function(error){
                              if(error)
                                console.log(error);
                           });


                        });


                     });

                   });


                   writeRelease();
               });

               readRelease();

            });

         });

      });
     });

   });

});


function updatedTotalReceived(writePayment, callback){
  // Grab the total received to this address from insight since multiple payments might have been made
  var totalReceivedUrl = Env.INSIGHT_URL + "/api/addr/" + writePayment.paymentAddress;
  request({url: totalReceivedUrl, json: true}, function (error, response, addrInfo) {

    if (error || response.statusCode != 200) {
        callback("Error getting total received transactions for : " + writePayment.paymentAddress);
        return;
      }

    // Update the record in the db with total sent to paymentAddress
    writePayment.amountReceived = parseFloat(addrInfo.unconfirmedBalance) + parseFloat(addrInfo.totalReceived);
    writePayment.save(function(err, payment){
       if(err)
          callback("Failed to save the payment object after sending transaction");
    });

  });
}
