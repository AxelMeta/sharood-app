/**
 * Directive to create alerts
 */
define(['directives/module'], function (directives) {
    'use strict';

    directives.directive('alert', function () {
        return {
            templateUrl: "views/templates/alert.html",
            restrict: 'E',
            replace: true,
            scope: {
                config: '='
            }
        };
    });
});