App = {
    web3Provider: null,
    contracts: {},
    account: 0x0,
    coinbase: 0x0,
    coinbase_amount: 0,
    loading: false,

    init: function () {
        return App.initWeb3();
    },


    initWeb3: function () {
        // initialize web3
        if (typeof web3 !== 'undefined') {
            //reuse the provider of the Web3 object injected by Metamask
            App.web3Provider = web3.currentProvider;
        } else {
            //create a new provider and plug it directly into our local node
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
            //App.web3Provider = new Web3.providers.HttpProvider('http://159.89.119.189:8545');
        }
        web3 = new Web3(App.web3Provider);

        App.getCoinbase();

        return App.initContract();
    },

    hostname: function () {
        return window.location.origin;
    },

    setAccount: function (address) {
        App.account = address;
    },

    displayAccountInfo: function () {
        // console.log(App);
        if (App.account != 0) {
            toastr.remove();
            toastr.info('Getting Account Info', {timeOut: 300000});
            $('#account').text(App.account);
            App.getBalance();
        }
    },

    getBalance: function() {
        web3.eth.getBalance(App.account, function (err, balance) {
            if (err === null) {
                if(web3.fromWei(balance, "ether") == 0){
                    setTimeout(App.getBalance(), 60000);
                } else {
                    console.log(web3.fromWei(balance, "ether"));
                    toastr.remove();
                    $('#accountBalance').text(web3.fromWei(balance, "ether") + " ETH");
                }
            }
        })
    },

    getCoinbase: function () {
        web3.eth.getCoinbase(function (err, account) {
            if (err === null) {
                App.coinbase = account;
                // $('#account').text(account);
                web3.eth.getBalance(account, function (err, balance) {
                    if (err === null) {
                        App.coinbase_amount = web3.fromWei(balance, "ether").toNumber();
                        console.log(App.coinbase, App.coinbase_amount)
                    }
                })
            }
        });
    },

    transfer: function() {
        web3.personal.unlockAccount(App.coinbase, "pass12345", 100000, function (err, result) {
            console.log(result)
            console.log(err)
        web3.personal.unlockAccount(App.account, "pass@123", 100000, function (err, result) {
            web3.eth.sendTransaction({
                from: App.coinbase,
                to: App.account,
                value: web3.toWei(10, "ether")
            }, function (err, result) {
                if (err == null) {
                    console.log("sent money");
                    console.log(result)
                    console.log(err)
                    web3.eth.getBalance(App.account, function (err, balance) {
                        if (err === null) {
                            console.log(web3.fromWei(balance, "ether") + " ETH");
                        }
                    })
                }
                else {
                    console.log(err);
                }
            })
        });
        });
    },

    register: function () {
        let email = $('#inputEmail');
        let fname = $('#inputFname');
        let lname = $('#inputLname');
        let password = $('#inputPassword');
        let btnRegister = $('#btnRegister');
        if (email.val() == "" || fname.val() == "" || lname.val() == "" || password.val() == "") {
            toastr.error('Please fill all fields');
            return false;
        }
        btnRegister.attr("disabled", 'disabled');
        web3.personal.newAccount("pass@123", function (err, data) {
            let address = data;
            if (err === null) {
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
                        if (data.status == "success") {
                            web3.personal.unlockAccount(address, "pass@123", 1000, function (err, result) {
                                web3.eth.sendTransaction({
                                    from: App.coinbase,
                                    to: address,
                                    value: web3.toWei(10, "ether")
                                }, function (err, result) {
                                    if (err == null) {
                                        console.log("sent money");
                                        console.log(result)
                                        web3.eth.getBalance(App.coinbase, function (err, balance) {
                                            if (err === null) {
                                                console.log("coinbase "+web3.fromWei(balance, "ether") + " ETH");
                                            }
                                        })
                                        web3.eth.getBalance(address, function (err, balance) {
                                            if (err === null) {
                                                console.log(web3.fromWei(balance, "ether") + " ETH");
                                            }
                                        })
                                    }
                                    else {
                                        console.log(err);
                                    }
                                    toastr.success("Success.");
                                    window.location.href = App.hostname();
                                })
                            });
                        } else {
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

    login: function () {
        let email = $('#inputEmail');
        let password = $('#inputPassword');
        let btnLogin = $('#btnLogin');
        if (email.val() == "" || password.val() == "") {
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
                if (data.status == "success") {
                    toastr.success("Success.");
                    window.location.href = App.hostname();
                } else {
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

    initContract: function () {
        $.getJSON('Chainlist.json', function (chainListArtifact) {
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

    reloadArticles: function () {
        // avoid re-entry
        if (App.loading) {
            return
        }
        App.loading = true
        // refresh account information because the balance might have changed
        App.displayAccountInfo();

        var chainListInstance;

        App.contracts.ChainList.deployed().then(function (instance) {
            chainListInstance = instance;
            return chainListInstance.getArticlesForSale();
        }).then(function (articleIds) {
            $('#articlesRow').empty();
            for (var i = 0; i < articleIds.length; i++) {
                var articleID = articleIds[i];
                chainListInstance.articles(articleID.toNumber())
                    .then(function (article) {
                        App.displayArticle(article[0], article[1], article[3], article[4], article[5], article[6])
                    });
            }

            App.loading = false;
        }).catch(function (err) {
            console.error(err.message);
            App.loading = false;
        });
    },

    sellArticle: function () {
        // retrieve the detail of the article
        var _article_name = $('#article_name').val();
        var _description = $('#article_description').val();
        var _price = web3.toWei(parseFloat($('#article_price').val() || 0), "ether");
        const file = $('#article_image').prop('files')[0];

        if ((_article_name.trim() == '') || (_price == 0)) {
            // nothing to sell
            return false;
        }

        const name = (+new Date()) + '-' + file.name;
        const metadata = {
            contentType: file.type
        };
        let ref = firebase.storage().ref();
        const task = ref.child(name).put(file, metadata);
        toastr.info('Processing.....', {timeOut: 30000});
        task.then((snapshot) => {
            const _image_url = snapshot.downloadURL;
            console.log(_image_url);
            web3.personal.unlockAccount(App.account, "pass@123", 1000, function (err, result) {
                console.log(result);
                console.log(err);
                App.contracts.ChainList.deployed().then(function (instance) {
                    return instance.sellArticle(_article_name, _description, _price, _image_url, {
                        from: App.account,
                        gas: 500000
                    });
                }).then(function (result) {
                    console.log(result);
                    $('#article_name').val("");
                    $('#article_description').val("");
                    $('#article_price').val("");
                    $('#article_image').val("");
                }).catch(function (err) {
                    console.error(err);
                });
            });
        }).catch((error) => {
            console.error(error);
        });


    },

    displayArticle: function (id, seller, name, description, price, image_url) {
        var articlesRow = $('#articlesRow');
        var etherPrice = web3.fromWei(price, "ether");
        // retrieve the article template and fill it
        var articleTemplate = $('#articleTemplate');
        articleTemplate.find('.panel-title').text(name);
        articleTemplate.find('.article-description').text(description);
        articleTemplate.find('.article-price').text(etherPrice);
        articleTemplate.find('.btn-image-url').attr('href', image_url);
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
        toastr.clear();
        $('#articlesRow').append(articleTemplate.html());
    },

    // listen to events triggered by the contract
    listenToEvents: function () {
        App.contracts.ChainList.deployed().then(function (instance) {
            instance.LogSellArticle({}, {}).watch(function (error, event) {
                if (!error) {
                    $("#events").append('<li class="list-group-item">' + event.args._name + ' is now for sale</li>');
                } else {
                    console.error(error);
                }
                App.reloadArticles();
            });

            instance.LogBuyArticle({}, {}).watch(function (error, event) {
                if (!error) {
                    $('#sellBtn').attr("disabled", false);
                    $("#events").append('<li class="list-group-item">' + event.args._buyer + ' bought ' + event.args._name + '</li>');
                } else {
                    console.error(error);
                }
                App.reloadArticles();
            });
        });
    },

    // retrieve article price from data-value and process buyArticle function
    buyArticle: function () {
        event.preventDefault();
        // retrieve article Price
        toastr.info('Processing.....', {timeOut: 30000});
        $(event.target).attr("disabled", 'disabled');
        $('#sellBtn').attr("disabled", 'disabled');
        var price = parseFloat($(event.target).data('value'));
        var articleID = parseFloat($(event.target).data('id'));

        web3.personal.unlockAccount(App.account, "pass@123", 1000, function (err, result) {
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
      // Initialize Firebase
      var config = {
          apiKey: "AIzaSyAQp34HzZS_3xckuxcVcsUWgCu8_p7UzxA",
          authDomain: "comflo-1518513183870.firebaseapp.com",
          databaseURL: "https://comflo-1518513183870.firebaseio.com",
          projectId: "comflo-1518513183870",
          storageBucket: "comflo-1518513183870.appspot.com",
          messagingSenderId: "798445619042"
      };
      firebase.initializeApp(config);
  });
});
