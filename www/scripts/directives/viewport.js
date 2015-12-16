/**
 * Directive that creates a viewport to allow user to see photos at full screen
 */
define(['directives/module'], function (directives) {
    'use strict';

    directives.directive('viewport', function () {
        return {
            templateUrl: "views/templates/viewport.html",
            restrict: 'E',
            replace: true,
            link: function (scope, element) {
                var viewport = element[0];
                viewport.addEventListener('click', function() {
                    viewport.classList.remove('open');
                });
            }
        };
    });
});