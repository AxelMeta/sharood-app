'use strict';

/*define(['config'], function(config){
    var app = angular.module('sharoodApp', [
        'ngCookies',
        'ngResource',
        'ngSanitize',
        'ngRoute'
    ]);

    app.config(config);

    return app;
});*/

define([
    'angular',
    'controllers/index',
    'services/index',
    'directives/index',
    'ngResource',
    'ngCookies',
    'ngSanitize',
    'ngRoute',
    'ngCordova'
], function (ng) {
    'use strict';

    return ng.module('sharoodApp', [
        'app.services',
        'app.controllers',
        'app.directives',
        'ngCookies',
        'ngResource',
        'ngSanitize',
        'ngRoute',
        'ngCordova'
    ]);
});