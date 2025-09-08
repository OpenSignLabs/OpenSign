import fs from 'node:fs';
import axios from 'axios';
import multer from 'multer';
import libre from 'libreoffice-convert';
import util from 'node:util';
import { cloudServerUrl, getSecureUrl, serverAppId } from '../../Utils.js';

libre.convertAsync = util.promisify(libre.convert);

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'exports');
  },
  filename(req, file, cb) {
    cb(null, file.originalname);
  },
});

export const upload = multer({ storage });

function generatePdfName(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default async function docxtopdf(req, res) {
  const serverUrl = cloudServerUrl;
  const appId = serverAppId;
  const masterKey = process.env.MASTER_KEY;
  const inputPath = req.file.path;
  const name = generatePdfName(16);
  const fileName = `${name}.pdf`;
  const outputPath = './exports/output.pdf';

  try {
    const userRes = await axios.get(serverUrl + '/users/me', {
      headers: {
        'X-Parse-Application-Id': appId,
        'X-Parse-Session-Token': req.headers['sessiontoken'],
      },
    });
    const userId = JSON.stringify({
      UserId: {
        __type: 'Pointer',
        className: '_User',
        objectId: userRes.data.objectId,
      },
    });
    const resUser = await axios.get(
      serverUrl + `/classes/contracts_Users?where=${userId}&limit=1&include=TenantId`,
      {
        headers: {
          'X-Parse-Application-Id': appId,
          'X-Parse-Master-Key': masterKey,
        },
      }
    );

    if (resUser?.data?.results?.length > 0) {
      const tenantId = resUser.data.results[0].TenantId?.objectId;
      const ext = '.pdf';
      const outPath = `./exports/output${ext}`;
      const docxBuf = fs.readFileSync(inputPath);
      const pdfBuffer = await libre.convertAsync(docxBuf, ext, undefined);
      fs.writeFileSync(outPath, pdfBuffer);
      const file = fs.readFileSync(outPath);
      const size = fs.statSync(outPath).size;
      const PartnersTenant = JSON.stringify({
        PartnersTenant: {
          __type: 'Pointer',
          className: 'partners_Tenant',
          objectId: tenantId,
        },
      });
      const resTenantCredit = await axios.get(
        serverUrl + `/classes/partners_TenantCredits?where=${PartnersTenant}&limit=1`,
        {
          headers: {
            'X-Parse-Application-Id': appId,
            'X-Parse-Master-Key': masterKey,
          },
        }
      );
      if (resTenantCredit.data?.results?.length > 0) {
        const tenantCreditsId = resTenantCredit.data.results[0].objectId;
        const activeFileAdapter = resUser.data.results[0].TenantId?.ActiveFileAdapter;
        let fileUrl;
        if (activeFileAdapter) {
          const params = {
            fileBase64: file.toString('base64'),
            fileName,
            id: activeFileAdapter,
          };
          const url = serverUrl + '/functions/savetofileadapter';
          const headers = {
            'Content-Type': 'application/json',
            'X-Parse-Application-Id': appId,
            'X-Parse-Session-Token': req.headers['sessiontoken'],
          };
          try {
            const savetos3 = await axios.post(url, params, { headers });
            fileUrl = savetos3?.data?.result?.url;
          } catch (err) {
            console.log('err in save to customfile', err);
          }
        } else {
          const parsefile = await axios.post(serverUrl + `/files/${fileName}`, file, {
            headers: {
              'X-Parse-Application-Id': appId,
              'X-Parse-Master-Key': masterKey,
              'Content-Type': 'application/pdf',
            },
          });
          const fileRes = getSecureUrl(parsefile.data.url);
          fileUrl = fileRes.url;
        }
        const usedStorage = resTenantCredit.data.results[0].usedStorage
          ? resTenantCredit.data.results[0].usedStorage + size
          : size;
        await axios.put(
          serverUrl + `/classes/partners_TenantCredits/${tenantCreditsId}`,
          { usedStorage },
          {
            headers: {
              'X-Parse-Application-Id': appId,
              'X-Parse-Master-Key': masterKey,
            },
          }
        );
        await axios.post(
          serverUrl + '/classes/partners_DataFiles',
          {
            FileSize: size,
            FileUrl: fileUrl,
            TenantPtr: {
              __type: 'Pointer',
              className: 'partners_Tenant',
              objectId: tenantId,
            },
            UserId: {
              __type: 'Pointer',
              className: '_User',
              objectId: userRes.data.objectId,
            },
          },
          {
            headers: {
              'X-Parse-Application-Id': appId,
              'X-Parse-Master-Key': masterKey,
            },
          }
        );
        [inputPath, outPath].forEach(p => fs.existsSync(p) && fs.unlinkSync(p));
        return res.status(200).json({ message: 'success.', url: fileUrl });
      }
    }
  } catch (err) {
    [inputPath, outputPath].forEach(p => fs.existsSync(p) && fs.unlinkSync(p));
    const msg =
      err?.response?.data?.error || err?.response?.data || err?.message || 'Something went wrong.';
    console.log(`Error converting file: ${msg}`);

    const message =
      'We are currently experiencing some issues with processing DOCX files. Please upload the PDF version or contact us on support@opensignlabs.com';
    return res.status(400).json({ error: message });
  }
}
