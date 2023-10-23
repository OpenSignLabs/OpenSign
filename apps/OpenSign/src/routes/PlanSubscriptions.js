import React, { useState, useEffect } from "react";
import "../styles/plansubscription.css";
import { useNavigate } from "react-router";
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
  const details = "?" + name + email + company + phone;
  useEffect(() => {
    if (localStorage.getItem("accesstoken")) {
      setIsLoader(false);
      setYearlyVisible(false);
    } else {
      navigate("/");
    }
    // eslint-disable-next-line
  }, []);

  const toggleFrequency = () => {
    setYearlyVisible(!yearlyVisible);
  };

  return (
    <>
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
            overflowY: "auto",
            maxHeight: "600px",
            "--theme-color": "#7952b3",
            "--plan-width": 30
          }}
        >
          <div
            id="monthlyPlans"
            style={{ display: yearlyVisible ? "none" : "block" }}
          >
            <div id="app">
              <div className="pricing-table-main">
                <div className="">
                  <div className="pricing-table-frequency clearfix">
                    <ul
                      className="navs"
                      style={{
                        listStyle: "none",
                        display: "flex",
                        alignItems: "baseline"
                      }}
                    >
                      <li className="nav-item">
                        <button
                          className="nav-link frequency active"
                          name="1_months"
                        >
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
                  </div>
                </div>
                <div className="pricing-table-body">
                  <div className="pricing-table popular">
                    <ul
                      //   className="clearfix Elegant Pro"
                      className="plans-custom"
                    >
                      <li className="plan-item">
                        <div className="plan-block ">
                          <h3 id="plan-name">Free</h3>
                          <div className="pricing-img">
                            <img
                              className="icon-basic"
                              src="https://js.zohostatic.com/books/zfwidgets/assets/images/plan.png"
                              alt="freeimg"
                            />
                          </div>
                          <div className="main-price">
                            <span className="price-figure">
                              <small>₹</small>
                              <span className="basic-plan price-value">
                                <span
                                  className="otherCurrency"
                                  id="plan-amount"
                                >
                                  {" "}
                                  0{" "}
                                </span>
                              </span>
                            </span>
                            <span className="price-term">
                              <span>Billed Monthly </span>
                            </span>
                            <span className="goal">
                              <a
                                href={
                                  "https://subscriptions.zoho.in/subscribe/3caf22e54c684d69f22ba6640f3961501c018beadbc1c771dbde1ccf1c7a189d/008" +
                                  details
                                }
                                className="rounded"
                                target="_self"
                              >
                                Subscribe
                              </a>
                            </span>
                          </div>
                          <ul
                            id="price-features"
                            className="price-features"
                            style={{
                              borderTop: "1px solid rgb(237, 237, 237)",
                              paddingBottom: 7
                            }}
                          >
                            <li>
                              <p style={{ position: "relative" }}>
                                Sign upto 5 documents per month
                              </p>
                            </li>
                            <li>
                              <p style={{ position: "relative" }}>
                                5GB secure storage on OpenSignDrive™
                              </p>
                            </li>
                            <li>
                              <p style={{ position: "relative" }}>
                                Import from Google Drive & Dropbox
                              </p>
                            </li>
                          </ul>
                        </div>
                      </li>
                      <li className="plan-item">
                        <div className="plan-block">
                          <h3 id="plan-name">PROFESSIONAL</h3>
                          <div className="pricing-img">
                            <img
                              className="icon-basic"
                              src="https://js.zohostatic.com/books/zfwidgets/assets/images/plan.png"
                              alt="professionalimg"
                            />
                          </div>
                          <div className="main-price">
                            <span className="price-figure">
                              <small>₹</small>
                              <span className="basic-plan price-value">
                                <span
                                  className="otherCurrency"
                                  id="plan-amount"
                                >
                                  {" "}
                                  999{" "}
                                </span>
                              </span>
                            </span>
                            <span className="price-term">
                              <span>Billed Monthly </span>
                            </span>
                            <span className="goal">
                              <a
                                href={
                                  "https://subscriptions.zoho.in/subscribe/3caf22e54c684d69f22ba6640f3961501c018beadbc1c771dbde1ccf1c7a189d/004" +
                                  details
                                }
                                className="rounded"
                                target="_self"
                              >
                                Subscribe
                              </a>
                            </span>
                          </div>
                          <ul
                            id="price-features"
                            className="price-features"
                            style={{
                              borderTop: "1px solid rgb(237, 237, 237)",
                              paddingBottom: 7
                            }}
                          >
                            <li>
                              <p style={{ position: "relative" }}>
                                Sign upto 50 documents per month
                              </p>
                            </li>
                            <li>
                              <p style={{ position: "relative" }}>
                                50GB secure storage on OpenSignDrive™
                              </p>
                            </li>
                            <li>
                              <p style={{ position: "relative" }}>
                                Import from Google Drive & Dropbox
                              </p>
                            </li>
                          </ul>
                        </div>
                      </li>
                      <li className="plan-item">
                        <div className="plan-block ">
                          <h3 id="plan-name">PREMIUM</h3>
                          <div className="pricing-img">
                            <img
                              className="icon-basic"
                              src="https://js.zohostatic.com/books/zfwidgets/assets/images/plan.png"
                              alt="premiumimg"
                            />
                          </div>
                          <div className="main-price">
                            <span className="price-figure">
                              <small>₹</small>
                              <span className="basic-plan price-value">
                                <span
                                  className="otherCurrency"
                                  id="plan-amount"
                                >
                                  {" "}
                                  1999{" "}
                                </span>
                              </span>
                            </span>
                            <span className="price-term">
                              <span>Billed Monthly </span>
                            </span>
                            <span className="goal">
                              <a
                                href={
                                  "https://subscriptions.zoho.in/subscribe/3caf22e54c684d69f22ba6640f3961501c018beadbc1c771dbde1ccf1c7a189d/003" +
                                  details
                                }
                                className="rounded"
                                target="_self"
                              >
                                Subscribe
                              </a>
                            </span>
                          </div>

                          <ul
                            id="price-features"
                            className="price-features"
                            style={{
                              borderTop: "1px solid rgb(237, 237, 237)",
                              paddingBottom: 7
                            }}
                          >
                            <li>
                              <p style={{ position: "relative" }}>
                                Sign unlimited documents
                              </p>
                            </li>
                            <li>
                              <p style={{ position: "relative" }}>
                                Unlimited secure storage on OpenSignDrive™
                              </p>
                            </li>
                            <li>
                              <p style={{ position: "relative" }}>
                                Import from Google Drive & Dropbox
                              </p>
                            </li>
                          </ul>
                        </div>
                      </li>
                      <li className="plan-item">
                        <div className="plan-block ">
                          <h3 id="plan-name">ELITE</h3>
                          <div className="pricing-img">
                            <img
                              className="icon-basic"
                              src="https://js.zohostatic.com/books/zfwidgets/assets/images/plan.png"
                              alt="eliteimg"
                            />
                          </div>
                          <div className="main-price">
                            <span className="price-figure">
                              <small>₹</small>
                              <span className="basic-plan price-value">
                                <span
                                  className="otherCurrency"
                                  id="plan-amount"
                                >
                                  {" "}
                                  3999{" "}
                                </span>
                              </span>
                            </span>
                            <span className="price-term">
                              <span>Billed Monthly </span>
                            </span>
                            <span className="goal">
                              <a
                                href={
                                  "https://subscriptions.zoho.in/subscribe/3caf22e54c684d69f22ba6640f3961501c018beadbc1c771dbde1ccf1c7a189d/006" +
                                  details
                                }
                                className="rounded"
                                target="_self"
                              >
                                Subscribe
                              </a>
                            </span>
                          </div>
                          <ul
                            id="price-features"
                            className="price-features"
                            style={{
                              borderTop: "1px solid rgb(237, 237, 237)",
                              paddingBottom: 7
                            }}
                          >
                            <li>
                              <p style={{ position: "relative" }}>
                                Sign upto 50 documents per month
                              </p>
                            </li>
                            <li>
                              <p style={{ position: "relative" }}>
                                Unlimited secure storage on OpenSignDrive™
                              </p>
                            </li>
                            <li>
                              <p style={{ position: "relative" }}>
                                Import from Google Drive & Dropbox
                              </p>
                            </li>
                            <li>
                              <p style={{ position: "relative" }}>
                                Premium support included{" "}
                              </p>
                            </li>
                            <li>
                              <p style={{ position: "relative" }}>
                                SSO supported
                              </p>
                            </li>
                          </ul>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            id="yearlyPlans"
            style={{ display: yearlyVisible ? "block" : "none" }}
          >
            <div id="app">
              <div className="pricing-table-main">
                <div className="">
                  <div className="pricing-table-frequency clearfix">
                    <ul
                      className="navs"
                      style={{
                        listStyle: "none",
                        display: "flex",
                        alignItems: "baseline"
                      }}
                    >
                      <li className="nav-item">
                        <a
                          className="nav-link frequency "
                          onClick={toggleFrequency}
                          name="1_months"
                        >
                          Monthly
                        </a>
                      </li>
                      <li className="nav-item">
                        <a className="nav-link frequency active" name="1_years">
                          Yearly
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pricing-table-body">
                  <div className="pricing-table popular">
                    <ul
                      //   className="clearfix Elegant Pro"
                      className="plans-custom"
                    >
                      <li className="plan-item">
                        <div className="plan-block ">
                          <h3 id="plan-name">Free</h3>
                          <div className="pricing-img">
                            <img
                              className="icon-basic"
                              src="https://js.zohostatic.com/books/zfwidgets/assets/images/plan.png"
                              alt="freeyimg"
                            />
                          </div>
                          <div className="main-price">
                            <span className="price-figure">
                              <small>₹</small>
                              <span className="basic-plan price-value">
                                <span
                                  className="otherCurrency"
                                  id="plan-amount"
                                >
                                  {" "}
                                  0{" "}
                                </span>
                              </span>
                            </span>
                            <span className="price-term">
                              <span>Billed Yearly </span>
                            </span>
                            <span className="goal">
                              <a
                                href={
                                  "https://subscriptions.zoho.in/subscribe/ef798486e6a0a11ea65f2bae8f2af9019cd1d0c8dd2e4a1818972435fd62a5da/009" +
                                  details
                                }
                                className="rounded"
                                target="_self"
                              >
                                Subscribe
                              </a>
                            </span>
                          </div>
                          <ul
                            id="price-features"
                            className="price-features"
                            style={{
                              borderTop: "1px solid rgb(237, 237, 237)",
                              paddingBottom: 7
                            }}
                          >
                            <li>
                              <p style={{ position: "relative" }}>
                                Sign upto 5 documents per month
                              </p>
                            </li>
                            <li>
                              <p style={{ position: "relative" }}>
                                5GB secure storage on OpenSignDrive™
                              </p>
                            </li>
                            <li>
                              <p style={{ position: "relative" }}>
                                Import from Google Drive & Dropbox
                              </p>
                            </li>
                          </ul>
                        </div>
                      </li>
                      <li className="plan-item">
                        <div className="plan-block ">
                          <h3 id="plan-name">PROFESSIONAL</h3>
                          <div className="pricing-img">
                            <img
                              className="icon-basic"
                              src="https://js.zohostatic.com/books/zfwidgets/assets/images/plan.png"
                              alt="professionalyimg"
                            />
                          </div>
                          <div className="main-price">
                            <span className="price-figure">
                              <small>₹</small>
                              <span className="basic-plan price-value">
                                <span
                                  className="otherCurrency"
                                  id="plan-amount"
                                >
                                  {" "}
                                  5999{" "}
                                </span>
                              </span>
                            </span>
                            <span className="price-term">
                              <span>Billed Yearly </span>
                            </span>
                            <span className="goal">
                              <a
                                href={
                                  "https://subscriptions.zoho.in/subscribe/3caf22e54c684d69f22ba6640f3961501c018beadbc1c771dbde1ccf1c7a189d/005" +
                                  details
                                }
                                className="rounded"
                                target="_self"
                              >
                                Subscribe
                              </a>
                            </span>
                          </div>
                          <ul
                            id="price-features"
                            className="price-features"
                            style={{
                              borderTop: "1px solid rgb(237, 237, 237)",
                              paddingBottom: 7
                            }}
                          >
                            <li>
                              <p style={{ position: "relative" }}>
                                Sign upto 50 documents per month
                              </p>
                            </li>
                            <li>
                              <p style={{ position: "relative" }}>
                                50GB secure storage on OpenSignDrive™
                              </p>
                            </li>
                            <li>
                              <p style={{ position: "relative" }}>
                                Import from Google Drive & Dropbox
                              </p>
                            </li>
                          </ul>
                        </div>
                      </li>
                      <li className="plan-item">
                        <div className="plan-block ">
                          <h3 id="plan-name">PREMIUM</h3>
                          <div className="pricing-img">
                            <img
                              className="icon-basic"
                              src="https://js.zohostatic.com/books/zfwidgets/assets/images/plan.png"
                              alt="premiumyimg"
                            />
                          </div>
                          <div className="main-price">
                            <span className="price-figure">
                              <small>₹</small>
                              <span className="basic-plan price-value">
                                <span
                                  className="otherCurrency"
                                  id="plan-amount"
                                >
                                  {" "}
                                  11999{" "}
                                </span>
                              </span>
                            </span>
                            <span className="price-term">
                              <span>Billed Yearly </span>
                            </span>
                            <span className="goal">
                              <a
                                href={
                                  "https://subscriptions.zoho.in/subscribe/3caf22e54c684d69f22ba6640f3961501c018beadbc1c771dbde1ccf1c7a189d/002" +
                                  details
                                }
                                className="rounded"
                                target="_self"
                              >
                                Subscribe
                              </a>
                            </span>
                          </div>

                          <ul
                            id="price-features"
                            className="price-features"
                            style={{
                              borderTop: "1px solid rgb(237, 237, 237)",
                              paddingBottom: 7
                            }}
                          >
                            <li>
                              <p style={{ position: "relative" }}>
                                Sign unlimited documents
                              </p>
                            </li>
                            <li>
                              <p style={{ position: "relative" }}>
                                Unlimited secure storage on OpenSignDrive™
                              </p>
                            </li>
                            <li>
                              <p style={{ position: "relative" }}>
                                Import from Google Drive & Dropbox
                              </p>
                            </li>
                          </ul>
                        </div>
                      </li>
                      <li className="plan-item">
                        <div className="plan-block ">
                          <h3 id="plan-name">ELITE</h3>
                          <div className="pricing-img">
                            <img
                              className="icon-basic"
                              src="https://js.zohostatic.com/books/zfwidgets/assets/images/plan.png"
                              alt="eliteyimg"
                            />
                          </div>
                          <div className="main-price">
                            <span className="price-figure">
                              <small>₹</small>
                              <span className="basic-plan price-value">
                                <span
                                  className="otherCurrency"
                                  id="plan-amount"
                                >
                                  {" "}
                                  23999{" "}
                                </span>
                              </span>
                            </span>
                            <span className="price-term">
                              <span>Billed Yearly </span>
                            </span>
                            <span className="goal">
                              <a
                                href={
                                  "https://subscriptions.zoho.in/subscribe/3caf22e54c684d69f22ba6640f3961501c018beadbc1c771dbde1ccf1c7a189d/007" +
                                  details
                                }
                                className="rounded"
                                target="_self"
                              >
                                Subscribe
                              </a>
                            </span>
                          </div>
                          <ul
                            id="price-features"
                            className="price-features"
                            style={{
                              borderTop: "1px solid rgb(237, 237, 237)",
                              paddingBottom: 7
                            }}
                          >
                            <li>
                              <p style={{ position: "relative" }}>
                                Sign upto 50 documents per month
                              </p>
                            </li>
                            <li>
                              <p style={{ position: "relative" }}>
                                Unlimited secure storage on OpenSignDrive™
                              </p>
                            </li>
                            <li>
                              <p style={{ position: "relative" }}>
                                Import from Google Drive & Dropbox
                              </p>
                            </li>
                            <li>
                              <p style={{ position: "relative" }}>
                                Premium support included{" "}
                              </p>
                            </li>
                            <li>
                              <p style={{ position: "relative" }}>
                                SSO supported
                              </p>
                            </li>
                          </ul>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default PlanSubscriptions;
