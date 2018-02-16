'use strict';

var angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .controller('portalCtrl', portalCtrl);

/** @ngInject */
function portalCtrl($scope, $rootScope, $sessionStorage, BUILD_VERSION, AUTH_EVENTS, env, constantKeys, NAV_EVENTS, IS_TOUCH, Page, User) {
    var vm = this;
    vm.env = env;
    vm.BUILD_VERSION = BUILD_VERSION;
    vm.constantKeys = constantKeys;
    vm.dataApi = env.dataApi;
    vm.dataApiV2 = env.dataApiV2;
    vm.tileApi = env.tileApi;
    vm.imageCache = env.imageCache;
    vm.mapCapabilities = env.mapCapabilities;
    vm.IS_TOUCH = IS_TOUCH;
    vm.getDrawer = Page.drawer;

    vm.openHelpdesk = function (type) {
        $rootScope.$broadcast(NAV_EVENTS.toggleFeedback, {toggle: true, type: type});
    };

    vm.hasRole = function(roles){
        roles = _.isString(roles) ? [roles] : roles;
        return _.intersection(_.get($sessionStorage, 'user.roles', []), roles).length > 0;
    };

    function updateUser() {
        vm.tokenUser = User.userFromToken();
    }
    updateUser();
    $scope.$on(AUTH_EVENTS.USER_UPDATED, function () {
        updateUser();
    });
    $scope.$on(AUTH_EVENTS.LOGIN_SUCCESS, function () {
        updateUser();
    });
    $scope.$on(AUTH_EVENTS.LOGOUT_SUCCESS, function () {
        updateUser();
    });
}

module.exports = portalCtrl;
