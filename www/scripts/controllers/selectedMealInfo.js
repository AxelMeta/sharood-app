/**
* Controller for 'meal where I go' view
* */
define(['controllers/module'], function (controllers, AlertHelper) {

    'use strict';

    controllers.controller('SelectedMealInfo', function ($scope, sharoodDB, navigation, MealService) {

        console.log("SelectedMealInfo controller");

        /**
        * Reviews if the user is logged
        * */
        if(sharoodDB.currentUser === null){
            navigation.navigate('/');
            return;
        }

        $scope.meal = MealService.getCurrentMeal();

        console.log($scope.meal);

        $scope.navigate = navigation.navigate;

        cordova.plugins.email.isAvailable(
            function (isAvailable) {
                console.log('email Available');
            }
        );

        /**
        * Launch email app to contact the chef.
        * */
        $scope.contactChef = function () {
            cordova.plugins.email.open({
                to: [$scope.meal.owner[0].email],
                app: 'mailto'
            });
        }

        /**
        * Cancel the meal.
        * */
        $scope.cancel = function() {
            console.log($scope.meal);
            var cookies = $scope.meal.cookies_value;
            var owner = $scope.meal.owner[0].uid;
            var currentUser = sharoodDB.currentUser.uid;

            sharoodDB.transferCookies(owner, currentUser, cookies).then(function() {
                for (var i = 1; i <= 5; i++) {
                    if ($scope.meal.assistants['assistant' + i] &&
                        currentUser === $scope.meal.assistants['assistant' + i][0].uid) {
                        delete $scope.meal.assistants['assistant' + i][0];
                        delete $scope.meal.picture;
                        console.log($scope.meal);
                        sharoodDB.saveMeal($scope.meal).then(function() {
                            navigation.navigate('/home')
                        });
                        break;
                    }
                }
            });
        }

        function deleteAttendant(mealUid) {
            sharoodDB.getMealById(mealUid).then(function(result){
                for (var i = 1; i <= 5; i++) {
                    if (mealResult.assistants['assistant' + i] &&
                        currentUser === mealResult.assistants['assistant' + i][0].uid) {
                        delete result.picture;
                        delete result.assistants['assistant' + i][0];
                        console.log(result);
                        sharoodDB.saveMeal(meal).then(function() {
                            navigation.navigate('/home')
                        });
                        break;
                    }
                }
            });
        }

    });

});