var Chainlist = artifacts.require("./Chainlist.sol");

//test suite
contract('Chainlist', function(accounts) {
  var chainListInstance;
  var seller = accounts[1];
  var buyer = accounts[2];
  var articleName = "article 1";
  var articleDesc = "Desc for article 1";
  var articlePrice = 10;
  var sellerBalanceBeforeBuy, sellerBalanceAfterBuy;
  var buyerBalanceBeforeBuy, buyerBalanceAfterBuy;

  it("should be initialized with empty values", function() {
    return Chainlist.deployed().then(function(instance){
      return instance.getArticle();
    }).then(function(article) {
      assert.equal(article[0], 0x0, "seller must be empty");
      assert.equal(article[1], 0x0, "buyer must be empty");
      assert.equal(article[2], "", "name must be empty");
      assert.equal(article[3], "", "description must be empty");
      assert.equal(article[4].toNumber(), 0, "price must be 0");
    });
  });

  it("should sell an article", function() {
    return Chainlist.deployed().then(function(instance){
      chainListInstance = instance;
      return chainListInstance.sellArticle(articleName, articleDesc, web3.toWei(articlePrice, "ether"), {from: seller})
    }).then(function() {
      return chainListInstance.getArticle();
    }).then(function(article) {
      assert.equal(article[0], seller, "seller must be"+ seller);
      assert.equal(article[1], 0x0, "buyer must be empty");
      assert.equal(article[2], articleName, "name must be "+ articleName);
      assert.equal(article[3], articleDesc, "description must be "+ articleDesc);
      assert.equal(article[4].toNumber(), web3.toWei(articlePrice, "ether"), "price must be"+ web3.toWei(articlePrice, "ether"));
    });
  });

  it("should buy an article", function() {
    return Chainlist.deployed().then(function(instance){
      chainListInstance = instance;
      // record balances of seller and buyer before the buy
      sellerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
      buyerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();
      return chainListInstance.buyArticle({from: buyer, value: web3.toWei(articlePrice, "ether")})
    }).then(function(receipt) {
      assert.equal(receipt.logs.length, 1, "One event should have been triggered");
      assert.equal(receipt.logs[0].event, "LogBuyArticle", "event should be LogBuyArticle");
      assert.equal(receipt.logs[0].args._seller, seller, "event seller must be " + seller);
      assert.equal(receipt.logs[0].args._buyer, buyer, "event seller must be " + buyer);
      assert.equal(receipt.logs[0].args._name, articleName, "event article name must be " + articleName);
      assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice, "ether"), "event article price must be " + web3.toWei(articlePrice, "ether"));

      // record balances of seller and buyer after buy
      sellerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
      buyerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();

      // check the effect of the buy on balances of buyer and seller accounting for gas
      assert(sellerBalanceAfterBuy = sellerBalanceBeforeBuy + articlePrice, "seller should have earned "+articlePrice+" ETH");
      assert(buyerBalanceAfterBuy <= buyerBalanceBeforeBuy + articlePrice, "buyer should have spent "+articlePrice+" ETH plus gas");

      return chainListInstance.getArticle();
    }).then(function(article) {
      assert.equal(article[0], seller, "seller must be "+ seller);
      assert.equal(article[1], buyer, "buyer must be "+ buyer);
      assert.equal(article[2], articleName, "name must be "+ articleName);
      assert.equal(article[3], articleDesc, "description must be "+ articleDesc);
      assert.equal(article[4].toNumber(), web3.toWei(articlePrice, "ether"), "price must be"+ web3.toWei(articlePrice, "ether"));
    });
  });

  it("should trigger an event when an article is sold", function() {
    return Chainlist.deployed().then(function(instance){
      chainListInstance = instance;
      return chainListInstance.sellArticle(articleName, articleDesc, web3.toWei(articlePrice, "ether"), {from: seller})
    }).then(function(receipt) {
      assert.equal(receipt.logs.length, 1, "One event should have been triggered");
      assert.equal(receipt.logs[0].event, "LogSellArticle", "event should be LogSellArticle");
      assert.equal(receipt.logs[0].args._seller, seller, "event seller must be " + seller);
      assert.equal(receipt.logs[0].args._name, articleName, "event article name must be " + articleName);
      assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice, "ether"), "event article price must be " + web3.toWei(articlePrice, "ether"));
    });
  });

});
