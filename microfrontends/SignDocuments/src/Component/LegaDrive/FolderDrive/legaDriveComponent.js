import React, { useState, useEffect, useRef } from "react";
import folder from "../../../assests/folder.png";
import "../LegaDrive.css";
import draftDoc from "../../../assests/draftDoc1.png";
import pdfLogo from "../../../assests/pdf3.png";
import axios from "axios";
import * as ContextMenu from "@radix-ui/react-context-menu";
import { saveAs } from "file-saver";
import { getHostUrl } from "../../../utils/Utils";
import { useNavigate } from "react-router-dom";
import Table from "react-bootstrap/Table";
import * as HoverCard from "@radix-ui/react-hover-card";
import SelectFolder from "../../../premitives/SelectFolder";
import ModalUi from "../../../premitives/ModalUi";
import { themeColor } from "../../../utils/ThemeColor/backColor";

function PdfFileComponent({
  pdfData,
  setFolderName,
  setDocId,
  setIsLoading,
  setPdfData,
  isList,
  setIsAlert
}) {
  const [rename, setRename] = useState("");
  const [renameValue, setRenameValue] = useState("");
  const inputRef = useRef(null);
  const [isOpenMoveModal, setIsOpenMoveModal] = useState(false);
  const [selectDoc, setSelectDoc] = useState();
  const [isDeleteDoc, setIsDeleteDoc] = useState(false);
  const contextMenu = [
    { type: "Download", icon: "fa-solid fa-arrow-down" },
    { type: "Rename", icon: "fa-solid fa-font" },
    { type: "Move", icon: "fa-solid fa-file-export" },
    { type: "Delete", icon: "fa-solid fa-trash" }
  ];
  const navigate = useNavigate();

  //to focus input box on press rename to change doc name
  useEffect(() => {
    if (rename && inputRef.current) {
      // console.log("ref", inputRef.current)
      setTimeout(() => {
        inputRef.current.focus();
      }, 10);
    }
  }, [rename]);

  //function to handle folder component
  const handleOnclikFolder = (data) => {
    const folderData = {
      name: data.Name,
      objectId: data.objectId
    };
    setFolderName((prev) => [...prev, folderData]);
    const loadObj = {
      isLoad: true,
      message: "This might take some time"
    };

    setIsLoading(loadObj);
    setDocId(data.objectId);
  };
  //function for change doc name and update doc name in  _document class
  const handledRenameDoc = async (data) => {
    setRename("");
    const trimmedValue = renameValue.trim();

    if (trimmedValue.length > 0) {
      const updateName = {
        Name: renameValue
      };
      const docId = data.objectId;

      const docData = pdfData;

      const updatedData = docData.map((item) => {
        if (item.objectId === docId) {
          // If the item's ID matches the target ID, update the name
          return { ...item, Name: renameValue };
        }
        // If the item's ID doesn't match, keep it unchanged
        return item;
      });

      setPdfData(updatedData);
      await axios
        .put(
          `${localStorage.getItem("baseUrl")}classes/${localStorage.getItem(
            "_appName"
          )}_Document/${docId}`,
          updateName,
          {
            headers: {
              "Content-Type": "application/json",
              "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
              "X-Parse-Session-Token": localStorage.getItem("accesstoken")
            }
          }
        )
        .then((result) => {
          // const res = result.data;
          // console.log("res", res);
        })
        .catch((err) => {
          setIsAlert({
            isShow: true,
            alertMessage: "something went wrong"
          });
        });
    }
  };

  //function for navigate user to microapp-signature component
  const checkPdfStatus = async (data) => {
    const hostUrl = getHostUrl();

    const signerExist = data.Signers && data.Signers;
    const isDecline = data.IsDeclined && data.IsDeclined;
    const isPlaceholder = data.Placeholders && data.Placeholders;

    //checking if document has completed and request signature flow
    if (data?.IsCompleted && signerExist?.length > 0) {
      navigate(`${hostUrl}pdfRequestFiles/${data.objectId}`);
    }
    //checking if document has completed and signyour-self flow
    else if (!signerExist && !isPlaceholder) {
      navigate(`${hostUrl}signaturePdf/${data.objectId}`);
    }
    //checking if document has declined by someone
    else if (isDecline) {
      navigate(`${hostUrl}pdfRequestFiles/${data.objectId}`);
      //checking draft type document
    }
    //Inprogress document
    else if (isPlaceholder?.length > 0 && signerExist?.length > 0) {
      navigate(`${hostUrl}pdfRequestFiles/${data.objectId}`);
    } //placeholder draft document
    else if (
      (signerExist?.length > 0 &&
        (!isPlaceholder || isPlaceholder?.length === 0)) ||
      ((!signerExist || signerExist?.length === 0) && isPlaceholder?.length > 0)
    ) {
      navigate(`${hostUrl}placeHolderSign/${data.objectId}`);
    }
  };

  const handleMenuItemClick = (selectType, data) => {
    switch (selectType) {
      case "Download":
        const pdfName = data && data.Name;
        const pdfUrl = data && data.SignedUrl ? data.SignedUrl : data.URL;
        saveAs(pdfUrl, `${sanitizeFileName(pdfName)}_signed_by_OpenSign™.pdf`);
        break;
      case "Rename":
        setRenameValue(data.Name);
        setRename(data.objectId);
        break;
      case "Delete":
        setIsDeleteDoc(true);
        setSelectDoc(data);
        break;

      case "Move":
        handleMoveDocument(data);
        break;
    }
  };
  //function for delete document
  const handleDeleteDocument = async (docData) => {
    setIsDeleteDoc(false);
    const docId = docData.objectId;
    const data = {
      IsArchive: true
    };

    await axios
      .put(
        `${localStorage.getItem("baseUrl")}classes/${localStorage.getItem(
          "_appName"
        )}_Document/${docId}`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
            "X-Parse-Session-Token": localStorage.getItem("accesstoken")
          }
        }
      )
      .then((result) => {
        const res = result.data;
        if (res) {
          const updatedData = pdfData.filter((x) => x.objectId !== docId);
          setPdfData(updatedData);
        }
      })
      .catch((err) => {
        setIsAlert({
          isShow: true,
          alertMessage: "something went wrong"
        });
      });
  };
  const handleMoveDocument = async (docData) => {
    setIsOpenMoveModal(true);
    setSelectDoc(docData);
  };
  //function for move document from one folder to another folder
  const handleMoveFolder = async (selectFolderData) => {
    const selecFolderId = selectDoc?.Folder?.objectId;
    const moveFolderId = selectFolderData?.ObjectId;
    let updateDocId = selectDoc?.objectId;
    let updateData;
    const checkExist = moveFolderId
      ? selecFolderId === moveFolderId
        ? true
        : false
      : selecFolderId
        ? false
        : true;
    if (!checkExist) {
      if (moveFolderId) {
        updateData = {
          Folder: {
            __type: "Pointer",
            className: `${localStorage.getItem("_appName")}_Document`,
            objectId: moveFolderId
          }
        };
      } else {
        updateData = {
          Folder: { __op: "Delete" }
        };
      }

      await axios
        .put(
          `${localStorage.getItem("baseUrl")}classes/${localStorage.getItem(
            "_appName"
          )}_Document/${updateDocId}`,
          updateData,
          {
            headers: {
              "Content-Type": "application/json",
              "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
              "X-Parse-Session-Token": localStorage.getItem("accesstoken")
            }
          }
        )

        .then((Listdata) => {
          // console.log("Listdata ", Listdata);
          const res = Listdata.data;
          if (res) {
            const updatedData = pdfData.filter(
              (x) => x.objectId !== updateDocId
            );
            setPdfData(updatedData);
          }
        })
        .catch((err) => {
          console.log("err", err);
        });

      setIsOpenMoveModal(false);
    } else {
      alert("folder already exist!");
      setIsOpenMoveModal(false);
    }
  };

  const sanitizeFileName = (pdfName) => {
    // Replace spaces with underscore
    return pdfName.replace(/ /g, "_");
  };

  const handleEnterPress = (e, data) => {
    if (e.key === "Enter") {
      handledRenameDoc(data);
    }
  };

  const handleDraftDoc = (data) => {
    window.location.hash = `/mf/remoteUrl=aHR0cHM6Ly9xaWstYWktb3JnLmdpdGh1Yi5pby9MZWdhR2VuaWUtTWljcm9hcHBWMi9yZW1vdGVFbnRyeS5qcw==&moduleToLoad=AppRoutes&remoteName=legageniemicroapp/legagenie?${data.objectId}`;
  };

  //component to handle type of document and render according to type
  const handleFolderData = (data, ind, listType) => {
    let createddate, status, isDecline, signerExist, isComplete, isPlaceholder;
    if (data.Type !== "Folder") {
      const expireDate = data.ExpiryDate && data.ExpiryDate.iso;
      const createdDate = data.createdAt && data.createdAt;
      createddate = new Date(createdDate).toLocaleDateString();
      isComplete = data.IsCompleted && data.IsCompleted ? true : false;
      isDecline = data.IsDeclined && data.IsDeclined;
      isPlaceholder = data.Placeholders && data.Placeholders;
      signerExist = data.Signers && data.Signers;

      const expireUpdateDate = new Date(expireDate).getTime();
      const currDate = new Date().getTime();
      let isExpire = false;
      if (currDate > expireUpdateDate) {
        isExpire = true;
      }

      if (isComplete) {
        status = "Completed";
      } else if (isDecline) {
        status = "Declined";
      } else if (!signerExist || signerExist?.length === 0) {
        status = "Draft";
      } else if (
        signerExist?.length > 0 &&
        (!isPlaceholder || isPlaceholder?.length === 0)
      ) {
        status = "Draft";
      } else if (isExpire) {
        status = "Expired";
      } else {
        status = "In Progress";
      }
    }

    const signersName = () => {
      const getSignersName = signerExist.map((data) => data.Name);
      const signerName = getSignersName.join(",");

      return (
        <span
          className="statusSpan"
          style={{ width: "90%", wordWrap: "break-word" }}
        >
          {signerName}{" "}
        </span>
      );
    };
    return listType === "table" ? (
      data.Type === "Folder" ? (
        <tr onClick={() => handleOnclikFolder(data)}>
          <td
            style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
          >
            <i
              className="fa fa-folder"
              aria-hidden="true"
              style={{ color: "#f0ad26", marginRight: "8px", fontSize: "26px" }}
            ></i>

            <span style={{ fontSize: "12px", fontWeight: "500" }}>
              {data.Name}
            </span>
          </td>
          <td>_</td>
          <td>Folder</td>
          <td>_</td>
          <td>_</td>
        </tr>
      ) : data.Type === "AIDoc" ? (
        <tr onClick={() => handleDraftDoc(data)}>
          <td
            style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
          >
            <i
              className="fa fa-file-text"
              style={{ color: "#0ea3ed", marginRight: "8px", fontSize: "26px" }}
            ></i>

            <span style={{ fontSize: "12px", fontWeight: "500" }}>
              {data.Name}
            </span>
          </td>
          <td>{createddate}</td>
          <td>LegaGenie Draft</td>
          <td>_</td>
          <td>_</td>
        </tr>
      ) : (
        <tr onClick={() => checkPdfStatus(data)}>
          <td
            style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
          >
            <i
              className="fa fa-file-pdf"
              style={{ color: "#ed4d0e", marginRight: "8px", fontSize: "26px" }}
            ></i>

            <span style={{ fontSize: "12px", fontWeight: "500" }}>
              {data.Name}
            </span>
          </td>
          <td>{createddate}</td>
          <td>Pdf</td>
          <td>{status}</td>
          <td>
            <i
              onClick={(e) => {
                e.stopPropagation();
                handleMenuItemClick("Download", data);
              }}
              className="fa fa-download"
              aria-hidden="true"
              style={{ color: "#ed280e", marginRight: "8px" }}
            ></i>
          </td>
        </tr>
      )
    ) : listType === "list" && data.Type === "Folder" ? (
      <div key={ind} className="folderBox">
        <ContextMenu.Root>
          <ContextMenu.Trigger className="ContextMenuTrigger">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                cursor: "pointer"
              }}
            >
              <img
                alt="no img"
                onClick={() => handleOnclikFolder(data)}
                src={folder}
                width={100}
                height={103}
              />
              {rename === data.objectId ? (
                <input
                  onFocus={() => {
                    inputRef.current.setSelectionRange(0, 0);
                    const input = inputRef.current;
                    if (input) {
                      input.select();
                    }
                  }}
                  autoFocus={true}
                  type="text"
                  onBlur={() => handledRenameDoc(data)}
                  onKeyDown={(e) => handleEnterPress(e, data)}
                  ref={inputRef}
                  defaultValue={renameValue}
                  // value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  style={{
                    width: "100px",
                    border: "1.5px solid black",
                    borderRadius: "2px",
                    fontSize: "10px"
                  }}
                />
              ) : (
                <span className="foldName">{data.Name}</span>
              )}
            </div>
          </ContextMenu.Trigger>

          <ContextMenu.Portal>
            <ContextMenu.Content
              className="ContextMenuContent"
              sideOffset={5}
              align="end"
            >
              <ContextMenu.Item
                onClick={() => handleMenuItemClick("Rename", data)}
                className="ContextMenuItem"
              >
                <i class="fa-solid fa-font"></i>
                <span style={{ marginLeft: "8px" }}>Rename</span>
              </ContextMenu.Item>
            </ContextMenu.Content>
          </ContextMenu.Portal>
        </ContextMenu.Root>
      </div>
    ) : data.Type === "AIDoc" ? (
      <div key={ind} className="folderBox">
        <ContextMenu.Root>
          <ContextMenu.Trigger className="ContextMenuTrigger">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                cursor: "pointer"
              }}
            >
              <img
                alt="no img"
                onClick={() => handleDraftDoc(data)}
                src={draftDoc}
                width={100}
                height={103}
              />
              {rename === data.objectId ? (
                <input
                  onFocus={() => {
                    inputRef.current.setSelectionRange(0, 0);
                    const input = inputRef.current;
                    if (input) {
                      input.select();
                    }
                  }}
                  autoFocus={true}
                  type="text"
                  onBlur={() => handledRenameDoc(data)}
                  onKeyDown={(e) => handleEnterPress(e, data)}
                  ref={inputRef}
                  defaultValue={renameValue}
                  // value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  style={{
                    width: "100px",
                    border: "1.5px solid black",
                    borderRadius: "2px",
                    fontSize: "10px"
                  }}
                />
              ) : (
                <span className="foldName">{data.Name}</span>
              )}
            </div>
          </ContextMenu.Trigger>

          <ContextMenu.Portal>
            <ContextMenu.Content
              className="ContextMenuContent"
              sideOffset={5}
              align="end"
            >
              <ContextMenu.Item
                onClick={() => handleMenuItemClick("Rename", data)}
                className="ContextMenuItem"
              >
                <i class="fa-solid fa-font"></i>
                <span style={{ marginLeft: "8px" }}>Rename</span>
              </ContextMenu.Item>
            </ContextMenu.Content>
          </ContextMenu.Portal>
        </ContextMenu.Root>
      </div>
    ) : (
      <HoverCard.Root openDelay={0} closeDelay={100}>
        <HoverCard.Trigger asChild>
          <div>
            <ContextMenu.Root>
              <div className="icon-container">
                <ContextMenu.Trigger className="ContextMenuTrigger">
                  <img
                    alt="PDF"
                    className="pdf-icon"
                    src={pdfLogo}
                    onClick={() => checkPdfStatus(data)}
                  />
                  {rename === data.objectId ? (
                    <input
                      autoFocus={true}
                      type="text"
                      onFocus={() => {
                        inputRef.current.setSelectionRange(0, 0);
                        const input = inputRef.current;
                        if (input) {
                          input.select();
                        }
                      }}
                      onBlur={() => handledRenameDoc(data)}
                      onKeyDown={(e) => handleEnterPress(e, data)}
                      ref={inputRef}
                      defaultValue={renameValue}
                      // value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      style={{
                        width: "100px",
                        border: "1.5px solid black",
                        borderRadius: "2px",
                        fontSize: "10px"
                      }}
                    />
                  ) : (
                    <span className="fileName">{data.Name}</span>
                  )}
                </ContextMenu.Trigger>
                {status === "Completed" ? (
                  <div className="status-badge completed">
                    <i className="fas fa-check-circle"></i>
                  </div>
                ) : status === "Declined" ? (
                  <div className="status-badge declined">
                    <i className="fa fa-thumbs-down"></i>
                  </div>
                ) : status === "Expired" ? (
                  <div className="status-badge expired">
                    <i className="fa fa-hourglass-end"></i>
                  </div>
                ) : status === "Draft" ? (
                  <div className="status-badge draft">
                    <i className="fa fa-file"></i>
                  </div>
                ) : (
                  status === "In Progress" && (
                    <div className="status-badge in-progress">
                      <i className="fa fa-paper-plane"></i>
                    </div>
                  )
                )}
              </div>

              <ContextMenu.Portal>
                <ContextMenu.Content
                  className="ContextMenuContent"
                  sideOffset={5}
                  align="end"
                >
                  {contextMenu.map((menu, ind) => {
                    return (
                      <ContextMenu.Item
                        key={ind}
                        onClick={() => handleMenuItemClick(menu.type, data)}
                        className="ContextMenuItem"
                      >
                        <i class={menu.icon}></i>
                        <span style={{ marginLeft: "8px" }}>{menu.type}</span>
                      </ContextMenu.Item>
                    );
                  })}
                </ContextMenu.Content>
              </ContextMenu.Portal>
            </ContextMenu.Root>
          </div>
        </HoverCard.Trigger>
        <HoverCard.Portal>
          <HoverCard.Content className="HoverCardContent" sideOffset={5}>
            <strong style={{ fontSize: "13px" }}>Title: </strong>
            <span className="statusSpan" style={{ marginBottom: "0px" }}>
              {" "}
              {data.Name}
            </span>
            <br />
            <strong style={{ fontSize: "13px" }}>Status: </strong>
            <span className="statusSpan"> {status}</span>
            <br />
            <strong style={{ fontSize: "13px" }}>Created Date: </strong>
            <span className="statusSpan">{createddate}</span>
            <br />
            {signerExist && (
              <>
                <strong style={{ fontSize: "13px" }}>Signers: </strong>
                {/* <span className="statusSpan">kjefjjnejkfnkbjs bbfjkdsbjbfjkbjk kscbjkbjkb</span> */}
                {signersName()}
              </>
            )}

            <HoverCard.Arrow className="HoverCardArrow" />
          </HoverCard.Content>
        </HoverCard.Portal>
      </HoverCard.Root>
    );
  };

  //component to handle type of document and render according to type
  return (
    <>
      {isList ? (
        <div className="container" style={{ overflowX: "auto" }}>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Created Date</th>
                <th>Type</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pdfData.map((data, ind) => {
                return (
                  <React.Fragment key={ind}>
                    {handleFolderData(data, ind, "table")}
                  </React.Fragment>
                );
              })}
            </tbody>
          </Table>
        </div>
      ) : (
        <div className="pdfContainer">
          {pdfData.map((data, ind) => {
            return (
              <div className="box" key={ind}>
                {handleFolderData(data, ind, "list")}
              </div>
            );
          })}
        </div>
      )}
      {isOpenMoveModal && (
        <SelectFolder
          onSuccess={handleMoveFolder}
          isOpenModal={isOpenMoveModal}
          folderCls={"contracts_Document"}
          setIsOpenMoveModal={setIsOpenMoveModal}
          setPdfData={setPdfData}
        />
      )}
      <ModalUi
        isOpen={isDeleteDoc}
        headerColor={themeColor()}
        title={"Delete Document"}
        handleClose={() => {
          setIsDeleteDoc(false);
        }}
      >
        <div style={{ height: "100%", padding: 20 }}>
          <p>Are you sure you want to delete this document?</p>

          <div
            style={{
              height: "1px",
              backgroundColor: "#9f9f9f",
              width: "100%",
              marginTop: "15px",
              marginBottom: "15px"
            }}
          ></div>

          <button
            onClick={() => {
              handleDeleteDocument(selectDoc);
            }}
            style={{
              background: themeColor(),
              color: "white"
            }}
            type="button"
            className="finishBtn"
          >
            Yes
          </button>
          <button
            onClick={() => {
              setIsDeleteDoc(false);
            }}
            type="button"
            className="finishBtn cancelBtn"
          >
            No
          </button>
        </div>
      </ModalUi>
    </>
  );
}

export default PdfFileComponent;
