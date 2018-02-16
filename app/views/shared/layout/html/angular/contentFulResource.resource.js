'use strict';

var angular = require('angular');

(function () {
    'use strict';

    angular
        .module('portal')
        .factory('ContentFul', function ($resource) {
            return $resource('/api/resource', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    },
                    'getByAlias': {
                        method: 'GET',
                        url: '/api/resource/alias'
                    }
                }
            );
        })

    ;
})();