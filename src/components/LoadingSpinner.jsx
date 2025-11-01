import React from "react";

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="text-white text-xl">Loading...</div>
    </div>
  );
};

export default LoadingSpinner;
