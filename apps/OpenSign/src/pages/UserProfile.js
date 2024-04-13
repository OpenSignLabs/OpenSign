import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Parse from "parse";
import { SaveFileSize } from "../constant/saveFileSize";
import dp from "../assets/images/dp.png";
import Title from "../components/Title";
import sanitizeFileName from "../primitives/sanitizeFileName";
import axios from "axios";
import PremiumAlertHeader from "../primitives/PremiumAlertHeader";
import Tooltip from "../primitives/Tooltip";
import { isEnableSubscription } from "../constant/const";
import { checkIsSubscribed } from "../constant/Utils";
import Upgrade from "../primitives/Upgrade";

function UserProfile() {
  const navigate = useNavigate();
  let UserProfile = JSON.parse(localStorage.getItem("UserInformation"));
  let extendUser = JSON.parse(localStorage.getItem("Extand_Class"));
  const [parseBaseUrl] = useState(localStorage.getItem("baseUrl"));
  const [parseAppId] = useState(localStorage.getItem("parseAppId"));
  const [editmode, setEditMode] = useState(false);
  const [name, SetName] = useState(localStorage.getItem("username"));
  const [Phone, SetPhone] = useState(UserProfile && UserProfile.phone);
  const [Image, setImage] = useState(localStorage.getItem("profileImg"));
  const [isLoader, setIsLoader] = useState(false);
  const [percentage, setpercentage] = useState(0);
  const [isDisableDocId, setIsDisableDocId] = useState(false);
  const [isSubscribe, setIsSubscribe] = useState(false);
  const [company, setCompany] = useState(
    extendUser && extendUser?.[0]?.Company
  );
  const [jobTitle, setJobTitle] = useState(
    extendUser && extendUser?.[0]?.JobTitle
  );

  useEffect(() => {
    getUserDetail();
  }, []);

  const getUserDetail = async () => {
    const extClass = localStorage.getItem("Extand_Class");
    const jsonSender = JSON.parse(extClass);
    const HeaderDocId = jsonSender[0]?.HeaderDocId;
    if (isEnableSubscription) {
      const getIsSubscribe = await checkIsSubscribed();
      setIsSubscribe(getIsSubscribe);
    }
    if (HeaderDocId) {
      setIsDisableDocId(HeaderDocId);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoader(true);
    let phn = Phone;

    try {
      const tour = Parse.Object.extend("_User");
      const query = new Parse.Query(tour);

      await query.get(UserProfile.objectId).then((object) => {
        object.set("name", name);
        object.set("ProfilePic", Image);
        object.set("phone", phn);

        object.save().then(
          async (response) => {
            if (response) {
              let res = response.toJSON();
              let rr = JSON.stringify(res);
              localStorage.setItem("UserInformation", rr);
              SetName(res.name);
              SetPhone(res.phone);
              setImage(res.ProfilePic);
              localStorage.setItem("username", res.name);
              localStorage.setItem("profileImg", res.ProfilePic);
              await updateExtUser({ Name: res.name, Phone: res.phone });
              alert("Profile updated successfully.");
              setEditMode(false);
              navigate("/dashboard/35KBoSgoAK");
            }
          },
          (error) => {
            alert("Something went wrong.");
            console.error("Error while updating tour", error);
            setIsLoader(false);
          }
        );
      });
    } catch (error) {
      console.log("err", error);
    }
  };

  //  `updateExtUser` is used to update user details in extended class
  const updateExtUser = async (obj) => {
    const extClass = localStorage.getItem("extended_class");
    const extData = JSON.parse(localStorage.getItem("Extand_Class"));
    const ExtUserId = extData[0].objectId;

    const body = {
      Phone: obj.Phone,
      Name: obj.Name,
      HeaderDocId: isDisableDocId,
      JobTitle: jobTitle,
      Company: company
    };
    await axios.put(
      parseBaseUrl + "classes/" + extClass + "/" + ExtUserId,
      body,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Parse-Application-Id": parseAppId,
          "X-Parse-Session-Token": localStorage.getItem("accesstoken")
        }
      }
    );
    const res = await Parse.Cloud.run("getUserDetails", {
      email: extData[0].Email
    });

    const json = JSON.parse(JSON.stringify([res]));
    const extRes = JSON.stringify(json);

    localStorage.setItem("Extand_Class", extRes);
    // console.log("updateRes ", updateRes);
  };
  // file upload function
  const fileUpload = async (file) => {
    if (file) {
      await handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file) => {
    const size = file.size;
    const pdfFile = file;
    const fileName = file.name;
    const name = sanitizeFileName(fileName);
    const parseFile = new Parse.File(name, pdfFile);

    try {
      const response = await parseFile.save({
        progress: (progressValue, loaded, total, { type }) => {
          if (type === "upload" && progressValue !== null) {
            const percentCompleted = Math.round((loaded * 100) / total);
            // console.log("percentCompleted ", percentCompleted);
            setpercentage(percentCompleted);
          }
        }
      });
      // // The response object will contain information about the uploaded file
      // console.log("File uploaded:", response);

      // You can access the URL of the uploaded file using response.url()
      // console.log("File URL:", response.url());
      if (response.url()) {
        setImage(response.url());
        setpercentage(0);
        const tenantId = localStorage.getItem("TenantId");
        SaveFileSize(size, response.url(), tenantId);
        return response.url();
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };
  if (
    localStorage.getItem("accesstoken") === null &&
    localStorage.getItem("pageType") === null
  ) {
    let _redirect = `/`;
    return <Navigate to={_redirect} />;
  }

  const handleDisableDocId = () => {
    setIsDisableDocId((prevChecked) => !prevChecked);
  };
  return (
    <React.Fragment>
      <Title title={"Profile"} />
      {isLoader ? (
        <div
          style={{
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div
            style={{
              fontSize: "45px",
              color: "#3dd3e0"
            }}
            className="loader-37"
          ></div>
        </div>
      ) : (
        <div className="flex justify-center items-center w-full">
          <div className="bg-white flex flex-col justify-center shadow rounded w-[450px]">
            <div className="flex flex-col justify-center items-center my-4">
              <div className="w-[200px] h-[200px] overflow-hidden rounded-full">
                <img
                  className="object-contain w-full h-full"
                  src={Image === "" ? dp : Image}
                  alt="dp"
                />
              </div>
              {editmode && (
                <input
                  type="file"
                  className="max-w-[270px] text-sm py-1 px-2 mt-4 border-[1px] border-[#15b4e9] text-black rounded"
                  accept="image/png, image/gif, image/jpeg"
                  onChange={(e) => {
                    let files = e.target.files;
                    fileUpload(files[0]);
                  }}
                />
              )}
              {percentage !== 0 && (
                <div className="flex items-center gap-x-2">
                  <div className="h-2 rounded-full w-[200px] md:w-[400px] bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-black text-sm">{percentage}%</span>
                </div>
              )}
              <div className="text-base font-semibold pt-4">
                {localStorage.getItem("_user_role")}
              </div>
            </div>
            <ul className="w-full flex flex-col p-2 text-sm">
              <li
                className={`flex justify-between items-center border-t-[1px] border-gray-300 break-all ${
                  editmode ? "py-1" : "py-2"
                }`}
              >
                <span className="font-semibold">Name:</span>{" "}
                {editmode ? (
                  <input
                    type="text"
                    value={name}
                    className="py-1 px-2 text-sm border-[1px] border-[#15b4e9] text-black rounded"
                    onChange={(e) => SetName(e.target.value)}
                  />
                ) : (
                  <span>{localStorage.getItem("username")}</span>
                )}
              </li>
              <li
                className={`flex justify-between items-center border-t-[1px] border-gray-300 break-all ${
                  editmode ? "py-1" : "py-2"
                }`}
              >
                <span className="font-semibold">Phone:</span>{" "}
                {editmode ? (
                  <input
                    type="text"
                    className="py-1 px-2 text-sm border-[1px] border-[#15b4e9] text-black rounded"
                    onChange={(e) => SetPhone(e.target.value)}
                    value={Phone}
                  />
                ) : (
                  <span>{UserProfile && UserProfile.phone}</span>
                )}
              </li>
              <li className="flex justify-between items-center border-t-[1px] border-gray-300 py-2 break-all">
                <span className="font-semibold">Email:</span>{" "}
                <span>{UserProfile && UserProfile.email}</span>
              </li>
              <li
                className={`flex justify-between items-center border-t-[1px] border-gray-300 break-all ${
                  editmode ? "py-1" : "py-2"
                }`}
              >
                <span className="font-semibold">Company:</span>{" "}
                {editmode ? (
                  <input
                    type="text"
                    value={company}
                    className="py-1 px-2 text-sm border-[1px] border-[#15b4e9] text-black rounded"
                    onChange={(e) => setCompany(e.target.value)}
                  />
                ) : (
                  <span>{extendUser?.[0].Company}</span>
                )}
              </li>
              <li
                className={`flex justify-between items-center border-t-[1px] border-gray-300 break-all ${
                  editmode ? "py-1" : "py-2"
                }`}
              >
                <span className="font-semibold">Job title:</span>{" "}
                {editmode ? (
                  <input
                    type="text"
                    value={jobTitle}
                    className="py-1 px-2 text-sm border-[1px] border-[#15b4e9] text-black rounded"
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                ) : (
                  <span>{extendUser?.[0]?.JobTitle}</span>
                )}
              </li>
              <li className="flex justify-between items-center border-t-[1px] border-gray-300 py-2 break-all">
                <span className="font-semibold">Is Email verified:</span>{" "}
                <span>
                  {UserProfile && UserProfile.emailVerified
                    ? "Verified"
                    : "Not verified"}
                </span>
              </li>
              <li className="border-y-[1px] border-gray-300 break-all">
                <div className="flex justify-between items-center py-2">
                  <span
                    className={
                      isSubscribe || !isEnableSubscription
                        ? "font-semibold"
                        : "font-semibold text-gray-300"
                    }
                  >
                    Disable DocumentId :{" "}
                    <Tooltip
                      url={
                        "https://docs.opensignlabs.com/docs/help/Settings/disabledocumentid"
                      }
                      isSubscribe={isSubscribe}
                    />{" "}
                    {!isSubscribe && isEnableSubscription && <Upgrade />}
                  </span>{" "}
                  <label
                    className={
                      isSubscribe || !isEnableSubscription
                        ? `${
                            editmode ? "cursor-pointer" : ""
                          } relative inline-flex items-center mb-0`
                        : "relative inline-flex items-center mb-0 pointer-events-none opacity-50"
                    }
                  >
                    <input
                      disabled={editmode ? false : true}
                      checked={isDisableDocId}
                      onChange={handleDisableDocId}
                      type="checkbox"
                      value=""
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-1 peer-focus:ring-black rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-black peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                {!isEnableSubscription && (
                  <PremiumAlertHeader
                    message={
                      "Disable documentId is free in beta, this feature will incur a fee later."
                    }
                  />
                )}
              </li>
            </ul>
            <div className="flex justify-center pt-2 pb-3 md:pt-3 md:pb-4">
              {editmode ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="rounded shadow focus:outline-none border-[2px] border-[#15b4e9] bg-white text-[#15b4e9] px-4 py-2 mr-4"
                >
                  Save
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setEditMode(true);
                  }}
                  className="rounded shadow focus:outline-none text-white bg-[#e7505a] px-4 py-2 mr-4"
                >
                  Edit
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (editmode) {
                    setEditMode(false);
                  } else {
                    navigate("/changepassword");
                  }
                }}
                className={`rounded shadow focus:outline-none text-white bg-[#3598dc]  ${
                  editmode ? "px-4 py-2 " : "p-2"
                }`}
              >
                {editmode ? "Cancel" : "Change Password"}
              </button>
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
}

export default UserProfile;
