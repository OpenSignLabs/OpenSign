import React, { useEffect, useState } from "react";
import Loader from "../primitives/Loader";
import Parse from "parse";
import { NavLink, useNavigate } from "react-router-dom";
import Alert from "../primitives/Alert";
import Title from "../components/Title";

const UpdateExistUserAdmin = () => {
  const navigate = useNavigate();
  const [formdata, setFormdata] = useState({ email: "", masterkey: "" });
  const [loader, setLoader] = useState(true);
  const [errMsg, setErrMsg] = useState("");
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [isAlert, setIsAlert] = useState({ type: "danger", msg: "" });
  useEffect(() => {
    checkIsAdminExist();
  }, []);

  const checkIsAdminExist = async () => {
    try {
      const isAdminExist = await Parse.Cloud.run("checkadminexist");
      if (isAdminExist !== "not_exist") {
        console.log("isAdminExist ", isAdminExist);
        setErrMsg("Admin already exists.");
      }
    } catch (err) {
      console.log("Err in checkadminexist", err);
      setErrMsg("Something went wrong.");
    } finally {
      setLoader(false);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSubmitLoading(true);
    try {
      const updateUserAsAdmin = await Parse.Cloud.run(
        "updateuserasadmin",
        formdata
      );
      // console.log("updateUserAsAdmin ", updateUserAsAdmin);
      if (updateUserAsAdmin === "admin_created") {
        setIsAlert({ type: "success", msg: "Admin created" });
        navigate("/");
      }
    } catch (err) {
      console.log("err in updateuserasadmin", err.code);
      if (err.code === 404) {
        setIsAlert((prev) => ({ ...prev, msg: "Invalid masterkey" }));
      } else if (err.code === 101) {
        setIsAlert((prev) => ({ ...prev, msg: "User not found" }));
      } else if (err.code === 137) {
        setIsAlert((prev) => ({ ...prev, msg: "Admin already exist" }));
      } else {
        setErrMsg("Something went wrong.");
      }
    } finally {
      setIsSubmitLoading(false);
      setTimeout(() => {
        setIsAlert(() => ({ type: "danger", msg: "" }));
      }, 2000);
    }
  };
  return (
    <div className="h-screen flex justify-center">
      <Title title={"Add Admin"} />
      {isAlert.msg && (
        <Alert type={isAlert.type}>
          <div className="ml-3">{isAlert.msg}</div>
        </Alert>
      )}
      {loader ? (
        <div className="text-[grey] flex justify-center items-center text-lg md:text-2xl">
          <Loader />
        </div>
      ) : (
        <>
          {errMsg ? (
            <div className="text-[grey] flex justify-center items-center text-lg md:text-2xl">
              {errMsg}
            </div>
          ) : (
            <div className="w-[95%] md:w-[500px]">
              <form onSubmit={handleSubmit}>
                <div className="w-full my-4 op-card bg-base-100 shadow-md outline outline-1 outline-slate-300/50 overflow-hidden">
                  {isSubmitLoading && (
                    <div className="absolute z-40 w-full h-full flex justify-center bg-black/30">
                      <Loader />
                    </div>
                  )}
                  <h2 className="text-[30px] text-center mt-3 font-medium">
                    Opensign Setup
                  </h2>
                  <NavLink
                    to="https://discord.com/invite/xe9TDuyAyj"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-center text-sm mt-1 text-[blue] cursor-pointer"
                  >
                    Join our discord server
                    <i
                      aria-hidden="true"
                      className="fa-brands fa-discord ml-1"
                    ></i>
                    {/* <span className="fa-sr-only">OpenSign&apos;s Discord</span> */}
                  </NavLink>
                  <div className="px-6 py-3 text-xs">
                    <label>
                      Email <span className="text-[red] text-[13px]">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                      value={formdata.email}
                      onChange={(e) =>
                        setFormdata((prev) => ({
                          ...prev,
                          email: e.target.value?.toLowerCase()
                        }))
                      }
                      required
                    />
                    <hr className="my-2 border-none" />
                    <label>
                      Master key{" "}
                      <span className="text-[red] text-[13px]">*</span>
                    </label>
                    <input
                      type="text"
                      className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                      value={formdata.masterkey}
                      onChange={(e) =>
                        setFormdata((prev) => ({
                          ...prev,
                          masterkey: e.target.value
                        }))
                      }
                      required
                    />

                    {/*          
                  <div className="mt-2.5 ml-1 flex flex-row items-center">
                    <input
                      type="checkbox"
                      className="op-checkbox op-checkbox-sm"
                      id="termsandcondition"
                      checked={isSubscribeNews}
                      onChange={(e) => setIsSubscribeNews(e.target.checked)}
                    />
                    <label
                      className="text-xs cursor-pointer ml-1 mb-0"
                      htmlFor="termsandcondition"
                    >
                      Subscribe to OpenSign newsletter
                    </label>
                  </div> */}
                  </div>
                  <div className="mx-4 text-center text-xs font-bold mb-3">
                    <button
                      type="submit"
                      className="op-btn op-btn-primary w-full"
                      disabled={loader}
                    >
                      {loader ? "Loading..." : "Next"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UpdateExistUserAdmin;
