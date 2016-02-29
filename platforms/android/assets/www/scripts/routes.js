define(['app'], function (app) {
    'use strict';
    return app.config(['$routeProvider', '$compileProvider',
        function ($routeProvider, $compileProvider) {
            $routeProvider
                        

	            .when('/', {
	                templateUrl: 'views/debugForm.html',
	                controller: 'debugCtrl'
	            })
                
/*            
                .when('/', {
                    templateUrl: 'views/main.html',
                    controller: 'MainCtrl'
                })
                .when('/home', {
                    templateUrl: 'views/home.html',
                    controller: 'Home'
                })
*/                
                .when('/register', {
                    templateUrl: 'views/register.html',
                    controller: 'Register'
                })
                .when('/newChefMeal', {
                    templateUrl: 'views/newChefMeal.html',
                    controller: 'NewChefMeal'
                })
                .when('/profile', {
                    templateUrl: 'views/profile.html',
                    controller: 'Profile'
                })
                .when('/meals', {
                    templateUrl: 'views/meals.html',
                    controller: 'Meals'
                })
                .when('/viewMeal/:onlyInfo', {
                    templateUrl: 'views/viewMeal.html',
                    controller: 'ViewMeal'
                })
                .when('/settings', {
                    templateUrl: 'views/settings.html',
                    controller: 'Settings'
                })
                .when('/myMealInfo', {
                    templateUrl: 'views/myMealInfo.html',
                    controller: 'MyMealInfo'
                })
                .when('/selectedMealInfo', {
                    templateUrl: 'views/selectedMealInfo.html',
                    controller: 'SelectedMealInfo'
                })
                .when('/rateChef', {
                    templateUrl: 'views/rateChef.html',
                    controller: 'RateChef'
                })
                .when('/rateAttendants', {
                    templateUrl: 'views/rateAttendants.html',
                    controller: 'RateAttendants'
                })
                .otherwise({
                    redirectTo: '/'
                });

            $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|app):/);
            $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|app):/);
    }]);
});
