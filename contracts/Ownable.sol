pragma solidity ^0.4.18;

contract Ownable {
  address owner;

  // function modifiers
  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  // define parent constructor
  function Ownable() public {
    owner = msg.sender;
  }
}
