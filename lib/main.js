var { ToggleButton } = require('sdk/ui/button/toggle');
var data = require("sdk/self").data;
var panels = require("sdk/panel");
var pageMod = require('sdk/page-mod');
var pageWorker = require("sdk/page-worker");
var ss = require("sdk/simple-storage");
var tabs = require('sdk/tabs');

//Switch On/Off ASKIt
var askItIsOn = false;
var selectors = [];

//Open Home Page on First Run..
if (typeof ss.storage.firstRun === "undefined") {
    ss.storage.firstRun = false;
    console.log('First run');
    tabs.open("http://theaskdev.com"); 
}

var button = ToggleButton({
  id: "ASKIt-button",
  label: "ASKIt",
  icon: {
    "16": data.url("icon/red16.png"),
    "32": data.url("icon/red32.png"),
    "64": data.url("icon/red64.png")
  },
  onChange: function(state) {
    console.log(state.label + " checked state: " + state.checked);
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
                        data.url('process/getWord.js')],
    onAttach: function(worker) {
      worker.postMessage(askItIsOn);
      worker.port.on('show', function(texts) {
		//console.log(d);
		//result.show();
	 
		if(askItIsOn){
			require('sdk/request').Request({
                url: 'http://wordnetweb.princeton.edu/perl/webwn?s='+texts,
                onComplete: function(response) {
                    //console.log(response.text);
					
					panel.postMessage(response.text);
					panel.show();
                    // maybe send data back to worker?
                    //worker.port.emit('got-other-data', response.json);
                }
            }).get();
	
			var panel = require("sdk/panel").Panel({
			  width: 180,
			  height: 180,
			  contentURL: data.url("display/panel.html"),
			  contentScriptFile: [data.url("display/panel.js"),data.url('jquery-1.11.1.js')],
			  
			});		
		}
      });
    }
});

