
export const blockchainBountyAddress = "0x70e2FC2Ff60717aA2B529352f45b13E4AdB84c5A";
export const blockchainBountyAbi = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "bountyId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "creator",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "reason",
				"type": "string"
			}
		],
		"name": "BountyCancelled",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "bountyId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "creator",
				"type": "address"
			}
		],
		"name": "BountyClosed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "bountyId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "creator",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "stakeAmount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "deadline",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "enum BlockchainBounty.BountyCategory",
				"name": "category",
				"type": "uint8"
			}
		],
		"name": "BountyCreated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "bountyId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "winner",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint8",
				"name": "rank",
				"type": "uint8"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "PrizeDistributed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "bountyId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address[]",
				"name": "winners",
				"type": "address[]"
			},
			{
				"indexed": false,
				"internalType": "uint8[]",
				"name": "ranks",
				"type": "uint8[]"
			},
			{
				"indexed": false,
				"internalType": "uint256[]",
				"name": "prizeAmounts",
				"type": "uint256[]"
			}
		],
		"name": "WinnersSelected",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "bountyId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "submissionId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "submitter",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "submissionLink",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "githubLink",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "twitterLink",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "videoLink",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "indieFunLink",
				"type": "string"
			}
		],
		"name": "WorkSubmitted",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "bounties",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "creator",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "stakeAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "deadline",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "enum BlockchainBounty.BountyCategory",
				"name": "category",
				"type": "uint8"
			},
			{
				"internalType": "bool",
				"name": "isActive",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "isClosed",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "totalSubmissions",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "enum BlockchainBounty.BountyCategory",
				"name": "",
				"type": "uint8"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "bountiesByCategory",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "bountyCounter",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_bountyId",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "_reason",
				"type": "string"
			}
		],
		"name": "cancelBounty",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_deadline",
				"type": "uint256"
			},
			{
				"internalType": "enum BlockchainBounty.BountyCategory",
				"name": "_category",
				"type": "uint8"
			}
		],
		"name": "createBounty",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "enum BlockchainBounty.BountyCategory",
				"name": "_category",
				"type": "uint8"
			}
		],
		"name": "getActiveBountiesByCategory",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "enum BlockchainBounty.BountyCategory",
				"name": "_category",
				"type": "uint8"
			}
		],
		"name": "getBountiesByCategory",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_bountyId",
				"type": "uint256"
			}
		],
		"name": "getBounty",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "creator",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "stakeAmount",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "deadline",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "description",
						"type": "string"
					},
					{
						"internalType": "enum BlockchainBounty.BountyCategory",
						"name": "category",
						"type": "uint8"
					},
					{
						"internalType": "bool",
						"name": "isActive",
						"type": "bool"
					},
					{
						"internalType": "bool",
						"name": "isClosed",
						"type": "bool"
					},
					{
						"internalType": "uint256",
						"name": "totalSubmissions",
						"type": "uint256"
					}
				],
				"internalType": "struct BlockchainBounty.Bounty",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "enum BlockchainBounty.BountyCategory",
				"name": "_category",
				"type": "uint8"
			}
		],
		"name": "getBountyCountByCategory",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getContractBalance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_bountyId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_submissionId",
				"type": "uint256"
			}
		],
		"name": "getSubmission",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "bountyId",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "submitter",
						"type": "address"
					},
					{
						"internalType": "string",
						"name": "submissionLink",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "tweetLink",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "githubLink",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "twitterLink",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "videoLink",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "indieFunLink",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "projectLink",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "submissionTime",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "isWinner",
						"type": "bool"
					},
					{
						"internalType": "uint8",
						"name": "rank",
						"type": "uint8"
					}
				],
				"internalType": "struct BlockchainBounty.Submission",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_bountyId",
				"type": "uint256"
			}
		],
		"name": "getSubmissionCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_bountyId",
				"type": "uint256"
			}
		],
		"name": "getWinners",
		"outputs": [
			{
				"components": [
					{
						"internalType": "address",
						"name": "winner",
						"type": "address"
					},
					{
						"internalType": "uint8",
						"name": "rank",
						"type": "uint8"
					},
					{
						"internalType": "uint256",
						"name": "prizeAmount",
						"type": "uint256"
					}
				],
				"internalType": "struct BlockchainBounty.Winner[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "hasSubmitted",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_bountyId",
				"type": "uint256"
			}
		],
		"name": "refundBounty",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_bountyId",
				"type": "uint256"
			},
			{
				"internalType": "uint256[]",
				"name": "_submissionIds",
				"type": "uint256[]"
			},
			{
				"internalType": "uint8[]",
				"name": "_ranks",
				"type": "uint8[]"
			},
			{
				"internalType": "uint256[]",
				"name": "_prizeDistribution",
				"type": "uint256[]"
			}
		],
		"name": "selectWinners",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "submissionCounters",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "submissions",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "bountyId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "submitter",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "submissionLink",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "tweetLink",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "githubLink",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "twitterLink",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "videoLink",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "indieFunLink",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "projectLink",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "submissionTime",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "isWinner",
				"type": "bool"
			},
			{
				"internalType": "uint8",
				"name": "rank",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_bountyId",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "_submissionLink",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_tweetLink",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_githubLink",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_twitterLink",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_videoLink",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_indieFunLink",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_projectLink",
				"type": "string"
			}
		],
		"name": "submitWork",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "winners",
		"outputs": [
			{
				"internalType": "address",
				"name": "winner",
				"type": "address"
			},
			{
				"internalType": "uint8",
				"name": "rank",
				"type": "uint8"
			},
			{
				"internalType": "uint256",
				"name": "prizeAmount",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];
