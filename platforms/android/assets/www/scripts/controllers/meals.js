/**
* Controller for list of meals view
* */
define(['controllers/module'], function (controllers) {

    'use strict';

    controllers.controller('Meals', function ($scope, sharoodDB, navigation, MealService, $q) {
        
        console.log("Meals controller");

        /**
        * Reviews if the user is logged
        * */
        if(sharoodDB.currentUser === null){
            navigation.navigate('/');
            return;
        }

        $scope.mealsToRender = [];
        $scope.AllMeals = [];
        $scope.ToAttendMeals = [];
        $scope.MyMeals = [];
        $scope.currentMeals = [];
        var chunk = 10;
        var toggleMeals = {
            meals: {
                elements: 'AllMeals',
                load: true,
                method: 'getAllMeals'
            },
            toAttend: {
                elements: 'ToAttendMeals',
                load: false,
                method: 'getAllMealsByAssistant'
            },
            myMeals: {
                elements: 'MyMeals',
                load: false,
                method: 'getAllMealsByOwner'
            }
        };
        
        $scope.username = sharoodDB.currentUser.username;
        $scope.cookies = sharoodDB.currentUser.cookies;
        /*
        $scope.username = 'Axel';
        $scope.cookies = 31;
        */

        $scope.navigate = navigation.navigate;


        /**
        * Loads the view's first elements. This reduces load time because we show firstly the
        * first elements and we load the others in execution time.
        * */
        $scope.loadFirstElements = function() {
            var lastIndex = chunk;
            // Clean array
            $scope.mealsToRender = [];
            if (lastIndex > $scope.currentMeals.length) {
                lastIndex = $scope.currentMeals.length;
            }

            for (var i = 0; i < lastIndex; i++) {
                $scope.mealsToRender.push($scope.currentMeals[i]);
            }
        }

        /**
        * Loads the meal's images.
        * */
        $scope.drawImages = function() {
            var queue = angular.copy($scope.mealsToRender);
            var currentIndex = 0;

            function processQueue() {
                var currentElement = queue.shift();
                if (!currentElement) {
                    // Last element
                    return;
                }
                var listItem = document.querySelector('[data-index="' + currentIndex + '"]');
                var img = listItem.querySelector('img');

                img.onload = function() {
                    currentIndex++;
                    processQueue();
                };

                img.onerror = function(e) {
                    console.error('Error while loading image ' + currentIndex);
                    currentIndex++;
                    processQueue();
                }

                img.src = currentElement.picture.url;
            }

            processQueue();
        };

        $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
            $scope.drawImages();
        });

        /**
        * Launches the meals loading.
        * */
        sharoodDB.getAllMealsByAssistant(sharoodDB.currentUser.uid).then(function(meals) {
            console.log(meals);
            if(meals.length == 0){
                sharoodDB.getAllMeals().then(function(meals) {

                    console.log(meals);

                    if(meals.length > 0){

                        meals.forEach(function(meal){
                            console.log(meal.toJSON());
                            $scope.AllMeals.push(meal.toJSON());
                            $scope.currentMeals.push(meal.toJSON());
                        });

                        var overlay = document.querySelector('.overlay');
                        overlay.classList.add('closed');

                        $scope.loadFirstElements();

                    } else {

                        var overlay = document.querySelector('.overlay');
                        overlay.classList.add('closed');
                        document.getElementById('emptyInfo').classList.remove('hidden');

                    }

                });
            } else {
                MealService.setCurrentMeal(meals[0].toJSON());
                navigation.navigate('/selectedMealInfo');
            }
        });

        /**
        * Loads more meals when it's needed. The load is done when the user does scroll to the bottom.
        * */
        $scope.loadMoreMeals = function() {
            console.log('load!');
            if (!$scope.mealsToRender.length) {
                return;
            }

            var lastIndex = $scope.mealsToRender.length - 1;
            var newIndex = lastIndex + chunk;

            if (lastIndex === $scope.currentMeals.length) {
                return;
            } else if (newIndex > $scope.currentMeals.length) {
                newIndex = $scope.currentMeals.length;
            }

            for (var i = lastIndex; i < newIndex; i++) {
                console.log($scope.currentMeals[i]);
                $scope.mealsToRender.push($scope.currentMeals[i]);
            }

            console.log($scope.mealsToRender);
        };

        /**
        * Handler: go to one meal.
        * */ 
        $scope.goToMeal = function(mealIndex){
            MealService.setCurrentMeal($scope.mealsToRender[mealIndex]);
            navigation.navigate('/viewMeal/showSave');
        };

        /**
        * Handler: user click on the meals type selector (this functionality should be tested)
        * */        
        $scope.toggleCurrentMeals = function(listId) {
            if (toggleMeals[listId]) {
                var mealsOptions = toggleMeals[listId];
                if (mealsOptions.load) {
                    $scope.currentMeals = $scope[mealsOptions.elements];
                    $scope.loadFirstElements();
                    return;
                }

                // Load when needed
                sharoodDB[mealsOptions.method](sharoodDB.currentUser.uid).then(function(meals) {
                    console.log('new meals loaded', meals);
                    mealsOptions.load = true;
                    $scope.currentMeals = $scope[mealsOptions.elements] = [];
                    meals.forEach(function(meal){
                        $scope.AllMeals.push(meal.toJSON());
                        $scope.currentMeals.push(meal.toJSON());
                        $scope[mealsOptions.elements].push(meal.toJSON());
                    });
                    $scope.loadFirstElements();
                });
            }
        }

        $scope.$on('$viewContentLoaded', function() {
            var btns = document.querySelectorAll('.toggle-meals button');
            Array.prototype.forEach.call(btns, function(btn) {
                btn.addEventListener('click', function fn(evt) {
                    evt.preventDefault();
                    var currentActive = document.querySelector('.toggle-meals button.active');
                    currentActive.classList.remove('active');
                    btn.classList.add('active');

                    var list = btn.dataset.list;
                    console.log(list);
                    $scope.toggleCurrentMeals(list);
                });
            });
        });

    });

});