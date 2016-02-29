/**
 * Service to handle the console logger
 */
define(['services/module'], function (services) {
  'use strict';
  services.factory('logService', function () {
    
    var debugConsole = true;

    //------------------------------------------------------------------------------
    function error(method, e){
      	if((e!=null)&&(debugConsole)){
    	  //console.log("error="+JSON.stringify(error));
    	  console.log("["+method+"]-Error["+e.status.code+"]["+e.status.text+"]["+e.entity.error_message+"]");
      	}
    }
    //------------------------------------------------------------------------------
    function debug(status){
      	if((status!=null)&&(debugConsole)){
    	  console.log(status);
      	}
    }
    //------------------------------------------------------------------------------
    // Public API here
    return {
        error: error,
        debug: debug
    };

  });
});