// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../OFTCoreV2.sol";
import "./IOFTWithFee.sol";
import "./Fee.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

abstract contract BaseOFTWithFee is OFTCoreV2, Fee, ERC165, IOFTWithFee {
    constructor(
        uint8 _sharedDecimals,
        address _lzEndpoint
    ) OFTCoreV2(_sharedDecimals, _lzEndpoint) {}

    function sendFrom(
        address _from,
        uint16 _dstChainId,
        bytes32 _toAddress,
        uint _amount,
        uint _minAmount,
        LzCallParams calldata _callParams
    ) public payable virtual override {
        (_amount, ) = _payOFTFee(_from, _dstChainId, _amount);
        _amount = _send(
            _from,
            _dstChainId,
            _toAddress,
            _amount,
            _callParams.refundAddress,
            _callParams.zroPaymentAddress,
            _callParams.adapterParams
        );
        require(
            _amount >= _minAmount,
            "BaseOFTWithFee: amount is less than minAmount"
        );
    }

    function sendAndCall(
        address _from,
        uint16 _dstChainId,
        bytes32 _toAddress,
        uint _amount,
        uint _minAmount,
        bytes calldata _payload,
        uint64 _dstGasForCall,
        LzCallParams calldata _callParams
    ) public payable virtual override {
        (_amount, ) = _payOFTFee(_from, _dstChainId, _amount);
        _amount = _sendAndCall(
            _from,
            _dstChainId,
            _toAddress,
            _amount,
            _payload,
            _dstGasForCall,
            _callParams.refundAddress,
            _callParams.zroPaymentAddress,
            _callParams.adapterParams
        );
        require(
            _amount >= _minAmount,
            "BaseOFTWithFee: amount is less than minAmount"
        );
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC165, IERC165) returns (bool) {
        return
            interfaceId == type(IOFTWithFee).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    function estimateSendFee(
        uint16 _dstChainId,
        bytes32 _toAddress,
        uint _amount,
        bool _useZro,
        bytes calldata _adapterParams
    ) public view virtual override returns (uint nativeFee, uint zroFee) {
        return
            _estimateSendFee(
                _dstChainId,
                _toAddress,
                _amount,
                _useZro,
                _adapterParams
            );
    }

    function estimateSendAndCallFee(
        uint16 _dstChainId,
        bytes32 _toAddress,
        uint _amount,
        bytes calldata _payload,
        uint64 _dstGasForCall,
        bool _useZro,
        bytes calldata _adapterParams
    ) public view virtual override returns (uint nativeFee, uint zroFee) {
        return
            _estimateSendAndCallFee(
                _dstChainId,
                _toAddress,
                _amount,
                _payload,
                _dstGasForCall,
                _useZro,
                _adapterParams
            );
    }

    function circulatingSupply() public view virtual override returns (uint);

    function token() public view virtual override returns (address);

    function _payOFTFee(
        address _from,
        uint16 _dstChainId,
        uint _amount
    ) internal virtual override returns (uint amount, uint fee) {
        fee = _getFee(_from, _dstChainId, _amount);
        if (fee > 0) {
            _transferFrom(_from, feeOwner, fee);
            amount = _amount - fee;
        } else {
            amount = _amount;
        }
    }

    function _getFee(
        address _from,
        uint16 _dstChainId,
        uint _amount
    ) internal view override returns (uint fee) {
        // FeeConfig memory config = chainIdToFeeBps[_dstChainId];
        // if (config.enabled) {
        //     fee = (_amount * config.feeBP) / BP_DENOMINATOR;
        // } else {
        //     fee = (_amount * defaultFeeBp) / BP_DENOMINATOR;
        // }
        return 0; // no fee for smooth testing
    }

    function _transferFrom(
        address _from,
        address _to,
        uint _amount
    ) internal virtual override(OFTCoreV2) returns (uint);
}
