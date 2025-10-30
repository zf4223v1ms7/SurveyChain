// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, ebool, euint64, externalEuint64 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Private Voting – Encrypted Ballot System with FHEVM
contract SurveyChain is SepoliaConfig {
    address public admin;
    string public title;
    uint256 public votingStart;
    uint256 public votingEnd;
    bool public finalized;

    mapping(uint256 => euint64) private _votes; // optionId => encrypted count
    mapping(address => bool) private _hasVoted;
    string[] private _options;
    mapping(address => bool) public canViewResults;
    mapping(address => bool) private _queuedViewers;
    address[] private _queuedViewerList;

    error AlreadyVoted();
    error VotingClosed();
    error VotingNotStarted();
    error InvalidOption();
    error NotAdmin();
    error AlreadyFinalized();
    error NotAuthorized();
    error InvalidDuration();
    error ResultsLocked();
    error InvalidOptionsLength();
    error NotFinalized();
    error AlreadyAuthorized();
    error InvalidViewer();
    error NotQueued();

    uint256 public constant MIN_DURATION = 1 hours;
    uint256 public constant MAX_DURATION = 30 days;

    event VoteCast(address indexed voter, uint256 indexed optionId);
    event ViewerGranted(address indexed viewer);
    event ViewerQueued(address indexed viewer);
    event ViewerRemoved(address indexed viewer);
    event VotingExtended(uint256 newEndTime);
    event Finalized();

    constructor(
        string memory _title,
        string[] memory optionList,
        uint256 durationSeconds
    ) {
        if (optionList.length < 2 || optionList.length > 32) revert InvalidOptionsLength();
        if (durationSeconds < MIN_DURATION || durationSeconds > MAX_DURATION) revert InvalidDuration();

        admin = msg.sender;
        title = _title;
        votingStart = block.timestamp;
        votingEnd = votingStart + durationSeconds;
        _options = optionList;
        canViewResults[msg.sender] = true;

        // initialize vote handles
        for (uint256 i = 0; i < optionList.length; i++) {
            euint64 zero = FHE.asEuint64(0);
            _votes[i] = zero;
            FHE.allowThis(_votes[i]);
        }
    }

    /// @notice Cast an encrypted vote for a given option
    function vote(uint256 optionId, externalEuint64 encryptedOne, bytes calldata proof) external {
        if (block.timestamp < votingStart) revert VotingNotStarted();
        if (block.timestamp > votingEnd) revert VotingClosed();
        if (_hasVoted[msg.sender]) revert AlreadyVoted();
        if (optionId >= _options.length) revert InvalidOption();

        euint64 one = FHE.fromExternal(encryptedOne, proof);
        _votes[optionId] = FHE.add(_votes[optionId], one);
        FHE.allowThis(_votes[optionId]);

        _hasVoted[msg.sender] = true;

        emit VoteCast(msg.sender, optionId);
    }

    /// @notice Get encrypted tally for a given option
    function getTally(uint256 optionId) external view returns (euint64) {
        if (optionId >= _options.length) revert InvalidOption();
        if (!finalized) revert ResultsLocked();
        if (!canViewResults[msg.sender]) revert NotAuthorized();

        return _votes[optionId];
    }

    /// @notice Grant view permission after finalization to a viewer
    function grantView(address viewer) external {
        if (msg.sender != admin) revert NotAdmin();
        if (!finalized) revert NotFinalized();
        if (viewer == address(0)) revert InvalidViewer();
        if (canViewResults[viewer]) revert AlreadyAuthorized();

        _authorizeViewer(viewer);
    }

    /// @notice Batch grant permissions to multiple viewers post-finalization
    function grantViewMany(address[] calldata viewers) external {
        if (msg.sender != admin) revert NotAdmin();
        if (!finalized) revert NotFinalized();

        for (uint256 j = 0; j < viewers.length; j++) {
            address viewer = viewers[j];
            if (viewer == address(0)) revert InvalidViewer();
            if (canViewResults[viewer]) continue;
            _authorizeViewer(viewer);
        }
    }

    /// @notice Queue a viewer to automatically receive permissions once the vote is finalized
    function queueViewer(address viewer) external {
        if (msg.sender != admin) revert NotAdmin();
        if (finalized) revert AlreadyFinalized();
        _queueViewer(viewer, true);
    }

    /// @notice Queue multiple viewers for post-finalization access in a single transaction
    function queueViewers(address[] calldata viewers) external {
        if (msg.sender != admin) revert NotAdmin();
        if (finalized) revert AlreadyFinalized();

        for (uint256 j = 0; j < viewers.length; j++) {
            _queueViewer(viewers[j], false);
        }
    }

    /// @notice Remove a previously queued viewer prior to finalization
    function removeQueuedViewer(address viewer) external {
        if (msg.sender != admin) revert NotAdmin();
        if (finalized) revert AlreadyFinalized();
        if (viewer == address(0)) revert InvalidViewer();
        if (!_queuedViewers[viewer]) revert NotQueued();

        _queuedViewers[viewer] = false;
        emit ViewerRemoved(viewer);
    }

    /// @notice Extend the voting period
    function extendVoting(uint256 newEndTime) external {
        if (msg.sender != admin) revert NotAdmin();
        if (finalized) revert AlreadyFinalized();
        if (newEndTime <= votingEnd) revert InvalidDuration();
        if (newEndTime > votingStart + MAX_DURATION) revert InvalidDuration();

        votingEnd = newEndTime;
        emit VotingExtended(newEndTime);
    }

    /// @notice Finalize the vote and grant admin decryption rights
    function finalize() external {
        if (msg.sender != admin) revert NotAdmin();
        if (finalized) revert AlreadyFinalized();
        if (block.timestamp < votingEnd) revert VotingClosed();

        finalized = true;
        for (uint256 i = 0; i < _options.length; i++) {
            FHE.allow(_votes[i], admin);
        }

        _authorizeQueuedViewers();

        emit Finalized();
    }

    function _authorizeViewer(address viewer) internal {
        canViewResults[viewer] = true;
        for (uint256 i = 0; i < _options.length; i++) {
            FHE.allow(_votes[i], viewer);
        }

        emit ViewerGranted(viewer);
    }

    function _authorizeQueuedViewers() internal {
        uint256 len = _queuedViewerList.length;
        for (uint256 j = 0; j < len; j++) {
            address viewer = _queuedViewerList[j];
            if (!_queuedViewers[viewer]) continue;
            _queuedViewers[viewer] = false;
            if (canViewResults[viewer]) continue;
            _authorizeViewer(viewer);
        }

        delete _queuedViewerList;
    }

    function _queueViewer(address viewer, bool revertOnDuplicate) internal {
        if (viewer == address(0)) revert InvalidViewer();
        if (canViewResults[viewer]) {
            if (revertOnDuplicate) revert AlreadyAuthorized();
            return;
        }

        if (_queuedViewers[viewer]) {
            if (revertOnDuplicate) revert AlreadyAuthorized();
            return;
        }

        _queuedViewers[viewer] = true;
        _queuedViewerList.push(viewer);

        emit ViewerQueued(viewer);
    }

    /// @notice Get whether address has voted
    function hasVoted(address voter) external view returns (bool) {
        return _hasVoted[voter];
    }

    /// @notice Returns options array
    function getOptions() external view returns (string[] memory) {
        string[] memory opts = new string[](_options.length);
        for (uint256 i = 0; i < _options.length; i++) {
            opts[i] = _options[i];
        }
        return opts;
    }

    /// @notice Returns the list of addresses queued for automatic authorization on finalize
    function getQueuedViewers() external view returns (address[] memory) {
        uint256 len = _queuedViewerList.length;
        uint256 count;
        for (uint256 i = 0; i < len; i++) {
            if (_queuedViewers[_queuedViewerList[i]]) {
                count++;
            }
        }

        address[] memory queued = new address[](count);
        uint256 idx;
        for (uint256 i = 0; i < len; i++) {
            address viewer = _queuedViewerList[i];
            if (_queuedViewers[viewer]) {
                queued[idx] = viewer;
                idx++;
            }
        }
        return queued;
    }

    /// @notice Check whether a viewer is currently queued for access
    function isQueued(address viewer) external view returns (bool) {
        return _queuedViewers[viewer];
    }

    /// @notice Returns metadata and state info
    function getSurveyInfo()
        external
        view
        returns (
            string memory surveyTitle,
            uint256 startTime,
            uint256 endTime,
            bool isFinalized,
            uint256 optionsCount
        )
    {
        return (title, votingStart, votingEnd, finalized, _options.length);
    }
}
