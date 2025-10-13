import React, {
  useState,
  useEffect,
} from "react";
import { Navigate, useNavigate } from "react-router";
import Parse from "parse";
import { SaveFileSize } from "../constant/saveFileSize";
import dp from "../assets/images/dp.png";
import { sanitizeFileName } from "../utils";
import axios from "axios";
import Tooltip from "../primitives/Tooltip";
import {
  getSecureUrl,
  handleSendOTP,
} from "../constant/Utils";
import ModalUi from "../primitives/ModalUi";
import Loader from "../primitives/Loader";
import { useTranslation } from "react-i18next";
import SelectLanguage from "../components/pdf/SelectLanguage";

function UserProfile() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  let UserProfile =
    localStorage.getItem("UserInformation") &&
    JSON.parse(localStorage.getItem("UserInformation"));
  let extendUser =
    localStorage.getItem("Extand_Class") &&
    JSON.parse(localStorage.getItem("Extand_Class"));
  const [parseBaseUrl] = useState(localStorage.getItem("baseUrl"));
  const [parseAppId] = useState(localStorage.getItem("parseAppId"));
  const [editmode, setEditMode] = useState(false);
  const [name, SetName] = useState(localStorage.getItem("username"));
  const [Phone, SetPhone] = useState(UserProfile && UserProfile.phone);
  const [Image, setImage] = useState(localStorage.getItem("profileImg"));
  const [isLoader, setIsLoader] = useState(false);
  const [percentage, setpercentage] = useState(0);
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
  const [isdeleteModal, setIsdeleteModal] = useState(false);
  const [deleteUserRes, setDeleteUserRes] = useState("");
  const [isDelLoader, setIsDelLoader] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorSetup, setTwoFactorSetup] = useState({
    qrCodeData: "",
    secret: "",
    otpauthUrl: "",
  });
  const [isTwoFactorModalOpen, setIsTwoFactorModalOpen] = useState(false);
  const [twoFactorSetupCode, setTwoFactorSetupCode] = useState("");
  const [twoFactorSetupError, setTwoFactorSetupError] = useState("");
  const [twoFactorSetupLoading, setTwoFactorSetupLoading] = useState(false);
  const [isDisableTwoFactorModalOpen, setIsDisableTwoFactorModalOpen] = useState(false);
  const [twoFactorDisableCode, setTwoFactorDisableCode] = useState("");
  const [twoFactorDisableError, setTwoFactorDisableError] = useState("");
  const [twoFactorDisableLoading, setTwoFactorDisableLoading] = useState(false);
  useEffect(() => {
    getUserDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const getUserDetail = async () => {
    setIsLoader(true);
    const currentUser = JSON.parse(JSON.stringify(Parse.User.current()));
    let isEmailVerified = currentUser?.emailVerified || false;
    setTwoFactorEnabled(Boolean(currentUser?.twoFactorEnabled));
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
          setTwoFactorEnabled(Boolean(user?.get("twoFactorEnabled")));
          setIsLoader(false);
        }
      } catch (e) {
        alert(t("something-went-wrong-mssg"));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let phn = Phone,
      res = "";
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
      const ExtUserId = extData?.[0]?.objectId;
      const body = {
        Phone: obj?.Phone || "",
        Name: obj.Name,
        JobTitle: jobTitle,
        Company: company,
        Language: obj?.language || "",
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

      if (response?.url()) {
        const fileRes = await getSecureUrl(response?.url());
        if (fileRes?.url) {
          setImage(fileRes?.url);
          setpercentage(0);
          const tenantId = localStorage.getItem("TenantId");
          const userId = extendUser?.[0]?.UserId?.objectId;
          SaveFileSize(size, fileRes?.url, tenantId, userId);
          return fileRes?.url;
        }
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
    await handleSendOTP(Parse.User.current().getEmail());
    setOtpLoader(false);
    alert(t("otp-sent-alert"));
  };

  const handleCancel = () => {
    setEditMode(false);
    SetName(localStorage.getItem("username"));
    SetPhone(UserProfile && UserProfile.phone);
    setImage(localStorage.getItem("profileImg"));
    setCompany(extendUser && extendUser?.[0]?.Company);
    setJobTitle(extendUser?.[0]?.JobTitle);
  };

  const handleDeleteAccountBtn = () => {
    const isAdmin = extendUser?.[0]?.UserRole === "contracts_Admin";
    if (!isAdmin) {
      setDeleteUserRes(t("delete-action-prohibited"));
    }
    setIsdeleteModal(true);
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setIsDelLoader(true);
    try {
      await Parse.Cloud.run("senddeleterequest", {
        userId: Parse.User.current().id
      });
      setDeleteUserRes(t("account-deletion-request-sent-via-mail"));
    } catch (err) {
      setDeleteUserRes(err.message);
      console.log("Err in deleteuser acc", err);
    } finally {
      setIsDelLoader(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setIsdeleteModal(false);
    setDeleteUserRes("");
  };

  const updateStoredTwoFactorFlag = (enabled) => {
    const storedUser = localStorage.getItem("UserInformation");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        parsed.twoFactorEnabled = enabled;
        localStorage.setItem("UserInformation", JSON.stringify(parsed));
      } catch (error) {
        console.log("Failed to update stored user info", error);
      }
    }
  };

  const handleStartTwoFactorSetup = async () => {
    setTwoFactorSetupLoading(true);
    setTwoFactorSetupError("");
    setTwoFactorSetup({ qrCodeData: "", secret: "", otpauthUrl: "" });
    try {
      const response = await Parse.Cloud.run("generate2fasecret");
      if (response) {
        setTwoFactorSetup(response);
        setTwoFactorSetupCode("");
        setIsTwoFactorModalOpen(true);
      }
    } catch (error) {
      console.log("Error generating 2FA secret", error);
      alert(error?.message || t("something-went-wrong-mssg"));
    } finally {
      setTwoFactorSetupLoading(false);
    }
  };

  const handleCloseTwoFactorModal = () => {
    setIsTwoFactorModalOpen(false);
    setTwoFactorSetupCode("");
    setTwoFactorSetupError("");
    setTwoFactorSetup({ qrCodeData: "", secret: "", otpauthUrl: "" });
  };

  const handleConfirmTwoFactorSetup = async (event) => {
    event.preventDefault();
    if (!twoFactorSetupCode) {
      setTwoFactorSetupError(t("verification-code-required"));
      return;
    }
    setTwoFactorSetupLoading(true);
    setTwoFactorSetupError("");
    try {
      await Parse.Cloud.run("enable2fa", { token: twoFactorSetupCode });
      setTwoFactorEnabled(true);
      const currentParseUser = Parse.User.current();
      if (currentParseUser) {
        currentParseUser.set("twoFactorEnabled", true);
      }
      updateStoredTwoFactorFlag(true);
      handleCloseTwoFactorModal();
      alert(t("2fa-enabled-successfully"));
    } catch (error) {
      console.log("Error enabling 2FA", error);
      if (error?.code === Parse.Error.VALIDATION_ERROR) {
        setTwoFactorSetupError(t("verification-code-invalid"));
      } else {
        alert(error?.message || t("something-went-wrong-mssg"));
      }
    } finally {
      setTwoFactorSetupLoading(false);
    }
  };

  const handleOpenDisableTwoFactorModal = () => {
    setTwoFactorDisableCode("");
    setTwoFactorDisableError("");
    setIsDisableTwoFactorModalOpen(true);
  };

  const handleCloseDisableTwoFactorModal = () => {
    setIsDisableTwoFactorModalOpen(false);
    setTwoFactorDisableCode("");
    setTwoFactorDisableError("");
  };

  const handleDisableTwoFactor = async (event) => {
    event.preventDefault();
    if (!twoFactorDisableCode) {
      setTwoFactorDisableError(t("verification-code-required"));
      return;
    }
    setTwoFactorDisableLoading(true);
    setTwoFactorDisableError("");
    try {
      await Parse.Cloud.run("disable2fa", { token: twoFactorDisableCode });
      setTwoFactorEnabled(false);
      const currentParseUser = Parse.User.current();
      if (currentParseUser) {
        currentParseUser.set("twoFactorEnabled", false);
      }
      updateStoredTwoFactorFlag(false);
      handleCloseDisableTwoFactorModal();
      alert(`${t("two-factor-authentication")}: ${t("saved-successfully")}`);
    } catch (error) {
      console.log("Error disabling 2FA", error);
      if (error?.code === Parse.Error.VALIDATION_ERROR) {
        setTwoFactorDisableError(t("verification-code-invalid"));
      } else {
        alert(error?.message || t("something-went-wrong-mssg"));
      }
    } finally {
      setTwoFactorDisableLoading(false);
    }
  };

  return (
    <React.Fragment>
      {isLoader ? (
        <div className="h-[100vh] flex justify-center items-center">
          <Loader />
        </div>
      ) : (
        <div className="flex justify-center items-center w-full relative">
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
                  <span className="text-base-contentk text-sm">
                    {percentage}%
                  </span>
                </div>
              )}
              <div className="text-base font-semibold pt-4">
                {localStorage.getItem("_user_role")}
              </div>
            </div>
            <ul className="w-full flex flex-col p-2 text-sm">
              <li
                className={`flex justify-between items-center border-y-[1px] border-gray-300 break-all ${
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
                className={`flex justify-between items-center border-b-[1px] border-gray-300 break-all ${
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
              <li className="flex justify-between items-center border-b-[1px] border-gray-300 py-2 break-all">
                <span
                  data-tooltip-id="email-tooltip"
                  className="font-semibold flex gap-1"
                >
                  {t("email")} :{" "}
                  {editmode && (
                    <Tooltip
                      message={t("email-help")}
                      maxWidth="max-w-[250px]"
                    />
                  )}
                </span>
                <span>{UserProfile && UserProfile.email}</span>
              </li>
              <li
                className={`flex justify-between items-center border-b-[1px] border-gray-300 break-all ${
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
                className={`flex justify-between items-center border-b-[1px] border-gray-300 break-all ${
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
              <li className="flex justify-between items-center border-b-[1px] border-gray-300 py-2 break-all">
                <span className="font-semibold">{t("is-email-verified")}:</span>{" "}
                <span>
                  {isEmailVerified ? (
                    t("verified")
                  ) : (
                    <span>
                      {t("not-verified")} (
                      <span
                        onClick={() => handleVerifyBtn()}
                        className="hover:underline text-blue-600 cursor-pointer"
                      >
                        {t("verify")}
                      </span>
                      )
                    </span>
                  )}
                </span>
              </li>
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
            <div className="px-4 pb-2">
              <div className="mt-3 border border-base-300 rounded-box p-4 bg-base-100">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-base">
                      {t("two-factor-authentication")}
                    </h3>
                    <p className="text-xs text-base-content/70 mt-1">
                      {twoFactorEnabled
                        ? t("2fa-setup-complete-instructions")
                        : t("2fa-setup-intro")}
                    </p>
                  </div>
                  {twoFactorEnabled && (
                    <span className="text-xs font-semibold uppercase text-success">
                      {t("2fa-enabled")}
                    </span>
                  )}
                </div>
                <ul className="mt-3 list-disc pl-5 text-xs text-base-content/70 space-y-1">
                  <li>{t("2fa-help-bullet1")}</li>
                  <li>{t("2fa-help-bullet2")}</li>
                  <li>{t("2fa-help-bullet3")}</li>
                </ul>
                <div className="mt-4 flex flex-wrap gap-2">
                  {twoFactorEnabled ? (
                    <>
                      <button
                        type="button"
                        className="op-btn op-btn-secondary op-btn-sm"
                        onClick={handleStartTwoFactorSetup}
                        disabled={twoFactorSetupLoading || twoFactorDisableLoading}
                      >
                        {t("setup-2fa-again")}
                      </button>
                      <button
                        type="button"
                        className="op-btn op-btn-ghost op-btn-sm"
                        onClick={handleOpenDisableTwoFactorModal}
                        disabled={twoFactorDisableLoading || twoFactorSetupLoading}
                      >
                        {t("disable")}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="op-btn op-btn-primary op-btn-sm"
                      onClick={handleStartTwoFactorSetup}
                      disabled={twoFactorSetupLoading}
                    >
                      {t("setup-2fa")}
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col md:flex-row justify-center gap-2 pt-2 pb-3 md:pt-3 md:pb-4 mx-2 md:mx-0">
              <button
                type="button"
                onClick={(e) => {
                    editmode ? handleSubmit(e) : setEditMode(true);
                }}
                className="op-btn op-btn-primary md:w-[100px]"
              >
                {editmode ? t("save") : t("edit")}
              </button>
              <button
                type="button"
                onClick={() =>
                  editmode ? handleCancel() : navigate("/changepassword")
                }
                className={
                      `op-btn ${editmode ? "op-btn-ghost w-[100px]" : "op-btn-secondary"}`
                }
              >
                {editmode ? t("cancel") : t("change-password")}
              </button>
              <button
                onClick={() => handleDeleteAccountBtn()}
                className="op-link op-link-accent text-sm mx-2"
              >
                {t("delete-account")}
              </button>
            </div>
          </div>
          {isTwoFactorModalOpen && (
            <ModalUi
              isOpen
              title={t("two-factor-authentication")}
              handleClose={handleCloseTwoFactorModal}
            >
              {twoFactorSetupLoading ? (
                <div className="h-[220px] flex justify-center items-center">
                  <Loader />
                </div>
              ) : (
                <form onSubmit={handleConfirmTwoFactorSetup} className="px-6 py-4 text-base-content text-sm">
                  <p className="text-xs text-base-content/70">
                    {t("2fa-help-text")}
                  </p>
                  {twoFactorSetup.qrCodeData && (
                    <div className="mt-4 flex justify-center">
                      <img
                        src={twoFactorSetup.qrCodeData}
                        alt={t("two-factor-authentication")}
                        className="w-48 h-48"
                      />
                    </div>
                  )}
                  <p className="mt-4 text-xs text-base-content/70">
                    {t("manual-setup-instructions")}
                  </p>
                  {twoFactorSetup.secret && (
                    <div className="mt-2 p-2 rounded-box bg-base-200 text-xs font-mono break-all">
                      {twoFactorSetup.secret}
                    </div>
                  )}
                  <div className="mt-4">
                    <label className="block text-xs font-semibold" htmlFor="twoFactorSetupCode">
                      {t("verification-code")}
                    </label>
                    <input
                      id="twoFactorSetupCode"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                      value={twoFactorSetupCode}
                      onChange={(e) => setTwoFactorSetupCode(e.target.value.replace(/\s/g, ""))}
                      onInvalid={(e) => e.target.setCustomValidity(t("verification-code-required"))}
                      onInput={(e) => e.target.setCustomValidity("")}
                      autoComplete="one-time-code"
                      required
                    />
                    {twoFactorSetupError && (
                      <p className="text-error text-xs mt-2">{twoFactorSetupError}</p>
                    )}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button type="submit" className="op-btn op-btn-primary" disabled={twoFactorSetupLoading}>
                      {twoFactorSetupLoading ? t("loading") : t("verify")}
                    </button>
                    <button type="button" className="op-btn op-btn-ghost" onClick={handleCloseTwoFactorModal}>
                      {t("cancel")}
                    </button>
                  </div>
                </form>
              )}
            </ModalUi>
          )}
          {isDisableTwoFactorModalOpen && (
            <ModalUi
              isOpen
              title={t("two-factor-verification")}
              handleClose={handleCloseDisableTwoFactorModal}
            >
              {twoFactorDisableLoading ? (
                <div className="h-[180px] flex justify-center items-center">
                  <Loader />
                </div>
              ) : (
                <form onSubmit={handleDisableTwoFactor} className="px-6 py-4 text-base-content text-sm">
                  <p className="text-xs text-base-content/70">
                    {t("enter-verification-code-instructions")}
                  </p>
                  <div className="mt-4">
                    <label className="block text-xs font-semibold" htmlFor="twoFactorDisableCode">
                      {t("verification-code")}
                    </label>
                    <input
                      id="twoFactorDisableCode"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                      value={twoFactorDisableCode}
                      onChange={(e) => setTwoFactorDisableCode(e.target.value.replace(/\s/g, ""))}
                      onInvalid={(e) => e.target.setCustomValidity(t("verification-code-required"))}
                      onInput={(e) => e.target.setCustomValidity("")}
                      autoComplete="one-time-code"
                      required
                    />
                    {twoFactorDisableError && (
                      <p className="text-error text-xs mt-2">{twoFactorDisableError}</p>
                    )}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button type="submit" className="op-btn op-btn-primary" disabled={twoFactorDisableLoading}>
                      {twoFactorDisableLoading ? t("loading") : t("verify")}
                    </button>
                    <button type="button" className="op-btn op-btn-ghost" onClick={handleCloseDisableTwoFactorModal}>
                      {t("cancel")}
                    </button>
                  </div>
                </form>
              )}
            </ModalUi>
          )}
          {isdeleteModal && (
            <ModalUi
              isOpen
              title={t("delete-account")}
              handleClose={handleCloseDeleteModal}
            >
              {isDelLoader ? (
                <div className="h-[100px] flex justify-center items-center">
                  <Loader />
                </div>
              ) : (
                <>
                  {deleteUserRes ? (
                    <div className="h-[100px] p-[20px] flex justify-center items-center text-base-content text-sm md:text-base">
                      {deleteUserRes}
                    </div>
                  ) : (
                    <form onSubmit={(e) => handleDeleteAccount(e)}>
                      <div className="px-6 py-3 text-base-content text-sm md:text-base">
                        {t("delete-account-que")}
                      </div>
                      <div className="px-6 mb-3">
                        <button
                          type="submit"
                          className="op-btn op-btn-primary w-[100px]"
                        >
                          {t("yes")}
                        </button>
                        <button
                          className="op-btn op-btn-secondary ml-2 w-[100px]"
                          onClick={handleCloseDeleteModal}
                        >
                          {t("cancel")}
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}
            </ModalUi>
          )}
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
        </div>
      )}
    </React.Fragment>
  );
}

export default UserProfile;
