import React from "react";
import Loader from "../../primitives/Loader";

function VerifyEmail(props) {
  return (
    <dialog className="op-modal op-modal-open absolute z-[1999]">
      <div className="md:w-[40%] w-[80%] op-modal-box p-0 overflow-y-auto hide-scrollbar text-sm">
        <h3 className="font-bold text-lg pt-[15px] px-[20px] text-base-content">
          OTP verification
        </h3>
        {props.isVerifyModal ? (
          <form
            onSubmit={(e) => {
              props.setIsVerifyModal(false);
              props.handleVerifyEmail(e);
            }}
          >
            <div className="px-6 py-3 text-base-content">
              <label className="mb-2">Enter OTP</label>
              <input
                required
                type="tel"
                pattern="[0-9]{4}"
                className="w-full op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content text-xs"
                placeholder="Enter OTP received over email"
                value={props.otp}
                onChange={(e) => props.setOtp(e.target.value)}
              />
            </div>
            <div className="px-6 my-3">
              <button type="submit" className="op-btn op-btn-primary">
                Verify
              </button>
              <button
                className="op-btn op-btn-secondary ml-2"
                onClick={(e) => props.handleResend(e)}
              >
                Resend
              </button>
            </div>
          </form>
        ) : props.otpLoader ? (
          <div className="h-[150px] flex items-center justify-center">
            <Loader />
          </div>
        ) : (
          <div className="px-6 py-3 text-base-content">
            <p className="mb-2 text-sm">Please verify your email !</p>
            <div className="px-0 mt-3">
              <button
                className="op-btn op-btn-primary"
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
    </dialog>
  );
}

export default VerifyEmail;
