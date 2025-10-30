import { useState } from "react";
import Header from "@/components/Header";
import SurveyCard from "@/components/SurveyCard";
import AnswerSurveyDialog from "@/components/AnswerSurveyDialog";
import { Shield, Zap, Lock } from "lucide-react";
import { SURVEYCHAIN_ADDRESS } from "@/config/contracts";

interface Survey {
  id: string;
  title: string;
  description: string;
  options: string[];
  responses: number;
  createdAt: Date;
  address: string;
}

const Index = () => {
  // Display the deployed survey contract
  const [surveys] = useState<Survey[]>([
    {
      id: "1",
      title: "Community Sentiment Survey",
      description: "Share your feedback about our community. Your vote is fully encrypted using FHE technology.",
      options: [
        "Very Satisfied",
        "Satisfied",
        "Neutral",
        "Dissatisfied",
        "Very Dissatisfied"
      ],
      responses: 0,
      createdAt: new Date(),
      address: SURVEYCHAIN_ADDRESS,
    },
  ]);

  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [answerDialogOpen, setAnswerDialogOpen] = useState(false);

  const handleAnswerSurvey = (survey: Survey) => {
    setSelectedSurvey(survey);
    setAnswerDialogOpen(true);
  };

  const handleVoted = () => {
    // Refresh page or update state after voting
  };

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 gradient-glow" />

        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-4">
              <Shield className="w-4 h-4" />
              <span>Powered by FHE Encryption</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-gradient leading-tight">
              Privacy-First Surveys
              <br />
              On the Blockchain
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Create and answer surveys with complete privacy. All responses are encrypted using
              Fully Homomorphic Encryption before being stored on-chain.
            </p>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 pt-12">
              <div className="glass-card p-6 rounded-xl text-center space-y-3 hover:shadow-elevated transition-shadow">
                <div className="w-12 h-12 mx-auto rounded-lg gradient-primary flex items-center justify-center shadow-glow">
                  <Lock className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-lg">Fully Encrypted</h3>
                <p className="text-sm text-muted-foreground">
                  Responses encrypted with FHE technology
                </p>
              </div>

              <div className="glass-card p-6 rounded-xl text-center space-y-3 hover:shadow-elevated transition-shadow">
                <div className="w-12 h-12 mx-auto rounded-lg gradient-primary flex items-center justify-center shadow-glow">
                  <Shield className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-lg">Blockchain Verified</h3>
                <p className="text-sm text-muted-foreground">
                  Immutable and transparent on-chain storage
                </p>
              </div>

              <div className="glass-card p-6 rounded-xl text-center space-y-3 hover:shadow-elevated transition-shadow">
                <div className="w-12 h-12 mx-auto rounded-lg gradient-primary flex items-center justify-center shadow-glow">
                  <Zap className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-lg">Instant Voting</h3>
                <p className="text-sm text-muted-foreground">
                  Vote instantly with encrypted privacy
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Surveys Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">Active Surveys</h2>
                <p className="text-muted-foreground">Browse and participate in privacy-preserving surveys</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {surveys.map((survey) => (
                <SurveyCard
                  key={survey.id}
                  id={survey.id}
                  title={survey.title}
                  description={survey.description}
                  questions={survey.options.length}
                  responses={survey.responses}
                  createdAt={survey.createdAt}
                  onAnswer={() => handleAnswerSurvey(survey)}
                />
              ))}
            </div>

            {surveys.length === 0 && (
              <div className="text-center py-16">
                <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No Surveys Yet</h3>
                <p className="text-muted-foreground">Check back later for privacy-preserving surveys!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Answer Dialog */}
      <AnswerSurveyDialog
        survey={selectedSurvey}
        open={answerDialogOpen}
        onClose={() => {
          setAnswerDialogOpen(false);
          setSelectedSurvey(null);
        }}
        onVoted={handleVoted}
      />
    </div>
  );
};

export default Index;
