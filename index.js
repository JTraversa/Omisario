var fs = require('fs');
var express = require('express');
var bodyparser = require('body-parser');
var Web3 = require('web3');
var util = require('util');
var ChildChain = require('@omisego/omg-js').ChildChain;
var OmgUtil = require('@omisego/omg-js').OmgUtil;
var web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/4c62211c73c248ebb0b6df4c999e52d9"), null, {
  transactionConfirmationBlocks: 1,
});
	
const rootChainPlasmaContractAddress = '0x96d5d8bc539694e5fa1ec0dab0e6327ca9e680f9';
var childChain = new ChildChain({watcherUrl: "https://watcher-info.ropsten.v1.omg.network",plasmaContractAddress: rootChainPlasmaContractAddress});


function initialTransferAPI(request, response) {
	util.log(`>>>>> initialTransferAPI - Base Address: ${request.body.baseAddress}`);

    var baseAddress = request.body.baseAddress;    
	
	util.log(`>>>>> initialTransferAPI - Token Address: ${request.body.tokenAddress}`);

    var currency = request.body.tokenAddress;    
	
	util.log(`>>>>> initialTransferAPI - Amount: ${request.body.amount}`);
	
    var amount = request.body.amount;    
	
	var feesForTransactions = {
		amount: 0,
		currency: '0x0000000000000000000000000000000000000000',
		pegged_amount: null,
		pegged_currency: null,
		pegged_subunit_to_unit: null,
		subunit_to_unit: 0,
		updated_at: '0'
	}
	
	var data = {};
	
	var utxos = [];
	
	/// All transfer connections with OmiseGo childchain
	  childChain.getFees().then(function(result){
		   feesForTransactions = result['1'];
		   	  var ethFeeAmount = feesForTransactions.amount;
	  childChain.getUtxos("0x84b5ce3eA8CDC1B19Ea1768F1C4075b6937b483b").then(function(result){
			var utxos = result;
			// Create the transaction body
	  const transactionBody = OmgUtil.transaction.createTransactionBody({
		fromAddress: "0x84b5ce3eA8CDC1B19Ea1768F1C4075b6937b483b",
		fromUtxos: utxos,
		payments: [
		  {
			owner: baseAddress,
			currency: currency,
			amount: amount
		  }
		],
		fee: {
		  currency: OmgUtil.transaction.ETH_CURRENCY,
		  amount: '30000000000000'
		},
		metadata: "data"
	  });
	  
	  // Type, sign, and submit the transaction to the Watcher
	  const typedData = OmgUtil.transaction.getTypedData(transactionBody, "0x96d5d8bc539694e5fa1ec0dab0e6327ca9e680f9")
	  const privateKeys = new Array(transactionBody.inputs.length).fill("0xF936749BACD9CA85DAE947C9F8FB610FD89AD4D5A2A30641DB62CDAAAD704DF7")
	  const signatures = childChain.signTransaction(typedData, privateKeys)
	  const signedTxn = childChain.buildSignedTransaction(typedData, signatures)
	  childChain.submitTransaction(signedTxn).then(function(result){
		data = result;
		util.log(data);
		response.json(data);
	  });

			}); 
		   });
}


function transferAPI(request, response) {
	
	util.log(`>>>>> transferAPI - From Address : ${request.body.baseAddress}`);
	
	var baseAddress = request.body.baseAddress;
	
	var basePrivate = request.body.basePrivate;
	
	util.log(`>>>>> transferAPI - User Address: ${request.body.userAddress}`);

    var userAddress = request.body.userAddress;    
	
	util.log(`>>>>> transferAPI - Token Address: ${request.body.tokenAddress}`);

    var currency = request.body.tokenAddress;    
	
	util.log(`>>>>> transferAPI - Amount: ${request.body.amount}`);

    var amount = request.body.amount;    
	
	var feesForTransactions = {
		amount: 0,
		currency: '0x0000000000000000000000000000000000000000',
		pegged_amount: null,
		pegged_currency: null,
		pegged_subunit_to_unit: null,
		subunit_to_unit: 0,
		updated_at: '0'
	}
	
	var data = {};
	
	var utxos = [];
	
	/// All transfer connections with OmiseGo childchain
	  childChain.getFees().then(function(result){
		   feesForTransactions = result['1'];
			  var ethFeeAmount = feesForTransactions.amount;
	  childChain.getUtxos(baseAddress).then(function(result){
			var utxos = result;
			// Create the transaction body
	  const transactionBody = OmgUtil.transaction.createTransactionBody({
		fromAddress: baseAddress,
		fromUtxos: utxos,
		payments: [
		  {
			owner: userAddress,
			currency: currency,
			amount: amount
		  }
		],
		fee: {
		  currency: OmgUtil.transaction.ETH_CURRENCY,
		  amount: '30000000000000'
		},
		metadata: "data"
	  });
	  
	  // Type, sign, and submit the transaction to the Watcher
	  const typedData = OmgUtil.transaction.getTypedData(transactionBody, "0x96d5d8bc539694e5fa1ec0dab0e6327ca9e680f9")
	  const privateKeys = new Array(transactionBody.inputs.length).fill(basePrivate)
	  const signatures = childChain.signTransaction(typedData, privateKeys)
	  const signedTxn = childChain.buildSignedTransaction(typedData, signatures)
	  childChain.submitTransaction(signedTxn).then(function(result){
		data = result;
		response.json(data);
		util.log(data);
	  });

	}); 
	});
	
}

function ethBalanceAPI(request, response) {
	
	util.log(`>>>>> balanceAPI - User Address: ${request.res.req.body.userAddress}`);
	
	var userAddress = request.res.req.body.userAddress;
	var balance = childChain.getBalance(userAddress).then(function(res) {
		childchainBalanceArray = res;
	var aliceChildchainEthBalance = childchainBalanceArray.map((i) => {
    return {
      currency:
        i.currency === OmgUtil.transaction.ETH_CURRENCY ? "ETH" : i.currency,
      amount: web3.utils.fromWei(String(i.amount)),
			};
		});
	if ( aliceChildchainEthBalance.length ==  0 ) {
		aliceChildchainEthBalance = {currency: 'ETH',
									amount: '0'};
									util.log(aliceChildchainEthBalance);
		util.log(`>>>>> balanceAPI - Token: ${aliceChildchainEthBalance.currency}`);
		util.log(`>>>>> balanceAPI - Amount: ${aliceChildchainEthBalance.amount}`);
		response.json(aliceChildchainEthBalance);
		}
		
	else {
		util.log(`>>>>> balanceAPI - Token: ${aliceChildchainEthBalance[0].currency}`);
		util.log(`>>>>> balanceAPI - Amount: ${aliceChildchainEthBalance[0].amount}`);
		response.json(aliceChildchainEthBalance[0]);
		
		
	}
	});
}

function pbtcBalanceAPI(request, response) {
	
	util.log(`>>>>> balanceAPI - User Address: ${request.res.req.body.userAddress}`);
	
	var userAddress = request.res.req.body.userAddress;
	var balance = childChain.getBalance(userAddress).then(function(res) {
		childchainBalanceArray = res;
	for (var i = 0; i < childchainBalanceArray.length; ++i) {
		if (childchainBalanceArray[i].currency == "0xeb770b1883dcce11781649e8c4f1ac5f4b40c978") {
			var aliceChildchainpbtcBalance = childchainBalanceArray[i];
			if ( aliceChildchainpbtcBalance.length ==  0 ) {
				aliceChildchainpbtcBalance = {currency: 'ETH',
											amount: '0'};
				util.log(`>>>>> balanceAPI - Token: ${aliceChildchainpbtcBalance.currency}`);
				util.log(`>>>>> balanceAPI - Amount: ${aliceChildchainpbtcBalance.amount}`);
				response.json(aliceChildchainpbtcBalance)
			}
		
			else {
				aliceChildchainpbtcBalance.amount = web3.utils.fromWei(String(aliceChildchainpbtcBalance.amount));
				util.log(`>>>>> balanceAPI - Token: ${aliceChildchainpbtcBalance.currency}`);
				util.log(`>>>>> balanceAPI - Amount: ${aliceChildchainpbtcBalance.amount}`);
				response.json(aliceChildchainpbtcBalance);
			}
		}
	}
	});
}

/*
 * ----- Start of The main server code -----
 */

var app = express();

app.use(bodyparser.json());

app.use(function(req, res, next) {
    util.log(`Request => url: ${req.url}, method: ${req.method}`);
    next();
});

app.use(express.static('./static'));

app.post('/initialTransfer', function(req, res) {
    initialTransferAPI(req, res);
});

app.post('/transfer', function(req, res) {
    transferAPI(req, res);
});

app.post('/ethBalance', function(req, res) {
    ethBalanceAPI(req, res);
});

app.post('/pbtcBalance', function(req, res) {
    pbtcBalanceAPI(req, res);
});

app.listen(9001);

util.log('-> Express server @localhost:9001');