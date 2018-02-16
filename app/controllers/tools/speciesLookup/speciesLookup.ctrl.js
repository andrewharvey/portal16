let express = require('express'),
    router = express.Router();

module.exports = function(app) {
    app.use('/', router);
};

router.get('/tools/species-lookup', function(req, res) {
    res.render('pages/tools/speciesLookup/speciesLookup', {
        _meta: {
            title: req.__('meta.speciesLookupTitle'),
            description: req.__('meta.speciesLookupDescription')
        }
    });
});

