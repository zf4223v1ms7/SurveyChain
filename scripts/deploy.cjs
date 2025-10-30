require("dotenv").config();
const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying SurveyChain contract...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deployer address:", deployer.address);

  // Survey parameters
  const title = "Community Sentiment Survey";
  const options = [
    "Very Satisfied",
    "Satisfied",
    "Neutral",
    "Dissatisfied",
    "Very Dissatisfied"
  ];
  const duration = 7 * 24 * 60 * 60; // 7 days

  console.log("\n📋 Survey Details:");
  console.log("Title:", title);
  console.log("Options:", options.join(", "));
  console.log("Duration:", duration / (24 * 60 * 60), "days");

  const SurveyChain = await hre.ethers.getContractFactory("SurveyChain");
  const survey = await SurveyChain.deploy(title, options, duration);

  await survey.waitForDeployment();
  const address = await survey.getAddress();

  console.log("\n✅ SurveyChain deployed to:", address);
  console.log("\n📝 Save this address for frontend configuration:");
  console.log(`export const SURVEY_ADDRESS = "${address}";`);

  // Get survey info
  const info = await survey.getSurveyInfo();
  console.log("\n📊 Survey Info:");
  console.log("Title:", info[0]);
  console.log("Start Time:", new Date(Number(info[1]) * 1000).toLocaleString());
  console.log("End Time:", new Date(Number(info[2]) * 1000).toLocaleString());
  console.log("Finalized:", info[3]);
  console.log("Options Count:", Number(info[4]));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
