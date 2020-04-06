const express = require('express');
const AWS = require('aws-sdk');
const expressUserAgent = require('express-useragent');

const PORT = process.env.PORT || 9080;
const DEPLOY_NAME = process.env.DEPLOY_NAME;

const s3 = new AWS.S3();
const app = express();
app.use(expressUserAgent.express());

const paths = {};
[
  { key: 'mac', ext: 'dmg' },
  { key: 'win', ext: 'exe' },
].forEach(({ key, ext }) => {
  paths[key] = `${DEPLOY_NAME}.${ext}`;
});

AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_KEY,
  region: process.env.BUCKET_REGION,
});

app.get('/', (req, res) => {
  const {
    useragent: { platform },
  } = req;

  switch (platform) {
    case 'Microsoft Windows': {
      retrieveFile(paths.win, res);
      break;
    }
    case 'Apple Mac': {
      retrieveFile(paths.mac, res);
      break;
    }
    default: {
      return res
        .status(404)
        .send(
          `Your current platform (${platform}) is unsupported at this time! Please contact devs about adding support`,
        );
    }
  }
});

app.listen(PORT, () => {
  console.log('Server running on port: ', PORT);
});

function retrieveFile(filename, res) {
  const getParams = {
    Bucket: process.env.BUCKET_NAME,
    Key: filename,
  };

  console.log('[DEBUG]: Retrieving file: ', getParams.Key);
  res.attachment(filename);
  s3.getObject(s3Params)
    .createReadStream()
    .pipe(res);
}
