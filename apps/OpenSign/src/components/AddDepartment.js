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
  const [parentDepartments, setParentDepartments] = useState([]);
  const [level, setLevel] = useState(1);
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
      department.doesNotExist("ParentId");
      department.doesNotExist("Ancestors");
      const departmentRes = await department.find();
      if (departmentRes.length > 0) {
        const _departmentRes = JSON.parse(JSON.stringify(departmentRes));
        // console.log("_departmentRes ", _departmentRes);
        setDepartmentList(_departmentRes);
      }
    } catch (err) {
      console.log("Err in fetch top level departmentlist", err);
    }
  };

  const fetchDepartmentsbyPtr = async (departmentPtr) => {
    setLevel((prev) => prev + 1);
    try {
      const extUser = JSON.parse(localStorage.getItem("Extand_Class"))?.[0];
      const department = new Parse.Query("contracts_Departments");
      department.equalTo("ParentId", departmentPtr);
      department.equalTo("OrganizationId", {
        __type: "Pointer",
        className: "contracts_Organizations",
        objectId: extUser.OrganizationId.objectId
      });

      const departmentRes = await department.find();
      if (departmentRes.length > 0) {
        const _departmentRes = JSON.parse(JSON.stringify(departmentRes));
        // console.log("sub", ["DD_" + level] ,_departmentRes)
        const departmentName = _departmentRes?.[0]?.ParentId?.Name;
        setParentDepartments((prev) => [
          ...prev,
          {
            ["DD_" + level]: { name: departmentName, opt: _departmentRes }
          }
        ]);
      }
    } catch (err) {
      console.log("Err in fetch departmentlist", err);
    }
  };
  const handleDropdown = (e) => {
    setFormdata((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    const departmentPtr = {
      __type: "Pointer",
      className: "contracts_Departments",
      objectId: e.target.value
    };
    // const index = parentDepartments.findIndex((x) => x[e.target.name]);
    // setParentDepartments((prev) => prev.slice(0, index +1));
    // console.log("index ", index);
    fetchDepartmentsbyPtr(departmentPtr);
  };
  console.log("formdata", formdata);
  // Define a function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Extracting values except for the 'name' key
    const ancestors = Object.entries(formdata)
      .filter(([key]) => key !== "name")
      .map(([key, value]) => value);

    try {
      const localUser = JSON.parse(localStorage.getItem("Extand_Class"))?.[0];
      const ParentId = {
        __type: "Pointer",
        className: "contracts_Departments",
        objectId: ""
      };
      setIsLoader(true);
      const department = new Parse.Query("contracts_Departments");
      department.equalTo("Name", formdata.name);
      if (ancestors.length > 0) {
        ParentId.objectId = "";
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
        if (ancestors.length > 0) {
          newDepartment.set("ParentId", ParentId);
        }
        if (localUser && localUser.OrganizationId) {
          newDepartment.set("OrganizationId", {
            __type: "Pointer",
            className: "contracts_Organizations",
            objectId: localUser.OrganizationId.objectId
          });
        }
        const newdepartmentRes = await newDepartment.save();
        if (ancestors.length > 0) {
          newDepartment.set("ParentId", ParentId);
          props.handleDepartmentInfo({
            objectId: newdepartmentRes.id,
            Name: formdata.name,
            ParentId: ParentId,
            Ancestors: ancestors,
            IsActive: true
          });
        } else {
          props.handleDepartmentInfo({
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
              Department
              {/* <span className="text-[red] text-[13px]"> *</span> */}
            </label>
            <select
              value={formdata.department}
              onChange={(e) => handleDropdown(e)}
              name="department"
              className="op-select op-select-bordered op-select-sm focus:outline-none hover:border-base-content w-full text-xs"
            >
              <option>select</option>
              {departmentList.length > 0 &&
                departmentList.map((x) => (
                  <option key={x.objectId} value={x.objectId}>
                    {x.Name}
                  </option>
                ))}
            </select>
          </div>
          {parentDepartments?.map((x, i) => (
            <div className="mb-3" key={"DD_" + (i + 1)}>
              <label
                htmlFor="phone"
                className="block text-xs text-gray-700 font-semibold"
              >
                {x["DD_" + (i + 1)]?.name} department
                {/* <span className="text-[red] text-[13px]"> *</span> */}
              </label>
              <select
                value={formdata["DD_" + (i + 1)]}
                onChange={(e) => handleDropdown(e)}
                name={"DD_" + (i + 1)}
                className="op-select op-select-bordered op-select-sm focus:outline-none hover:border-base-content w-full text-xs"
              >
                <option>select</option>
                {x["DD_" + (i + 1)]?.opt?.map((subdepartment) => (
                  <option
                    key={subdepartment.objectId}
                    value={subdepartment.objectId}
                  >
                    {subdepartment.Name}
                  </option>
                ))}
              </select>
            </div>
          ))}
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
