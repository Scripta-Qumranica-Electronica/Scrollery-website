const { resolve } = require('path')
const webpack = require('webpack')
const middleware = require('webpack-dev-middleware')
const conf = require('./webpack.server.js')
const compiler = webpack(conf)
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
app.use(bodyParser.text({type: '*/*'}))
const formidable = require('formidable')

const { exec } = require('child_process')

// const perl = (req, res) => {

//   const sendErr = msg => res.status(500).send(msg || "Request Failed")
  
//   var form = new formidable.IncomingForm();
//   form.parse(req, (err, fields, files) => {

//     try {
//       if (err) {
//         console.error(err)
//         return sendErr()
//       }
      
//       const file = resolve.apply(null, [__dirname].concat(req.url.split("/")))
//       var bodyStr = Object.keys(fields).reduce((acc, key) => {
//         return acc + `${acc.length ? "&" : ""}${key}=${fields[key]}`
//       }, "")
//       exec(`carton exec ${file} "${bodyStr}"`, {cwd: file.substring(0, file.lastIndexOf("/")), maxBuffer: Infinity}, (err, stdout, stderr) => {
//         try {
//           if (err) {
//             console.error(err)
//             sendErr(err.message)
//           } else if (stderr) {
//             console.error(stderr)
//             sendErr(stderr)
//           } else if (stdout) {
//             const payload = stdout.replace(/^[^\{]*/g, "")
//             payload
//               ? res.json(JSON.parse(payload))
//               : res.status(200).send("OK")
//           } else {
//             res.status(400).send("Request Failed")
//           }
//         } catch (err) {
//           sendErr("Request Failed")
//         }
//       })
//     } catch (err) {
//       console.error(err)
//       sendErr("Request Failed")
//     }
//   })
// }

const perl = (req, res) => {

  const sendErr = msg => res.status(500).send(msg || "Request Failed")
  const file = resolve.apply(null, [__dirname].concat(req.url.split("/")))
  exec(`carton exec ${file} 'POSTDATA=${req.body}'`, {cwd: file.substring(0, file.lastIndexOf("/")), maxBuffer: Infinity}, (err, stdout, stderr) => {
    try {
      if (err) {
        console.error(err)
        sendErr(err.message)
      } else if (stderr) {
        console.error(stderr)
        sendErr(stderr)
      } else if (stdout) {
        const payload = stdout.replace(/^[^\{]*/g, "")
        payload
          ? res.json(JSON.parse(payload))
          : res.status(200).send("OK")
      } else {
        res.status(400).send("Request Failed")
      }
    } catch (err) {
      sendErr("Request Failed")
    }
  })
}

app.get("/", (req, res) => {
  res.sendFile(resolve(__dirname, "index.html"))
})

app.use(require("webpack-hot-middleware")(compiler));
const serveWebpack = middleware(compiler, {
  publicPath: "/dist/",
});
app.get(/.*/, (req, res, next) => {
  if (/\/vendors/.test(req.url) || /\/resources/.test(req.url) || /\/node_modules/.test(req.url)) {
    res.sendFile(resolve.apply(null, [__dirname].concat(req.url.replace(/\?.*$/, '').split("/"))))
   } else {
    serveWebpack(req, res, next)
  }
})

app.post(/\.pl/, perl)

app.listen(process.env.PORT || 9090, () => console.log(`SQE server listening on port ${process.env.PORT || 9090}!`))
