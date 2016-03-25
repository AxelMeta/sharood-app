/**
* Controller for the login view
* */
define(['controllers/module', 'alert-helper'], function (controllers, AlertHelper) {

    'use strict';

    controllers.controller('MainCtrl', function ($scope, $timeout, navigation, sharoodDB, pushService) { //deviceState, 

        //------------------------------------------------------------------------------
        console.log("Main controller");
        //console.log("Internet status#"+deviceState.isOnLine());
        //------------------------------------------------------------------------------
        //var uuid = localStorage.getItem("PUSH_REGISTRATION_ID"); // = $cordovaDevice.getUUID();
        
         $scope.navigate = navigation.navigate;

         $scope.loginConfig = {
             id: 'login-account-alert',
             icon: false,
             title: 'Bad credentials',
             subtitle: 'The user or the password doesn\'t exists',
             ok: {
                 id: 'btn-ok',
                 text: 'Ok',
                 cssClass: 'btn-info',
                 callback: function() {
                     AlertHelper.close('#login-account-alert');
                 }
             }
         };
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
         $scope.user = {
                 email: null,
                 password: null
         };
         /**
          * subscribe process
          */
         function subscribeProcess(user){
           	console.log('subscribe userId['+user.uid+']');
            pushService.register();
           	$timeout(function(){ 
                    sharoodDB.subscribeChannel('Meal.object.create', user.uid)
	                	.then(function(inst) {

	                	user.installation_data_id=inst.uid;
	                	sharoodDB.updateProfileInstallID(user).then(function(usresult) {
                      		console.log("update install data OK!!");
                      	}, function(error) {
                            console.log("updateProfile install data error "+JSON.stringify(error));
                        });
	                    }, function(error) {
	                    	
                	});
             }, 2000);
         }
         
         /**
          * Do login
          * */
          function doLogin(){
              var credentials = $scope.user;
              
              sharoodDB.login($scope.user).then(function(user){
                  localStorage.setItem("credentials", JSON.stringify(credentials));
                  console.log(user.username);
                  sharoodDB.currentUser = user;
                  if(user.installation_data_id == null || user.installation_data_id=='' || user.installation_data_id=='undefined'){
                	  subscribeProcess(sharoodDB.currentUser);
                  }
                  navigation.navigate('/home');
                  sharoodDB.updateCurrentUser();
									sharoodDB.updateMealNotification();
              }).catch(function (error) {
                  if(error==0){
                    AlertHelper.alert('#offline-account-alert');                    
                  }else{
                    AlertHelper.alert('#login-account-alert');                    
                  }
              });
          }

        /**
        * Try autologgín in two ways:
        * 1. Built.io loadCurrentUser()
        * 2. Get credentials from localstorage.
        * */
        function tryAutoLogin(){
            console.log('Trying autologin with localStorage credentials');
            var credentials = localStorage.getItem("credentials");
            if(credentials === null || credentials === "0"){
                sharoodDB.loadCurrentUser().then(function(user){
                    console.log(user.username);
                    sharoodDB.currentUser = user;
                    if(user.installation_data_id == null || user.installation_data_id=='' || user.installation_data_id=='undefined'){
                  	  subscribeProcess(sharoodDB.currentUser);
                    }
//                    $scope.username = user.username;
//                    $scope.cookies = user.cookies;
										sharoodDB.updateMealNotification();
                    navigation.navigate('/home');
                }).catch(function (e) {
                	console.log("Error["+e.status.code+"]["+e.status.text+"]["+e.entity.error_message+"]");
                	//doLogin();
                });
            } else {
                $scope.user = JSON.parse(credentials);
                doLogin();
            }
        }
        
        tryAutoLogin();
/*
        if(deviceState.isOnLine()){
        	tryAutoLogin();	
        }else{
        	AlertHelper.alert('#offline-account-alert');
        }
*/        


        $scope.login = function(){

        	if (!$scope.loginForm.$valid) {
                return;
            }
        	doLogin();
            
            /*
            if(deviceState.isOnLine()){
            	doLogin();
            }else{
            	AlertHelper.alert('#offline-account-alert');
            }
            */
        };
        
        $scope.gotoRegister = function(){
        	/*
        	if(!deviceState.isOnLine()){
        		AlertHelper.alert('#offline-account-alert');
        		return;
        	}
        	*/
            navigation.navigate('/register');
        };
        
    });

});