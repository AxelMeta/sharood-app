/**
* Controller for 'view meal' view
* */
define(['controllers/module', 'alert-helper'], function (controllers, AlertHelper) {

    'use strict';

    controllers.controller('ViewMeal', function ($scope, MealService, sharoodDB, navigation, $routeParams) {
        
        console.log("ViewMeal controller");
        var overlay = document.querySelector('.overlay');
        overlay.classList.add('closed');
        /**
        * Reviews if the user is logged
        * */
        if(sharoodDB.currentUser === null){
            console.log("current");
            navigation.navigate('/');
            return;
        }

        var mealInfo = MealService.getCurrentMeal();
        var errorSavingSeat = false;
        var ALERT_TITLES = {
            error: {
                title: 'Opps!',
                subtitle: 'There is no seat!'
            },
            cookies: {
                title: 'Opps!',
                subtitle: 'You haven\'t enough cookies'
            },
            success: {
                title: 'Awesome!',
                subtitle: 'You have saved your seat for this meal'
            }
        };
        

        if($routeParams.onlyInfo == 'info' || $routeParams.onlyInfo == ':onlyInfo'){
            $scope.hideSaveButton = true;
        } else {
            $scope.hideSaveButton = false;
        }

		$scope.meal = mealInfo;  

        var currentDate = new Date();
        if($scope.meal.time < currentDate.toISOString() && ! $scope.hideSaveButton){
            $scope.hideSaveButton = true;
        }

		console.log('Esta es la comida');
        console.log($scope.meal);

        $scope.foodConfig = {
            values: [1, 2, 3, 4, 5],
            id: 'foodStars',
            name: 'foodStars',
            number: Math.round(mealInfo.owner[0].food_level_rating / mealInfo.owner[0].food_level_rating_nofvotes),
            editable: false
        };

        $scope.friendlinessConfig = {
            values: [1, 2, 3, 4, 5],
            id: 'friendlinessStars',
            name: 'friendlinessStars',
            number: Math.round(mealInfo.owner[0].friendliness_chef_rating / mealInfo.owner[0].friendliness_chef_rating_nofvotes),
            editable: false
        };

        $scope.funConfig = {
            values: [1, 2, 3, 4, 5],
            id: 'funStars',
            name: 'funStars',
            number: Math.round(mealInfo.owner[0].fun_rating / mealInfo.owner[0].fun_rating_nofvotes),
            editable: false
        };

        /**
        * Adds an attendant to the attendant array.
        * */
        function addPerson(meal){
            if (sharoodDB.currentUser.cookies < meal.cookies_value) {
                errorSavingSeat = 'cookies';
                return false;
            }
            if(typeof meal.assistants == 'undefined'){
                meal.assistants = { assistant1: sharoodDB.currentUser.uid }
                return meal;
            } else {
                for(var i = 1; i <= meal.people; i++){
                    console.log('assistant' + i);
                    if(typeof meal.assistants[("assistant" + i)] == 'undefined'){
                        meal.assistants[("assistant" + i)] = [];
                    }
                    if(!meal.assistants['assistant' + i][0]){
                        meal.assistants['assistant' + i][0] = sharoodDB.currentUser.uid;
                        return meal;
                    }
                }
            }

            errorSavingSeat = 'error';
            return false;
        }

        /**
        * Handler: starts the save seat process and save the result on the database.
        * */
        $scope.saveSeat = function(){
        	overlay.classList.remove('closed');
            sharoodDB.getMealById(mealInfo.uid).then(function(result){
                var mealResult = addPerson(result);
                if(mealResult){
                    delete mealResult.picture;
                    sharoodDB.saveMeal(mealResult).then(function(result){
                        console.log(result);
                        var cookies = mealResult.cookies_value;
                        var owner = mealResult.owner[0];
                        var current = sharoodDB.currentUser.uid;
                        sharoodDB.transferCookies(current, owner, cookies).then(function() {
                            errorSavingSeat = false;
                            updateAlertTitles();
                            AlertHelper.alert('#save-seat-alert');
                        });
                    });
                } else {
                    updateAlertTitles();
                    AlertHelper.alert('#save-seat-alert');
                }
                overlay.classList.remove('closed');
            });
        }

        /**
        * Gets the empty seats on the meal.
        * */
        $scope.getSeats = function(){
            var number = 0;

            if(typeof $scope.meal.assistants === 'undefined'){
                return $scope.meal.people;
            }

            for(var i = 1; i <= $scope.meal.people; i++){
                if(typeof $scope.meal.assistants[("assistant" + i)] !== 'undefined' && 
                   $scope.meal.assistants['assistant' + i].length !== 0){
                    number++;
                }
            }

            return $scope.meal.people - number;
        }

        /**
        * Handler: opens the extended view of meal's photo.
        * */
        $scope.openViewport = function($event) {
            console.log($event.currentTarget);
            var viewport = document.querySelector('.viewport');
            viewport.style.backgroundImage = 'url(' + $event.currentTarget.src + ')';

            viewport.classList.add('open');
        };

        function updateAlertTitles() {
            var key = 'success';
            if (errorSavingSeat) {
                key = errorSavingSeat;
            }

            var alert = document.querySelector('#save-seat-alert');
            var title = alert.querySelector('h2');
            var subtitle = alert.querySelector('p');

            title.textContent = ALERT_TITLES[key].title;
            subtitle.textContent = ALERT_TITLES[key].subtitle;
        }

        function onsuccess() {
            if (!errorSavingSeat) {
                $scope.navigate('/selectedMealInfo');
            } else {
                AlertHelper.close('#save-seat-alert');
            }
        }

        $scope.navigate = navigation.navigate;

        $scope.saveSeatConfig = {
            id: 'save-seat-alert',
            icon: false,
            title: 'Awesome!',
            subtitle: 'You have saved your seat for this meal',
            ok: {
                id: 'btn-ok',
                text: 'Ok',
                cssClass: 'btn-info',
                callback: onsuccess
            }
        };
    });

});