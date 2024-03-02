import React, { useState } from "react";
import "../../css/AddUser.css";
// import SelectFolder from "../../premitives/SelectFolder";

const EditTemplate = ({ template, onSuccess }) => {
  // const [folder, setFolder] = useState({ ObjectId: "", Name: "" });
  const [formData, setFormData] = useState({
    Name: template?.Name || "",
    Note: template?.Note || "",
    Description: template?.Description || "",
    SendinOrder: template?.SendinOrder ? `${template?.SendinOrder}` : "false"
  });

  const handleStrInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  // const handleFolder = (data) => {
  //   console.log("handleFolder ", data)
  //   setFolder(data);
  // };

  // Define a function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const isChecked = formData.SendinOrder === "true" ? true : false;
    const data = { ...formData, SendinOrder: isChecked };
    onSuccess(data);
  };

  return (
    <div className="addusercontainer">
      <div className="form-wrapper">
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" style={{ fontSize: 13 }}>
              File
            </label>
            <div
              style={{
                padding: "0.5rem 0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.375rem",
                fontSize: "0.75rem",
                fontWeight: "700"
              }}
            >
              {template.URL?.split("/")?.pop()?.split("_")[1]}
            </div>
          </div>
          <div className="form-section">
            <label htmlFor="name" style={{ fontSize: 13 }}>
              Name
              <span style={{ color: "red", fontSize: 13 }}> *</span>
            </label>
            <input
              type="text"
              name="Name"
              value={formData.Name}
              onChange={(e) => handleStrInput(e)}
              required
              className="addUserInput"
            />
          </div>
          <div className="form-section">
            <label htmlFor="Note" style={{ fontSize: 13 }}>
              Note
            </label>
            <input
              type="text"
              name="Note"
              id="Note"
              value={formData.Note}
              onChange={(e) => handleStrInput(e)}
              className="addUserInput"
            />
          </div>
          <div className="form-section">
            <label htmlFor="Description" style={{ fontSize: 13 }}>
              Description
            </label>
            <input
              type="text"
              name="Description"
              id="Description"
              value={formData.Description}
              onChange={(e) => handleStrInput(e)}
              className="addUserInput"
            />
          </div>
          <div className="form-section">
            <label style={{ fontSize: 13 }}>Send In Order</label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginLeft: 8,
                marginBottom: 5
              }}
            >
              <input
                type="radio"
                value={"true"}
                name="SendinOrder"
                checked={formData.SendinOrder === "true"}
                onChange={handleStrInput}
              />
              <div style={{ fontSize: 12 }}>Yes</div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginLeft: 8,
                marginBottom: 5
              }}
            >
              <input
                type="radio"
                value={"false"}
                name="SendinOrder"
                checked={formData.SendinOrder === "false"}
                onChange={handleStrInput}
              />
              <div style={{ fontSize: 12 }}>No</div>
            </div>
          </div>
          {/* <SelectFolder onSuccess={handleFolder} folderCls={"contracts_Template"} /> */}
          <div className="buttoncontainer">
            <button type="submit" className="submitbutton">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTemplate;
