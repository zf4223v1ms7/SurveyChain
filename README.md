# SurveyChain

**Privacy-Preserving Survey Platform with Fully Homomorphic Encryption**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-^0.8.24-blue)](https://soliditylang.org/)
[![Zama fhEVM](https://img.shields.io/badge/Zama-fhEVM-purple)](https://www.zama.ai/)

[Live Demo](https://surveychain.vercel.app) | [About Page](https://surveychain.vercel.app/about)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Demo Video](#demo-video)
- [Why Fully Homomorphic Encryption](#why-fully-homomorphic-encryption)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Smart Contract Architecture](#smart-contract-architecture)
- [Getting Started](#getting-started)
- [Deployment Guide](#deployment-guide)
- [Links](#links)

---

## 🎯 Overview

SurveyChain is a decentralized survey and voting platform built on Ethereum's Sepolia testnet using **Zama's fhEVM**. It enables organizations to conduct **completely private surveys** where individual votes remain encrypted on-chain, yet results can be computed without revealing voter choices.

### The Problem

Traditional online surveys face critical privacy challenges:
- Centralized databases allow administrators to access individual responses
- Third-party risk from database operators
- Results cannot be independently audited
- Vulnerable to vote manipulation

### The Solution

SurveyChain leverages FHE to:
- Encrypt votes client-side before blockchain submission
- Compute tallies on encrypted data without decryption
- Store all data on-chain for transparency
- Enable selective result disclosure through cryptographic permissions

---

## 🎬 Demo Video

![Demo Video](public/demo.mp4)

Watch how SurveyChain enables fully encrypted voting with complete privacy protection.

---

## 🔐 Why Fully Homomorphic Encryption?

### What is FHE?

**Fully Homomorphic Encryption (FHE)** allows computations on encrypted data without decryption:

```
Encrypted Vote A + Encrypted Vote B = Encrypted(A + B)
```

### How Survey Chain Uses FHE

1. **Client-Side Encryption**: Voters encrypt choices using Zama's FHE SDK
2. **On-Chain Aggregation**: Smart contract adds encrypted votes
3. **Permission-Based Decryption**: Only authorized viewers can decrypt results

### FHE Benefits

| Feature | Traditional | SurveyChain (FHE) |
|---------|------------|-------------------|
| Vote Privacy | ❌ Admin sees all | ✅ Encrypted |
| Computation | ❌ Needs decryption | ✅ On encrypted data |
| Transparency | ❌ Centralized | ✅ On-chain |
| Tamper Resistance | ❌ Modifiable | ✅ Immutable |

---

## ✨ Key Features

- ✅ **Fully Encrypted Voting** using Zama's TFHE
- ✅ **Multi-Option Surveys** (2-32 options)
- ✅ **Time-Bound Voting** (1 hour - 30 days)
- ✅ **One Vote Per Address**
- 👥 **Permission Management** (queue/grant/revoke viewers)
- ⏰ **Voting Extension** capability
- 🔒 **Finalization** locks voting permanently

---

## 🛠 Technology Stack

### Frontend
- React 18 + TypeScript
- Vite build tool
- Tailwind CSS + shadcn/ui

### Web3
- Wagmi v2 + Viem
- RainbowKit wallet connection
- Zama Relayer SDK

### Smart Contract
- Solidity ^0.8.24
- Zama fhEVM
- Hardhat development environment
- Sepolia Testnet deployment

---

## 🏗 System Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────────┐
│   Browser   │────────>│  Zama FHE    │────────>│  Smart Contract │
│   (Voter)   │         │    SDK       │         │   (Sepolia)     │
└─────────────┘         └──────────────┘         └─────────────────┘
      │                        │                          │
      │ 1. Select Option       │                          │
      │ 2. Encrypt Vote        │                          │
      │ 3. Generate Proof      │                          │
      │                        │ 4. Submit Tx             │
      │<─────────────────────────────────────────────────>│
      │                        │                          │
      │                        │                  ┌───────────────┐
      │                        │                  │  FHE.add()    │
      │                        │                  │  accumulate   │
      │                        │                  └───────────────┘
      │                        │                          │
      │                        │ 5. Request Decryption    │
      │<────────────────────────────────────────────────>│
      │                        │                          │
      ▼                        ▼                          ▼
┌─────────────────────────────────────────────────────────────┐
│            Zama Decryption Gateway                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 📐 Smart Contract Architecture

### Contract: `SurveyChain.sol`

**Network**: Sepolia Testnet  
**Address**: `0xD606501F2E98e345Ab32A627E861dF7DF2FD2135`

### State Variables

```solidity
address public admin;                           // Survey creator
string public title;                            // Survey question
uint256 public votingStart;                     // Start timestamp
uint256 public votingEnd;                       // End timestamp
bool public finalized;                          // Lock status

mapping(uint256 => euint64) private _votes;     // optionId => encrypted tally
mapping(address => bool) private _hasVoted;     // voter => voted flag
string[] private _options;                      // Answer options
mapping(address => bool) public canViewResults; // Authorized viewers
```

### Key Functions

#### Constructor
```solidity
constructor(
    string memory _title,
    string[] memory optionList,
    uint256 durationSeconds
)
```
- Validates 2-32 options and 1 hour - 30 day duration
- Initializes encrypted zero tallies
- Sets voting window

#### vote()
```solidity
function vote(
    uint256 optionId,
    externalEuint64 encryptedOne,
    bytes calldata proof
) external
```
- Verifies zero-knowledge proof
- Adds encrypted vote to tally: `FHE.add(_votes[optionId], one)`
- Marks voter as participated

#### finalize()
```solidity
function finalize() external
```
- Admin-only function
- Locks voting permanently
- Grants decryption permissions to authorized viewers

#### getTally()
```solidity
function getTally(uint256 optionId) external view returns (euint64)
```
- Returns encrypted tally (authorized viewers only)
- Requires survey finalization

### FHE Type System

| Type | Description | Use Case |
|------|-------------|----------|
| `euint64` | Encrypted 64-bit unsigned int | Vote tallies |
| `externalEuint64` | External encrypted input | User votes |

### Security Features

1. **Proof Verification**: `FHE.fromExternal()` validates ZK proofs
2. **Permission Isolation**: Tallies locked until finalization
3. **Single Vote Enforcement**: `_hasVoted` mapping
4. **Time Lock**: Strict voting window enforcement
5. **Permission Refresh**: `FHE.allowThis()` after mutations

---

## 🚀 Getting Started

### Prerequisites

```bash
Node.js >= 18.0.0
npm >= 9.0.0
MetaMask or Web3 wallet
Sepolia testnet ETH
```

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/SurveyChain.git
cd SurveyChain

# Install dependencies
npm install

# Start dev server
npm run dev
```

### Environment Variables

Create `.env`:

```env
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
PRIVATE_KEY=your_private_key_here
```

---

## 📦 Deployment Guide

### Smart Contract Deployment

```bash
# Compile contracts
npx hardhat compile

# Deploy to Sepolia
export SEPOLIA_RPC_URL="https://ethereum-sepolia-rpc.publicnode.com"
export PRIVATE_KEY="your_private_key"
npx hardhat run scripts/deploy.js --network sepolia

# Verify on Etherscan
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> \
  "Survey Title" \
  '["Option 1","Option 2","Option 3"]' \
  604800
```

### Frontend Deployment

```bash
# Deploy to Vercel
vercel --prod

# Set custom domain
vercel alias set <deployment-url> surveychain.vercel.app
```

#### vercel.json Configuration

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 🔗 Links

- **Live Demo**: https://surveychain.vercel.app
- **About Page**: https://surveychain.vercel.app/about
- **Contract**: `0xD606501F2E98e345Ab32A627E861dF7DF2FD2135`
- **Etherscan**: https://sepolia.etherscan.io/address/0xD606501F2E98e345Ab32A627E861dF7DF2FD2135
- **Zama Docs**: https://docs.zama.ai/fhevm
- **fhEVM GitHub**: https://github.com/zama-ai/fhevm

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file

---

## 🙏 Acknowledgments

- **Zama** - fhEVM and TFHE technology
- **Ethereum Foundation** - Sepolia testnet
- **shadcn/ui** - React components
- **RainbowKit** - Wallet integration

---

**Built with ❤️ using Fully Homomorphic Encryption**
