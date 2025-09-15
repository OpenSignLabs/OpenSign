import React, { useState, useEffect, useRef } from "react";
import pad from "../../assets/images/pad.svg";
import { useLocation, useNavigate } from "react-router";
import axios from "axios";
import ModalUi from "../../primitives/ModalUi";
import Alert from "../../primitives/Alert";
import Tooltip from "../../primitives/Tooltip";
import ShareButton from "../../primitives/ShareButton";
import Tour from "../../primitives/Tour";
import Parse from "parse";
import {
  copytoData,
  fetchUrl,
  getSignedUrl,
  getTenantDetails,
  handleSignatureType,
  replaceMailVaribles,
  signatureTypes,
  openInNewTab,
  createDocument,
  defaultMailBody,
  defaultMailSubject
} from "../../constant/Utils";
import EditorToolbar, {
  module1,
  formats
} from "../../components/pdf/EditorToolbar";
import ReactQuill from "react-quill-new";
import "../../styles/quill.css";
import BulkSendUi from "../../components/BulkSendUi";
import Loader from "../../primitives/Loader";
import { serverUrl_fn } from "../../constant/appinfo";
import { useTranslation } from "react-i18next";
import { useElSize } from "../../hook/useElSize";
import LottieWithLoader from "../../primitives/DotLottieReact";
import PrefillWidgetModal from "../../components/pdf/PrefillWidgetsModal";
import * as utils from "../../utils";
import { useSelector } from "react-redux";
import { RenderReportCell } from "../../primitives/RenderReportCell";
import CustomizeMail from "../../components/pdf/CustomizeMail";

const TemplatesReport = (props) => {
  const copyUrlRef = useRef(null);
  const titleRef = useRef(null);
  const journey = "Use Template";
  const titleElement = useElSize(titleRef);
  const prefillImg = useSelector((state) => state.widget.prefillImg);
  const appName =
    "OpenSign™";
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard =
    location?.pathname === "/dashboard/35KBoSgoAK" ? true : false;
  const [currentPage, setCurrentPage] = useState(1);
  const [actLoader, setActLoader] = useState({});
  const [isDeleteModal, setIsDeleteModal] = useState({});
  const [isShare, setIsShare] = useState({});
  const [shareUrls, setShareUrls] = useState([]);
  const [copied, setCopied] = useState(false);
  const [isOption, setIsOption] = useState({});
  const [alertMsg, setAlertMsg] = useState({ type: "success", message: "" });
  const [isTour, setIsTour] = useState(false);
  const [tourStatusArr, setTourStatusArr] = useState([]);
  const [isResendMail, setIsResendMail] = useState({});
  const [mail, setMail] = useState({ subject: "", body: "" });
  const [userDetails, setUserDetails] = useState({});
  const [isNextStep, setIsNextStep] = useState({});
  const [isBulkSend, setIsBulkSend] = useState({});
  const [templateDeatils, setTemplateDetails] = useState({});
  const [placeholders, setPlaceholders] = useState([]);
  const [isLoader, setIsLoader] = useState({});
  const [isShareWith, setIsShareWith] = useState({});
  const [selectedTeam, setSelectedTeam] = useState([]);
  const [isModal, setIsModal] = useState({});
  const [signatureType, setSignatureType] = useState([]);
  const Extand_Class = localStorage.getItem("Extand_Class");
  const extClass = Extand_Class && JSON.parse(Extand_Class);
  const [renameDoc, setRenameDoc] = useState("");
  const [forms, setForms] = useState([]);
  const [xyPosition, setXyPosition] = useState([]);
  const [signerList, setSignerList] = useState([]);
  const [mailStatus, setMailStatus] = useState("");
  const [isSend, setIsSend] = useState(false);
  const [documentId, setDocumentId] = useState("");
  const [isNewContact, setIsNewContact] = useState({ status: false, id: "" });
  const [isPrefillModal, setIsPrefillModal] = useState({});
  const [isSubmit, setIsSubmit] = useState(false);
  const startIndex = (currentPage - 1) * props.docPerPage;
  const { isMoreDocs, setIsNextRecord } = props;
  const [isMailModal, setIsMailModal] = useState(false);
  const [customizeMail, setCustomizeMail] = useState({ body: "", subject: "" });
  const [defaultMail, setDefaultMail] = useState({ body: "", subject: "" });
  const [currUserId, setCurrUserId] = useState(false);
  const [documentDetails, setDocumentDetails] = useState();
  const [error, setError] = useState("");

  useEffect(() => {
    if (props.isSearchResult) {
      setCurrentPage(1);
    }
  }, [props.isSearchResult]);

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
  const showAlert = (type, message, time = 1500) => {
    setAlertMsg({ type: type, message: message });
    setTimeout(() => setAlertMsg({ type: "", message: "" }), time);
  };
  const pageNumbers = getPaginationRange();
  //  below useEffect reset currenpage to 1 if user change route
  useEffect(() => {
    checkTourStatus();
    fetchTeamList();
    return () => setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // `fetchTeamList` is used to fetch team list for share with functionality
  const fetchTeamList = async () => {
    try {
      const extUser = JSON.parse(localStorage.getItem("Extand_Class"))?.[0];
      if (extUser?.OrganizationId?.objectId) {
        const teamtRes = await Parse.Cloud.run("getteams", { active: true });
        if (teamtRes.length > 0) {
          const _teamRes = JSON.parse(JSON.stringify(teamtRes));
            const selected = _teamRes.map(
              (x) =>
                x.Name === "All Users" && {
                  label: x.Name,
                  value: x.objectId
                }
            );
            setSelectedTeam(selected);
        }
      }
    } catch (err) {
      console.log("Err in fetch top level teamlist", err);
    }
  };
  // below useEffect is used to render next record if IsMoreDoc is true
  // second last value of pageNumber array is same as currentPage
  useEffect(() => {
    if (isMoreDocs && pageNumbers[pageNumbers.length - 1] === currentPage) {
      setIsNextRecord(true);
    }
  }, [isMoreDocs, pageNumbers, currentPage, setIsNextRecord]);

  //function to fetch tenant Details
  const fetchTenantDetails = async () => {
    const user = JSON.parse(
      localStorage.getItem(
        `Parse/${localStorage.getItem("parseAppId")}/currentUser`
      )
    );
    if (user) {
      try {
        const tenantDetails = await getTenantDetails(user?.objectId);
        if (tenantDetails && tenantDetails === "user does not exist!") {
          alert(t("user-not-exist"));
        } else if (tenantDetails) {
          const signatureType = tenantDetails?.SignatureType || [];
          const filterSignTypes = signatureType?.filter(
            (x) => x.enabled === true
          );
          return filterSignTypes;
        }
      } catch (e) {
        alert(t("user-not-exist"));
      }
    } else {
      alert(t("user-not-exist"));
    }
  };

  // `handleURL` is used to open microapp
  const handleURL = async (item, act) => {
    if (act.hoverLabel === "Edit") {
        navigate(`/${act.redirectUrl}/${item.objectId}`);
    } else {
      // handle Use template
      const placeholder = item?.Placeholders;
      const isRoleExist = placeholder.filter((x) => x.Role !== "prefill");
      //condition to check atleast one role is present for use template
      if (isRoleExist && isRoleExist?.length > 0) {
        const checkIsSignatureExist = isRoleExist?.every((placeholderObj) =>
          placeholderObj?.placeHolder?.some((holder) =>
            holder?.pos?.some((posItem) => posItem?.type === "signature")
          )
        );
        if (checkIsSignatureExist) {
          setActLoader({ [`${item.objectId}_${act.btnId}`]: true });
          const templateDeatils = await fetchTemplate(item.objectId);
          const templateData =
            templateDeatils.data && templateDeatils.data.result;
          if (!templateData.error) {
            setXyPosition(templateData?.Placeholders);
            const signer = utils.handleSignersList(templateData);
            setSignerList(signer);
            setTemplateDetails(templateData);
            //this function is used to open modal to show signers list
            await utils?.handleDisplaySignerList(
              item?.Placeholders,
              item?.Signers,
              setForms
            );
            setIsPrefillModal({ [item.objectId]: true });
          } else {
            showAlert("danger", t("something-went-wrong-mssg"));
            setActLoader({});
          }
        } else {
          showAlert("danger", t("quick-send-alert-2"));
        }
      } else {
        showAlert("danger", t("add-role-alert"));
      }
    }
  };

  const fetchTemplate = async (templateId) => {
    try {
      const params = {
        templateId: templateId,
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
      if (axiosRes) {
        return axiosRes;
      }
    } catch (e) {
      console.log("Error to fetch template in report", e);
      showAlert("danger", t("something-went-wrong-mssg"));
      setActLoader({});
    }
  };
  //function is called when there ther no any prefill role widget exist then create direct document and navigate
  const navigatePageToDoc = async (templateRes, placeholder, signer) => {
    setIsPrefillModal({});
    const res = await createDocument(
      [templateRes || templateDeatils],
      placeholder || xyPosition,
      signer || signerList,
      templateRes?.URL || templateDeatils?.URL
    );
    if (res.status === "success") {
      navigate(`/placeHolderSign/${res.id}`, {
        state: { title: "Use Template" }
      });
    } else {
      alert(t("something-went-wrong-mssg"));
    }
  };

  const handleActionBtn = async (act, item) => {
    setIsTour(false);
    if (act.action === "redirect") {
      handleURL(item, act);
    } else if (act.action === "delete") {
      setIsDeleteModal({ [item.objectId]: true });
    } else if (act.action === "share") {
      handleShare(item);
    } else if (act.action === "option") {
      setIsOption({ [item.objectId]: !isOption[item.objectId] });
    } else if (act.action === "resend") {
      setIsResendMail({ [item.objectId]: true });
    } else if (act.action === "bulksend") {
      handleBulkSend(item);
    } else if (act.action === "sharewithteam") {
      if (item?.SharedWith && item?.SharedWith.length > 0) {
        // below code is used to get existing sharewith teams and formated them as per react-select
        const formatedList = item?.SharedWith.map((x) => ({
          label: x.Name,
          value: x.objectId
        }));
        setSelectedTeam(formatedList);
      }
      setIsShareWith({ [item.objectId]: true });
    }
    else if (act.action === "duplicate") {
      const isPrefill = item?.Placeholders?.some((p) => p?.Role === "prefill");
      setError(isPrefill ? t("duplicate-template-error") : "");
      setIsModal({ [`duplicate_${item.objectId}`]: true });
    } else if (act.action === "rename") {
      setIsModal({ [`rename_${item.objectId}`]: true });
    } else if (act.action === "edit") {
      setIsModal({ [`edit_${item.objectId}`]: true });
    } else if (act.action === "saveastemplate") {
      setIsModal({ [`saveastemplate_${item.objectId}`]: true });
    } else if (act.action === "extendexpiry") {
      setIsModal({ [`extendexpiry_${item.objectId}`]: true });
    }
  };
  // Get current list
  const indexOfLastDoc = currentPage * props.docPerPage;
  const indexOfFirstDoc = indexOfLastDoc - props.docPerPage;
  const sortedList = props.List;
  const currentList = sortedList?.slice(indexOfFirstDoc, indexOfLastDoc);

  // Change page
  const paginateFront = () => {
    const lastValue = pageNumbers?.[pageNumbers?.length - 1];
    if (currentPage < lastValue) {
      setCurrentPage(currentPage + 1);
    }
  };

  const paginateBack = () => {
    if (startIndex > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleDelete = async (item) => {
    setIsDeleteModal({});
    setActLoader({ [`${item.objectId}`]: true });
    try {
      const serverUrl = serverUrl_fn();
      const cls = "contracts_Template";
      const url = serverUrl + `/classes/${cls}/`;
      const body = { IsArchive: true };
      const res = await axios.put(url + item.objectId, body, {
        headers: {
          "Content-Type": "application/json",
          "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
          "X-Parse-Session-Token": localStorage.getItem("accesstoken")
        }
      });
      if (res.data && res.data.updatedAt) {
        setActLoader({});
        showAlert("success", t("record-delete-alert"));
        const upldatedList = props.List.filter(
          (x) => x.objectId !== item.objectId
        );
        props.setList(upldatedList);
      }
    } catch (err) {
      console.log("err", err);
      showAlert("danger", t("something-went-wrong-mssg"));
      setActLoader({});
    }
  };
  const handleClose = (
  ) => {
    setIsDeleteModal({});
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
    const removePrefill = item?.Placeholders.filter(
      (data) => data?.Role !== "prefill"
    );
    const urls = removePrefill?.map((x) => ({
      email: x.email ? x.email : x.signerPtr.Email,
      url: getUrl(x)
    }));
    setShareUrls(urls);
    setIsShare({ [item.objectId]: true });
  };

  const copytoclipboard = (text) => {
    copytoData(text);
    if (copyUrlRef.current) {
      copyUrlRef.current.textContent = text; // Update text safely
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500); // Reset copied state after 1.5 seconds
  };
  const copybtn = (text, email) => {
    copytoData(text);
    if (copyUrlRef.current) {
      copyUrlRef.current.textContent = text; // Update text safely
    }
    setCopied({ [email]: true });
  };

  async function checkTourStatus() {
    const cloudRes = await Parse.Cloud.run("getUserDetails");
    if (cloudRes) {
      const extUser = JSON.parse(JSON.stringify(cloudRes));
      localStorage.setItem("Extand_Class", JSON.stringify([extUser]));
      const tourStatus = extUser?.TourStatus || [];
      setTourStatusArr(tourStatus);
      const tour =
        tourStatus?.find((obj) => obj.templateReport)?.templateReport || false;
      setIsTour(!tour);
    } else {
      setIsTour(true);
    }
  }

  const closeTour = async () => {
    setIsTour(false);
    const isTourSaved =
      tourStatusArr?.some((obj) => obj.templateReport) || false;
    if (!isTourSaved) {
      const serverUrl = localStorage.getItem("baseUrl");
      const appId = localStorage.getItem("parseAppId");
      const json = JSON.parse(localStorage.getItem("Extand_Class"));
      const extUserId = json && json.length > 0 && json[0].objectId;
      let updatedTourStatus = [];
      if (tourStatusArr.length > 0) {
        updatedTourStatus = [...tourStatusArr];
        const templateReportIndex = tourStatusArr.findIndex(
          (obj) =>
            obj["templateReport"] === false || obj["templateReport"] === true
        );
        if (templateReportIndex !== -1) {
          updatedTourStatus[templateReportIndex] = { templateReport: true };
        } else {
          updatedTourStatus.push({ templateReport: true });
        }
      } else {
        updatedTourStatus = [{ templateReport: true }];
      }

      await axios.put(
        serverUrl + "classes/contracts_Users/" + extUserId,
        { TourStatus: updatedTourStatus },
        { headers: { "X-Parse-Application-Id": appId } }
      );
    }
  };

  // `handleDownload` is used to get valid doc url available in completed report
  const handleDownload = async (item) => {
    setActLoader({ [`${item.objectId}`]: true });
    const url = item?.SignedUrl || item?.URL || "";
    const pdfName =
      item?.Name?.length > 100
        ? item?.Name?.slice(0, 100)
        : item?.Name || "template";
    const templateId = item.objectId;
    const isCompleted = item?.IsCompleted || false;
    const formatId = item?.ExtUserPtr?.DownloadFilenameFormat;
    const docName = utils?.buildDownloadFilename(formatId, {
      docName: pdfName,
      email: item?.ExtUserPtr?.Email,
      isSigned: isCompleted
    });
    if (url) {
      try {
        const signedUrl = await getSignedUrl(
          url,
          "", //docId
          templateId
        );
        await fetchUrl(signedUrl, docName);

        setActLoader({});
      } catch (err) {
        console.log("err in getsignedurl", err);
        alert(t("something-went-wrong-mssg"));
        setActLoader({});
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
      note: doc?.Note || "",
      sender_name:
        doc.ExtUserPtr.Name,
      sender_mail:
        doc.ExtUserPtr.Email,
      sender_phone: doc.ExtUserPtr?.Phone || "",
      receiver_name: userDetails?.Name || "",
      receiver_email: userDetails?.Email,
      receiver_phone: userDetails?.Phone || "",
      expiry_date: localExpireDate,
      company_name: doc.ExtUserPtr.Company,
      signing_url: signPdf
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
      note: doc?.Note || "",
      sender_name:
        doc.ExtUserPtr.Name,
      sender_mail:
        doc.ExtUserPtr.Email,
      sender_phone: doc.ExtUserPtr?.Phone || "",
      receiver_name: userDetails?.Name || "",
      receiver_email: userDetails?.Email || "",
      receiver_phone: userDetails?.Phone || "",
      expiry_date: localExpireDate,
      company_name: doc.ExtUserPtr.Company,
      signing_url: signPdf
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
      note: doc?.Note || "",
      sender_name:
        doc.ExtUserPtr.Name,
      sender_mail:
        doc.ExtUserPtr.Email,
      sender_phone: doc.ExtUserPtr?.Phone || "",
      receiver_name: user?.signerPtr?.Name || "",
      receiver_email: user?.email ? user?.email : user?.signerPtr?.Email,
      receiver_phone: user?.signerPtr?.Phone || "",
      expiry_date: localExpireDate,
      company_name: doc?.ExtUserPtr?.Company || "",
      signing_url: signPdf
    };
    const subject =
      doc?.RequestSubject ||
      doc?.ExtUserPtr?.TenantId?.RequestSubject ||
      `{{sender_name}} has requested you to sign "{{document_title}}"`;
    const body =
      doc?.RequestBody ||
      doc?.ExtUserPtr?.TenantId?.RequestBody ||
      `<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /></head><body><p>Hi {{receiver_name}},</p><br><p>We hope this email finds you well. {{sender_name}} has requested you to review and sign <b>"{{document_title}}"</b>.</p><p>Your signature is crucial to proceed with the next steps as it signifies your agreement and authorization.</p><br><p><a href='{{signing_url}}' rel='noopener noreferrer' target='_blank'>Sign here</a></p><br><br><p>If you have any questions or need further clarification regarding the document or the signing process,  please contact the sender.</p><br><p>Thanks</p><p> Team ${appName}</p><br></body> </html>`;
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
      replyto:
        doc?.ExtUserPtr?.Email ||
        "",
      extUserId: doc?.ExtUserPtr?.objectId,
      recipient: userDetails?.Email,
      subject: mail.subject,
      from:
        doc?.ExtUserPtr?.Email,
      html: mail.body
    };
    try {
      const res = await axios.post(url, params, { headers: headers });
      if (res?.data?.result?.status === "success") {
        showAlert("success", t("mail-sent-alert"));
        setIsResendMail({});
      }
      else {
        showAlert("danger", t("something-went-wrong-mssg"));
      }
    } catch (err) {
      console.log("err in sendmail", err);
      showAlert("danger", t("something-went-wrong-mssg"));
    } finally {
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
    if (status === "success") {
      showAlert("success", count + " " + t("document-sent-alert"));
    } else {
      showAlert("danger", t("something-went-wrong-mssg"));
    }
  };

  // `handleBulkSend` is used to open modal as well as fetch template
  // and show Ui on the basis template response handleBulkSendTemplate
  const handleBulkSend = async (template) => {
    const isPrefillExist = template?.Placeholders.some(
      (x) => x.Role === "prefill"
    );
    if (isPrefillExist) {
      showAlert("danger", t("prefill-bulk-error"));
    } else {
      setIsBulkSend({ [template.objectId]: true });
      setIsLoader({ [template.objectId]: true });
      try {
        const axiosRes = await fetchTemplate(template.objectId);
        const templateRes = axiosRes.data && axiosRes.data.result;
        const tenantSignTypes = await fetchTenantDetails();
        const docSignTypes = templateRes?.SignatureType || signatureTypes;
        const updatedSignatureType = await handleSignatureType(
          tenantSignTypes,
          docSignTypes
        );
        setSignatureType(updatedSignatureType);
        setPlaceholders(templateRes?.Placeholders);
        setTemplateDetails(templateRes);
        setIsLoader({});
      } catch (err) {
        console.log("err in fetch template in bulk modal", err);
        setIsBulkSend({});
        showAlert("danger", t("something-went-wrong-mssg"));
      }
    }
  };

  // `handleShareWith` is used to save teams in sharedWith field
  const handleShareWith = async (e, template) => {
    e.preventDefault();
    e.stopPropagation();
    setIsShareWith({});
    setActLoader({ [template.objectId]: true });
    try {
      const templateCls = new Parse.Object("contracts_Template");
      templateCls.id = template.objectId;
      const teamArr = selectedTeam.map((x) => ({
        __type: "Pointer",
        className: "contracts_Teams",
        objectId: x.value
      }));
      templateCls.set("SharedWith", teamArr);
      const res = await templateCls.save();
      if (res) {
        showAlert("success", t("template-share-alert"));
      }
    } catch (err) {
      showAlert("danger", t("something-went-wrong-mssg"));
    } finally {
      setActLoader({});
    }
  };

  // `handleCreateDuplicate` is used to create duplicate from current entry using objectId
  const handleCreateDuplicate = async (item) => {
    setActLoader({ [item.objectId]: true });
    setIsModal({});
    try {
      const duplicateRes = await Parse.Cloud.run("createduplicate", {
        templateId: item.objectId
      });
      if (duplicateRes) {
        const newTemplate = JSON.parse(JSON.stringify(duplicateRes));
        props.setList((prevData) => [newTemplate, ...prevData]);
        showAlert("success", t("duplicate-template-created"));
      }
    } catch (err) {
      showAlert("danger", t("something-went-wrong-mssg"));
      console.log("Err while create duplicate template", err);
    } finally {
      setActLoader({});
    }
  };
  // `handleRenameDoc` is used to update document name
  const handleRenameDoc = async (item) => {
    setActLoader({ [item.objectId]: true });
    setIsModal({});
    const className = "contracts_Template";

    try {
      const query = new Parse.Query(className);
      const docObj = await query.get(item.objectId);
      docObj.set("Name", renameDoc);
      await docObj.save();
      //update report list data
      const updateList = props.List.map((x) =>
        x.objectId === item.objectId ? { ...x, Name: renameDoc } : x
      );
      props.setList(updateList);
      setActLoader({});
      showAlert("success", "Document updated", 2000);
    } catch (err) {
      showAlert("danger", t("something-went-wrong-mssg"), 2000);
      setActLoader({});
    }
  };

  const handleCloseModal = () => {
    setIsModal({});
  };

  const handleResendClose = () => {
    setIsResendMail({});
    setIsNextStep({});
    setUserDetails({});
  };

  // `handleAddUser` is used to adduserAdd commentMore actions
  const handleAddUser = (data, id) => {
    const signerPtr = {
      __type: "Pointer",
      className: "contracts_Contactbook",
      objectId: data.objectId
    };
    const updatePlaceHolder = xyPosition.map((x) => {
      if (x.signerObjId === id || x.Id === id) {
        return { ...x, signerPtr: signerPtr, signerObjId: data.objectId };
      }
      return { ...x };
    });
    setXyPosition(updatePlaceHolder);
    const updateSigner = signerList.map((y) => {
      //condition is used to updated signer's email
      if (y.objectId === id) {
        return data;
      }
      //condition is used to add new signer's mail to role
      else if (y.Id === id) {
        return { ...y, ...data, className: "contracts_Contactbook" };
      }
      return { ...y };
    });
    setSignerList(updateSigner);

    //condition when there are any new signer add then save that signer in dropdown option
    if (isNewContact.status) {
      let newForm = [...forms];
      const label = `${data.Name}<${data.Email}>`;
      const index = newForm.findIndex((x) => x.value === id);
      newForm[index].label = label;
      newForm[index].value = id;
      setForms(newForm);
    }
  };
  const handleClosePrefillModal = () => {
    setIsPrefillModal(false);
    setActLoader({});
    setForms([]);
    setXyPosition([]);
  };
  //`handlePrefillWidgetCreateDoc` is used to embed prefill all widgets on document, create document, and send document
  const handlePrefillWidgetCreateDoc = async () => {
    setIsSubmit(true);
    const scale = 1;
    const res = await utils?.handleCheckPrefillCreateDoc(
      xyPosition,
      signerList,
      setIsPrefillModal,
      scale,
      templateDeatils?.URL,
      [templateDeatils],
      prefillImg,
      extClass?.[0]?.UserId?.objectId,
    );
    if (res?.status === "unfilled") {
      const emptyWidget = res?.emptyResponseObjects
        .map((item) => `[ ${item.options.name}]`)
        .join(", ");
      const timeInMiliSec = 6000;
      showAlert(
        "danger",
        t("prefill-unfilled-widget", { emptyWidget: emptyWidget }),
        timeInMiliSec
      );
    } else if (res?.status === "unattach signer") {
      showAlert("danger", "please attach all role to signer");
    } else if (res?.status === "success") {
      setDocumentId(res.id);
      setActLoader({});
      setIsMailModal(true);
      const user = JSON.parse(
        localStorage.getItem(
          `Parse/${localStorage.getItem("parseAppId")}/currentUser`
        )
      );
      if (user) {
        try {
          const tenantDetails = await getTenantDetails(user?.objectId);
          if (tenantDetails && tenantDetails === "user does not exist!") {
            alert(t("user-not-exist"));
          } else if (tenantDetails) {
            //condition to check tenant have some already set any email template
            if (tenantDetails?.RequestBody) {
              //customize mail state is handle to when user want to customize already set tenant email format then use that format
              setCustomizeMail({
                subject: tenantDetails?.RequestSubject,
                body: tenantDetails?.RequestBody
              });
              setDefaultMail({
                subject: tenantDetails?.RequestSubject,
                body: tenantDetails?.RequestBody
              });
            } else {
              const defaultRequestBody = defaultMailBody;
              const defaultSubject = defaultMailSubject;
              setCustomizeMail({
                subject: defaultSubject,
                body: defaultRequestBody
              });
              setDefaultMail({
                subject: defaultSubject,
                body: defaultRequestBody
              });
            }
          }
        } catch (e) {
          alert(t("user-not-exist"));
        }
      } else {
        alert(t("user-not-exist"));
      }
    }
    setIsSubmit(false);
  };
  //function show signer list and share link to share signUrl
  const handleShareList = () => {
    const shareLinkList = [];
    let signerMail = signerList;
    for (let i = 0; i < signerMail.length; i++) {
      const objectId = signerMail[i].objectId;
      const hostUrl = window.location.origin;
      const sendMail = false;
      //encode this url value `${documentId}/${signerMail[i].Email}/${objectId}` to base64 using `btoa` function
      const encodeBase64 = btoa(
        `${documentId}/${signerMail[i].Email}/${objectId}/${sendMail}`
      );
      let signPdf = `${hostUrl}/login/${encodeBase64}`;
      shareLinkList.push({ signerEmail: signerMail[i].Email, url: signPdf });
    }
    return shareLinkList.map((data, ind) => {
      return (
        <div
          className="flex flex-row justify-between items-center mb-1"
          key={ind}
        >
          {copied && <Alert type="success">{t("copied")}</Alert>}
          <span className="w-[220px] md:w-[300px] whitespace-nowrap overflow-hidden text-ellipsis  ">
            {data.signerEmail}
          </span>
          <div className="flex flex-row items-center gap-3 ">
            <button
              onClick={() => copytoclipboard(data.url)}
              type="button"
              className="flex flex-row items-center op-link op-link-primary"
            >
              <i className="fa-light fa-copy" />
              <span className=" hidden md:block ml-1 ">{t("copy-link")}</span>
            </button>
            <ShareButton
              title={t("sign-url")}
              text={t("sign-url")}
              url={data.url}
            >
              <i className="fa-light fa-share-from-square op-link op-link-secondary no-underline"></i>
            </ShareButton>
          </div>
        </div>
      );
    });
  };
  const handleRemovePrefill = (placeholders) => {
    const removePrefill = placeholders?.filter(
      (data) => data?.Role !== "prefill"
    );
    return removePrefill;
  };
  const handleRecipientSign = (docId, currUserId) => {
    if (currUserId) {
      navigate(`/recipientSignPdf/${docId}/${currUserId}`);
    } else {
      navigate(`/recipientSignPdf/${docId}`);
    }
  };
  return (
    <div className="relative">
      {Object.keys(actLoader)?.length > 0 && (
        <div className="absolute w-full h-full flex justify-center items-center bg-black/30 rounded-box z-30">
          <Loader />
        </div>
      )}
      <div className="p-2 w-full bg-base-100 text-base-content op-card shadow-lg">
        {alertMsg.message && (
          <Alert type={alertMsg.type}>{alertMsg.message}</Alert>
        )}
        {props.tourData && (
          <>
            <Tour
              onRequestClose={closeTour}
              steps={props.tourData}
              isOpen={isTour}
            />
          </>
        )}
        <div
          ref={titleRef}
          className="flex flex-row items-center justify-between my-2 mx-3 text-[20px] md:text-[23px]"
        >
          <div className="font-light">
            {t(`report-name.${props.ReportName}`)}{" "}
            <sup className="cursor-pointer" onClick={() => setIsTour(true)}>
              <i className="border-[#33bbff] text-[#33bbff] fa-light fa-question rounded-full border-[1px] py-[1.5px] px-[4px] text-[13px]"></i>
            </sup>
          </div>
          <div className="flex flex-row justify-center items-center gap-3 mb-2">
            {/* Search input for report bigger in width */}
            {titleElement?.width > 500 && (
              <div className="flex">
                <input
                  type="search"
                  value={props.searchTerm}
                  onChange={props.handleSearchChange}
                  placeholder={t("search-templates")}
                  onPaste={props.handleSearchPaste}
                  className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-64 text-xs"
                />
              </div>
            )}
            {/* create template form  */}
            <div
              data-tut="reactourFirst"
              className="cursor-pointer flex"
              onClick={() => navigate("/form/template")}
            >
              <i className="cursor-pointer fa-light fa-square-plus text-accent text-[30px] md:text-[32px]"></i>
            </div>
            {/* search icon/magnifer icon  */}
            {titleElement?.width < 500 && (
              <button
                className="flex justify-center items-center focus:outline-none rounded-md text-[18px]"
                aria-label="Search"
                onClick={() =>
                  props.setMobileSearchOpen(!props.mobileSearchOpen)
                }
              >
                <i className="fa-light fa-magnifying-glass"></i>
              </button>
            )}
            {props.openColumnModal && (
              <button
                className="flex justify-center items-center focus:outline-none rounded-md text-[18px]"
                aria-label="Columns"
                onClick={props.openColumnModal}
              >
                <i className="fa-light fa-table-columns"></i>
              </button>
            )}
          </div>
        </div>
        {/* Search input for report smalle in width */}
        {titleElement?.width < 500 && props.mobileSearchOpen && (
          <div className="top-full left-0 w-full px-3 pt-1 pb-3">
            <input
              type="search"
              value={props.searchTerm}
              onChange={props.handleSearchChange}
              placeholder={t("search-documents")}
              onPaste={props.handleSearchPaste}
              className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
            />
          </div>
        )}
        <div
          className={`overflow-auto w-full border-b ${
            props.List?.length > 0
              ? isDashboard
                ? "min-h-[317px]"
                : currentList?.length === props.docPerPage
                  ? "h-fit"
                  : "h-screen"
              : ""
          }`}
        >
          <table className="op-table border-collapse w-full mb-4">
            <thead className="text-[14px] text-center">
              <tr className="border-y-[1px]">
                {props.heading?.map((item, i) => (
                  <th key={i} className="p-2">
                    {props.columnLabels?.[item] ||
                      t(`report-heading.${item}`, { defaultValue: item })}
                  </th>
                ))}
                {props.actions?.length > 0 && (
                  <th className="p-2 text-transparent pointer-events-none">
                    {t("action")}
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="text-[12px]">
              {props.List?.length > 0 &&
                currentList.map((item, index) => (
                  <tr
                    className={`${
                      currentList?.length === props.docPerPage
                        ? "last:border-none"
                        : ""
                    } border-y-[1px] `}
                    key={index}
                  >
                    {props?.heading?.map((col) => (
                      <RenderReportCell
                        key={col}
                        col={col}
                        rowData={item}
                        rowIndex={index}
                        startIndex={startIndex}
                        handleDownload={handleDownload}
                        handleRemovePrefill={handleRemovePrefill}
                        reportName={props.ReportName}
                      />
                    ))}
                    <td className="px-2 py-2">
                      <div className="text-base-content min-w-max flex flex-row gap-x-2 gap-y-1 justify-start items-center">
                        {props.actions?.length > 0 &&
                          props.actions.map((act, index) => (
                            <React.Fragment key={index}>
                              {(item.ExtUserPtr?.objectId ===
                                extClass?.[0]?.objectId ||
                                act.btnLabel === "Use") && (
                                <div
                                  role="button"
                                  data-tut={act?.selector}
                                  key={index}
                                  onClick={() => handleActionBtn(act, item)}
                                  title={t(`btnLabel.${act.hoverLabel}`)}
                                  className={
                                    act.action !== "option"
                                      ? `${
                                          act?.btnColor || ""
                                        } op-btn op-btn-sm mr-1`
                                      : "text-base-content focus:outline-none text-lg mr-2 relative"
                                  }
                                >
                                  <i className={act.btnIcon}></i>
                                  {act.btnLabel && (
                                    <span className="uppercase font-medium">
                                      {
                                            `${t(`btnLabel.${act.btnLabel}`)}`
                                      }
                                    </span>
                                  )}
                                  {/* template report */}
                                  {isOption[item.objectId] &&
                                    act.action === "option" && (
                                      <ul className="absolute -right-1 top-auto z-[70] w-52 op-dropdown-content op-menu op-menu-sm shadow-black/20 shadow bg-base-100 text-base-content rounded-box">
                                        {act.subaction?.map((subact) => (
                                          <li
                                            key={subact.btnId}
                                            onClick={() =>
                                              handleActionBtn(subact, item)
                                            }
                                            title={t(
                                              `btnLabel.${subact.btnLabel}`
                                            )}
                                          >
                                            <span className="flex items-center justify-between">
                                              <span className="text-[13px] capitalize font-medium">
                                                <i
                                                  className={`${subact.btnIcon} mr-2`}
                                                ></i>
                                                {subact.btnLabel &&
                                                  t(
                                                    `btnLabel.${subact.btnLabel}`
                                                  )}
                                              </span>
                                              {subact.secIcon && (
                                                <i
                                                  className={`${subact.secIcon} ml-1.5`}
                                                ></i>
                                              )}
                                            </span>
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                </div>
                              )}
                              <ModalUi
                                title={t("btnLabel.Duplicate")}
                                isOpen={isModal["duplicate_" + item.objectId]}
                                handleClose={handleCloseModal}
                              >
                                <div className="flex flex-col px-4 pb-3 pt-2">
                                  {error ? (
                                    <>{error}</>
                                  ) : (
                                    <>
                                      <p className="text-base">
                                        {t("duplicate-template-alert")}
                                      </p>
                                      <div className="flex flex-row gap-2 pt-3 mt-3 border-t-[1.5px] border-gray-500">
                                        <button
                                          className="w-[100px] op-btn op-btn-primary op-btn-md"
                                          onClick={() =>
                                            handleCreateDuplicate(item)
                                          }
                                        >
                                          {t("yes")}
                                        </button>
                                        <button
                                          className="w-[100px] op-btn op-btn-secondary op-btn-md"
                                          onClick={handleCloseModal}
                                        >
                                          {t("no")}
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </ModalUi>
                            </React.Fragment>
                          ))}
                      </div>
                      {isPrefillModal[item.objectId] && (
                        <PrefillWidgetModal
                          isPrefillModal={isPrefillModal[item.objectId]}
                          prefillData={xyPosition.find(
                            (x) => x.Role === "prefill"
                          )}
                          forms={forms}
                          setForms={setForms}
                          xyPosition={xyPosition}
                          setXyPosition={setXyPosition}
                          handleCreateDocument={handlePrefillWidgetCreateDoc}
                          handleClosePrefillModal={handleClosePrefillModal}
                          handleAddUser={handleAddUser}
                          navigatePageToDoc={navigatePageToDoc}
                          setIsNewContact={setIsNewContact}
                          isNewContact={isNewContact}
                          docId={item.objectId}
                          isSubmit={isSubmit}
                        />
                      )}
                      {isShareWith[item.objectId] && (
                        <div className="op-modal op-modal-open">
                          <div className="max-h-90 bg-base-100 w-[95%] md:max-w-[500px] rounded-box relative">
                                  <h3 className="text-base-content font-bold text-lg pt-[15px] px-[20px]">
                                    {t("share-with")}
                                  </h3>
                                  <div
                                    className="op-btn op-btn-sm op-btn-circle op-btn-ghost text-base-content absolute right-2 top-2 z-40"
                                    onClick={() => setIsShareWith({})}
                                  >
                                    ✕
                                  </div>
                                  <div className="px-2 mt-3 w-full h-full">
                                    <div className="op-input op-input-bordered op-input-sm w-full h-full text-[13px] break-all">
                                      {selectedTeam?.[0]?.label}
                                    </div>
                                  </div>
                                  <button
                                    onClick={(e) => handleShareWith(e, item)}
                                    className="op-btn op-btn-primary ml-[10px] my-3"
                                  >
                                    {t("submit")}
                                  </button>
                          </div>
                        </div>
                      )}
                      {isDeleteModal[item.objectId] && (
                        <ModalUi
                          isOpen
                          title={t("delete-document")}
                          handleClose={handleClose}
                        >
                          <div className="m-[20px]">
                            <div className="text-lg font-normal text-base-content">
                              {t("delete-document-alert")}
                            </div>
                            <hr className="bg-[#ccc] mt-4" />
                            <div className="flex items-center mt-3 gap-2 text-white">
                              <button
                                onClick={() => handleDelete(item)}
                                className="op-btn op-btn-primary"
                              >
                                {t("yes")}
                              </button>
                              <button
                                onClick={handleClose}
                                className="op-btn op-btn-secondary"
                              >
                                {t("no")}
                              </button>
                            </div>
                          </div>
                        </ModalUi>
                      )}
                      {isBulkSend[item.objectId] && (
                        <ModalUi
                          isOpen
                          title={
                                t("quick-send")
                          }
                          handleClose={() => setIsBulkSend({})}
                        >
                          {isLoader[item.objectId] ? (
                            <div className="w-full h-[100px] flex justify-center items-center z-30">
                              <Loader />
                            </div>
                          ) : (
                            <BulkSendUi
                              Placeholders={placeholders}
                              item={templateDeatils}
                              handleClose={handleQuickSendClose}
                              signatureType={signatureType}
                            />
                          )}
                        </ModalUi>
                      )}
                      {isShare[item.objectId] && (
                        <ModalUi
                          isOpen
                          title={t("copy-link")}
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
                                className="text-sm font-normal text-base-content flex my-2 justify-between items-center"
                              >
                                <span className="w-[150px] mr-[5px] md:mr-0 md:w-[300px] whitespace-nowrap overflow-hidden text-ellipsis text-sm font-semibold">
                                  {share.email}
                                </span>
                                <div className="flex items-center gap-2">
                                  <ShareButton
                                    title={t("sign-url")}
                                    text={t("sign-url")}
                                    url={share.url}
                                    className="op-btn op-btn-primary op-btn-outline op-btn-xs md:op-btn-sm "
                                  >
                                    <i className="fa-light fa-share-from-square"></i>
                                    {t("btnLabel.Share")}
                                  </ShareButton>
                                  <button
                                    className="op-btn op-btn-primary op-btn-outline op-btn-xs md:op-btn-sm"
                                    onClick={() =>
                                      copybtn(share.url, share.email)
                                    }
                                  >
                                    <i className="fa-light fa-copy" />
                                    {copied[share.email]
                                      ? t("copied")
                                      : t("copy")}
                                  </button>
                                </div>
                              </div>
                            ))}
                            <p ref={copyUrlRef} className="hidden"></p>
                          </div>
                        </ModalUi>
                      )}
                      {isResendMail[item.objectId] && (
                        <ModalUi
                          isOpen
                          title={
                                t("resend-mail")
                          }
                          handleClose={handleResendClose}
                        >
                            <div className="overflow-y-auto max-h-[340px] md:max-h-[400px]">
                              {item?.Placeholders?.filter(
                                (user) => user?.Role !== "prefill"
                              )?.map((user) => (
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
                                            message={t("resend-mail-help")}
                                          />
                                        </div>
                                        <div>
                                          <label
                                            className="text-xs ml-1"
                                            htmlFor="mailsubject"
                                          >
                                            {t("subject")}{" "}
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
                                            onInvalid={(e) =>
                                              e.target.setCustomValidity(
                                                t("input-required")
                                              )
                                            }
                                            onInput={(e) =>
                                              e.target.setCustomValidity("")
                                            }
                                            required
                                          />
                                        </div>
                                        <div>
                                          <label
                                            className="text-xs ml-1"
                                            htmlFor="mailbody"
                                          >
                                            {t("body")}{" "}
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
                                          {t("resend")}
                                        </button>
                                      </form>
                                    </div>
                                  )}
                                  {Object?.keys(isNextStep) <= 0 && (
                                    <div className="flex justify-between items-center gap-2 my-2 px-3">
                                      <div className="text-base-content">
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
                      <ModalUi
                        title={t("btnLabel.Rename")}
                        isOpen={isModal["rename_" + item.objectId]}
                        handleClose={handleCloseModal}
                      >
                        <div className="flex flex-col px-4 pb-3 pt-2">
                          <div className="flex flex-col gap-2">
                            <input
                              maxLength={200}
                              autoFocus={true}
                              type="text"
                              defaultValue={renameDoc || item.Name}
                              onChange={(e) => setRenameDoc(e.target.value)}
                              className="op-input op-input-bordered op-input-sm w-full focus:outline-none hover:border-base-content text-[10px]"
                            />
                          </div>
                          <div className="flex flex-row gap-2 pt-3 mt-3 border-t-[1.5px] border-gray-500">
                            <button
                              className="w-[100px] op-btn op-btn-primary op-btn-md"
                              onClick={() => handleRenameDoc(item)}
                            >
                              {t("save")}
                            </button>
                            <button
                              className="w-[100px] op-btn op-btn-secondary op-btn-md"
                              onClick={handleCloseModal}
                            >
                              {t("cancel")}
                            </button>
                          </div>
                        </div>
                      </ModalUi>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
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
              <div className="text-sm font-semibold">
                {t("no-data-avaliable")}
              </div>
            </div>
          )}
        </div>
        <div className="op-join flex flex-wrap items-center p-2">
          {props.List.length > props.docPerPage && (
            <button
              onClick={() => paginateBack()}
              className="op-join-item op-btn op-btn-sm"
            >
              {t("prev")}
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
              {t("next")}
            </button>
          )}
        </div>
        <CustomizeMail
          setIsMailModal={setIsMailModal}
          setCustomizeMail={setCustomizeMail}
          documentId={documentId}
          signerList={signerList}
          setIsSend={setIsSend}
          setMailStatus={setMailStatus}
          customizeMail={customizeMail}
          defaultMail={defaultMail}
          isMailModal={isMailModal}
          setCurrUserId={setCurrUserId}
          handleShareList={handleShareList}
          setDocumentDetails={setDocumentDetails}
        />
        <ModalUi
          isOpen={isSend}
          title={
            mailStatus === "success"
              ? t("mails-sent")
              : mailStatus === "quotareached"
                ? t("quota-mail-head")
                : t("mail-not-delivered")
          }
          handleClose={() => {
            setIsSend(false);
            navigate("/report/1MwEuxLEkF");
          }}
        >
          <div className="h-[100%] p-[20px] text-base-content">
            {mailStatus === "success" ? (
              <div className="text-center mb-[10px]">
                <LottieWithLoader />
                {documentDetails.SendinOrder ? (
                  <p>
                    {currUserId
                      ? t("placeholder-mail-alert-you")
                      : t("placeholder-mail-alert", {
                          name: signerList[0]?.Name
                        })}
                  </p>
                ) : (
                  <p>{t("placeholder-alert-4")}</p>
                )}
                {currUserId && <p>{t("placeholder-alert-5")}</p>}
              </div>
            ) : mailStatus === "quotareached" ? (
              <div className="flex flex-col gap-y-3">
                <div className="my-3">{handleShareList()}</div>
              </div>
            ) : (
              <div className="mb-[10px]">
                {mailStatus === "dailyquotareached" ? (
                  <p>{t("daily-quota-reached")}</p>
                ) : (
                  <p>{t("placeholder-alert-6")}</p>
                )}
                {currUserId && (
                  <p className="mt-1">{t("placeholder-alert-5")}</p>
                )}
              </div>
            )}
            {!mailStatus && (
              <div className="w-full h-[1px] bg-[#9f9f9f] my-[15px]"></div>
            )}
            {mailStatus !== "quotareached" && (
              <div
                className={
                  mailStatus === "success" ? "flex justify-center mt-1" : ""
                }
              >
                {currUserId && (
                  <button
                    onClick={() =>
                      handleRecipientSign(documentDetails?.objectId, currUserId)
                    }
                    type="button"
                    className="op-btn op-btn-primary mr-1"
                  >
                    {t("yes")}
                  </button>
                )}
                <button
                  onClick={() => {
                    navigate("/report/1MwEuxLEkF");
                  }}
                  type="button"
                  className="op-btn op-btn-ghost text-base-content"
                >
                  {currUserId ? t("no") : t("close")}
                </button>
              </div>
            )}
          </div>
        </ModalUi>
      </div>
    </div>
  );
};

export default TemplatesReport;
