/**
 * Directive to perform an infinite scroll
 */
define(['directives/module'], function (directives) {
    'use strict';

    directives.directive('ngInfiniteScroll', function ($rootScope, $window, $timeout) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var onScrollHandler, scrollDistance, listItemHeight;
                $window = angular.element($window);
                // By default scrollDistance is 2
                scrollDistance = 2;
                listItemHeight = 70;
                if (attrs.scrollDistance != null) {
                    scope.$watch(attrs.scrollDistance, function(value) {
                        console.log(value);
                        return scrollDistance = parseInt(value, 10);
                    });
                }
                onScrollHandler = function() {
                    var elementBottom, remaining, shouldScroll, windowBottom;

                    windowBottom = $window.height() + $window.scrollTop();
                    elementBottom = element.offset().top + element.height();
                    remaining = elementBottom - windowBottom;
                    shouldScroll = remaining <= (listItemHeight * scrollDistance);

                    if (shouldScroll && attrs.ngInfiniteScrollCallback !== null) {
                        if ($rootScope.$$phase) {
                            console.log('here');
                            return scope.$eval(attrs.ngInfiniteScrollCallback);
                        } else {
                            console.log('apply', attrs);
                            return scope.$apply(attrs.ngInfiniteScrollCallback);
                        }
                    }
                };

                $window.on('scroll', onScrollHandler);
                scope.$on('$destroy', function() {
                    return $window.off('scroll', onScrollHandler);
                });

                return $timeout((function() {
                    return onScrollHandler();
                }), 0);
            }
        };
    });
});