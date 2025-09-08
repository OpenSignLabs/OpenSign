import axios from "axios";
import { serverUrl_fn } from "./appinfo";
const parseAppId = process.env.REACT_APP_APPID
  ? process.env.REACT_APP_APPID
  : "opensign";
const serverUrl = serverUrl_fn();
export const SaveFileSize = async (size, imageUrl, tenantId, userId) => {
  //checking server url and save file's size
  const tenantPtr = {
    __type: "Pointer",
    className: "partners_Tenant",
    objectId: tenantId
  };
  const UserPtr = userId && {
    __type: "Pointer",
    className: "_User",
    objectId: userId
  };
  const _tenantPtr = JSON.stringify(tenantPtr);
  try {
    const res = await axios.get(
      `${serverUrl}/classes/partners_TenantCredits?where={"PartnersTenant":${_tenantPtr}}`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Parse-Application-Id": parseAppId
        }
      }
    );
    const response = res.data.results;
    let data;
    // console.log("response", response);
    if (response && response.length > 0) {
      data = {
        usedStorage: response[0].usedStorage
          ? response[0].usedStorage + size
          : size
      };
      await axios.put(
        `${serverUrl}/classes/partners_TenantCredits/${response[0].objectId}`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Parse-Application-Id": parseAppId
          }
        }
      );
    } else {
      data = { usedStorage: size, PartnersTenant: tenantPtr };
      await axios.post(`${serverUrl}/classes/partners_TenantCredits`, data, {
        headers: {
          "Content-Type": "application/json",
          "X-Parse-Application-Id": parseAppId
        }
      });
    }
  } catch (err) {
    console.log("err in save usage", err);
  }
  saveDataFile(size, imageUrl, tenantPtr, UserPtr);
};

//function for save fileUrl and file size in particular client db class partners_DataFiles
const saveDataFile = async (size, imageUrl, tenantPtr, UserId) => {
  const data = {
    FileUrl: imageUrl,
    FileSize: size,
    TenantPtr: tenantPtr,
    ...(UserId ? { UserId: UserId } : {})
  };

  // console.log("data save",file, data)
  try {
    await axios.post(`${serverUrl}/classes/partners_DataFiles`, data, {
      headers: {
        "Content-Type": "application/json",
        "X-Parse-Application-Id": parseAppId
      }
    });
  } catch (err) {
    console.log("err in save usage ", err);
  }
};
