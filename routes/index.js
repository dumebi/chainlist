let express = require('express');
let router = express.Router();
let utils = require("../utils/utils");
let User = require("../models/user");

router.use('/', function (req, res, next) {
    if(req.session != undefined){
        res.locals.user = req.session.user;
    }
    next();
});

router.get('/', utils.loggedIn, function (req, res, next) {
    res.render('index');
});

router.get('/login', utils.notLoggedIn, function (req, res, next) {
    res.render('login');
});

router.get('/register', utils.notLoggedIn, function (req, res, next) {
    res.render('register');
});

router.get('/get-user', utils.notLoggedIn, function (req, res, next) {
    return res.status(200).json({ status: 'success', data: req.session.user });
});

router.get('/logout', function (req, res, next) {
    req.session.user = null;
    res.redirect('/');
});

router.post('/register', utils.notLoggedIn, function (req, res, next) {
    let newUser = new User;
    let details = {
        email: req.body.email,
        address: req.body.address,
        name: req.body.fname + " " + req.body.lname,
        password: newUser.encrypt(req.body.password),
    };

    User.findOne({ email: req.body.email })
        .then(user => {
            if (user != null) { return res.status(200).json({ status: 'failed', data: "This email is already registered with us." }); }
            else {
                // console.log(details);
                let newUser = new User(details);
                newUser.save().then(user => {
                    let userDetails = user;
                    delete userDetails["password"];
                    req.session.user = userDetails;

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
                                  <h3>Hi ${userDetails.name},</h3>
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
                        email:userDetails.email,
                        body: body,
                        subject: "Your Comflo demo details",
                        from_email: "Jude <jude.dike@comflo.com>"
                    };
                    utils.sendMail(params, (error, result) => {
                        console.log(error)
                        console.log(result)
                        return res.status(200).json({ status: 'success', data: userDetails });
                    });
                });

            }
        }).catch(err => {
        console.log(err);
        return res.status(500).json({ status: 'failed', err: err });
    });
});

router.post('/login', utils.notLoggedIn, function (req, res, next) {
    let email = req.body.email;
    let password = req.body.password;

    // User.findOne({'email':email})
    //     .then(user => {
    //         if(!user.validatePassword(password)){
    //             return s.status(200).json({ status: 'failed', data: "Wrong Password" });
    //         }
    //         let userDetails = user;
    //         delete userDetails["password"];
    //         req.session.user = userDetails;
    //         return res.status(200).json({ status: 'success', data: userDetails });
    //
    //     })
    //     .catch(err => {
    //         console.log(err);
    //         return res.status(500).json({ status: 'failed', err: err });
    //     });
    // console.log(email, password);
    if (email == null || password == null)
        return res.status(200).json({ status: "failed", err: "Some details were not supplied" });
    User.findOne({ email: email })
    .then(user => {
        // console.log("user")
        // console.log(user)
      if (!user) {return res.status(200).json({ status: 'failed', data: "User not found here" });}
      else {
        if (!user.validatePassword(password)) {
          return res.status(200).json({ status: 'failed', data: "Wrong password" });
        }
        let userDetails = user;
        delete userDetails["password"];
        req.session.user = userDetails;
        return res.status(200).json({ status: 'success', data: userDetails });
      }
    }).catch(err => {
      console.log(err)
    return res.status(200).json({ status: 'failed', data: "User not found" });
    });
});

module.exports = router;