# Setup

## Server Side

## Client

**Prerequisites:**

* Most recent LTS Node version (currently 8.9.4), which can be downloaded [here](https://nodejs.org/en/download/)
* npm 5+ (bundled with Node)
* Yarn package manager

(Once npm is installed, run `npm install -g yarn` to install Yarn.)

### Install Dependencies

From the root of this repository, run the following command to install all dependencies:

```bash
yarn --pure-lockfile
```

### Build Client-Side Code

You have a few options, depending on your workflow:

##### `npm run dev`

All files are watched for changes and rebuilt on changes. Open up the application from wherever you configured your server (e.g., `http://localhost`).

##### `npm start`

Utilizes `webpack-dev-server` to achieve hot module reloading. All files are watched and code rebuilt on changes; the changes will show up immediately without needing to refresh the browser.

Open up `http://localhost:9000` after running the command. Note that this proxies all API requests to your backend endpoint. If you're backend code is not listening on port `80`, then you'll need to pass in the app port as a runtime environment variable, like so:

`APP_PORT=9020 npm start` (substituting whatever port you wish to use for `9020`)

### `npm run prop`

For production builds—which minify the assets, remove source maps, etc.—run ```npm run prod```. This is not suitable for development purposes.



