// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Certification {
  struct Abstract  {
    uint256 timestamp;
    string  searchHash;
    bytes32 dataHash;
    address sender;
    string  title;
    string extend;
  }
  // in the mapping:
  // the string type is the format date id
  // such as: "XXXX-2022-11-11"
  mapping(string => Abstract) public abstractData;
  uint256 public abstractCount;

  // event CreateAbstract(uint256 timestamp, bytes32 indexed searchHash, bytes32 indexed dataHash,
  //                     address indexed sender, string title, bytes extend);

  constructor() {}

  function getAbstract(string memory _dateID) public view
    returns(uint256 timestamp, string memory searchHash, bytes32 dataHash,
            address sender, string memory title, string memory extend) {
      // require(abstractData[_dataHash].isUsed);
      timestamp = abstractData[_dateID].timestamp;
      searchHash = abstractData[_dateID].searchHash;
      dataHash = abstractData[_dateID].dataHash;
      title = abstractData[_dateID].title;
      sender = abstractData[_dateID].sender;
      extend = abstractData[_dateID].extend;
      return (timestamp, searchHash, dataHash, sender, title, extend);
    }

    function createAbstract(string memory _dateID, string memory _searchHash,
                          string memory _title, string memory _extend, bytes memory _data)
      public
      returns (bool)
    {
      abstractData[_dateID] = Abstract({
        timestamp: block.timestamp,
        searchHash:_searchHash,
        dataHash: keccak256(_data),
        sender: msg.sender,
        title: _title,
        extend: _extend
        });
      abstractCount++;

      return true;
    }

    function certificate(string memory _dateID, bytes memory _data) public view returns(bool) {
      bool is_consistent = abstractData[_dateID].dataHash == keccak256(_data);
      if (is_consistent) {
        return true;
      } else {
        return false;
      }
    }

    function getAbstractCount() public view
      returns(uint256)
    {
        return abstractCount;
    }
}
