import React, { useState } from "react";
import Parse from "parse";
import { Navigate } from "react-router-dom";
import Title from "../components/Title";

function ChangePassword() {
  const [currentpassword, setCurrentPassword] = useState("");
  const [newpassword, setnewpassword] = useState("");
  const [confirmpassword, setconfirmpassword] = useState("");
  const handleSubmit = async (evt) => {
    evt.preventDefault();
    try {
      if (newpassword === confirmpassword) {
        Parse.User.logIn(localStorage.getItem("userEmail"), currentpassword)
          .then(async (user) => {
            if (user) {
              const User = new Parse.User();
              const query = new Parse.Query(User);
              await query.get(user.id).then((user) => {
                // Updates the data we want
                user.set("password", newpassword);
                user
                  .save()
                  .then(() => {
                    alert("Password updated successfully.");
                  })
                  .catch((error) => {
                    console.log("err", error);
                    alert("Something went wrong.");
                  });
              });
            } else {
              alert("Your current password is missing or incorrect.");
            }
            console.log("Logged in user", user);
          })
          .catch((error) => {
            alert("Your current password is missing or incorrect.");
            console.error("Error while logging in user", error);
          });
      } else {
        alert("Your password and confirmation password do not match.");
      }
    } catch (error) {
      console.log("err", error);
    }
  };
  if (localStorage.getItem("accesstoken") === null) {
    return <Navigate to="/" />;
  }
  return (
    <div className="w-full bg-white shadow rounded p-2">
      <Title title={"Change Password"} />
      <div className="text-xl font-bold border-b-[1px] border-gray-300">
        Change Password
      </div>
      <div className="m-2">
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="currentpassword" className="block text-xs ml-1">
              Current Password
            </label>
            <input
              type="password"
              name="currentpassword"
              value={currentpassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="px-3 py-2 mb-2 w-full border-[1px] border-gray-300 rounded focus:outline-none text-xs"
              placeholder="Current Password"
              required
            />
          </div>
          <div>
            <label htmlFor="newpassword" className="text-xs block ml-1">
              New Password
            </label>
            <input
              type="password"
              name="newpassword"
              value={newpassword}
              onChange={(e) => setnewpassword(e.target.value)}
              className="px-3 py-2 mb-2 w-full border-[1px] border-gray-300 rounded focus:outline-none text-xs"
              placeholder="New Password"
              required
            />
          </div>
          <div>
            <label htmlFor="newpassword" className="text-xs block ml-1">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmpassword"
              className="px-3 py-2 mb-2 w-full border-[1px] border-gray-300 rounded focus:outline-none text-xs"
              value={confirmpassword}
              onChange={(e) => setconfirmpassword(e.target.value)}
              placeholder="Confirm Password"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-[#188ae2] m-2 px-4 py-3 rounded-sm shadow-md text-white text-xs font-semibold uppercase"
          >
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;
