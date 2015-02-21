var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

// This is the payment object that is created when a client requests a payment address.  This object will also keep track of
// how much btc has been sent to the paymentAddress.
var paymentSchema = mongoose.Schema({

   hdPublicKey: {type: String, required: true},
   paymentAddress: {type: String, required: true, unique: true},
   amountRequested : {type: Number, required: true},
   amountReceived: {type: Number, default: 0}
});

paymentSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Payment', paymentSchema);
