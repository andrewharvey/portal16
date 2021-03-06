'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('nodeKeyCtrl', nodeKeyCtrl);

/** @ngInject */
function nodeKeyCtrl(Node, NodeEndorsedPublishers, NodeDatasets, $state, $stateParams, constantKeys, $window) {
    var vm = this;
    vm.limit = 5;
    vm.endorsed = {};
    vm.datasets = {};
    vm.maxSize = 5;
    vm.limit = 5;
    vm.key = $stateParams.key;
    if (vm.key == constantKeys.node.secretariat) {
        $window.location.href = '/404';
    }

    vm.node = Node.get({id: vm.key});

    vm.getEndorsed = function() {
        NodeEndorsedPublishers.get({id: vm.key, limit: vm.limit, offset: vm.offset_endorsed},
            function(response) {
                vm.endorsed = response;
            },
            function() {
                // TODO handle errors
            }
        );
    };

    vm.getDatasets = function() {
        NodeDatasets.get({id: vm.key, limit: vm.limit, offset: vm.currentPage_datasets},
            function(response) {
                vm.datasets = response;
            },
            function() {
                // TODO handle errors
            }
        );
    };

    vm.setPageNumbers = function() {
        vm.offset_endorsed = $stateParams.offset_endorsed || 0;
        vm.currentPage_endorsed = Math.floor(vm.offset_endorsed / vm.limit) + 1;

        vm.offset_datasets = $stateParams.offset_datasets || 0;
        vm.currentPage_datasets = Math.floor(vm.offset_datasets / vm.limit) + 1;
        vm.getDatasets();
        vm.getEndorsed();
    };
    vm.setPageNumbers();

    vm.pageChanged_endorsed = function() {
        vm.offset_endorsed = (vm.currentPage_endorsed - 1) * vm.limit;
        var offset = vm.offset_endorsed == 0 ? undefined : vm.offset_endorsed;
        $state.go($state.current, {'limit': vm.limit, 'offset_endorsed': offset, '#': 'endorsedPublishers'}, {inherit: true, notify: false, reload: true});
        vm.getEndorsed();
    };
    vm.pageChanged_datasets = function() {
        vm.offset_datasets = (vm.currentPage_datasets - 1) * vm.limit;
        var offset = vm.offset_datasets == 0 ? undefined : vm.offset_datasets;
        $state.go($state.current, {'limit': vm.limit, 'offset_datasets': offset, '#': 'datasets'}, {inherit: true, notify: false, reload: true});
        vm.getDatasets();
    };
}


module.exports = nodeKeyCtrl;
