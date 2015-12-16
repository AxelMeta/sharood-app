/**
* Controller for 'rate chef' view
* */
define(['controllers/module', 'alert-helper'], function (controllers, AlertHelper) {

    'use strict';

    controllers.controller('RateChef', function ($scope, sharoodDB, navigation, MealService) {

        console.log("RateChef controller");

        /**
        * Reviews if the user is logged
        * */
        if(sharoodDB.currentUser === null){
            navigation.navigate('/');
            return;
        }

        var mealInfo = MealService.getCurrentMeal();

        $scope.meal = mealInfo;

        $scope.navigate = navigation.navigate;

        $scope.foodLevelConfig = {
            values: [1, 2, 3, 4, 5],
            id: 'foodLevelStars',
            name: 'foodLevelStars',
            number: 1,
            editable: true
        };

        $scope.friendlinessConfig = {
            values: [1, 2, 3, 4, 5],
            id: 'friendlinessStars',
            name: 'friendlinessStars',
            number: 1,
            editable: true
        };

        $scope.funConfig = {
            values: [1, 2, 3, 4, 5],
            id: 'funStars',
            name: 'funStars',
            number: 1,
            editable: true
        };

        /**
        * Saves rating on the database.
        * */
        $scope.vote = function(){
            var foodLevelStars = document.getElementById('foodLevelStars').querySelectorAll('.active').length;
            var friendlinessStars = document.getElementById('friendlinessStars').querySelectorAll('.active').length;
            var funStars = document.getElementById('funStars').querySelectorAll('.active').length;
            //var notes = document.getElementById('notes').value;
            var overlay = document.querySelector('.overlay');
            overlay.classList.remove('closed');

            console.log(foodLevelStars, friendlinessStars, funStars);

            sharoodDB.addVotesToUser(mealInfo.owner[0].uid, friendlinessStars, foodLevelStars, funStars).then(function(result){
                console.log(result);
                sharoodDB.getmealById(mealInfo.uid).then(function(result){
                    console.log(result);
                    var mealResult = addUserVote(result);
                    console.log(mealResult);
                    delete mealResult.picture;
                    sharoodDB.saveMeal(mealResult).then(function(result){
                        overlay.classList.add('closed');
                        AlertHelper.alert('#rate-success-alert');
                    });
                });
            });
        }

        /**
        * Adds rate to the chef.
        * */
        function addUserVote(meal) {
            if(typeof meal.votedby == 'undefined'){
                meal.votedby = [sharoodDB.currentUser.uid];
            } else {
                meal.votedby.push(sharoodDB.currentUser.uid);
            }

            return meal;
        }

        $scope.rateAlertConfig = {
            id: 'rate-success-alert',
            icon: false,
            title: 'Thanks!',
            subtitle: 'Your feedback has been registered successfully',
            ok: {
                id: 'btn-ok',
                text: 'Ok',
                cssClass: 'btn-info',
                callback: function() {
                    navigation.navigate('/home');
                }
            }
        };

    });

});