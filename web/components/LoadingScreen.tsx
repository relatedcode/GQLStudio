import Spinner from "components/Spinner";
import React from "react";

export default function LoadingScreen() {
  return (
    <div className="h-screen w-screen bg-gray-800 flex items-center justify-center">
      <Spinner className="h-6 w-6 text-white" />
    </div>
  );
}
