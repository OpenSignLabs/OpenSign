import React, { useState, useEffect } from "react";
import Parse from "parse";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import ModalUi from "./ModalUi";
const Validate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isUserValid, setIsUserValid] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        // Use the session token to validate the user
        const userQuery = new Parse.Query(Parse.User);
        const user = await userQuery.get(Parse.User.current().id, {
          sessionToken: localStorage.getItem("accesstoken")
        });
        if (user) {
          setIsUserValid(true);
        } else {
          setIsUserValid(false);
        }
      } catch (error) {
        // Session token is invalid or there was an error
        setIsUserValid(false);
      }
    })();
  }, []);
  const handleLoginBtn = () => {
    try {
      Parse.User.logOut();
    } catch (err) {
      console.log("err ", err);
    } finally {
      localStorage.removeItem("accesstoken");
      navigate("/", { replace: true, state: { from: location } });
    }
  };
  return isUserValid ? (
    <div>
      <Outlet />
    </div>
  ) : (
    <ModalUi title={"Session Expired"} isOpen={true} showClose={false}>
      <div className="flex flex-col justify-center items-center py-4 md:py-5 gap-5">
        <p className="text-xl font-normal">Your session has expired.</p>
        <button
          onClick={handleLoginBtn}
          className="text-base px-3 py-1.5 rounded shadow-md text-white bg-[#1ab6ce]"
        >
          Login
        </button>
      </div>
    </ModalUi>
  );
};

export default Validate;
