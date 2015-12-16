/**
* Controller for 'my meal info' view
* */
define(['controllers/module'], function (controllers, AlertHelper) {

    'use strict';

    controllers.controller('MyMealInfo', function ($scope, sharoodDB, navigation, MealService) {

        console.log("MyMealInfo controller");

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

        $scope.attendants = toSingleArray($scope.meal.assistants);

        /**
        * Transforms a Built.io attendant array to a simple javascript array.
        * */
        function toSingleArray(multipleArray) {
            var singleArray = [];
            function addElement(element) {
                if (Array.isArray(element)) {
                    if (element[0])
                        singleArray.push(element[0]);
                } else {
                    singleArray.push(element);
                }
            }

            if (Array.isArray(multipleArray)) {
                Array.prototype.forEach.call(multipleArray, function (element) {
                    addElement(element);
                });
            } else {
                for (var key in multipleArray) {
                    addElement(multipleArray[key]);
                }
            }

            return singleArray;
        }

        /**
        * Handler: Updates attendant's list when we click on update button.
        * */
        $scope.update = function() {
            var icon = document.querySelector('#updateAttendants i');
            icon.classList.add('fa-spin');

            sharoodDB.getMealWithAttendantsById($scope.meal.uid).then(function(meal) {
                $scope.meal = meal[0].toJSON();
                MealService.setCurrentMeal = meal[0].toJSON();
                console.log(meal);
                $scope.attendants = toSingleArray($scope.meal.assistants);
                console.log($scope.attendants);
                icon.classList.remove('fa-spin');
            });
        };
    });

});