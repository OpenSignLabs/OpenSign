import React, { useState, useEffect, useRef } from "react";
import pad from "../assets/images/pad.svg";
import recreatedoc from "../assets/images/recreatedoc.png";
import { Link, useLocation, useNavigate } from "react-router";
import axios from "axios";
import ModalUi from "./ModalUi";
import AddSigner from "../components/AddSigner";
import {
  emailRegex,
  iconColor,
} from "../constant/const";
import Alert from "./Alert";
import Tooltip from "./Tooltip";
import ShareButton from "./ShareButton";
import Tour from "../primitives/Tour";
import Parse from "parse";
import {
  copytoData,
  fetchUrl,
  formatDate,
  formatDateTime,
  getSignedUrl,
  getTenantDetails,
  handleSignatureType,
  replaceMailVaribles,
  signatureTypes,
  openInNewTab
} from "../constant/Utils";
import EditorToolbar, {
  module1,
  formats
} from "../components/pdf/EditorToolbar";
import ReactQuill from "react-quill-new";
import "../styles/quill.css";
import BulkSendUi from "../components/BulkSendUi";
import Loader from "./Loader";
import { serverUrl_fn } from "../constant/appinfo";
import { useTranslation } from "react-i18next";
import DownloadPdfZip from "./DownloadPdfZip";
import * as XLSX from "xlsx";
import EditContactForm from "../components/EditContactForm";
import { useElSize } from "../hook/useElSize";

const ReportTable = (props) => {
  const copyUrlRef = useRef(null);
  const titleRef = useRef(null);
  const titleElement = useElSize(titleRef);
  const appName =
    "OpenSign™";
  const drivename = appName === "OpenSign™" ? "OpenSign™" : "";
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard =
    location?.pathname === "/dashboard/35KBoSgoAK" ? true : false;
  const [currentPage, setCurrentPage] = useState(1);
  const [actLoader, setActLoader] = useState({});
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
  const [mail, setMail] = useState({ subject: "", body: "" });
  const [userDetails, setUserDetails] = useState({});
  const [isNextStep, setIsNextStep] = useState({});
  const [isBulkSend, setIsBulkSend] = useState({});
  const [templateDeatils, setTemplateDetails] = useState({});
  const [placeholders, setPlaceholders] = useState([]);
  const [isLoader, setIsLoader] = useState({});
  const [isShareWith, setIsShareWith] = useState({});
  const [selectedTeam, setSelectedTeam] = useState([]);
  const [isViewShare, setIsViewShare] = useState({});
  const [isModal, setIsModal] = useState({});
  const [reason, setReason] = useState("");
  const [isDownloadModal, setIsDownloadModal] = useState(false);
  const [signatureType, setSignatureType] = useState([]);
  const [expiryDate, setExpiryDate] = useState("");
  const Extand_Class = localStorage.getItem("Extand_Class");
  const extClass = Extand_Class && JSON.parse(Extand_Class);
  const [importedData, setImportedData] = useState([]);
  const [currentImportPage, setCurrentImportPage] = useState(1);
  const [isShowAllSigners, setIsShowAllSigners] = useState({});
  const [invalidRecords, setInvalidRecords] = useState(0);
  const [renameDoc, setRenameDoc] = useState("");
  const [contact, setContact] = useState({ Name: "", Email: "", Phone: "" });
  const [isSuccess, setIsSuccess] = useState({});
  const [templateId, setTemplateId] = useState("");
  const isTemplateReport = props.ReportName === "Templates";
  const recordsPerPage = 5;
  const startIndex = (currentPage - 1) * props.docPerPage;
  const { isMoreDocs, setIsNextRecord } = props;

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
    if (isTemplateReport) {
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
    }
  };
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
    if (isTemplateReport) {
      if (act.hoverLabel === "Edit") {
          navigate(`/${act.redirectUrl}/${item.objectId}`);
      } else {
        setActLoader({ [`${item.objectId}_${act.btnId}`]: true });
        handleUseTemplate(item.objectId, act.redirectUrl);
      }
    } else {
      navigate(`/${act.redirectUrl}?docId=${item?.objectId}`);
    }
  };

  const handleUseTemplate = async (templateId, redirectUrl) => {
    try {
      const params = { templateId: templateId };
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
      const templateData = templateDeatils.data && templateDeatils.data.result;
      if (!templateData.error) {
        const Doc = templateData;

        let signers = [];
        if (Doc.Signers?.length > 0) {
          Doc.Signers?.forEach((x) => {
            if (x.objectId) {
              signers.push({
                __type: "Pointer",
                className: "contracts_Contactbook",
                objectId: x.objectId
              });
            }
          });
        }

        let extUserId = Doc.ExtUserPtr.objectId;
        let creatorId = Doc.CreatedBy.objectId;
        if (extClass && extClass.length > 0) {
          if (Doc.ExtUserPtr?.objectId !== extClass[0].objectId) {
            const Extand_Class = localStorage.getItem("Extand_Class");
            const extClass = Extand_Class && JSON.parse(Extand_Class);
            if (extClass && extClass.length > 0) {
              extUserId = extClass[0].objectId;
              creatorId = extClass[0]?.UserId.objectId;
            }
          }
        }
        const tenantSignTypes = await fetchTenantDetails();
        const docSignTypes = Doc?.SignatureType || signatureTypes;
        const updatedSignatureType = await handleSignatureType(
          tenantSignTypes,
          docSignTypes
        );
        const SignatureType =
          updatedSignatureType.length > 0
            ? { SignatureType: updatedSignatureType }
            : {};
        const NotifyOnSignatures =
          Doc?.NotifyOnSignatures !== undefined
            ? { NotifyOnSignatures: Doc.NotifyOnSignatures }
            : {};
        const Bcc = Doc?.Bcc?.length > 0 ? { Bcc: Doc?.Bcc } : {};
        const RedirectUrl = Doc?.RedirectUrl
          ? { RedirectUrl: Doc?.RedirectUrl }
          : {};
        const TemplateId = Doc?.objectId
          ? {
              TemplateId: {
                __type: "Pointer",
                className: "contracts_Template",
                objectId: Doc?.objectId
              }
            }
          : {};
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
              objectId: extUserId
            },
            CreatedBy: {
              __type: "Pointer",
              className: "_User",
              objectId: creatorId
            },
            Signers: signers,
            SendinOrder: Doc?.SendinOrder || false,
            AutomaticReminders: Doc?.AutomaticReminders || false,
            RemindOnceInEvery: Doc?.RemindOnceInEvery || 5,
            IsEnableOTP: Doc?.IsEnableOTP || false,
            TimeToCompleteDays: parseInt(Doc?.TimeToCompleteDays) || 15,
            AllowModifications: Doc?.AllowModifications || false,
            ...SignatureType,
            ...NotifyOnSignatures,
            ...Bcc,
            ...RedirectUrl,
            ...TemplateId
          };
          try {
            const res = await axios.post(
              `${localStorage.getItem("baseUrl")}classes/contracts_Document`,
              data,
              {
                headers: {
                  "Content-Type": "application/json",
                  "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
                  "X-Parse-Session-Token": localStorage.getItem("accesstoken")
                }
              }
            );
            if (res.data && res.data.objectId) {
              setActLoader({});
              navigate(`/${redirectUrl}/${res.data.objectId}`, {
                state: { title: "Use Template" }
              });
            }
          } catch (err) {
            console.log("Err", err);
            showAlert("danger", t("something-went-wrong-mssg"));
            setActLoader({});
          }
        } else {
          setActLoader({});
        }
      } else {
        showAlert("danger", t("something-went-wrong-mssg"));
        setActLoader({});
      }
    } catch (err) {
      console.log("err", err);
      showAlert("danger", t("something-went-wrong-mssg"));
      setActLoader({});
    }
  };
  const handleActionBtn = async (act, item) => {
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
      setIsModal({ [`duplicate_${item.objectId}`]: true });
    } else if (act.action === "rename") {
      setIsModal({ [`rename_${item.objectId}`]: true });
    } else if (act.action === "edit") {
      setContact(item);
      setIsModal({ [`edit_${item.objectId}`]: true });
    } else if (act.action === "saveastemplate") {
      setIsModal({ [`saveastemplate_${item.objectId}`]: true });
    } else if (act.action === "recreatedocument") {
      setIsModal({ [`recreatedocument_${item.objectId}`]: true });
    } else if (act.action === "extendexpiry") {
      setIsModal({ [`extendexpiry_${item.objectId}`]: true });
    }
  };
  // Get current list
  const indexOfLastDoc = currentPage * props.docPerPage;
  const indexOfFirstDoc = indexOfLastDoc - props.docPerPage;
  const currentList = props.List?.slice(indexOfFirstDoc, indexOfLastDoc);

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
      const serverUrl = serverUrl_fn();
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
    setIsRevoke({});
    setIsDeleteModal({});
    setReason("");
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
    copytoData(share.url);
    if (copyUrlRef.current) {
      copyUrlRef.current.textContent = share.url; // Update text safely
    }
    setCopied({ ...copied, [share.email]: true });
  };
  //function to handle revoke/decline docment
  const handleRevoke = async (item) => {
    const senderUser = localStorage.getItem(
      `Parse/${localStorage.getItem("parseAppId")}/currentUser`
    );
    const jsonSender = JSON.parse(senderUser);
    setIsRevoke({});
    setActLoader({ [`${item.objectId}`]: true });
    const data = {
      IsDeclined: true,
      DeclineReason: reason,
      DeclineBy: {
        __type: "Pointer",
        className: "_User",
        objectId: jsonSender?.objectId
      }
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
          showAlert("success", t("record-revoke-alert"));
          const upldatedList = props.List.filter(
            (x) => x.objectId !== item.objectId
          );
          props.setList(upldatedList);
        }
        setReason("");
      })
      .catch((err) => {
        console.log("err", err);
        setReason("");
        showAlert("danger", t("something-went-wrong-mssg"));
        setActLoader({});
      });
  };

  async function checkTourStatus() {
    const cloudRes = await Parse.Cloud.run("getUserDetails");
    if (cloudRes) {
      const extUser = JSON.parse(JSON.stringify(cloudRes));
      localStorage.setItem("Extand_Class", JSON.stringify([extUser]));
      const tourStatus = extUser?.TourStatus || [];
      setTourStatusArr(tourStatus);
      const templateTour = tourStatus.find(
        (obj) => obj.templateTour
      )?.templateTour;
      setIsTour(!templateTour);
    } else {
      setIsTour(true);
    }
  }

  const closeTour = async () => {
    setIsTour(false);
    if (props.isDontShow) {
      const serverUrl = localStorage.getItem("baseUrl");
      const appId = localStorage.getItem("parseAppId");
      const json = JSON.parse(localStorage.getItem("Extand_Class"));
      const extUserId = json && json.length > 0 && json[0].objectId;
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
        : item?.Name || "Document";
    const isCompleted = item?.IsCompleted || false;
    const templateId = props?.ReportName === "Templates" && item.objectId;
    const docId = props?.ReportName !== "Templates" && item.objectId;
    if (url) {
      try {
        if (isCompleted) {
          setIsDownloadModal({ [item.objectId]: true });
        } else {
          const signedUrl = await getSignedUrl(
            url,
            docId,
            templateId
          );
          await fetchUrl(signedUrl, pdfName);
        }
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
  };

  const handleViewSigners = (item) => {
    setIsViewShare({ [item.objectId]: true });
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
  const handleUpdateExpiry = async (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    if (expiryDate) {
      const oldExpiryDate = new Date(item?.ExpiryDate?.iso);
      const newExpiryDate = new Date(expiryDate);
      if (newExpiryDate > oldExpiryDate) {
        setActLoader({ [`${item.objectId}`]: true });
        const updateExpiryDate = new Date(expiryDate).toISOString();
        const expiryIsoFormat = { iso: updateExpiryDate, __type: "Date" };
        try {
          const serverUrl = serverUrl_fn();
          const cls = "contracts_Document";
          const url = serverUrl + `/classes/${cls}/`;
          const body = { ExpiryDate: expiryIsoFormat };
          const res = await axios.put(url + item.objectId, body, {
            headers: {
              "Content-Type": "application/json",
              "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
              "X-Parse-Session-Token": localStorage.getItem("accesstoken")
            }
          });
          if (res.data && res.data.updatedAt) {
            showAlert(
              "success",
              t("expiry-date-updated", {
                newexpirydate: new Date(expiryDate)?.toLocaleDateString()
              }),
              2000
            );
            if (props.ReportName === "Expired Documents") {
              const upldatedList = props.List.filter(
                (x) => x.objectId !== item.objectId
              );
              props.setList(upldatedList);
            }
          }
        } catch (err) {
          console.log("err", err);
          showAlert("danger", t("something-went-wrong-mssg"), 2000);
        } finally {
          setActLoader({});
          setExpiryDate();
          setIsModal({});
        }
      } else {
        showAlert("danger", t("expiry-date-error"), 2000);
      }
    } else {
      showAlert("danger", t("expiry-date-error"), 2000);
    }
  };
  // `formatStatusRow` is used to format status row
  const formatStatusRow = (item) => {
    const timezone = extClass?.[0]?.Timezone || "";
    const DateFormat = extClass?.[0]?.DateFormat || "MM/DD/YYYY";
    const Is12Hr = extClass?.[0]?.Is12HourTime || false;
    const signers = item?.Placeholders?.map((x, i) => {
      const audit = item?.AuditTrail?.find(
        (audit) => audit?.UserPtr?.objectId === x.signerObjId
      );
      const format = (date) =>
        date
          ? formatDateTime(new Date(date), DateFormat, timezone, Is12Hr)
          : "-";
      return {
        id: i,
        Email: x?.signerPtr?.Email || x?.email,
        Activity: audit?.Activity?.toUpperCase() || "SENT",
        SignedOn: format(audit?.SignedOn),
        ViewedOn: format(audit?.ViewedOn)
      };
    });
    // Decide how many signers to display based on `showAllSignes` state
    const displaySigners = isShowAllSigners[item.objectId]
      ? signers
      : signers.slice(0, 3);
    return (
      <>
        {displaySigners?.map((x, i) => (
          <div
            key={i}
            className="text-sm font-medium flex flex-row gap-2 items-center"
          >
            <button
              onClick={() => setIsModal({ [`${item.objectId}_${i}`]: true })}
              className={`${
                x.Activity === "SIGNED"
                  ? "op-border-primary op-text-primary"
                  : x.Activity === "VIEWED"
                    ? "border-green-400 text-green-400"
                    : "border-base-content text-base-content"
              } focus:outline-none border-2 w-[60px] h-[30px] text-[11px] rounded-full`}
            >
              {x?.Activity?.toUpperCase() || "-"}
            </button>
            <div className="py-2 font-bold text-[12px]">{x?.Email || "-"}</div>
            {isModal[`${item.objectId}_${i}`] && (
              <ModalUi
                isOpen
                title={t("document-logs")}
                handleClose={handleCloseModal}
              >
                <div className="pl-3 first:mt-2 border-t-[1px] border-gray-600 text-[12px] py-2">
                  <p className="font-bold"> {x?.Email}</p>
                  <p>Viewed on: {x?.ViewedOn}</p>
                  <p>Signed on: {x?.SignedOn}</p>
                </div>
              </ModalUi>
            )}
          </div>
        ))}
        {/* Show More / Hide button */}
        {signers?.length > 3 && (
          <button
            onClick={() =>
              setIsShowAllSigners({
                [item.objectId]: !isShowAllSigners[item.objectId]
              })
            }
            className="ml-2 text-xs font-medium text-blue-500 underline focus:outline-none"
          >
            {isShowAllSigners[item.objectId] ? "Hide" : "Show More"}
          </button>
        )}
      </>
    );
  };

  // `handleImportBtn` is trigger when user click on upload icon from contactbook
  const handleImportBtn = () => {
    setIsModal({ export: true });
  };

  // `capitalize` is used to make word capitalize
  const capitalize = (s) =>
    s && String(s[0]).toUpperCase() + String(s).slice(1);

  // `checkRequiredHeaders` is used to check required headers present or not in csv/excel file
  const checkRequiredHeaders = (headers) => {
    const requiredHeaders = ["Name", "Email"];
    // Normalize headers to lowercase once
    const headersSet = new Set(headers.map((header) => header.toLowerCase()));

    // Check all required headers
    const allPresent = requiredHeaders.every((requiredHeader) =>
      headersSet.has(requiredHeader.toLowerCase())
    );
    return allPresent;
  };

  const processCSVFile = async (file, event) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      // Parse CSV data
      const rows = text.split("\n").map((row) => row.trim());
      const headers = rows[0].split(",").map((header) => header.trim());
      if (checkRequiredHeaders(headers)) {
        const records = rows.slice(1).reduce((acc, row) => {
          const values = row?.split(",").map((value) => value.trim()) || [];
          if (values.length > 1) {
            acc.push(
              headers.reduce(
                (obj, header, index) => ({
                  ...obj,
                  [capitalize(header)]: values[index] || ""
                }),
                {}
              )
            );
          }
          return acc;
        }, []);
        if (records.length <= 100) {
          const validRecords = records.length
            ? records.filter((x) => emailRegex.test(x.Email))
            : [];
          const invalidItems = records?.length - validRecords?.length;
          setInvalidRecords(invalidItems);
          setImportedData(validRecords);
        } else {
          alert(t("100-records-only"));
          event.target.value = "";
          setImportedData([]);
        }
      } else {
        alert(t("invalid-data"));
        event.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  const processExcelFile = (file, event) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target.result;
        const workbook = XLSX.read(new Uint8Array(arrayBuffer), {
          type: "array"
        });

        // Get the first sheet
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convert sheet to JSON
        const sheetData = XLSX.utils.sheet_to_json(sheet);
        if (sheetData.length <= 100) {
          // Get all unique keys from the data to handle missing fields
          const headers = [
            ...new Set(sheetData.flatMap((item) => Object.keys(item)))
          ];

          if (checkRequiredHeaders(headers)) {
            const updateSheetData = sheetData.map((obj) => {
              for (let key in obj) {
                const capitalizedKey = capitalize(key);
                if (capitalizedKey !== key) {
                  obj[capitalizedKey] = obj[key];
                  delete obj[key]; // delete the old key to avoid duplicates
                }
              }
              return obj;
            });
            const validRecords = updateSheetData.length
              ? updateSheetData.filter((x) => emailRegex.test(x.Email))
              : [];
            const invalidItems = updateSheetData?.length - validRecords?.length;
            setInvalidRecords(invalidItems);
            setImportedData(validRecords);
          } else {
            alert(t("invalid-data"));
            event.target.value = "";
          }
        } else {
          alert(t("100-records-only"));
          event.target.value = "";
          setImportedData([]);
        }
      };

      reader.readAsArrayBuffer(file);
    }
  };
  // `handleFileUpload` is trigger when user upload excel file from contactbook
  const handleFileUpload = (event) => {
    const file = event.target?.files?.[0];
    if (file) {
      const fileName = file.name;
      const fileNameExt = fileName
        .substr(fileName.lastIndexOf(".") + 1)
        .toLowerCase();
      const isValidExt = ["csv", "xlsx", "xls"].includes(fileNameExt);
      if (isValidExt) {
        setCurrentImportPage(1);
        if (fileNameExt !== "csv") {
          processExcelFile(file, event);
        } else {
          processCSVFile(file, event);
        }
      } else {
        event.target.value = "";
        alert(t("csv-excel-support-only"));
      }
    } else {
      setImportedData([]);
      setCurrentImportPage(1);
      setInvalidRecords(0);
    }
  };

  // Get all unique keys from the data to handle missing fields
  const allKeys = importedData?.length
    ? [...new Set(importedData.flatMap((item) => Object.keys(item)))]
    : [];

  // Pagination logic for import data table in modal
  const totalImportPages = Math.ceil(importedData.length / recordsPerPage);
  const currentRecords = importedData.slice(
    (currentImportPage - 1) * recordsPerPage,
    currentImportPage * recordsPerPage
  );

  // `handleNextPage` is used to importdata table in modal
  const handleNextPage = (e) => {
    e.preventDefault();
    if (currentImportPage < totalImportPages) {
      setCurrentImportPage(currentImportPage + 1);
    }
  };

  // `handlePreviousPage` is used to importdata table in modal
  const handlePreviousPage = (e) => {
    e.preventDefault();
    if (currentImportPage > 1) {
      setCurrentImportPage(currentImportPage - 1);
    }
  };
  // `handleImportData` is used to create batch in contact
  const handleImportData = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActLoader({ import: true });
    try {
      const filterdata = importedData.map((x) => ({
        Name: x.Name,
        Email: x.Email,
        Phone: x.Phone,
        TenantId: localStorage.getItem("TenantId")
      }));
      const contacts = JSON.stringify(filterdata);
      const res = await Parse.Cloud.run("createbatchcontact", { contacts });
      if (res) {
        showAlert(
          "info",
          t("contact-imported", {
            imported: res?.success || 0,
            failed: res?.failed || 0
          })
        );
        if (res?.success > 0) {
          setTimeout(() => window.location.reload(), 1500);
        }
      }
    } catch (err) {
      console.log("err while creating batch contact", err);
      showAlert("danger", t("something-went-wrong-mssg"));
    } finally {
      setActLoader({});
      setIsModal({});
      setImportedData([]);
      setInvalidRecords(0);
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
    const className = isTemplateReport
      ? "contracts_Template"
      : "contracts_Document";
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
  const handleBtnVisibility = (act, item) => {
    if (!act.restrictBtn) {
      return true;
    } else if (
      act.restrictBtn === true &&
      item.ExtUserPtr?.objectId === extClass?.[0]?.objectId
    ) {
      return true;
    }
  };

  // `handleEditContact` is used to update contactas per old contact Id
  const handleEditContact = async (updateContact) => {
    const updateList = props.List.map((x) =>
      x.objectId === contact.objectId ? { ...x, ...updateContact } : x
    );
    props.setList(updateList);
  };
  const handleCloseModal = () => {
    setIsModal({});
  };
  const handleSaveAsTemplate = async (doc) => {
    try {
      const params = { docId: doc?.objectId };
      const templateRes = await Parse.Cloud.run("saveastemplate", params);
      setTemplateId(templateRes?.id);
      setIsSuccess({ [doc.objectId]: true });
    } catch (err) {
      console.log("Err in saveastemplate", err);
    } finally {
      setActLoader({});
    }
  };
  const handleCloseTemplate = () => {
    setTemplateId("");
    setIsSuccess({});
    handleCloseModal();
    setActLoader({});
    handleClose();
  };

  // `handleBulkSend` is used to open modal as well as fetch template
  // and show Ui on the basis template response
  const handleBulkSendTemplate = async (templateId, docId) => {
    setIsBulkSend({ [docId]: true });
    setIsLoader({ [docId]: true });
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
  };

  const handleResendClose = () => {
    setIsResendMail({});
    setIsNextStep({});
    setUserDetails({});
  };

  const handleRecreateDoc = async (item) => {
    setActLoader({ [item.objectId]: true });
    try {
      const res = await Parse.Cloud.run("recreatedoc", {
        docId: item.objectId
      });
      if (res) {
        openInNewTab(`/placeHolderSign/${res.objectId}`, "_self");
      }
    } catch (err) {
      handleCloseModal();
      showAlert("danger", err.message);
      // showAlert("danger", t("something-went-wrong-mssg"));
      console.log("Err while create duplicate template", err);
    } finally {
      setActLoader({});
    }
  };

  const restrictBtn = (item, act) => {
    return item.IsSignyourself && act.action === "recreatedocument"
      ? true
      : false;
  };
  return (
    <div className="relative">
      {Object.keys(actLoader)?.length > 0 && (
        <div className="absolute w-full h-full flex justify-center items-center bg-black bg-opacity-30 z-30">
          <Loader />
        </div>
      )}
      <div className="p-2 w-full bg-base-100 text-base-content op-card shadow-lg">
        {alertMsg.message && (
          <Alert type={alertMsg.type}>{alertMsg.message}</Alert>
        )}
        {props.tourData && isTemplateReport && (
          <>
            <Tour
              onRequestClose={closeTour}
              steps={props.tourData}
              isOpen={isTour}
              rounded={5}
              closeWithMask={false}
            />
          </>
        )}
        <div
          ref={titleRef}
          className="flex flex-row items-center justify-between my-2 mx-3 text-[20px] md:text-[23px]"
        >
          <div className="font-light">
            {t(`report-name.${props.ReportName}`)}{" "}
            {props.report_help && (
              <span className="text-xs md:text-[13px] font-normal">
                <Tooltip
                  id="report_help"
                  message={t(`report-help.${props.ReportName}`)}
                />
              </span>
            )}
          </div>
          <div className="flex flex-row justify-center items-center gap-3 mb-2">
            {/* Search input for report bigger in width */}
            {titleElement?.width > 500 && (
              <div className="flex">
                <input
                  type="search"
                  value={props.searchTerm}
                  onChange={props.handleSearchChange}
                  placeholder={
                    props.ReportName === "Contactbook"
                      ? t("search-contacts")
                      : isTemplateReport
                        ? t("search-templates")
                        : t("search-documents")
                  }
                  onPaste={props.handleSearchPaste}
                  className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-64 text-xs"
                />
              </div>
            )}
            {/* contact import */}
            {props.isImport && (
              <div
                className="cursor-pointer flex"
                onClick={() => handleImportBtn()}
              >
                <i className="fa-light fa-upload op-text-secondary text-[23px] md:text-[25px]"></i>
              </div>
            )}
            {/* add contact form  */}
            {props.form && (
              <div
                className="cursor-pointer flex"
                onClick={() => handleContactFormModal()}
              >
                <i className="fa-light fa-square-plus text-accent text-[30px] md:text-[32px]"></i>
              </div>
            )}
            {/* create template form  */}
            {isTemplateReport && (
              <div
                data-tut="reactourFirst"
                className="cursor-pointer flex"
                onClick={() => navigate("/form/template")}
              >
                <i className="cursor-pointer fa-light fa-square-plus text-accent text-[30px] md:text-[32px]"></i>
              </div>
            )}
            {/* search icon/magnifer icon  */}
            {titleElement?.width < 500 && (
              <button
                className="flex justify-center items-center focus:outline-none rounded-md text-[18px]"
                aria-label="Search"
                onClick={() =>
                  props.setMobileSearchOpen(!props.mobileSearchOpen)
                }
              >
                <i
                  style={{ color: `${iconColor}` }}
                  className="fa-solid fa-magnifying-glass"
                ></i>
              </button>
            )}
            <ModalUi
              isOpen={isModal?.export}
              title={t("bulk-import")}
              handleClose={() => {
                setIsModal({});
                setImportedData([]);
                setInvalidRecords(0);
              }}
            >
              <div className="relative">
                {Object.keys(actLoader)?.length > 0 && (
                  <div className="absolute w-full h-full flex justify-center items-center bg-black bg-opacity-30 z-30">
                    <Loader />
                  </div>
                )}
                <form onSubmit={handleImportData} className="p-[20px] h-full ">
                  <div className="text-xs">
                    <label className="block ml-2">
                      {t("contacts-file")}
                      <span className="text-red-500 text-[13px]"> *</span>
                    </label>
                    <input
                      type="file"
                      accept=".csv, .xlsx, .xls"
                      onChange={handleFileUpload}
                      required
                      className="op-file-input op-file-input-bordered op-file-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                    />
                  </div>
                  <div className="text-md m-2">
                    <div className="flex flex-col md:flex-row gap-1">
                      <span>Total records found: {importedData.length} </span>
                      <span>Invalid records found: {invalidRecords}</span>
                    </div>
                    <div className="overflow-x-auto p-1">
                      {importedData?.length > 0 && (
                        <>
                          <table className="op-table op-table-zebra w-full">
                            <thead>
                              <tr>
                                {allKeys.map((key, index) => (
                                  <th key={index}>{key}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {currentRecords.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                  {allKeys.map((key, colIndex) => (
                                    <td key={colIndex}>{row[key] || "-"}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <div className="flex justify-between items-center mt-4">
                            <button
                              className="op-btn op-btn-primary op-btn-sm"
                              disabled={currentImportPage === 1}
                              onClick={handlePreviousPage}
                            >
                              Previous
                            </button>
                            <span>
                              Page {currentImportPage} of {totalImportPages}
                            </span>
                            <button
                              className="op-btn op-btn-primary op-btn-sm"
                              disabled={currentImportPage === totalImportPages}
                              onClick={handleNextPage}
                            >
                              Next
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="h-[1px] w-full my-[15px] bg-[#9f9f9f]"></div>
                  <button type="submit" className="op-btn op-btn-primary">
                    Import
                  </button>
                </form>
              </div>
            </ModalUi>
          </div>
        </div>
        {/* Search input for report smalle in width */}
        {titleElement?.width < 500 && props.mobileSearchOpen && (
          <div className="top-full left-0 w-full bg-white px-3 pt-1 pb-3">
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
                {props.heading?.map((item, index) => (
                  <React.Fragment key={index}>
                    <th className="p-2">{t(`report-heading.${item}`)}</th>
                  </React.Fragment>
                ))}
                {props.actions?.length > 0 && (
                  <th className="p-2 text-transparent pointer-events-none">
                    {t("action")}
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
                          <th className="p-2">{startIndex + index + 1}</th>
                        )}
                        <td className="px-4 py-2 font-semibold">
                          {item?.Name}{" "}
                        </td>
                        <td className="p-2 text-center">
                          {item?.Email || "-"}
                        </td>
                        <td className="p-2 text-center">
                          {item?.Phone || "-"}
                        </td>
                        <td className="px-3 py-2">
                          <div className="text-base-content min-w-max flex flex-row gap-x-2 gap-y-1 justify-start items-center">
                            {props.actions?.length > 0 &&
                              props.actions.map((act, index) => (
                                <button
                                  key={index}
                                  onClick={() => handleActionBtn(act, item)}
                                  title={t(`btnLabel.${act.hoverLabel}`)}
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
                                  <div className="text-lg font-normal text-base-content">
                                    {t("contact-delete-alert")}
                                  </div>
                                  <hr className="bg-[#ccc] mt-4 " />
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
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr
                        className={`${
                          currentList?.length === props.docPerPage
                            ? "last:border-none"
                            : ""
                        } border-y-[1px] `}
                        key={index}
                      >
                        {props.heading.includes("Sr.No") && (
                          <th className="px-2 py-2">
                            {startIndex + index + 1}
                          </th>
                        )}
                        <td className="p-2 min-w-56 max-w-56">
                          <div className="font-semibold break-words">
                            {item?.Name}
                          </div>
                          {item?.ExpiryDate?.iso && (
                            <div className="text-gray-500">
                              Expires {formatDate(item?.ExpiryDate?.iso)}
                            </div>
                          )}
                        </td>
                        {props?.heading?.includes("Reason") && (
                          <td className="p-2 text-center">
                            {item?.DeclineReason?.length > 25
                              ? item?.DeclineReason?.slice(0, 25) + "..."
                              : item?.DeclineReason || "-"}
                          </td>
                        )}
                        {props.heading.includes("Note") && (
                          <td className="p-2 text-center">
                            <p className="truncate w-[100px]">
                              {item?.Note || "-"}
                            </p>
                          </td>
                        )}
                        {props.heading.includes("Folder") && (
                          <td className="p-2 text-center">
                            {item?.Folder?.Name ||
                              t("sidebar.OpenSign™ Drive", {
                                appName: drivename
                              })}
                          </td>
                        )}
                        <td className="p-2 text-center">
                          <button
                            onClick={() => handleDownload(item)}
                            className="op-link op-link-primary"
                            title={t("download")}
                          >
                            {item?.URL ? t("download") : "-"}
                          </button>
                        </td>
                        {props.heading.includes("Owner") && (
                          <td className="p-2 text-center">
                            {formatRow(item?.ExtUserPtr)}
                          </td>
                        )}
                        {props.heading.includes("Signers") &&
                        ["In-progress documents", "Need your sign"].includes(
                          props.ReportName
                        ) ? (
                          <td className="px-1 py-2">
                            {!item?.IsSignyourself && item?.Placeholders && (
                              <>{formatStatusRow(item)}</>
                            )}
                          </td>
                        ) : (
                          <td className="p-2 text-center">
                            {!item?.IsSignyourself && item?.Placeholders ? (
                              <button
                                onClick={() => handleViewSigners(item)}
                                className="op-link op-link-primary"
                              >
                                {t("view")}
                              </button>
                            ) : (
                              "-"
                            )}
                          </td>
                        )}
                        <td className="px-2 py-2">
                          <div className="text-base-content min-w-max flex flex-row gap-x-2 gap-y-1 justify-start items-center">
                            {props.actions?.length > 0 &&
                              props.actions.map((act, index) =>
                                isTemplateReport ? (
                                  <React.Fragment key={index}>
                                    {(item.ExtUserPtr?.objectId ===
                                      extClass?.[0]?.objectId ||
                                      act.btnLabel === "Use") && (
                                      <div
                                        role="button"
                                        data-tut={act?.selector}
                                        key={index}
                                        onClick={() =>
                                          handleActionBtn(act, item)
                                        }
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
                                            <ul className="absolute -right-1 top-auto z-[70] w-52 op-dropdown-content op-menu shadow-black/20 shadow bg-base-100 text-base-content rounded-box">
                                              {act.subaction?.map((subact) => (
                                                <li
                                                  key={subact.btnId}
                                                  onClick={() =>
                                                    handleActionBtn(
                                                      subact,
                                                      item
                                                    )
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
                                      isOpen={
                                        isModal["duplicate_" + item.objectId]
                                      }
                                      handleClose={handleCloseModal}
                                    >
                                      <div className=" flex flex-col px-4 pb-3 pt-2 ">
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
                                      </div>
                                    </ModalUi>
                                  </React.Fragment>
                                ) : (
                                  <React.Fragment key={index}>
                                    {handleBtnVisibility(act, item) && (
                                      <div
                                        role="button"
                                        data-tut={act?.selector}
                                        onClick={() =>
                                          handleActionBtn(act, item)
                                        }
                                        title={t(`btnLabel.${act.hoverLabel}`)}
                                        className={
                                          act.action !== "option"
                                            ? `${act?.btnColor || ""} op-btn op-btn-sm mr-1`
                                            : "text-base-content focus:outline-none text-lg mr-2 relative"
                                        }
                                      >
                                        <i className={act.btnIcon}></i>
                                        {act.btnLabel && (
                                          <span className="uppercase font-medium">
                                            {t(`btnLabel.${act.btnLabel}`)}
                                          </span>
                                        )}
                                        {/* doc report */}
                                        {isOption[item.objectId] &&
                                          act.action === "option" && (
                                            <ul className="absolute -right-1 top-auto z-[70] w-max op-dropdown-content op-menu shadow-black/20 shadow bg-base-100 text-base-content rounded-box">
                                              {act.subaction?.map(
                                                (subact) =>
                                                  !restrictBtn(
                                                    item,
                                                    subact
                                                  ) && (
                                                    <li
                                                      key={subact.btnId}
                                                      onClick={() =>
                                                        handleActionBtn(
                                                          subact,
                                                          item
                                                        )
                                                      }
                                                      title={t(
                                                        `btnLabel.${subact.hoverLabel}`
                                                      )}
                                                    >
                                                      <span>
                                                        <i
                                                          className={`${subact.btnIcon} mr-1.5`}
                                                        ></i>
                                                        {subact.btnLabel && (
                                                          <span className="text-[13px] capitalize font-medium">
                                                            {t(
                                                              `btnLabel.${subact.btnLabel}`
                                                            )}
                                                          </span>
                                                        )}
                                                      </span>
                                                    </li>
                                                  )
                                              )}
                                            </ul>
                                          )}
                                      </div>
                                    )}
                                  </React.Fragment>
                                )
                              )}
                          </div>
                          {isModal["recreatedocument_" + item.objectId] && (
                            <ModalUi isOpen handleClose={handleCloseModal}>
                              {actLoader[item.objectId] && (
                                <div className="absolute h-full w-full flex justify-center items-center rounded-box bg-black/30">
                                  <Loader />
                                </div>
                              )}
                              <h3 className="text-base-content font-bold text-lg pt-[15px] px-[20px]">
                                {t("fix-&-resend-document")}
                              </h3>
                              <div className="p-[15px] md:p-[20px]">
                                <div className="text-lg font-normal text-center">
                                  <img
                                    src={recreatedoc}
                                    alt="recreate-doc"
                                    className="mx-auto w-[200px] h-auto"
                                  />
                                  <p className="text-sm md:text-base md:px-2 mt-2">
                                    {t("do-you-want-recreate-document?")}
                                  </p>
                                </div>
                                <hr className="bg-[#ccc] mt-2.5" />
                                <div className="flex items-center justify-center mt-[14px] md:mt-[16px] gap-2 text-white">
                                  <button
                                    onClick={() => handleRecreateDoc(item)}
                                    className="op-btn op-btn-primary focus:outline-none text-sm relative px-4"
                                  >
                                    {t("start-editing")}
                                  </button>
                                  <button
                                    onClick={handleCloseModal}
                                    className="op-btn op-btn-secondary focus:outline-none text-sm relative px-8"
                                  >
                                    {t("cancel")}
                                  </button>
                                </div>
                              </div>
                            </ModalUi>
                          )}
                          {isModal["saveastemplate_" + item.objectId] && (
                            <ModalUi
                              isOpen
                              title={
                                isSuccess[item.objectId]
                                  ? t("template-created")
                                  : t("btnLabel.Save as template")
                              }
                              handleClose={handleCloseTemplate}
                            >
                              {isSuccess[item.objectId] ? (
                                <div className="mx-[10px] my-[15px]">
                                  <p className="text-base text-center">
                                    {t("how-would-you-like-to-proceed?")}
                                  </p>
                                  <div className="flex flex-wrap gap-1 items-center justify-center mt-2">
                                    <button
                                      className="op-btn-primary op-btn op-btn-sm focus:outline-none text-sm relative"
                                      onClick={() =>
                                        handleUseTemplate(
                                          templateId,
                                          "placeHolderSign"
                                        )
                                      }
                                    >
                                      <i className="fa-light fa-plus"></i>{" "}
                                      {t("btnLabel.Use")}
                                    </button>
                                    <button
                                      className="op-btn-secondary op-btn op-btn-sm focus:outline-none text-sm relative"
                                      onClick={() =>
                                        handleBulkSendTemplate(
                                          templateId,
                                          item.objectId
                                        )
                                      }
                                    >
                                      <i className="fa-light fa-plus"></i>{" "}
                                      {
                                            `${t(`btnLabel.Quick send`)}`
                                      }
                                    </button>
                                    <button
                                      className="op-btn-secondary op-btn op-btn-sm focus:outline-none text-sm relative"
                                      onClick={() =>
                                        navigate(`/template/${templateId}`)
                                      }
                                    >
                                      <i className="fa-light fa-pen"></i>{" "}
                                      {t(`btnLabel.Edit`)}
                                    </button>
                                  </div>
                                  <Link
                                    to="/report/6TeaPr321t"
                                    className="cursor-pointer underline text-sm w-full flex justify-center mt-2"
                                  >
                                    {t("go-to-manage-templates")}
                                  </Link>
                                </div>
                              ) : (
                                <div className="m-[20px]">
                                  <div className="text-lg font-normal text-base-content">
                                    {t("save-as-template-?")}
                                  </div>
                                  <hr className="bg-[#ccc] mt-3" />
                                  <div className="flex items-center mt-3 gap-2 text-white">
                                    <button
                                      onClick={() => handleSaveAsTemplate(item)}
                                      className="op-btn op-btn-primary w-[100px]"
                                    >
                                      {t("yes")}
                                    </button>
                                    <button
                                      onClick={handleCloseTemplate}
                                      className="op-btn op-btn-secondary w-[100px]"
                                    >
                                      {t("no")}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </ModalUi>
                          )}
                          {isModal["extendexpiry_" + item.objectId] && (
                            <ModalUi
                              isOpen
                              title={t("btnLabel.extend-expiry-date")}
                              reduceWidth={"md:max-w-[450px]"}
                              handleClose={handleCloseModal}
                            >
                              <form
                                className="px-4 py-2 flex flex-col"
                                onSubmit={(e) => handleUpdateExpiry(e, item)}
                              >
                                <label className="mr-2">
                                  {t("expiry-date")} {"(dd-mm-yyyy)"}
                                </label>
                                <input
                                  type="date"
                                  className="rounded-full mb-2 bg-base-300 w-full px-4 py-2 text-base-content border-2 hover:border-spacing-2"
                                  defaultValue={
                                    item?.ExpiryDate?.iso?.split("T")?.[0]
                                  }
                                  onChange={(e) => {
                                    setExpiryDate(e.target.value);
                                  }}
                                />
                                <div className="flex justify-start mb-1">
                                  <button
                                    type="submit"
                                    className="op-btn op-btn-primary"
                                  >
                                    {t("update")}
                                  </button>
                                </div>
                              </form>
                            </ModalUi>
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
                                        onClick={(e) =>
                                          handleShareWith(e, item)
                                        }
                                        className="op-btn op-btn-primary ml-[10px] my-3"
                                      >
                                        {t("submit")}
                                      </button>
                              </div>
                            </div>
                          )}
                          {isViewShare[item.objectId] && (
                            <ModalUi
                              isOpen
                              showHeader={isTemplateReport}
                              title={t("signers")}
                              reduceWidth={"md:max-w-[450px]"}
                              handleClose={() => setIsViewShare({})}
                            >
                              {!isTemplateReport && (
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
                                    {isTemplateReport && (
                                      <th className="p-2 pl-3 w-[30%]">
                                        {t("roles")}
                                      </th>
                                    )}
                                    <th className="pl-3 py-2">
                                      {isTemplateReport
                                        ? t("email")
                                        : t("signers")}
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {item.Placeholders.map(
                                    (x, i) =>
                                      x.Role !== "prefill" && (
                                        <tr
                                          key={i}
                                          className="text-sm font-medium"
                                        >
                                          {isTemplateReport && (
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
                                      )
                                  )}
                                </tbody>
                              </table>
                            </ModalUi>
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
                                        onClick={() => copytoclipboard(share)}
                                      >
                                        <i className="fa-light fa-copy" />
                                        {copied[share.email]
                                          ? t("copied")
                                          : t("copy")}
                                      </button>
                                    </div>
                                  </div>
                                ))}
                                <p
                                  id="copyUrl"
                                  ref={copyUrlRef}
                                  className="hidden"
                                ></p>
                              </div>
                            </ModalUi>
                          )}
                          {isRevoke[item.objectId] && (
                            <ModalUi
                              isOpen
                              title={t("revoke-document")}
                              handleClose={handleClose}
                            >
                              <div className="m-[20px]">
                                <div className="text-sm md:text-lg font-normal text-base-content">
                                  {t("revoke-document-alert")}
                                </div>
                                <div className="mt-2">
                                  <textarea
                                    rows={3}
                                    placeholder="Reason (optional)"
                                    className="px-4 op-textarea op-textarea-bordered text-base-content focus:outline-none hover:border-base-content w-full text-xs"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                  ></textarea>
                                </div>
                                <div className="flex items-center mt-3 gap-2">
                                  <button
                                    onClick={() => handleRevoke(item)}
                                    className="op-btn op-btn-primary px-6"
                                  >
                                    {t("yes")}
                                  </button>
                                  <button
                                    onClick={handleClose}
                                    className="op-btn op-btn-secondary px-6"
                                  >
                                    {t("no")}
                                  </button>
                                </div>
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
                                  className="op-input op-input-bordered op-input-sm w-full  focus:outline-none hover:border-base-content text-[10px]"
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
                          {isDownloadModal[item.objectId] && (
                            <DownloadPdfZip
                              setIsDownloadModal={setIsDownloadModal}
                              isDownloadModal={isDownloadModal[item.objectId]}
                              pdfDetails={[item]}
                              isDocId={false}
                            />
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </>
              )}
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
        <ModalUi
          title={t("add-contact")}
          isOpen={isContactform}
          handleClose={handleContactFormModal}
        >
          <AddSigner
            handleUserData={handleUserData}
            closePopup={handleContactFormModal}
          />
        </ModalUi>
        {isModal?.["edit_" + contact.objectId] && (
          <ModalUi
            isOpen
            title={t("edit-contact")}
            handleClose={handleCloseModal}
          >
            <EditContactForm
              contact={contact}
              handleClose={handleCloseModal}
              handleEditContact={handleEditContact}
            />
          </ModalUi>
        )}
      </div>
    </div>
  );
};

export default ReportTable;
