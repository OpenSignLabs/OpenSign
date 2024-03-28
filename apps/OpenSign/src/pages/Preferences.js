import React, { useState } from "react";
import Parse from "parse";
import PremiumAlertHeader from "../primitives/PremiumAlertHeader";
import Tooltip from "../primitives/Tooltip";
import { sanitizeFileName, toDataUrl } from "../constant/Utils";

function Preferences() {
  const [isLoader, setIsLoader] = useState(false);
  const [logoName, setLogoName] = useState({ base64: "", name: "" });
  const [domainName, setDomainName] = useState("");

  //function to save logo and domain name in parters_tenant class
  const handleSave = async () => {
    try {
      setIsLoader(true);
      const isUrl = logoName.base64.includes("https");
      let uploadImage = isUrl;
      if (!isUrl) {
        //upload base64 image in Parse.file and convert it in url exam - https://opensignstgn.nyc3.digitaloceans...
        const fileName = sanitizeFileName(logoName.name);
        const pdfFile = new Parse.File(fileName, {
          base64: logoName.base64
        });
        const pdfData = await pdfFile.save();
        const pdfUrl = pdfData.url();
        uploadImage = pdfUrl;
      }
      const tenantId = localStorage.getItem("TenetId");
      const tenantQuery = new Parse.Query("partners_Tenant");
      const updateTenantObj = await tenantQuery.get(tenantId);
      updateTenantObj.set("Logo", uploadImage);
      updateTenantObj.set("Domain", domainName);
      const res = await updateTenantObj.save();
      const jsonRes = JSON.parse(JSON.stringify(res));
      if (jsonRes) {
        localStorage.setItem("tenant_logo", jsonRes.Logo);
        localStorage.setItem("tenant_domain", jsonRes.Domain);
      }
      setIsLoader(false);
      setDomainName("");
      setLogoName({ base64: "", name: "" });
    } catch (err) {
      setIsLoader(false);
      console.log("Err", err);
    }
  };
  //function to use reset form
  const handleReset = () => {
    setDomainName("");
    setLogoName({ base64: "", name: "" });
  };
  const onUploadLogo = async (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const base64Img = await toDataUrl(file);
      setLogoName({
        base64: base64Img,
        name: file.name
      });
    }
  };
  return (
    <React.Fragment>
      {isLoader ? (
        <div
          style={{
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div
            style={{
              fontSize: "45px",
              color: "#3dd3e0"
            }}
            className="loader-37"
          ></div>
        </div>
      ) : (
        <div className="bg-white flex flex-col justify-center shadow rounded">
          <PremiumAlertHeader />
          <h1 className="ml-4 mt-3 mb-2 font-semibold">Preferences</h1>
          <div
            className={`flex justify-center border-y-[1px] border-gray-300 break-all py-1 p-2`}
          >
            <div className=" flex flex-col">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSave();
                }}
              >
                <div className="text-lg font-normal text-black">
                  <label className="text-sm ml-2">
                    Logo
                    <Tooltip message={"upload your app logo"} />
                  </label>
                  <input
                    required
                    type="file"
                    accept="image/*"
                    onChange={onUploadLogo}
                    placeholder="Enter webhook url"
                    className=" px-3 py-2 w-full border-[1px] border-gray-300 rounded focus:outline-none text-xs"
                  />
                </div>

                <div className="text-lg font-normal text-black py-2">
                  <label className="text-sm ml-2">
                    Custom sub-domain{" "}
                    <Tooltip message={"upload your domain name"} />
                  </label>
                  <input
                    required
                    value={domainName}
                    onChange={(e) => setDomainName(e.target.value)}
                    placeholder="opensign.yourdomain.com"
                    className="px-3 py-2 w-full border-[1px] border-gray-300 rounded focus:outline-none text-xs"
                  />
                </div>
                <div className="flex items-center mt-3 gap-2 ">
                  <button
                    className="bg-[#1ab6ce] rounded-sm shadow-md text-[13px] font-semibold uppercase text-white px-4 py-2 focus:outline-none"
                    type="submit"
                  >
                    Save
                  </button>
                  <button
                    className="cursor-pointer bg-[#188ae2] rounded-sm shadow-md text-[13px] font-semibold uppercase text-white px-4 py-2 text-center ml-[2px] focus:outline-none"
                    onClick={handleReset}
                  >
                    Reset
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
}

export default Preferences;
