require("dotenv").config();
const hre = require("hardhat");

async function main() {
  const contractAddress = "0xFd56773E34D5C267B3974eb9abC76D54114E21BA";

  console.log("🧪 Testing SurveyChain contract...");

  const [signer] = await hre.ethers.getSigners();
  console.log("Signer:", signer.address);

  const SurveyChain = await hre.ethers.getContractAt("SurveyChain", contractAddress);

  // Get survey info
  console.log("\n📊 Survey Info:");
  const info = await SurveyChain.getSurveyInfo();
  console.log("Title:", info[0]);
  console.log("Start Time:", new Date(Number(info[1]) * 1000).toLocaleString());
  console.log("End Time:", new Date(Number(info[2]) * 1000).toLocaleString());
  console.log("Finalized:", info[3]);
  console.log("Options Count:", Number(info[4]));

  // Get options
  const options = await SurveyChain.getOptions();
  console.log("\n📋 Options:");
  options.forEach((opt, i) => {
    console.log(`${i}. ${opt}`);
  });

  // Check if already voted
  const hasVoted = await SurveyChain.hasVoted(signer.address);
  console.log("\n✅ Has Voted:", hasVoted);

  // Check voting period
  const now = Math.floor(Date.now() / 1000);
  const votingStart = Number(info[1]);
  const votingEnd = Number(info[2]);

  console.log("\n⏰ Timing:");
  console.log("Current Time:", new Date().toLocaleString());
  console.log("Voting Open:", now >= votingStart && now <= votingEnd);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
