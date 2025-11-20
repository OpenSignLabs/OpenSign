import { useState } from "react";
import Parse from "parse";
import { Navigate } from "react-router";
import { useTranslation } from "react-i18next";

function ChangePassword() {
  const { t } = useTranslation();
  const [currentpassword, setCurrentPassword] = useState("");
  const [newpassword, setnewpassword] = useState("");
  const [confirmpassword, setconfirmpassword] = useState("");
  const [lengthValid, setLengthValid] = useState(false);
  const [caseDigitValid, setCaseDigitValid] = useState(false);
  const [specialCharValid, setSpecialCharValid] = useState(false);
  const [showNewPassword, setNewShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const toggleNewPasswordVisibility = () => {
    setNewShowPassword(!showNewPassword);
  };
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setconfirmpassword(newPassword);
    // Check conditions separately
    setLengthValid(newPassword.length >= 8);
    setCaseDigitValid(
      /[a-z]/.test(newPassword) &&
        /[A-Z]/.test(newPassword) &&
        /\d/.test(newPassword)
    );
    setSpecialCharValid(/[!@#$%^&*()\-_=+{};:,<.>]/.test(newPassword));
  };
  const handleSubmit = async (evt) => {
    evt.preventDefault();
    try {
      if (newpassword === confirmpassword) {
        if (lengthValid && caseDigitValid && specialCharValid) {
          Parse.User.logIn(localStorage.getItem("userEmail"), currentpassword)
            .then(async (user) => {
              if (user) {
                const User = new Parse.User();
                const query = new Parse.Query(User);
                await query.get(user.id).then((user) => {
                  // Updates the data we want
                  user.set("password", newpassword);
                  user
                    .save()
                    .then(async () => {
                      let _user = user.toJSON();
                      if (_user) {
                        await Parse.User.become(_user.sessionToken);
                        localStorage.setItem("accesstoken", _user.sessionToken);
                      }
                      setCurrentPassword("");
                      setnewpassword("");
                      setconfirmpassword("");
                      alert(t("password-update-alert-1"));
                    })
                    .catch((error) => {
                      console.log("err", error);
                      alert(t("something-went-wrong-mssg"));
                    });
                });
              } else {
                alert(t("password-update-alert-2"));
              }
            })
            .catch((error) => {
              alert(t("password-update-alert-3"));
              console.error("Error while logging in user", error);
            });
        }
      } else {
        alert(t("password-update-alert-4"));
      }
    } catch (error) {
      console.log("err", error);
    }
  };
  if (localStorage.getItem("accesstoken") === null) {
    return <Navigate to="/" />;
  }
  return (
    <div className="w-full bg-base-100 text-base-content shadow rounded-box p-2">
      <div className="text-xl font-bold border-b-[1px] border-gray-300">
        {t("change-password")}
      </div>
      <div className="m-2">
        <form onSubmit={handleSubmit} className=" flex flex-col gap-y-2">
          <div>
            <label htmlFor="currentpassword" className="block text-xs ml-1">
              {t("current-password")}
            </label>
            <input
              type="password"
              name="currentpassword"
              value={currentpassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="op-input op-input-bordered op-input-sm text-xs w-full"
              placeholder={t("current-password")}
              onInvalid={(e) => e.target.setCustomValidity(t("input-required"))}
              onInput={(e) => e.target.setCustomValidity("")}
              required
            />
          </div>
          <div>
            <label htmlFor="newpassword" className="text-xs block ml-1">
              {t("new-password")}
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                name="newpassword"
                value={newpassword}
                onChange={(e) => setnewpassword(e.target.value)}
                className="op-input op-input-bordered op-input-sm text-xs w-full"
                placeholder={t("new-password")}
                onInvalid={(e) =>
                  e.target.setCustomValidity(t("input-required"))
                }
                onInput={(e) => e.target.setCustomValidity("")}
                required
              />
              <span
                className={`absolute top-[50%] right-[10px] -translate-y-[50%] cursor-pointer text-base-content`}
                onClick={toggleNewPasswordVisibility}
              >
                {showNewPassword ? (
                  <i className="fa fa-eye-slash" /> // Close eye icon
                ) : (
                  <i className="fa fa-eye" /> // Open eye icon
                )}
              </span>
            </div>
          </div>
          <div>
            <label htmlFor="confirmpassword" className="text-xs block ml-1">
              {t("confirm-password")}
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmpassword"
                className="op-input op-input-bordered op-input-sm text-xs w-full"
                value={confirmpassword}
                onChange={handlePasswordChange}
                placeholder={t("confirm-password")}
                onInvalid={(e) =>
                  e.target.setCustomValidity(t("input-required"))
                }
                onInput={(e) => e.target.setCustomValidity("")}
                required
              />
              <span
                className={`absolute top-[50%] right-[10px] -translate-y-[50%] cursor-pointer text-base-content`}
                onClick={toggleConfirmPasswordVisibility}
              >
                {showConfirmPassword ? (
                  <i className="fa fa-eye-slash" /> // Close eye icon
                ) : (
                  <i className="fa fa-eye" /> // Open eye icon
                )}
              </span>
            </div>
          </div>
          {confirmpassword.length > 0 && (
            <div className="mt-1 text-[11px]">
              {newpassword.length > 0 && (
                <p
                  className={`${newpassword === confirmpassword ? "text-green-600" : "text-red-600"} text-[11px] mt-1`}
                >
                  {newpassword === confirmpassword ? "✓" : "✗"}{" "}
                  {t("password-match-length")}
                </p>
              )}
              <p
                className={`${lengthValid ? "text-green-600" : "text-red-600"}`}
              >
                {lengthValid ? "✓" : "✗"} {t("password-length")}
              </p>
              <p
                className={`${
                  caseDigitValid ? "text-green-600" : "text-red-600"
                }`}
              >
                {caseDigitValid ? "✓" : "✗"} {t("password-case")}
              </p>
              <p
                className={`${
                  specialCharValid ? "text-green-600" : "text-red-600"
                }`}
              >
                {specialCharValid ? "✓" : "✗"} {t("password-special-char")}
              </p>
            </div>
          )}
          <button
            type="submit"
            className="op-btn op-btn-primary shadow-md mt-2"
          >
            {t("change-password")}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;
