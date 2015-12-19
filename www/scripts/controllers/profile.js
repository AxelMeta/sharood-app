/**
* Controller for 'profile' view
* */
define(['controllers/module', 'alert-helper'], function (controllers, AlertHelper) {

    'use strict';

    controllers.controller('Profile', function ($scope, sharoodDB, navigation, cameraHelper) {

        console.log("Profile controller");
        var cameraImg = 'img/camera.png';

        /**
        * Reviews if the user is logged
        * */
        if(sharoodDB.currentUser === null){
            navigation.navigate('#/');
            return;
        }

        $scope.elements = {
            accountDetails: document.querySelector('.account-details'),
            accountEdition: document.querySelector('.account-edition'),
            editBtn: document.querySelector('.account-edit-btn'),
            accountEditionForm: document.querySelector('form#account-form'),
            deleteAccountBtn: document.querySelector('.delete-account')
        };

        $scope.currentUser = sharoodDB.currentUser;

        sharoodDB.getUniversityByUid(sharoodDB.currentUser.university[0]).then(function(university) {
            $scope.university = university;
        });

        if(sharoodDB.currentUser.picture){
            var photo =  document.getElementById('profilePhoto');
            photo.style.backgroundImage = 'url(\'' + sharoodDB.currentUser.picture.url + '\')';
            photo.classList.add('cover');
        }

        $scope.user = {
            first_name: sharoodDB.currentUser.first_name,
            phone: sharoodDB.currentUser.phone,
            email: sharoodDB.currentUser.email,
            username: sharoodDB.currentUser.username
        };

        $scope.navigate = navigation.navigate;

        /*$scope.cookies = 21;
        $scope.name = 'Axel';
        $scope.phone = '6';
        $scope.email = 'mancas@gmail.com';*/

        $scope.isEditModeEnable = false;
        $scope.pictureModal = '#dummy';

        /**
        * Toggles between edit mode and normal mode. Makes the UI changes.
        * */
        $scope.toggleEditMode = function() {
            var photo =  document.getElementById('profilePhoto');
            if ($scope.isEditModeEnable) {
                $scope.isEditModeEnable = false;
                $scope.pictureModal = '#dummy';
                $scope.elements.editBtn.textContent = 'Edit';
                if (sharoodDB.currentUser.picture) {
                    photo.style.backgroundImage = 'url(\'' + sharoodDB.currentUser.picture.url + '\')';
                    photo.classList.add('cover');
                } else {
                    photo.style.backgroundImage = 'url(\'' + cameraImg + '\')';
                    photo.classList.remove('cover');
                }
            } else {
                $scope.isEditModeEnable = true;
                $scope.pictureModal = '#modalProfile';
                $scope.elements.editBtn.textContent = 'Cancel';
                photo.style.backgroundImage = 'url(\'' + cameraImg + '\')';
                photo.classList.remove('cover');
            }

            $scope.elements.accountDetails.classList.toggle('hidden', $scope.isEditModeEnable);
            $scope.elements.accountEdition.classList.toggle('hidden', !$scope.isEditModeEnable);
        };

        /**
        * Handler: Send profile changes to the database.
        * */
        $scope.saveProfile = function() {
            if (!$scope.accountForm.$valid) {
                return;
            }

            function updateProfile() {
                $scope.user.username = $scope.user.first_name;
                // If everything went well
                sharoodDB.updateProfile($scope.user).then(function(result){
                    console.log(result);
                    sharoodDB.currentUser = result;
                    $scope.currentUser = result;
                    $scope.toggleEditMode();
                });
            }

            if (!$scope.imageBase64) {
                updateProfile();
                return;
            }

            var data = cameraHelper.buildServerImg($scope.imageBase64);
            sharoodDB.uploadFile(data).then(function(result) {
                console.log(result.toJSON());
                $scope.user.picture = result.toJSON().uid;

                updateProfile();
            }).catch($scope.onerror);
        };

        /**
        * Handler: Launches change photo process.
        * */
        $scope.changePhoto = function(){
            console.log("Getting Picture");
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


        $scope.deleteAccount = function() {
            AlertHelper.alert('#delete-account-alert');
        };

        $scope.deleteAccountConfig = {
            id: 'delete-account-alert',
            icon: true,
            title: 'Are you sure?',
            subtitle: 'You will not be able to undo this operation!',
            cancel: {
                id: 'delete-btn-cancel',
                text: 'Cancel',
                callback: function() {
                    console.log('Don\'t delete account');
                }
            },
            ok: {
                id: 'delete-btn-ok',
                text: 'Yes, delete it',
                cssClass: 'btn-danger',
                callback: function() {
                    console.log('Delete account');
                }
            }
        };

        $scope.logout = function(){
            AlertHelper.alert('#logout-alert');
        };

        $scope.logoutConfig = {
            id: 'logout-alert',
            icon: true,
            title: 'Are you sure?',
            subtitle: 'You are going to close your session!',
            cancel: {
                id: 'logout-btn-cancel',
                text: 'Cancel',
                callback: function() { }
            },
            ok: {
                id: 'logout-btn-ok',
                text: 'Yes, logout',
                cssClass: 'btn-danger',
                callback: function() {
                    setTimeout(function(){
                        sharoodDB.currentUser = null;
                        console.log('User loged out');
                        localStorage.setItem("credentials", "0");
                        navigation.navigate('/');
                    }, 500);
                    sharoodDB.logout().then(function(result){
                        sharoodDB.currentUser = null;
                        console.log('User loged out');
                        localStorage.setItem("credentials", "0");
                        navigation.navigate('/');
                    });
                }
            }
        };

    });

});
