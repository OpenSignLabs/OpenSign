import React, {
  useState,
  useEffect,
} from "react";
import { Navigate, useNavigate } from "react-router";
import Parse from "parse";
import { SaveFileSize } from "../constant/saveFileSize";
import dp from "../assets/images/dp.png";
import {
  compressImage,
  sanitizeFileName,
  withSessionValidation
} from "../utils";
import axios from "axios";
import Tooltip from "../primitives/Tooltip";
import {
  getSecureUrl,
  handleSendOTP
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
  const [email, setEmail] = useState(UserProfile && UserProfile.email);
  const [originalEmail, setOriginalEmail] = useState(
    UserProfile && UserProfile.email
  );
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
  useEffect(() => {
    getUserDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const getUserDetail = async () => {
    setIsLoader(true);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailToSave = (email || "").toLowerCase().trim();
    // The Save control is type="button", so the input type does not validate.
    if (!emailToSave || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailToSave)) {
      alert(t("Please Enter valid email"));
      return;
    }
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
                if (emailToSave !== (originalEmail || "").toLowerCase().trim()) {
                  // The new address has to be verified before it is applied.
                  await handleSendOTP(emailToSave);
                  setIsVerifyModal(true);
                } else {
                  alert(t("profile-update-alert"));
                  setEditMode(false);
                }
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
  const updateExtUser = withSessionValidation(async (obj) => {
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
    } catch (err) {
      console.log("error in save data in contracts_Users class", err);
    }
  });
  // file upload function
  const fileUpload = async (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const compressedfile = await compressImage(
        file,
        { width: 200, height: 200 },
        "file"
      );
      await handleFileUpload(compressedfile);
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
        progress: (progressValue, loaded, total) => {
          if (progressValue !== null) {
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
    const targetEmail =
      (email || "").toLowerCase().trim() || Parse.User.current().getEmail();
    await handleSendOTP(targetEmail);
  };
  const handleCloseVerifyModal = async () => {
    setIsVerifyModal(false);
  };
  //`handleVerifyEmail` function is used to verify email with otp
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setOtpLoader(true);
    try {
      const targetEmail =
        (email || "").toLowerCase().trim() || Parse.User.current().getEmail();
      const resEmail = await Parse.Cloud.run("verifyemail", {
        otp: otp,
        email: targetEmail
      });
      if (
        resEmail?.message === "Email is verified." ||
        resEmail?.message === "Email changed and verified."
      ) {
        setEmail(targetEmail);
        setOriginalEmail(targetEmail);
        localStorage.setItem("userEmail", targetEmail);
        try {
          const userInfo = JSON.parse(
            localStorage.getItem("UserInformation") || "{}"
          );
          userInfo.email = targetEmail;
          localStorage.setItem("UserInformation", JSON.stringify(userInfo));
        } catch (e) {
          // ignore
        }
        // Keep the in-memory Parse user and the cached profile in sync, so the
        // sender address used by new requests is the new one.
        if (Parse.User.current()) {
          Parse.User.current().set("email", targetEmail);
          Parse.User.current().set("username", targetEmail);
        }
        try {
          const extUser = JSON.parse(
            localStorage.getItem("Extand_Class") || "[]"
          );
          if (Array.isArray(extUser) && extUser.length && extUser[0]) {
            extUser[0].Email = targetEmail;
            extUser[0].NormalizedEmail = targetEmail;
            localStorage.setItem("Extand_Class", JSON.stringify(extUser));
          }
        } catch (e) {
          // ignore
        }
        setIsEmailVerified(true);
        setEditMode(false);
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
    const targetEmail =
      (email || "").toLowerCase().trim() || Parse.User.current().getEmail();
    await handleSendOTP(targetEmail);
    setOtpLoader(false);
    alert(t("otp-sent-alert"));
  };

  const handleCancel = () => {
    setEditMode(false);
    SetName(localStorage.getItem("username"));
    setEmail(originalEmail);
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

  const displayName = name || UserProfile?.email || t("profile");
  const displayRole = localStorage.getItem("_user_role") || "";
  const displayEmail = UserProfile?.email || "";
  return (
    <React.Fragment>
      {isLoader ? (
        <div className="h-[100vh] flex justify-center items-center">
          <Loader />
        </div>
      ) : (
        <div className="os-profile-page">
          <div className="os-profile-card">
            <aside className="os-profile-identity">
              <div className="os-profile-identity-header">
                <span className="os-profile-signal-bars" aria-hidden="true">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </div>
              <div className="os-profile-portrait-column">
                <div className="os-profile-avatar">
                  <img
                    className="object-contain w-full h-full"
                    src={Image === "" ? dp : Image}
                    alt={t("profile")}
                  />
                </div>
                {editmode && (
                  <input
                    type="file"
                    className="os-profile-upload op-file-input op-file-input-bordered op-file-input-sm"
                    accept="image/png, image/gif, image/jpeg"
                    onChange={fileUpload}
                  />
                )}
                {percentage !== 0 && (
                  <div className="os-profile-progress">
                    <div className="os-profile-progress-track">
                      <div
                        className="os-profile-progress-bar"
                        style={{ transform: `scaleX(${percentage / 100})` }}
                      ></div>
                    </div>
                    <span>{percentage}%</span>
                  </div>
                )}
              </div>
              <div className="os-profile-identity-copy">
                <p className="os-profile-role">{displayRole}</p>
                <h1>{displayName}</h1>
                <p className="os-profile-email">{displayEmail}</p>
              </div>
            </aside>
            <main className="os-profile-workspace">
              <header className="os-profile-workspace-header">
                <div className="os-profile-title-block">
                  <h2>{t("profile")}</h2>
                </div>
                <div className="os-profile-header-actions">
                  <button
                    type="button"
                    onClick={(e) => {
                        editmode ? handleSubmit(e) : setEditMode(true);
                    }}
                    className="op-btn op-btn-primary os-profile-header-button"
                  >
                    <i
                      className={
                        editmode ? "fa-light fa-check" : "fa-light fa-pen"
                      }
                      aria-hidden="true"
                    />
                    {editmode ? t("save") : t("edit")}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      editmode ? handleCancel() : navigate("/changepassword")
                    }
                    className={
                          "op-btn op-btn-secondary os-profile-header-button"
                    }
                  >
                    <i
                      className={
                        editmode
                          ? "fa-light fa-arrow-rotate-left"
                          : "fa-light fa-lock-keyhole"
                      }
                      aria-hidden="true"
                    />
                    {editmode ? t("cancel") : t("change-password")}
                  </button>
                </div>
              </header>
              <div className="os-profile-workspace-body">
                <section className="os-profile-section">
                  <div className="os-profile-section-heading">
                    <div>
                      <h3>{t("contact-details")}</h3>
                    </div>
                    <span
                      className="os-profile-section-signal"
                      aria-hidden="true"
                    >
                      <span></span>
                      <span></span>
                    </span>
                  </div>
                  <div className="os-profile-field-grid">
                    {editmode && (
                      <div className="os-profile-field">
                        <label htmlFor="profile-name">{t("name")}</label>
                        <input
                          id="profile-name"
                          type="text"
                          value={name}
                          className="op-input op-input-bordered os-profile-field-input"
                          onChange={(e) => SetName(e.target.value)}
                        />
                      </div>
                    )}
                    <div className="os-profile-field">
                      <label htmlFor="profile-email">{t("email")}</label>
                      {editmode ? (
                        <input
                          id="profile-email"
                          type="email"
                          value={email}
                          className="op-input op-input-bordered os-profile-field-input"
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      ) : (
                        <p className="os-profile-field-value">{email}</p>
                      )}
                    </div>
                    <div className="os-profile-field">
                      <label htmlFor="profile-phone">{t("phone")}</label>
                      {editmode ? (
                        <input
                          id="profile-phone"
                          type="text"
                          className="op-input op-input-bordered os-profile-field-input"
                          onChange={(e) => SetPhone(e.target.value)}
                          value={Phone}
                        />
                      ) : (
                        <p className="os-profile-field-value">{Phone}</p>
                      )}
                    </div>
                    <div className="os-profile-field">
                      <label htmlFor="profile-company">{t("company")}</label>
                      {editmode ? (
                        <input
                          id="profile-company"
                          type="text"
                          value={company}
                          className="op-input op-input-bordered os-profile-field-input"
                          onChange={(e) => setCompany(e.target.value)}
                        />
                      ) : (
                        <p className="os-profile-field-value">{company}</p>
                      )}
                    </div>
                    <div className="os-profile-field">
                      <label htmlFor="profile-job-title">
                        {t("job-title")}
                      </label>
                      {editmode ? (
                        <input
                          id="profile-job-title"
                          type="text"
                          value={jobTitle}
                          className="op-input op-input-bordered os-profile-field-input"
                          onChange={(e) => setJobTitle(e.target.value)}
                        />
                      ) : (
                        <p className="os-profile-field-value">{jobTitle}</p>
                      )}
                    </div>
                  </div>
                </section>
                <section className="os-profile-section os-profile-security-section">
                  <div className="os-profile-section-heading">
                    <div>
                      <i
                        className={
                          isEmailVerified
                            ? "fa-light fa-shield-check os-profile-security-heading-icon"
                            : "fa-light fa-shield-exclamation os-profile-security-heading-icon"
                        }
                        aria-hidden="true"
                      />
                      <h3>{t("security-section")}</h3>
                    </div>
                  </div>
                  <div className="os-profile-security-content-row">
                    <div className="os-profile-security-row">
                      <div>
                        <p className="os-profile-security-title">
                          {t("is-email-verified")}
                        </p>
                      </div>
                      <div className="os-profile-security-action">
                        <span
                          className={
                            isEmailVerified
                              ? "os-profile-status os-profile-status-verified"
                              : "os-profile-status"
                          }
                        >
                          <i
                            className={
                              isEmailVerified
                                ? "fa-light fa-circle-check"
                                : "fa-light fa-circle-exclamation"
                            }
                            aria-hidden="true"
                          />
                          {isEmailVerified ? t("verified") : t("not-verified")}
                        </span>
                        {!isEmailVerified && (
                          <button
                            type="button"
                            onClick={() => handleVerifyBtn()}
                            className="op-link op-link-accent os-profile-verify-button"
                          >
                            {t("verify")}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
                <section className="os-profile-section os-profile-language-section">
                  <div className="os-profile-section-heading">
                    <div>
                      <h3>{t("language")}</h3>
                    </div>
                  </div>
                  <div id="profile-language" className="os-profile-language">
                    <SelectLanguage
                      isProfile={true}
                      updateExtUser={updateExtUser}
                    />
                  </div>
                </section>
              </div>
              <footer className="os-profile-workspace-footer">
                <div className="os-profile-danger-content">
                  <p className="os-profile-danger-title">
                    <i className="fa-light fa-trash-can" aria-hidden="true" />
                    <span>{t("delete-account")}</span>
                  </p>
                  {extendUser?.[0]?.UserRole !== "contracts_Admin" && (
                    <p className="os-profile-danger-copy">
                      {t("delete-action-prohibited")}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteAccountBtn()}
                  className="op-link op-link-accent os-profile-delete-action"
                >
                  {t("delete-account")}
                </button>
              </footer>
            </main>
          </div>
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
                      className="w-full op-input op-input-bordered op-input-sm hover:border-base-content text-xs"
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
