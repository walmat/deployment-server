const express = require('express');
const http = require('http');
const AWS = require('aws-sdk');
const expressUserAgent = require('express-useragent');

const PORT = process.env.PORT || 9080;
const DEPLOY_NAME = process.env.DEPLOY_NAME;

const app = express();
app.server = http.createServer(app);

app.use(expressUserAgent.express());

const paths = {};
[{ key: 'mac', ext: 'dmg' }, { key: 'win', ext: 'exe' }].forEach(({ key, ext }) => {
  paths[key] = `${DEPLOY_NAME}.${ext}`;
});

//setting the credentials
//The region should be the region of the bucket that you created
//Visit this if you have any confusion - https://docs.aws.amazon.com/general/latest/gr/rande.html
AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_KEY,
  region: 'us-east-1',
});

//Creating a new instance of S3:
const s3 = new AWS.S3();

//GET method route for downloading/retrieving file
app.get('/', (req, res) => {
  const {
    useragent: { platform },
  } = req;

  switch (platform) {
    case 'Microsoft Windows': {
      retrieveFile(paths.win, res);
    }
    case 'Apple Mac': {
      retrieveFile(paths.mac, res);
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

//listening to server 3000
app.listen(3000, () => {
  console.log('Server running on port 3000');
});

//The retrieveFile function
function retrieveFile(filename, res) {
  const getParams = {
    Bucket: 'omega-autoupdater',
    Key: filename,
  };

  s3.getObject(getParams, function(err, data) {
    if (err) {
      return res.status(400).send({ success: false, err: err });
    } else {
      return res.send(data.Body);
    }
  });
}
