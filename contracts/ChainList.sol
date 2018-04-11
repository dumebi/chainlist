pragma solidity ^0.4.18;

contract Chainlist {
  // state variables
  address seller;
  string name;
  string description;
  uint256 price;

  // constructor
  function Chainlist() public {
    sellArticle("Default Article", "This is an article set by default", 1000000000000000000);
  }
  // sell an article
  function sellArticle(string _name, string _description, uint256 _price) public {
    seller = msg.sender;
    name = _name;
    description = _description;
    price = _price;
  }

  // get an sellArticle
  function getArticle() public view returns(
    address _seller,
    string _name,
    string _description,
    uint256 _price) {
      return(seller, name, description, price);
  }
}
