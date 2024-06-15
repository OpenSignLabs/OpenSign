import React, { useState, useEffect, useRef } from "react";
import folder from "../../assets/images/folder.png";
import "../../styles/opensigndrive.css";
import pdfLogo from "../../assets/images/pdf3.png";
import axios from "axios";
import * as ContextMenu from "@radix-ui/react-context-menu";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";
import Table from "react-bootstrap/Table";
import * as HoverCard from "@radix-ui/react-hover-card";
import ModalUi from "../../primitives/ModalUi";
import FolderModal from "../shared/fields/FolderModal";

function DriveBody(props) {
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
    props.setFolderName((prev) => [...prev, folderData]);
    props.setIsLoading({
      isLoad: true,
      message: "This might take some time"
    });
    props.setDocId(data.objectId);
    props.setPdfData([]);
    props.setSkip(0);
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
      const docData = props.pdfData;
      const updatedData = docData.map((item) => {
        if (item.objectId === docId) {
          // If the item's ID matches the target ID, update the name
          return { ...item, Name: renameValue };
        }
        // If the item's ID doesn't match, keep it unchanged
        return item;
      });
      props.setPdfData(updatedData);
      props.sortingData(null, null, updatedData);
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
        .then(() => {
          // const res = result.data;
          // console.log("res", res);
        })
        .catch((err) => {
          console.log("Err ", err);
          props.setIsAlert({
            isShow: true,
            alertMessage: "something went wrong"
          });
        });
    }
  };

  //function for navigate user to microapp-signature component
  const checkPdfStatus = async (data) => {
    const signerExist = data.Signers && data.Signers;
    const isDecline = data.IsDeclined && data.IsDeclined;
    const isPlaceholder = data.Placeholders && data.Placeholders;
    const signedUrl = data.SignedUrl;
    //checking if document has completed and request signature flow
    if (data?.IsCompleted && signerExist?.length > 0) {
      navigate(`/pdfRequestFiles/${data.objectId}`);
    }
    //checking if document has completed and signyour-self flow
    else if (!signerExist && !isPlaceholder) {
      navigate(`/signaturePdf/${data.objectId}`);
    }
    //checking if document has declined by someone
    else if (isDecline) {
      navigate(`/pdfRequestFiles/${data.objectId}`);
      //checking draft type document
    } else if (
      signerExist?.length > 0 &&
      isPlaceholder?.length > 0 &&
      !signedUrl
    ) {
      navigate(`/placeHolderSign/${data.objectId}`);
    }
    //Inprogress document
    else if (isPlaceholder?.length > 0 && signerExist?.length > 0) {
      navigate(`/pdfRequestFiles/${data.objectId}`);
    } //placeholder draft document
    else if (
      (signerExist?.length > 0 &&
        (!isPlaceholder || isPlaceholder?.length === 0)) ||
      ((!signerExist || signerExist?.length === 0) && isPlaceholder?.length > 0)
    ) {
      navigate(`/placeHolderSign/${data.objectId}`);
    }
  };

  const handleMenuItemClick = (selectType, data) => {
    switch (selectType) {
      case "Download": {
        const pdfName = data && data.Name;
        const pdfUrl = data && data.SignedUrl ? data.SignedUrl : data.URL;
        saveAs(pdfUrl, `${sanitizeFileName(pdfName)}_signed_by_OpenSign™.pdf`);
        break;
      }
      case "Rename": {
        setRenameValue(data.Name);
        setRename(data.objectId);
        break;
      }
      case "Delete": {
        setIsDeleteDoc(true);
        setSelectDoc(data);
        break;
      }
      case "Move": {
        handleMoveDocument(data);
        break;
      }
      default:
        null;
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
          const updatedData = props.pdfData.filter((x) => x.objectId !== docId);
          props.setPdfData(updatedData);
        }
      })
      .catch((err) => {
        console.log("Err ", err);
        props.setIsAlert({
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
            const updatedData = props.pdfData.filter(
              (x) => x.objectId !== updateDocId
            );
            props.setPdfData(updatedData);
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

  //component to handle type of document and render according to type
  const handleFolderData = (data, ind, listType) => {
    let createddate, status, isDecline, signerExist, isComplete;
    if (data.Type !== "Folder") {
      const expireDate = data.ExpiryDate && data.ExpiryDate.iso;
      const createdDate = data.createdAt && data.createdAt;
      createddate = new Date(createdDate).toLocaleDateString();
      isComplete = data.IsCompleted && data.IsCompleted ? true : false;
      isDecline = data.IsDeclined && data.IsDeclined;
      signerExist = data.Signers && data.Signers;
      const signedUrl = data.SignedUrl;

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
      } else if (!signedUrl) {
        status = "Draft";
      } else if (isExpire) {
        status = "Expired";
      } else {
        status = "In Progress";
      }
    }

    const signersName = () => {
      const getSignersName = signerExist.map((data) => data.Name);
      const signerName = getSignersName.join(", ");

      return (
        <span className="statusSpan w-[90%] break-words">{signerName}</span>
      );
    };
    return listType === "table" ? (
      data.Type === "Folder" ? (
        <tr onClick={() => handleOnclikFolder(data)}>
          <td className="cursor-pointer flex items-center">
            <i
              className="fa fa-folder mr-[8px] text-[26px] text-[#f0ad26]"
              aria-hidden="true"
            ></i>
            <span className="text-[12px] font-medium">{data.Name}</span>
          </td>
          <td>_</td>
          <td>Folder</td>
          <td>_</td>
          <td>_</td>
        </tr>
      ) : (
        <tr onClick={() => checkPdfStatus(data)}>
          <td className="cursor-pointer flex items-center">
            <i className="fa fa-file-pdf mr-[8px] text-[26px] text-[#ed4d0e]"></i>
            <span className="text-[12px] font-medium">{data.Name}</span>
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
              className="fa fa-download mr-[8px] text-[#ed280e]"
              aria-hidden="true"
            ></i>
          </td>
        </tr>
      )
    ) : listType === "list" && data.Type === "Folder" ? (
      <div key={ind} className="icon-container">
        <ContextMenu.Root>
          <ContextMenu.Trigger className="ContextMenuTrigger">
            <div data-tut={props.dataTutSeventh}>
              <img
                alt="folder"
                onClick={() => handleOnclikFolder(data)}
                src={folder}
                className="w-full h-full"
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
                  className="w-[100px] border-[1.5px] border-black rounded-sm text-[10px]"
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
                <i className="fa-solid fa-font mr-[8px]"></i>
                <span>Rename</span>
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
                    className="w-full h-full"
                    src={pdfLogo}
                    onClick={() => checkPdfStatus(data)}
                    data-tut={props.dataTutSixth}
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
                      className="w-[100px] border-[1.5px] border-black rounded-sm text-[10px]"
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
                        <i className={menu.icon}></i>
                        <span className="ml-[8px]">{menu.type}</span>
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
            <strong className="text-[13px]">Title: </strong>
            <span className="statusSpan" style={{ marginBottom: "0px" }}>
              {" "}
              {data.Name}
            </span>
            <br />
            <strong className="text-[13px]">Status: </strong>
            <span className="statusSpan"> {status}</span>
            <br />
            <strong className="text-[13px]">Created Date: </strong>
            <span className="statusSpan">{createddate}</span>
            <br />
            {signerExist && (
              <>
                <strong className="text-[13px]">Signers: </strong>
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
      {props.isList ? (
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
              {props.pdfData.map((data, ind) => {
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
        <div className="flex flex-row flex-wrap items-center mt-1 pb-[20px] mx-[5px]">
          {props.pdfData.map((data, ind) => {
            return <div key={ind}>{handleFolderData(data, ind, "list")}</div>;
          })}
        </div>
      )}

      {isOpenMoveModal && (
        <FolderModal
          onSuccess={handleMoveFolder}
          isOpenModal={isOpenMoveModal}
          folderCls={"contracts_Document"}
          setIsOpenMoveModal={setIsOpenMoveModal}
          setPdfData={props.setPdfData}
        />
      )}
      <ModalUi
        isOpen={isDeleteDoc}
        title={"Delete Document"}
        handleClose={() => setIsDeleteDoc(false)}
      >
        <div className="h-full p-[20px] text-base-content">
          <p>Are you sure you want to delete this document?</p>
          <div className="h-[1px] w-full bg-[#9f9f9f] my-[15px]"></div>
          <button
            onClick={() => handleDeleteDocument(selectDoc)}
            type="button"
            className="op-btn op-btn-primary mr-2"
          >
            Yes
          </button>
          <button
            onClick={() => setIsDeleteDoc(false)}
            type="button"
            className="op-btn op-btn-neutral"
          >
            No
          </button>
        </div>
      </ModalUi>
    </>
  );
}

export default DriveBody;
