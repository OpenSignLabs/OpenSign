import { useState } from "react";
import Parse from "parse";
import { Navigate } from "react-router";
import { useTranslation } from "react-i18next";

function ChangePassword() {
  const { t } = useTranslation();
  const [currentpassword, setCurrentPassword] = useState("");
  const [newpassword, setnewpassword] = useState("");
  const [confirmpassword, setconfirmpassword] = useState("");
  const handleSubmit = async (evt) => {
    evt.preventDefault();
    try {
      if (newpassword === confirmpassword) {
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
            <input
              type="password"
              name="newpassword"
              value={newpassword}
              onChange={(e) => setnewpassword(e.target.value)}
              className="op-input op-input-bordered op-input-sm text-xs w-full"
              placeholder={t("new-password")}
              onInvalid={(e) => e.target.setCustomValidity(t("input-required"))}
              onInput={(e) => e.target.setCustomValidity("")}
              required
            />
          </div>
          <div>
            <label htmlFor="newpassword" className="text-xs block ml-1">
              {t("confirm-password")}
            </label>
            <input
              type="password"
              name="confirmpassword"
              className="op-input op-input-bordered op-input-sm text-xs w-full"
              value={confirmpassword}
              onChange={(e) => setconfirmpassword(e.target.value)}
              placeholder={t("confirm-password")}
              onInvalid={(e) => e.target.setCustomValidity(t("input-required"))}
              onInput={(e) => e.target.setCustomValidity("")}
              required
            />
          </div>
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
