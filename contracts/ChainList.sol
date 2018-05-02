pragma solidity ^0.4.18;

import "./Ownable.sol";

contract Chainlist is Ownable{
  // custom types
  struct Article {
    uint id;
    address seller;
    address buyer;
    string name;
    string description;
    uint256 price;
    string image_url;
  }

  // state variables
  /* address owner; */
  mapping (uint => Article) public articles;
  uint articleCounter;

  // events
  event LogSellArticle(
    uint indexed _id,
    address indexed _seller,
    string _name,
    uint256 _price
    );

  event LogBuyArticle(
    uint indexed _id,
    address indexed _seller,
    address indexed _buyer,
    string _name,
    uint256 _price
    );

  // function modifiers
  /* modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  } */

  // constructor
  /* function Chainlist() public {
    owner = msg.sender;
  } */

  function kill() public onlyOwner {
    //only allow contract owner
    /* require(msg.sender == owner); */

    selfdestruct(owner);
  }

  // sell an article
  function sellArticle(string _name, string _description, uint256 _price, string _image_url) public {
    /* seller = msg.sender;
    name = _name;
    description = _description;
    price = _price; */

    articleCounter++;

    // storing this article
    articles[articleCounter] = Article(
      articleCounter,
      msg.sender,
      0x0,
      _name,
      _description,
      _price,
      _image_url
      );

    LogSellArticle(articleCounter, msg.sender, _name, _price);
  }

  // get an sellArticle
  /* function getArticle() public view returns(
    address _seller,
    address _buyer,
    string _name,
    string _description,
    uint256 _price) {
      return(seller, buyer, name, description, price);
  } */

  // fetch and return all article IDs for articles still for sale
  function getArticlesForSale() public view returns(uint[]) {
    // prepare output array
    uint[] memory articleIds = new uint[](articleCounter);

    uint numberOfArticlesForSale = 0;
    for(uint i = 1; i <= articleCounter; i++){
      // keep the ID if the article is stil for sale
      if(articles[i].buyer == 0x0){
        articleIds[numberOfArticlesForSale] = articles[i].id;
        numberOfArticlesForSale++;
      }
    }

    // copy the articleIds array into a smaller forSale array
    uint[] memory forSale = new uint[](numberOfArticlesForSale);
    for(uint j = 0; j < numberOfArticlesForSale; j++){
      // keep the ID if the article is stil for sale
      forSale[j] = articleIds[j];
    }

    return forSale;
  }

  // gets the number of articles
  function getNoOfArticles() public view returns(uint) {
    return articleCounter;
  }

  // Buy an articles
  function buyArticle(uint _id) payable public {
    // we check if there are articles for sale
    require(articleCounter > 0);

    // we check that the article exists
    require(_id > 0 && _id <= articleCounter);

    // retrieve the article from the mapping
    Article storage article = articles[_id];

    // check that the article has ot been sold yet
    require(article.buyer == 0x0);

    // Dont allow seller to buy its own article
    require(article.seller != msg.sender);

    // Value sent corresponds to price of article
    require(msg.value == article.price);

    // keep buyer's info
    article.buyer = msg.sender;

    // buyer can pay sender
    article.seller.transfer(msg.value);

    LogBuyArticle(_id, article.seller, article.buyer, article.name, article.price);
  }
}
