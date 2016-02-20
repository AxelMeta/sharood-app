/**
 * Directive that emit an event once the ng-repeat has been accomplished
 */
define(['directives/module'], function (directives) {
    'use strict';

    directives.directive('onNgRepeatFinished', function ($timeout) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                if (scope.$last) {
                    $timeout(function () {
                        scope.$emit('ngRepeatFinished');
                    });
                }
            }
        };
    });
});