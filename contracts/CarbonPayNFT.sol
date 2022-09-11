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

    function safeMint(address to, string memory _name) public onlyRole(MINTER_ROLE) {
        require(tokenNames[_name] != true, "The name is already taken. Please use a different name");
        tokenIdCounter.increment();
        uint256 tokenId = tokenIdCounter.current();
        _safeMint(to, tokenId);
        tokenNames[_name] = true;
        attributes[tokenIdCounter.current()] = Attr(_name, 0);
    }

    function getTokenIdByAddress(address _merchant) public view returns(uint256) {
        require(uint256(balanceOf(_merchant)) > 0, 'Not enabled for the give address.');

        uint256 i = 0;
        uint256 supply = tokenIdCounter.current();

        while (i <= supply) {
            if (!_exists(i) && i <= supply) {
                i ++;
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

    function totalSupply() public view returns(uint256) {
        return tokenIdCounter.current();
    }

    function getImage (uint256 tokenId) private pure returns (string memory) {
        return Strings.toString(tokenId);
    }

    function tokenURI(uint256 tokenId) override(ERC721) public view returns (string memory) {
        string memory json = Base64.encode(
            bytes(string(
                abi.encodePacked(
                    '{"name": "', attributes[tokenId].name, '",',
                    '"image_data": "', getImage(tokenId), '",',
                    '"attributes": [{"trait_type": "offset", "value": ', Strings.toString(attributes[tokenId].offset), '},',
                    ']}'
                )
            ))
        );
        return string(abi.encodePacked('data:application/json;base64,', json));
    }

    function updateOffset(address merchant, uint256 _offset) external onlyRole(OFFSET_MODIFIER_ROLE) {
        uint256 tokenId = getTokenIdByAddress(merchant);
        attributes[tokenId].offset += (_offset / (1 * 10 ** 18));
    }

    function updateInfo(uint256 tokenId, string memory _name) external onlyRole(DEFAULT_ADMIN_ROLE) {
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