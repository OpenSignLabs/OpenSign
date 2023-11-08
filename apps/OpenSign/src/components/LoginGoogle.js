import React, { useState, useRef } from "react";
import Parse from "parse";
import jwtDecode from "jwt-decode";
import { useScript } from "../hook/useScript";

/*
 * `GoogleSignInBtn`as it's name indicates it render google sign in button
 * and in this `useScript` in which we have created for generate google sign button
 * and when user click on sign in with google it will be verify on server side
 * and then generate token
 */
const GoogleSignInBtn = ({
  GoogleCred,
  thirdpartyLoginfn,
  thirdpartyLoader,
  setThirdpartyLoader
}) => {
  const [isModal, setIsModal] = useState(false);
  const googleBtn = useRef();
  const [userDetails, setUserDetails] = useState({
    Phone: "",
    Company: "",
    Name: "",
    Email: "",
    Destination: ""
  });
  const [googleDetails, setGoogleDetails] = useState({
    Id: "",
    TokenId: "",
    Gmail: "",
    Name: ""
  });
  useScript("https://accounts.google.com/gsi/client", () => {
    window.google.accounts.id.initialize({
      client_id: GoogleCred,
      callback: responseGoogle,
      auto_select: false
    });
    window.google.accounts.id.renderButton(googleBtn.current, {
      theme: "outline",
      size: "large",
      width: "187px"
    });
  });
  const responseGoogle = async (response) => {
    setThirdpartyLoader(true);
    // console.log("response ", response);
    if (response.credential) {
      const data = jwtDecode(response.credential);
      // console.log("data ", data);
      if (data.sub && data.email) {
        const details = {
          Email: data.email,
          Name: data.name
        };
        setUserDetails({ ...userDetails, ...details });
        const Gdetails = {
          Id: data.sub,
          TokenId: response.credential,
          Gmail: data.email,
          Name: data.name
        };
        setGoogleDetails({ ...googleDetails, ...Gdetails });
        await checkExtUser(Gdetails);
      }
    }
  };
  const checkExtUser = async (details) => {
    const extUser = new Parse.Query("contracts_Users");
    extUser.equalTo("Email", details.Gmail);
    const extRes = await extUser.first();
    // console.log("extRes ", extRes);
    if (extRes) {
      const params = { ...details, Phone: extRes.get("Phone") };
      const payload = await Parse.Cloud.run("googlesign", params);
      // console.log("payload ", payload);
      if (payload && payload.sessiontoken) {
        // setThirdpartyLoader(true);
        const billingDate =
          extRes.get("Next_billing_date") && extRes.get("Next_billing_date");
        // console.log("billingDate expired", billingDate > new Date());
        const LocalUserDetails = {
          name: details.Name,
          email: details.Gmail,
          phone: extRes.get("Phone"),
          company: extRes.get("Company")
        };
        localStorage.setItem("userDetails", JSON.stringify(LocalUserDetails));
        thirdpartyLoginfn(payload.sessiontoken, billingDate);
      }
      return { msg: "exist" };
    } else {
      setIsModal(true);
      setThirdpartyLoader(false);
      return { msg: "notexist" };
    }
  };
  const handleSubmitbtn = async () => {
    if (userDetails.Phone && userDetails.Company) {
      setThirdpartyLoader(true);
      // e.preventDefault()
      // console.log("handelSubmit", userDetails);
      const params = { ...googleDetails, Phone: userDetails.Phone };
      const payload = await Parse.Cloud.run("googlesign", params);

      // console.log("payload ", payload);
      if (payload && payload.sessiontoken) {
        const params = {
          userDetails: {
            name: userDetails.Name,
            email: userDetails.Email,
            // "passsword":userDetails.Phone,
            phone: userDetails.Phone,
            role: "contracts_Admin",
            company: userDetails.Company,
            jobTitle: userDetails.Destination
          }
        };
        const userSignUp = await Parse.Cloud.run("usersignup", params);
        // console.log("userSignUp ", userSignUp);
        if (userSignUp && userSignUp.sessionToken) {
          const LocalUserDetails = {
            name: userDetails.Name,
            email: userDetails.Email,
            phone: userDetails.Phone,
            company: userDetails.Company
            // jobTitle: userDetails.JobTitle
          };
          localStorage.setItem("userDetails", JSON.stringify(LocalUserDetails));
          thirdpartyLoginfn(userSignUp.sessionToken);
        } else {
          alert(userSignUp.message);
        }
      } else if (
        payload &&
        payload.message.replace(/ /g, "_") === "Internal_server_err"
      ) {
        alert("Internal server error !");
      }
    } else {
      alert("Please fill required details!");
    }
  };
  const handleCloseModal = () => {
    setIsModal(false);
    Parse.User.logOut();

    let appdata = localStorage.getItem("userSettings");
    let applogo = localStorage.getItem("appLogo");
    let appName = localStorage.getItem("appName");
    let defaultmenuid = localStorage.getItem("defaultmenuid");
    let PageLanding = localStorage.getItem("PageLanding");
    let domain = localStorage.getItem("domain");
    let _appName = localStorage.getItem("_appName");
    let baseUrl = localStorage.getItem("BaseUrl12");
    let appid = localStorage.getItem("AppID12");

    localStorage.clear();

    localStorage.setItem("appLogo", applogo);
    localStorage.setItem("appName", appName);
    localStorage.setItem("_appName", _appName);
    localStorage.setItem("defaultmenuid", defaultmenuid);
    localStorage.setItem("PageLanding", PageLanding);
    localStorage.setItem("domain", domain);
    localStorage.setItem("userSettings", appdata);
    localStorage.setItem("BaseUrl12", baseUrl);
    localStorage.setItem("AppID12", appid);
  };
  return (
    <div style={{ position: "relative" }}>
      {thirdpartyLoader && (
        <div
          style={{
            position: "fixed",
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.2)",
            top: 0,
            left: 0,
            zIndex: 2
          }}
        >
          <div
            style={{
              position: "fixed",
              fontSize: "50px",
              color: "#3ac9d6",
              top: "50%",
              left: "45%"
            }}
            className="loader-37"
          ></div>
        </div>
      )}
      <div ref={googleBtn} className="text-sm"></div>

      {isModal && (
        <div
          className="modal fade show"
          id="exampleModal"
          tabIndex="-1"
          role="dialog"
          style={{ display: "block", zIndex: 1 }}
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Sign up form</h5>
                <span>
                  <span></span>
                </span>
              </div>
              <div className="modal-body">
                <form>
                  <div className="form-group">
                    <label
                      htmlFor="Phone"
                      style={{ display: "flex" }}
                      className="col-form-label"
                    >
                      Phone{" "}
                      <span style={{ fontSize: 13, color: "red" }}>*</span>
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      id="Phone"
                      value={userDetails.Phone}
                      onChange={(e) =>
                        setUserDetails({
                          ...userDetails,
                          Phone: e.target.value
                        })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label
                      htmlFor="Company"
                      style={{ display: "flex" }}
                      className="col-form-label"
                    >
                      Company{" "}
                      <span style={{ fontSize: 13, color: "red" }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="Company"
                      value={userDetails.Company}
                      onChange={(e) =>
                        setUserDetails({
                          ...userDetails,
                          Company: e.target.value
                        })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label
                      htmlFor="Destination"
                      style={{ display: "flex" }}
                      className="col-form-label"
                    >
                      Destination{" "}
                      <span style={{ fontSize: 13, color: "red" }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="Destination"
                      value={userDetails.Destination}
                      onChange={(e) =>
                        setUserDetails({
                          ...userDetails,
                          Destination: e.target.value
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      className="bg-[#6c757d] p-2 text-white rounded"
                      onClick={handleCloseModal}
                      style={{ marginRight: 10, width: 90 }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="bg-[#17a2b8] p-2 text-white rounded"
                      onClick={() => handleSubmitbtn()}
                    >
                      Sign up
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleSignInBtn;
