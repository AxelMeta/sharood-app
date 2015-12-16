/**
 * Service to handle the current meal
 */
define(['services/module'], function (services) {
  'use strict';
  services.factory('MealService', function () {
    
    var currentMeal = null;

      /**
       * Set up the current meal to be use in the app
       * @param data specifies the current meal
       */
    function setCurrentMeal(data){
      currentMeal = data;
    }

      /**
       * @returns the current meal
       */
    function getCurrentMeal(){
      return currentMeal;
    }

    // Public API here
    return {
        setCurrentMeal: setCurrentMeal,
        getCurrentMeal: getCurrentMeal
    };

  });
});