// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Import this file to use console.log
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./Base64.sol";

contract CarbonPayNFT is ERC721, AccessControl {
    using Counters for Counters.Counter;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant OFFSET_MODIFIER_ROLE = keccak256("OFFSET_MODIFIER_ROLE");
    bytes32 public constant INFO_MODIFIER_ROLE = keccak256("INFO_MODIFIER_ROLE");

    mapping(string => bool) private tokenNames;
    mapping(uint256 => Attr) public attributes;

    struct Attr {
        string name;
        uint256 offset;
    }

    Counters.Counter private tokenIdCounter;

    constructor() ERC721("CarbonPayNFT", "CPNFT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    function safeMint(address to, string memory _name, uint256 _offset) public onlyRole(MINTER_ROLE) {
        require(tokenNames[_name] != true, "The name is already taken. Please use a different name");
        tokenIdCounter.increment();
        uint256 tokenId = tokenIdCounter.current();
        _safeMint(to, tokenId);
        tokenNames[_name] = true;
        attributes[tokenIdCounter.current()] = Attr(_name, _offset);
    }

    function getTokenIdByAddress(address _merchant) public view returns(uint256) {
        require(uint256(balanceOf(_merchant)) > 0, 'Not enabled for the give address.');

        uint256 i = 0;
        uint256 totalSupply = tokenIdCounter.current();

        while (i < totalSupply) {
            if (!_exists(i) && i <= totalSupply) {
                continue;
            }

            address currentTokenOwner = ownerOf(i);

            if (currentTokenOwner == _merchant) {
                return i;
            }

            i ++;
        }

        return i;
    }

    function getImage () private pure returns (string memory) {
        return 'https://scontent-lhr8-1.xx.fbcdn.net/v/t39.30808-6/297521403_3251244181863135_3280964840166953473_n.jpg?stp=dst-jpg_s1080x2048&_nc_cat=100&ccb=1-7&_nc_sid=5b7eaf&_nc_ohc=L_yTaePIw5gAX9GyqpK&_nc_ht=scontent-lhr8-1.xx&oh=00_AT9hhmqSnd8ACkOqDtuU8-q52xpZcA9k-4lMEVRSLLKJAQ&oe=62F21C40';
    }

    function tokenURI(uint256 tokenId) override(ERC721) public view returns (string memory) {
        string memory json = Base64.encode(
            bytes(string(
                abi.encodePacked(
                    '{"name": "', attributes[tokenId].name, '",',
                    '"image_data": "', getImage(), '",',
                    '"attributes": [{"trait_type": "Speed", "value": ', Strings.toString(attributes[tokenId].offset), '},',
                    ']}'
                )
            ))
        );
        return string(abi.encodePacked('data:application/json;base64,', json));
    }

    function updateOffset(address _merchant, uint256 _offset) external onlyRole(OFFSET_MODIFIER_ROLE) returns(bool) {
        uint256 tokenId = getTokenIdByAddress(_merchant);
        attributes[tokenId].offset += _offset;
        return true;
    }

    function updateInfo(uint256 tokenId, string memory _name) external onlyRole(INFO_MODIFIER_ROLE) {
        attributes[tokenId].name = _name;
    }

    // The following functions are overrides required by Solidity.

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}