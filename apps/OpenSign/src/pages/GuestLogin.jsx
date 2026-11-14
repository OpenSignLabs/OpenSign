import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import {
  emailRegex,
} from "../constant/const";
import {
  contractUsers,
  runPublicCloudFn,
  saveLanguageInLocal
} from "../constant/Utils";
import logo from "../assets/images/logo.png";
import { appInfo } from "../constant/appinfo";
import Parse from "parse";
import { useTranslation } from "react-i18next";
import SelectLanguage from "../components/pdf/SelectLanguage";
import LoaderWithMsg from "../primitives/LoaderWithMsg";
import ModalUi from "../primitives/ModalUi";
import Loader from "../primitives/Loader";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

function GuestLogin() {
  const { t, i18n } = useTranslation();
  const { id, userMail, contactBookId, base64url } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState(
    userMail?.toLowerCase()?.replace(/\s/g, "")
  );
  const [OTP, setOTP] = useState("");
  const [EnterOTP, setEnterOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState({
    isLoad: true,
    message: t("loading-mssg")
  });
  const [appLogo, setAppLogo] = useState("");
  const [documentId, setDocumentId] = useState(id);
  const [contactId, setContactId] = useState(contactBookId);
  const [sendmail, setSendmail] = useState();
  const [contact, setContact] = useState({
    name: "",
    phone: "",
    email: "",
    jobTitle: "",
    company: ""
  });
  const [isOptionalDetails, setIsOptionalDetails] = useState(false);

  const navigateToDoc = async (docId, contactId) => {
    try {
      const docDetails = await Parse.Cloud.run("getDocument", {
        docId: docId
      });
      if (!docDetails.error) {
        if (sendmail === "false") {
          navigate(
            `/load/recipientSignPdf/${docId}/${contactId}?sendmail=${sendmail}`
          );
        } else {
          navigate(`/load/recipientSignPdf/${docId}/${contactId}`);
        }
        return true;
      } else {
        setIsLoading({ isLoad: false });
        return false;
      }
    } catch (err) {
      console.log("err while getting doc", err);
      return false;
    }
  };

  useEffect(() => {
    handleServerUrl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  //function generate serverUrl and parseAppId from url and save it in local storage
  const handleServerUrl = async () => {
      setAppLogo(logo);
    const favicon = localStorage.getItem("favicon");

    localStorage.clear(); // Clears everything
    localStorage.setItem("favicon", favicon);
    localStorage.setItem(
      "appname",
        "OpenSign™"
    );
    //save isGuestSigner true in local to handle login flow header in mobile view
    localStorage.setItem("isGuestSigner", true);
    saveLanguageInLocal(i18n);
    const parseId = appInfo.appId;
    const newServer = `${appInfo.baseUrl}/`;
    localStorage.setItem("baseUrl", newServer);
    localStorage.setItem("parseAppId", parseId);
    //this condition is used decode base64 to string and get userEmail,documentId, contactBoookId data.
    if (!id) {
      //`atob` function is used to decode base64
      const decodebase64 = atob(base64url);
      //split url in array from '/'
      const checkSplit = decodebase64.split("/");
      setDocumentId(checkSplit[0]);
      setContact((prev) => ({
        ...prev,
        email: checkSplit[1]?.toLowerCase()?.replace(/\s/g, "")
      }));
      setEmail(checkSplit[1]?.toLowerCase()?.replace(/\s/g, ""));
      const contactId = checkSplit?.[2];
      setSendmail(checkSplit[3]);
      if (!contactId) {
        const params = {
          email: checkSplit[1]?.toLowerCase()?.replace(/\s/g, ""),
          docId: checkSplit[0]
        };
        try {
          const linkContactRes = await Parse.Cloud.run(
            "linkcontacttodoc",
            params
          );
          setContactId(linkContactRes?.contactId);
          await navigateToDoc(checkSplit[0], linkContactRes?.contactId);
        } catch (err) {
          setIsLoading({ isLoad: false });
          console.log("Err in link ext contact", err);
        }
      } else {
        setContactId(checkSplit[2]);
        await navigateToDoc(checkSplit[0], checkSplit[2]);
      }
    }
  };

  //send email OTP function
  const SendOtp = async () => {
    setLoading(true);
    setEmail(email?.toLowerCase()?.replace(/\s/g, ""));
    try {
      const params = {
        email: email?.toLowerCase()?.replace(/\s/g, "")?.toString(),
        docId: documentId,
      };
      const Otp = await Parse.Cloud.run("SendOTPMailV1", params);
      if (Otp) {
        setLoading(false);
        setEnterOtp(true);
      }
    } catch (error) {
      alert(error?.message || t("something-went-wrong-mssg"));
      setLoading(false);
    }
  };

  const handleSendOTPBtn = async (e) => {
    e.preventDefault();
    await SendOtp();
  };

  //verify OTP send on via email
  const VerifyOTP = async (e) => {
    e.preventDefault();
    if (OTP) {
      setLoading(true);
      try {
        const _user = await runPublicCloudFn("AuthLoginAsMail", {
          email: email?.toLowerCase()?.replace(/\s/g, ""),
          otp: OTP,
          docId: documentId
        });
        await Parse.User.become(_user.sessionToken);
        const parseId = localStorage.getItem("parseAppId");
        if (_user) {
          localStorage.setItem("accesstoken", _user?.sessionToken);
          localStorage.setItem("UserInformation", JSON.stringify(_user));
          localStorage.setItem(
            `Parse/${parseId}/currentUser`,
            JSON.stringify(_user)
          );
        }
        const contractUserDetails = await contractUsers();
        if (contractUserDetails && contractUserDetails.length > 0) {
          localStorage.setItem(
            "Extand_Class",
            JSON.stringify(contractUserDetails)
          );
        }
        setLoading(false);
        if (sendmail === "false") {
          navigate(
            `/load/recipientSignPdf/${documentId}/${contactId}?sendmail=${sendmail}`
          );
        } else {
          navigate(`/load/recipientSignPdf/${documentId}/${contactId}`);
        }
      } catch (error) {
        console.log("err ", error);
        alert(error?.message || t("something-went-wrong-mssg"));
        setLoading(false);
      }
    } else {
      alert(t("enter-otp-alert"));
    }
  };


  const handleUserData = async (e) => {
    e.preventDefault();
    if (!emailRegex.test(contact.email?.toLowerCase()?.replace(/\s/g, ""))) {
      alert(t("valid-email-alert"));
    } else {
      const params = { ...contact, docId: documentId };
      try {
        setLoading(true);
        const linkContactRes = await Parse.Cloud.run(
          "linkcontacttodoc",
          params
        );
        setContactId(linkContactRes.contactId);
        const IsEnableOTP = await navigateToDoc(
          documentId,
          linkContactRes.contactId
        );
        if (!IsEnableOTP) {
          setEnterOtp(true);
          await SendOtp();
        }
      } catch (err) {
        setLoading(false);
        alert(t("something-went-wrong-mssg"));
        console.log("Err in link ext contact", err);
      }
    }
  };

  const handleInputChange = (e) => {
    if (e.target.name === "email") {
      setContact((prev) => ({
        ...prev,
        [e.target.name]: e.target.value?.toLowerCase()?.replace(/\s/g, "")
      }));
    } else {
      setContact((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }
  };

  return (
    <div>

      {/* OTP Verification Modal */}
      {EnterOTP && (
        <ModalUi
          isOpen
          title={t("otp-verification")}
          handleClose={() => setEnterOtp(false)}
        >
          {loading ? (
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
            <form onSubmit={(e) => VerifyOTP(e)}>
              <Box sx={{ px: 3, py: 1.5 }}>
                <Typography component="label" sx={{ mb: 1, display: "block" }}>
                  {t("enter-otp")}
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="tel"
                  placeholder={t("otp-placeholder")}
                  value={OTP}
                  onChange={(e) => setOTP(e.target.value)}
                  slotProps={{
                    htmlInput: {
                      required: true,
                      pattern: "[0-9]{6}",
                      maxLength: 6,
                      inputMode: "numeric",
                      autoComplete: "one-time-code",
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
                  onClick={(e) => handleSendOTPBtn(e)}
                >
                  {t("resend")}
                </Button>
              </Box>
            </form>
          )}
        </ModalUi>
      )}

      {isLoading.isLoad ? (
        <LoaderWithMsg isLoading={isLoading} />
      ) : (
        <div className="pb-1 md:pb-4 pt-10 md:px-10 lg:px-16">
          <Paper
            elevation={2}
            sx={{
              p: { xs: 2, md: 2, lg: 5 },
              color: "text.primary",
              bgcolor: "background.paper",
              borderRadius: 3
            }}
          >
            <Box
              sx={{
                width: 250,
                height: 66,
                display: "inline-block",
                overflow: "hidden",
                mb: 3
              }}
            >
              {appLogo && (
                <img
                  src={appLogo}
                  className="object-contain h-full"
                  alt="logo"
                />
              )}
            </Box>
            {contactId ? (
              <Box sx={{ width: { xs: "100%", md: "50%" }, color: "text.primary" }}>
                <Typography variant="h4">{t("welcome")}</Typography>
                <Typography
                  component="legend"
                  variant="caption"
                  sx={{ color: "text.secondary", mt: 1, mb: 0.5 }}
                >
                  {t("get-otp-alert")}
                </Typography>
                <Paper
                  elevation={2}
                  sx={{ p: 2.5, my: 1, borderRadius: 3, border: 1, borderColor: "divider" }}
                >
                  <TextField
                    type="email"
                    name="email"
                    value={email}
                    fullWidth
                    size="small"
                    disabled
                  />
                </Paper>
                <Box sx={{ mt: 1.5 }}>
                  <Button
                    variant="contained"
                    startIcon={<i className="fa-light fa-message-sms"></i>}
                    onClick={(e) => {
                      e.preventDefault();
                      SendOtp();
                    }}
                    disabled={loading}
                  >
                    {loading ? t("loading") : t("get-verification-code")}
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box sx={{ width: { xs: "100%", md: "50%" }, color: "text.primary" }}>
                <Typography variant="h4">{t("welcome")}</Typography>
                <Typography
                  component="legend"
                  variant="caption"
                  sx={{ color: "text.secondary", mt: 1 }}
                >
                  {t("provide-your-details")}
                </Typography>
                <Paper
                  component="form"
                  elevation={2}
                  sx={{
                    p: 2.5,
                    pt: 1.875,
                    my: 1,
                    borderRadius: 3,
                    border: 1,
                    borderColor: "divider"
                  }}
                  onSubmit={handleUserData}
                >
                  <Box sx={{ mb: 1 }}>
                    <Typography
                      component="label"
                      htmlFor="name"
                      variant="caption"
                      sx={{ display: "block", fontWeight: 600 }}
                    >
                      {t("name")}
                      <Box component="span" sx={{ color: "error.main" }}>
                        {" "}
                        *
                      </Box>
                    </Typography>
                    <TextField
                      type="text"
                      name="name"
                      value={contact.name}
                      onChange={handleInputChange}
                      fullWidth
                      size="small"
                      disabled={loading}
                      placeholder={t("enter-name")}
                      slotProps={{
                        htmlInput: {
                          required: true,
                          onInvalid: (e) =>
                            e.target.setCustomValidity(t("input-required")),
                          onInput: (e) => e.target.setCustomValidity("")
                        }
                      }}
                    />
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography
                      component="label"
                      htmlFor="email"
                      variant="caption"
                      sx={{ display: "block", fontWeight: 600 }}
                    >
                      {t("email")}
                      <Box component="span" sx={{ color: "error.main" }}>
                        {" "}
                        *
                      </Box>
                    </Typography>
                    <TextField
                      type="email"
                      name="email"
                      value={contact.email}
                      onChange={handleInputChange}
                      fullWidth
                      size="small"
                      placeholder={t("enter-email")}
                      disabled
                      slotProps={{ htmlInput: { required: true } }}
                    />
                  </Box>
                  {isOptionalDetails && (
                    <>
                      <Box sx={{ mb: 1 }}>
                        <Typography
                          component="label"
                          htmlFor="phone"
                          variant="caption"
                          sx={{ display: "block", fontWeight: 600 }}
                        >
                          {t("phone")}
                        </Typography>
                        <TextField
                          type="text"
                          name="phone"
                          value={contact.phone}
                          onChange={handleInputChange}
                          fullWidth
                          size="small"
                          disabled={loading}
                          placeholder={t("phone-optional")}
                        />
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <Typography
                          component="label"
                          htmlFor="company"
                          variant="caption"
                          sx={{ display: "block", fontWeight: 600 }}
                        >
                          {t("company")}
                        </Typography>
                        <TextField
                          type="text"
                          id="company"
                          name="company"
                          value={contact.company}
                          onChange={handleInputChange}
                          fullWidth
                          size="small"
                          disabled={loading}
                          placeholder={t("phone-optional")}
                        />
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <Typography
                          component="label"
                          htmlFor="jobTitle"
                          variant="caption"
                          sx={{ display: "block", fontWeight: 600 }}
                        >
                          {t("job-title")}
                        </Typography>
                        <TextField
                          type="text"
                          id="jobTitle"
                          name="jobTitle"
                          value={contact.jobTitle}
                          onChange={handleInputChange}
                          fullWidth
                          size="small"
                          disabled={loading}
                          placeholder={t("phone-optional")}
                        />
                      </Box>
                    </>
                  )}
                  <Button
                    variant="text"
                    size="small"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsOptionalDetails(!isOptionalDetails);
                    }}
                    sx={{ color: "text.secondary", px: 0 }}
                  >
                    {isOptionalDetails
                      ? t("hide-optional-details")
                      : t("optional-details")}
                  </Button>
                  <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-start" }}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading}
                    >
                      {loading ? t("loading") : t("next")}
                    </Button>
                  </Box>
                </Paper>
              </Box>
            )}
          </Paper>
          <SelectLanguage />
        </div>
      )}
    </div>
  );
}

export default GuestLogin;
