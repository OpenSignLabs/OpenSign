import { useState, useEffect } from "react";
import Parse from "parse";
import { Outlet } from "react-router";
import SessionExpiredModal from "./SessionExpiredModal";

const Validate = () => {
  const [isUserValid, setIsUserValid] = useState(true);
  useEffect(() => {
    (async () => {
      if (localStorage.getItem("accesstoken")) {
        try {
          const userDetails = JSON.parse(
            localStorage.getItem(
              `Parse/${localStorage.getItem("parseAppId")}/currentUser`
            )
          );
          // Use the session token to validate the user
          const userQuery = new Parse.Query(Parse.User);
          const user = await userQuery.get(userDetails?.objectId, {
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
      }
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return isUserValid ? <Outlet /> : <SessionExpiredModal />;
};

export default Validate;
