import React, { useEffect, useState } from "react";
import ModalUi from "../../premitives/ModalUi";
import "../../css/AddUser.css";

const NameModal = ({ isOpen, handleClose, handleData, defaultdata }) => {
  console.log("defaultdata ", defaultdata?.options);
  const [formdata, setFormdata] = useState({
    name: defaultdata?.options?.name || "",
    defaultValue: defaultdata?.options?.defaultValue || "",
    status: defaultdata?.options?.status || "required"
  });
  const statusArr = ["Required", "Optional"];
  useEffect(() => {
    if (defaultdata) {
      setFormdata({
        name: defaultdata?.options?.name || "",
        defaultValue: defaultdata?.options?.defaultValue || "",
        status: defaultdata?.options?.status || "required"
      });
    }
  }, [defaultdata]);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (handleData) {
      handleData(formdata);
      setFormdata({ name: "", status: "required", defaultValue: "" });
    }
  };
  const handleChange = (e) => {
    setFormdata({ ...formdata, [e.target.name]: e.target.value });
  };
  return (
    <ModalUi
      isOpen={isOpen}
      handleClose={handleClose && handleClose}
      title={"Widget info"}
    >
      <form onSubmit={handleSubmit} style={{ padding: 20 }}>
        <div className="form-section">
          <label htmlFor="name" style={{ fontSize: 13 }}>
            Name
            <span style={{ color: "red", fontSize: 13 }}> *</span>
          </label>
          <input
            className="addUserInput"
            name="name"
            value={formdata.name}
            onChange={(e) => handleChange(e)}
            required
          />
        </div>
        <div className="form-section">
          <label htmlFor="name" style={{ fontSize: 13 }}>
            Default value
          </label>
          <input
            className="addUserInput"
            name="defaultValue"
            value={formdata.defaultValue}
            onChange={(e) => handleChange(e)}
          />
        </div>
        <div className="form-section">
          <label htmlFor="name" style={{ fontSize: 13 }}>
            Status
          </label>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: 10,
              marginBottom: "0.5rem"
            }}
          >
            {statusArr.map((data, ind) => {
              return (
                <div
                  key={ind}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 5,
                    alignItems: "center"
                  }}
                >
                  <input
                    style={{ accentColor: "red", marginRight: "10px" }}
                    type="radio"
                    name="status"
                    onChange={(e) =>
                      setFormdata({ ...formdata, status: data.toLowerCase() })
                    }
                    checked={
                      formdata.status.toLowerCase() === data.toLowerCase()
                    }
                  />
                  <div style={{ fontSize: "13px", fontWeight: "500" }}>
                    {data}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div
          style={{
            height: 1,
            backgroundColor: "#b7b3b3",
            width: "100%",
            marginBottom: "16px"
          }}
        ></div>
        <button
          style={{
            color: "white",
            padding: "5px 20px",
            backgroundColor: "#32a3ac"
          }}
          type="submit"
          className="finishBtn"
        >
          Add
        </button>
      </form>
    </ModalUi>
  );
};

export default NameModal;
