// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTCard is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    // 存储每个NFT的创建者信息
    struct CardInfo {
        address creator;
        string name;
        string description;
        uint256 createdAt;
    }

    mapping(uint256 => CardInfo) public cardInfos;
    
    // 记录用户创建的NFT数量
    mapping(address => uint256) public userCardCount;
    
    // 事件
    event CardMinted(uint256 indexed tokenId, address indexed creator, string name);

    constructor() ERC721("NFT Card", "NFTCARD") {}

    /**
     * @dev 铸造NFT名片
     * @param to 接收者地址
     * @param name 名片名称
     * @param description 自我介绍
     * @param tokenURI IPFS上的元数据URI
     */
    function mintCard(
        address to,
        string memory name,
        string memory description,
        string memory tokenURI
    ) public returns (uint256) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(bytes(tokenURI).length > 0, "Token URI cannot be empty");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);

        // 存储卡片信息
        cardInfos[tokenId] = CardInfo({
            creator: msg.sender,
            name: name,
            description: description,
            createdAt: block.timestamp
        });

        userCardCount[msg.sender]++;

        emit CardMinted(tokenId, msg.sender, name);
        return tokenId;
    }

    /**
     * @dev 获取当前总供应量
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter.current();
    }

    /**
     * @dev 获取用户拥有的所有NFT
     */
    function getTokensByOwner(address owner) public view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](tokenCount);
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalSupply(); i++) {
            if (ownerOf(i) == owner) {
                tokenIds[currentIndex] = i;
                currentIndex++;
            }
        }

        return tokenIds;
    }

    /**
     * @dev 获取卡片详细信息
     */
    function getCardInfo(uint256 tokenId) public view returns (CardInfo memory) {
        require(_exists(tokenId), "Token does not exist");
        return cardInfos[tokenId];
    }

    // 重写必要的函数
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}