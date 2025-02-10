import React from "react";
import { useTranslation } from "react-i18next";
import ModalUi from "../../primitives/ModalUi";

function AgreementContent(props) {
  const { t } = useTranslation();
  const h2Style = "text-base-content font-medium text-lg";
  const ulStyle = "list-disc px-4 py-3";
  const handleOnclick = () => {
    props.setIsAgreeTour(false);
    props.setIsAgree(true);
    props.setIsShowAgreeTerms(false);
    props.showFirstWidget();
  };
  return (
    <div>
      <ModalUi
        isOpen={true}
        title={t("term-cond-title")}
        handleClose={() => props.setIsShowAgreeTerms(false)}
      >
        <div className="h-[100%] p-[20px]">
          <h2 className={h2Style}>{t("term-cond-h")}</h2>
          <span className="mt-2">{t("term-cond-p1")}</span>
          <div className="h-[1px] bg-[#9f9f9f] w-full my-[15px]"></div>
          <h2 className={h2Style}>{t("term-cond-h1")}</h2>
          <span className="mt-2">{t("term-cond-p2")}</span>
          <ul className={ulStyle}>
            <li>{t("term-cond-p3")}</li>
            <li>{t("term-cond-p4")}</li>
          </ul>
          <div className="h-[1px] bg-[#9f9f9f] w-full my-[15px]"></div>
          <h2 className={h2Style}>{t("term-cond-h2")}</h2>
          <span className="mt-2">{t("term-cond-p5")}</span>
          <ul className={ulStyle}>
            <li>{t("term-cond-p6")}</li>
            <li>{t("term-cond-p7")}</li>
            <li>{t("term-cond-p8")}</li>
          </ul>
          <div className="h-[1px] bg-[#9f9f9f] w-full my-[15px]"></div>
          <h2 className={h2Style}>{t("term-cond-h3")}</h2>
          <span className="mt-2">{t("term-cond-p9")}</span>
          <ul className={ulStyle}>
            <li>{t("term-cond-p10")}</li>
            <li>{t("term-cond-p11")}</li>
          </ul>
          <div className="h-[1px] bg-[#9f9f9f] w-full my-[15px]"></div>
          <h2 className={h2Style}>{t("term-cond-h4")}</h2>
          <span className="mt-2">{t("term-cond-p12")}</span>
          <ul className={ulStyle}>
            <li>{t("term-cond-p13")}</li>
            <li>{t("term-cond-p14")}</li>
            <li>{t("term-cond-p15")}</li>
          </ul>
          <span>{t("term-cond-p16")}</span>
          <div className="h-[1px] bg-[#9f9f9f] w-full my-[15px]"></div>
          <h2 className={h2Style}>{t("term-cond-h5")}</h2>
          <p>{t("term-cond-p17")}</p>
          <p className="mt-2">{t("term-cond-p18")}</p>
          <div className="h-[1px] bg-[#9f9f9f] w-full my-[15px]"></div>
          <h2 className={h2Style}>{t("term-cond-h6")}</h2>
          <span className="mt-2">{t("term-cond-p19")}</span>
          <ul className={ulStyle}>
            <li>{t("term-cond-p20")}</li>
            <li>{t("term-cond-p21")}</li>
            <li>{t("term-cond-p22")}</li>
          </ul>
          <div className="h-[1px] bg-[#9f9f9f] w-full my-[15px]"></div>
          <h2 className={h2Style}>{t("term-cond-h7")}</h2>
          <span className="mt-2">{t("term-cond-p23")}</span>
          <ul className={ulStyle}>
            <li>{t("term-cond-p24")}</li>
            <li>{t("term-cond-p25")}</li>
          </ul>
          <div className="h-[1px] bg-[#9f9f9f] w-full my-[15px]"></div>
          <h2 className={h2Style}>{t("term-cond-h8")}</h2>
          <span className="mt-2">{t("term-cond-p26")}</span>
          <div className="h-[1px] bg-[#9f9f9f] w-full my-[15px]"></div>
          <h2 className={h2Style}>{t("term-cond-h9")}</h2>
          <span className="mt-2">{t("term-cond-p27")}</span>
          <div className="h-[1px] bg-[#9f9f9f] w-full my-[15px]"></div>
          <span className="mt-2 font-medium">{t("term-cond-p28")}</span>
          <div className="h-[1px] bg-[#9f9f9f] w-full my-[15px]"></div>
          <span className="mt-2">{t("term-cond-p29")}</span>
          <a
            href="www.opensignlabs.com"
            target="_blank"
            className="text-blue-700 cursor-pointer"
          >
            {" "}
            www.opensignlabs.com{" "}
          </a>
          <span>{t("term-cond-p30")}</span>
          <span className="font-medium"> support@opensignlabs.com </span>
          <div className="h-[1px] bg-[#9f9f9f] w-full my-[15px]"></div>
          <div className="mt-6 flex justify-start gap-2">
            <button
              onClick={() => handleOnclick()}
              className="op-btn op-btn-primary"
            >
              {t("agrre-button")}
            </button>
            <button
              className="op-btn op-btn-ghost"
              onClick={() => props.setIsShowAgreeTerms(false)}
            >
              {t("close")}
            </button>
          </div>
        </div>
      </ModalUi>
    </div>
  );
}

export default AgreementContent;
