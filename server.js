const express = require('express');
const path = require('path');
const serveStatic = require('serve-static');
const nodemailer = require('nodemailer');
const randomstring = require("randomstring");
let mongoose = require('mongoose');
const User = require('./models/user');
const utils = require('./utils/utils');
app = express();

let MONGO_DB = "mongodb://dikejude49:dyke2010@ds143388.mlab.com:43388/comflo";
let options = { promiseLibrary: require('bluebird'), keepAlive: true };
mongoose.Promise = require('bluebird');
mongoose.connect(MONGO_DB, options);


const bodyParser = require('body-parser')
// Add headers
app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

app.use(bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.post('/request', (r, s, n) => {
  console.log(r.body);
  let email = r.body.email;
  let name = r.body.name;
  let address = r.body.address;
  let password = r.body.password;
  if (email == null || name == null || address == null)
    return s.status(200).json({ status: "failed", err: "Some details were not supplied" });
  User.findOne({ email })
    .then(user => {
      if (user != null) { return s.status(200).json({ status: 'failed', data: user }); }
      else {
        let details = r.body;
        delete details["password"];
        // let token = randomstring.generate({
        //   length: 5,
        //   charset: 'numeric'
        // });
        let newUser = new User(details);
        newUser.password = newUser.encrypt(token);
        newUser
          .save().then(user => {
          let body = `
              <!DOCTYPE html>
                <html lang="en">
                  <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
                    <meta name="description" content="">
                    <meta name="author" content="">
                    <title>Comflo Blockchain Demo Details</title>
                  </head>
                
                  <body style="max-width: 600px;margin: 10px auto;padding: 70px;border: 1px solid #ccc;background: #ffffff;color: #4e4e4e;font-family: helvetica;">
                    <div>
                      <div style="margin-bottom: 3rem;">
                        <img src="http://comflo-app.herokuapp.com/static/images/comflologo/colorlogotrans.png" width='120px' alt="Comflo">
                      </div>
                      <h3>Hi ${name},</h3>
                        <p style="margin-bottom: 2em;line-height: 26px;font-size: 14px;">
                          Thank you for registering with is
                        </p>
                    </div>
                    <div>
                      <p style="margin-bottom: 2em;line-height: 26px;font-size: 14px;">
                        Thank you for requesting.
                      </p>
                    </div>
                  </body>
                </html>
          `;
          let params = {

            email:email,
            body: body,
            subject: "Your Comflo demo details",
            from_email: "Jude <jude.dike@comflo.com>"
          };
          utils.sendMail(params, (error, result) => {
            console.log(error)
            console.log(result)
            return s.status(200).json({ status: 'success', data: user });
          });
        });

      }
    }).catch(err => {
    console.log(err);
    return s.status(500).json({ status: 'failed', err: err });
  });
});

// app.post('/join', (r, s, n) => {
//   console.log(r.body)
//   let user = r.body.user;
//   let commodity = r.body.commodity;
//   let commodity_details = r.body.commodityDetails;
//   if (user.length <= 0 || commodity_details.length <= 0 || commodity.length <= 0)
//     return s.status(200).json({ status: "failed", err: "Some details were not supplied" });
//   // User.findOne({ email })
//   //   .then(user => {
//   //     if (user != null) { return s.status(200).json({ status: 'failed', data: user }); }
//   //     else {
//   //       let details = r.body;
//   //       let token = randomstring.generate({
//   //         length: 5,
//   //         charset: 'numeric'
//   //       });
//   //       let newUser = new User(details);
//   //       newUser.password = newUser.encrypt(token);
//   //       newUser
//   //         .save().then(user => {
//   //
//   //       });
//   //
//   //     }
//   //   }).catch(err => {
//   //   console.log(err);
//   //   return s.status(500).json({ status: 'failed', err: err });
//   // });
//   let text = "";
//   Object.keys(commodity_details).forEach(function(key, index) {
//     text += '<p style="line-height: 26px;font-size: 14px;"> '+key+': <strong style="float: right">'+commodity_details[key]+'</strong></p>';
//   });
//
//   let body = `
//     <!DOCTYPE html>
//       <html lang="en">
//         <head>
//           <meta charset="utf-8">
//           <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
//           <meta name="description" content="">
//           <meta name="author" content="">
//           <title>Comflo Join Details</title>
//         </head>
//
//         <body style="max-width: 600px;margin: 10px auto;padding: 70px;border: 1px solid #ccc;background: #ffffff;color: #4e4e4e;font-family: helvetica;">
//           <div>
//             <div style="margin-bottom: 3rem;">
//               <img src="http://comflo-app.herokuapp.com/static/images/comflologo/colorlogotrans.png" width='120px' alt="Comflo">
//             </div>
//
//             <p style="margin-bottom: 2em;line-height: 26px;font-size: 14px;">
//               New comflo join details
//             </p>
//           </div>
//           <div style="padding: 15px;color: #444444;">
//             <p style="margin-top: 0px;line-height: 26px;font-size: 14px;"> Name: <strong style="float: right">${user.name}</strong></p>
//             <p style="margin-top: 0px;line-height: 26px;font-size: 14px;"> Email: <strong style="float: right">${user.email}</strong></p>
//             <p style="margin-top: 0px;line-height: 26px;font-size: 14px;"> Country: <strong style="float: right">${user.country}</strong></p>
//             <p style="margin-top: 0px;line-height: 26px;font-size: 14px;"> Job: <strong style="float: right">${user.job}</strong></p>
//             <p style="margin-top: 0px;line-height: 26px;font-size: 14px;"> Company: <strong style="float: right">${user.company}</strong></p>
//             <p style="line-height: 26px;font-size: 14px;"> Commodity: <strong style="float: right">${commodity}</strong></p>
//             ${text}
//           </div>
//           <div>
//             <p style="margin-bottom: 2em;line-height: 26px;font-size: 14px;">
//               Thanks.
//             </p>
//           </div>
//         </body>
//       </html>
//           `;
//   let params = {
//     email:'chike.mogo@comflo.com',
//     body: body,
//     subject: "New Comflo join details",
//     from_email: "Jude <jude.dike@comflo.com>"
//   };
//   utils.sendMail(params, (error, result) => {
//     console.log(error)
//     console.log(result)
//     return s.status(200).json({ status: 'success', data: user });
//   });
// });


// okpanachi.adaji@comflo.com
app.post('/login', (r, s, n) => {
  if (r.body.email == null || r.body.password == null)
    return s.status(200).json({ status: "failed", err: "Some details were not supplied" });
  let newUser = new User;
  console.log(newUser.encrypt(r.body.password));
  User.findOne({ email: r.body.email })
    .then(user => {
      if (!user) {return s.status(200).json({ status: 'failed', data: "User not found here" });}
      else {
        if (!user.validatePassword(r.body.password)) {
          return s.status(200).json({ status: 'failed', data: "Wrong password" });
        }
        return s.status(200).json({ status: 'success', data: user });
      }
    }).catch(err => {
      console.log(err)
    return s.status(200).json({ status: 'failed', data: "User not found" });
  });
});


app.use(require('connect-history-api-fallback')())
app.use(serveStatic(__dirname + "/docs"));
const port = process.env.PORT || 5000;
app.listen(port);
console.log('server started '+ port);
