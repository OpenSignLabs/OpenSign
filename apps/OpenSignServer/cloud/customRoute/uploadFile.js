// npm packages
import multer from 'multer';
import multerS3 from 'multer-s3';
import aws from 'aws-sdk';
import dotenv from 'dotenv';
dotenv.config();

function sanitizeFileName(fileName) {
  // Remove spaces and invalid characters
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '');
}

async function uploadFile(req, res) {
  try {
    //--size extended to 100 mb
    const size = 100 * 1024 * 1024;
    //console.log(size);

    const accepted_extensions = [
      'jpg',
      'png',
      'gif',
      'mp4',
      'mp3',
      'pdf',
      'jpeg',
      'dwg',
      'dxf',
      'zip',
      'rar',
      'txt',
      'doc',
      'docx',
      'pptx',
      'ppt',
      'xlsx',
      'xlsm',
      'xlsb',
      'xltx',
      'xml',
      'xls',
      'xla',
      'xlx',
    ];

    const DO_ENDPOINT = process.env.DO_ENDPOINT;
    const DO_ACCESS_KEY_ID = process.env.DO_ACCESS_KEY_ID;
    const DO_SECRET_ACCESS_KEY = process.env.DO_SECRET_ACCESS_KEY;
    const DO_SPACE = process.env.DO_SPACE;
    const spacesEndpoint = new aws.Endpoint(DO_ENDPOINT);
    const s3 = new aws.S3({
      endpoint: spacesEndpoint,
      accessKeyId: DO_ACCESS_KEY_ID,
      secretAccessKey: DO_SECRET_ACCESS_KEY,
      signatureVersion: 'v4',
      region: process.env.DO_REGION,
    });

    const parseBaseUrl = process.env.SERVER_URL;
    const parseAppId = process.env.APP_ID;

    if (process.env.USE_LOCAL == "TRUE") {
      var fileStorage = multer.diskStorage({
        destination: function(req, file, cb) {
          cb(null, "files/files");
        },
        metadata: function (req, file, cb) {
          cb(null, { fieldName: 'OPENSIGN_METADATA' });
        },
        filename: function(req, file, cb) {
          let filename = file.originalname;
          let newFileName = filename.split('.')[0];
          let extension = filename.split('.')[1];
          newFileName = sanitizeFileName(newFileName + '_' + new Date().toISOString() + '.' + extension)
          console.log(newFileName);
          cb(null, newFileName);
        }
      });
    } else {
      var fileStorage = multerS3({
        acl: 'public-read',
        s3,
        bucket: DO_SPACE,
        metadata: function (req, file, cb) {
          cb(null, { fieldName: 'OPENSIGN_METADATA' });
        },
        key: function (req, file, cb) {
          //console.log(file);
          let filename = file.originalname;
          let newFileName = filename.split('.')[0];
          let extension = filename.split('.')[1];
          newFileName = sanitizeFileName(newFileName + '_' + new Date().toISOString() + '.' + extension)
          console.log(newFileName);
          cb(null, newFileName);
        }
      });
    }

    // const s3 = new aws.S3();
    const upload = multer({
      fileFilter: function (req, file, cb) {
        if (accepted_extensions.some(ext => file.originalname.toLowerCase().endsWith('.' + ext))) {
          return cb(null, true);
        }
        // otherwise, return error
        return cb('Only ' + accepted_extensions.join(', ') + ' files are allowed!');
      },
      storage: fileStorage,
      limits: { fileSize: size },
    }).single('file');

    //--call upload function--
    upload(req, res, function (err, some) {
      if (err) {
        console.log(err);
        const status = 'Error';
        const message = err;
        const returnCode = 1029;
        return res.send({ status, returnCode, message });
      }

      const status = 'Success';
      //res.header("Access-Control-Allow-Headers", "Content-Type");
      //res.setHeader("Access-Control-Allow-Origin", "*");
      if (process.env.USE_LOCAL == "TRUE") {
        console.log(req.file);
        var fileUrl = `${parseBaseUrl}/files/${parseAppId}/${req.file.filename}`;
      } else {
        var fileUrl = req.file.location;
      }

      return res.json({ status, imageUrl: fileUrl });
    });
  } catch (err) {
    console.log('Exeption in query ' + err.stack);
    const status = 'Error';
    const returnCode = 1021;
    const message = 'Some error occurred';
    return res.send({ status, returnCode, message });
  }
}
export default uploadFile;
