import { Tooltip as ReactTooltip } from "react-tooltip";

export const steps = (t) => [
  {
    key: "prefill",
    label: t("prefill"),
    help: (
      <ReactTooltip id="prefill-tooltip" className="z-[999]">
        <div className="max-w-[200px] md:max-w-[450px]">
          <p className="font-bold">{t("prefill-tab-help")}</p>
        </div>
      </ReactTooltip>
    )
  },
  {
    key: "recipients",
    label: t("recipients-&-data"),
    help: (
      <ReactTooltip id="recipients-tooltip" className="z-[999]">
        <div className="max-w-[200px] md:max-w-[450px]">
          <p className="font-bold">{t("recipient-tab-help-p1")}</p>
          <div className="p-[5px]">
            <ol className="list-disc">
              <li>{t("recipient-tab-help-p2")}</li>
              <li>{t("recipient-tab-help-p3")}</li>
            </ol>
          </div>
          <p className="font-bold">{t("recipient-tab-help-p4")}</p>
        </div>
      </ReactTooltip>
    )
  },
  {
    key: "response",
    label: t("response"),
    help: (
      <ReactTooltip id="response-tooltip" className="z-[999]">
        <div className="max-w-[200px] md:max-w-[450px]">
          <p className="font-bold">{t("response-tab-help")}</p>
        </div>
      </ReactTooltip>
    )
  }
];
