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
          Parse.User.logOut();
        }
      } catch (error) {
        // Session token is invalid or there was an error
        Parse.User.logOut();
      }
    })();
  }, []);
  return <div>{children}</div>;
};

export default ValidateRoute;
