import React from "react";
import { Sparkles } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50 elevation-1">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-primary to-primary-hover p-2.5 rounded-xl elevation-1">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground leading-none tracking-tight">
              Lumi
            </h1>
            <p className="text-xs text-muted-foreground font-medium leading-none mt-0.5">AI Learning Platform</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
