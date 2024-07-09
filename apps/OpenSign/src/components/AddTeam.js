import React, { useEffect, useState } from "react";
import Parse from "parse";
import Title from "./Title";
import Loader from "../primitives/Loader";

const AddTeam = (props) => {
  const [formdata, setFormdata] = useState({
    name: "",
    team: ""
  });
  const [isLoader, setIsLoader] = useState(false);
  const [teamList, setTeamList] = useState([]);
  useEffect(() => {
    getTeamList();
  }, []);

  const getTeamList = async () => {
    setIsLoader(true);
    try {
      const extUser = JSON.parse(localStorage.getItem("Extand_Class"))?.[0];
      const teamCls = new Parse.Query("contracts_Teams");
      teamCls.equalTo("OrganizationId", {
        __type: "Pointer",
        className: "contracts_Organizations",
        objectId: extUser.OrganizationId.objectId
      });
      teamCls.equalTo("IsActive", true);
      const teamRes = await teamCls.find();
      if (teamRes.length > 0) {
        const _teamRes = JSON.parse(JSON.stringify(teamRes));
        const allUsersteam = _teamRes.find((x) => x.Name === "All Users");
        if (allUsersteam) {
          setFormdata({ team: allUsersteam.objectId });
        }
        setTeamList(_teamRes);
      }
    } catch (err) {
      console.log("Err in fetch top level teamList", err);
    } finally {
      setIsLoader(false);
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
    if (formdata.team) {
      const Ancestors = teamList.find(
        (x) => x.objectId === formdata.team
      )?.Ancestors;
      if (Ancestors && Ancestors.length > 0) {
        updatedAncestors = Ancestors.map((x) => ({
          __type: "Pointer",
          className: "contracts_Teams",
          objectId: x.objectId
        }));
      } else {
        const AllUser = teamList.find((x) => x.objectId === "All Users");
        updatedAncestors = [
          AllUser,
          {
            __type: "Pointer",
            className: "contracts_Teams",
            objectId: formdata.team
          }
        ];
      }
    }
    try {
      const localUser = JSON.parse(localStorage.getItem("Extand_Class"))?.[0];
      setIsLoader(true);
      const team = new Parse.Query("contracts_Teams");
      team.equalTo("Name", formdata.name);
      if (updatedAncestors.length > 0) {
        const ParentId = updatedAncestors[updatedAncestors.length - 1];
        team.equalTo("ParentId", ParentId);
      }
      if (localUser && localUser.OrganizationId) {
        team.equalTo("OrganizationId", {
          __type: "Pointer",
          className: "contracts_Organizations",
          objectId: localUser.OrganizationId.objectId
        });
      }
      const isTeam = await team.first();
      if (isTeam) {
        props.setIsAlert({ type: "info", msg: "Teams already exists." });
        setIsLoader(false);
      } else {
        const newTeam = new Parse.Object("contracts_Teams");
        newTeam.set("Name", formdata.name);
        if (updatedAncestors.length > 0) {
          const ParentId = updatedAncestors[updatedAncestors.length - 1];
          newTeam.set("ParentId", ParentId);
          newTeam.set("Ancestors", updatedAncestors);
        }
        if (localUser && localUser.OrganizationId) {
          newTeam.set("OrganizationId", {
            __type: "Pointer",
            className: "contracts_Organizations",
            objectId: localUser.OrganizationId.objectId
          });
        }
        newTeam.set("IsActive", true);
        const newTeamRes = await newTeam.save();
        if (updatedAncestors.length > 0) {
          const ParentId = teamList.find((x) => x.objectId === formdata.team);
          props.handleTeamInfo({
            objectId: newTeamRes.id,
            Name: formdata.name,
            ParentId: ParentId,
            Ancestors: updatedAncestors,
            IsActive: true
          });
        } else {
          props.handleTeamInfo({
            objectId: newTeamRes.id,
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
          team: { name: "", objectId: "" }
        });
        props.setIsAlert({
          type: "success",
          msg: "Team created successfully."
        });
      }
    } catch (err) {
      console.log("err in save team", err);
      props.setIsAlert({ type: "danger", msg: "Something went wrong." });
    } finally {
      setTimeout(() => props.setIsAlert({ type: "success", msg: "" }), 1500);
      setIsLoader(false);
    }
  };

  // Define a function to handle the "add yourself" checkbox
  const handleReset = () => {
    setFormdata({
      name: "",
      team: { name: "", objectId: "" }
    });
  };
  const handleChange = (e) => {
    setFormdata((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="shadow-md rounded-box my-[1px] p-3 bg-[#ffffff]">
      <Title title="Add Team" />
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
              value={formdata.team}
              onChange={(e) => handleDropdown(e)}
              name="team"
              className="op-select op-select-bordered op-select-sm focus:outline-none hover:border-base-content w-full text-xs"
            >
              {teamList.length > 0 &&
                teamList.map((x) => (
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

export default AddTeam;
