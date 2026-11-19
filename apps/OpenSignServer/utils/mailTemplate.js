import {
  escapeHtml,
  renderAutomatedEmailFooter,
  renderEmailHeading,
  renderEmailLogo,
  resolveBrandContext,
  resolveDeploymentBrand,
} from './brandContext.js';
import { normalizeMailSubject } from './mailVars.js';

export const mailTemplate = param => {
  const deployment = resolveDeploymentBrand();
  const requestedAppName = deployment.productName;
  const brand = resolveBrandContext({
    deployment,
    tenant:
      requestedAppName && requestedAppName !== deployment.productName
        ? { WhiteLabelAppName: requestedAppName }
        : undefined,
  });
  const subject = normalizeMailSubject(
    `${param.senderName} has requested you to sign "${param.title}"`
  );
  const logo = renderEmailLogo(brand);
  const senderName = escapeHtml(param.senderName);
  const title = escapeHtml(param.title);
  const senderMail = escapeHtml(param.senderMail);
  const organization = escapeHtml(param.organization);
  const localExpireDate = escapeHtml(param.localExpireDate);
  const note = escapeHtml(param.note);
  const signingUrl = escapeHtml(param.signingUrl);

  const body =
    "<html><head><meta http-equiv='Content-Type' content='text/html;charset=UTF-8' /></head><body><div style='background-color:#f5f5f5;padding:20px'><div style='background:white;padding-bottom:20px'><div style='padding:10px'>" +
    logo +
    `</div>${renderEmailHeading(brand, 'Digital Signature Request')}<div><p style='padding:20px;font-size:14px;margin-bottom:10px'>` +
    senderName +
    ' has requested you to review and sign <strong>' +
    title +
    "</strong>.</p><div style='padding: 5px 0px 5px 25px;display:flex;flex-direction:row;justify-content:space-around'><table><tr><td style='font-weight:bold;font-family:sans-serif;font-size:15px'>Sender</td><td></td><td style='color:#626363;font-weight:bold'>" +
    senderMail +
    "</td></tr><tr><td style='font-weight:bold;font-family:sans-serif;font-size:15px'>Organization</td><td></td><td style='color:#626363;font-weight:bold'> " +
    organization +
    "</td></tr><tr><td style='font-weight:bold;font-family:sans-serif;font-size:15px'>Expires on</td><td></td><td style='color:#626363;font-weight:bold'>" +
    localExpireDate +
    "</td></tr><tr><td style='font-weight:bold;font-family:sans-serif;font-size:15px'>Note</td><td></td><td style='color:#626363;font-weight:bold'>" +
    note +
    "</td></tr><tr><td></td><td></td></tr></table></div> <div style='margin-left:70px'><a target=_blank href=" +
    signingUrl +
    "><button style='padding:12px;background-color:#d46b0f;color:white;border:0px;font-weight:bold;margin-top:30px'>Sign here</button></a></div><div style='display:flex;justify-content:center;margin-top:10px'></div></div></div>" +
    renderAutomatedEmailFooter(brand, param.senderMail) +
    `</div></body></html>`;

  return { subject, body };
};
