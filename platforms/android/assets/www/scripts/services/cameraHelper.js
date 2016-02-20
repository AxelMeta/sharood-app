/**
* Helper object which contains a set of functions to perform operation with images taken by the system camera
* */
define(['services/module'], function (services) {
  'use strict';
  services.factory('cameraHelper', function ($q) {

      if(typeof Camera === 'undefined') {
        return null;
      }

      var contstants = {
          DATA_URL: 'DestinationType',
          FILE_URI: 'DestinationType',
          NATIVE_URI: 'DestinationType',
          PHOTOLIBRARY: 'PictureSourceType',
          CAMERA: 'PictureSourceType',
          SAVEDPHOTOALBUM: 'PictureSourceType',
          JPEG: 'EncodingType',
          PNG: 'EncodingType',
          PICTURE: 'MediaType',
          VIDEO: 'MediaType',
          ALLMEDIA: 'MediaType',
          BACK: 'Direction',
          FRONT: 'Direction'
      };

      var defaultOptions = {
          quality : 80,
          destinationType : Camera.DestinationType.DATA_URL,
          sourceType : Camera.PictureSourceType.CAMERA,
          encodingType: Camera.EncodingType.JPEG,
          targetWidth: 500,
          targetHeight: 500,
          saveToPhotoAlbum: true
      };

      var CameraHelper = {
          /**
          * Pick a picture with the camera app of the system
          * @param options a set of options could be define, see defaultOptions for further information
          * @return promise. The promise returned will be resolved with the taken image
          * */
          getPicture: function(options) {
              var deferred = $q.defer();
              options = options || defaultOptions;
              console.log(options);

              var onSuccess = function(img) {
                  deferred.resolve(img);
              };

              var onError = function(error) {
                  deferred.reject(error);
              };

              navigator.camera.getPicture(onSuccess, onError, options);

              return deferred.promise;
          },

          /**
           * Build a specific object to be handled in the server side (build.io)
           * @param base64 an image converted into base64 string format
           * @return custom object to be use in build.io
           * */
          buildServerImg: function(base64) {
              var name = Math.floor((Math.random() * 100000000) + 1);
              console.log(base64);
              return {
                  base64: base64,
                  name: name + '.jpeg',
                  contentType: 'image/jpeg'
              };
          }
      };

      for (var key in contstants) {
          Object.defineProperty(CameraHelper, key, {
              get: function() {
                  return Camera[constants[key]][key];
              }
          });
      }

      // Public API here
      return CameraHelper;
  });
});