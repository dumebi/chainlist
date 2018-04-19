var Chainlist = artifacts.require("./Chainlist.sol");

// test suite
contract('Chainlist', function(accounts) {
  var chainListInstance;
  var seller = accounts[1];
  var buyer = accounts[2];
  var articleName = "article 1";
  var articleDesc = "Desc for article 1";
  var articlePrice = 10;
  var sellerBalanceBeforeBuy, sellerBalanceAfterBuy;
  var buyerBalanceBeforeBuy, buyerBalanceAfterBuy;

  // No article for sale yet
  it("should throw an exception if you try to buy an article when there is no article for sale yet", function() {
    return Chainlist.deployed().then(function(instance){
      chainListInstance = instance;
      return chainListInstance.buyArticle({from: buyer, value: web3.toWei(articlePrice, "ether")})
    }).then(assert.fail)
    .catch(function(err) {
      assert(true);
    }).then(function() {
      return chainListInstance.getArticle();
    }).then(function(article) {
      assert.equal(article[0], 0x0, "seller must be empty");
      assert.equal(article[1], 0x0, "buyer must be empty");
      assert.equal(article[2], "", "name must be empty");
      assert.equal(article[3], "", "description must be empty");
      assert.equal(article[4].toNumber(), 0, "price must be 0");
    });
  });

  // buying an article you are selling
  it("should throw an exception if you try to buy your own article", function() {
    return Chainlist.deployed().then(function(instance){
      chainListInstance = instance;
      return chainListInstance.sellArticle(articleName, articleDesc, web3.toWei(articlePrice, "ether"), {from: seller})
    }).then(function(receipt) {
      return chainListInstance.buyArticle({from: seller, value: web3.toWei(articlePrice, "ether")})
    }).then(assert.fail)
    .catch(function(err) {
      assert(true);
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

  // Incorrect value
  it("should throw an exception if you try to buy an article for a different price ", function() {
    return Chainlist.deployed().then(function(instance){
      chainListInstance = instance;
      return chainListInstance.buyArticle({from: buyer, value: web3.toWei(articlePrice - 5, "ether")})
    }).then(assert.fail)
    .catch(function(err) {
      assert(true);
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

  // article has already been sold
  it("should throw an exception if you try to buy an article that has already been sold ", function() {
    return Chainlist.deployed().then(function(instance){
      chainListInstance = instance;
      return chainListInstance.buyArticle({from: buyer, value: web3.toWei(articlePrice, "ether")})
    }).then(function(){
      return chainListInstance.buyArticle({from: buyer, value: web3.toWei(articlePrice - 5, "ether")})
    }).then(assert.fail)
    .catch(function(err) {
      assert(true);
    }).then(function() {
      return chainListInstance.getArticle();
    }).then(function(article) {
      assert.equal(article[0], seller, "seller must be "+ seller);
      assert.equal(article[1], buyer, "buyer must be "+buyer);
      assert.equal(article[2], articleName, "name must be "+ articleName);
      assert.equal(article[3], articleDesc, "description must be "+ articleDesc);
      assert.equal(article[4].toNumber(), web3.toWei(articlePrice, "ether"), "price must be"+ web3.toWei(articlePrice, "ether"));
    });
  });

});
