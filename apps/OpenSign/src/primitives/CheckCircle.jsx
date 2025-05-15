import React from "react";

const CheckCircle = ({ size = 56, color = "text-green-500" }) => {
  return (
    <div className={`flex items-center justify-center ${color}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`w-${size / 4} h-${size / 4}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 12l2 2l4-4"
        />
      </svg>
    </div>
  );
};

export default CheckCircle;
