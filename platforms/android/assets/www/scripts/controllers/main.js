/**
* Controller for the login view
* */
define(['controllers/module', 'alert-helper'], function (controllers, AlertHelper) {

    'use strict';

    controllers.controller('MainCtrl', function ($scope, navigation, sharoodDB, deviceState) {

        //------------------------------------------------------------------------------
        console.log("Main controller");
        console.log("Internet status#"+deviceState.isOnLine());
        //------------------------------------------------------------------------------
        /**
        * Try autologgín in two ways:
        * 1. Built.io loadCurrentUser()
        * 2. Get credentials from localstorage.
        * */
        function tryAutoLogin(){
            var credentials = localStorage.getItem("credentials");
            if(credentials === null || credentials === "0"){
                sharoodDB.loadCurrentUser().then(function(user){
                    console.log(user);
                    sharoodDB.currentUser = user;
                    navigation.navigate('/home');
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
        

        $scope.user = {
            email: null,
            password: null
        };

        $scope.login = function(){
            if (!$scope.loginForm.$valid) {
                return;
            }
            if(deviceState.isOnLine()){
            	doLogin();
            }else{
            	AlertHelper.alert('#offline-account-alert');
            }
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
                navigation.navigate('/home');
                sharoodDB.updateCurrentUser();
            }).catch(function (error) {
                AlertHelper.alert('#login-account-alert');
            });
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
    });

});