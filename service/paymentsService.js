
function PaymentsService(){

}

PaymentsService.prototype.getUnspentTotals = function(unspents){

	if ( !unspents || unspents === null) {
		return 0;
	}

   var total = 0;
   unspents.map(function(unspent){
      total += unspent.amount;
   });

   return total;
};


module.exports = PaymentsService;