/**
 * Helper class to manage push notifications
 */
define(['services/module'], function (services) {
    'use strict';
    services.factory('pushService',['$window', '$q', '$rootScope', '$timeout', 
      function ($window, $q, $rootScope, $timeout) {

	    var push;
	    var options = {
	    		   "android": { "senderID": "939592965084" },
	    		   "ios": { "alert": true, "badge": true, "sound": true}
	    		};
	    
	    return {
	    	
  	        register : function () {
  	          console.log('pushService ==>> register');  	        	
  	          var q = $q.defer();
  	          if ($window.PushNotification == undefined) {
  	        	console.log('pushService ==>> register ... PushNotification == undefined');  
  	            q.reject(new Error('PushNotification is undefined'));
  	          } else {
  	        	console.log('pushService ==>> initialize');
  	        	push = $window.PushNotification.init(options);
  	        	
  	            push.on('notification', function (notification) {
  	              $rootScope.$broadcast('notification', notification);
  	              var notif='Title ['+ notification.title + '] Msg['+notification.message+']';
                  localStorage.setItem("PUSH_NOTIFICATION", notif);

  	              console.log('pushService ==>> onNotification - ['+ notification.title + ']['+notification.message+']');  	        	
  	            });
  	            
  	            push.on('error', function (error) {
  	              $rootScope.$broadcast('pusherror', error);
                  localStorage.setItem("PUSH_ERROR", error);

  	              console.log('pushService ==>> register on error - '+error);
                  q.reject(error);
  	            });
  	            
  	            push.on('registration', function (data) {
  	              console.log('data.registrationId='+data.registrationId);	
                  localStorage.setItem("PUSH_REGISTRATION_ID", data.registrationId);
                  $rootScope.$broadcast('registration', data.registrationId);
  	              q.resolve(data.registrationId);
  	            });
  	          }
  	          return q.promise;
  	        },
  	        
  	        unRegister : function () {
  	          var q = $q.defer();
  	          if ($window.PushNotification == undefined) {
  	            q.reject(new Error('PushNotification is undefined'));
  	          }
  	          if((push != undefined)&&($window.PushNotification != undefined)){
	  	          push.unregister(function (success) {
	  	            q.resolve(success);
    	            console.log('pushService ==>> unregister');  	        	
	  	          },function (error) {
  	  	            console.log('pushService ==>> error unregister'+error);  	        	
	  	        	q.reject(error)
	  	          })
	  	          return q.promise;
  	          }
  	        },
  	        
  	        setBadgeNumber : function (number) {
  	          var q = $q.defer();
  	          if ($window.PushNotification == undefined) {
  	            q.reject(new Error('init must be called before any other operation'));
  	          } else {
  	            push.setApplicationIconBadgeNumber(function (success) {
  	              q.resolve(success);
  	            }, function (error) {
  	              q.reject(error);
  	            }, number);
  	          }
  	          return q.promise;
  	        }
	    };
    	      
    	      
    }]);
});