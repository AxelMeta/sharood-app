/**
* Controller for 'register' view
* */
define(['controllers/module', 'alert-helper'], function (controllers, AlertHelper) {

    'use strict';

    controllers.controller('Register', function ($scope, sharoodDB, navigation, cameraHelper) {

        console.log("Register controller");

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
            photo: {
                title: 'Your photo is required',
                subtitle: '',
                button: 'Ok'
            }
        };

        $scope.hasErrors = false;

        $scope.user = {
            name: null,
            email: null,
            password: null,
            passwordConfirm: null,
            university: null,
            room: null
        };

        $scope.navigate = navigation.navigate;

        /**
        * Sends register data to database
        * */
        $scope.register = function(){
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

            console.info($scope.user);

            sharoodDB.register($scope.user).then(function(user) {
                sharoodDB.currentUser = user;
                var data = cameraHelper.buildServerImg($scope.imageBase64);
                sharoodDB.uploadFile(data).then(function(result) {
                    console.log(result.toJSON());
                    sharoodDB.updateProfile({picture: result.toJSON().uid}).then(function(result){
                        console.log(result);
                        sharoodDB.currentUser = result;
                        $scope.currentUser = result;
                        $scope.hasErrors = false;
                        updateAlertTitles('success');
                        AlertHelper.alert('#register-account-alert');
                    });
                }).catch(onerror);
            }).catch(onerror);
        };

        function onerror(e) {
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