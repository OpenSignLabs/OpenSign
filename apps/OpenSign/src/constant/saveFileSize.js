import axios from "axios";
import Parse from "parse";
const parseAppId = localStorage.getItem("AppID12");
const serverUrl = localStorage.getItem("BaseUrl12");
Parse.serverURL = serverUrl;
Parse.initialize(parseAppId);

export const SaveFileSize = async (size, imageUrl) => {
  //checking server url and save file's size

  try {
    const response = await axios
      .get(`${serverUrl}classes/partners_TenantCredits`, {
        headers: {
          "Content-Type": "application/json",
          "X-Parse-Application-Id": parseAppId
        }
      })
      .then((result) => {
        const res = result.data;
        //  console.log("res", res);

        return res.results;
      })
      .catch((err) => {
        console.log("axois err ", err);
      });
    let data;
    // console.log("response", response);
    if (response && response.length > 0) {
      data = {
        usedStorage: response[0].usedStorage
          ? response[0].usedStorage + size
          : size
      };
      await axios
        .put(
          `${serverUrl}classes/partners_TenantCredits/${response[0].objectId}`,
          data,
          {
            headers: {
              "Content-Type": "application/json",
              "X-Parse-Application-Id": parseAppId
            }
          }
        )
        .then(() => {
          // const res = result.data;
          // console.log("save res", res);
        })
        .catch((err) => {
          console.log("axois err ", err);
        });
    } else {
      data = {
        usedStorage: size
      };
      await axios
        .post(`${serverUrl}classes/partners_TenantCredits`, data, {
          headers: {
            "Content-Type": "application/json",
            "X-Parse-Application-Id": parseAppId
          }
        })
        .then(() => {
          // const res = result.data;
          // console.log("res", res);
        })
        .catch((err) => {
          console.log("axois err ", err);
        });
    }
  } catch (e) {
    console.log("org app error", e);
  }
  saveDataFile(size, imageUrl);
};

//function for save fileUrl and file size in particular client db class partners_DataFiles
const saveDataFile = async (size, imageUrl) => {
  const data = {
    FileUrl: imageUrl,
    FileSize: size
  };

  // console.log("data save",file, data)
  await axios
    .post(`${serverUrl}classes/partners_DataFiles`, data, {
      headers: {
        "Content-Type": "application/json",
        "X-Parse-Application-Id": parseAppId
      }
    })
    .then(() => {
      // const res = result.data;
      // console.log("res", res);
    })
    .catch((err) => {
      console.log("axois err ", err);
    });
};
