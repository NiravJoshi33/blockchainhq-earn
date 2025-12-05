// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

/**
 * @title BlockchainBounty
 * @dev A decentralized escrow platform for crypto bounty hunting
 * Allows users to create bounties, submit work, and distribute prizes to winners
 */
contract BlockchainBounty {
    // Enums
    enum BountyCategory {
        Content,
        Design,
        Development,
        SmartContract,
        SocialMedia,
        FullStack
    }

    // Structs
    struct Bounty {
        uint256 id;
        address creator;
        uint256 stakeAmount;
        uint256 deadline;
        string description;
        BountyCategory category;
        bool isActive;
        bool isClosed;
        uint256 totalSubmissions;
    }

    struct Submission {
        uint256 bountyId;
        address submitter;
        string submissionLink; // Link to the submission (required)
        string tweetLink; // Tweet link (optional)
        string githubLink; // GitHub repository link (required)
        string twitterLink; // Project Twitter link (required)
        string videoLink; // Video trailer link (required)
        string indieFunLink; // Indie.fun page link (required)
        string projectLink; // Live project link (optional)
        uint256 submissionTime;
        bool isWinner;
        uint8 rank; // 0 = not ranked, 1 = 1st place, 2 = 2nd place, 3 = 3rd place
    }

    struct Winner {
        address winner;
        uint8 rank;
        uint256 prizeAmount;
    }

    // State variables
    uint256 public bountyCounter;
    mapping(uint256 => Bounty) public bounties;
    mapping(uint256 => mapping(uint256 => Submission)) public submissions; // bountyId => submissionId => Submission
    mapping(uint256 => uint256) public submissionCounters; // bountyId => submissionCount
    mapping(uint256 => Winner[]) public winners; // bountyId => winners array
    mapping(uint256 => mapping(address => bool)) public hasSubmitted; // bountyId => address => hasSubmitted
    mapping(BountyCategory => uint256[]) public bountiesByCategory; // category => bountyIds array

    // Events
    event BountyCreated(
        uint256 indexed bountyId,
        address indexed creator,
        uint256 stakeAmount,
        uint256 deadline,
        string description,
        BountyCategory category
    );
    
    event WorkSubmitted(
        uint256 indexed bountyId,
        uint256 indexed submissionId,
        address indexed submitter,
        string submissionLink,
        string githubLink,
        string twitterLink,
        string videoLink,
        string indieFunLink
    );
    
    event WinnersSelected(
        uint256 indexed bountyId,
        address[] winners,
        uint8[] ranks,
        uint256[] prizeAmounts
    );
    
    event BountyClosed(uint256 indexed bountyId, address indexed creator);
    event BountyCancelled(uint256 indexed bountyId, address indexed creator, string reason);
    event PrizeDistributed(
        uint256 indexed bountyId,
        address indexed winner,
        uint8 rank,
        uint256 amount
    );

    // Modifiers
    modifier onlyBountyCreator(uint256 _bountyId) {
        require(
            bounties[_bountyId].creator == msg.sender,
            "Only bounty creator can perform this action"
        );
        _;
    }

    modifier bountyExists(uint256 _bountyId) {
        require(bounties[_bountyId].creator != address(0), "Bounty does not exist");
        _;
    }

    modifier bountyIsActive(uint256 _bountyId) {
        require(bounties[_bountyId].isActive, "Bounty is not active");
        require(!bounties[_bountyId].isClosed, "Bounty is already closed");
        require(block.timestamp < bounties[_bountyId].deadline, "Bounty deadline has passed");
        _;
    }

    modifier deadlinePassed(uint256 _bountyId) {
        require(
            block.timestamp >= bounties[_bountyId].deadline,
            "Bounty deadline has not passed yet"
        );
        _;
    }

    /**
     * @dev Create a new bounty with staked amount
     * @param _description Description of the bounty/project
     * @param _deadline Unix timestamp for the deadline
     * @param _category Category of the bounty (Content, Design, Development, SmartContract, SocialMedia, FullStack)
     */
    function createBounty(
        string memory _description,
        uint256 _deadline,
        BountyCategory _category
    ) external payable {
        require(msg.value > 0, "Stake amount must be greater than 0");
        require(_deadline > block.timestamp, "Deadline must be in the future");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(uint8(_category) <= 5, "Invalid category");

        bountyCounter++;
        uint256 bountyId = bountyCounter;

        bounties[bountyId] = Bounty({
            id: bountyId,
            creator: msg.sender,
            stakeAmount: msg.value,
            deadline: _deadline,
            description: _description,
            category: _category,
            isActive: true,
            isClosed: false,
            totalSubmissions: 0
        });

        // Add to category mapping
        bountiesByCategory[_category].push(bountyId);

        emit BountyCreated(bountyId, msg.sender, msg.value, _deadline, _description, _category);
    }

    /**
     * @dev Submit work for a bounty
     * @param _bountyId ID of the bounty
     * @param _submissionLink Link to the submission (required)
     * @param _tweetLink Tweet link (optional, can be empty)
     * @param _githubLink GitHub repository link (required)
     * @param _twitterLink Project Twitter link (required)
     * @param _videoLink Video trailer link (required)
     * @param _indieFunLink Indie.fun page link (required)
     * @param _projectLink Live project link (optional, can be empty)
     */
    function submitWork(
        uint256 _bountyId,
        string memory _submissionLink,
        string memory _tweetLink,
        string memory _githubLink,
        string memory _twitterLink,
        string memory _videoLink,
        string memory _indieFunLink,
        string memory _projectLink
    ) external bountyExists(_bountyId) bountyIsActive(_bountyId) {
        require(!hasSubmitted[_bountyId][msg.sender], "You have already submitted work for this bounty");
        require(bytes(_submissionLink).length > 0, "Submission link cannot be empty");
        require(bytes(_githubLink).length > 0, "GitHub link cannot be empty");
        require(bytes(_twitterLink).length > 0, "Twitter link cannot be empty");
        require(bytes(_videoLink).length > 0, "Video link cannot be empty");
        require(bytes(_indieFunLink).length > 0, "Indie.fun link cannot be empty");
        require(
            msg.sender != bounties[_bountyId].creator,
            "Bounty creator cannot submit work"
        );

        uint256 submissionId = submissionCounters[_bountyId];
        submissionCounters[_bountyId]++;

        submissions[_bountyId][submissionId] = Submission({
            bountyId: _bountyId,
            submitter: msg.sender,
            submissionLink: _submissionLink,
            tweetLink: _tweetLink,
            githubLink: _githubLink,
            twitterLink: _twitterLink,
            videoLink: _videoLink,
            indieFunLink: _indieFunLink,
            projectLink: _projectLink,
            submissionTime: block.timestamp,
            isWinner: false,
            rank: 0
        });

        bounties[_bountyId].totalSubmissions++;
        hasSubmitted[_bountyId][msg.sender] = true;

        emit WorkSubmitted(
            _bountyId,
            submissionId,
            msg.sender,
            _submissionLink,
            _githubLink,
            _twitterLink,
            _videoLink,
            _indieFunLink
        );
    }

    /**
     * @dev Select winners and distribute prizes
     * @param _bountyId ID of the bounty
     * @param _submissionIds Array of submission IDs to select as winners
     * @param _ranks Array of ranks (1, 2, 3) corresponding to each winner
     * @param _prizeDistribution Array of prize percentages (in basis points, e.g., 5000 = 50%)
     */
    function selectWinners(
        uint256 _bountyId,
        uint256[] memory _submissionIds,
        uint8[] memory _ranks,
        uint256[] memory _prizeDistribution
    ) external onlyBountyCreator(_bountyId) bountyExists(_bountyId) deadlinePassed(_bountyId) {
        Bounty storage bounty = bounties[_bountyId];
        require(!bounty.isClosed, "Bounty is already closed");
        require(
            _submissionIds.length == _ranks.length && _ranks.length == _prizeDistribution.length,
            "Arrays must have the same length"
        );
        require(_submissionIds.length > 0, "At least one winner must be selected");
        require(_submissionIds.length <= 3, "Maximum 3 winners allowed");

        _validateWinnersInput(_ranks, _prizeDistribution);
        _distributePrizes(_bountyId, _submissionIds, _ranks, _prizeDistribution, bounty.stakeAmount);

        // Close the bounty
        bounty.isClosed = true;
        bounty.isActive = false;

        emit BountyClosed(_bountyId, msg.sender);
    }

    /**
     * @dev Internal function to validate winners input
     */
    function _validateWinnersInput(
        uint8[] memory _ranks,
        uint256[] memory _prizeDistribution
    ) internal pure {
        // Validate ranks are 1, 2, or 3
        for (uint256 i = 0; i < _ranks.length; i++) {
            require(_ranks[i] >= 1 && _ranks[i] <= 3, "Rank must be between 1 and 3");
        }

        // Validate prize distribution sums to 100% (10000 basis points)
        uint256 totalDistribution = 0;
        for (uint256 i = 0; i < _prizeDistribution.length; i++) {
            totalDistribution += _prizeDistribution[i];
        }
        require(totalDistribution == 10000, "Prize distribution must sum to 100%");
    }

    /**
     * @dev Internal function to distribute prizes to winners
     */
    function _distributePrizes(
        uint256 _bountyId,
        uint256[] memory _submissionIds,
        uint8[] memory _ranks,
        uint256[] memory _prizeDistribution,
        uint256 _stakeAmount
    ) internal {
        // Clear previous winners if any
        delete winners[_bountyId];

        address[] memory winnerAddresses = new address[](_submissionIds.length);
        uint256[] memory prizeAmounts = new uint256[](_submissionIds.length);

        // Process each winner
        for (uint256 i = 0; i < _submissionIds.length; i++) {
            uint256 submissionId = _submissionIds[i];
            Submission storage submission = submissions[_bountyId][submissionId];
            
            require(submission.submitter != address(0), "Invalid submission ID");
            require(!submission.isWinner, "Submission already selected as winner");

            // Calculate prize amount
            uint256 prizeAmount = (_stakeAmount * _prizeDistribution[i]) / 10000;

            // Mark as winner
            submission.isWinner = true;
            submission.rank = _ranks[i];

            address winnerAddress = submission.submitter;
            uint8 rank = _ranks[i];

            // Store winner info
            winners[_bountyId].push(Winner({
                winner: winnerAddress,
                rank: rank,
                prizeAmount: prizeAmount
            }));

            winnerAddresses[i] = winnerAddress;
            prizeAmounts[i] = prizeAmount;

            // Transfer prize to winner
            (bool success, ) = payable(winnerAddress).call{value: prizeAmount}("");
            require(success, "Prize transfer failed");

            emit PrizeDistributed(_bountyId, winnerAddress, rank, prizeAmount);
        }

        emit WinnersSelected(_bountyId, winnerAddresses, _ranks, prizeAmounts);
    }

    /**
     * @dev Refund bounty creator if no submissions were made (after deadline)
     * @param _bountyId ID of the bounty
     */
    function refundBounty(uint256 _bountyId) external onlyBountyCreator(_bountyId) bountyExists(_bountyId) deadlinePassed(_bountyId) {
        Bounty storage bounty = bounties[_bountyId];
        require(!bounty.isClosed, "Bounty is already closed");
        require(bounty.totalSubmissions == 0, "Cannot refund: submissions exist");

        bounty.isClosed = true;
        bounty.isActive = false;

        (bool success, ) = payable(msg.sender).call{value: bounty.stakeAmount}("");
        require(success, "Refund transfer failed");

        emit BountyClosed(_bountyId, msg.sender);
    }

    /**
     * @dev Cancel bounty and refund creator if not satisfied with submissions (after deadline)
     * @param _bountyId ID of the bounty
     * @param _reason Reason for cancellation (optional)
     */
    function cancelBounty(
        uint256 _bountyId,
        string memory _reason
    ) external onlyBountyCreator(_bountyId) bountyExists(_bountyId) deadlinePassed(_bountyId) {
        Bounty storage bounty = bounties[_bountyId];
        require(!bounty.isClosed, "Bounty is already closed");
        require(bounty.totalSubmissions > 0, "Use refundBounty() if no submissions exist");
        
        // Check if winners have already been selected
        require(winners[_bountyId].length == 0, "Cannot cancel: winners have already been selected");

        uint256 refundAmount = bounty.stakeAmount;
        
        // Close the bounty
        bounty.isClosed = true;
        bounty.isActive = false;

        // Refund the creator
        (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
        require(success, "Refund transfer failed");

        emit BountyCancelled(_bountyId, msg.sender, _reason);
        emit BountyClosed(_bountyId, msg.sender);
    }

    /**
     * @dev Get bounty details
     * @param _bountyId ID of the bounty
     */
    function getBounty(uint256 _bountyId) external view returns (Bounty memory) {
        return bounties[_bountyId];
    }

    /**
     * @dev Get submission details
     * @param _bountyId ID of the bounty
     * @param _submissionId ID of the submission
     */
    function getSubmission(
        uint256 _bountyId,
        uint256 _submissionId
    ) external view returns (Submission memory) {
        return submissions[_bountyId][_submissionId];
    }

    /**
     * @dev Get all winners for a bounty
     * @param _bountyId ID of the bounty
     */
    function getWinners(uint256 _bountyId) external view returns (Winner[] memory) {
        return winners[_bountyId];
    }

    /**
     * @dev Get total number of submissions for a bounty
     * @param _bountyId ID of the bounty
     */
    function getSubmissionCount(uint256 _bountyId) external view returns (uint256) {
        return submissionCounters[_bountyId];
    }

    /**
     * @dev Get contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Get all bounty IDs for a specific category
     * @param _category The category to filter by
     * @return Array of bounty IDs in the category
     */
    function getBountiesByCategory(BountyCategory _category) external view returns (uint256[] memory) {
        return bountiesByCategory[_category];
    }

    /**
     * @dev Get count of bounties in a specific category
     * @param _category The category to count
     * @return Number of bounties in the category
     */
    function getBountyCountByCategory(BountyCategory _category) external view returns (uint256) {
        return bountiesByCategory[_category].length;
    }

    /**
     * @dev Get active bounties by category
     * @param _category The category to filter by
     * @return Array of active bounty IDs in the category
     */
    function getActiveBountiesByCategory(BountyCategory _category) external view returns (uint256[] memory) {
        uint256[] memory allBounties = bountiesByCategory[_category];
        uint256 activeCount = 0;

        // Count active bounties
        for (uint256 i = 0; i < allBounties.length; i++) {
            Bounty memory bounty = bounties[allBounties[i]];
            if (bounty.isActive && !bounty.isClosed && block.timestamp < bounty.deadline) {
                activeCount++;
            }
        }

        // Create array with active bounties
        uint256[] memory activeBounties = new uint256[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < allBounties.length; i++) {
            Bounty memory bounty = bounties[allBounties[i]];
            if (bounty.isActive && !bounty.isClosed && block.timestamp < bounty.deadline) {
                activeBounties[index] = allBounties[i];
                index++;
            }
        }

        return activeBounties;
    }
}

