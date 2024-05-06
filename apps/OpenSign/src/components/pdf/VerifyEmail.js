import React from "react";
import { rejectBtn, submitBtn, themeColor } from "../../constant/const";

function VerifyEmail(props) {
  return (
    <div className="bg-black bg-opacity-[75%] absolute z-[999] flex flex-col items-center justify-center w-full h-full rounded">
      <div className="bg-white rounded outline-none md:w-[40%] w-[80%]">
        <div
          style={{ backgroundColor: themeColor }}
          className=" text-white p-[10px] rounded-t"
        >
          OTP verification
        </div>
        {props.isVerifyModal ? (
          <form
            onSubmit={(e) => {
              props.setIsVerifyModal(false);
              props.handleVerifyEmail(e);
            }}
          >
            <div className="px-6 py-3">
              <label className="mb-2">Enter OTP</label>
              <input
                required
                type="tel"
                pattern="[0-9]{4}"
                className="px-3 py-2 w-full border-[1px] border-gray-300 rounded focus:outline-none text-xs"
                placeholder="Enter OTP received over email"
                value={props.otp}
                onChange={(e) => props.setOtp(e.target.value)}
              />
            </div>
            <hr />
            <div className="px-6 my-3">
              <button type="submit" className={submitBtn}>
                Verify
              </button>
              <button
                className={`${rejectBtn} ml-2`}
                onClick={(e) => props.handleResend(e)}
              >
                Resend
              </button>
            </div>
          </form>
        ) : props.otpLoader ? (
          <div
            style={{
              height: "150px",
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
          <div className="px-6 py-3">
            <p className="mb-2">Please verify your email !</p>
            <hr />
            <div className="px-0 mt-3">
              <button
                className={submitBtn}
                type="submit"
                onClick={() => {
                  props.handleVerifyBtn();
                }}
              >
                Send OTP
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;
