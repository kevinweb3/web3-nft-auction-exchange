// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

/**
 * @dev 非固定价格拍卖
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
        uint256 maxBid;
        address maxBidUser;
        bool isActive;
        uint256[] bidAmounts;
        address[] users;
    }

    mapping(address => mapping(uint256 => auctionDetails))
        public tokenToAuction;
    mapping(address => mapping(uint256 => mapping(address => uint256)))
        public bids;

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
            maxBid: 0,
            maxBidUser: address(0),
            isActive: true,
            bidAmounts: new uint256[](0),
            users: new address[](0)
        });

        address owner = msg.sender;
        IERC721(_nft).safeTransferFrom(owner, address(this), _tokenId);
        tokenToAuction[_nft][_tokenId] = _auction;
    }

    function bid(
        address _nft,
        uint256 _tokenId,
        uint256 _amount
    ) external payable {
        auctionDetails storage auction = tokenToAuction[_nft][_tokenId];
        require(_amount >= auction.price);
        require(auction.isActive);
        require(auction.duration > block.timestamp, "Deadline already passed");

        bool exist = false;
        // check wheather bid
        if (bids[_nft][_tokenId][msg.sender] > 0) {
            bool success = IERC20(auction.tokenAddress).transfer(
                msg.sender,
                bids[_nft][_tokenId][msg.sender]
            );
            require(success);
            exist = true;
        }

        bids[_nft][_tokenId][msg.sender] = _amount;
        IERC20(auction.tokenAddress).transferFrom(
            msg.sender,
            address(this),
            _amount
        );

        if (auction.bidAmounts.length == 0) {
            auction.maxBid = _amount;
            auction.maxBidUser = msg.sender;
        } else {
            uint256 lastIndex = auction.bidAmounts.length - 1;
            require(
                auction.bidAmounts[lastIndex] < _amount,
                "Current max bid is higher than your bid"
            );
            auction.maxBid = _amount;
            auction.maxBidUser = msg.sender;
        }

        if (!exist) {
            auction.users.push(msg.sender);
            auction.bidAmounts.push(_amount);
        }
    }

    function executeSale(address _nft, uint256 _tokenId) external {
        auctionDetails storage auction = tokenToAuction[_nft][_tokenId];
        require(
            auction.duration <= block.timestamp,
            "Deadline did not pass yet"
        );
        require(auction.seller == msg.sender);
        require(auction.isActive);
        auction.isActive = false;
        if (auction.bidAmounts.length == 0) {
            IERC721(_nft).safeTransferFrom(
                address(this),
                auction.seller,
                _tokenId
            );
        } else {
            // (bool success, ) = auction.seller.call{value: auction.maxBid}("");
            bool success = IERC20(auction.tokenAddress).transfer(
                auction.seller,
                auction.maxBid
            );
            require(success);
            for (uint256 i = 0; i < auction.users.length; i++) {
                if (auction.users[i] != auction.maxBidUser) {
                    //                    (success, ) = auction.users[i].call{
                    //                    value: bids[_nft][_tokenId][auction.users[i]]
                    //                    }("");

                    success = IERC20(auction.tokenAddress).transfer(
                        auction.users[i],
                        bids[_nft][_tokenId][auction.users[i]]
                    );
                    require(success);
                }
            }
            IERC721(_nft).safeTransferFrom(
                address(this),
                auction.maxBidUser,
                _tokenId
            );
        }
    }

    function cancelAution(address _nft, uint256 _tokenId) external {
        auctionDetails storage auction = tokenToAuction[_nft][_tokenId];
        require(auction.seller == msg.sender);
        require(auction.isActive);
        auction.isActive = false;
        bool success;
        for (uint256 i = 0; i < auction.users.length; i++) {
            //            (success, ) = auction.users[i].call{value: bids[_nft][_tokenId][auction.users[i]]}("");
            //            require(success);
            success = IERC20(auction.tokenAddress).transfer(
                auction.users[i],
                bids[_nft][_tokenId][auction.users[i]]
            );
            require(success);
        }
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
