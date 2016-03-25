/**
 * Helper class to handle every interaction between the client side and the server side, in our case
 * build.io service
 */
define(['services/module'], function (services) {
  'use strict';
  services.factory('sharoodDB', function ($q, $cordovaDevice, logService) {
    var apiKey = 'blt14f0a2b98d6156f4';
		var mealNotification;
		var updaterMealLoaded=false;
		
    // Public API here
    return { // interval in milliseconds. 15 = 15 seconds
      interval_notification : 180,
      currentUser: null,
      updaterLoaded: false,

      test: function(){
        logService.debug('test');
        var deferred = $q.defer();

        deferred.resolve("test OK!!!");
        return deferred.promise;
      },

      
      /**
       * Populates the current user that is login into the app
       * @returns a promise that will be resolved once the current user was loaded.
       */
      loadCurrentUser: function(){
        logService.debug('loadCurrentUser');
        var deferred = $q.defer();
        var user = Built.App(apiKey).User;
        user.getCurrentUser()
          .then(function(user){
            deferred.resolve(user.toJSON());
          }, function(error) {
            logService.error("loadCurrentUser",error);
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
        logService.debug('sharoodDB.login');
        var deferred = $q.defer();
        var user = Built.App(apiKey).User();
        var self = this;
        user.login(data.email, data.password)
          .then(function(user) {
        	logService.debug('user['+JSON.stringify(user)+']');  
            deferred.resolve(user.toJSON());
          }, function(error) {
            logService.error("sharoodDB.login", error);
            deferred.reject(error);
          });

        return deferred.promise;
      },
      
      /**
       * Performs the logout action
       * @returns a promise that will be resolved once the user has been logout of the system
       */
      logout: function() {
        logService.debug('sharoodDB.logout');
        var deferred = $q.defer();
        var user = Built.App(apiKey).User();
        user.logout()
          .then(function() {
            deferred.resolve();
          }, function(error) {
            logService.error("sharoodDB.logout", error);
            deferred.resolve();
          });

        return deferred.promise;
      },
      
      /**
       * Performs the append user installation operation
       * @param subscribe - true=subscribe to channel; false=unsubscribe to channel
       * @param channel   - label channel to subscribe - ex. Meal.object.create
       * @param userId
       * @returns a promise that will be resolved or rejected once the register action has been successfully or not
       */
      subscribeChannel: function(channelId, userId) {
        logService.debug('Installation begin -----------------------------------');
        var deferred = $q.defer();
        //var channelId = user.toJSON().university;
        channelId = 'meal_uid.object.create';
        var deviceType = $cordovaDevice.getPlatform().toLowerCase();
        var deviceToken = localStorage.getItem("PUSH_REGISTRATION_ID");
        //var deviceToken = $cordovaDevice.getUUID();
        logService.debug('userId['+userId+'] deviceType['+deviceType+'] channelId['+channelId+'] deviceToken['+deviceToken+']');

        var installation = Built.App(apiKey).Installation();
        installation = installation.assign({
            user_id: userId,
            device_type: deviceType,
            device_token: deviceToken,
            subscribed_to_channels: [channelId],
            credentails_name: 'default'
        });
        logService.debug("installation["+JSON.stringify(installation)+"]");
        
//        installation.assign({user_id: user.toJSON().uid});
    	  console.log('Installation setters ok!!');
        installation.save().then(function(inst) {
        	logService.debug('Installation end success !!-----------------------------------');
        	deferred.resolve(inst.toJSON());
        }, function(error) {
          logService.error("Installation", error);
          deferred.reject(error);
        });
        return deferred.promise;
      },
      
      
      /**
       * Performs the register operation
       * @param data an object that contains all the info need to register a new user
       * @returns a promise that will be resolved or rejected once the register action has been successfully or not
       */
      register: function(data) {
        logService.debug('register begin -----------------------------------');
        var deferred = $q.defer();
        var user = Built.App(apiKey).User();
        user = user.assign({
	            cookies: 4,
	            food_level_rating: 0,
	            food_level_rating_nofvotes: 0,
	            friendliness_chef_rating: 0,
	            friendliness_chef_rating_nofvotes: 0,
	            fun_rating: 0,
	            fun_rating_nofvotes: 0,
	            university: data.university,
	            first_name: data.name,
	            username: data.name,
	            room_number: data.room,
	            phone: data.phone,
	            device_type: data.device_type,
	            picture: data.picture
	        });
        user.register(data.email, data.password, data.passwordConfirm)
          .then(function(user) {
            logService.debug('register success -----------------------------------');
            deferred.resolve(user.toJSON());
          }, function(error) {
            logService.error("register", error);
            deferred.reject(error);
          });

        return deferred.promise;
      },

      /**
       * Update user profile with new data
       * @param data user data which we want to save
       * @returns a promise that will be resolved once the user is updated
       */
      updateProfile: function(data) {
        logService.debug('sharoodDB.updateProfile begin -----------------------------------');
        logService.debug('currentUser.id='+this.currentUser.uid);
        var deferred = $q.defer();
        var User = Built.App(apiKey).Class('built_io_application_user').Object;
        var user = User(this.currentUser.uid);
        user = user.assign(data);
        user.save()
          .then(function(user) {
        	logService.debug('sharoodDB.updateProfile save -----------------------------------');
        	deferred.resolve(user.toJSON());
          }, function(error) {
        	logService.error("sharoodDB.updateProfile", error);
            deferred.resolve(error);
          });
          
        return deferred.promise;
      },

      /**
       * Update user profile with new data
       * @param data user data which we want to save
       * @returns a promise that will be resolved once the user is updated
       */
      updateProfile2: function(data) {
        logService.debug('sharoodDB.updateProfile2 begin -----------------------------------');
        logService.debug('currentUser.id='+this.currentUser.uid);
        var deferred = $q.defer();
        
        var User = Built.App(apiKey).Class('built_io_application_user').Object;
        var user = User(this.currentUser.uid);
        user = user.assign({
          first_name: String(data.first_name),
          phone: String(data.phone),
					room_number: String(data.room_number)
        });
        user.save()
          .then(function(user) {
          logService.debug('sharoodDB.updateProfile2 saved -----------------------------------');
          deferred.resolve(user.toJSON());
          }, function(error) {
          logService.error("sharoodDB.updateProfile2", error);
            deferred.resolve(error);
          });
          
        return deferred.promise;
      },
      /**
       * Update user profile with new data
       * @param data user data which we want to save
       * @returns a promise that will be resolved once the user is updated
       */
      updateProfileInstallID: function(data) {
        logService.debug('sharoodDB.updateProfileInstallID begin -----------------------------------');
        logService.debug('currentUser.id='+this.currentUser.uid);
        var deferred = $q.defer();
        
        var User = Built.App(apiKey).Class('built_io_application_user').Object;
        var user = User(this.currentUser.uid);
        user = user.assign({ installation_data_id: String(data.installation_data_id)  });
        user.save()
          .then(function(user) {
          logService.debug('sharoodDB.updateProfileInstallID saved -----------------------------------');
          deferred.resolve(user.toJSON());
          }, function(error) {
          logService.error("sharoodDB.updateProfileInstallID", error);
            deferred.resolve(error);
          });
          
        return deferred.promise;
      },
      /**
       * Update user profile with new data
       * @param data user data which we want to save
       * @returns a promise that will be resolved once the user is updated
       */
      updateProfilePicture: function(data) {
        logService.debug('sharoodDB.updateProfilePicture begin -----------------------------------');
        logService.debug('currentUser.id='+this.currentUser.uid);
        var deferred = $q.defer();
        
        var User = Built.App(apiKey).Class('built_io_application_user').Object;
        var user = User(this.currentUser.uid);
        user = user.assign({ picture: data.picture });
        user.save()
          .then(function(user) {
          logService.debug('sharoodDB.updateProfilePicture saved -----------------------------------');
          deferred.resolve(user.toJSON());
          }, function(error) {
          logService.error("sharoodDB.updateProfilePicture", error);
            deferred.resolve(error);
          });
          
        return deferred.promise;
      },
      /**
       * Update user profile with new data
       * @param data user data which we want to save
       * @returns a promise that will be resolved once the user is updated
       */
      updateProfilePhoto: function(data) {
        logService.debug('sharoodDB.updateProfilePhoto begin -----------------------------------');
        logService.debug('currentUser.id='+this.currentUser.uid);
        var deferred = $q.defer();
        
        var User = Built.App(apiKey).Class('built_io_application_user').Object;
        var user = User(this.currentUser.uid);
        user = user.assign({
          picture: data.picture
        });
        user.save()
          .then(function(user) {
          logService.debug('sharoodDB.updateProfilePhoto save -----------------------------------');
          deferred.resolve(user.toJSON());
          }, function(error) {
          logService.error("sharoodDB.updateProfilePhoto", error);
            deferred.resolve(error);
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
        	logService.error("getUniversityByUid", error);
        });

        return deferred.promise;
      },

      /**
       * Save a new meal into the database
       * @param mealData an object with all the info need to create a new meal
       * @returns a promise that will be resolved or rejected once the action has been accomplished
       */
      saveMeal: function(mealData) {
        logService.debug('saveMeal');
        var deferred = $q.defer();
        var Meal = Built.App(apiKey).Class('meal').Object;
        var meal = Meal();

        meal = meal.assign(mealData);

        meal.save()
          .then(function(result) {
            deferred.resolve(result.toJSON());
          }, function(error) {
            logService.error("saveMeal", error);
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
        logService.debug('getAllMeals');
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
        //query = query.lessThanOrEqualTo('time', new Date()); //Only meals with a time bigger than now.

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
        	logService.error("getAllMeals", error);
            deferred.reject(error);
          });

        return deferred.promise;
      },

      /**
       * Return the meal object
       * @param mealId specifies the meal id
       * @returns a promise that will be resolved once the requested meal has been loaded
       */
      getMealById: function (mealId){
        var deferred = $q.defer();

        var query = Built.App(apiKey).Class('meal').Object(mealId);
 
        query
        .fetch()
        .then(function(project) {
            deferred.resolve(project.toJSON());
        }, function(error) {
        	logService.error("getMealById", error);
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

        logService.debug(query);
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
              logService.error("getMealWithAttendantsById", error);
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
        logService.debug('uploadFile');
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
       * Get the user's data that matches with an id
       * @param userid id of an user
       * @returns a promise that will be resolved once the user is obtained
       */
      getUserById: function(userId) {
        logService.debug('getUserId');
        var deferred = $q.defer();
        var user = Built.App(apiKey).Class('built_io_application_user').Object(userId);
        user.fetch()
          .then(function(user) {
            deferred.resolve(user.toJSON());
          }, function(error) {
        	logService.error("getUserById", error);
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
        logService.debug('getAllMealsByOwner');
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
        	logService.error("getAllMealsByOwner", error);
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
        logService.debug('getAllMealsByAssistant');
        var deferred = $q.defer();

        var query = Built.App(apiKey).Class('meal').Query();

        //console.log(query);
        //console.log(this.currentUser);

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
        	logService.error("getAllMealsByAssistant", error);
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
        logService.debug('addVotesToUser');
        var deferred = $q.defer();
        //console.log(userId, friendliness, foodLevel, fun);
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
        logService.debug('getAllPlaces');
        var deferred = $q.defer();
        var query = Built.App(apiKey).Class('university').Query();

        query = query.ascending('name');

        query.exec()
          .then(function(places) {
            deferred.resolve(places);
          }, function(error) {
       	    logService.error("getAllPlaces", error);
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
        logService.debug('transferCookies');

        var promises = [];

        var p1 = this.decrementCookies(from, number);
        var p2 = this.incrementCookies(to, number);

        promises.push(p1);
        promises.push(p2);

        return $q.all(promises);
      },

      incrementCookies: function(userId, number) {
        logService.debug('incrementCookies');
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
        logService.debug('decrementCookies');
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

      getPastMeals: function(start, finish) {
        logService.debug('getPastMeals');
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

        var currentDate = new Date();
        var pastDate =  new Date();
        pastDate.setDate(currentDate.getDate() - 1);
        query = query.lessThanOrEqualTo('time',  new Date());
        query = query.limit(10);
        
        query = query.and([q1, q2, q3, q4, q5, q6, q7]);

        query.include(['owner',
                       'assistants.assistant1',
                       'assistants.assistant2',
                       'assistants.assistant3',
                       'assistants.assistant4',
                       'assistants.assistant5'])
          .descending('time')
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

      getTotalMeals: function() {
        logService.debug('sharoodDB.getTotalMeals');
        var deferred = $q.defer();
        var query = Built.App(apiKey).Class('meal').Query();

        var q1 = query.notEqualTo('assistants.assistant1', this.currentUser.uid);
        var q2 = query.notEqualTo('assistants.assistant2', this.currentUser.uid);
        var q3 = query.notEqualTo('assistants.assistant3', this.currentUser.uid);
        var q4 = query.notEqualTo('assistants.assistant4', this.currentUser.uid);
        var q5 = query.notEqualTo('assistants.assistant5', this.currentUser.uid);

        var q6= query.notEqualTo('owner', this.currentUser.uid);
        var q7 = query.where('university', this.currentUser.university[0]);
        query = query.greaterThanOrEqualTo('time',  new Date());
        
        query = query.and([q1, q2, q3, q4, q5, q6, q7]);

        query.count()
          .exec()
          .then(function(count) {
            logService.debug('sharoodDB.getTotalMeals='+JSON.stringify(count));
            deferred.resolve(count);
          }, function(error) {
            logService.error("sharoodDB.getTotalMeals", error);
            deferred.reject(error);
          });

        return deferred.promise;
      },

      getNewMeals: function(limit) {
        logService.debug('sharoodDB.getNewMeals');
        var deferred = $q.defer();
        var query = Built.App(apiKey).Class('meal').Query();

        var q1 = query.notEqualTo('assistants.assistant1', this.currentUser.uid);
        var q2 = query.notEqualTo('assistants.assistant2', this.currentUser.uid);
        var q3 = query.notEqualTo('assistants.assistant3', this.currentUser.uid);
        var q4 = query.notEqualTo('assistants.assistant4', this.currentUser.uid);
        var q5 = query.notEqualTo('assistants.assistant5', this.currentUser.uid);

        var q6= query.notEqualTo('owner', this.currentUser.uid);
        var q7 = query.where('university', this.currentUser.university[0]);
        query = query.greaterThanOrEqualTo('time',  new Date());
        
        query = query.and([q1, q2, q3, q4, q5, q6, q7]);

        query.include(['owner',
                       'assistants.assistant1',
                       'assistants.assistant2',
                       'assistants.assistant3',
                       'assistants.assistant4',
                       'assistants.assistant5'])
                       
          .descending('time')
          .limit(limit)
          .exec()
          .then(function(meals) {
            logService.debug('sharoodDB.getNewMeals total #'+meals.length);
            deferred.resolve(meals);
          }, function(error) {
            logService.error("sharoodDB.getNewMeals", error);
            deferred.reject(error);
          });

        return deferred.promise;
      },

      sendNotifications: function(limit){
        var self = this;
        self.getNewMeals(limit).then(function(meals){
          //logService.debug(JSON.stringify(meals));
          if(meals.length > 0){
            //logService.debug('Total meal array#'+meals.length);
            meals.forEach(function(meal){
//               logService.debug(meal.toJSON());
               var new_meal= meal.toJSON();
               var owner=new_meal.owner[0];
               var dtMeal= new Date(new_meal.time);
							 
							 var mealTimeStr = dtMeal.toTimeString().replace(/.*(\d{2}:\d{2})(:\d{2}).*/, "$1"); 
							 //dtMeal.getHours() + ':' + dtMeal.getMinutes() 
							 var dtNow = new Date();
               //var month=dtMeal.getMonth()+1;
               //var title=owner.first_name+' invited you at '+dtMeal.getHours() + ':'+dtMeal.getMinutes();
               //var msg= dtMeal.getDate() + '/' +month+'. Save a seat now!';
							 var WHEN="today";
							 if(dtNow.getDate()!=dtMeal.getDate()){
								 WHEN="tomorrow";
							 }
							 var title = "Sharood";
							 var msg = "You are invited for a meal "+WHEN+" at " + mealTimeStr + 'h. Save a seat now!';
               logService.debug('Title['+title+']');
               logService.debug('Msg['+msg+']');
							 
							 cordova.plugins.notification.local.schedule(
							 															{ id: dtNow.getTime(), 
																							title: title, 
																							text: msg
																							});							 
               
            });
          }
        });
        
      },
			
      stopIntervalMealNotification: function(){
				logService.debug("sharoodDB.stopIntervalMealNotification begin");
				clearInterval(mealNotification);
				logService.debug("stopIntervalMealNotification end");
		
			},
			
      updateMealNotification: function(){
        var self = this;

        if(this.updaterMealLoaded){
					self.stopIntervalMealNotification();
					
				}
				self.updaterMealLoaded=true;
				logService.debug("sharoodDB.updateMealNotification Interval activated!!");
        mealNotification = setInterval(function(){
          if(self.currentUser != null){
            self.getTotalMeals().then(function(totalMeal){
              var totalMealDB = parseInt(JSON.stringify(totalMeal));
              var totalMealStored = localStorage.getItem("TOTAL_MEAL_STORED");

              logService.debug('totalMealDB='+totalMealDB);
              logService.debug('totalMealStored='+totalMealStored);

              if(totalMealStored != null && totalMealStored != ""){
                totalMealStored = parseInt(totalMealStored);
                if(totalMealDB > totalMealStored){
                  localStorage.setItem("TOTAL_MEAL_STORED", JSON.stringify(totalMeal));                  
                  self.sendNotifications(totalMealDB - totalMealStored);            
                }else{
                  logService.debug('totalMealDB no es mayor');
                }
              }else{
                self.sendNotifications(totalMealDB);
                localStorage.setItem("TOTAL_MEAL_STORED", JSON.stringify(totalMeal));
              }
              
            });
          }
        }, this.interval_notification*1000);
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
              logService.debug(user);
              self.currentUser = user;
            });
          }
        }, 10000);

        
      }

    };

  });
});