/**
* Controller for 'settings' view
* */
define(['controllers/module'], function (controllers) {

    'use strict';

    controllers.controller('Settings', function ($scope, navigation) {
        
        console.log("Settings controller");

        $scope.navigate = navigation.navigate;

    });

});