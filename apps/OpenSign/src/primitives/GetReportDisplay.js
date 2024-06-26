import React, { useState, useEffect } from "react";
import pad from "../assets/images/pad.svg";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import ModalUi from "./ModalUi";
import AddSigner from "../components/AddSigner";
// import { isEnableSubscription } from "../constant/const";
import Alert from "./Alert";
import Tooltip from "./Tooltip";
import { RWebShare } from "react-web-share";
import Tour from "reactour";
import Parse from "parse";
import { saveAs } from "file-saver";
import {
  // copytoData,
  replaceMailVaribles
} from "../constant/Utils";
// import Confetti from "react-confetti";
import EditorToolbar, {
  module1,
  formats
} from "../components/pdf/EditorToolbar";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import BulkSendUi from "../components/BulkSendUi";
import Loader from "./Loader";

const ReportTable = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard =
    location?.pathname === "/dashboard/35KBoSgoAK" ? true : false;
  const [currentPage, setCurrentPage] = useState(1);
  const [actLoader, setActLoader] = useState({});
  const [isAlert, setIsAlert] = useState(false);
  const [isContactform, setIsContactform] = useState(false);
  const [isDeleteModal, setIsDeleteModal] = useState({});
  const [isRevoke, setIsRevoke] = useState({});
  const [isShare, setIsShare] = useState({});
  const [shareUrls, setShareUrls] = useState([]);
  const [copied, setCopied] = useState(false);
  const [isOption, setIsOption] = useState({});
  const [alertMsg, setAlertMsg] = useState({ type: "success", message: "" });
  const [isTour, setIsTour] = useState(false);
  const [tourStatusArr, setTourStatusArr] = useState([]);
  const [isResendMail, setIsResendMail] = useState({});
  // const [isMakePublic, setIsMakePublic] = useState({});
  const [mail, setMail] = useState({ subject: "", body: "" });
  const [userDetails, setUserDetails] = useState({});
  const [isNextStep, setIsNextStep] = useState({});
  const [isBulkSend, setIsBulkSend] = useState({});
  const [templateDeatils, setTemplateDetails] = useState({});
  const [placeholders, setPlaceholders] = useState([]);
  const [isLoader, setIsLoader] = useState({});
  // const [selectedPublicRole, setSelectedPublicRole] = useState("");
  // const [isCelebration, setIsCelebration] = useState(false);
  // const [currentLists, setCurrentLists] = useState([]);
  // const [isPublic, setIsPublic] = useState({});
  // const [isPublicProfile, setIsPublicProfile] = useState({});
  // const [publicUserName, setIsPublicUserName] = useState("");
  const [isViewShare, setIsViewShare] = useState({});
  const startIndex = (currentPage - 1) * props.docPerPage;
  const { isMoreDocs, setIsNextRecord } = props;
  // For loop is used to calculate page numbers visible below table
  // Initialize pageNumbers using useMemo to avoid unnecessary re-creation
  // const pageNumbers = useMemo(() => {
  //   const calculatedPageNumbers = [];
  //   for (let i = 1; i <= Math.ceil(props.List.length / props.docPerPage); i++) {
  //     calculatedPageNumbers.push(i);
  //   }
  //   return calculatedPageNumbers;
  // }, [props.List, props.docPerPage]);
  const getPaginationRange = () => {
    const totalPageNumbers = 7; // Adjust this value to show more/less page numbers
    const pages = [];
    const totalPages = Math.ceil(props.List.length / props.docPerPage);
    if (totalPages <= totalPageNumbers) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const leftSiblingIndex = Math.max(currentPage - 1, 1);
      const rightSiblingIndex = Math.min(currentPage + 1, totalPages);

      const showLeftDots = leftSiblingIndex > 2;
      const showRightDots = rightSiblingIndex < totalPages - 2;

      const firstPageIndex = 1;
      const lastPageIndex = totalPages;

      if (!showLeftDots && showRightDots) {
        let leftItemCount = 3;
        let leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);

        pages.push(...leftRange);
        pages.push("...");
        pages.push(totalPages);
      } else if (showLeftDots && !showRightDots) {
        let rightItemCount = 3;
        let rightRange = Array.from(
          { length: rightItemCount },
          (_, i) => totalPages - rightItemCount + i + 1
        );

        pages.push(firstPageIndex);
        pages.push("...");
        pages.push(...rightRange);
      } else if (showLeftDots && showRightDots) {
        let middleRange = Array.from(
          { length: 3 },
          (_, i) => leftSiblingIndex + i
        );

        pages.push(firstPageIndex);
        pages.push("...");
        pages.push(...middleRange);
        pages.push("...");
        pages.push(lastPageIndex);
      }
    }

    return pages;
  };
  const pageNumbers = getPaginationRange();
  //  below useEffect reset currenpage to 1 if user change route
  useEffect(() => {
    checkTourStatus();
    return () => setCurrentPage(1);
  }, []);

  // `formatRow` is used to show data in poper manner like
  // if data is of array type then it will join array items with ","
  // if data is of object type then it Name values will be show in row
  // if no data available it will show hyphen "-"
  const formatRow = (row) => {
    if (Array.isArray(row)) {
      let updateArr = row.map((x) => x.Name);
      return updateArr.join(", ");
    } else if (typeof row === "object" && row !== null) {
      return row?.Name || "-";
    } else {
      return "-";
    }
  };
  // below useEffect is used to render next record if IsMoreDoc is true
  // second last value of pageNumber array is same as currentPage
  useEffect(() => {
    if (isMoreDocs && pageNumbers[pageNumbers.length - 1] === currentPage) {
      setIsNextRecord(true);
    }
  }, [isMoreDocs, pageNumbers, currentPage, setIsNextRecord]);

  // `handleURL` is used to open microapp
  const handleURL = async (item, act) => {
    if (props.ReportName === "Templates") {
      if (act.hoverLabel === "Edit") {
        navigate(`/${act.redirectUrl}/${item.objectId}`);
      } else {
        setActLoader({ [`${item.objectId}_${act.btnId}`]: true });
        try {
          const params = {
            templateId: item.objectId
          };
          const templateDeatils = await axios.post(
            `${localStorage.getItem("baseUrl")}functions/getTemplate`,
            params,
            {
              headers: {
                "Content-Type": "application/json",
                "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
                sessionToken: localStorage.getItem("accesstoken")
              }
            }
          );
          const templateData =
            templateDeatils.data && templateDeatils.data.result;
          if (!templateData.error) {
            const Doc = templateData;

            let signers = [];
            if (Doc.Signers?.length > 0) {
              Doc.Signers?.forEach((x) => {
                if (x.objectId) {
                  const obj = {
                    __type: "Pointer",
                    className: "contracts_Contactbook",
                    objectId: x.objectId
                  };
                  signers.push(obj);
                }
              });
            }

            let placeholdersArr = [];
            if (Doc.Placeholders?.length > 0) {
              placeholdersArr = Doc.Placeholders;
              const data = {
                Name: Doc.Name,
                URL: Doc.URL,
                SignedUrl: Doc.SignedUrl,
                SentToOthers: Doc?.SentToOthers || false,
                Description: Doc.Description,
                Note: Doc.Note,
                Placeholders: placeholdersArr,
                ExtUserPtr: {
                  __type: "Pointer",
                  className: "contracts_Users",
                  objectId: Doc.ExtUserPtr.objectId
                },
                CreatedBy: {
                  __type: "Pointer",
                  className: "_User",
                  objectId: Doc.CreatedBy.objectId
                },
                Signers: signers,
                SendinOrder: Doc?.SendinOrder || false,
                AutomaticReminders: Doc?.AutomaticReminders || false,
                RemindOnceInEvery: Doc?.RemindOnceInEvery || 5
              };
              try {
                const res = await axios.post(
                  `${localStorage.getItem(
                    "baseUrl"
                  )}classes/${localStorage.getItem("_appName")}_Document`,
                  data,
                  {
                    headers: {
                      "Content-Type": "application/json",
                      "X-Parse-Application-Id":
                        localStorage.getItem("parseAppId"),
                      "X-Parse-Session-Token":
                        localStorage.getItem("accesstoken")
                    }
                  }
                );

                if (res.data && res.data.objectId) {
                  setActLoader({});
                  setIsAlert(true);
                  setTimeout(() => setIsAlert(false), 1500);
                  navigate(`/${act.redirectUrl}/${res.data.objectId}`, {
                    state: { title: "Use Template" }
                  });
                }
              } catch (err) {
                console.log("Err", err);
                setIsAlert(true);
                setAlertMsg({
                  type: "danger",
                  message: "Something went wrong, Please try again later!"
                });
                setTimeout(() => setIsAlert(false), 1500);
                setActLoader({});
              }
            } else {
              setActLoader({});
            }
          } else {
            setIsAlert(true);
            setAlertMsg({
              type: "danger",
              message: "Something went wrong, Please try again later!"
            });
            setTimeout(() => setIsAlert(false), 1500);
            setActLoader({});
          }
        } catch (err) {
          console.log("err", err);
          setIsAlert(true);
          setAlertMsg({
            type: "danger",
            message: "Something went wrong, Please try again later!"
          });
          setTimeout(() => setIsAlert(false), 1500);
          setActLoader({});
        }
      }
    } else {
      localStorage.removeItem("rowlevel");
      navigate(`/${act.redirectUrl}`);
      localStorage.setItem("rowlevel", JSON.stringify(item));
    }
  };

  const handleActionBtn = (act, item) => {
    if (act.action === "redirect") {
      handleURL(item, act);
    } else if (act.action === "delete") {
      setIsDeleteModal({ [item.objectId]: true });
    } else if (act.action === "share") {
      handleShare(item);
    } else if (act.action === "revoke") {
      setIsRevoke({ [item.objectId]: true });
    } else if (act.action === "option") {
      setIsOption({ [item.objectId]: !isOption[item.objectId] });
    } else if (act.action === "resend") {
      setIsResendMail({ [item.objectId]: true });
    } else if (act.action === "bulksend") {
      handleBulkSend(item);
    }
  };
  // Get current list
  const indexOfLastDoc = currentPage * props.docPerPage;
  const indexOfFirstDoc = indexOfLastDoc - props.docPerPage;
  const currentList = props.List?.slice(indexOfFirstDoc, indexOfLastDoc);
  // useEffect(() => {
  //   // `currentLists` is total record render on current page
  //   const currentList = props.List?.slice(indexOfFirstDoc, indexOfLastDoc);
  //   //check public template and save in a object to show public and private template
  //   // setIsPublic(
  //   //   currentList.reduce((acc, item) => {
  //   //     acc[item.objectId] = item?.IsPublic || false;
  //   //     return acc;
  //   //   }, {})
  //   // );
  //   setCurrentLists(currentList);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [indexOfLastDoc, indexOfFirstDoc]);

  // Change page
  const paginateFront = () => setCurrentPage(currentPage + 1);
  const paginateBack = () => setCurrentPage(currentPage - 1);

  const handleContactFormModal = () => {
    setIsContactform(!isContactform);
  };

  const handleUserData = (data) => {
    props.setList((prevData) => [data, ...prevData]);
  };

  const handleDelete = async (item) => {
    setIsDeleteModal({});
    setActLoader({ [`${item.objectId}`]: true });
    const clsObj = {
      Contactbook: "contracts_Contactbook",
      Templates: "contracts_Template"
    };
    try {
      const serverUrl = process.env.REACT_APP_SERVERURL
        ? process.env.REACT_APP_SERVERURL
        : window.location.origin + "/api/app";
      const cls = clsObj[props.ReportName] || "contracts_Document";
      const url = serverUrl + `/classes/${cls}/`;
      const body =
        props.ReportName === "Contactbook"
          ? { IsDeleted: true }
          : { IsArchive: true };
      const res = await axios.put(url + item.objectId, body, {
        headers: {
          "Content-Type": "application/json",
          "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
          "X-Parse-Session-Token": localStorage.getItem("accesstoken")
        }
      });
      if (res.data && res.data.updatedAt) {
        setActLoader({});
        setIsAlert(true);
        setAlertMsg({
          type: "success",
          message: "Record deleted successfully!"
        });
        setTimeout(() => setIsAlert(false), 1500);
        const upldatedList = props.List.filter(
          (x) => x.objectId !== item.objectId
        );
        props.setList(upldatedList);
      }
    } catch (err) {
      console.log("err", err);
      setIsAlert(true);
      setAlertMsg({
        type: "danger",
        message: "Something went wrong, Please try again later!"
      });
      setTimeout(() => setIsAlert(false), 1500);
      setActLoader({});
    }
  };
  const handleClose = () => {
    setIsRevoke({});
    setIsDeleteModal({});
    // setIsMakePublic({});
    // setSelectedPublicRole("");
    // setIsPublicProfile({});
    // if (item?.objectId) {
    //   setIsPublic((prevStates) => ({
    //     ...prevStates,
    //     [item.objectId]: !prevStates[item.objectId]
    //   }));
    // }
  };

  const handleShare = (item) => {
    setActLoader({ [item.objectId]: true });
    const host = window.location.origin;
    const sendMail = item?.SendMail || false;
    const getUrl = (x) => {
      //encode this url value `${item.objectId}/${x.Email}/${x.objectId}` to base64 using `btoa` function
      if (x?.signerObjId) {
        const encodeBase64 = btoa(
          `${item.objectId}/${x.signerPtr.Email}/${x.signerPtr.objectId}/${sendMail}`
        );
        return `${host}/login/${encodeBase64}`;
      } else {
        const encodeBase64 = btoa(`${item.objectId}/${x.email}`);
        return `${host}/login/${encodeBase64}`;
      }
    };
    const urls = item?.Placeholders?.map((x) => ({
      email: x.email ? x.email : x.signerPtr.Email,
      url: getUrl(x)
    }));
    setShareUrls(urls);
    setIsShare({ [item.objectId]: true });
  };

  const copytoclipboard = (share) => {
    navigator.clipboard.writeText(share.url);
    setCopied({ ...copied, [share.email]: true });
  };
  //function to handle revoke/decline docment
  const handleRevoke = async (item) => {
    setIsRevoke({});
    setActLoader({ [`${item.objectId}`]: true });
    const data = {
      IsDeclined: true
    };

    await axios
      .put(
        `${localStorage.getItem("baseUrl")}classes/contracts_Document/${
          item.objectId
        }`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
            "X-Parse-Session-Token": localStorage.getItem("accesstoken")
          }
        }
      )
      .then(async (result) => {
        const res = result.data;
        if (res) {
          setActLoader({});
          setIsAlert(true);
          setAlertMsg({
            type: "success",
            message: "Record revoked successfully!"
          });
          setTimeout(() => setIsAlert(false), 1500);
          const upldatedList = props.List.filter(
            (x) => x.objectId !== item.objectId
          );
          props.setList(upldatedList);
        }
      })
      .catch((err) => {
        console.log("err", err);
        setIsAlert(true);
        setAlertMsg({
          type: "danger",
          message: "Something went wrong, Please try again later!"
        });
        setTimeout(() => setIsAlert(false), 1500);
        setActLoader({});
      });
  };

  async function checkTourStatus() {
    const currentUser = Parse.User.current();
    const cloudRes = await Parse.Cloud.run("getUserDetails", {
      email: currentUser.get("email")
    });
    const res = { data: cloudRes.toJSON() };
    if (res.data && res.data.TourStatus && res.data.TourStatus.length > 0) {
      const tourStatus = res.data.TourStatus;
      // console.log("res ", res.data.TourStatus);
      setTourStatusArr(tourStatus);
      const filteredtourStatus = tourStatus.filter(
        (obj) => obj["templateTour"]
      );
      if (filteredtourStatus.length > 0) {
        const templateTour = filteredtourStatus[0]["templateTour"];

        if (templateTour) {
          setIsTour(false);
        } else {
          setIsTour(true);
        }
      } else {
        setIsTour(true);
      }
    } else {
      setIsTour(true);
    }
  }

  const closeTour = async () => {
    // console.log("closeTour");
    setIsTour(false);
    if (props.isDontShow) {
      const serverUrl = localStorage.getItem("baseUrl");
      const appId = localStorage.getItem("parseAppId");
      const extUserClass = localStorage.getItem("extended_class");
      const json = JSON.parse(localStorage.getItem("Extand_Class"));
      const extUserId = json && json.length > 0 && json[0].objectId;
      // console.log("extUserId ", extUserId)

      let updatedTourStatus = [];
      if (tourStatusArr.length > 0) {
        updatedTourStatus = [...tourStatusArr];
        const templateTourIndex = tourStatusArr.findIndex(
          (obj) => obj["templateTour"] === false || obj["templateTour"] === true
        );
        if (templateTourIndex !== -1) {
          updatedTourStatus[templateTourIndex] = { templateTour: true };
        } else {
          updatedTourStatus.push({ templateTour: true });
        }
      } else {
        updatedTourStatus = [{ templateTour: true }];
      }

      await axios.put(
        serverUrl + "classes/" + extUserClass + "/" + extUserId,
        {
          TourStatus: updatedTourStatus
        },
        {
          headers: {
            "X-Parse-Application-Id": appId
          }
        }
      );
    }
  };

  // `handleDownload` is used to get valid doc url available in completed report
  const handleDownload = async (item) => {
    const url = item?.SignedUrl || item?.URL || "";
    if (url) {
      try {
        const signedUrl = await Parse.Cloud.run("getsignedurl", { url: url });
        saveAs(signedUrl);
      } catch (err) {
        console.log("err in getsignedurl", err);
        alert("something went wrong, please try again later.");
      }
    }
  };

  // `handleSubjectChange` is used to add or change subject of resend mail
  const handleSubjectChange = (subject, doc) => {
    const encodeBase64 = userDetails?.objectId
      ? btoa(`${doc.objectId}/${userDetails.Email}/${userDetails.objectId}`)
      : btoa(`${doc.objectId}/${userDetails.Email}`);
    const expireDate = doc.ExpiryDate.iso;
    const newDate = new Date(expireDate);
    const localExpireDate = newDate.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
    const signPdf = `${window.location.origin}/login/${encodeBase64}`;
    const variables = {
      document_title: doc.Name,
      sender_name: doc.ExtUserPtr.Name,
      sender_mail: doc.ExtUserPtr.Email,
      sender_phone: doc.ExtUserPtr?.Phone || "",
      receiver_name: userDetails?.Name,
      receiver_email: userDetails?.Email,
      receiver_phone: userDetails?.Phone || "",
      expiry_date: localExpireDate,
      company_name: doc.ExtUserPtr.Company,
      signing_url: `<a href=${signPdf}>Sign here</a>`
    };
    const res = replaceMailVaribles(subject, "", variables);

    setMail((prev) => ({ ...prev, subject: res.subject }));
  };
  // `handlebodyChange` is used to add or change body of resend mail
  const handlebodyChange = (body, doc) => {
    const encodeBase64 = userDetails?.objectId
      ? btoa(`${doc.objectId}/${userDetails.Email}/${userDetails.objectId}`)
      : btoa(`${doc.objectId}/${userDetails.Email}`);
    const expireDate = doc.ExpiryDate.iso;
    const newDate = new Date(expireDate);
    const localExpireDate = newDate.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
    const signPdf = `${window.location.origin}/login/${encodeBase64}`;
    const variables = {
      document_title: doc.Name,
      sender_name: doc.ExtUserPtr.Name,
      sender_mail: doc.ExtUserPtr.Email,
      sender_phone: doc.ExtUserPtr?.Phone || "",
      receiver_name: userDetails?.Name || "",
      receiver_email: userDetails?.Email || "",
      receiver_phone: userDetails?.Phone || "",
      expiry_date: localExpireDate,
      company_name: doc.ExtUserPtr.Company,
      signing_url: `<a href=${signPdf}>Sign here</a>`
    };
    const res = replaceMailVaribles("", body, variables);

    if (body) {
      setMail((prev) => ({ ...prev, body: res.body }));
    }
  };
  // `handleNextBtn` is used to open edit mail template screen in resend mail modal
  // as well as replace variable with original one
  const handleNextBtn = (user, doc) => {
    const userdata = {
      Name: user?.signerPtr?.Name,
      Email: user.email ? user?.email : user.signerPtr?.Email,
      Phone: user?.signerPtr?.Phone,
      objectId: user?.signerPtr?.objectId
    };
    setUserDetails(userdata);
    const encodeBase64 = user.email
      ? btoa(`${doc.objectId}/${user.email}`)
      : btoa(
          `${doc.objectId}/${user.signerPtr.Email}/${user.signerPtr.objectId}`
        );
    const expireDate = doc.ExpiryDate.iso;
    const newDate = new Date(expireDate);
    const localExpireDate = newDate.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
    const signPdf = `${window.location.origin}/login/${encodeBase64}`;
    const variables = {
      document_title: doc.Name,
      sender_name: doc.ExtUserPtr.Name,
      sender_mail: doc.ExtUserPtr.Email,
      sender_phone: doc.ExtUserPtr?.Phone || "",
      receiver_name: user?.signerPtr?.Name || "",
      receiver_email: user?.email ? user?.email : user?.signerPtr?.Email,
      receiver_phone: user?.signerPtr?.Phone || "",
      expiry_date: localExpireDate,
      company_name: doc?.ExtUserPtr?.Company || "",
      signing_url: `<a href=${signPdf}>Sign here</a>`
    };

    const subject =
      doc?.RequestSubject ||
      `{{sender_name}} has requested you to sign "{{document_title}}"`;
    const body =
      doc?.RequestBody ||
      `<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /></head><body><p>Hi {{receiver_name}},</p><br><p>We hope this email finds you well. {{sender_name}} has requested you to review and sign <b>"{{document_title}}"</b>.</p><p>Your signature is crucial to proceed with the next steps as it signifies your agreement and authorization.</p><br><p>{{signing_url}}</p><br><p>If you have any questions or need further clarification regarding the document or the signing process,  please contact the sender.</p><br><p>Thanks</p><p> Team OpenSign™</p><br></body> </html>`;
    const res = replaceMailVaribles(subject, body, variables);
    setMail((prev) => ({ ...prev, subject: res.subject, body: res.body }));
    setIsNextStep({ [user.Id]: true });
  };
  const handleResendMail = async (e, doc, user) => {
    e.preventDefault();
    setActLoader({ [user?.Id]: true });
    const url = `${localStorage.getItem("baseUrl")}functions/sendmailv3`;
    const headers = {
      "Content-Type": "application/json",
      "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
      sessionToken: localStorage.getItem("accesstoken")
    };
    let params = {
      mailProvider: doc?.ExtUserPtr?.active_mail_adapter,
      extUserId: doc?.ExtUserPtr?.objectId,
      recipient: userDetails?.Email,
      subject: mail.subject,
      from: doc?.ExtUserPtr?.Email,
      html: mail.body
    };
    try {
      const res = await axios.post(url, params, { headers: headers });
      if (res?.data?.result?.status === "success") {
        setIsAlert(true);
        setAlertMsg({ type: "success", message: "Mail sent successfully." });
      } else {
        setIsAlert(true);
        setAlertMsg({
          type: "danger",
          message: "Something went wrong, please try again later!"
        });
      }
    } catch (err) {
      console.log("err in sendmail", err);
      setIsAlert(true);
      setAlertMsg({
        type: "danger",
        message: "Something went wrong, please try again later!"
      });
    } finally {
      setTimeout(() => setIsAlert(false), 1500);
      setIsNextStep({});
      setUserDetails({});
      setActLoader({});
    }
  };
  const fetchUserStatus = (user, doc) => {
    const email = user.email ? user.email : user.signerPtr.Email;
    const audit = doc?.AuditTrail?.find((x) => x.UserPtr.Email === email);

    return (
      <div className="flex flex-row gap-2 justify-center items-center">
        <div className="flex justify-center items-center bg-base-300 text-base-content shadow-md op-card w-[65px] h-[32px] cursor-default">
          {audit?.Activity ? audit?.Activity : "Awaited"}
        </div>

        <button
          onClick={() => handleNextBtn(user, doc)}
          className={
            audit?.Activity !== "Signed"
              ? "op-btn op-btn-primary op-btn-sm"
              : " text-transparent cursor-default pointer-events-none"
          }
          disabled={audit?.Activity === "Signed"}
        >
          {audit?.Activity !== "Signed" && "Resend"}
        </button>
      </div>
    );
  };
  // `handleQuickSendClose` is trigger when bulk send component trigger close event
  const handleQuickSendClose = (status, count) => {
    setIsBulkSend({});
    setIsAlert(true);
    if (status === "success") {
      if (count > 1) {
        setAlertMsg({
          type: "success",
          message: count + " Document sent successfully!"
        });
        setTimeout(() => setIsAlert(false), 1500);
      } else {
        setAlertMsg({
          type: "success",
          message: count + " Document sent successfully!"
        });
        setTimeout(() => setIsAlert(false), 1500);
      }
    } else {
      setAlertMsg({
        type: "danger",
        message: "Something went wrong, Please try again later!"
      });
      setTimeout(() => setIsAlert(false), 1500);
    }
  };

  // `handleBulkSend` is used to open modal as well as fetch template
  // and show Ui on the basis template response
  const handleBulkSend = async (template) => {
    setIsBulkSend({ [template.objectId]: true });
    setIsLoader({ [template.objectId]: true });
    try {
      const params = {
        templateId: template.objectId,
        include: ["Placeholders.signerPtr"]
      };
      const axiosRes = await axios.post(
        `${localStorage.getItem("baseUrl")}functions/getTemplate`,
        params,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
            sessionToken: localStorage.getItem("accesstoken")
          }
        }
      );
      const templateRes = axiosRes.data && axiosRes.data.result;
      setPlaceholders(templateRes?.Placeholders);
      setTemplateDetails(templateRes);
      setIsLoader({});
    } catch (err) {
      console.log("err in fetch template in bulk modal", err);
      setIsBulkSend({});
      setIsAlert(true);
      setAlertMsg({
        type: "danger",
        message: "Something went wrong, Please try again later!"
      });
      setTimeout(() => setIsAlert(false), 1500);
    }
  };

  //function to make template public and set public role
  // const handlePublicTemplate = async (item) => {
  //   if (selectedPublicRole || !isPublic[item.objectId]) {
  //     setActLoader({ [item.objectId]: true });
  //     setIsMakePublic(false);
  //     try {
  //       const res = await Parse.Cloud.run("createpublictemplate", {
  //         templateid: item.objectId,
  //         ispublic: isPublic[item.objectId],
  //         publicrole: [selectedPublicRole]
  //       });

  //       if (res.status === "success") {
  //         setIsAlert(true);
  //         setTimeout(() => setIsAlert(false), 1500);
  //         if (isPublic[item.objectId]) {
  //           setAlertMsg({
  //             type: "success",
  //             message: "You have successfully made the template public."
  //           });
  //           setIsCelebration(true);
  //           setTimeout(() => {
  //             setIsCelebration(false);
  //           }, 5000);
  //           setIsPublicProfile({ [item.objectId]: isPublic[item.objectId] });
  //         } else {
  //           setAlertMsg({
  //             type: "success",
  //             message: "You have successfully made the template private."
  //           });
  //           setSelectedPublicRole("");
  //         }
  //         const updateList = props.List.map((x) =>
  //           x.objectId === item.objectId
  //             ? { ...x, IsPublic: isPublic[item.objectId] }
  //             : x
  //         );
  //         props.setList(updateList);
  //         setActLoader({});
  //       }
  //     } catch (e) {
  //       console.log("error in createpublictemplate", e);
  //       setIsAlert(true);
  //       setAlertMsg({
  //         type: "danger",
  //         message: "Something went wrong, Please try again later!"
  //       });
  //       setTimeout(() => setIsAlert(false), 1500);
  //       setIsPublic((prevStates) => ({
  //         ...prevStates,
  //         [item.objectId]: !prevStates[item.objectId]
  //       }));
  //     }
  //   } else {
  //     setIsAlert(true);
  //     setAlertMsg({
  //       type: "danger",
  //       message: "You need to select a role for the public signers."
  //     });
  //     setTimeout(() => setIsAlert(false), 1500);
  //   }
  // };

  const handleViewSigners = (item) => {
    setIsViewShare({ [item.objectId]: true });
  };
  //function to handle change template status is public or private
  // const handlePublicChange = async (e, item) => {
  //   const getPlaceholder = item?.Placeholders;
  //   //condiiton to check role is exist or not
  //   if (getPlaceholder && getPlaceholder.length > 0) {
  //     const checkIsSignatureExistt = getPlaceholder?.every((placeholderObj) =>
  //       placeholderObj?.placeHolder?.some((holder) =>
  //         holder?.pos?.some((posItem) => posItem?.type === "signature")
  //       )
  //     );
  //     if (checkIsSignatureExistt) {
  //       let extendUser = JSON.parse(localStorage.getItem("Extand_Class"));
  //       const userName = extendUser[0]?.UserName;
  //       setIsPublicUserName(extendUser[0]?.UserName);
  //       //condition to check user have public url or not
  //       if (userName) {
  //         setIsPublic((prevStates) => ({
  //           ...prevStates,
  //           [item.objectId]: e.target.checked
  //         }));
  //         const getPlaceholder = item?.Placeholders;
  //         if (getPlaceholder.length === 1) {
  //           setSelectedPublicRole(getPlaceholder[0]?.Role);
  //         }

  //         setIsMakePublic({ [item.objectId]: true });
  //       } else {
  //         setIsPublicProfile({ [item.objectId]: true });
  //       }
  //     } else {
  //       setIsAlert(true);
  //       setAlertMsg({
  //         type: "danger",
  //         message:
  //           " Please ensure there's at least one signature widget added for all recipients."
  //       });
  //       setTimeout(() => setIsAlert(false), 5000);
  //     }
  //   } else {
  //     setIsAlert(true);
  //     setAlertMsg({
  //       type: "danger",
  //       message: "Please assign at least one role to make this template public."
  //     });
  //     setTimeout(() => setIsAlert(false), 5000);
  //   }
  // };

  //function to copy public profile links
  // const copytoProfileLink = () => {
  //   const url = `https://opensign-me.vercel.app/${publicUserName}`;
  //   copytoData(url);
  //   setIsAlert(true);
  //   setAlertMsg({
  //     type: "success",
  //     message: "Copied."
  //   });
  //   setTimeout(() => setIsAlert(false), 1500);
  // };

  return (
    <div className="relative">
      {Object.keys(actLoader)?.length > 0 && (
        <div className="absolute w-full h-full flex justify-center items-center bg-black bg-opacity-30 z-30">
          <Loader />
        </div>
      )}
      <div className="p-2 w-full bg-base-100 text-base-content op-card shadow-lg">
        {/* {isCelebration && (
          <div className="relative z-[1000]">
            <Confetti width={window.innerWidth} height={window.innerHeight} />
          </div>
        )} */}
        {isAlert && <Alert type={alertMsg.type}>{alertMsg.message}</Alert>}
        {props.tourData && props.ReportName === "Templates" && (
          <Tour
            onRequestClose={closeTour}
            steps={props.tourData}
            isOpen={isTour}
            // rounded={5}
            closeWithMask={false}
          />
        )}
        <div className="flex flex-row items-center justify-between my-2 mx-3 text-[20px] md:text-[23px]">
          <div className="font-light">
            {props.ReportName}{" "}
            {props.report_help && (
              <span className="text-xs md:text-[13px] font-normal">
                <Tooltip message={props.report_help} />
              </span>
            )}
          </div>
          {props.ReportName === "Templates" && (
            <i
              data-tut="reactourFirst"
              onClick={() => navigate("/form/template")}
              className="fa-light fa-square-plus text-accent text-[40px]"
            ></i>
          )}
          {props.form && (
            <div
              className="cursor-pointer"
              onClick={() => handleContactFormModal()}
            >
              <i className="fa-light fa-square-plus text-accent text-[40px]"></i>
            </div>
          )}
        </div>
        <div
          className={`${
            isDashboard && props.List?.length > 0 ? "h-[317px]" : "h-full"
          } overflow-x-auto w-full`}
        >
          <table className="op-table border-collapse w-full">
            <thead className="text-[14px]">
              <tr className="border-y-[1px]">
                {props.heading?.map((item, index) => (
                  <React.Fragment key={index}>
                    <th className="px-4 py-2">{item}</th>
                  </React.Fragment>
                ))}
                {/* {props.ReportName === "Templates" && isEnableSubscription && (
                <th className="px-4 py-2">Public</th>
              )} */}
                {props.actions?.length > 0 && (
                  <th className="px-4 py-2 text-transparent pointer-events-none">
                    Action
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="text-[12px]">
              {props.List?.length > 0 && (
                <>
                  {currentList.map((item, index) =>
                    props.ReportName === "Contactbook" ? (
                      <tr className="border-y-[1px]" key={index}>
                        {props.heading.includes("Sr.No") && (
                          <th className="px-4 py-2">
                            {startIndex + index + 1}
                          </th>
                        )}
                        <td className="px-4 py-2 font-semibold">
                          {item?.Name}{" "}
                        </td>
                        <td className="px-4 py-2 ">{item?.Email || "-"}</td>
                        <td className="px-4 py-2">{item?.Phone || "-"}</td>
                        <td className="px-3 py-2 text-white grid grid-cols-2">
                          {props.actions?.length > 0 &&
                            props.actions.map((act, index) => (
                              <button
                                key={index}
                                onClick={() => handleActionBtn(act, item)}
                                title={act.hoverLabel}
                                className={`${
                                  act?.btnColor ? act.btnColor : ""
                                } op-btn op-btn-sm`}
                              >
                                <i className={act.btnIcon}></i>
                              </button>
                            ))}
                          {isDeleteModal[item.objectId] && (
                            <ModalUi
                              isOpen
                              title={"Delete Contact"}
                              handleClose={handleClose}
                            >
                              <div className="m-[20px]">
                                <div className="text-lg font-normal text-black">
                                  Are you sure you want to delete this contact?
                                </div>
                                <hr className="bg-[#ccc] mt-4 " />
                                <div className="flex items-center mt-3 gap-2 text-white">
                                  <button
                                    onClick={() => handleDelete(item)}
                                    className="op-btn op-btn-primary"
                                  >
                                    Yes
                                  </button>
                                  <button
                                    onClick={handleClose}
                                    className="op-btn op-btn-secondary"
                                  >
                                    No
                                  </button>
                                </div>
                              </div>
                            </ModalUi>
                          )}
                        </td>
                      </tr>
                    ) : (
                      <tr className="border-y-[1px]" key={index}>
                        {props.heading.includes("Sr.No") && (
                          <th className="px-4 py-2">
                            {startIndex + index + 1}
                          </th>
                        )}
                        <td className="px-4 py-2 font-semibold min-w-56 max-w-56">
                          {item?.Name}{" "}
                        </td>
                        {props.heading.includes("Note") && (
                          <td className="px-4 py-2">
                            {item?.Note?.length > 25
                              ? item?.Note?.slice(0, 25) + "..."
                              : item?.Note || "-"}
                          </td>
                        )}
                        {props.heading.includes("Folder") && (
                          <td className="px-4 py-2">
                            {item?.Folder?.Name || "OpenSign™ Drive"}
                          </td>
                        )}
                        <td className="px-4 py-2">
                          <button
                            onClick={() => handleDownload(item)}
                            className="op-link op-link-primary"
                            title={"Download"}
                          >
                            {item?.URL ? "Download" : "-"}
                          </button>
                        </td>
                        <td className="px-4 py-2">
                          {formatRow(item?.ExtUserPtr)}
                        </td>
                        <td className="px-4 py-2">
                          {item?.Placeholders ? (
                            <button
                              onClick={() => handleViewSigners(item)}
                              className="op-link op-link-primary"
                            >
                              View
                            </button>
                          ) : (
                            "-"
                          )}
                        </td>
                        {/* {props.ReportName === "Templates" &&
                        isEnableSubscription && (
                          <td className=" pl-[20px] py-2">
                            {props.ReportName === "Templates" && (
                              <div className="flex flex-row">
                                <label
                                  className={
                                    "cursor-pointer relative inline-flex items-center mb-0"
                                  }
                                >
                                  <input
                                    checked={isPublic?.[item.objectId]}
                                    onChange={(e) =>
                                      handlePublicChange(e, item)
                                    }
                                    type="checkbox"
                                    value=""
                                    className="sr-only peer"
                                  />
                                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-1 peer-focus:ring-black rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-black peer-checked:bg-blue-600"></div>
                                </label>
                              </div>
                            )}
                            {isMakePublic[item.objectId] && (
                              <ModalUi
                                isOpen
                                title={
                                  isPublic[item.objectId]
                                    ? "Make template public"
                                    : "Make template private"
                                }
                                handleClose={() => {
                                  setIsMakePublic({});
                                  setSelectedPublicRole("");
                                  setIsPublic((prevStates) => ({
                                    ...prevStates,
                                    [item.objectId]: !prevStates[item.objectId]
                                  }));
                                }}
                              >
                                <div className="m-[20px]">
                                  <div className="font-normal text-black">
                                    <p className="text-lg">
                                      {isPublic[item.objectId]
                                        ? `Are you sure you want to make this template public ?`
                                        : `Are you sure you want to make this template private ? This will remove it from your public profile ?`}
                                    </p>
                                    {isPublic[item.objectId] && (
                                      <div className="flex mt-2 gap-2 md:items-center">
                                        <p className="text-[15px]">
                                          Public role :{" "}
                                        </p>
                                        {item?.Placeholders?.length > 1 ? (
                                          <select
                                            className="w-[60%] md:w-[70%] border-[1px] border-gray-200 rounded-sm p-[2px]"
                                            name="textvalidate"
                                            value={selectedPublicRole}
                                            onChange={(e) =>
                                              setSelectedPublicRole(
                                                e.target.value
                                              )
                                            }
                                          >
                                            <option
                                              disabled
                                              style={{ fontSize: "13px" }}
                                              value=""
                                            >
                                              Select...
                                            </option>
                                            {item?.Placeholders.map(
                                              (data, ind) => {
                                                return (
                                                  <option
                                                    style={{ fontSize: "13px" }}
                                                    key={ind}
                                                    value={data?.Role}
                                                  >
                                                    {data?.Role}
                                                  </option>
                                                );
                                              }
                                            )}
                                          </select>
                                        ) : (
                                          <div className="w-[60%] md:w-[70%] border-[1px] border-gray-200 rounded-sm p-[2px]">
                                            {item?.Placeholders[0]?.Role}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <hr className="bg-[#ccc] mt-2 " />
                                  <div className="flex items-center mt-3 gap-2 text-white">
                                    <button
                                      onClick={() => handlePublicTemplate(item)}
                                      className="op-btn op-btn-primary"
                                    >
                                      Submit
                                    </button>
                                    <button
                                      onClick={() => handleClose(item)}
                                      className="op-btn op-btn-secondary"
                                    >
                                      No
                                    </button>
                                  </div>
                                </div>
                              </ModalUi>
                            )}
                            {isPublicProfile[item.objectId] && (
                              <ModalUi
                                isOpen
                                title={"Public URL"}
                                handleClose={() => {
                                  setIsPublicProfile({});
                                }}
                                reduceWidth={
                                  "md:min-w-[440px] md:max-w-[400px]"
                                }
                              >
                                <div className="m-[20px]">
                                  {publicUserName ? (
                                    <div className="font-normal text-black">
                                      <p>
                                        Here’s your public URL. Copy or share it
                                        with the signer, and you will be able to
                                        see all your publicly set templates.
                                      </p>
                                      <div className=" flex items-center gap-5 mt-2  p-[2px] w-[75%]">
                                        <span className="font-bold">
                                          Public URL :{" "}
                                        </span>
                                        <span
                                          onClick={() => copytoProfileLink()}
                                          className="underline underline-offset-2 cursor-pointer"
                                        >{`https://opensign.me/${publicUserName}`}</span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="font-normal text-black">
                                      <p>
                                        Please add your public URL, and you will
                                        be able to make a public template.
                                      </p>
                                      <button
                                        className="mt-3 op-btn op-btn-primary"
                                        onClick={() => navigate("/profile")}
                                      >
                                        Add
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </ModalUi>
                            )}
                          </td>
                        )} */}
                        <td className="px-2 py-2">
                          <div className="text-base-content flex flex-row gap-x-2 gap-y-1 justify-start items-center">
                            {props.actions?.length > 0 &&
                              props.actions.map((act, index) => (
                                <div
                                  role="button"
                                  data-tut={act?.selector}
                                  key={index}
                                  onClick={() => handleActionBtn(act, item)}
                                  title={act.hoverLabel}
                                  className={
                                    act.action !== "option"
                                      ? `${
                                          act?.btnColor ? act.btnColor : ""
                                        } op-btn op-btn-sm mr-1`
                                      : "text-base-content focus:outline-none text-lg mr-2 relative"
                                  }
                                >
                                  <i className={act.btnIcon}></i>
                                  {act.btnLabel && (
                                    <span className="uppercase font-medium">
                                      {act.btnLabel}
                                    </span>
                                  )}
                                  {isOption[item.objectId] &&
                                    act.action === "option" && (
                                      <ul className="absolute -right-2 top-6 z-[20] op-dropdown-content op-menu shadow bg-base-100 text-base-content rounded-box ">
                                        {act.subaction?.map((subact) => (
                                          <li
                                            key={subact.btnId}
                                            onClick={() =>
                                              handleActionBtn(subact, item)
                                            }
                                            title={subact.hoverLabel}
                                          >
                                            <span>
                                              <i
                                                className={`${subact.btnIcon} mr-1.5`}
                                              ></i>
                                              {subact.btnLabel && (
                                                <span className="text-[13px] capitalize font-medium">
                                                  {subact.btnLabel}
                                                </span>
                                              )}
                                            </span>
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                </div>
                              ))}
                          </div>
                          {isViewShare[item.objectId] && (
                            <ModalUi
                              isOpen
                              showHeader={
                                props.ReportName === "Templates" && true
                              }
                              title={"Signers"}
                              reduceWidth={"md:max-w-[450px]"}
                              handleClose={() => setIsViewShare({})}
                            >
                              {props.ReportName !== "Templates" && (
                                <div
                                  className="op-btn op-btn-sm op-btn-circle op-btn-ghost text-base-content absolute right-2 top-1 z-40"
                                  onClick={() => setIsViewShare({})}
                                >
                                  ✕
                                </div>
                              )}
                              <table className="op-table w-full overflow-auto">
                                <thead className="h-[38px] sticky top-0 text-base-content text-sm pt-[15px] px-[20px]">
                                  <tr>
                                    {props.ReportName === "Templates" && (
                                      <th className="p-2 pl-3 w-[30%]">
                                        Roles
                                      </th>
                                    )}
                                    <th className="pl-3 py-2">
                                      {props.ReportName === "Templates"
                                        ? "Email"
                                        : "Signers"}
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {item.Placeholders.map((x, i) => (
                                    <tr key={i} className="text-sm font-medium">
                                      {props.ReportName === "Templates" && (
                                        <td className="text-[12px] p-2 pl-3 w-[30%]">
                                          {x.Role && x.Role}
                                        </td>
                                      )}
                                      <td className="pl-3 text-[12px] py-2 break-all">
                                        {x.email
                                          ? x.email
                                          : x?.signerPtr?.Email || "-"}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </ModalUi>
                          )}
                          {isDeleteModal[item.objectId] && (
                            <ModalUi
                              isOpen
                              title={"Delete Document"}
                              handleClose={handleClose}
                            >
                              <div className="m-[20px]">
                                <div className="text-lg font-normal text-black">
                                  Are you sure you want to delete this document?
                                </div>
                                <hr className="bg-[#ccc] mt-4" />
                                <div className="flex items-center mt-3 gap-2 text-white">
                                  <button
                                    onClick={() => handleDelete(item)}
                                    className="op-btn op-btn-primary"
                                  >
                                    Yes
                                  </button>
                                  <button
                                    onClick={handleClose}
                                    className="op-btn op-btn-secondary"
                                  >
                                    No
                                  </button>
                                </div>
                              </div>
                            </ModalUi>
                          )}
                          {isBulkSend[item.objectId] && (
                            <ModalUi
                              isOpen
                              title={"Quick send"}
                              handleClose={() => setIsBulkSend({})}
                            >
                              {isLoader[item.objectId] ? (
                                <div className="w-full h-[100px] flex justify-center items-center bg-opacity-30 z-30">
                                  <Loader />
                                </div>
                              ) : (
                                <BulkSendUi
                                  Placeholders={placeholders}
                                  item={templateDeatils}
                                  handleClose={handleQuickSendClose}
                                />
                              )}
                            </ModalUi>
                          )}
                          {isShare[item.objectId] && (
                            <ModalUi
                              isOpen
                              title={"Copy link"}
                              handleClose={() => {
                                setIsShare({});
                                setActLoader({});
                                setCopied(false);
                              }}
                            >
                              <div className="m-[20px]">
                                {shareUrls.map((share, i) => (
                                  <div
                                    key={i}
                                    className="text-sm font-normal text-black flex my-2 justify-between items-center"
                                  >
                                    <span className="w-[180px] md:w-[300px] whitespace-nowrap overflow-hidden text-ellipsis   text-sm font-semibold">
                                      {share.email}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <RWebShare
                                        data={{
                                          url: share.url,
                                          title: "Sign url"
                                        }}
                                      >
                                        <button className="op-btn op-btn-primary op-btn-outline op-btn-xs md:op-btn-sm ">
                                          <i className="fa-light fa-share-from-square"></i>{" "}
                                          Share
                                        </button>
                                      </RWebShare>
                                      <button
                                        className="op-btn op-btn-primary op-btn-outline op-btn-xs md:op-btn-sm"
                                        onClick={() => copytoclipboard(share)}
                                      >
                                        <i className="fa-light fa-link"></i>{" "}
                                        {copied[share.email]
                                          ? "Copied"
                                          : "Copy"}
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </ModalUi>
                          )}
                          {isRevoke[item.objectId] && (
                            <ModalUi
                              isOpen
                              title={"Revoke document"}
                              handleClose={handleClose}
                            >
                              <div className="m-[20px]">
                                <div className="text-lg font-normal text-black">
                                  Are you sure you want to revoke this document?
                                </div>
                                <hr className="bg-[#ccc] mt-4" />
                                <div className="flex items-center mt-3 gap-2">
                                  <button
                                    onClick={() => handleRevoke(item)}
                                    className="op-btn op-btn-primary"
                                  >
                                    Yes
                                  </button>
                                  <button
                                    onClick={handleClose}
                                    className="op-btn op-btn-secondary"
                                  >
                                    No
                                  </button>
                                </div>
                              </div>
                            </ModalUi>
                          )}
                          {isResendMail[item.objectId] && (
                            <ModalUi
                              isOpen
                              title={"Resend Mail"}
                              handleClose={() => {
                                setIsResendMail({});
                                setIsNextStep({});
                                setUserDetails({});
                              }}
                            >
                              <div className=" overflow-y-auto max-h-[340px] md:max-h-[400px]">
                                {item?.Placeholders?.map((user) => (
                                  <React.Fragment key={user.Id}>
                                    {isNextStep[user.Id] && (
                                      <div className="relative ">
                                        {actLoader[user.Id] && (
                                          <div className="absolute w-full h-full flex justify-center items-center bg-black bg-opacity-30 z-30">
                                            <Loader />
                                          </div>
                                        )}
                                        <form
                                          onSubmit={(e) =>
                                            handleResendMail(e, item, user)
                                          }
                                          className="w-full flex flex-col gap-2 p-3 text-base-content relative"
                                        >
                                          <div className="absolute right-5 text-xs z-40">
                                            <Tooltip
                                              id={`${user.Id}_help`}
                                              message={
                                                "You can use following variables which will get replaced with their actual values:- {{document_title}}, {{sender_name}}, {{sender_mail}}, {{sender_phone}}, {{receiver_name}}, {{receiver_email}}, {{receiver_phone}}, {{expiry_date}}, {{company_name}}, {{signing_url}}."
                                              }
                                            />
                                          </div>
                                          <div>
                                            <label
                                              className="text-xs ml-1"
                                              htmlFor="mailsubject"
                                            >
                                              Subject{" "}
                                            </label>
                                            <input
                                              id="mailsubject"
                                              className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                                              value={mail.subject}
                                              onChange={(e) =>
                                                handleSubjectChange(
                                                  e.target.value,
                                                  item
                                                )
                                              }
                                              required
                                            />
                                          </div>
                                          <div>
                                            <label
                                              className="text-xs ml-1"
                                              htmlFor="mailbody"
                                            >
                                              Body{" "}
                                            </label>
                                            <EditorToolbar containerId="toolbar1" />
                                            <ReactQuill
                                              id="mailbody"
                                              theme="snow"
                                              value={mail.body || ""}
                                              placeholder="add body of email "
                                              modules={module1}
                                              formats={formats}
                                              onChange={(value) =>
                                                handlebodyChange(value, item)
                                              }
                                            />
                                          </div>
                                          <button
                                            type="submit"
                                            className="op-btn op-btn-primary"
                                          >
                                            Resend
                                          </button>
                                        </form>
                                      </div>
                                    )}
                                    {Object?.keys(isNextStep) <= 0 && (
                                      <div className="flex justify-between items-center gap-2 my-2 px-3">
                                        <div className="text-black">
                                          {user?.signerPtr?.Name || "-"}{" "}
                                          {`<${
                                            user?.email
                                              ? user.email
                                              : user.signerPtr.Email
                                          }>`}
                                        </div>
                                        <>{fetchUserStatus(user, item)}</>
                                      </div>
                                    )}
                                  </React.Fragment>
                                ))}
                              </div>
                            </ModalUi>
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
        <div className="op-join flex flex-wrap items-center p-2">
          {props.List.length > props.docPerPage && (
            <button
              onClick={() => paginateBack()}
              className="op-join-item op-btn op-btn-sm"
            >
              Prev
            </button>
          )}
          {pageNumbers.map((x, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(x)}
              disabled={x === "..."}
              className={`${
                x === currentPage ? "op-btn-active" : ""
              } op-join-item op-btn op-btn-sm`}
            >
              {x}
            </button>
          ))}
          {props.List.length > props.docPerPage && (
            <button
              onClick={() => paginateFront()}
              className="op-join-item op-btn op-btn-sm"
            >
              Next
            </button>
          )}
        </div>
        {props.List?.length <= 0 && (
          <div
            className={`${
              isDashboard ? "h-[317px]" : ""
            } flex flex-col items-center justify-center w-ful bg-base-100 text-base-content rounded-xl py-4`}
          >
            <div className="w-[60px] h-[60px] overflow-hidden">
              <img
                className="w-full h-full object-contain"
                src={pad}
                alt="img"
              />
            </div>
            <div className="text-sm font-semibold">No Data Available</div>
          </div>
        )}
        <ModalUi
          title={"Add Contact"}
          isOpen={isContactform}
          handleClose={handleContactFormModal}
        >
          <AddSigner
            handleUserData={handleUserData}
            closePopup={handleContactFormModal}
          />
        </ModalUi>
      </div>
    </div>
  );
};

export default ReportTable;
