import React, { useState, useEffect } from "react";
import { SaveFileSize } from "../../constant/saveFileSize";
import Parse from "parse";
import sanitizeFileName from "../../primitives/sanitizeFileName";
import DropboxChooser from "./DropboxChoose";
const FileUpload = (props) => {
  const [parseBaseUrl] = useState(localStorage.getItem("baseUrl"));
  const [parseAppId] = useState(localStorage.getItem("parseAppId"));
  const [_fileupload, setFileUpload] = useState("");
  const [fileload, setfileload] = useState(false);
  const [Message] = useState(false);
  const [percentage, setpercentage] = useState(0);

  const REQUIRED_FIELD_SYMBOL = "*";

  useEffect(() => {
    if (!props.formData) {
      setFileUpload([]);
      props.onChange(undefined);
    }
    // eslint-disable-next-line
  }, [props.formData]);
  const onChange = (e) => {
    try {
      let files = e.target.files;
      if (typeof files[0] !== "undefined") {
        if (props.schema.filetypes && props.schema.filetypes.length > 0) {
          var fileName = files[0].name;
          var fileNameExt = fileName
            .substr(fileName.lastIndexOf(".") + 1)
            .toLowerCase();
          let Extensions = props.schema.filetypes.map((x) => x.toLowerCase());
          let arr = Extensions.filter((x) => x === fileNameExt);
          if (arr.length > 0) {
            console.log("multiple type");
          } else {
            alert(
              "Only these file types are accepted : " + Extensions.join(", ")
            );
          }
        }
        if (props.schema.maxfilesizeKB && props.schema.maxfilesizeKB !== "") {
          // console.log(Math.round(files[0].size / 1024));
          if (
            Math.round(Number(files[0].size) / 1024) >=
            props.schema.maxfilesizeKB
          ) {
            alert(
              `The selected file size is too large. Please select a file less than ${Math.round(
                props.schema.maxfilesizeKB / 1024
              )} MB`
            );
            return;
          }
        }
        handleFileUpload(files[0]);
      } else {
        alert("Please select file.");
        return false;
      }
    } catch (error) {
      alert(error.message);
      return false;
    }
  };

  const handleFileUpload = async (file) => {
    Parse.serverURL = parseBaseUrl;
    Parse.initialize(parseAppId);
    setfileload(true);
    const size = file.size;
    const fileName = file.name;
    const name = sanitizeFileName(fileName);
    const pdfFile = file;
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

      setFileUpload(response.url());
      props.onChange(response.url());
      setfileload(false);
      // The response object will contain information about the uploaded file
      // console.log("File uploaded:", response);

      // You can access the URL of the uploaded file using response.url()
      // console.log("File URL:", response.url());
      if (response.url()) {
        SaveFileSize(size, response.url());
        return response.url();
      }
    } catch (error) {
      setfileload(false);
      setpercentage(0);
      console.error("Error uploading file:", error);
    }
  };

  const dropboxSuccess = async (files) => {
    // console.log("file ", files);
    setfileload(true);
    const file = files[0];
    const url = file.link;
    const size = file.bytes;
    const mb = Math.round(file.bytes / Math.pow(1024, 2));

    if (mb > 10) {
      setTimeout(() => {
        alert(
          `The selected file size is too large. Please select a file less than 10 MB`
        );
      }, 500);
      return;
    } else {
      const name = sanitizeFileName(file.name);

      const parseFile = new Parse.File(name, { uri: url });

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
        // console.log("response.url() ", response.url());
        setFileUpload(response.url());
        props.onChange(response.url());
        setfileload(false);

        if (response.url()) {
          SaveFileSize(size, response.url());
          return response.url();
        }
      } catch (error) {
        setfileload(false);
        setpercentage(0);
        console.error("Error uploading file:", error);
      }
    }
  };
  const dropboxCancel = async () => {
    console.log("cancel clicked ");
  };
  let fileView =
    props.formData &&
    props.schema.uploadtype === "s3viajw" ? null : props.formData &&
      props.formData ? (
      <React.Fragment>
        <a
          href={props.formData}
          title={props.formData}
          style={{ paddingBottom: "10px", color: "blue" }}
        >
          Download
        </a>
      </React.Fragment>
    ) : fileload === false ? null : (
      <React.Fragment>
        <a
          href={_fileupload}
          title={_fileupload}
          style={{ paddingBottom: "10px" }}
        >
          Download
        </a>
        <br />
      </React.Fragment>
    );

  return (
    <React.Fragment>
      <div style={{ display: "inline-block" }}>
        <label htmlFor={props.name}>
          {props.schema.title}
          {props.required && (
            <span className="required">{REQUIRED_FIELD_SYMBOL}</span>
          )}
          {fileload ? (
            <div className="flex items-center gap-x-2">
              <div className="h-2 rounded-full w-[200px] md:w-[400px] bg-gray-200">
                <div
                  className="h-2 rounded-full bg-blue-500"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <span className="text-black text-sm">{percentage}%</span>
            </div>
          ) : (
            Message && (
              <span style={{ fontSize: "9px", marginLeft: "4px" }}>
                Processing will take 5-10 mins....
              </span>
            )
          )}
          {props.schema.helpbody ? (
            <div className="dropdown pull-right">
              <i
                className="far fa-question-circle dropdown-toggle hovereffect"
                aria-hidden="true"
                id="dropdownMenuButton"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
                style={{
                  fontSize: "12px",
                  color: "purple",
                  cursor: "pointer !important",
                  position: "relative",
                  bottom: "0px",
                  left: "0px",
                  paddingBottom: "4px",
                  paddingLeft: "4px"
                }}
              ></i>
              <div
                className="dropdown-menu"
                aria-labelledby="dropdownMenuButton"
                style={{
                  marginleft: "-121px",
                  margintop: "-14px",
                  position: "absolute",
                  padding: "10px",
                  top: "102px!important"
                }}
              >
                <br />
                {props.schema.helplink ? (
                  <a
                    href={props.schema.helplink}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-xs btn-primary"
                  >
                    Read more..
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}
          <span style={{ marginLeft: "10px" }}>{fileView}</span>
        </label>
      </div>

      <>
        {props.formData ? (
          <div className="flex gap-2 justify-center items-center">
            <div className="flex justify-between items-center px-2 py-[3px] w-full font-bold rounded border-[1px] border-[#ccc] text-gray-500 bg-white text-[13px]">
              <div className="break-all">
                file selected : {props.formData?.split("/")[3]?.split("_")[1]}
              </div>
              <div
                onClick={() => {
                  console.log("clicked");
                  setFileUpload([]);
                  props.onChange(undefined);
                }}
                className="cursor-pointer px-[10px] text-[20px] font-bold bg-white text-red-500"
              >
                <i className="fa-solid fa-xmark"></i>
              </div>
            </div>
            {process.env.DROPBOX_APP_KEY && (
              <DropboxChooser
                onSuccess={dropboxSuccess}
                onCancel={dropboxCancel}
              />
            )}
          </div>
        ) : (
          <div className="flex gap-2 justify-center items-center">
            <input
              type="file"
              id="hashfile"
              style={{
                border: "1px solid #ccc",
                color: "gray",
                backgroundColor: "white",
                padding: "5px 10px",
                borderRadius: "4px",
                fontSize: "13px",
                width: "100%",
                fontWeight: "bold"
              }}
              accept="application/pdf,application/vnd.ms-excel"
              onChange={onChange}
            />
            {process.env.DROPBOX_APP_KEY && (
              <DropboxChooser
                onSuccess={dropboxSuccess}
                onCancel={dropboxCancel}
              />
            )}
          </div>
        )}
      </>
    </React.Fragment>
  );
};

export default FileUpload;
