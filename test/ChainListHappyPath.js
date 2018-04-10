var Chainlist = artifacts.require("./Chainlist.sol");

//test suite
contract('Chainlist', function(accounts) {
  var chainListInstance;
  var seller = accounts[1];
  var articleName = "article 1";
  var articleDesc = "Desc for article 1";
  var articlePrice = 10;

  it("should be initialized with empty values", function() {
    return Chainlist.deployed().then(function(instance){
      return instance.getArticle();
    }).then(function(article) {
      assert.equal(article[0], 0x0, "seller must be empty");
      assert.equal(article[1], "", "name must be empty");
      assert.equal(article[2], "", "description must be empty");
      assert.equal(article[3].toNumber(), 0, "price must be 0");
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
      assert.equal(article[1], articleName, "name must be "+ articleName);
      assert.equal(article[2], articleDesc, "description must be "+ articleDesc);
      assert.equal(article[3].toNumber(), web3.toWei(articlePrice, "ether"), "price must be"+ web3.toWei(articlePrice, "ether"));
    });
  });
});
