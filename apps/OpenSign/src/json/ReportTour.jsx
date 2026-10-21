import { Trans } from "react-i18next";
import { getRuntimeConfig } from "../constant/runtimeConfig";
import {
  hasExplicitRuntimeConfig,
  resolveRuntimeLink,
  resolveRuntimeUrls
} from "../constant/deploymentRuntime";

const runtimeConfig = getRuntimeConfig();
const runtimeUrls = resolveRuntimeUrls(runtimeConfig, {
  explicit: hasExplicitRuntimeConfig()
});
const templateHelpUrl = resolveRuntimeLink(
  runtimeUrls.docs,
  "https://docs.opensignlabs.com/docs/help/Templates/manage-templates"
);

export const templateReportTour = [
  {
    selector: "[data-tut=reactourFirst]",
    content: <Trans i18nKey="tour-mssg.report-1" />,
    position: "top",
    styles: { fontSize: "11px" }
  },
  {
    selector: "[data-tut=reactourSecond]",
    content: <Trans i18nKey="tour-mssg.redirect" />,
    position: "top",
    styles: { fontSize: "13px" }
  },
  {
    selector: "[data-tut=tourbulksend]",
    content: <Trans i18nKey="tour-mssg.bulksend" />,
    position: "top",
    styles: { fontSize: "13px" }
  },
  {
    selector: "[data-tut=reactourThird]",
    content: (
      <Trans i18nKey="tour-mssg.option">
        This menu reveals more options such as Edit, Delete, Rename, Duplicate,
        Share, etc.
        <a
          className="cursor-pointer op-text-primary"
          href={templateHelpUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Click here
        </a>
        to read more about all available options.
        <p className="pt-2">
          Note: Changes to an existing template will apply to all future
          documents created from that template but won't affect documents that
          are already sent out.
        </p>
      </Trans>
    ),
    position: "top",
    styles: { fontSize: "13px" }
  }
];
