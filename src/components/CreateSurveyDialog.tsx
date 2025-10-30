import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAccount, useWalletClient } from "wagmi";
import { BrowserProvider, Contract, ContractFactory } from "ethers";
import { SURVEYCHAIN_ABI } from "@/config/contracts";

interface Question {
  id: string;
  text: string;
}

interface CreateSurveyDialogProps {
  onCreateSurvey: (survey: { address: string; title: string; description: string; questions: string[] }) => void;
}

const CreateSurveyDialog = ({ onCreateSurvey }: CreateSurveyDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([{ id: "1", text: "" }]);

  const addQuestion = () => {
    setQuestions([...questions, { id: Date.now().toString(), text: "" }]);
  };

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== id));
    }
  };

  const updateQuestion = (id: string, text: string) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, text } : q)));
  };

  const handleCreate = () => {
    if (!title.trim()) {
      toast.error("Please enter a survey title");
      return;
    }
    
    const filledQuestions = questions.filter((q) => q.text.trim());
    if (filledQuestions.length === 0) {
      toast.error("Please add at least one question");
      return;
    }

    onCreateSurvey({
      title: title.trim(),
      description: description.trim(),
      questions: filledQuestions.map((q) => q.text.trim()),
    });

    // Reset form
    setTitle("");
    setDescription("");
    setQuestions([{ id: "1", text: "" }]);
    setOpen(false);
    
    toast.success("Survey created successfully!");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gradient-primary hover:opacity-90 shadow-glow">
          <Plus className="w-4 h-4 mr-2" />
          Create Survey
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-gradient">Create New Survey</DialogTitle>
          <DialogDescription>
            Create a privacy-preserving survey with FHE encryption. All responses will be fully encrypted.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Survey Title</Label>
            <Input
              id="title"
              placeholder="Enter survey title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-2 focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe your survey..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border-2 focus:border-primary min-h-[80px]"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Questions</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addQuestion}
                className="hover:border-primary hover:text-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </div>

            <div className="space-y-3">
              {questions.map((question, index) => (
                <div key={question.id} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <Input
                      placeholder={`Question ${index + 1}`}
                      value={question.text}
                      onChange={(e) => updateQuestion(question.id, e.target.value)}
                      className="border-2 focus:border-primary"
                    />
                  </div>
                  {questions.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeQuestion(question.id)}
                      className="hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} className="gradient-primary hover:opacity-90 shadow-glow">
            Create Survey
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSurveyDialog;
