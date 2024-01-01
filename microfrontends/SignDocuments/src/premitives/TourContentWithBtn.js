import React, { useState } from "react";

export default function TourContentWithBtn({ message, isChecked }) {
  const [isCheck, setIsCheck] = useState(false);

  const handleCheck = () => {
    setIsCheck(!isCheck);
    if (isChecked) {
      isChecked(!isCheck);
    }
  };
  return (
    <div>
      <p>{message}</p>
      <label style={{ textAlign: "center", display: "flex" }}>
        <input
          type="checkbox"
          style={{ marginRight: 3 }}
          checked={isCheck}
          onChange={handleCheck}
        />{" "}
        <span>Don't show</span>
      </label>
    </div>
  );
}
