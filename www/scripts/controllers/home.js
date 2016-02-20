/**
* Controller for the Home view.
* */
define(['controllers/module', 'alert-helper'], function (controllers, AlertHelper) {

    'use strict';

    controllers.controller('Home', function ($scope, sharoodDB, navigation, deviceState) {
        
        console.log("Home controller");
        console.log("Internet status#"+deviceState.isOnLine());
        //------------------------------------------------------------------------------
        $scope.$on(deviceState.events.onOnline, function (event) {
        	console.log("ONLine EVENT"+"\r\n");
            navigation.navigate('#/');
            return;
        });
        
		//------------------------------------------------------------------------------

        /**
        * Review if the user is logged
        * */
        if(sharoodDB.currentUser === null){
            navigation.navigate('#/');
            return;
        }

        $scope.username = sharoodDB.currentUser.username;
        $scope.cookies = sharoodDB.currentUser.cookies;

        /*
        $scope.username = 'Axel';
        $scope.cookies = 31;
        */

        $scope.navigate = navigation.navigate;
        
        
        $scope.gotoPage = function(option){
        	if(!deviceState.isOnLine()){
        		AlertHelper.alert('#offline-account-alert');
        		return;
        	}
        	
        	if(option==1){
                navigation.navigate('/newChefMeal');
        		return;       		
        	}

        	if(option==2){
                navigation.navigate('/meals');
        		return;       		
        	}
        	
        }
        
        $scope.offlineConfig = {
                id: 'offline-account-alert',
                icon: false,
                title: 'Oops!',
                subtitle: 'It seems you don\'t have an internet connection',
                ok: {
                    id: 'btn-ok',
                    text: 'Ok',
                    cssClass: 'btn-info',
                    callback: function() {
                        AlertHelper.close('#offline-account-alert');
                    }
                }
        };        
    });

});