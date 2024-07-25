import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import checkmark from "../assets/images/checkmark.png";
import plansArr from "../json/plansArr";
import Title from "../components/Title";
import Parse from "parse";
import { openInNewTab } from "../constant/Utils";
import Loader from "../primitives/Loader";
const listItemStyle = {
  paddingLeft: "20px", // Add padding to create space for the image
  backgroundImage: `url(${checkmark})`, // Set your image as the list style image
  backgroundPosition: "left",
  backgroundRepeat: "no-repeat",
  backgroundSize: "16px 16px" // Adjust the size of the image
};

const PlanSubscriptions = () => {
  const navigate = useNavigate();
  const [yearlyVisible, setYearlyVisible] = useState(true);
  const [isLoader, setIsLoader] = useState(true);
  const extUser =
    localStorage.getItem("Extand_Class") &&
    JSON.parse(localStorage.getItem("Extand_Class"))?.[0];
  const user = {
    name: extUser?.Name,
    email: extUser?.Email,
    company: extUser?.Company,
    phone: extUser?.Phone
  };
  const userDetails = JSON.parse(localStorage.getItem("userDetails")) || user;
  // console.log("userDetails ", userDetails);
  const fullname =
    userDetails && userDetails.name ? userDetails.name.split(" ") : "";
  const firstname = fullname?.[0]
    ? "first_name=" + encodeURIComponent(fullname?.[0])
    : "";
  const lastname = fullname?.[1]
    ? "&last_name=" + encodeURIComponent(fullname?.[1])
    : "";
  const name = firstname ? firstname + lastname : "";
  const email =
    userDetails && userDetails.email
      ? "&email=" + encodeURIComponent(userDetails.email)
      : "";
  const company =
    userDetails && userDetails.company
      ? "&company_name=" + encodeURIComponent(userDetails.company)
      : "";
  const phone =
    userDetails && userDetails.phone
      ? "&mobile=" + encodeURIComponent(userDetails.phone)
      : "";

  const details =
    "?shipping_country_code=US&billing_country_code=US&billing_state_code=CA&" +
    name +
    email +
    company +
    phone;
  useEffect(() => {
    setIsLoader(false);
    // eslint-disable-next-line
  }, []);

  const handleFreePlan = async (item) => {
    if (item.url) {
      const url = yearlyVisible ? item.yearlyUrl + details : item.url + details;
      if (user) {
        localStorage.setItem("userDetails", JSON.stringify(user));
      }
      openInNewTab(url, item?.target);
    } else {
      setIsLoader(true);
      try {
        const params = { userId: Parse.User.current().id };
        const res = await Parse.Cloud.run("freesubscription", params);
        if (res.status === "success" && res.result === "already subscribed!") {
          setIsLoader(false);
          alert("You have already subscribed to plan!");
        } else if (res.status === "success") {
          setIsLoader(false);
          navigate("/");
        } else if (res.status === "error") {
          setIsLoader(false);
          alert(res.result);
        }
      } catch (err) {
        setIsLoader(false);
        console.log("err in free subscribe", err.message);
        alert("Somenthing went wrong, please try again later!");
      }
    }
  };
  return (
    <>
      <Title title={"Subscriptions"} />
      {isLoader ? (
        <div className="flex items-center justify-center h-screen">
          <Loader />
        </div>
      ) : (
        <div className="overflow-y-auto max-h-full">
          <div className="block my-2">
            <div className="flex flex-col justify-center items-center w-full">
              <div
                role="tablist"
                className="op-tabs op-tabs-boxed bg-base-100 my-2 shadow-lg transition-all"
              >
                <a
                  onClick={() => setYearlyVisible(false)}
                  role="tab"
                  className={`${!yearlyVisible ? "op-tab-active" : ""} op-tab`}
                >
                  Monthly
                </a>
                <a
                  onClick={() => setYearlyVisible(true)}
                  role="tab"
                  className={`${yearlyVisible ? "op-tab-active" : ""} op-tab`}
                >
                  Yearly (upto 66% off)
                </a>
              </div>
              <ul className="op-card flex flex-col md:flex-row h-full bg-base-100 justify-center shadow-lg">
                {plansArr.map((item) => (
                  <li
                    className="flex flex-col text-center border-collapse border-[1px] border-gray-300 max-w-[250px]"
                    key={item.planName}
                  >
                    <div className="p-2 flex flex-col justify-center items-center max-h-[310px]">
                      <h3 className="text-[#002862] uppercase">
                        {item.planName}
                      </h3>
                      <div className="w-[120px] h-[120px] overflow-hidden">
                        <img
                          className="w-full h-full object-contain"
                          src={require(`../assets/images/${item?.img}`)}
                          alt="img"
                        />
                      </div>
                      <div>
                        <span className="text-3xl">
                          {item.currency && <small>{item.currency}</small>}
                          {yearlyVisible ? (
                            <>
                              {item?.yearlyPrice.includes("<") ? (
                                <div
                                  className="inline-block"
                                  dangerouslySetInnerHTML={{
                                    __html: item?.yearlyPrice
                                  }}
                                />
                              ) : (
                                <span>{item?.yearlyPrice}</span>
                              )}
                            </>
                          ) : (
                            <>
                              {item?.monthlyPrice.includes("<") ? (
                                <div
                                  className="inline-block"
                                  dangerouslySetInnerHTML={{
                                    __html: item?.monthlyPrice
                                  }}
                                />
                              ) : (
                                <span>{item?.monthlyPrice}</span>
                              )}
                            </>
                          )}
                        </span>
                        <p className="font-semibold pt-2 text-sm">
                          {yearlyVisible ? "Billed Yearly" : "Billed Monthly"}
                        </p>
                        <div className="max-w-[250px] h-[40px] text-center text-sm my-2">
                          <div
                            style={{
                              textAlign: "center",
                              backgroundColor: item.subtitlecolor
                                ? item.subtitlecolor
                                : "white"
                            }}
                          >
                            {item.subtitle.includes("<") ? (
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: item.subtitle
                                }}
                              />
                            ) : (
                              <span>{item.subtitle}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        className={`${
                          item?.btn?.color ? item?.btn?.color : "op-btn-primary"
                        } w-full text-white py-2 op-btn uppercase hover:text-white cursor-pointer`}
                        onClick={() => handleFreePlan(item)}
                      >
                        {item?.btn?.text}
                      </button>
                    </div>
                    <hr className="w-full bg-gray-300 h-[0.5px]" />
                    <ul className="mx-1 p-3 text-left break-words text-sm list-none">
                      {!yearlyVisible &&
                        item.benefits.map((subitem, index) => (
                          <li style={listItemStyle} key={index} className="m-1">
                            <span className="relative">{subitem}</span>
                          </li>
                        ))}
                      {yearlyVisible &&
                        item?.yearlyBenefits?.map((subitem, index) => (
                          <li style={listItemStyle} key={index} className="m-1">
                            <span className="relative">{subitem}</span>
                          </li>
                        ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-sm flex justify-center items-center mt-3 mb-2">
              <hr className="border-[2px] border-gray-350 w-[20%]" />
              <span className="px-2 text-base-content cursor-default">or</span>
              <hr className="border-[2px] border-gray-350 w-[20%]" />
            </div>
            <div className="flex flex-col justify-center items-center">
              <h3 className="text-[#002862] mt-1 mb-2">
                Host it yourself for free
              </h3>
              <div
                className="op-btn op-btn-primary w-[200px]"
                onClick={() =>
                  openInNewTab("https://github.com/OpenSignLabs/OpenSign")
                }
              >
                Visit Github
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default PlanSubscriptions;
