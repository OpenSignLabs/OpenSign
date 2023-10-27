import { useState } from "react";
import axios from "axios";

export const useFileUpload = () => {
  const [parseBaseUrl] = useState(localStorage.getItem("baseUrl"));
  const [parseAppId] = useState(localStorage.getItem("parseAppId"));
  const [_fileupload, setFileUpload] = useState("");
  const [fileload, setfileload] = useState(false);
  const [percentage, setpercentage] = useState(0);

  const onChange = (e) => {
    try {
      let files = e.target.files;
      if (typeof files[0] !== "undefined") {
        fileUpload(files[0]);
      } else {
        alert("Please select file.");
        return false;
      }
    } catch (error) {
      alert(error.message);
      return false;
    }
  };
  const fileUpload = async (file) => {
    setfileload(true);
    let image_url = parseBaseUrl.replace("/app", "");
    const url = `${image_url}image_upload`;
    const formData = new FormData();
    formData.append("file", file);
    const config = {
      headers: {
        "content-type": "multipart/form-data",
        "X-Parse-Application-Id": parseAppId,
      },
      onUploadProgress: function (progressEvent) {
        var percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setpercentage(percentCompleted);
      },
    };

    try {
      await axios
        .post(url, formData, config)
        .then((res) => {
          if (res.data.status === "Error") {
            alert(res.data.message);
          }
          setFileUpload(res.data.imageUrl);
          setfileload(false);
          setpercentage(0);
        })
        .catch((err) => {
          alert(`${err.message}`);
          setfileload(false);
          setpercentage(0);
        });
    } catch (error) {
      alert(error.message);
      setfileload(false);
      setpercentage(0);
    }
  };

  return { onChange, _fileupload, fileload, percentage, setFileUpload };
};
