var Chainlist = artifacts.require("./Chainlist.sol");

// test suite
contract('Chainlist', function(accounts) {
  var chainListInstance;
  var seller = accounts[1];
  var buyer = accounts[2];
  var articleName1 = "article 1";
  var articleDesc1 = "Desc for article 1";
  var articlePrice1 = 10;
  var sellerBalanceBeforeBuy, sellerBalanceAfterBuy;
  var buyerBalanceBeforeBuy, buyerBalanceAfterBuy;

  // No article for sale yet
  it("should throw an exception if you try to buy an article when there is no article for sale yet", function() {
    return Chainlist.deployed().then(function(instance){
      chainListInstance = instance;
      return chainListInstance.buyArticle(1, {from: buyer, value: web3.toWei(articlePrice1, "ether")})
    }).then(assert.fail)
    .catch(function(err) {
      assert(true);
    }).then(function() {
      return chainListInstance.getNoOfArticles();
    }).then(function(article) {
      assert.equal(article.toNumber(), 0, "Number of articles must be "+ 0);
    });
  });

  // buy an article that does not exist
  it("should throw an exception if you try to buy an article that does not exist", function() {
    return Chainlist.deployed().then(function(instance){
      chainListInstance = instance;
      return chainListInstance.sellArticle(articleName1, articleDesc1, web3.toWei(articlePrice1, "ether"), {from: seller})
    }).then(function(receipt) {
      return chainListInstance.buyArticle(2, {from: seller, value: web3.toWei(articlePrice1, "ether")})
    }).then(assert.fail)
    .catch(function(err) {
      assert(true);
    }).then(function() {
      return chainListInstance.articles(1);
    }).then(function(article) {
      assert.equal(article[0].toNumber(), 1, "Article ID must be "+ 1);
      assert.equal(article[1], seller, "article seller must be " + seller);
      assert.equal(article[2], 0x0, "article buyer must be empty");
      assert.equal(article[3], articleName1, "article name must be " + articleName1);
      assert.equal(article[4], articleDesc1, "article description must be " + articleDesc1);
      assert.equal(article[5].toNumber(), web3.toWei(articlePrice1, "ether"), "article price must be " + web3.toWei(articlePrice1, "ether"));
    });
  });

  // buying an article you are selling
  it("should throw an exception if you try to buy your own article", function() {
    return Chainlist.deployed().then(function(instance){
      chainListInstance = instance;
      return chainListInstance.buyArticle(1, {from: seller, value: web3.toWei(articlePrice1, "ether")})
    }).then(assert.fail)
    .catch(function(err) {
      assert(true);
    }).then(function() {
      return chainListInstance.articles(1);
    }).then(function(article) {
      assert.equal(article[0].toNumber(), 1, "Article ID must be "+ 1);
      assert.equal(article[1], seller, "article seller must be " + seller);
      assert.equal(article[2], 0x0, "article buyer must be empty");
      assert.equal(article[3], articleName1, "article name must be " + articleName1);
      assert.equal(article[4], articleDesc1, "article description must be " + articleDesc1);
      assert.equal(article[5].toNumber(), web3.toWei(articlePrice1, "ether"), "article price must be " + web3.toWei(articlePrice1, "ether"));
    });
  });

  // Incorrect value
  it("should throw an exception if you try to buy an article for a different price ", function() {
    return Chainlist.deployed().then(function(instance){
      chainListInstance = instance;
      return chainListInstance.buyArticle(1, {from: buyer, value: web3.toWei(articlePrice - 5, "ether")})
    }).then(assert.fail)
    .catch(function(err) {
      assert(true);
    }).then(function() {
      return chainListInstance.articles(1);
    }).then(function(article) {
      assert.equal(article[0].toNumber(), 1, "Article ID must be "+ 1);
      assert.equal(article[1], seller, "article seller must be " + seller);
      assert.equal(article[2], 0x0, "article buyer must be empty");
      assert.equal(article[3], articleName1, "article name must be " + articleName1);
      assert.equal(article[4], articleDesc1, "article description must be " + articleDesc1);
      assert.equal(article[5].toNumber(), web3.toWei(articlePrice1, "ether"), "article price must be " + web3.toWei(articlePrice1, "ether"));
    });
  });

  // article has already been sold
  it("should throw an exception if you try to buy an article that has already been sold ", function() {
    return Chainlist.deployed().then(function(instance){
      chainListInstance = instance;
      return chainListInstance.buyArticle(1, {from: buyer, value: web3.toWei(articlePrice, "ether")})
    }).then(function(){
      return chainListInstance.buyArticle(1, {from: web3.eth.accounts[0], value: web3.toWei(articlePrice, "ether")})
    }).then(assert.fail)
    .catch(function(err) {
      assert(true);
    }).then(function() {
      return chainListInstance.articles(1);
    }).then(function(article) {
      assert.equal(article[0].toNumber(), 1, "Article ID must be "+ 1);
      assert.equal(article[1], seller, "article seller must be " + seller);
      assert.equal(article[2], 0x0, "article buyer must be empty");
      assert.equal(article[3], articleName1, "article name must be " + articleName1);
      assert.equal(article[4], articleDesc1, "article description must be " + articleDesc1);
      assert.equal(article[5].toNumber(), web3.toWei(articlePrice1, "ether"), "article price must be " + web3.toWei(articlePrice1, "ether"));
    });
  });

});
