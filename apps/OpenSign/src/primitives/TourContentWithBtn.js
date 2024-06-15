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
      <label
        style={{
          textAlign: "center",
          display: "flex",
          justifyContent: "center"
        }}
      >
        <input
          type="checkbox"
          style={{ marginRight: 3 }}
          checked={isCheck}
          onChange={handleCheck}
        />{" "}
        <span style={{ color: "#787878", fontSize: 12 }}>
          Don&apos;t show this again
        </span>
      </label>
    </div>
  );
}
