import React, { useEffect, useState } from "react";
import SelectSigners from "../components/shared/fields/SelectSigners";
import AddContact from "./AddContact";
import ModalUi from "./ModalUi";
import { useTranslation } from "react-i18next";

const LinkUserModal = (props) => {
  const { t } = useTranslation();
  const [isContact, setIsContact] = useState(false);
  const [isExistSigner, setIsExistSIgner] = useState(false);

  useEffect(() => {
    if (props.uniqueId) {
      const isExistSigner = props.signerPos.find(
        (x) => x.Id === props.uniqueId && x.signerObjId
      );
      setIsExistSIgner(isExistSigner);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.signerPos]);
  return (
    <ModalUi
      title={isExistSigner ? t("change-signer") : t("add/choose-signer")}
      isOpen={true}
      handleClose={props.closePopup}
    >
      <SelectSigners
        details={props.handleAddUser}
        closePopup={props.closePopup}
        signersData={props?.signersData}
        isContact={isContact}
        setIsContact={setIsContact}
        handleUnlinkSigner={props.handleUnlinkSigner}
        isExistSigner={isExistSigner}
      />
      {isContact && (
        <>
          <div className="op-divider text-base-content mx-[25%] my-1">
            {t("or")}
          </div>
          <AddContact
            details={props.handleAddUser}
            closePopup={props.closePopup}
          />
        </>
      )}
    </ModalUi>
  );
};

export default LinkUserModal;
