import React from "react";
import { Lightbulb } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-card border-b border-border material-elevation-1 sticky top-0 z-50 backdrop-blur-sm bg-card/95">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-primary/10 p-2.5 rounded-xl">
              <Lightbulb className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Lumi
              </h1>
              <p className="text-xs text-muted-foreground">AI Learning Companion</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
