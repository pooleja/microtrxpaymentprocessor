var request = require('request');

// Setup the mongodb connection
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/microtrxgateway');

var Env = require('./config/env.js');

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
      vout.scriptPubKey.addresses.map(function(address){
         console.log(address);
      });
     });

   });

});
