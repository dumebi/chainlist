App = {
     web3Provider: null,
     contracts: {},
     account: 0x0,

     init: function() {
      // load articles row
      // var articlesRow = $('#articlesRow');
      // var articleTemplate = $('#articleTemplate');
      //
      // articleTemplate.find('.panel-title').text('Article 1');
      // articleTemplate.find('.article-description').text('Description for article 1');
      // articleTemplate.find('.article-price').text('10.23');
      // articleTemplate.find('.article-seller').text('0x12345678901234567890');
      //
      // articlesRow.append(articleTemplate.html());
      return App.initWeb3();
     },

     initWeb3: function() {
      // initialize web3
      if(typeof web3 !== 'undefined') {
        // re-use a provider of the web3 object provided by metamask
        App.web3Provider = web3.currentProvider;
      } else {
        // create a new provider and plug directly into our local node
        App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      }
      web3 = new Web3(App.web3Provider);

      App.displayAccountInfo();
      return App.initContract();
     },

     displayAccountInfo: function() {
       web3.eth.getCoinbase(function(err, account) {
         if(err === null){
           App.account = account;
           $('#account').text(account)
           web3.eth.getBalance(account, function(err, balance) {
             if(err === null){
              $('#accountBalance').text(web3.fromWei(balance, "ether")+" ETH")
             }
           })
         }
       })
     },

     initContract: function() {
      $.getJSON('Chainlist.json', function(chainlistArtifact) {
        // get the contract artifact file and use it to instantiate a truffle contract abstraction
        App.contracts.Chainlist = TruffleContract(chainlistArtifact);
        // set the provider for our contract so it knows which node to talk to
        App.contracts.Chainlist.setProvider(App.web3Provider);
        // retrieve the article from the contracts
        return App.reloadArticles();
      })
     },

     reloadArticles: function() {
      // refresh account info - because balance might have changed
      App.displayAccountInfo();

      // retrieve account placeholder and clear
      $('#articlesRow').empty();
      App.contracts.Chainlist.deployed().then(function(instance) {
        return instance.getArticle();
      }).then(function(article) {
        if(article[0] == 0x0){
          // no article
          return
        } else {
          var articlesRow = $('#articlesRow');
          var articleTemplate = $('#articleTemplate');

          articleTemplate.find('.panel-title').text(article[1]);
          articleTemplate.find('.article-description').text(article[2]);
          articleTemplate.find('.article-price').text(web3.fromWei(article[3], "ether"));

          var seller = article[0];
          if(seller == App.account){
            seller = 'You'
          }
          articleTemplate.find('.article-seller').text(seller);

          // Add article to articlesRow
          articlesRow.append(articleTemplate.html());
        }
      }).catch(function(err) {
        console.err(err)
      });
     }
};

$(function() {
     $(window).load(function() {
          App.init();
     });
});
