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

router.post('/register', function (req, res, next) {
    let newUser = new User;
    let details = {
        email: req.body.email,
        address: req.body.address,
        name: req.body.fname + " " + req.body.lname,
        password: newUser.encrypt(req.body.password),
    };

    User.create(details)
        .then(user => {
            let userDetails = user;
            delete userDetails["password"];
            req.session.user = userDetails;
            return res.status(200).json({ status: 'success', data: userDetails });
        })
        .catch(err => {
            return res.status(500).json({ status: 'failed', err: err });
        });
});

router.post('/login', utils.notLoggedIn, function (req, res, next) {
    let email = req.body.email;
    let password = req.body.password;

    User.findOne({'email':email})
        .then(user => {
            if(!user.validatePassword(password)){
                return s.status(200).json({ status: 'failed', data: "Wrong Password" });
            }
            let userDetails = user;
            delete userDetails["password"];
            req.session.user = userDetails;
            return res.status(200).json({ status: 'success', data: userDetails });

        })
        .catch(err => {
            return res.status(500).json({ status: 'failed', err: err });
        });
});

module.exports = router;