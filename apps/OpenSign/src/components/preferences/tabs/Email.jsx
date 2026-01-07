import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import MailTemplateEditor from "../MailTemplateEditor";

const EmailTab = () => {
  const { t } = useTranslation();
  const {
    tenantInfo
  } = useSelector((state) => state.user);
  return (
    <div className="flex flex-col mb-4">
        <MailTemplateEditor
          info={
                tenantInfo
          }
          tenantId={tenantInfo?.objectId}
        />
    </div>
  );
};

export default EmailTab;
