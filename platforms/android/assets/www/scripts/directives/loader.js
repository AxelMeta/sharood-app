/**
 * Directive that creates an overlay that shows a loader
 */
define(['directives/module'], function (directives) {
    'use strict';

    directives.directive('loader', function () {
        return {
            templateUrl: "views/templates/loader.html",
            restrict: 'E',
            replace: true,
            scope: {
                closed: '='
            },
            link: function(scope, element) {
                if (scope.closed) {
                    element[0].classList.add('closed');
                }
            }
        };
    });
});