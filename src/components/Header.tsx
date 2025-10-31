import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 glass-card">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
              <img src="/logo.svg" alt="SurveyChain" className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient">FHE Survey</h1>
              <p className="text-xs text-muted-foreground">Privacy-First Surveys</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            <Link to="/">
              <Button variant="ghost" size="sm">Home</Button>
            </Link>
            <Link to="/about">
              <Button variant="ghost" size="sm">About</Button>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-primary animate-glow-pulse" />
            <span>Fully Encrypted</span>
          </div>
          <ConnectButton />
        </div>
      </div>
    </header>
  );
};

export default Header;
