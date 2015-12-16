/**
 * Directive to create groups of buttons
 */
define(['directives/module'], function (directives) {
    'use strict';

    directives.directive('buttonGroup', function () {
        return {
            templateUrl: "views/templates/buttonGroup.html",
            restrict: 'E',
            replace: true,
            scope: {
                config: '='
            }
        };
    });
});