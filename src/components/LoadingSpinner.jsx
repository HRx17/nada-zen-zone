import React from "react";

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 shadow-2xl">
        <div className="flex flex-col items-center">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          <div className="text-white text-xl font-semibold mb-2">Lumi is thinking...</div>
          <div className="text-gray-400 text-sm">Generating your personalized lesson</div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
