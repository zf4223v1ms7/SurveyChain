import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Vote, ExternalLink } from "lucide-react";

const About = () => {
  const contractAddress = "0xD606501F2E98e345Ab32A627E861dF7DF2FD2135";
  const explorerUrl = `https://sepolia.etherscan.io/address/${contractAddress}`;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container px-4 py-12 max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            About SurveyChain
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Privacy-Preserving Surveys on Blockchain
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            SurveyChain leverages Fully Homomorphic Encryption to enable completely private and verifiable surveys on the blockchain
          </p>
        </div>

        {/* Demo Video Section */}
        <Card className="p-8 mb-12 bg-gradient-card">
          <h2 className="text-2xl font-bold mb-6 text-center">Demo Video</h2>
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
            <video
              controls
              className="w-full h-full"
              poster="/placeholder-video.png"
            >
              <source src="/demo.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Watch how SurveyChain enables encrypted voting with complete privacy protection
          </p>
        </Card>

        {/* Project Introduction */}
        <Card className="p-8 mb-8 bg-gradient-card">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Vote className="h-6 w-6 text-primary" />
            What is SurveyChain?
          </h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              SurveyChain is a decentralized survey platform built on Ethereum that uses
              <strong className="text-foreground"> Fully Homomorphic Encryption (FHE)</strong> to protect voter privacy
              while maintaining result verifiability.
            </p>
            <p>
              Traditional online surveys expose individual responses to survey administrators and database operators.
              SurveyChain solves this by encrypting votes on the client-side before submission, ensuring that
              <strong className="text-foreground"> individual responses remain private even from the smart contract itself</strong>.
            </p>
            <p>
              Key Features:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong className="text-foreground">Complete Privacy:</strong> Votes are encrypted before leaving your device</li>
              <li><strong className="text-foreground">Transparent Results:</strong> Final tallies are computed on encrypted data and publicly verifiable</li>
              <li><strong className="text-foreground">Immutable Records:</strong> All surveys are permanently stored on the Ethereum blockchain</li>
              <li><strong className="text-foreground">Zero Knowledge Proofs:</strong> Prove you voted without revealing your choice</li>
            </ul>
          </div>
        </Card>

        {/* FHE Explanation */}
        <Card className="p-8 mb-8 bg-gradient-card">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Lock className="h-6 w-6 text-primary" />
            What is Fully Homomorphic Encryption?
          </h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              <strong className="text-foreground">Fully Homomorphic Encryption (FHE)</strong> is a revolutionary
              cryptographic technique that allows computations to be performed directly on encrypted data without
              ever decrypting it.
            </p>
            <p>
              In SurveyChain, this means:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Your vote is encrypted on your device using your wallet's private key</li>
              <li>The encrypted vote is submitted to the smart contract</li>
              <li>The contract aggregates encrypted votes without knowing individual choices</li>
              <li>Only the final tally is decrypted and revealed publicly</li>
            </ul>
            <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm">
                <strong className="text-foreground">Technical Implementation:</strong> SurveyChain uses
                Zama's <code className="text-primary">fhEVM</code> library, which implements the TFHE
                (Torus Fully Homomorphic Encryption) scheme optimized for Ethereum Virtual Machine execution.
              </p>
            </div>
          </div>
        </Card>

        {/* Smart Contract Info */}
        <Card className="p-8 bg-gradient-card">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Smart Contract Details
          </h2>
          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Network</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Sepolia Testnet</Badge>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Contract Address</p>
              <div className="flex items-center gap-2 flex-wrap">
                <code className="text-sm bg-muted px-3 py-2 rounded font-mono break-all">
                  {contractAddress}
                </code>
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  View on Etherscan
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Key Functions</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <code className="text-primary bg-primary/10 px-2 py-1 rounded">vote()</code>
                  <span className="text-muted-foreground">Submit an encrypted vote for a survey option</span>
                </li>
                <li className="flex items-start gap-2">
                  <code className="text-primary bg-primary/10 px-2 py-1 rounded">getTally()</code>
                  <span className="text-muted-foreground">Retrieve the decrypted vote count for an option</span>
                </li>
                <li className="flex items-start gap-2">
                  <code className="text-primary bg-primary/10 px-2 py-1 rounded">finalize()</code>
                  <span className="text-muted-foreground">Close voting and trigger result decryption</span>
                </li>
                <li className="flex items-start gap-2">
                  <code className="text-primary bg-primary/10 px-2 py-1 rounded">grantView()</code>
                  <span className="text-muted-foreground">Grant permission to view encrypted tallies</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                The smart contract is fully auditable and open-source. All survey data, encrypted votes,
                and tallies are permanently stored on the blockchain for maximum transparency and immutability.
              </p>
            </div>
          </div>
        </Card>

        {/* Tech Stack */}
        <div className="mt-12 text-center">
          <h3 className="text-lg font-semibold mb-4">Built With</h3>
          <div className="flex flex-wrap justify-center gap-3">
            <Badge variant="outline">Solidity</Badge>
            <Badge variant="outline">Zama fhEVM</Badge>
            <Badge variant="outline">Ethereum Sepolia</Badge>
            <Badge variant="outline">React</Badge>
            <Badge variant="outline">TypeScript</Badge>
            <Badge variant="outline">Wagmi</Badge>
            <Badge variant="outline">RainbowKit</Badge>
            <Badge variant="outline">Tailwind CSS</Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
