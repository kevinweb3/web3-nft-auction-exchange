// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

/**
 * @dev 固定拍卖价格
 */

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract AuctionFixedPrice is IERC721Receiver {
    /**
     * @dev 定义拍卖过程订单详情
     */
    struct auctionDetails {
        address seller;
        uint256 price;
        uint256 duration;
        address tokenAddress;
        bool isActive;
    }

    mapping(address => mapping(uint256 => auctionDetails))
        public tokenToAuction;

    /**
     * @dev 创建卖家拍卖信息
     * @dev 创建NFT Token需要的5个基本参数
     * @param _nft nft地址
     * @param _tokenId tokenId
     * @param _tokenAddress token address
     * @param _price nft价格
     * @param _duration nft拍卖持续时间
     */

    function createTokenAution(
        address _nft,
        uint256 _tokenId,
        address _tokenAddress,
        uint256 _price,
        uint256 _duration
    ) external {
        require(msg.sender != address(0));
        require(_nft != address(0));
        require(_price > 0);
        require(_duration > 0);
        auctionDetails memory _auction = auctionDetails({
            seller: msg.sender,
            price: _price,
            duration: _duration,
            tokenAddress: _tokenAddress,
            isActive: true
        });

        address owner = msg.sender;
        IERC721(_nft).safeTransferFrom(owner, address(this), _tokenId);
        tokenToAuction[_nft][_tokenId] = _auction;
    }

    /**
     * @dev 购买NFT Token
     */

    function purchaseNFTToken(
        address _nft,
        uint256 _tokenId,
        uint256 _price
    ) external {
        auctionDetails storage auction = tokenToAuction[_nft][_tokenId];
        require(auction.duration > block.timestamp, "Deadline already passed");
        require(_price == auction.price, "invalid price");
        require(auction.isActive);
        auction.isActive = false;
        address seller = auction.seller;
        uint price = auction.price;
        require(
            IERC20(auction.tokenAddress).transferFrom(
                msg.sender,
                seller,
                price
            ),
            "erc 20 transfer failed!"
        );
        IERC721(_nft).safeTransferFrom(address(this), msg.sender, _tokenId);
    }

    /**
     * @dev 卖家取消拍卖订单，订单回滚，nft回滚到卖家所有
     */
    function cancelAution(address _nft, uint256 _tokenId) external {
        auctionDetails storage auction = tokenToAuction[_nft][_tokenId];
        require(auction.seller == msg.sender);
        require(auction.isActive);
        auction.isActive = false;
        IERC721(_nft).safeTransferFrom(address(this), auction.seller, _tokenId);
    }

    /**
     * @dev 获取拍卖信息
     */
    function getTokenAuctionDetails(
        address _nft,
        uint256 _tokenId
    ) public view returns (auctionDetails memory) {
        auctionDetails memory auction = tokenToAuction[_nft][_tokenId];
        return auction;
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) public override returns (bytes4) {
        return
            bytes4(
                keccak256("onERC721Received(address,address,uint256,bytes)")
            );
    }
}
