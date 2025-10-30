require("dotenv").config();
const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 Deploying 3 SurveyChain contracts...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deployer address:", deployer.address);

  const surveys = [
    {
      title: "Community Sentiment Survey",
      options: [
        "Very Satisfied",
        "Satisfied",
        "Neutral",
        "Dissatisfied",
        "Very Dissatisfied"
      ],
      duration: 7 * 24 * 60 * 60, // 7 days
      description: "Share your feedback about our community"
    },
    {
      title: "Product Feature Priority Poll",
      options: [
        "Privacy Features",
        "Performance Improvements",
        "User Interface",
        "Documentation",
        "Mobile Support"
      ],
      duration: 14 * 24 * 60 * 60, // 14 days
      description: "Help us prioritize our development roadmap"
    },
    {
      title: "Developer Experience Survey",
      options: [
        "Excellent",
        "Good",
        "Average",
        "Needs Improvement",
        "Poor"
      ],
      duration: 10 * 24 * 60 * 60, // 10 days
      description: "Rate your experience building with our platform"
    }
  ];

  const deployedSurveys = [];
  const SurveyChain = await hre.ethers.getContractFactory("SurveyChain");

  for (let i = 0; i < surveys.length; i++) {
    const survey = surveys[i];
    console.log(`\n📋 Deploying Survey ${i + 1}: ${survey.title}`);
    console.log("Options:", survey.options.join(", "));
    console.log("Duration:", survey.duration / (24 * 60 * 60), "days");

    const contract = await SurveyChain.deploy(
      survey.title,
      survey.options,
      survey.duration
    );

    await contract.waitForDeployment();
    const address = await contract.getAddress();

    console.log(`✅ Deployed to: ${address}`);

    // Get survey info
    const info = await contract.getSurveyInfo();

    deployedSurveys.push({
      id: (i + 1).toString(),
      title: survey.title,
      description: survey.description,
      address: address,
      options: survey.options,
      startTime: Number(info[1]),
      endTime: Number(info[2]),
      finalized: info[3],
      optionsCount: Number(info[4])
    });
  }

  // Save to JSON file
  const outputPath = "./deployed-surveys.json";
  fs.writeFileSync(outputPath, JSON.stringify(deployedSurveys, null, 2));

  console.log("\n\n✅ All surveys deployed successfully!");
  console.log(`📝 Deployment info saved to: ${outputPath}`);

  console.log("\n📊 Deployed Surveys:");
  deployedSurveys.forEach(s => {
    console.log(`\n${s.id}. ${s.title}`);
    console.log(`   Address: ${s.address}`);
    console.log(`   Options: ${s.options.length}`);
    console.log(`   End Time: ${new Date(s.endTime * 1000).toLocaleString()}`);
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
