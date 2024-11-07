import React, { useEffect, useState } from "react";
import Title from "../components/Title";
import Alert from "../primitives/Alert";
import { useTranslation } from "react-i18next";
import Loader from "../primitives/Loader";
import Tooltip from "../primitives/Tooltip";
import {
  getTenantDetails,
  handleSignatureType,
  signatureTypes
} from "../constant/Utils";
import Parse from "parse";

const Preferences = () => {
  const { t } = useTranslation();
  const [isalert, setIsAlert] = useState({ type: "success", msg: "" });
  const [isTopLoader, setIsTopLoader] = useState(false);
  const [isLoader, setIsLoader] = useState(false);
  const [signatureType, setSignatureType] = useState([]);
  const [errMsg, setErrMsg] = useState("");
  useEffect(() => {
    fetchSignType();
  }, []);

  const fetchSignType = async () => {
    setIsTopLoader(true);
    try {
      const user = JSON.parse(
        localStorage.getItem(
          `Parse/${localStorage.getItem("parseAppId")}/currentUser`
        )
      );
      const tenantDetails = await getTenantDetails(user?.objectId);
      const signatureType = tenantDetails?.SignatureType || [];
      const tenantSignTypes = signatureType?.filter((x) => x.enabled === true);
      const getUser = await Parse.Cloud.run("getUserDetails");
      if (getUser) {
        const _getUser = JSON.parse(JSON.stringify(getUser));
        if (tenantSignTypes?.length > 0) {
          const signatureType = _getUser?.SignatureType || signatureTypes;
          const updatedSignatureType = await handleSignatureType(
            tenantSignTypes,
            signatureType
          );
          setSignatureType(updatedSignatureType);
        } else {
          const SignatureType = _getUser?.SignatureType || signatureTypes;
          setSignatureType(SignatureType);
        }
      }
    } catch (err) {
      console.log("err while getting user details", err);
      setErrMsg("Something went wrong");
    } finally {
      setIsTopLoader(false);
    }
  };
  console.log("sign", signatureType);
  const handleCheckboxChange = (index) => {
    // Create a copy of the signatureType array
    const updatedSignatureType = [...signatureType];
    // Toggle the enabled value for the clicked item
    updatedSignatureType[index].enabled = !updatedSignatureType[index].enabled;
    // Update the state with the modified array
    setSignatureType(updatedSignatureType);
  };
  const handleSave = async () => {
    console.log("submit", signatureType);
    setIsLoader(true);
    const isEnabled = signatureType.some((x) => x.enabled === true);
    if (isEnabled) {
      try {
        const params = { SignatureType: signatureType };
        const updateRes = await Parse.Cloud.run("updatesignaturetype", params);
        if (updateRes) {
          setIsAlert({ type: "success", msg: "Saved successfully." });
          setTimeout(() => setIsAlert({ type: "success", msg: "" }), 1500);
        }
      } catch (err) {
        console.log("err while updating signtype", err);
      } finally {
        setIsLoader(false);
      }
    } else {
      setIsAlert({
        type: "danger",
        msg: "please enable at least one signature type"
      });
      setTimeout(() => setIsAlert({ type: "success", msg: "" }), 1500);
      setIsLoader(false);
    }
  };

  return (
    <React.Fragment>
      <Title title={"API Token"} />
      {isalert.msg && <Alert type={isalert.type}>{isalert.msg}</Alert>}
      {isTopLoader ? (
        <div className="flex justify-center items-center h-screen">
          <Loader />
        </div>
      ) : (
        <>
          {errMsg ? (
            <div className="flex justify-center items-center h-screen">
              {errMsg}
            </div>
          ) : (
            <div className="relative bg-base-100 text-base-content flex flex-col justify-center shadow-md rounded-box mb-3">
              {isLoader && (
                <div className="flex justify-center items-center absolute w-full h-full rounded-box bg-black/30">
                  <Loader />
                </div>
              )}

              <h1 className="ml-4 mt-3 mb-2 font-semibold">
                OpenSign™ {t("Preferences")}{" "}
                <span>
                  <Tooltip
                    message={`OpenSign™ ${t("Preferences")}`}
                    isSubscribe={true}
                  />
                </span>
              </h1>
              <div className="ml-4 mt-1 mb-2 flex flex-col">
                <div className="mb-[0.75rem]">
                  <label
                    htmlFor="signaturetype"
                    className="text-[14px] mb-[0.7rem] font-medium"
                  >
                    Allowed signature types
                  </label>
                  <div className=" ml-[7px] flex flex-col md:flex-row gap-[10px] mb-[0.7rem]">
                    {signatureType.map((type, i) => (
                      <div
                        key={i}
                        className="flex flex-row gap-[5px] items-center"
                      >
                        <input
                          className="mr-[2px] op-checkbox op-checkbox-xs"
                          type="checkbox"
                          name="signaturetype"
                          onChange={() => handleCheckboxChange(i)}
                          checked={type.enabled}
                        />
                        <div
                          className="text-[13px] font-medium hover:underline underline-offset-2 cursor-default"
                          title={`Enabling this allow signers to ${type.name} signature`}
                        >
                          {/* {t(`widget-status.${data}`)} */}
                          {type.name}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    className="op-btn op-btn-primary"
                    onClick={handleSave}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </React.Fragment>
  );
};
export default Preferences;
