import React, {
  useState,
  useEffect,
} from "react";
import { Navigate } from "react-router";
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
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import LinearProgress from "@mui/material/LinearProgress";

function UserProfile() {
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
    const isSent = await handleSendOTP(Parse.User.current().getEmail());
    setOtpLoader(false);
    if (isSent) alert(t("otp-sent-alert"));
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

  return (
    <React.Fragment>
      {isLoader ? (
        <Box
          sx={{
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <Loader />
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            position: "relative"
          }}
        >
          <Paper
            elevation={2}
            sx={{
              bgcolor: "background.paper",
              color: "text.primary",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              borderRadius: 4,
              width: 450
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                my: 2
              }}
            >
              <Box
                sx={{
                  width: 200,
                  height: 200,
                  overflow: "hidden",
                  borderRadius: "50%"
                }}
              >
                <img
                  className="object-contain w-full h-full"
                  src={Image === "" ? dp : Image}
                  alt="dp"
                />
              </Box>
              {editmode && (
                <TextField
                  type="file"
                  size="small"
                  onChange={fileUpload}
                  sx={{ maxWidth: 270, mt: 2 }}
                  slotProps={{
                    htmlInput: { accept: "image/png, image/gif, image/jpeg" }
                  }}
                />
              )}
              {percentage !== 0 && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={percentage}
                    sx={{
                      height: 8,
                      borderRadius: 9999,
                      width: { xs: 200, md: 400 }
                    }}
                  />
                  <Typography variant="body2">{percentage}%</Typography>
                </Box>
              )}
              <Typography sx={{ fontWeight: 600, pt: 2 }}>
                {localStorage.getItem("_user_role")}
              </Typography>
            </Box>
            <Box
              component="ul"
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                p: 1,
                m: 0,
                listStyle: "none",
                fontSize: "0.875rem"
              }}
            >
              <Box
                component="li"
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderTop: 1,
                  borderBottom: 1,
                  borderColor: "divider",
                  wordBreak: "break-all",
                  py: editmode ? 0.75 : 1
                }}
              >
                <Box component="span" sx={{ fontWeight: 600 }}>
                  {t("name")}:
                </Box>{" "}
                {editmode ? (
                  <TextField
                    type="text"
                    value={name}
                    size="small"
                    sx={{ width: 180 }}
                    onChange={(e) => SetName(e.target.value)}
                  />
                ) : (
                  <span>{localStorage.getItem("username")}</span>
                )}
              </Box>
              <Box
                component="li"
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: 1,
                  borderColor: "divider",
                  wordBreak: "break-all",
                  py: editmode ? 0.75 : 1
                }}
              >
                <Box component="span" sx={{ fontWeight: 600 }}>
                  {t("phone")}:
                </Box>{" "}
                {editmode ? (
                  <TextField
                    type="text"
                    size="small"
                    sx={{ width: 180 }}
                    onChange={(e) => SetPhone(e.target.value)}
                    value={Phone}
                  />
                ) : (
                  <span>{UserProfile && UserProfile.phone}</span>
                )}
              </Box>
              <Box
                component="li"
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: 1,
                  borderColor: "divider",
                  py: 1,
                  wordBreak: "break-all"
                }}
              >
                <Box
                  component="span"
                  data-tooltip-id="email-tooltip"
                  sx={{ fontWeight: 600, display: "flex", gap: 0.5 }}
                >
                  {t("email")} :{" "}
                  {editmode && (
                    <Tooltip
                      message={t("email-help")}
                      maxWidth="max-w-[250px]"
                    />
                  )}
                </Box>
                <span>{UserProfile && UserProfile.email}</span>
              </Box>
              <Box
                component="li"
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: 1,
                  borderColor: "divider",
                  wordBreak: "break-all",
                  py: editmode ? 0.75 : 1
                }}
              >
                <Box component="span" sx={{ fontWeight: 600 }}>
                  {t("company")}:
                </Box>{" "}
                {editmode ? (
                  <TextField
                    type="text"
                    value={company}
                    size="small"
                    sx={{ width: 180 }}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                ) : (
                  <span>{extendUser?.[0].Company}</span>
                )}
              </Box>
              <Box
                component="li"
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: 1,
                  borderColor: "divider",
                  wordBreak: "break-all",
                  py: editmode ? 0.75 : 1
                }}
              >
                <Box component="span" sx={{ fontWeight: 600 }}>
                  {t("job-title")}:
                </Box>{" "}
                {editmode ? (
                  <TextField
                    type="text"
                    value={jobTitle}
                    size="small"
                    sx={{ width: 180 }}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                ) : (
                  <span>{extendUser?.[0]?.JobTitle}</span>
                )}
              </Box>
              <Box
                component="li"
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: 1,
                  borderColor: "divider",
                  py: 1,
                  wordBreak: "break-all"
                }}
              >
                <Box component="span" sx={{ fontWeight: 600 }}>
                  {t("is-email-verified")}:
                </Box>{" "}
                <span>
                  {isEmailVerified ? (
                    t("verified")
                  ) : (
                    <span>
                      {t("not-verified")} (
                      <Link
                        component="button"
                        type="button"
                        underline="hover"
                        onClick={() => handleVerifyBtn()}
                        sx={{ cursor: "pointer" }}
                      >
                        {t("verify")}
                      </Link>
                      )
                    </span>
                  )}
                </span>
              </Box>
              <Box
                component="li"
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: 1,
                  borderColor: "divider",
                  wordBreak: "break-all",
                  py: editmode ? 0.75 : 1
                }}
              >
                <Box component="span" sx={{ fontWeight: 600 }}>
                  {t("language")}:
                </Box>{" "}
                <SelectLanguage
                  isProfile={true}
                  updateExtUser={updateExtUser}
                />
              </Box>
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                justifyContent: "center",
                gap: 1,
                pt: { xs: 1, md: 1.5 },
                pb: { xs: 1.5, md: 2 },
                mx: { xs: 1, md: 0 }
              }}
            >
              <Button
                type="button"
                variant="contained"
                onClick={(e) => {
                  editmode ? handleSubmit(e) : setEditMode(true);
                }}
                sx={{ width: { md: 100 } }}
              >
                {editmode ? t("save") : t("edit")}
              </Button>
              {editmode && (
                <Button
                  type="button"
                  variant="text"
                  onClick={handleCancel}
                  sx={{ width: 100 }}
                >
                  {t("cancel")}
                </Button>
              )}
              <Link
                component="button"
                type="button"
                color="secondary"
                underline="hover"
                onClick={() => handleDeleteAccountBtn()}
                sx={{ fontSize: "0.875rem", mx: 1, cursor: "pointer" }}
              >
                {t("delete-account")}
              </Link>
            </Box>
          </Paper>
          {isdeleteModal && (
            <ModalUi
              isOpen
              title={t("delete-account")}
              handleClose={handleCloseDeleteModal}
            >
              {isDelLoader ? (
                <Box
                  sx={{
                    height: 100,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                >
                  <Loader />
                </Box>
              ) : (
                <>
                  {deleteUserRes ? (
                    <Box
                      sx={{
                        height: 100,
                        p: 2.5,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        color: "text.primary",
                        fontSize: { xs: "0.875rem", md: "1rem" }
                      }}
                    >
                      {deleteUserRes}
                    </Box>
                  ) : (
                    <form onSubmit={(e) => handleDeleteAccount(e)}>
                      <Box
                        sx={{
                          px: 3,
                          py: 1.5,
                          color: "text.primary",
                          fontSize: { xs: "0.875rem", md: "1rem" }
                        }}
                      >
                        {t("delete-account-que")}
                      </Box>
                      <Box sx={{ px: 3, mb: 1.5, display: "flex", gap: 1 }}>
                        <Button
                          type="submit"
                          variant="contained"
                          sx={{ width: 100 }}
                        >
                          {t("yes")}
                        </Button>
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={handleCloseDeleteModal}
                          sx={{ width: 100 }}
                        >
                          {t("cancel")}
                        </Button>
                      </Box>
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
                <Box
                  sx={{
                    height: 150,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                >
                  <Loader />
                </Box>
              ) : (
                <form onSubmit={(e) => handleVerifyEmail(e)}>
                  <Box sx={{ px: 3, py: 1.5, color: "text.primary" }}>
                    <Typography
                      component="label"
                      sx={{ mb: 1, display: "block" }}
                    >
                      {t("enter-otp")}
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      type="tel"
                      placeholder={t("otp-placeholder")}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      slotProps={{
                        htmlInput: {
                          required: true,
                          pattern: "[0-9]{4}",
                          onInvalid: (e) =>
                            e.target.setCustomValidity(t("input-required")),
                          onInput: (e) => e.target.setCustomValidity("")
                        }
                      }}
                    />
                  </Box>
                  <Box sx={{ px: 3, mb: 1.5, display: "flex", gap: 1 }}>
                    <Button type="submit" variant="contained">
                      {t("verify")}
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={(e) => handleResend(e)}
                    >
                      {t("resend")}
                    </Button>
                  </Box>
                </form>
              )}
            </ModalUi>
          )}
        </Box>
      )}
    </React.Fragment>
  );
}

export default UserProfile;
