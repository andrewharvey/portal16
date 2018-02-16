'use strict';
let express = require('express'),
    cfg = rootRequire('config/config'),
    imageCacheUrl = rootRequire('app/models/gbifdata/apiConfig').image.url,
    _ = require('lodash'),
    countryData = require('./countryData'),
    router = express.Router();

module.exports = function(app) {
    app.use('/', router);
};

function renderForAngular(req, res, next) {
    let key = req.params.key.toUpperCase();
    countryData.getParticipant(key, function(err, country) {
        if (err) {
            if (_.get(err, 'errorResponse.statusCode', 404) < 500) {
                country = {
                    code: key,
                    isParticipant: false
                };
                renderPage(req, res, next, country);
            } else {
                next(err);
            }
        } else {
            country.code = key;
            country.isParticipant = true;
            renderPage(req, res, next, country);
        }
    });
}

router.get('/country/:key', function(req, res, next) {
    renderForAngular(req, res, next);
});
router.get('/country/:key/about', function(req, res, next) {
    renderForAngular(req, res, next);
});
router.get('/country/:key/published', function(req, res, next) {
    renderForAngular(req, res, next);
});

router.get('/country/:key/trends', function(req, res, next) {
    renderForAngular(req, res, next);
});
router.get('/country/:key/trends/about', function(req, res, next) {
    renderForAngular(req, res, next);
});
router.get('/country/:key/trends/published', function(req, res, next) {
    renderForAngular(req, res, next);
});

router.get('/country/:key/participant', function(req, res, next) {
    renderForAngular(req, res, next);
});

router.get('/api/country/:key/news', function(req, res, next) {
    let key = req.params.key.toUpperCase();

    countryData.getCountryData(key, function(err, country) {
        if (err) {
            if (_.get(err, 'errorResponse.statusCode', 404) < 500) {
                next();
            } else {
                next(err);
            }
        } else {
            country.code = key;
            let latest = _.concat(
                _.get(country, 'news.results', []),
                _.get(country, 'dataUse.results', []),
                _.get(country, 'country.results', [])
            );
            country.latest = _.sortBy(latest, ['created']).reverse();
            try {
                if (req.params.ext == 'debug') {
                    res.json(country);
                } else {
                    res.render('pages/country/key/activity/news', {
                        country: country,
                        _meta: {
                            title: res.__('country.' + country.code),
                            imageCacheUrl: imageCacheUrl,
                            customUiView: true
                        }
                    });
                }
            } catch (e) {
                next(e);
            }
        }
    });
});

router.get('/api/country/:key/breakdown', function(req, res, next) {
    let key = req.params.key.toUpperCase();
    let country = {
        code: key
    };
    try {
        res.render('pages/country/key/activity/activities', {
            country: country,
            _meta: {
                title: res.__('country.' + country.code),
                imageCacheUrl: imageCacheUrl,
                customUiView: true
            }
        });
    } catch (e) {
        next(e);
    }
});

router.get('/api/country/:key/trends/about.:ext?', function(req, res, next) {
    let key = req.params.key.toUpperCase();
    let country = {
        code: key
    };
    renderPartialTrendsPage(req, res, next, country, true, 'pages/country/key/trends/about');
});

router.get('/api/country/:key/trends/published.:ext?', function(req, res, next) {
    let key = req.params.key.toUpperCase();
    let country = {
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
                imgUrls: {// TODO more or less just copied from Markus' initial implemetation. Not translatable
                    from: {
                        thumbBase: imageCacheUrl + 'fit-in/300x250/http://' + cfg.analyticsImg + 'country/' + country.code + '/publishedBy/figure/',
                        imgBase: imageCacheUrl + 'http://' + cfg.analyticsImg + 'country/' + country.code + '/publishedBy/figure/'
                    },
                    about: {
                        thumbBase: imageCacheUrl + 'fit-in/300x250/http://' + cfg.analyticsImg + 'country/' + country.code + '/about/figure/',
                        imgBase: imageCacheUrl + 'http://' + cfg.analyticsImg + 'country/' + country.code + '/about/figure/'
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

function renderPage(req, res, next, country) {
    try {
        if (req.params.ext == 'debug') {
            res.json(country);
        } else {
            res.render('pages/country/key/countryKey2', {
                country: country,
                _meta: {
                    title: res.__('country.' + country.code),
                    imageCacheUrl: imageCacheUrl,
                    customUiView: true
                }
            });
        }
    } catch (e) {
        next(e);
    }
}
