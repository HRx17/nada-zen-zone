import React from "react";
import { Sparkles } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 elevation-1">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-primary p-2.5 rounded-xl elevation-1">
              <Sparkles className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Lumi
              </h1>
              <p className="text-xs text-muted-foreground font-medium">AI Learning Hub</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
