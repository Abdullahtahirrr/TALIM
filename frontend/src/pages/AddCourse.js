import React from "react";
import Button from "../components/Button";

const MockupPage = () => {
  const handleClick = (variant) => {
    alert(`${variant} button clicked!`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 gap-4">
      <h1 className="text-2xl font-bold">Test Buttons</h1>
      <Button variant="dark">Dark Purple</Button>
      <Button variant="light">Light Purple </Button>

    </div>
  );
};

export default MockupPage;
