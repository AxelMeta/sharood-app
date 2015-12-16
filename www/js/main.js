require.config({
    baseUrl: 'scripts/',
    paths: {
        'angular': '../bower_components/angular/angular',
        'domReady': '../bower_components/requirejs-domready/domReady',
        'ngResource': '../bower_components/angular-resource/angular-resource',
        'ngCookies': '../bower_components/angular-cookies/angular-cookies',
        'ngSanitize': '../bower_components/angular-sanitize/angular-sanitize',
        'ngRoute': '../bower_components/angular-route/angular-route',
        'jquery': '../bower_components/jquery/dist/jquery',
        'bootstrap': '../bower_components/bootstrap/dist/js/bootstrap'
    },

    shim: {
        'bootstrap': {
            deps: ['jquery'],
            exports: 'bootstrap'
        },
        'angular': {
            deps: ['jquery', 'bootstrap'],
            exports: 'angular'
        },
        ngResource: {
            deps: ['angular'],
            exports: 'angular'
        },
        ngCookies: {
            deps: ['angular'],
            exports: 'angular'
        },
        ngSanitize: {
            deps: ['angular'],
            exports: 'angular'
        },
        ngRoute: {
            deps: ['angular'],
            exports: 'angular'
        }
    }
});

require(['require', 'angular', 'app', 'routes'], function(require, ng) {
    'use strict';
    // We use domReady RequireJS plugin to make sure that DOM is ready when we start the app
    require(['domReady!'], function (document) {
        ng.bootstrap(document, ['sharoodApp']);
    });
});