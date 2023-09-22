// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// STEP -1 -------------------------------------------------------------------------
contract Dappazon {

    address public owner;

// STEP -2.1 ---------------------------------------------------------------------
    struct Item {
        uint256 id;
        string name;
        string category;
        string image;
        uint256 cost;
        uint256 rating;
        uint256 stock;
    }

// STEP -3.1 --------------------------------------------------------------------
    struct Order {
        uint256 time;
        Item item;
    }

// STEP -2.2 --------------------------------------------------------
    mapping(uint256 => Item) public items;
// STEP -2.3 -------------------------------------------------------
    mapping(address => mapping(uint256 => Order)) public orders;
// STEP -2.4 ------------------------------------------------------
    mapping(address => uint256) public orderCount;

    event Buy(address buyer, uint256 orderId, uint256 itemId);
    event List(string name, uint256 cost, uint256 quantity);

// STEP -Any-Time -------------------------------------------------
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

// STEP -1.1 ------------------------------------------------------------------------
        constructor() {
            owner = msg.sender; // msg.sender address inside constructer is of deployer, and 1st address of ethers.getSigners() is always deployer
            // bydefault. 
        }

// STEP -2 -----------------------------------------------------------------------
        function list(
        uint256 _id,
        string memory _name,
        string memory _category,
        string memory _image,
        uint256 _cost,
        uint256 _rating,
        uint256 _stock
    ) public onlyOwner {
        // Create Item
        Item memory item = Item(
            _id,
            _name,
            _category,
            _image,
            _cost,
            _rating,
            _stock
        );

        // Add Item to mapping
        items[_id] = item;

        // Emit event
        emit List(_name, _cost, _stock);
    }

// STEP -3 -----------------------------------------------------------------------------------
    function buy(uint256 _id) public payable {
        // Fetch item
        // Mapping is also a kind of function, that can be called via another function.
        // just in below code when items mapping is defined in 'list' function but can be called in 'buy' function.
        Item memory item = items[_id];

        // Require enough ether to buy item
        require(msg.value >= item.cost);

        // Require item is in stock
        require(item.stock > 0);

        // Create order
        Order memory order = Order(block.timestamp, item);

        // Add order for user
        orderCount[msg.sender]++; // <-- Order ID
        orders[msg.sender][orderCount[msg.sender]] = order; // ye user side ke liye important h

        // Subtract stock
        items[_id].stock = item.stock - 1; // ye contract ke side ke liye important h.

// STEP - 5 - For-Different_Branch-------------------------------------------------------------------
        // Pay to owner
        // payable(owner).transfer(address(this).balance);
        
        //(bool success, ) = owner.call{value: address(this).balance}("");
        //require(success);

        // Emit event
        emit Buy(msg.sender, orderCount[msg.sender], item.id);
    }

// STEP -4 --------------------------------------------------
    function withdraw() public onlyOwner {
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success);
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
