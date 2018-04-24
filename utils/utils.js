let nodemailer = require("nodemailer");
exports.sendMail = function (params, callback) {
  let email = params.email;
  let from_email = params.from_email;
  let body = params.body;
  let subject = params.subject;
  if (email == null || from_email == null || body == null || subject == null)
    return { status: "failed", err: "the required parameters were not supplied" };
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    service: 'Gmail',
    auth: {
      user: 'jude.dike@comflo.com',
      pass: 'dyke2010'
    }
  });

  let mailOptions = {
    from: from_email,
    to: email,
    subject: subject,
    html: body
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      callback(error, null);
    } else {
      callback(error, info.response);
    }
  });
}

exports.loggedIn = function (req, res, next) {
    if (req.session.user == undefined || req.session.user == null) {
        req.flash('error', "We couldnt verify your session ID");
        return res.redirect("/login")
    }
    return next();
}

exports.notLoggedIn = function (req, res, next) {
    if (req.session.user != undefined && req.session.user != null) {
        return res.redirect("/")
    }
    return next();
}