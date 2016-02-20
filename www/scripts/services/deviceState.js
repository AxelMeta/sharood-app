/**
 * Helper class to broadcast device state of the app
 */
define(['services/module'], function (services) {
    'use strict';
    services.factory('deviceState', function ($rootScope, $document) {
        var _events = {
                onPause: 'onPause',
                onResume: 'onResume',
                onOnline: 'onOnline',
                onOffline: 'onOffline'
        };
        
        var onLine=true;
        
        function isOnLine(){
        	return onLine;
        }
        
        $document.bind('resume', function () {
            _publish(_events.onResume, null);
        }); 
        
        $document.bind('pause', function () {
            _publish(_events.onPause, null);
        });

        $document.bind('online', function () {
            _publish(_events.onOnline, null);
            onLine=true;
        });

        $document.bind('offline', function () {
            _publish(_events.onOffline, null);
            onLine=false;
        });
        
        function _publish(eventName, data) {
            $rootScope.$broadcast(eventName, data)
        }
        
        
        return {
            events: _events,
        	isOnLine: isOnLine
        }
    });
});