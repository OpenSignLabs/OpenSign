import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { NavLink } from "react-router-dom";
import checkmark from "../assets/images/checkmark.png";
import plansArr from "../json/plansArr.json";
import Title from "../components/Title";
const listItemStyle = {
  paddingLeft: "20px", // Add padding to create space for the image
  backgroundImage: `url(${checkmark})`, // Set your image as the list style image
  backgroundPosition: "left",
  backgroundRepeat: "no-repeat",
  backgroundSize: "16px 16px" // Adjust the size of the image
};

const PlanSubscriptions = () => {
  const navigate = useNavigate();
  const [yearlyVisible, setYearlyVisible] = useState(false);
  const [isLoader, setIsLoader] = useState(true);

  const userDetails = JSON.parse(localStorage.getItem("userDetails"));
  const name =
    userDetails && userDetails.name ? "first_name=" + userDetails.name : "";
  const email =
    userDetails && userDetails.email ? "&email=" + userDetails.email : "";
  const company =
    userDetails && userDetails.company
      ? "&company_name=" + userDetails.company
      : "";
  const phone =
    userDetails && userDetails.phone ? "&mobile=" + userDetails.phone : "";
  const details =
    "?shipping_country_code=US&billing_country_code=US&billing_state_code=CA&" +
    name +
    email +
    company +
    phone;
  useEffect(() => {
    if (localStorage.getItem("accesstoken")) {
      setIsLoader(false);
      setYearlyVisible(false);
    } else {
      navigate("/");
    }
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <Title title={"Subscriptions"} />
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
        <div
          style={{
            backgroundColor: "white",
            overflowY: "auto",
            maxHeight: "100%",
            "--theme-color": "#7952b3",
            "--plan-width": 30
          }}
        >
          <div
            id="monthlyPlans"
            className={`${yearlyVisible ? "none" : "block my-2"}`}
          >
            {/* <div className=" my-2 w-full flex justify-center">
              <ul
                className="navs"
                style={{
                  listStyle: "none",
                  display: "flex",
                  alignItems: "baseline"
                }}
              >
                <li className="nav-item">
                  <button className="nav-link frequency active" name="1_months">
                    Monthly
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className="nav-link frequency "
                    onClick={toggleFrequency}
                    name="1_years"
                  >
                    Yearly
                  </button>
                </li>
              </ul>
            </div> */}
            <div className="flex justify-center w-full my-2">
              <ul className=" flex flex-col md:flex-row h-full bg-white justify-center border-collapse border-[1px] border-gray-300">
                {plansArr.map((item) => (
                  <li
                    className="flex flex-col md:my-0 text-center border-[1px] border-gray-300 w-[260px]"
                    key={item.planName}
                  >
                    <div className="p-2 flex flex-col justify-center items-center">
                      <h3 className="text-[#002862] uppercase">
                        {item.planName}
                      </h3>
                      <div className="w-[150px] h-[150px]">
                        <img
                          className="icon-basic mx-auto"
                          src="https://js.zohostatic.com/books/zfwidgets/assets/images/plan.png"
                          alt="freeimg"
                        />
                      </div>
                      <div className="">
                        <span className="text-3xl">
                          {item.currency && <small>{item.currency}</small>}
                          {item.price}
                        </span>
                        <div
                          className={`${
                            item.subtitle.length <= 32
                              ? "w-[150px]  text-center"
                              : ""
                          } text-sm text-center my-2`}
                        >
                          <p>{item.subtitle}</p>
                        </div>
                      </div>
                      <NavLink
                        to={item.url + details}
                        className="bg-[#002862] w-full text-white py-2 rounded uppercase hover:no-underline hover:text-white"
                        target={item.target}
                      >
                        {item.btnText}
                      </NavLink>
                    </div>
                    <hr className="w-full bg-gray-300 p-[.5px]" />
                    <ul className="mx-1 p-3 text-left break-words text-sm list-none">
                      {item.benefits.map((subitem, index) => (
                        <li style={listItemStyle} key={index} className="m-1">
                          <span style={{ position: "relative" }}>
                            {subitem}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default PlanSubscriptions;
