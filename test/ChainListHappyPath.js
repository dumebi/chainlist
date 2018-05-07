var Chainlist = artifacts.require("./Chainlist.sol");

//test suite
contract('Chainlist', function(accounts) {
  var chainListInstance;
  var seller = accounts[1];
  var buyer = accounts[2];
  var articleName1 = "article 1";
  var articleDesc1 = "Desc for article 1";
  var articlePrice1 = 10;
  var articleFile1 = "http://lorempixel.com/";
  var articleName2 = "article 2";
  var articleDesc2 = "Desc for article 2";
  var articlePrice2 = 20;
  var articleFile2 = "http://lorempixel.com/";
  var sellerBalanceBeforeBuy, sellerBalanceAfterBuy;
  var buyerBalanceBeforeBuy, buyerBalanceAfterBuy;

  it("should be initialized with empty values", function() {
    return Chainlist.deployed().then(function(instance){
      chainListInstance = instance;
      return chainListInstance.getNoOfArticles();
    }).then(function(article) {
      assert.equal(article.toNumber(), 0, "Number of articles must be 0");
      return chainListInstance.getArticlesForSale();
    }).then(function(article) {
      assert.equal(article.length, 0, "there shouldnt be any article for sale");
    });
  });

  // sell a first article
  it("should let us sell a first article", function() {
    return Chainlist.deployed().then(function(instance){
      chainListInstance = instance;
      return chainListInstance.sellArticle(articleName1, articleDesc1, web3.toWei(articlePrice1, "ether"), articleFile1, {from: seller});
    }).then(function(receipt) {
      // check the event
      assert.equal(receipt.logs.length, 1, "One event should have been triggered");
      assert.equal(receipt.logs[0].event, "LogSellArticle", "event should be LogBLogSellArticleuyArticle");
      assert.equal(receipt.logs[0].args._id.toNumber(), 1, "id must be " + 1);
      assert.equal(receipt.logs[0].args._seller, seller, "event seller must be " + seller);
      assert.equal(receipt.logs[0].args._name, articleName1, "event article name must be " + articleName1);
      assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice1, "ether"), "event article price must be " + web3.toWei(articlePrice1, "ether"));

      return chainListInstance.getNoOfArticles();
    }).then(function(article) {
      assert.equal(article.toNumber(), 1, "Number of articles must be "+ 1);
      return chainListInstance.getArticlesForSale();
    }).then(function(article) {
      assert.equal(article.length, 1, "Number of articles for sale must be "+ 1);
      assert.equal(article[0].toNumber(), 1, "Article ID must be "+ 1);
      return chainListInstance.articles(article[0])
    }).then(function(article) {
      assert.equal(article[0].toNumber(), 1, "Article ID must be "+ 1);
      assert.equal(article[1], seller, "article seller must be " + seller);
      assert.equal(article[2], 0x0, "article buyer must be empty");
      assert.equal(article[3], articleName1, "article name must be " + articleName1);
      assert.equal(article[4], articleDesc1, "article description must be " + articleDesc1);
      assert.equal(article[5].toNumber(), web3.toWei(articlePrice1, "ether"), "article price must be " + web3.toWei(articlePrice1, "ether"));
    });
  });

  // sell a second article
  it("should let us sell a second article", function() {
    return Chainlist.deployed().then(function(instance){
      chainListInstance = instance;
      return chainListInstance.sellArticle(articleName2, articleDesc2, web3.toWei(articlePrice2, "ether"), articleFile2, {from: seller});
    }).then(function(receipt) {
      // check the event
      assert.equal(receipt.logs.length, 1, "One event should have been triggered");
      assert.equal(receipt.logs[0].event, "LogSellArticle", "event should be LogBLogSellArticleuyArticle");
      assert.equal(receipt.logs[0].args._id.toNumber(), 2, "id must be " + 2);
      assert.equal(receipt.logs[0].args._seller, seller, "event seller must be " + seller);
      assert.equal(receipt.logs[0].args._name, articleName2, "event article name must be " + articleName2);
      assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice2, "ether"), "event article price must be " + web3.toWei(articlePrice2, "ether"));

      return chainListInstance.getNoOfArticles();
    }).then(function(article) {
      assert.equal(article.toNumber(), 2, "Number of articles must be "+ 2);
      return chainListInstance.getArticlesForSale();
    }).then(function(article) {
      assert.equal(article.length, 2, "Number of articles for sale must be "+ 2);
      assert.equal(article[1].toNumber(), 2, "Article ID must be "+ 2);
      return chainListInstance.articles(article[1])
    }).then(function(article) {
      assert.equal(article[0].toNumber(), 2, "Article ID must be "+ 2);
      assert.equal(article[1], seller, "article seller must be " + seller);
      assert.equal(article[2], 0x0, "article buyer must be empty");
      assert.equal(article[3], articleName2, "article name must be " + articleName2);
      assert.equal(article[4], articleDesc2, "article description must be " + articleDesc2);
      assert.equal(article[5].toNumber(), web3.toWei(articlePrice2, "ether"), "article price must be " + web3.toWei(articlePrice2, "ether"));
    });
  });

  // it("should sell an article", function() {
  //   return Chainlist.deployed().then(function(instance){
  //     chainListInstance = instance;
  //     return chainListInstance.sellArticle(articleName, articleDesc, web3.toWei(articlePrice, "ether"), {from: seller})
  //   }).then(function() {
  //     return chainListInstance.getArticle();
  //   }).then(function(article) {
  //     assert.equal(article[0], seller, "seller must be"+ seller);
  //     assert.equal(article[1], 0x0, "buyer must be empty");
  //     assert.equal(article[2], articleName, "name must be "+ articleName);
  //     assert.equal(article[3], articleDesc, "description must be "+ articleDesc);
  //     assert.equal(article[4].toNumber(), web3.toWei(articlePrice, "ether"), "price must be"+ web3.toWei(articlePrice, "ether"));
  //   });
  // });

  // when we try to buy the first article
  it("should buy an article", function() {
    return Chainlist.deployed().then(function(instance){
      chainListInstance = instance;
      // record balances of seller and buyer before the buy
      sellerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
      buyerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();
      return chainListInstance.buyArticle(1, {from: buyer, value: web3.toWei(articlePrice1, "ether")})
    }).then(function(receipt) {
      assert.equal(receipt.logs.length, 1, "One event should have been triggered");
      assert.equal(receipt.logs[0].event, "LogBuyArticle", "event should be LogBuyArticle");
      assert.equal(receipt.logs[0].args._id.toNumber(), 1, "event id must be " + 1);
      assert.equal(receipt.logs[0].args._seller, seller, "event seller must be " + seller);
      assert.equal(receipt.logs[0].args._buyer, buyer, "event buyer must be " + buyer);
      assert.equal(receipt.logs[0].args._name, articleName1, "event article name must be " + articleName1);
      assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice1, "ether"), "event article price must be " + web3.toWei(articlePrice1, "ether"));

      // record balances of seller and buyer after buy
      sellerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
      buyerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();

      // check the effect of the buy on balances of buyer and seller accounting for gas
      assert(sellerBalanceAfterBuy = sellerBalanceBeforeBuy + articlePrice1, "seller should have earned "+articlePrice1+" ETH");
      assert(buyerBalanceAfterBuy <= buyerBalanceBeforeBuy + articlePrice1, "buyer should have spent "+articlePrice1+" ETH plus gas");

      return chainListInstance.getArticlesForSale();
    }).then(function(article) {
      assert.equal(article.length, 1, "Number of articles for sale must now be "+ 1);
      assert.equal(article[0].toNumber(), 2, "Article ID left for sale must be "+ 2);
      return chainListInstance.getNoOfArticles();
    }).then(function(article) {
      assert.equal(article.toNumber(), 2, "Number of articles must still be "+ 2);
    });
  });

  // it("should trigger an event when an article is sold", function() {
  //   return Chainlist.deployed().then(function(instance){
  //     chainListInstance = instance;
  //     return chainListInstance.sellArticle(articleName, articleDesc, web3.toWei(articlePrice, "ether"), {from: seller})
  //   }).then(function(receipt) {
  //     assert.equal(receipt.logs.length, 1, "One event should have been triggered");
  //     assert.equal(receipt.logs[0].event, "LogSellArticle", "event should be LogSellArticle");
  //     assert.equal(receipt.logs[0].args._seller, seller, "event seller must be " + seller);
  //     assert.equal(receipt.logs[0].args._name, articleName, "event article name must be " + articleName);
  //     assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice, "ether"), "event article price must be " + web3.toWei(articlePrice, "ether"));
  //   });
  // });

});
