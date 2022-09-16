// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Import this file to use console.log
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "./Base64.sol";

contract CarbonPayNFT is ERC721, AccessControl, ERC721Burnable {
    using Counters for Counters.Counter;

    bytes32 public constant OFFSET_MODIFIER_ROLE = keccak256("OFFSET_MODIFIER_ROLE");
    bytes32 public constant INFO_MODIFIER_ROLE = keccak256("INFO_MODIFIER_ROLE");

    mapping(string => bool) public tokenNames;
    mapping(uint256 => Attr) public attributes;

    struct Attr {
        string name;
        uint256 offset;
    }

    Counters.Counter private tokenIdCounter;

    constructor() ERC721("CarbonPayNFT", "CPNFT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function safeMint(address merchant, string memory _name) public {
        require(tokenNames[_name] != true, "The name is already taken. Please use a different name");
        require(balanceOf(merchant) == 0, "Address is already registered.");
        tokenIdCounter.increment();
        uint256 tokenId = tokenIdCounter.current();
        _safeMint(merchant, tokenId);
        tokenNames[_name] = true;
        attributes[tokenId] = Attr(_name, 0);
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

    function getImage () private pure returns (string memory) {
        return 'ipfs://bafybeiaoussqp75ohgcwsa7322etzpr4wx3joj6tiuhkd733uagurx2nxy';
    }

    function tokenURI(uint256 tokenId) override(ERC721) public view returns (string memory) {
        string memory json = Base64.encode(
            bytes(string(
                abi.encodePacked(
                    '{"name": "', attributes[tokenId].name, '",',
                    '"image_data": "', getImage(), '",',
                    '"attributes": [{"trait_type": "offset", "value": ', Strings.toString(attributes[tokenId].offset), '}',
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

    // for TESTING purposes only
    function safeBurn(uint256 tokenId) public onlyRole(DEFAULT_ADMIN_ROLE) {
        delete tokenNames[attributes[tokenId].name];
        delete attributes[tokenId];
        burn(tokenId);
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