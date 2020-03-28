const express = require('express');
const expressUserAgent = require('express-useragent');
const cors = require('cors');
const path = require('path');

const PORT = process.env.PORT || 9080;
const DEPLOY_DIR = process.env.DEPLOY_DIR;
const DEPLOY_NAME = process.env.DEPLOY_NAME;

const app = express();

const paths = {};
[{ key: 'mac', ext: 'dmg' }, { key: 'win', ext: 'exe' }].forEach(({ key, ext }) => {
  paths[key] = path.resolve(DEPLOY_DIR, `${DEPLOY_NAME}.${ext}`);
});

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
      filePath = paths.win;
      break;
    }
    case 'Apple Mac': {
      filePath = paths.mac;
      break;
    }
    default: {
      break;
    }
  }

  if (filePath) {
    res.status(200);
    res.download(filePath);
  } else {
    res.status(404);
    res.send(
      `Your current platform (${platform}) is unsupported at this time! Please contact devs about adding support`,
    );
  }
});

app.server.listen(PORT, () => {
  console.log(`Started on port ${app.server.address().port}`);

  app.on('shutdown', () => process.exit(0));
});
