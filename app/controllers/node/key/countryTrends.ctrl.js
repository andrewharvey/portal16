"use strict";
var express = require('express'),
    cfg = rootRequire('config/config'),
    imageCacheUrl = rootRequire('app/models/gbifdata/apiConfig').image.url,
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/api/country/:key/trends/about\.:ext?', function (req, res, next) {
    var key = req.params.key.toUpperCase();
    var country = {
        code: key
    };
    renderPartialTrendsPage(req, res, next, country, true, 'pages/country/key/trends/about');
});

router.get('/api/country/:key/trends/published\.:ext?', function (req, res, next) {
    var key = req.params.key.toUpperCase();
    var country = {
        code: key
    };
    renderPartialTrendsPage(req, res, next, country, false, 'pages/country/key/trends/published');
});

function renderPartialTrendsPage(req, res, next, country, isAbout, template) {
    try {
        if (req.params.ext == 'debug') {
            res.json(country);
        } else {
            res.render(template, {
                country: country,
                isAbout,
                imgUrls: {//TODO more or less just copied from Markus' initial implemetation. Not translatable
                    from: {
                        thumbBase: imageCacheUrl + "fit-in/300x250/http://" + cfg.analyticsImg + 'country/' + country.code + '/publishedBy/figure/',
                        imgBase: imageCacheUrl + "http://" + cfg.analyticsImg + 'country/' + country.code + '/publishedBy/figure/'
                    },
                    about: {
                        thumbBase: imageCacheUrl + "fit-in/300x250/http://" + cfg.analyticsImg + 'country/' + country.code + '/about/figure/',
                        imgBase: imageCacheUrl + "http://" + cfg.analyticsImg + 'country/' + country.code + '/about/figure/'
                    }
                },
                _meta: {
                    title: res.__('country.' + country.code),
                    imageCacheUrl: imageCacheUrl
                }
            });
        }
    } catch (e) {
        next(e);
    }
}