pragma solidity ^0.4.18;

contract Chainlist {
  // state variables
  address seller;
  address buyer;
  string name;
  string description;
  uint256 price;

  // events
  event LogSellArticle(
    address indexed _seller,
    string _name,
    uint256 _price
    );

  event LogBuyArticle(
    address indexed _seller,
    address indexed _buyer,
    string _name,
    uint256 _price
    );

  // constructor
  /* function Chainlist() public {
    sellArticle("Default Article", "This is an article set by default", 1000000000000000000);
  } */
  // sell an article
  function sellArticle(string _name, string _description, uint256 _price) public {
    seller = msg.sender;
    name = _name;
    description = _description;
    price = _price;

    LogSellArticle(seller, name, price);
  }

  // get an sellArticle
  function getArticle() public view returns(
    address _seller,
    address _buyer,
    string _name,
    string _description,
    uint256 _price) {
      return(seller, buyer, name, description, price);
  }

  // Buy an articles
  function buyArticle() payable public {
    // we check if there is an article for sale
    require(seller != 0x0);

    // check that the article has ot been sold yet
    require(buyer == 0x0);

    // Dont allow seller to buy its own article
    require(seller != msg.sender);

    // Value sent corresponds to price of article
    require(msg.value == price);

    // keep buyer's info
    buyer = msg.sender;

    // buyer can pay sender
    seller.transfer(msg.value);

    LogBuyArticle(seller, buyer, name, price);
  }
}
