App = {
  web3Provider: null,
  contracts: {},
  account: 0x0,
  coinbase: 0x0,
  coinbase_amount: 0,
  loading: false,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // initialize web3
    if(typeof web3 !== 'undefined') {
      //reuse the provider of the Web3 object injected by Metamask
      App.web3Provider = web3.currentProvider;
    } else {
      //create a new provider and plug it directly into our local node
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    App.getCoinbase();

    return App.initContract();
  },

  hostname: function() {
    return window.location.origin;
  },

  setAccount: function (address) {
    App.account = address;
  },

  displayAccountInfo: function() {
    // console.log(App);
    if(App.account != 0){
      $('#account').text(App.account);
      web3.eth.getBalance(App.account, function(err, balance) {
          if(err === null) {
              $('#accountBalance').text(web3.fromWei(balance, "ether") + " ETH");
          }
      })
    }
  },

  getCoinbase: function() {
    web3.eth.getCoinbase(function(err, account) {
      if(err === null) {
        App.coinbase = account;
        $('#account').text(account);
        web3.eth.getBalance(account, function(err, balance) {
          if(err === null) {
            App.coinbase_amount = web3.fromWei(balance, "ether").toNumber();
          }
        })
      }
    });
  },

  register: function() {
    let email = $('#inputEmail');
    let fname = $('#inputFname');
    let lname = $('#inputLname');
    let password = $('#inputPassword');
    let btnRegister = $('#btnRegister');
    if(email.val() == "" || fname.val() == "" || lname.val() == "" || password.val() == ""){
      toastr.error('Please fill all fields');
      return false;
    }
    btnRegister.attr("disabled", 'disabled');
    web3.personal.newAccount("pass@123", function(err, data) {
      let address = data;
      if(err === null) {
        let postData = {
          email: email.val(),
          fname: fname.val(),
          lname: lname.val(),
          password: password.val(),
          address: data
        }
          $.ajax({
              method: "POST",
              url: App.hostname() + "/register",
              data: postData,
              success: function (data) {
                console.log(data)
                if(data.status == "success"){
                  web3.eth.sendTransaction({from:App.coinbase, to:address, value: web3.toWei(5, "ether")}, function(err, result) {
                    if(err === null) {
                        console.log(result)
                    }
                    else{
                      console.log(err);
                    }
                    toastr.success("Success.");
                    window.location.href = App.hostname();
                  })
                }else{
                  toastr.error(data.data);
                }
                btnRegister.attr("disabled", false);
              },
              error: function (err) {
                toastr.error('Error Registering');
                btnRegister.attr("disabled", false);
              }
          });
      } else {
        toastr.error('Error Registering');
        btnRegister.attr("disabled", false);
        return false;
      }
    })
  },

  login: function() {
    let email = $('#inputEmail');
    let password = $('#inputPassword');
    let btnLogin = $('#btnLogin');
    if(email.val() == "" || password.val() == ""){
        toastr.error('Please fill all fields');
        return false;
    }
    btnLogin.attr("disabled", 'disabled');
    let postData = {
        email: email.val(),
        password: password.val(),
    }
    $.ajax({
        method: "POST",
        url: App.hostname() + "/login",
        data: postData,
        success: function (data) {
            console.log(data)
            if(data.status == "success"){
                toastr.success("Success.");
                window.location.href = App.hostname();
            }else{
                toastr.error(data.data);
            }
            btnLogin.attr("disabled", false);
        },
        error: function (err) {
            toastr.error('Error Registering');
            btnLogin.attr("disabled", false);
        }
    });
  },

  initContract: function() {
    $.getJSON('ChainList.json', function(chainListArtifact) {
      // get the contract artifact file and use it to instantiate a truffle contract abstraction
      App.contracts.ChainList = TruffleContract(chainListArtifact);
      // set the provider for our contracts
      App.contracts.ChainList.setProvider(App.web3Provider);
      // listen to events
      App.listenToEvents();
      // retrieve the article from the contract
      return App.reloadArticles();
    });
  },

  reloadArticles: function() {
    // avoid re-entry
    if(App.loading){
      return
    }
    App.loading = true
    // refresh account information because the balance might have changed
    App.displayAccountInfo();

    var chainListInstance;

    App.contracts.ChainList.deployed().then(function(instance) {
      chainListInstance =  instance;
      return chainListInstance.getArticlesForSale();
    }).then(function(articleIds) {
      $('#articlesRow').empty();
      for(var i = 0; i < articleIds.length; i++){
        var articleID = articleIds[i];
        chainListInstance.articles(articleID.toNumber())
        .then(function(article) {
          App.displayArticle(article[0], article[1], article[3], article[4], article[5] )
        });
      }

      App.loading = false;
    }).catch(function(err) {
      console.error(err.message);
      App.loading = false;
    });
  },

  sellArticle: function() {
    // retrieve the detail of the article
    var _article_name = $('#article_name').val();
    var _description = $('#article_description').val();
    var _price = web3.toWei(parseFloat($('#article_price').val() || 0), "ether");

    if((_article_name.trim() == '') || (_price == 0)) {
      // nothing to sell
      return false;
    }

    web3.personal.unlockAccount(App.account, "pass@123", 1000, function(err, result) {
      console.log(result);
      console.log(err);
        App.contracts.ChainList.deployed().then(function(instance) {
            return instance.sellArticle(_article_name, _description, _price, {
                from: App.account,
                gas: 500000
            });
        }).then(function(result) {

        }).catch(function(err) {
            console.error(err);
        });
    });
  },

  displayArticle: function(id, seller, name, description, price){
    var articlesRow = $('#articlesRow');
    var etherPrice = web3.fromWei(price, "ether");
    // retrieve the article template and fill it
    var articleTemplate = $('#articleTemplate');
    articleTemplate.find('.panel-title').text(name);
    articleTemplate.find('.article-description').text(description);
    articleTemplate.find('.article-price').text(etherPrice);
    articleTemplate.find('.btn-buy').attr('data-value', etherPrice);
    articleTemplate.find('.btn-buy').attr('data-id', id);

    if (seller == App.account) {
      articleTemplate.find('.article-seller').text("You");
      articleTemplate.find('.btn-buy').hide();
    } else {
      articleTemplate.find('.article-seller').text(seller);
      articleTemplate.find('.btn-buy').show();
    }
    // buyer
    // var buyer = article[1];
    // if (buyer == App.account) {
    //   buyer = "You";
    // } else if (buyer == 0x0){
    //  buyer = "None yet"
    // }
    // articleTemplate.find('.article-buyer').text(buyer);
    // add this article
    $('#articlesRow').append(articleTemplate.html());
  },

  // listen to events triggered by the contract
  listenToEvents: function() {
    App.contracts.ChainList.deployed().then(function(instance) {
      instance.LogSellArticle({}, {}).watch(function(error, event) {
        if (!error) {
          $("#events").append('<li class="list-group-item">' + event.args._name + ' is now for sale</li>');
        } else {
          console.error(error);
        }
        App.reloadArticles();
      });

      instance.LogBuyArticle({}, {}).watch(function(error, event) {
        if (!error) {
          $("#events").append('<li class="list-group-item">' + event.args._buyer + ' bought '+ event.args._name +'</li>');
        } else {
          console.error(error);
        }
        App.reloadArticles();
      });
    });
  },

  // retrieve article price from data-value and process buyArticle function
  buyArticle: function() {
    event.preventDefault();
    // retrieve article Price
    var price = parseFloat($(event.target).data('value'));
    var articleID = parseFloat($(event.target).data('id'));

    web3.personal.unlockAccount(App.account, "pass@123", 1000, function(err, result) {
        console.log(result);
        console.log(err);
        App.contracts.ChainList.deployed().then(function (instance) {
            return instance.buyArticle(articleID, {
                from: App.account,
                value: web3.toWei(price, "ether"),
                gas: 500000
            }).catch(function (error) {
                console.error(error);
            })
        });
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
