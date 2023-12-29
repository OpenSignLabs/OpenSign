import React, { useEffect } from "react";
import Parse from "parse";

const ValidateRoute = ({ children }) => {
  useEffect(() => {
    (async () => {
      try {
        // Use the session token to validate the user
        const userQuery = new Parse.Query(Parse.User);
        const user = await userQuery.get(Parse.User.current().id, {
          sessionToken: localStorage.getItem("accesstoken")
        });
        if (!user) {
          handlelogout();
        }
      } catch (error) {
        handlelogout();
      }
    })();
  }, []);
  const handlelogout = async () => {
    try {
      Parse.User.logOut();
      localStorage.removeItem("accesstoken");
    } catch (err) {
      console.log("err ", err);
    } finally {
      localStorage.removeItem("accesstoken");
    }
  };
  return <div>{children}</div>;
};

export default ValidateRoute;
