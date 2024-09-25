import React, { useState } from "react";
import { useTranslation } from "react-i18next";

function Agreement(props) {
  const { t } = useTranslation();
  const [isChecked, setIsChecked] = useState(false);
  return (
    <div className="flex justify-between  mx-2 mb-2 pt-1" data-tut="IsAgree">
      <div className="flex items-center">
        <input
          className="mr-3 op-checkbox op-checkbox-m"
          type="checkbox"
          value={isChecked}
          onChange={(e) => {
            setIsChecked(e.target.checked);
            if (e.target.checked) {
              props.setIsAgreeTour(false);
            }
          }}
        />
        I confirm that I have read and understood the &apos;Electronic Record
        and Signature Disclosure&apos; and consent to use electronic records and
        signatures.
      </div>

      <div className="flex">
        <button
          onClick={() => {
            if (isChecked) {
              props.setIsAgreeTour(false);
              props.setIsAgree(true);
            }
          }}
          className="op-btn op-btn-primary op-btn-sm"
        >
          Agree & Continue
        </button>
      </div>
    </div>
  );
}

export default Agreement;
