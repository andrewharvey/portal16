var express = require('express'),
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/tools/data-validator', function (req, res) {
    res.render('pages/tools/dataValidator/dataValidator', {
        _meta: {
            title: 'Data validator'
        }
    });
});

