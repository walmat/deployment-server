const express = require('express');
const morgan = require('morgan');
const http = require('http');
const AWS = require('aws-sdk');
const expressUserAgent = require('express-useragent');
const cors = require('cors');
const path = require('path');

const PORT = process.env.PORT || 9080;
const DEPLOY_NAME = process.env.DEPLOY_NAME;

const app = express();
app.server = http.createServer(app);

const paths = {};
[{ key: 'mac', ext: 'dmg' }, { key: 'win', ext: 'exe' }].forEach(({ key, ext }) => {
  paths[key] = `${DEPLOY_NAME}.${ext}`;
});

AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_KEY,
  region: process.env.BUCKET_REGION,
});

//Creating a new instance of S3:
const s3 = new AWS.S3();

app.use(morgan('dev'));
app.use(cors());
app.use(expressUserAgent.express());

// Create the platform detector handler
app.get('/', (req, res) => {
  // Get the useragent's platform
  const {
    useragent: { platform },
  } = req;

  // Set the right file path ()
  let filePath = null;
  switch (platform) {
    case 'Microsoft Windows': {
      return retrieveFile(paths.win, res);
    }
    case 'Apple Mac': {
      return retrieveFile(paths.mac, res);
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

app.server.listen(PORT, () => {
  console.log(`Started on port ${app.server.address().port}`);

  app.on('shutdown', () => process.exit(0));
});

function retrieveFile(filename, res) {
  const getParams = {
    Bucket: process.env.BUCKET_NAME,
    Key: filename,
  };

  console.log(getParams);

  s3.getObject(getParams, function(err, data) {
    if (err) {
      return res.status(404).send(`Unable to retrieve file! Please contact devs regarding this`);
    } else {
      console.log(data);
      return res.send(data.Body);
    }
  });
}
