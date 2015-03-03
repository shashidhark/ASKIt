var { ToggleButton } 	= require('sdk/ui/button/toggle');
var buttons 			= require('sdk/ui/button/action');
var data 				= require("sdk/self").data;
var panels 				= require("sdk/panel");
var pageMod 			= require('sdk/page-mod');
var pageWorker 			= require("sdk/page-worker");
var ss 					= require("sdk/simple-storage");
var tabs 				= require('sdk/tabs');

//Switch On/Off ASKIt
var askItIsOn = false;
var selectors = [];

//Open Home Page on First Run..
if (typeof ss.storage.firstRun === "undefined") {
    ss.storage.firstRun = false;
    console.log('First run');
    //tabs.open("http://theaskdev.com"); 
    tabs.open("http://localhost/askdev.com"); 
}

//var button = ToggleButton({
var button = buttons.ActionButton({
  id: "ASKIt-button",
  label: "ASKIt",
  icon: {
    "16": data.url("icon/red16.png"),
    "32": data.url("icon/red32.png"),
    "64": data.url("icon/red64.png")
  },
  onClick: function(state) {
    console.log("Button clicked:"+askItIsOn);
	askItIsOn=!askItIsOn;
	if(askItIsOn)
		this.icon=data.url("icon/green16.png");
	else
		this.icon=data.url("icon/red16.png");
  }
});

//Select word
 var selector = pageMod.PageMod({
    include: ['*'],
    contentScriptWhen: 'ready',
    contentScriptFile: [data.url('jquery-1.11.1.js'),
                        data.url('process/getWord.js')], //File where code is writen for -
    onAttach: function(worker) {						 //-detecting Mouse event and select word
      worker.postMessage(askItIsOn);
      worker.port.on('show', function(texts) { //'texts' is the word whose meaning to be searched.
		console.log(texts);
		//result.show();
	 	
		if(askItIsOn){ //Send request only if ASKIt enabled
		
			console.log("Request sent for text: "+texts[0]);
			
			var panel = require("sdk/panel").Panel({
			  width		: 200,
			  height	: 200,
			  contentURL: data.url("display/panel.html"),
			  contentScriptFile: [data.url("display/panel.js"),data.url('jquery-1.11.1.js')],  
			});		
			
			panel.show(); //Display Loading Image
			
			require('sdk/request').Request({
                url: 'http://wordnetweb.princeton.edu/perl/webwn?s='+texts[0],
                onComplete: function(response) {
                    if(response.status==0||response.status==504)
                    	panel.postMessage(0);
                    else if(response.status==200)
                    	panel.postMessage(response.text); //Call the panel to display meaning
                }
            }).get(); //Send request to page
		}//if(askItIsOn) closed
      });
    }
});

