import { Clock, Lock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface SurveyCardProps {
  id: string;
  title: string;
  description: string;
  questions: number;
  responses: number;
  createdAt: Date;
  onAnswer: () => void;
}

const SurveyCard = ({ title, description, questions, responses, createdAt, onAnswer }: SurveyCardProps) => {
  const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <Card className="group hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 glass-card border-2 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 gradient-primary opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
              {title}
            </CardTitle>
            <CardDescription className="text-sm">
              {description}
            </CardDescription>
          </div>
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Lock className="w-5 h-5" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center gap-1">
            <div className="text-2xl font-bold text-primary">{questions}</div>
            <div className="text-xs text-muted-foreground">Questions</div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="text-2xl font-bold text-accent">{responses}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="w-3 h-3" />
              Responses
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Clock className="w-5 h-5 text-muted-foreground mb-1" />
            <div className="text-xs text-muted-foreground">{timeAgo(createdAt)}</div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full gradient-primary hover:opacity-90 transition-opacity shadow-glow"
          onClick={onAnswer}
        >
          Answer Survey
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SurveyCard;
