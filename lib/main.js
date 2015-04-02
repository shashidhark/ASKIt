
/*
|===============================================================================
|		Last Modified Date 	: 26/03/2015
|===============================================================================
|		Copyright 2014-2015 ASK-DEV.Inc. All Rights Reserved. Released under the GPL license
|		Developed by 	: Shashidhar and Alwyn Edison Mendonca
|		WebSite 		: http://www.theaskdev.com
|===============================================================================
*/

var { ToggleButton } 	= require('sdk/ui/button/toggle'	);
var buttons 			= require('sdk/ui/button/action'	);
var data 				= require("sdk/self"				).data;
var panels 				= require("sdk/panel"				);
var pageMod 			= require('sdk/page-mod'			);
var pageWorker 			= require("sdk/page-worker"			);
var ss 					= require("sdk/simple-storage"		);
var tabs 				= require('sdk/tabs'				);
var request 			= require('sdk/request'				).Request;
var notifications 		= require("sdk/notifications"		);
var ss 					= require("sdk/simple-storage"		);
var dispDone			= 0;
const {Cc, Ci} = require("chrome");
var xhr = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Ci.nsIXMLHttpRequest);
//var xhr = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Components.interfaces.nsIXMLHttpRequest);
xhr.timeout = 20000; // ms 
// online
xhr.addEventListener("load", loadHandler, false);
xhr.onreadystatechange=contChanged;
// timeout -> offline
xhr.addEventListener("timeout", timeoutHandler, false);
// error -> offline
xhr.addEventListener("error", errorHandler, false);


var selectedText = '';

var searchLink		= ['http://www.google.co.in/search?q=define+', 'http://wordnetweb.princeton.edu/perl/webwn?s='];
//Switch On/Off ASKIt
var askItIsOn = true;
var selectors = [];

//Open Home Page on First Run..
if (typeof ss.storage.firstRun === "undefined") {
    ss.storage.firstRun = false;
    //console.log('First run');
   	//tabs.open("http://www.theaskdev.com/version.php?app=jdFDGDffggdD4343uyfhfjgkopdfsdbbtbtiuudvbmopmldr&frun=1"); 
   tabs.open("http://localhost/askdev.com"); 
}

//var button = ToggleButton({
var button = buttons.ActionButton({
  id: "ASKIt-button",
  label: "ASKIt",
  icon: {
    "16": data.url("icon/green16.png"),
    "32": data.url("icon/green32.png"),
    "64": data.url("icon/green64.png")
  },
  onClick: function(state) {
  	handleChange();
   // console.log("Button clicked:"+askItIsOn);
	/*askItIsOn=!askItIsOn;
	if(askItIsOn)
		this.icon=data.url("icon/green16.png");
	else
		this.icon=data.url("icon/red16.png");*/
  }
});

var panel = panels.Panel({
	width				: 400,
	height				: 350,
	//contentStyleFile	: data.url("panel.css"),
	contentURL			: data.url("panel.html"),
	contentScriptFile	: [data.url("js/jquery-1.6.min.js"), data.url("panel.js")]
});

function handleChange() {
	//panel.port.emit("tellResize");
	xhr.abort();
    panel.port.emit("panelLoad");
    panel.show({position:button});
}
var destination="";
panel.port.on('findDefn', function(defineWord){
	destination="panel";
	dispDone=0;
	var askitReqUrl = searchLink[ss.storage.prefs_data.searchLink]+defineWord;
	xhr.abort(); 
	xhr.open("GET", askitReqUrl, true);
	xhr.send();
});

var about = panels.Panel({
  contentURL: data.url("about.html"),
  contentStyleFile	: data.url("about.css")
});

panel.port.on('aboutOpen', function(){
	about.show();
});

////////////
var speaker 		= "";                                                      
var loading 		= data.url(	"icon/loader.gif"		);    
var dic_close_btn 	= data.url(	"icon/close.png"		);                                     
var dic_more 		= data.url(	"icon/more.png"			);
var dic_logo 		= data.url(	"icon/askdev.png"		);
var dic_logo_icon 	= data.url(	"icon/askdev.png"		);
var position_img 	= data.url(	"icon/bubble_above.png"	);

function initPrefs() { 
	if (!ss.storage.prefs_data) {
	    let prefs_data = new Object;
	
		prefs_data.off					= false;
		prefs_data.use_popupdbclick 	= true;
		prefs_data.triggerKeyDblClk 	= 'none';
		prefs_data.use_popupselect		= false;
		prefs_data.triggerKeyHighlight 	= 'none';        
		prefs_data.defintion_selector 	= '1';
		prefs_data.checkbox2 			= true;
		prefs_data.use_window 			= "below";
		prefs_data.fonttype_selector 	= 'Helvetica';
		prefs_data.fontsize_selector 	= '10pt';
		prefs_data.searchLink		 	= 0;
		
		ss.storage.prefs_data = prefs_data;      
   	}
}

initPrefs();

function readPrefs() {
        let prefs_data = ss.storage.prefs_data;  
}

//console.log("Pref Link:"+searchLink[ss.storage.prefs_data.searchLink]);
//Page-Mode for Bubble Window    
var workers = [];
var worker;
var mainWorker = require("sdk/page-mod").PageMod({
  include: ['*'],
  contentScriptWhen: 'ready',  
  contentStyleFile: data.url("askit_search.css"),
  contentScriptFile: [data.url("js/jquery-1.6.min.js"),data.url('askit_search.js')],
  attachTo: ["existing", "top"],
  onAttach: function(worker1) {
  	worker=worker1;
 		
  	worker.port.on("takeSelectionFromPage", function(d){
  			console.log("Emit takeSelectionFromTab");
  			panel.port.emit("takeSelectionFromTab", d);
  	});
 
 //Get Preferences 	
  	worker.port.on("getStat", function(){
  		worker.port.emit("takeStat", ss.storage.prefs_data.off);	
  	});
  	worker.port.emit("getImages", loading, speaker, dic_close_btn, dic_more, dic_logo, dic_logo_icon);  
  	
  	worker.port.on("pageInfo",function(selText){
       	selectedText = selText;
  		//console.log(selectedText);
    });     
            
    readPrefs();
          
    worker.port.on("getLocalStorage",  function(){        
    	var useWindow = '';
        var useDblClick = '';
        var useDblClkTriggerKey  ='';
        var usePopupSelKey = '';
        var usePopupSelect = '';
                  
        if(ss.storage.localstorage_prefs != undefined){
        	ss.storage.prefs_data = ss.storage.localstorage_prefs;
        }
                                    
        if(ss.storage.prefs_data.use_window_below){
        	useWindow = 'below';
        }else{
        	useWindow = 'above';
        }
        
        useDblClick = ss.storage.prefs_data.use_popupdbclick;
        useDblClkTriggerKey = ss.storage.prefs_data.triggerKeyDblClk;
                     
        usePopupSelect = ss.storage.prefs_data.use_popupselect;
        usePopupSelKey = ss.storage.prefs_data.triggerKeyHighlight; 
          
        var dic_prefs = {
        	use_window       : useWindow,
            use_popupdbclick : {triggerKey : useDblClkTriggerKey, triggerValue : useDblClick},
            use_popupselect  : {triggerKey : usePopupSelKey, triggerValue : usePopupSelect},
            use_definition   : {num : ss.storage.prefs_data.defintion_selector, synonyms : ss.storage.prefs_data.checkbox2},
            use_color_style	 : {fontType : ss.storage.prefs_data.fonttype_selector,
            					fontSize : ss.storage.prefs_data.fontsize_selector, 
            					fontColor:'#000000', 
            					bubbleColor : '#F8ECC2'}
        }        			
            
        ss.storage.dic_prefs = JSON.stringify(dic_prefs);
        worker.port.emit("update",ss.storage.dic_prefs);           
	});    
                         
    //Emited when double click event created
    worker.port.on("completeBubble",  function(defineWord){
    	
    	xhr.abort(); 
    	if(defineWord.match(/^[\w]+$/) == null){
    		worker.port.emit("completeRes", [null, ss.storage.prefs_data.searchLink, searchLink[ss.storage.prefs_data.searchLink]]);
    	}
    	else if(defineWord=='0' || defineWord==''){
    		worker.port.emit("nullError");
    	}
       	else{
       		destination="bubble";
       		dispDone=0;
       		console.log("request");
			var askitReqUrl = searchLink[ss.storage.prefs_data.searchLink]+defineWord;
		    
		    //xhr.onreadystatechange=contChanged;
				
			xhr.open("GET", askitReqUrl, true);
							  
			xhr.send();
      	}
	});
	
	//Inform bubble to colse. Emited if panel is opened
	panel.port.on("closeBubble", function(){
		worker.port.emit("closeBubble2");
	});
	
	//Change search link......................................
	panel.port.on("set1", function(){						//
		ss.storage.prefs_data.searchLink=0;					//
	});														//
															//
	panel.port.on("set2", function(){						//
		ss.storage.prefs_data.searchLink=1;					//
	});														//
	//........................................................
	 
	//To switch on the add-on
	//Change icon on Enable.Disable--------------------------
	panel.port.on("offIt", function(){
		ss.storage.prefs_data.off=true;
		worker.port.emit("offIt");
		//console.log("off");
		button.icon=data.url("icon/red16.png");
	});
	 	
	//To switch on the add-on
	panel.port.on("onIt", function(){
		ss.storage.prefs_data.off=false;
		worker.port.emit("onIt");
		//console.log("on");
		button.icon=data.url("icon/green16.png");
	});

	//Catch event Emited from panel
	//To get selected word from page
	panel.port.on("getSelectionFromTab", function(){
	  	//console.log("catch getSelectionFromTab");
		//Emited to bubble js. To get selected word from page
	  	worker.port.emit("getSelectionFromPage");
	});

	
	//Catch event Emited from Bubble
	worker.port.on("abortReq", function(){
		console.log("Abort..");
		xhr.abort();
	});
	
	//Catch event Emited from Bubble
	//This is emited when display of meaning is done
	//If required tag is found, Then change dispDone variable
	worker.port.on("dispDone", function(){
		console.log("dispDone ..");
		dispDone=1;
	});
    //workers.push(mainWorker);
  }
});

//Catch event Emited from panel
//This is emited when display of meaning is done
//If required tag is found, Then change dispDone variable
panel.port.on("dispDone", function(){
	console.log("dispDone ..");
	dispDone=1;
});

//Catch event Emited from panel
//This event is emited if abort is needed
panel.port.on("abortReq", function(){
	xhr.abort();
});
	
//This function will be called frequently during download
function contChanged()
{
	if (this.readyState==3 && dispDone==0)
	{
		console.log("changed");
		if(destination=="bubble")
			worker.port.emit("progressContent",[xhr.response, ss.storage.prefs_data.searchLink, searchLink[ss.storage.prefs_data.searchLink]]);
		else
			panel.port.emit("takeDefn", [xhr.response, ss.storage.prefs_data.searchLink, searchLink[ss.storage.prefs_data.searchLink]]);
	}
} 

//If downloading is complete, Then check meaning found or not.
function loadHandler(){
	console.log("state 4");
		if(dispDone==0){
			if(destination=="bubble")
				mainWorker.port.emit("notFound");
			else
				panel.port.emit("notFound");
		}
}

function timeoutHandler(e) {
	//console.log("Time out ");
	if(destination=="bubble")
		mainWorker.port.emit("error", 1);
	else
		panel.port.emit("error", 1);
}

function errorHandler(e) {
	//console.log("Error");
	if(destination=="bubble")
		mainWorker.port.emit("error", 2);
	else{
		panel.port.emit("error", 2);
	}
}
