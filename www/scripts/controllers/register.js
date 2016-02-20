/**
 * Controller for 'register' view
 **/
define(['controllers/module', 'alert-helper', 'ngCordova'], function (controllers, AlertHelper) {

    'use strict';

    controllers.controller('Register', function ($scope, sharoodDB, navigation, cameraHelper, $cordovaDevice, deviceState) {

        console.log("Register controller");
        console.log("Internet status#"+deviceState.isOnLine());
        
        //------------------------------------------------------------------------------
        
		//------------------------------------------------------------------------------
        $scope.$on(deviceState.events.onResume, function (event) {
        	console.log("Resume EVENT"+"\r\n");
            navigation.navigate('/');
            return;
        });
        
		//------------------------------------------------------------------------------
        function log(method, error){
          	if(error==null){
          	  console.log("error is null");
          	}else{    	  
        	  //console.log("error="+JSON.stringify(error));
        	  console.log("["+method+"]-Error["+error.status.code+"]["+error.status.text+"]["+error.entity.error_message+"]");
          	}
        }        
        
        $scope.imageBase64 = null;
        var overlay = document.querySelector('.overlay');
        overlay.classList.add('closed');
        
        var ALERT_TITLES = {
            error: {
                title: 'Opps!',
                subtitle: 'Something went wrong. Please try to perform this action later',
                button: 'Ok'
            },
            success: {
                title: 'Account created successfully',
                subtitle: 'You can start using Sharood!',
                button: 'Let\'s go!'
            },
            offline: {
                title: 'Oops!',
                subtitle: 'It seems you don\'t have an internet connection',
                button: 'Ok'
            },
            photo: {
                title: 'Your photo is required',
                subtitle: '',
                button: 'Ok'
            }
        };

        var platform = $cordovaDevice.getPlatform().toLowerCase();

        $scope.hasErrors = false;

        $scope.user = {
            name: null,
            email: null,
            phone: null,
            password: null,
            passwordConfirm: null,
            university: null,
            picture: null,
            room: null,
            device_type: platform
        };

        $scope.navigate = navigation.navigate;

        /**
        * Sends register data to database
        * */
        $scope.register = function(){
        	if (!deviceState.isOnLine()){
                updateAlertTitles('offline');
                AlertHelper.alert('#register-account-alert');
                return;        		
        	}
        	
            if (!$scope.registerForm.$valid) {
                console.log('no validate', $scope.registerForm);
                return;
            }

            if (!$scope.imageBase64) {
                $scope.hasErrors = true;
                updateAlertTitles('photo');
                AlertHelper.alert('#register-account-alert');
                return;
            }
            overlay.classList.remove('closed');
            var data = cameraHelper.buildServerImg($scope.imageBase64);
            sharoodDB.uploadFile(data).then(function(result) {
            	$scope.user.picture = result.toJSON().uid;
            	sharoodDB.register($scope.user).then(function(result) {
                    sharoodDB.currentUser = result;
                    $scope.currentUser = result;
                    $scope.hasErrors = false;
                    updateAlertTitles('success');
                    AlertHelper.alert('#register-account-alert');
                }).catch(onerror);
            }).catch(onerror);
            overlay.classList.add('closed');
        };

        function onerror(error) {
      	    log("register", error);
            $scope.hasErrors = true;
            updateAlertTitles('error');
            AlertHelper.alert('#register-account-alert');
        }

        function onSuccess() {
            if (!$scope.hasErrors) {
                console.log('Account created');
                //alert('User registered. You need to activate it.');
                navigation.navigate('/');
            }
        }

        if (deviceState.isOnLine()){
	        /**
	        * Gets places array and insert the result on university selector.
	        * */
	        sharoodDB.getAllPlaces().then(function(result){
	            result.forEach(function(element){
	                var university = element.toJSON().name;
	                var universityUid = element.toJSON().uid;
	
	                var x = document.getElementById("selectPlace");
	                var option = document.createElement("option");
	                option.text = university;
	                option.value = universityUid;
	                x.add(option);
	            });
	        });
        }else{
            updateAlertTitles('offline');
            AlertHelper.alert('#register-account-alert');
            navigation.navigate('/home');        	
        }
        /**
        * Starts change photo process.
        * */
        $scope.changePhoto = function(){
            navigator.camera.getPicture(this.onCaptureSuccess, this.onCaptureFail, {
                allowEdit: true,
                correctOrientation: true,
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: Camera.PictureSourceType.PHOTOLIBRARY
            }).then(function(base64){
                var photo = document.getElementById('profilePhoto');
                photo.style.backgroundImage = 'url(data:image/jpeg;base64,' + base64 + ')';
                photo.classList.add('cover');
                $scope.imageBase64 = 'data:image/jpeg;base64,' + base64;
            });
        }
        
        $scope.takePicture = function() {
            cameraHelper.getPicture().then(function(base64){
                var photo = document.getElementById('profilePhoto');
                photo.style.backgroundImage = 'url(data:image/jpeg;base64,' + base64 + ')';
                photo.classList.add('cover');
                $scope.imageBase64 = 'data:image/jpeg;base64,' + base64;
            });
        };

        $scope.changePhotoFromFile = function() {
            var options = {
                    allowEdit: true,
                    correctOrientation: true,
                    destinationType: Camera.DestinationType.DATA_URL,
                    sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                    targetHeight: 480,
                    targetWidth: 480
                };
            cameraHelper.getPicture(options).then(function(base64){
                var photo = document.getElementById('profilePhoto');
                photo.style.backgroundImage = 'url(data:image/jpeg;base64,' + base64 + ')';
                photo.classList.add('cover');
                $scope.imageBase64 = 'data:image/jpeg;base64,' + base64;
            });
        };

        function updateAlertTitles(key) {
            var alert = document.querySelector('#register-account-alert');
            var title = alert.querySelector('h2');
            var subtitle = alert.querySelector('p');
            var button = alert.querySelector('#btn-ok');

            title.textContent = ALERT_TITLES[key].title;
            subtitle.textContent = ALERT_TITLES[key].subtitle;
            button.textContent = ALERT_TITLES[key].button;
        }

        $scope.registerAccountConfig = {
            id: 'register-account-alert',
            icon: false,
            title: 'Account created successfully',
            subtitle: 'You can star using Sharood!',
            ok: {
                id: 'btn-ok',
                text: 'Let\'s go!',
                cssClass: 'btn-info',
                callback: onSuccess
            }
        };

    });

});