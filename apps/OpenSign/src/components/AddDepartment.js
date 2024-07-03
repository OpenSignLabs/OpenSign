import React, { useEffect, useState } from "react";
import Parse from "parse";
import Title from "./Title";
import Alert from "../primitives/Alert";
import Loader from "../primitives/Loader";

const AddDepartment = (props) => {
  const [formdata, setFormdata] = useState({
    name: "",
    department: ""
  });
  const [isLoader, setIsLoader] = useState(false);
  const [isAlert, setIsAlert] = useState({ type: "success", msg: "" });
  const [departmentList, setDepartmentList] = useState([]);
  useEffect(() => {
    getDepartmentList();
  }, []);

  const getDepartmentList = async () => {
    try {
      const extUser = JSON.parse(localStorage.getItem("Extand_Class"))?.[0];
      const department = new Parse.Query("contracts_Departments");
      department.equalTo("OrganizationId", {
        __type: "Pointer",
        className: "contracts_Organizations",
        objectId: extUser.OrganizationId.objectId
      });
      department.equalTo("IsActive", true);
      const departmentRes = await department.find();
      if (departmentRes.length > 0) {
        const _departmentRes = JSON.parse(JSON.stringify(departmentRes));
        setDepartmentList(_departmentRes);
      }
    } catch (err) {
      console.log("Err in fetch top level departmentlist", err);
    }
  };

  const handleDropdown = (e) => {
    setFormdata((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  // Define a function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Extracting values except for the 'name' key
    let updatedAncestors = [];
    if (formdata.department) {
      const Ancestors = departmentList.find(
        (x) => x.objectId === formdata.department
      )?.Ancestors;
      if (Ancestors && Ancestors.length > 0) {
        updatedAncestors = Ancestors.map((x) => ({
          __type: "Pointer",
          className: "contracts_Departments",
          objectId: x.objectId
        }));
      } else {
        const AllUser = departmentList.find((x) => x.objectId === "All Users");
        updatedAncestors = [
          AllUser,
          {
            __type: "Pointer",
            className: "contracts_Departments",
            objectId: formdata.department
          }
        ];
      }
    }
    try {
      const localUser = JSON.parse(localStorage.getItem("Extand_Class"))?.[0];
      setIsLoader(true);
      const department = new Parse.Query("contracts_Departments");
      department.equalTo("Name", formdata.name);
      if (updatedAncestors.length > 0) {
        const ParentId = updatedAncestors[updatedAncestors.length - 1];
        department.equalTo("ParentId", ParentId);
      }
      if (localUser && localUser.OrganizationId) {
        department.equalTo("OrganizationId", {
          __type: "Pointer",
          className: "contracts_Organizations",
          objectId: localUser.OrganizationId.objectId
        });
      }
      const isDepartment = await department.first();
      if (isDepartment) {
        setIsAlert({ type: "info", msg: "Department already exists." });
        setIsLoader(false);
      } else {
        const newDepartment = new Parse.Object("contracts_Departments");
        newDepartment.set("Name", formdata.name);
        if (updatedAncestors.length > 0) {
          const ParentId = updatedAncestors[updatedAncestors.length - 1];
          newDepartment.set("ParentId", ParentId);
          newDepartment.set("Ancestors", updatedAncestors);
        }
        if (localUser && localUser.OrganizationId) {
          newDepartment.set("OrganizationId", {
            __type: "Pointer",
            className: "contracts_Organizations",
            objectId: localUser.OrganizationId.objectId
          });
        }
        const newdepartmentRes = await newDepartment.save();
        if (updatedAncestors.length > 0) {
          const ParentId = departmentList.find(
            (x) => x.objectId === formdata.department
          );
          props.handleTeamInfo({
            objectId: newdepartmentRes.id,
            Name: formdata.name,
            ParentId: ParentId,
            Ancestors: updatedAncestors,
            IsActive: true
          });
        } else {
          props.handleTeamInfo({
            objectId: newdepartmentRes.id,
            Name: formdata.name,
            ParentId: "",
            Ancestors: "",
            IsActive: true
          });
        }

        if (props.closePopup) {
          props.closePopup();
        }
        setFormdata({
          name: "",
          department: { name: "", objectId: "" }
        });
        setIsAlert({
          type: "success",
          msg: "Department created successfully."
        });
      }
    } catch (err) {
      console.log("err in save department", err);
      setIsAlert({ type: "danger", msg: "Something went wrong." });
    } finally {
      setTimeout(() => {
        setIsAlert({ type: "success", msg: "" });
      }, 1500);
      setIsLoader(false);
    }
  };

  // Define a function to handle the "add yourself" checkbox
  const handleReset = () => {
    setFormdata({
      name: "",
      department: { name: "", objectId: "" }
    });
  };
  const handleChange = (e) => {
    setFormdata((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="shadow-md rounded-box my-[1px] p-3 bg-[#ffffff]">
      <Title title={"Add Department"} />
      {isAlert.msg && (
        <Alert type={isAlert.type}>
          <div className="ml-3">{isAlert.msg}</div>
        </Alert>
      )}
      {isLoader && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-30 z-50 rounded-box">
          <Loader />
        </div>
      )}
      <div className="w-full mx-auto">
        <form onSubmit={handleSubmit}>
          {/* <h1 className="text-[20px] font-semibold mb-4">Add User</h1> */}
          <div className="mb-3">
            <label
              htmlFor="name"
              className="block text-xs text-gray-700 font-semibold"
            >
              Name
              <span className="text-[red] text-[13px]"> *</span>
            </label>
            <input
              type="text"
              name="name"
              value={formdata.name}
              onChange={(e) => handleChange(e)}
              required
              className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
            />
          </div>

          <div className="mb-3">
            <label
              htmlFor="phone"
              className="block text-xs text-gray-700 font-semibold"
            >
              Parent Team
            </label>
            <select
              value={formdata.department}
              onChange={(e) => handleDropdown(e)}
              name="department"
              className="op-select op-select-bordered op-select-sm focus:outline-none hover:border-base-content w-full text-xs"
            >
              <option defaultValue={""} value={""}>
                select
              </option>
              {departmentList.length > 0 &&
                departmentList.map((x) => (
                  <option key={x.objectId} value={x.objectId}>
                    {x.Name}
                  </option>
                ))}
            </select>
          </div>
          <div className="flex items-center mt-3 gap-2 text-white">
            <button type="submit" className="op-btn op-btn-primary">
              Submit
            </button>
            <div
              type="button"
              onClick={() => handleReset()}
              className="op-btn op-btn-secondary"
            >
              Reset
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDepartment;
