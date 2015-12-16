/**
 * Helper class to handle every interaction between the client side and the server side, in our case
 * build.io service
 */
define(['services/module'], function (services) {
  'use strict';
  services.factory('sharoodDB', function ($q) {
    var apiKey = 'blt14f0a2b98d6156f4';

    // Public API here
    return {

      currentUser: null,
      updaterLoaded: false,

      /**
       * Populates the current user that is login into the app
       * @returns a promise that will be resolved once the current user was loaded.
       */
      loadCurrentUser: function(){
        console.log('1');
        var deferred = $q.defer();
        var user = Built.App(apiKey).User;
        user.getCurrentUser()
          .then(function(user){
            deferred.resolve(user.toJSON());
          }, function(error) {
            // some error has occurred
            // refer to the 'error' object for more details
            console.log(error);
            deferred.reject(error);
          });

        return deferred.promise;
      },

      /**
       * Performs the login operation
       * @param data an object that contains the user email and his password
       * @returns a promise that will be resolved or rejected once the user has been identified or not
       */
      login: function(data) {
        console.log('2');
        var deferred = $q.defer();
        var user = Built.App(apiKey).User();
        var self = this;
        user.login(data.email, data.password)
          .then(function(user) {
            deferred.resolve(user.toJSON());
          }, function(error) {
            // some error has occurred
            // refer to the 'error' object for more details
            console.log(error);
            deferred.reject(error);
          });

        return deferred.promise;
      },

      /**
       * Returns the university of the given user id
       * @param uid specifies the user id
       * @returns a promise that will be resolved once the university has been loaded
       */
      getUniversityByUid: function(uid) {
        var deferred = $q.defer();

        var query = Built.App(apiKey).Class('university').Object(uid);
 
        query
        .fetch()
        .then(function(project) {
            deferred.resolve(project.toJSON());
        }, function(error) {
            // some error has occurred
            // refer to the 'error' object for more details
        });

        return deferred.promise;
      },

      /**
       * Performs the register operation
       * @param data an object that contains all the info need to register a new user
       * @returns a promise that will be resolved or rejected once the register action has been successfully or not
       */
      register: function(data) {
        console.log('3');
        var deferred = $q.defer();
        var user = Built.App(apiKey).User();

        user = user.assign({
            cookies: 10,
            food_level_rating: 0,
            food_level_rating_nofvotes: 0,
            friendliness_chef_rating: 0,
            friendliness_chef_rating_nofvotes: 0,
            fun_rating: 0,
            fun_rating_nofvotes: 0,
            university: data.university,
            first_name: data.name,
            username: data.name,
            room_number: data.room
        });

        user.register(data.email, data.password, data.passwordConfirm)
          .then(function(user) {
            deferred.resolve(user.toJSON());
          }, function(error) {
            // some error has occurred
            // refer to the 'error' object for more details
            deferred.reject(error);
          });

        return deferred.promise;
      },

      /**
       * Performs the logout action
       * @returns a promise that will be resolved once the user has been logout of the system
       */
      logout: function() {
        console.log('4');
        var deferred = $q.defer();
        var user = Built.App(apiKey).User();
        user.logout()
          .then(function() {
            deferred.resolve();
          }, function(error) {
            deferred.resolve();
          });

        return deferred.promise;
      },

      /**
       * Save a new meal into the database
       * @param mealData an object with all the info need to create a new meal
       * @returns a promise that will be resolved or rejected once the action has been accomplished
       */
      saveMeal: function(mealData) {
        console.log('5');
        var deferred = $q.defer();
        var Meal = Built.App(apiKey).Class('meal').Object;
        var meal = Meal();

        meal = meal.assign(mealData);

        meal.save()
          .then(function(result) {
            deferred.resolve(result.toJSON());
          }, function(error) {
            deferred.resolve(error);
          });

        return deferred.promise;
      },

      /**
       * Get all meals
       * @param start an number to specify a start point on the list of results. Can be null.
       * @param finish an number to specify a finish point on the list of results. Can be null.
       * @returns a promise with the list of all meals with these conditions:
       * 1. We aren't the meal's owner
       * 2. We aren't a meal's attendant
       * 3. The meal's university matches with ours.
       * 4. The meal's date is bigger than actual date.
       */
      getAllMeals: function(start, finish) {
        console.log('6');
        var deferred = $q.defer();
        var query = Built.App(apiKey).Class('meal').Query();

        if(typeof start !== 'undefined' && typeof finish !== 'undefined'){
          var first = start;
          var range = finish + 1 - start;
          if (first != 0) {
            query = query.skip(first);
          }
          query = query.limit(range);
        }

        var q1 = query.notEqualTo('assistants.assistant1', this.currentUser.uid);
        var q2 = query.notEqualTo('assistants.assistant2', this.currentUser.uid);
        var q3 = query.notEqualTo('assistants.assistant3', this.currentUser.uid);
        var q4 = query.notEqualTo('assistants.assistant4', this.currentUser.uid);
        var q5 = query.notEqualTo('assistants.assistant5', this.currentUser.uid);

        var q6 = query.notEqualTo('owner', this.currentUser.uid);

        var q7 = query.where('university', this.currentUser.university[0]);

        query = query.and([q1, q2, q3, q4, q5, q6, q7]);

        query = query.greaterThanOrEqualTo('time', new Date()); //Only meals with a time bigger than now.

        query.include(['owner',
                       'assistants.assistant1',
                       'assistants.assistant2',
                       'assistants.assistant3',
                       'assistants.assistant4',
                       'assistants.assistant5'])
          .ascending('time')
          .exec()
          .then(function(meals) {
            deferred.resolve(meals);
          }, function(error) {
            // some error has occurred
            // refer to the 'error' object for more details
            deferred.reject(error);
          });

        return deferred.promise;
      },

      /**
       * Return the meal object
       * @param mealId specifies the meal id
       * @returns a promise that will be resolved once the requested meal has been loaded
       */
      getmealById: function (mealId){
        var deferred = $q.defer();

        var query = Built.App(apiKey).Class('meal').Object(mealId);
 
        query
        .fetch()
        .then(function(project) {
            deferred.resolve(project.toJSON());
        }, function(error) {
            // some error has occurred
            // refer to the 'error' object for more details
        });

        return deferred.promise;
      },

      /**
       * Return the meal object with attendants array.
       * @param mealId
       * @returns a promise that will be resolved once the requested meal has been loaded
       */
      getMealWithAttendantsById: function(mealId){
        var deferred = $q.defer();

        var query = Built.App(apiKey).Class('meal').Query();

        console.log(query);
        query = query.where('uid', mealId);

        query.include(['owner',
          'assistants.assistant1',
          'assistants.assistant2',
          'assistants.assistant3',
          'assistants.assistant4',
          'assistants.assistant5'])
            .exec()
            .then(function(meal) {
              deferred.resolve(meal);
            }, function(error) {
              // some error has occurred
              // refer to the 'error' object for more details
              deferred.reject(error);
            });

        return deferred.promise;
      },

      addOwnerToMeal: function (meal){
        var deferred = $q.defer();

        this.getUserById(meal.owner[0]).then(function(result){
          meal.owner = result;
          deferred.resolve(meal);
        });

        return deferred.promise;
      },

      /**
       * Upload a photo to built.io service
       * @param fileData the base64 image's data
       * @returns a promise that will be resolved once the image is uploaded
       */
      uploadFile: function(fileData) {
        console.log('7');
        console.log(fileData);
        var deferred = $q.defer();
        var upload = Built.App(apiKey).Upload();
        upload = upload.setFile(fileData);

        upload.save()
          .then(function(result) {
            deferred.resolve(result);
          }, function(error) {
            deferred.resolve(error);
          });

        return deferred.promise;
      },

      /**
       * Update user profile with new data
       * @param data user data which we want to save
       * @returns a promise that will be resolved once the user is updated
       */
      updateProfile: function(data) {
        console.log('8');

        var deferred = $q.defer();
        var User = Built.App(apiKey).Class('built_io_application_user').Object;
        var user = User(this.currentUser.uid);

        user = user.assign(data);

        user.save()
          .then(function(user) {
            deferred.resolve(user.toJSON());
          }, function(error) {
            deferred.resolve(error);
          });

        return deferred.promise;
      },

      /**
       * Get the user's data that matches with an id
       * @param userid id of an user
       * @returns a promise that will be resolved once the user is obtained
       */
      getUserById: function(userId) {
        console.log('9');
        var deferred = $q.defer();
        var user = Built.App(apiKey).Class('built_io_application_user').Object(userId);
        user.fetch()
          .then(function(user) {
            deferred.resolve(user.toJSON());
          }, function(error) {
            deferred.resolve(error);
          });

        return deferred.promise;
      },

      /**
       * Get all meals where an user is the owner
       * @param owner user that we are searching
       * @returns a promise that will be resolved once the requested meals have been loaded
       */
      getAllMealsByOwner: function(owner) {
        console.log('10');
        var deferred = $q.defer();
        var query = Built.App(apiKey).Class('meal').Query();

        query = query.notContainedIn('votedby', this.currentUser.uid);

        query.include(['owner',
                       'assistants.assistant1',
                       'assistants.assistant2',
                       'assistants.assistant3',
                       'assistants.assistant4',
                       'assistants.assistant5'])
          .where('owner', owner).exec()
          .then(function(meals) {
            deferred.resolve(meals);
          }, function(error) {
            // some error has occurred
            // refer to the 'error' object for more details
            deferred.reject(error);
          });

        return deferred.promise;
      },

      /**
       * Get all meals where an user is the attendant
       * @param assistant user that we are searching
       * @returns a promise that will be resolved once the requested meals have been loaded
       */
      getAllMealsByAssistant: function(assistant) {
        console.log('11');
        var deferred = $q.defer();

        var query = Built.App(apiKey).Class('meal').Query();

        console.log(query);
        console.log(this.currentUser);

        query = query.notContainedIn('votedby', this.currentUser.uid);

        var q1 = query.where('assistants.assistant1', assistant);
        var q2 = query.where('assistants.assistant2', assistant);
        var q3 = query.where('assistants.assistant3', assistant);
        var q4 = query.where('assistants.assistant4', assistant);
        var q5 = query.where('assistants.assistant5', assistant);

        query = query.or([q1, q2, q3, q4, q5]);

        query.include(['owner',
                       'assistants.assistant1',
                       'assistants.assistant2',
                       'assistants.assistant3',
                       'assistants.assistant4',
                       'assistants.assistant5'])
          .exec()
          .then(function(meals) {
            deferred.resolve(meals);
          }, function(error) {
            // some error has occurred
            // refer to the 'error' object for more details
            deferred.reject(error);
          });

        return deferred.promise;
      },

      /**
       * Add votes to an user
       * @param userId id of the user
       * @param friendliness value that we want to increment
       * @param foodLevel value that we want to increment
       * @param fun value that we want to increment
       * @returns a promise that will be resolved once the votes have been added
       */
      addVotesToUser: function(userId, friendliness, foodLevel, fun) {
        console.log('12');
        var deferred = $q.defer();
        console.log(userId, friendliness, foodLevel, fun);
        var User = Built.App(apiKey).Class('built_io_application_user').Object;
        var user = User(userId);

        user = user.increment('friendliness_chef_rating', friendliness);
        user = user.increment('friendliness_chef_rating_nofvotes', 1);

        if(typeof foodLevel !== 'undefined' || typeof fun !== 'undefined'){
          user = user.increment('food_level_rating', foodLevel);
          user = user.increment('food_level_rating_nofvotes', 1);

          user = user.increment('fun_rating', fun);
          user = user.increment('fun_rating_nofvotes', 1);
        }

        user.save()
          .then(function(user) {
            deferred.resolve(user.toJSON());
          }, function(error) {
            deferred.resolve(error);
          });

        return deferred.promise;
      },    

      /**
       * Get an array with the places that the user can select on the register
       * @returns a promise that will be resolved once the database has return the data
       */
      getAllPlaces: function() {
        console.log('13');
        var deferred = $q.defer();
        var query = Built.App(apiKey).Class('university').Query();

        query = query.ascending('name');

        query.exec()
          .then(function(places) {
            deferred.resolve(places);
          }, function(error) {
            // some error has occurred
            // refer to the 'error' object for more details
            deferred.reject(error);
          });

        return deferred.promise;
      },

      /**
       * Send 'x' cookies from user1 to user2
       * @param from user who sends the cookies
       * @param to user who receives the cookies
       * @param number cookies that we want to send
       * @returns a promise that will be resolved once the cookies have been transfered
       */
      transferCookies: function(from, to, number) {
        console.log('14');

        var promises = [];

        var p1 = this.decrementCookies(from, number);
        var p2 = this.incrementCookies(to, number);

        promises.push(p1);
        promises.push(p2);

        return $q.all(promises);
      },

      incrementCookies: function(userId, number) {
        console.log('15');
        var deferred = $q.defer();
        var User = Built.App(apiKey).Class('built_io_application_user').Object;
        var user = User(userId);

        user = user.increment('cookies', number);

        user.save()
          .then(function(user) {
            deferred.resolve(user.toJSON());
          }, function(error) {
            deferred.resolve(error);
          });

        return deferred.promise;
      },

      decrementCookies: function(userId, number) {
        console.log('16');
        var deferred = $q.defer();
        var User = Built.App(apiKey).Class('built_io_application_user').Object;
        var user = User(userId);

        user = user.decrement('cookies', number);

        user.save()
          .then(function(user) {
            deferred.resolve(user.toJSON());
          }, function(error) {
            deferred.resolve(error);
          });

        return deferred.promise;
      },

      /**
       * Autoupdate the user every 10 seconds
       * @returns a promise that will be resolved once the user has been obtained
       */
      updateCurrentUser: function() {
        if(this.updaterLoaded){
          return;
        }

        var self = this;
        setInterval(function(){
          self.updaterLoaded = true;
          if(self.currentUser != null){
            self.getUserById(self.currentUser.uid).then(function(user){
              console.log(user);
              self.currentUser = user;
            });
          }
        }, 10000);
      }

    };

  });
});