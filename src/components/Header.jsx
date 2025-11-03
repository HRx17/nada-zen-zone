import React from "react";
import { Sparkles } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 elevation-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center space-x-2.5">
          <div className="bg-primary p-2 rounded-lg elevation-1">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground leading-none">
              Lumi
            </h1>
            <p className="text-[10px] text-muted-foreground font-medium leading-none mt-0.5">AI Learning Hub</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
