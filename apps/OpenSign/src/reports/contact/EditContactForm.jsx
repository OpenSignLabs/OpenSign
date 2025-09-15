import { useEffect, useState } from "react";
import Loader from "../../primitives/Loader";
import { useTranslation } from "react-i18next";
import Parse from "parse";
const EditContactForm = (props) => {
  const { t } = useTranslation();
  const [isLoader, setIsLoader] = useState(false);
  const [formData, setFormData] = useState({
    Name: "",
    Email: "",
    Phone: "",
    Company: "",
    JobTitle: ""
  });
  useEffect(() => {
    if (props.contact?.Email) {
      setFormData((prev) => ({ ...prev, ...props.contact }));
    }
  }, [props.contact]);
  const handleChange = (e) => {
    if (e.target.name === "Email") {
      setFormData((prev) => ({
        ...prev,
        [e.target.name]: e.target.value?.toLowerCase()?.replace(/\s/g, "")
      }));
    } else {
      setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (props.handleEditContact) {
      try {
        setIsLoader(true);
        const params = {
          contactId: props.contact.objectId,
          name: formData.Name,
          email: formData.Email,
          phone: formData?.Phone,
          company: formData?.Company,
          jobTitle: formData?.JobTitle,
          tenantId: localStorage.getItem("TenantId")
        };
        const res = await Parse.Cloud.run("editcontact", params);
        const updateContact = {
          ...res,
          Name: formData.Name,
          Email: formData.Email,
          Phone: formData?.Phone,
          Company: formData?.Company,
          JobTitle: formData?.JobTitle
        };
        props.handleEditContact(updateContact);
      } catch (err) {
        console.log("err in edit contact ", err);
        if (err.code === 137) {
          alert(t("contact-already-exists"));
        } else {
          alert(t("something-went-wrong-mssg"));
        }
      } finally {
        setIsLoader(false);
        props.handleClose && props.handleClose();
      }
    }
  };
  return (
    <div className="h-full p-[20px]">
      {isLoader && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-30">
          <Loader />
        </div>
      )}
      <div className="w-full mx-auto p-2 text-base-content">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="block text-xs font-semibold">
              {t("name")}
              <span className="text-[red] text-[13px]"> *</span>
            </label>
            <input
              type="text"
              id="name"
              name="Name"
              value={formData.Name}
              onChange={(e) => handleChange(e)}
              onInput={(e) => e.target.setCustomValidity("")}
              onInvalid={(e) => e.target.setCustomValidity(t("input-required"))}
              className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
              placeholder={t("enter-name")}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="block text-xs font-semibold">
              {t("email")}
              <span className="text-[red] text-[13px]"> *</span>
            </label>
            <input
              type="email"
              id="email"
              name="Email"
              value={formData.Email}
              onChange={(e) => handleChange(e)}
              onInput={(e) => e.target.setCustomValidity("")}
              onInvalid={(e) => e.target.setCustomValidity(t("input-required"))}
              className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
              placeholder={t("enter-email")}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="phone" className="block text-xs font-semibold">
              {t("phone")}
            </label>
            <input
              type="text"
              id="phone"
              name="Phone"
              value={formData.Phone}
              onChange={(e) => handleChange(e)}
              className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
              placeholder={t("phone-optional")}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="Company" className="block text-xs font-semibold">
              {t("company")}
            </label>
            <input
              type="text"
              id="Company"
              name="Company"
              value={formData.Company}
              onChange={(e) => handleChange(e)}
              className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
              placeholder={t("phone-optional")}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="JobTitle" className="block text-xs font-semibold">
              {t("job-title")}
            </label>
            <input
              type="text"
              id="JobTitle"
              name="JobTitle"
              value={formData.JobTitle}
              onChange={(e) => handleChange(e)}
              className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
              placeholder={t("phone-optional")}
            />
          </div>
          <div className="mt-4 flex gap-x-2 justify-start">
            <button type="submit" className="op-btn op-btn-primary">
              {t("submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditContactForm;
