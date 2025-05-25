// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title FUSEToken
 * @dev ERC20 token for FUSEtech platform - Transforme exercícios em recompensas
 */
contract FUSEToken is ERC20, ERC20Burnable, Pausable, AccessControl, ReentrancyGuard {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // Maximum supply: 1 billion FUSE tokens
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18;
    
    // Activity tracking
    mapping(address => uint256) public totalActivityRewards;
    mapping(address => uint256) public totalRedemptions;
    mapping(string => bool) public processedActivities;
    
    // Marketplace tracking
    mapping(address => string[]) public userPurchases;
    mapping(string => uint256) public itemPrices;
    
    // Events
    event ActivityReward(
        address indexed user,
        string indexed activityId,
        uint256 amount,
        string activityType,
        uint256 timestamp
    );
    
    event TokenRedemption(
        address indexed user,
        uint256 amount,
        string indexed itemId,
        string itemName,
        uint256 timestamp
    );
    
    event ItemPriceUpdated(
        string indexed itemId,
        uint256 oldPrice,
        uint256 newPrice
    );

    constructor(
        string memory name,
        string memory symbol,
        address admin
    ) ERC20(name, symbol) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
        
        // Mint initial supply to admin (10% of max supply)
        _mint(admin, 100_000_000 * 10**18);
    }

    /**
     * @dev Mint tokens as reward for physical activity
     * @param user Address of the user who completed the activity
     * @param activityId Unique identifier for the activity
     * @param amount Amount of FUSE tokens to mint
     * @param activityType Type of activity (running, cycling, etc.)
     */
    function mintForActivity(
        address user,
        string memory activityId,
        uint256 amount,
        string memory activityType
    ) public onlyRole(MINTER_ROLE) whenNotPaused nonReentrant {
        require(user != address(0), "Invalid user address");
        require(amount > 0, "Amount must be greater than 0");
        require(!processedActivities[activityId], "Activity already processed");
        require(totalSupply() + amount <= MAX_SUPPLY, "Would exceed max supply");
        
        // Mark activity as processed
        processedActivities[activityId] = true;
        
        // Update user's total activity rewards
        totalActivityRewards[user] += amount;
        
        // Mint tokens to user
        _mint(user, amount);
        
        emit ActivityReward(user, activityId, amount, activityType, block.timestamp);
    }

    /**
     * @dev Redeem tokens for marketplace items
     * @param user Address of the user redeeming tokens
     * @param amount Amount of FUSE tokens to redeem
     * @param itemId Unique identifier for the marketplace item
     * @param itemName Name of the item being purchased
     */
    function redeemTokens(
        address user,
        uint256 amount,
        string memory itemId,
        string memory itemName
    ) public onlyRole(MINTER_ROLE) whenNotPaused nonReentrant {
        require(user != address(0), "Invalid user address");
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(user) >= amount, "Insufficient balance");
        
        // Burn tokens from user
        _burn(user, amount);
        
        // Update user's total redemptions
        totalRedemptions[user] += amount;
        
        // Add to user's purchase history
        userPurchases[user].push(itemId);
        
        emit TokenRedemption(user, amount, itemId, itemName, block.timestamp);
    }

    /**
     * @dev Set price for marketplace item (admin only)
     * @param itemId Unique identifier for the item
     * @param price Price in FUSE tokens (with 18 decimals)
     */
    function setItemPrice(
        string memory itemId,
        uint256 price
    ) public onlyRole(ADMIN_ROLE) {
        uint256 oldPrice = itemPrices[itemId];
        itemPrices[itemId] = price;
        
        emit ItemPriceUpdated(itemId, oldPrice, price);
    }

    /**
     * @dev Batch mint for multiple users (gas optimization)
     * @param users Array of user addresses
     * @param amounts Array of amounts to mint
     * @param activityIds Array of activity IDs
     * @param activityTypes Array of activity types
     */
    function batchMintForActivity(
        address[] memory users,
        uint256[] memory amounts,
        string[] memory activityIds,
        string[] memory activityTypes
    ) public onlyRole(MINTER_ROLE) whenNotPaused {
        require(
            users.length == amounts.length &&
            amounts.length == activityIds.length &&
            activityIds.length == activityTypes.length,
            "Array lengths must match"
        );
        
        for (uint256 i = 0; i < users.length; i++) {
            mintForActivity(users[i], activityIds[i], amounts[i], activityTypes[i]);
        }
    }

    /**
     * @dev Get user's purchase history
     * @param user Address of the user
     * @return Array of item IDs purchased by the user
     */
    function getUserPurchases(address user) public view returns (string[] memory) {
        return userPurchases[user];
    }

    /**
     * @dev Get user's activity statistics
     * @param user Address of the user
     * @return totalRewards Total FUSE earned from activities
     * @return totalSpent Total FUSE spent on redemptions
     * @return currentBalance Current FUSE balance
     */
    function getUserStats(address user) public view returns (
        uint256 totalRewards,
        uint256 totalSpent,
        uint256 currentBalance
    ) {
        totalRewards = totalActivityRewards[user];
        totalSpent = totalRedemptions[user];
        currentBalance = balanceOf(user);
    }

    /**
     * @dev Emergency withdrawal function (admin only)
     * @param token Address of the token to withdraw (use address(0) for ETH)
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(
        address token,
        uint256 amount
    ) public onlyRole(ADMIN_ROLE) {
        if (token == address(0)) {
            payable(msg.sender).transfer(amount);
        } else {
            IERC20(token).transfer(msg.sender, amount);
        }
    }

    /**
     * @dev Pause contract (emergency stop)
     */
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause contract
     */
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @dev Override _beforeTokenTransfer to add pause functionality
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }

    /**
     * @dev Check if activity has been processed
     * @param activityId The activity ID to check
     * @return bool True if activity has been processed
     */
    function isActivityProcessed(string memory activityId) public view returns (bool) {
        return processedActivities[activityId];
    }

    /**
     * @dev Get item price
     * @param itemId The item ID to check
     * @return uint256 Price in FUSE tokens
     */
    function getItemPrice(string memory itemId) public view returns (uint256) {
        return itemPrices[itemId];
    }

    /**
     * @dev Get contract statistics
     * @return totalSupplyAmount Current total supply
     * @return maxSupplyAmount Maximum possible supply
     * @return remainingSupply Remaining tokens that can be minted
     */
    function getContractStats() public view returns (
        uint256 totalSupplyAmount,
        uint256 maxSupplyAmount,
        uint256 remainingSupply
    ) {
        totalSupplyAmount = totalSupply();
        maxSupplyAmount = MAX_SUPPLY;
        remainingSupply = MAX_SUPPLY - totalSupplyAmount;
    }
}
