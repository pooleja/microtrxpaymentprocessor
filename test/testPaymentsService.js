var PaymentsService = require('../service/paymentsService.js');
var svc = new PaymentsService();
var should = require('should');

var sample1 = [
    {
      address: "n2PuaAguxZqLddRbTnAoAuwKYgN2w2hZk7",
      txid: "dbfdc2a0d22a8282c4e7be0452d595695f3a39173bed4f48e590877382b112fc",
      vout: 0,
      ts: 1401276201,
      scriptPubKey: "76a914e50575162795cd77366fb80d728e3216bd52deac88ac",
      amount: 0.001,
      confirmations: 3
    }
];

var sample2 = [
    {
      address: "n2PuaAguxZqLddRbTnAoAuwKYgN2w2hZk7",
      txid: "dbfdc2a0d22a8282c4e7be0452d595695f3a39173bed4f48e590877382b112fc",
      vout: 0,
      ts: 1401276201,
      scriptPubKey: "76a914e50575162795cd77366fb80d728e3216bd52deac88ac",
      amount: 0.001,
      confirmations: 3
    },
    {
      address: "n2PuaAguxZqLddRbTnAoAuwKYgN2w2hZk7",
      txid: "e2b82af55d64f12fd0dd075d0922ee7d6a300f58fe60a23cbb5831b31d1d58b4",
      vout: 0,
      ts: 1401226410,
      scriptPubKey: "76a914e50575162795cd77366fb80d728e3216bd52deac88ac",
      amount: 0.001,
      confirmation: 6,
      confirmationsFromCache: true
    }
];

var sample3 = [
    {
      address: "n2PuaAguxZqLddRbTnAoAuwKYgN2w2hZk7",
      txid: "dbfdc2a0d22a8282c4e7be0452d595695f3a39173bed4f48e590877382b112fc",
      vout: 0,
      ts: 1401276201,
      scriptPubKey: "76a914e50575162795cd77366fb80d728e3216bd52deac88ac",
      amount: 0.001,
      confirmations: 3
    },
    {
      address: "n2PuaAguxZqLddRbTnAoAuwKYgN2w2hZk7",
      txid: "e2b82af55d64f12fd0dd075d0922ee7d6a300f58fe60a23cbb5831b31d1d58b4",
      vout: 0,
      ts: 1401226410,
      scriptPubKey: "76a914e50575162795cd77366fb80d728e3216bd52deac88ac",
      amount: 0.003,
      confirmation: 6,
      confirmationsFromCache: true
    },
    {
      address: "n2PuaAguxZqLddRbTnAoAuwKYgN2w2hZk7",
      txid: "e2b82af55d64f12fd0dd075d0922ee7d6a300f58fe60a23cbb5831b31d1d58b4",
      vout: 0,
      ts: 1401226410,
      scriptPubKey: "76a914e50575162795cd77366fb80d728e3216bd52deac88ac",
      amount: 0.003,
      confirmation: 6,
      confirmationsFromCache: true
    },
    {
      address: "n2PuaAguxZqLddRbTnAoAuwKYgN2w2hZk7",
      txid: "e2b82af55d64f12fd0dd075d0922ee7d6a300f58fe60a23cbb5831b31d1d58b4",
      vout: 0,
      ts: 1401226410,
      scriptPubKey: "76a914e50575162795cd77366fb80d728e3216bd52deac88ac",
      amount: 0.003,
      confirmation: 6,
      confirmationsFromCache: true
    },
    {
      address: "n2PuaAguxZqLddRbTnAoAuwKYgN2w2hZk7",
      txid: "e2b82af55d64f12fd0dd075d0922ee7d6a300f58fe60a23cbb5831b31d1d58b4",
      vout: 0,
      ts: 1401226410,
      scriptPubKey: "76a914e50575162795cd77366fb80d728e3216bd52deac88ac",
      amount: 0.003,
      confirmation: 6,
      confirmationsFromCache: true
    }
];


describe('PaymentProcessor', function () {
   describe('unspents', function () {

      it('should handle null unspents', function () {
         var ret = svc.getUnspentTotals(null);
         (ret).should.equal(0);
       });

      it('should handle empty unspents', function () {
         var ret = svc.getUnspentTotals([]);
         (ret).should.equal(0);
       });

      it('should handle empty non array', function () {
         var ret = svc.getUnspentTotals(0);
         (ret).should.equal(0);
      });

      it('should handle sample1', function () {
         var ret = svc.getUnspentTotals(sample1);
         (ret).should.equal(0.001);
      });

      it('should handle sample2', function () {
         var ret = svc.getUnspentTotals(sample2);
         (ret).should.equal(0.002);
      });

      it('should handle sample2', function () {
         var ret = svc.getUnspentTotals(sample3);
         (ret).should.equal(0.013);
      });
  });
});