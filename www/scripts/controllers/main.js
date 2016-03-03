/**
* Controller for the login view
* */
define(['controllers/module', 'alert-helper'], function (controllers, AlertHelper) {

    'use strict';

    controllers.controller('MainCtrl', function ($scope, navigation, sharoodDB, deviceState, pushService) {

        //------------------------------------------------------------------------------
        console.log("Main controller");
        //console.log("Internet status#"+deviceState.isOnLine());
        //------------------------------------------------------------------------------
        var flagUpdateProfile=false;
        var uuid = localStorage.getItem("PUSH_REGISTRATION_ID"); // = $cordovaDevice.getUUID();
        
        if(uuid === null || uuid === 0){
            pushService.register();
            flagUpdateProfile=true;
        }

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
          * Do login
          * */
          function doLogin(){
              var credentials = $scope.user;
              
              sharoodDB.login($scope.user).then(function(user){
                  localStorage.setItem("credentials", JSON.stringify(credentials));
                  console.log(user);
                  sharoodDB.currentUser = user;
                  
                  if(flagUpdateProfile){
                      sharoodDB.updateProfile($scope.user).then(function(result){
                          console.log(result);
                          sharoodDB.currentUser = result;
                          $scope.currentUser = result;
                          $scope.toggleEditMode();
                      });
                  }
                  
                  navigation.navigate('/home');
                  sharoodDB.updateCurrentUser();
              }).catch(function (error) {
                  AlertHelper.alert('#login-account-alert');
              });
          }

        /**
        * Try autologgín in two ways:
        * 1. Built.io loadCurrentUser()
        * 2. Get credentials from localstorage.
        * */
        function tryAutoLogin(){
            var credentials = localStorage.getItem("credentials");
            if(credentials === null || credentials === "0"){
                sharoodDB.loadCurrentUser().then(function(user){
                    console.log(user.username);
                    sharoodDB.currentUser = user;
//                    $scope.username = user.username;
//                    $scope.cookies = user.cookies;
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

        if(deviceState.isOnLine()){
        	tryAutoLogin();	
        }else{
        	AlertHelper.alert('#offline-account-alert');
        }
        


        $scope.login = function(){
        	console.log('login button pressed!!');
            if (!$scope.loginForm.$valid) {
                return;
            }
            if(deviceState.isOnLine()){
            	doLogin();
            }else{
            	AlertHelper.alert('#offline-account-alert');
            }
        };
        
        $scope.gotoRegister = function(){
        	if(!deviceState.isOnLine()){
        		AlertHelper.alert('#offline-account-alert');
        		return;
        	}
        	
            navigation.navigate('/register');
        };
        
    });

});