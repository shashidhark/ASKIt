
/*
|===============================================================================
|		Last Modified Date 	: 18/03/2015
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
var selectedText = '';

var searchLink		= ['http://www.google.co.in/search?q=define+', 'http://wordnetweb.princeton.edu/perl/webwn?s='];
//Switch On/Off ASKIt
var askItIsOn = true;
var selectors = [];

//Open Home Page on First Run..
if (typeof ss.storage.firstRun === "undefined") {
    ss.storage.firstRun = false;
    //console.log('First run');
   	tabs.open("http://www.theaskdev.com/version.php?app=jdFDGDffggdD4343uyfhfjgkopdfsdbbtbtiuudvbmopmldr&frun=1"); 
   // tabs.open("http://localhost/askdev.com"); 
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
	contentScriptFile	: [data.url("jquery-1.11.1.js"), data.url("panel.js")]
});

function handleChange() {
	//panel.port.emit("tellResize");
    panel.show({position:button});
    panel.port.emit("panelLoad");
}

panel.port.on('findDefn', function(defineWord){
	var askitReqUrl = searchLink[ss.storage.prefs_data.searchLink]+defineWord;
	request({
		url: askitReqUrl,
        onComplete: function(response) {
               		//console.log(response.status);
	        if(response.status==0 || response.status==504 || response.status==408){
                     		//console.log(response.status);
    	        panel.port.emit("error", "");
            }
			else{	
	           	panel.port.emit("takeDefn", [response.text, ss.storage.prefs_data.searchLink, searchLink[ss.storage.prefs_data.searchLink]]);
		    }
        }
    }).get();                     	
});

panel.port.on('save', function(prefs_data) {        
	ss.storage.prefs_data = prefs_data;            
	readPrefs();
    //console.log("Pref Link:"+searchLink[ss.storage.prefs_data.searchLink]);
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
		prefs_data.use_window_above 	= true;
		prefs_data.use_window_below 	= false;
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
var dic_bubble = require("sdk/page-mod").PageMod({
  include: ['*'],
  contentScriptWhen: 'ready',  
  contentStyleFile: data.url("askit_search.css"),
  contentScriptFile: [data.url("jquery-1.11.1.js"),data.url("jquery-1.6.min.js"),data.url('askit_search.js')],
  attachTo: ["existing", "top"],
  onAttach: function(worker) {
  
 //Change icon on Enable.Disable--------------------------
  	panel.port.on("offIt", function(){
  		ss.storage.prefs_data.off=true;
  		worker.port.emit("offIt");
  		//console.log("off");
  		button.icon=data.url("icon/red16.png");
  	});
  	
  	panel.port.on("onIt", function(){
  		ss.storage.prefs_data.off=false;
  		worker.port.emit("onIt");
  		//console.log("on");
  		button.icon=data.url("icon/green16.png");
  	});
  	
  	panel.port.on("getSelectionFromTab", function(){
  		worker.port.emit("getSelectionFromPage");
  		worker.port.on("takeSelectionFromPage", function(d){
  			panel.port.emit("takeSelectionFromTab", d);
  		});
  	});
 //--------------------------------------------------------
 
 //Get Preferences 	
  	worker.port.on("getStat", function(){
  		worker.port.emit("takeStat", ss.storage.prefs_data.off);	
  	});
  	worker.port.emit("getImages", loading, speaker, dic_close_btn, dic_more, dic_logo, dic_logo_icon);  
  	
 //Call error message diaplaying code----------------------------
  	worker.port.on("onNull", function(){
  		//console.log("Error");
  		worker.port.emit("nullError");
  		
  	});
 //------------------------------------------------------------
  	
  	worker.port.on("pageInfo",function(selText){
       	selectedText = selText;
  //      console.log(selectedText);
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
                         
    worker.port.on("completeBubble",  function(defineWord){
    	if(defineWord.match(/^[\w]+$/) == null){
    		worker.port.emit("completeRes", [null, ss.storage.prefs_data.searchLink, searchLink[ss.storage.prefs_data.searchLink]]);
    	}
    	else if(defineWord=='0' || defineWord==''){
    		worker.port.emit("onNull");
    	}
       	else{
    	var askitReqUrl = searchLink[ss.storage.prefs_data.searchLink]+defineWord;
                           // console.log(askitReqUrl);
        request({
                                 url: askitReqUrl,
                                 onComplete: function(response) {
                                 		//console.log(response.status);
                                        if(response.status==0 || response.status==504 || response.status==408){
                                        		//console.log(response.status);
                                                worker.port.emit("error", "");
                                        }
										else{	
		                                	worker.port.emit("completeRes", 
		                                		[response.text, ss.storage.prefs_data.searchLink, 
		                                		searchLink[ss.storage.prefs_data.searchLink]]);
		                                }
                                    }
                         }).get();
                         
                         }
             });
          workers.push(worker);
     }
});
