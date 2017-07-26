var express = require('express'),
    helper = rootRequire('app/models/util/util'),
    userModel = require('../api/user/user.model'),
    auth = require('../auth/auth.service'),
    router = express.Router();

//TODO All development of user validation has been cancelled as the api interface hasn't been completed and changed specs
module.exports = function (app) {
    app.use('/user', router);
};

router.get('/', function (req, res) {
    res.redirect(302, './user/profile');
});

router.get('/profile', function (req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/user/user');
});
router.get('/download', function (req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/user/user');
});

router.get('/confirm', function (req, res, next) {
    //ask user service if this user and challenge is valid. If so then sets the token returned and shows success page. If no, then show failed validation page.
    let challengeCode = req.query.code,
        userName = req.query.username;

    userModel.confirm(challengeCode, userName)
        .then(function(user){
            let token = auth.signToken(user);
            auth.setTokenCookie(res, token);//log the user in
            auth.setNoCache(res);//don't cache this response anywhere as it would be misleading

            helper.renderPage(req, res, next, {
                _meta: {
                    bodyClass: 'hasTransparentMenu',
                    hideFooter: true,
                    title: 'Welcome'
                }
            }, 'pages/user/confirmUser/confirmUser');
        })
        .catch(function(err){
            if (err.statusCode > 399 && err.statusCode < 404) {
                //not a valid token //seemingly the API returns 400 for invalid token. for 'isValidChallenge' it returns 401 if invalid.
                helper.renderPage(req, res, next, {}, 'pages/user/confirmUser/invalidToken');
            } else {
                next(err);
            }
        });
});

router.get('/update-password', function (req, res, next) {
    //ask if valid reset token. if so show form that posts to update password service with token and new password. if not valid then inform user.
    let challengeCode = req.query.code,
        userName = req.query.username;

    userModel.isValidChallenge(userName, challengeCode)
        .then(function(){
            let context = {
                challengeCode: challengeCode,
                userName: userName
            };
            auth.setNoCache(res);
            helper.renderPage(req, res, next, context, 'pages/user/updatePassword/updatePassword');
        })
        .catch(function(){
            //not a valid token
            helper.renderPage(req, res, next, {}, 'pages/user/updatePassword/invalidToken');
        });
});

