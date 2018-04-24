let express = require('express');
let router = express.Router();

router.use('/', function (req, res, next) {
    if(req.session != undefined){
        res.locals.user = req.session.user;
    }
    next();
});

router.get('/', function (req, res, next) {
    res.render('index');
});

router.get('/login', function (req, res, next) {
    res.render('login');
});

module.exports = router;