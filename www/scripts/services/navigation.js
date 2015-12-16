/**
 * Helper class to navigate through the views of the app
 */
define(['services/module'], function (services) {
    'use strict';
    services.factory('navigation', function ($window) {
        /**
        * @param path specifies the new path to navigate
        */
        function navigate(path) {
            var realPath = path;
            if (realPath.search('#') === -1) {
                realPath = '#' + path;
            }
            $window.location.href = realPath;
        }

        // Public API here
        return {
            navigate: navigate
        };

    });
});