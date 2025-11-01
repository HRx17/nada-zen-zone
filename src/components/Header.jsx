import React from "react";

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6 shadow-lg border-b border-gray-700">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-4xl mr-3">💡</span>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Lumi
            </h1>
            <p className="text-sm text-gray-400">Your AI Learning Companion</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
