import React from "react";
import { Sparkles } from "lucide-react";

const Header = () => {
  return (
    <header className="glass sticky top-0 z-50 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl animate-pulse-glow"></div>
              <div className="relative bg-gradient-to-br from-primary to-primary-glow p-3 rounded-2xl">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-black gradient-text">
                Lumi
              </h1>
              <p className="text-xs text-muted-foreground font-medium tracking-wider uppercase">
                AI Study Partner
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
