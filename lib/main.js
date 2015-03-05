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

//Switch On/Off ASKIt
var askItIsOn = true;
var selectors = [];

//Open Home Page on First Run..
if (typeof ss.storage.firstRun === "undefined") {
    ss.storage.firstRun = false;
    console.log('First run');
    //tabs.open("http://theaskdev.com"); 
    tabs.open("http://www.theaskdev.com"); 
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
    console.log("Button clicked:"+askItIsOn);
	askItIsOn=!askItIsOn;
	if(askItIsOn)
		this.icon=data.url("icon/green16.png");
	else
		this.icon=data.url("icon/red16.png");
  }
});

var speaker 		= "";                                                      
var loading 		= data.url(	"icon/loader.gif"		);    
var dic_close_btn 	= data.url(	"icon/close.png"		);                                     
var dic_more 		= data.url(	"icon/more.png"			);
var dic_logo 		= data.url(	"icon/green16.png"		);
var dic_logo_icon 	= data.url(	"icon/green16.png"		);
var position_img 	= data.url(	"icon/bubble_above.png"	);

function initPrefs() { 
	if (!ss.storage.prefs_data) {
	    let prefs_data = new Object;
	
		prefs_data.use_popupdbclick 	= true;
		prefs_data.triggerKeyDblClk 	='none';
		prefs_data.use_popupselect		= false;
		prefs_data.triggerKeyHighlight 	='none';        
		prefs_data.defintion_selector 	= '1';
		prefs_data.checkbox2 			= true;
		prefs_data.use_window_above 	= false;
		prefs_data.use_window_below 	= true;
		prefs_data.fonttype_selector 	= 'Helvetica';
		prefs_data.fontsize_selector 	= '10pt';
		
		ss.storage.prefs_data = prefs_data;      
   	}
}

initPrefs();

function readPrefs() {
        let prefs_data = ss.storage.prefs_data;  
    }
    
//Page-Mode for Bubble Window    
var workers = [];
var selectedText = '';
var dic_bubble = require("sdk/page-mod").PageMod({
  include: ['*'],
  contentScriptWhen: 'ready',  
  contentStyleFile: data.url("askit_search.css"),
  contentScriptFile: [data.url("jquery-1.6.min.js"),data.url('askit_search.js')],
  attachTo: ["existing", "top"],
  onAttach: function(worker) {
  	worker.port.emit("getImages", loading, speaker, dic_close_btn, dic_more, dic_logo, dic_logo_icon);  
  	worker.port.on("pageInfo",function(selText){
        selectedText = selText;
        console.log(selectedText);
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
            					bubbleColor : '#ffffff'}
        }        			
            
        ss.storage.dic_prefs = JSON.stringify(dic_prefs);
        worker.port.emit("update",ss.storage.dic_prefs);           
	});    
            
	worker.port.on("synonymsBubble",  function(defineWord){
             
    	var dicRestAPISynonymsURL = "http://wordnetweb.princeton.edu/perl/webwn?s="+defineWord;
                                                                                
        request({
        	url: decodeURIComponent(dicRestAPISynonymsURL),
            onComplete: function(response) {
            	if(response.text.length != 0){
            		worker.port.emit("sendDef", response.text);
            		worker.port.on("takeDef",function(def){
            			console.log("hahhhhh:"+def);
            		});
                	//var fetchedWord = ;//JSON.parse(response.text);
                    //worker.port.emit("synonymsRes",escape(JSON.stringify(fetchedWord.synonyms)));
                    //worker.port.emit("synonymsRes",encodeURIComponent(fetchedWord.synonyms));
                }
                else{
                	worker.port.emit("error",defineWord);
                    return;
                }                
           	}
		}).get();     
	});
             
    worker.port.on("completeBubble",  function(defineWord){
    	var dicRestAPIURL = encodeURIComponent("http://wordnetweb.princeton.edu/perl/webwn?s="+defineWord);
                                          
        request({
                                 url: decodeURIComponent(dicRestAPIURL),
                                 onComplete: function(response) {
                                        if(response.text.length!=0){
                                                true;
                                            }
                                        else{
                                                worker.port.emit("error",defineWord);
                                                return;
                                            }
                                        worker.port.emit("sendDef", response.text);
										worker.port.on("takeDef",function(def){
											console.log("hahhhhh:"+def);
										
                                        var completeWord = def; 
                                        //worker.port.emit("completeRes",escape(JSON.stringify(completeWord.entries)));
                                        worker.port.emit("completeRes",completeWord);
                                        if(completeWord.length > 0){                                       
                                        }
                                        else{ 
                                            worker.port.emit("error",defineWord);
                                        }    
                                        });        
                                    }
                         }).get();
             });
            
             
              worker.port.on("itemRedirectUrl",  function(refResponse){
                    var serviceCall = "http://dictionary.reference.com/browse/" + refResponse;    
                    tabs.open(serviceCall)  ;             
             });
             
             worker.port.on("getReference",  function(refResponse){
                    var serviceCall = "http://reference.com" + refResponse;    
                    tabs.open(serviceCall)  ;             
             });
             
             worker.port.on("redirectUrl",  function(refResponse){
                    var serviceCall = "http://dictionary.reference.com" + refResponse;    
                    tabs.open(serviceCall)  ;             
             });
          workers.push(worker);
          }
});
//end bubble tag


//Select word
/*
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
              contentScriptWhen: 'ready',
			  contentURL: data.url("popup.html"),
			  contentScriptFile:[data.url("jquery-1.6.min.js"),
                      data.url("dictionary_popup.js")]
			});		
			
			panel.show(); //Display Loading Image
			
			require('sdk/request').Request({
                //url: 'http://wordnetweb.princeton.edu/perl/webwn?s='+texts[0],
                url : 'https://www.google.co.in/?gfe_rd=cr&gws_rd=ssl#q=define:temple',
                onComplete: function(response) {
                    if(response.status==0||response.status==504)
                    	panel.postMessage([0,texts]);
                    else if(response.status==200)
                    	panel.postMessage([response.text]); //Call the panel to display meaning
                }
            }).get(); //Send request 
            
           panel.port.on("show", function onMessage(cont) {
           		console.log("Return:"+cont);            	
           		
				notifications.notify({
				  title: texts[0],
				  text: cont,
				  //data: "did gyre and gimble in the wabe",
				  iconURL: data.url("icon/green32.png")//,
				  /*onClick: function (data) {
					console.log(data);
					// console.log(this.data) would produce the same result.
				  }*
				});
           });
		}//if(askItIsOn) closed
      });
    }
});*/
