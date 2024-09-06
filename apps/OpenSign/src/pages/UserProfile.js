import React, { useState, useEffect, useRef } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Parse from "parse";
import { SaveFileSize } from "../constant/saveFileSize";
import dp from "../assets/images/dp.png";
import Title from "../components/Title";
import sanitizeFileName from "../primitives/sanitizeFileName";
import axios from "axios";
import Tooltip from "../primitives/Tooltip";
import { isEnableSubscription, isStaging } from "../constant/const";
import {
  checkIsSubscribed,
  copytoData,
  handleSendOTP,
  openInNewTab
} from "../constant/Utils";
import Upgrade from "../primitives/Upgrade";
import ModalUi from "../primitives/ModalUi";
import Loader from "../primitives/Loader";
import { validplan } from "../json/plansArr";
import { useTranslation } from "react-i18next";
import SelectLanguage from "../components/pdf/SelectLanguage";
import { RWebShare } from "react-web-share";
import Alert from "../primitives/Alert";
import Tour from "reactour";
import TourContentWithBtn from "../primitives/TourContentWithBtn";

function UserProfile() {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
  const [isUpgrade, setIsUpgrade] = useState(false);
  const [isAlert, setIsAlert] = useState({ type: "success", message: "" });
  const [publicUserName, setPublicUserName] = useState(
    extendUser && extendUser?.[0]?.UserName
  );
  const previousPublicUserName = useRef(publicUserName);
  const [company, setCompany] = useState(
    extendUser && extendUser?.[0]?.Company
  );
  const [jobTitle, setJobTitle] = useState(
    extendUser && extendUser?.[0]?.JobTitle
  );
  const [isVerifyModal, setIsVerifyModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoader, setOtpLoader] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [tagLine, setTagLine] = useState(
    extendUser && extendUser?.[0]?.Tagline
  );
  const [isPlan, setIsPlan] = useState({ plan: "", isValid: false });
  const [tourStatus, setTourStatus] = useState([]);
  const [isProfileTour, setIsProfileTour] = useState(false);
  const [isDontShow, setIsDontShow] = useState(false);
  const getPublicUrl = isStaging
    ? `https://staging.opensign.me/${extendUser?.[0]?.UserName}`
    : `https://opensign.me/${extendUser?.[0]?.UserName}`;
  useEffect(() => {
    getUserDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const getUserDetail = async () => {
    setIsLoader(true);
    const extClass = localStorage.getItem("Extand_Class");
    const jsonSender = JSON.parse(extClass);
    const tourstatuss = jsonSender[0]?.TourStatus && jsonSender[0].TourStatus;
    if (!isEnableSubscription) {
      setIsProfileTour(true);
    } else if (tourstatuss && tourstatuss.length > 0) {
      setTourStatus(tourstatuss);
      const checkTourRecipients = tourstatuss.filter(
        (data) => data.profileTour
      );
      if (checkTourRecipients && checkTourRecipients.length > 0) {
        setIsProfileTour(checkTourRecipients[0]?.profileTour);
      }
    }
    const HeaderDocId = jsonSender[0]?.HeaderDocId;
    if (isEnableSubscription) {
      const subscribe = await checkIsSubscribed();
      setIsSubscribe(subscribe.isValid);
      setIsPlan(subscribe);
    }
    if (HeaderDocId) {
      setIsDisableDocId(HeaderDocId);
    }
    const currentUser = JSON.parse(JSON.stringify(Parse.User.current()));
    let isEmailVerified = currentUser?.emailVerified || false;
    if (isEmailVerified) {
      setIsEmailVerified(isEmailVerified);
      setIsLoader(false);
    } else {
      try {
        const userQuery = new Parse.Query(Parse.User);
        const user = await userQuery.get(currentUser.objectId, {
          sessionToken: localStorage.getItem("accesstoken")
        });
        if (user) {
          isEmailVerified = user?.get("emailVerified");
          setIsEmailVerified(isEmailVerified);
          setIsLoader(false);
        }
      } catch (e) {
        alert(t("something-went-wrong-mssg"));
      }
    }
  };
  //function to check public username already exist
  const handleCheckPublicUserName = async () => {
    try {
      const res = await Parse.Cloud.run("getpublicusername", {
        username: publicUserName
      });
      if (res) {
        setIsLoader(false);
        setIsAlert({ type: "danger", message: t("user-name-exist") });
        setTimeout(() => setIsAlert({}), 3000);
        return res;
      }
    } catch (e) {
      console.log("error in getpublicusername cloud function");
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    let phn = Phone,
      res = "";
    //condition to call cloud function when user change publicUserName
    if (publicUserName && previousPublicUserName.current !== publicUserName) {
      res = await handleCheckPublicUserName();
    }
    if (!res) {
      setIsLoader(true);
      try {
        const userQuery = Parse.Object.extend("_User");
        const query = new Parse.Query(userQuery);
        await query.get(UserProfile.objectId).then((object) => {
          object.set("name", name);
          object.set("ProfilePic", Image);
          object.set("phone", phn || "");
          object.save().then(
            async (response) => {
              if (response) {
                let res = response.toJSON();
                let rr = JSON.stringify(res);
                localStorage.setItem("UserInformation", rr);
                SetName(res.name);
                SetPhone(res?.phone || "");
                setImage(res.ProfilePic);
                localStorage.setItem("username", res.name);
                localStorage.setItem("profileImg", res.ProfilePic);
                await updateExtUser({
                  Name: res.name,
                  Phone: res?.phone || ""
                });
                alert(t("profile-update-alert"));
                setEditMode(false);
                setIsLoader(false);
                //navigate("/dashboard/35KBoSgoAK");
              }
            },
            (error) => {
              alert(t("something-went-wrong-mssg"));
              console.error("Error while updating tour", error);
              setIsLoader(false);
            }
          );
        });
      } catch (error) {
        console.log("err", error);
      }
    }
  };

  //  `updateExtUser` is used to update user details in extended class
  const updateExtUser = async (obj) => {
    try {
      const extData = JSON.parse(localStorage.getItem("Extand_Class"));
      const ExtUserId = extData[0].objectId;
      const body = {
        Phone: obj?.Phone || "",
        Name: obj.Name,
        HeaderDocId: isDisableDocId,
        JobTitle: jobTitle,
        Company: company,
        UserName: publicUserName || "",
        Tagline: tagLine || "",
        Language: obj?.language || ""
      };

      await axios.put(
        parseBaseUrl + "classes/contracts_Users/" + ExtUserId,
        body,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Parse-Application-Id": parseAppId,
            "X-Parse-Session-Token": localStorage.getItem("accesstoken")
          }
        }
      );
      const res = await Parse.Cloud.run("getUserDetails");

      const json = JSON.parse(JSON.stringify([res]));
      const extRes = JSON.stringify(json);
      localStorage.setItem("Extand_Class", extRes);
      previousPublicUserName.current = publicUserName;
    } catch (e) {
      console.log("error in save data in contracts_Users class");
    }
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
  //`handleVerifyBtn` function is used to send otp on user mail
  const handleVerifyBtn = async () => {
    setIsVerifyModal(true);
    await handleSendOTP(Parse.User.current().getEmail());
  };
  const handleCloseVerifyModal = async () => {
    setIsVerifyModal(false);
  };
  //`handleVerifyEmail` function is used to verify email with otp
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setOtpLoader(true);
    try {
      const resEmail = await Parse.Cloud.run("verifyemail", {
        otp: otp,
        email: Parse.User.current().getEmail()
      });
      if (resEmail?.message === "Email is verified.") {
        setIsEmailVerified(true);
        alert(t("Email-verified-alert-1"));
      } else if (resEmail?.message === "Email is already verified.") {
        setIsEmailVerified(true);
        alert(t("Email-verified-alert-2"));
      }
      setOtp("");
      setIsVerifyModal(false);
    } catch (error) {
      alert(error.message);
    } finally {
      setOtpLoader(false);
    }
  };
  //function to use resend otp for email verification
  const handleResend = async (e) => {
    e.preventDefault();
    setOtpLoader(true);
    await handleSendOTP();
    setOtpLoader(false);
    alert(t("otp-sent-alert"));
  };
  //function to handle onchange username and restrict 6-characters username for free users
  const handleOnchangeUserName = (e) => {
    const newValue = e.target.value.replace(/\s+/g, "");
    setPublicUserName(newValue);
  };

  const handleOnchangeTagLine = (e) => {
    setTagLine(e.target.value);
  };
  const handleCancel = () => {
    setEditMode(false);
    SetName(localStorage.getItem("username"));
    SetPhone(UserProfile && UserProfile.phone);
    setImage(localStorage.getItem("profileImg"));
    setPublicUserName(extendUser && extendUser?.[0]?.UserName);
    setCompany(extendUser && extendUser?.[0]?.Company);
    setJobTitle(extendUser?.[0]?.JobTitle);
    setIsDisableDocId(extendUser?.[0]?.HeaderDocId);
  };
  const handlePaidRoute = () => {
    navigate("/subscription");
  };

  const copytoclipboard = () => {
    copytoData(getPublicUrl);
    setIsAlert({ type: "success", message: t("copied") });
    setTimeout(() => setIsAlert({}), 3000);
  };

  const tourConfig = [
    {
      content: () => (
        <TourContentWithBtn
          message={t("tour-mssg.public-template")}
          isChecked={handleDontShow}
          video="https://www.youtube.com/embed/_wB4UA7Jz5Q?si=I40CI3nVUWQzf42Y"
        />
      ),
      position: "top",
      style: { fontSize: "13px" }
    }
  ];
  //function for update TourStatus
  const closeTour = async () => {
    try {
      setIsProfileTour(true);
      if (isDontShow) {
        let updatedTourStatus = [];
        if (tourStatus.length > 0) {
          updatedTourStatus = [...tourStatus];
          const profileIndex = tourStatus.findIndex(
            (obj) => obj["profileTour"] === false || obj["profileTour"] === true
          );
          if (profileIndex !== -1) {
            updatedTourStatus[profileIndex] = { profileTour: true };
          } else {
            updatedTourStatus.push({ profileTour: true });
          }
        } else {
          updatedTourStatus = [{ profileTour: true }];
        }

        await axios.put(
          `${localStorage.getItem("baseUrl")}classes/contracts_Users/${
            extendUser?.[0]?.objectId
          }`,
          {
            TourStatus: updatedTourStatus
          },
          {
            headers: {
              "Content-Type": "application/json",
              "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
              sessionToken: localStorage.getItem("accesstoken")
            }
          }
        );
        const res = await Parse.Cloud.run("getUserDetails");
        const json = JSON.parse(JSON.stringify([res]));
        const extRes = JSON.stringify(json);
        localStorage.setItem("Extand_Class", extRes);
      }
    } catch (err) {
      console.log("axois err ", err);
      alert(t("something-went-wrong-mssg"));
    }
  };
  const handleDontShow = (isChecked) => {
    setIsDontShow(isChecked);
  };
  const handleOnlickHelp = () => {
    setIsProfileTour(false);
  };
  return (
    <React.Fragment>
      <Title title={"Profile"} />
      {isLoader ? (
        <div className="h-[100vh] flex justify-center items-center">
          <Loader />
        </div>
      ) : (
        <div className="flex justify-center items-center w-full relative">
          {isAlert.message && (
            <Alert className="z-[1000] fixed top-[10%]" type={isAlert.type}>
              {isAlert.message}
            </Alert>
          )}
          <Tour
            className="md:!min-w-[650px]"
            onRequestClose={closeTour}
            steps={tourConfig}
            isOpen={!isProfileTour}
            rounded={5}
            closeWithMask={false}
          />
          <div className="bg-base-100 text-base-content flex flex-col justify-center shadow-md rounded-box w-[450px]">
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
                  className="op-file-input op-file-input-bordered op-file-input-sm max-w-[270px] mt-4 text-sm"
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
                  editmode ? "py-1.5" : "py-2"
                }`}
              >
                <span className="font-semibold">{t("name")}:</span>{" "}
                {editmode ? (
                  <input
                    type="text"
                    value={name}
                    className="op-input op-input-bordered op-input-sm w-[180px] focus:outline-none hover:border-base-content text-sm"
                    onChange={(e) => SetName(e.target.value)}
                  />
                ) : (
                  <span>{localStorage.getItem("username")}</span>
                )}
              </li>
              <li
                className={`flex justify-between items-center border-t-[1px] border-gray-300 break-all ${
                  editmode ? "py-1.5" : "py-2"
                }`}
              >
                <span className="font-semibold">{t("phone")}:</span>{" "}
                {editmode ? (
                  <input
                    type="text"
                    className="op-input op-input-bordered op-input-sm w-[180px] focus:outline-none hover:border-base-content text-sm"
                    onChange={(e) => SetPhone(e.target.value)}
                    value={Phone}
                  />
                ) : (
                  <span>{UserProfile && UserProfile.phone}</span>
                )}
              </li>
              <li className="flex justify-between items-center border-t-[1px] border-gray-300 py-2 break-all">
                <span className="font-semibold">{t("email")}:</span>{" "}
                <span>{UserProfile && UserProfile.email}</span>
              </li>
              <li
                className={`flex justify-between items-center border-t-[1px] border-gray-300 break-all ${
                  editmode ? "py-1.5" : "py-2"
                }`}
              >
                <span className="font-semibold">{t("company")}:</span>{" "}
                {editmode ? (
                  <input
                    type="text"
                    value={company}
                    className="op-input op-input-bordered op-input-sm w-[180px] focus:outline-none hover:border-base-content text-sm"
                    onChange={(e) => setCompany(e.target.value)}
                  />
                ) : (
                  <span>{extendUser?.[0].Company}</span>
                )}
              </li>
              <li
                className={`flex justify-between items-center border-t-[1px] border-gray-300 break-all ${
                  editmode ? "py-1.5" : "py-2"
                }`}
              >
                <span className="font-semibold">{t("job-title")}:</span>{" "}
                {editmode ? (
                  <input
                    type="text"
                    value={jobTitle}
                    className="op-input op-input-bordered op-input-sm w-[180px] focus:outline-none hover:border-base-content text-sm"
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                ) : (
                  <span>{extendUser?.[0]?.JobTitle}</span>
                )}
              </li>
              <li className="flex justify-between items-center border-t-[1px] border-gray-300 py-2 break-all">
                <span className="font-semibold">{t("is-email-verified")}:</span>{" "}
                <span>
                  {isEmailVerified ? (
                    "Verified"
                  ) : (
                    <span>
                      Not verified(
                      <span
                        onClick={() => handleVerifyBtn()}
                        className="hover:underline text-blue-600 cursor-pointer"
                      >
                        verify
                      </span>
                      )
                    </span>
                  )}
                </span>
              </li>
              {isEnableSubscription && (
                <>
                  <li className="flex flex-row justify-between md:items-center border-t-[1px] border-gray-300 py-2 break-all">
                    <span className="font-semibold flex gap-1">
                      {t("public-profile")} :{" "}
                      <Tooltip handleOnlickHelp={handleOnlickHelp} />
                    </span>
                    <div className="flex flex-row items-center gap-1">
                      {editmode || !extendUser?.[0]?.UserName ? (
                        <>
                          <input
                            maxLength={40}
                            onChange={handleOnchangeUserName}
                            value={publicUserName}
                            disabled={!editmode}
                            placeholder="enter user name"
                            className="op-input op-input-bordered op-input-sm w-[180px] focus:outline-none hover:border-base-content text-sm"
                          />
                        </>
                      ) : (
                        <div className="flex flex-row gap-1 items-center justify-between md:justify-start">
                          <span
                            rel="noreferrer"
                            target="_blank"
                            onClick={() => openInNewTab(getPublicUrl)}
                            className="cursor-pointer underline hover:text-blue-800 w-[110px] md:w-[150px] whitespace-nowrap overflow-hidden text-ellipsis"
                          >
                            {isStaging
                              ? `staging.opensign.me/${extendUser?.[0]?.UserName}`
                              : `opensign.me/${extendUser?.[0]?.UserName}`}
                          </span>
                          <div className="flex items-center gap-2">
                            <RWebShare
                              data={{ url: getPublicUrl, title: "Sign url" }}
                            >
                              <button className="op-btn op-btn-primary op-btn-outline op-btn-xs md:op-btn-sm ">
                                <i className="fa-light fa-share-from-square"></i>{" "}
                              </button>
                            </RWebShare>
                            <button
                              className="op-btn op-btn-primary op-btn-outline op-btn-xs md:op-btn-sm"
                              onClick={() => copytoclipboard()}
                            >
                              <i className="fa-light fa-link"></i>{" "}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </li>
                  <li className="flex flex-row justify-between items-center border-t-[1px] border-gray-300 py-2 break-all">
                    <span className="font-semibold flex gap-1">
                      {t("tagline")} :{" "}
                      <Tooltip handleOnlickHelp={handleOnlickHelp} />
                    </span>
                    <div className="flex flex-row md:items-center gap-1">
                      {editmode || !extendUser?.[0]?.Tagline ? (
                        <input
                          maxLength={40}
                          onChange={handleOnchangeTagLine}
                          value={tagLine}
                          disabled={!editmode}
                          placeholder="enter tagline"
                          className="op-input op-input-bordered op-input-sm w-[180px] focus:outline-none hover:border-base-content text-sm"
                        />
                      ) : (
                        <span>{extendUser?.[0]?.Tagline}</span>
                      )}
                    </div>
                  </li>
                </>
              )}
              {isEnableSubscription && (
                <li className="border-y-[1px] border-gray-300 break-all">
                  <div className="flex justify-between items-center py-2">
                    <span
                      className={
                        validplan[isPlan.plan]
                          ? "font-semibold"
                          : "font-semibold text-gray-300"
                      }
                    >
                      {t("disable-documentId")} :{" "}
                      <Tooltip
                        url={
                          "https://docs.opensignlabs.com/docs/help/Settings/disabledocumentid"
                        }
                      />
                      {!validplan[isPlan.plan] && isEnableSubscription && (
                        <Upgrade />
                      )}
                    </span>
                    <label
                      className={`${
                        validplan[isPlan.plan]
                          ? `${editmode ? "cursor-pointer" : ""}`
                          : "pointer-events-none opacity-50"
                      } relative block items-center mb-0`}
                    >
                      <input
                        disabled={
                          validplan[isPlan.plan] && editmode ? false : true
                        }
                        type="checkbox"
                        className="op-toggle transition-all checked:[--tglbg:#3368ff] checked:bg-white"
                        checked={isDisableDocId}
                        onChange={handleDisableDocId}
                      />
                    </label>
                  </div>
                </li>
              )}
              <li
                className={`flex justify-between items-center border-b-[1px] border-gray-300 break-all ${
                  editmode ? "py-1.5" : "py-2"
                }`}
              >
                <span className="font-semibold">{t("language")}:</span>{" "}
                <SelectLanguage
                  isProfile={true}
                  updateExtUser={updateExtUser}
                />
              </li>
            </ul>
            <div
              className={`${
                !isEnableSubscription ? "border-t-[1px] border-gray-300" : ""
              } flex justify-center gap-2 pt-2 pb-3 md:pt-3 md:pb-4`}
            >
              <button
                type="button"
                onClick={(e) => {
                  if (
                    editmode &&
                    !isSubscribe &&
                    publicUserName?.length > 0 &&
                    publicUserName?.length < 9
                  ) {
                    setIsUpgrade(true);
                  } else {
                    editmode ? handleSubmit(e) : setEditMode(true);
                  }
                }}
                className="op-btn op-btn-primary"
              >
                {editmode ? t("save") : t("edit")}
              </button>
              <button
                type="button"
                onClick={() =>
                  editmode ? handleCancel() : navigate("/changepassword")
                }
                className={`op-btn ${
                  editmode ? "op-btn-ghost" : "op-btn-secondary"
                }`}
              >
                {editmode ? t("cancel") : t("change-password")}
              </button>
            </div>
          </div>
          {isVerifyModal && (
            <ModalUi
              isOpen
              title={t("otp-verification")}
              handleClose={handleCloseVerifyModal}
            >
              {otpLoader ? (
                <div className="h-[150px] flex justify-center items-center">
                  <Loader />
                </div>
              ) : (
                <form onSubmit={(e) => handleVerifyEmail(e)}>
                  <div className="px-6 py-3 text-base-content">
                    <label className="mb-2">{t("enter-otp")}</label>
                    <input
                      onInvalid={(e) =>
                        e.target.setCustomValidity(t("input-required"))
                      }
                      onInput={(e) => e.target.setCustomValidity("")}
                      required
                      type="tel"
                      pattern="[0-9]{4}"
                      className="w-full op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content text-xs"
                      placeholder={t("otp-placeholder")}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                  </div>
                  <div className="px-6 mb-3">
                    <button type="submit" className="op-btn op-btn-primary">
                      {t("verify")}
                    </button>
                    <button
                      className="op-btn op-btn-secondary ml-2"
                      onClick={(e) => handleResend(e)}
                    >
                      {t("resend")}
                    </button>
                  </div>
                </form>
              )}
            </ModalUi>
          )}

          {isUpgrade && (
            <div className="op-modal op-modal-open">
              <div className="max-h-90 bg-base-100 w-[95%] md:max-w-[500px] rounded-box relative">
                <>
                  <div
                    className="op-btn op-btn-sm op-btn-circle op-btn-ghost text-primary-content absolute right-2 top-2 z-40"
                    onClick={() => setIsUpgrade(false)}
                  >
                    ✕
                  </div>

                  <div className="op-card op-bg-primary text-primary-content w-full shadow-lg">
                    <div className="op-card-body">
                      <h2 className="op-card-title">
                        {t("upgrade-to")} {t("plan")}
                      </h2>
                      <p>{t("user-name-limit-char")}</p>
                      <div className="op-card-actions justify-end">
                        <button
                          onClick={() => handlePaidRoute()}
                          className="op-btn op-btn-accent"
                        >
                          {t("upgrade-now")}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              </div>
            </div>
          )}
        </div>
      )}
    </React.Fragment>
  );
}

export default UserProfile;
