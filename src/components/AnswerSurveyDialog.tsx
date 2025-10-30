import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { useAccount, useWalletClient } from "wagmi";
import { BrowserProvider, Contract } from "ethers";
import { SURVEYCHAIN_ADDRESS, SURVEYCHAIN_ABI } from "@/config/contracts";
import { encryptVote } from "@/lib/fhe";

interface Survey {
  id: string;
  title: string;
  description: string;
  options: string[];
  address: string;
}

interface AnswerSurveyDialogProps {
  survey: Survey | null;
  open: boolean;
  onClose: () => void;
  onVoted: () => void;
}

const AnswerSurveyDialog = ({ survey, open, onClose, onVoted }: AnswerSurveyDialogProps) => {
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [isVoting, setIsVoting] = useState(false);
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  const handleVote = async () => {
    if (!survey || !selectedOption || !address || !walletClient) {
      toast.error("Please select an option and connect your wallet");
      return;
    }

    setIsVoting(true);

    try {
      const optionIndex = survey.options.indexOf(selectedOption);

      toast.info("🔐 Encrypting Vote", {
        description: "Encrypting your vote using FHE...",
      });

      // Encrypt vote (always encrypt 1)
      const { encryptedOne, proof } = await encryptVote(
        survey.address,
        address
      );

      toast.info("📝 Submitting Vote", {
        description: "Sending encrypted vote to blockchain...",
      });

      // Submit to contract
      const provider = new BrowserProvider(walletClient);
      const signer = await provider.getSigner();
      const contract = new Contract(survey.address, SURVEYCHAIN_ABI, signer);

      const tx = await contract.vote(optionIndex, encryptedOne, proof);
      await tx.wait();

      toast.success("Vote submitted successfully!", {
        description: "Your vote is encrypted and secure"
      });

      onVoted();
      setSelectedOption("");
      onClose();
    } catch (error: any) {
      console.error("Vote error:", error);
      toast.error("Failed to submit vote", {
        description: error.message || "Please try again"
      });
    } finally {
      setIsVoting(false);
    }
  };

  if (!survey) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-gradient flex items-center gap-2">
            <Lock className="w-6 h-6 text-primary" />
            {survey.title}
          </DialogTitle>
          <DialogDescription>
            {survey.description || "Your responses will be encrypted using FHE technology"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 flex items-start gap-3">
            <Lock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm text-muted-foreground">
              <strong className="text-foreground">Privacy Protected:</strong> Your vote is encrypted
              using Fully Homomorphic Encryption (FHE) before being stored on-chain.
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-base">Select your answer:</Label>
            <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
              {survey.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border-2 hover:border-primary transition-colors">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label
                    htmlFor={`option-${index}`}
                    className="flex-1 cursor-pointer"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isVoting}>
            Cancel
          </Button>
          <Button
            onClick={handleVote}
            disabled={!selectedOption || isVoting}
            className="gradient-primary hover:opacity-90 shadow-glow"
          >
            {isVoting ? "Voting..." : "Submit Encrypted Vote"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AnswerSurveyDialog;
