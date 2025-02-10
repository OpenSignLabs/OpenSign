import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import { copytoData } from "../../constant/Utils";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

function EmbedTab(props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const tabName = [
    { title: "React/Next.js", icon: "fa-brands fa-react", color: "#61dafb" },
    { title: "JavaScript", icon: "fa-brands fa-js", color: "#ffd43b" },
    { title: "Angular", icon: "fa-brands fa-angular", color: "#ff5733" }
  ];
  const [activeTab, setActiveTab] = useState(0);
  // State to track if the code has been copied
  const [isCopied, setIsCopied] = useState(false);
  const reactCode = [
    {
      id: 0,
      title: "Installation",
      codeString: `npm install @opensign/react`
    },
    {
      id: 1,
      title: "Usage",
      codeString: `
import React from "react"; 
import Opensign from "@opensign/react";

export default function App() {
  return (
    <div className="app">
      <Opensign
        onLoad={() => console.log("success")}
        onLoadError={(error) => console.log(error)}
        templateId= "${props.templateId ? props.templateId : "#templateId"}"
      />
    </div>
  );
}

`
    }
  ];

  const angularCode = [
    {
      id: 0,
      title: "Installation",
      codeString: `npm install @opensign/angular`
    },
    {
      id: 1,
      title: "Usage",
      codeString: `
import { Component } from '@angular/core';
import { OpensignComponent } from "@opensign/angular"
 
@Component({
  selector:'app-root',
  standalone: true,
  imports: [OpensignComponent], 
  template:\`<opensign templateId="${props.templateId ? props.templateId : "#templateId"}"
            (onLoad)="handleLoad()"
            (onLoadError)="handleError($event)"
             ></opensign>\`,
})
export class AppComponent {
  handleLoad() {
    console.log("success");
  }
  handleError(error: string) {
    console.log(error);
  }
}

`
    }
  ];
  const jsCodeString = `
<script
  src= "${window.location.origin}/static/js/public-template.bundle.js"
  id="opensign-script"
  templateId=${props.templateId ? props.templateId : "#templateId"}
  ></script>
  `;

  const handleCopy = (code, ind) => {
    copytoData(code);
    setIsCopied({ ...isCopied, [ind]: true });
    setTimeout(() => setIsCopied(false), 3000);
  };

  return (
    <div className={`${props.templateId && "border-t-[1px] mt-4"}`}>
      {props.templateId && (
        <h3 className="text-base-content font-bold text-lg pt-[15px] pb-[5px]">
          {t("embed-template")}
        </h3>
      )}
      <div className="flex justify-center items-center mt-2">
        <div role="tablist" className="op-tabs op-tabs-bordered">
          {tabName.map((tabData, ind) => (
            <div
              onClick={() => setActiveTab(ind)}
              key={ind}
              role="tab"
              className={`${
                activeTab === ind ? "op-tab-active" : ""
              } op-tab flex items-center pb-10 md:pb-0`}
            >
              <i
                className={`${tabData.icon}`}
                style={{ color: tabData.color }}
              ></i>
              <span className="ml-1 text-[10px] font-medium md:font-normal md:text-[15px]">
                {tabData.title}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div>
        {activeTab === 0 ? (
          <div className="mt-4">
            {reactCode.map((data, ind) => {
              return (
                <div key={ind}>
                  <p className="font-medium text-[18px]">
                    {t(`${data.title}`)}
                  </p>
                  {ind === 0 && (
                    <p className="text-[15px] mt-2">
                      {t("public-template-mssg-1")}
                    </p>
                  )}
                  <div className="relative p-1">
                    <div
                      onClick={() => handleCopy(data.codeString, ind)}
                      className="absolute top-[20px] right-[20px] cursor-pointer"
                    >
                      <i className="fa-light fa-copy text-white mr-[2px]" />
                      <span className=" text-white">
                        {isCopied[ind] ? t("copied-code") : t("copy-code")}
                      </span>
                    </div>
                    <SyntaxHighlighter
                      customStyle={{
                        borderRadius: "15px"
                      }}
                      language="javascript"
                      style={tomorrow}
                    >
                      {data.codeString}
                    </SyntaxHighlighter>
                  </div>
                </div>
              );
            })}
            {props.isEmbedPage && (
              <p className="text-[15px] my-2">
                {t("js-snippet-msg-1")}
                <span
                  className="text-blue-600 cursor-pointer px-1"
                  onClick={() => navigate("/report/6TeaPr321t")}
                >
                  {t("js-snippet-msg-2")}
                </span>
                <span>{t("js-snippet-msg-3")}</span>
              </p>
            )}
            <p className="font-medium mt-3 text-[15px]">
              {t("public-template-mssg-3")}
            </p>
            <p className="my-[6px]">
              {" "}
              {t("public-template-mssg-4")}
              <a
                href="https://www.npmjs.com/package/@opensign/react"
                target="_blank"
                rel="noreferrer"
                className="cursor-pointer text-blue-700  "
              >
                {" "}
                OpenSign React package{" "}
              </a>
              {t("public-template-mssg-5")}
            </p>
          </div>
        ) : activeTab === 1 ? (
          <div className="mt-4">
            <div>
              <p className="font-medium text-[18px]">{t(`Usage`)}</p>
              <p className="text-[15px] my-2">{t("js-snippet-msg")}</p>
              <div className="relative p-1">
                <div
                  onClick={() => handleCopy(jsCodeString, 0)}
                  className="absolute top-[20px] right-[20px] cursor-pointer"
                >
                  <i className="fa-light fa-copy text-white mr-[2px]" />
                  <span className=" text-white">
                    {isCopied[0] ? t("copied-code") : t("copy-code")}
                  </span>
                </div>
                <SyntaxHighlighter
                  customStyle={{
                    borderRadius: "15px"
                  }}
                  language="javascript"
                  style={tomorrow}
                >
                  {jsCodeString}
                </SyntaxHighlighter>
              </div>
              {props.isEmbedPage && (
                <p className="text-[15px] my-2">
                  {t("js-snippet-msg-1")}
                  <span
                    className="text-blue-600 cursor-pointer px-1"
                    onClick={() => navigate("/report/6TeaPr321t")}
                  >
                    {t("js-snippet-msg-2")}
                  </span>
                  <span>{t("js-snippet-msg-3")}</span>
                </p>
              )}
            </div>
          </div>
        ) : (
          activeTab === 2 && (
            <div className="mt-4">
              {angularCode.map((data, ind) => {
                return (
                  <div key={ind}>
                    <p className="font-medium text-[18px]">
                      {t(`${data.title}`)}
                    </p>
                    {ind === 0 && (
                      <p className="text-[15px] mt-2">
                        {t("angular-npm-mssg-1")}
                      </p>
                    )}
                    <div className="relative p-1">
                      <div
                        onClick={() => handleCopy(data.codeString, ind)}
                        className="absolute top-[20px] right-[20px] cursor-pointer"
                      >
                        <i className="fa-light fa-copy text-white mr-[2px]" />
                        <span className=" text-white">
                          {isCopied[ind] ? t("copied-code") : t("copy-code")}
                        </span>
                      </div>
                      <SyntaxHighlighter
                        customStyle={{
                          borderRadius: "15px"
                        }}
                        language="javascript"
                        style={tomorrow}
                      >
                        {data.codeString}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                );
              })}
              {props.isEmbedPage && (
                <p className="text-[15px] my-2">
                  {t("js-snippet-msg-1")}
                  <span
                    className="text-blue-600 cursor-pointer px-1"
                    onClick={() => navigate("/report/6TeaPr321t")}
                  >
                    {t("js-snippet-msg-2")}
                  </span>
                  <span>{t("js-snippet-msg-3")}</span>
                </p>
              )}
              <p className="font-medium mt-3 text-[15px]">
                {t("public-template-mssg-3")}
              </p>
              <p className="my-[6px]">
                {" "}
                {t("public-template-mssg-4")}
                <a
                  href="https://www.npmjs.com/package/@opensign/angular"
                  target="_blank"
                  rel="noreferrer"
                  className="cursor-pointer text-blue-700  "
                >
                  {" "}
                  OpenSign Angular package{" "}
                </a>
                {t("public-template-mssg-5")}
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default EmbedTab;
