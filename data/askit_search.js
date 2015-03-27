/*
|===============================================================================
|		Last Modified Date 	: 26/03/2015
|===============================================================================
|		Copyright 2014-2015 ASK-DEV.Inc. All Rights Reserved. Released under the GPL license
|		Developed by 	: Shashidhar and Alwyn Edison Mendonca
|		WebSite 		: http://www.theaskdev.com
|===============================================================================
*/

$ = jQuery.noConflict(true);

/*(function ($) {
   $(document);
}(jQuery));*/

var speaker        	= '';
var loading			= '';
var askit_logo		= '';
var askit_logo_icon	= '';
var askit_close_btn	= '';
var selection 		= '';
var synonyms		= '';
var displayWord 	= '';
var timer1 			= 0 ;
var defineWord 		= '';
var timer2 			= 0 ;
var timer3			= 0 ;
var errorTimer 		= 0;
var refresh 		= false;
var selectionText 	= '';
//var linkToSearch	= 'https://www.google.com/?hl=en#hl=en&q=';
var ourLink			= 'http://www.theaskdev.com';

self.port.on("getSelectionFromPage", function(){
	//console.log("in ask js GetSelection trimmed");
	self.port.emit("takeSelectionFromPage", trimmedSelection());
});

self.port.on("getImages", function (loading1, speaker1, askit_close_btn1, askit_more1, askit_logo1, askit_logo_icon1){ 
    loading 		=  loading1;
    speaker 		= speaker1;
    askit_close_btn = askit_close_btn1;
    //askit_more 		= askit_more1;
    askit_logo 		= askit_logo1;
    askit_logo_icon = askit_logo_icon1;
});

var bubbleDOM = null;
var defaultOptions = {};
var evt;

self.port.on("takeStat", function(x){
	//console.log('take stat');
	if(!x){
		//console.log("def");
		var target = (evt && evt.target) || (evt && evt.srcElement);        
		if(isValidSelection(target)){
			selectEventBind(evt,'dblclick');
		}
	}	
});

$(document).dblclick(function(e) {
	evt=e;
	//console.log("ready..");
	//console.log('get stat');
	self.port.emit("getStat");
});

$(document).mouseup(function(event) {			
	var target = (event && event.target) || (event && event.srcElement);
    if (!isInsideBubble(target)) {
	    selectEventBind(event, 'mouseup')
    }
});
  
$(document).click(function(event) {
	var target = (event && event.target) || (event && event.srcElement);//send selected word to main.js
    if(!isInsideBubble(target) || selection.length == 0){ 
	    $("div#askit_bubble").css('visibility', 'hidden');
	}
});
	
$(document).ready(function(){ 
	if($("div#askit_bubble").length == 0){
		var element = document.body.firstElementChild;
		bubbleDOM 	= $('<div id=askit_bubble class="selection_bubble fontSize13 noSelect" style="background-color: #F2AE02;z-index:9999; border: 2px solid #FFED7F;fetching=false"></div>');
		//Modified askit_bubble -> askit_bubble
		bubbleDOM.insertBefore(element);
	}	    
});

function selectEventBind(e,selectedEvent){
    self.port.emit("getLocalStorage");    
    
    self.port.on("update", function(prefs_data) {    
        defaultOptions = JSON.parse(prefs_data);        
    });

    
    if((defaultOptions.use_popupdbclick && defaultOptions.use_popupdbclick.triggerValue) && e.type == 'dblclick'){
        //self.port.emit("pageInfo",selection); 
        //createhtml(e,refresh);
        selection = trimmedSelection();
        //Call error displaying code----------------------------
        if(selection=='0')
        {
        	self.port.emit("onNull");  	
        }else{
        	self.port.emit("pageInfo",selection);  
        }
        //------------------------------------------------------
		createhtml(e,refresh);
	}
}

function createhtml(e,refresh){    
	if(checkDomain()){
		return;
	}else{	
		bubbleDOM = $("div#askit_bubble");
    	self.port.emit("getLocalStorage"); 
		var showDefintion = false;

    	if((defaultOptions.use_popupselect && defaultOptions.use_popupselect.triggerValue) && e.type =='mouseup'){
			showDefintion = checkTrigger(defaultOptions.use_popupselect.triggerKey, e);
		}
	
		if((defaultOptions.use_popupdbclick && defaultOptions.use_popupdbclick.triggerValue) && e.type =='dblclick'){
			showDefintion = checkTrigger(defaultOptions.use_popupdbclick.triggerKey, e);		
		}

		
        //console.log('createHtml');
		if(!showDefintion){
			//console.log('createHtm show def');
			selection = trimmedSelection();	
			if(selection=='0')
				self.port.emit("onNull");			
			return;
		}		

		selection = trimmedSelection();
		if(selection=='0')
			self.port.emit("onNull");		
		
		var pageX 	= e.pageX;
		var pageY 	= e.pageY;
		var target 	= (e && e.target) || (event && event.srcElement);     
     	
     	$("div#askit_bubble").attr('fetching', false); 
     	
        if(timer2 != 0){        
     	   clearTimeout(timer2);
        }
    
        timer2 = setInterval(function() {  
			if (selection.length > 0 ) {
				if($("div#askit_bubble").attr('fetching')){
        			return;
				}
				$("div#askit_bubble").attr('fetching', 'true');			
				var askit_arrow_css 		= "askit-arrow-" + defaultOptions.use_window;
				var askit_bubble_arrow_css 	= "askit-bubble-arrow-" + defaultOptions.use_window;	
				var wleft 					= pageX;
				var wtop 					= pageY;
				var arrowColor 				= '';
				var belowPageHeight 		= window.innerHeight + window.scrollY;
				var abovePageHeight 		= window.scrollY;  
	            var belowFlag 				= false;
	            var aboveFlag 				= false;
		        var arrowFlag 				= true;
                var belowPageHeight 		= window.innerHeight + window.scrollY;
                var abovePageHeight 		= window.scrollY;
                var screenWidth 			= document.body.offsetWidth - 405 ;
			
				if(pageY >= belowPageHeight-150 && defaultOptions.use_window == "below"){
		    		defaultOptions.use_window 	= "above";
					askit_arrow_css 			= "askit-arrow-above";
					askit_bubble_arrow_css 		= "askit-bubble-arrow-above";
		            arrowFlag 					= false;
		            aboveFlag 					= true;
				}
				else if(pageY <= abovePageHeight+150 && defaultOptions.use_window =="above"){
					defaultOptions.use_window 	= "below";
					askit_arrow_css 			= "askit-arrow-below";
					askit_bubble_arrow_css 		= "askit-bubble-arrow-below";
		            arrowFlag 					= false;
		            belowFlag 					= true; 
				}

			if(defaultOptions.use_window == "below"){				
                if (pageX > 76 && pageX < screenWidth) {
                	wleft 				= pageX - 76;
                    arrowLeftPos 		= "";
                    arrowBlueLeftPost 	= "";
                    
                } else if (pageX > screenWidth) {
                    arrowLeftPosition = pageX - screenWidth;
                    
                    if (arrowLeftPosition > 20) {
                        arrowLeftPosition = arrowLeftPosition - 20;
                    }
                    
                    arrowLeftPos 		= "left:" + arrowLeftPosition + "px";
                    arrowBlueLeftPost 	= "left:" + arrowLeftPosition + "px";
                    wleft = screenWidth;
                } else {
                	if (pageX > 30) {
                    	arrowLeftPosition = pageX - 30;
                    } else {
                        arrowLeftPosition = pageX;
                    
                        if (arrowLeftPosition == 0) {
                    		arrowLeftPosition = 10;
                        }
                    }
                    arrowLeftPos 		= "left:" + arrowLeftPosition + "px";

                    arrowBlueLeftPost 	= "left:" + arrowLeftPosition + "px";                    
                    wleft = 10;
                }
                wtop = pageY + 30;                
                arrowColor = "border-bottom:20px solid " + defaultOptions.use_color_style.bubbleColor + "; " + arrowBlueLeftPost
			}
			else if(defaultOptions.use_window == "above"){                                     
                if (pageX > 75 && pageX < screenWidth) {                
                    wleft 				= pageX - 75;                    
                    arrowLeftPos 		= "";                    
                    arrowBlueLeftPost 	= "";                    
                    
                } else if (pageX > screenWidth) {
                
                    arrowLeftPosition = pageX - screenWidth;                      
                    if (pageX > 20) {                    
                        arrowLeftPosition = arrowLeftPosition - 20;
                    }
                    
                    arrowLeftPos = "left:" + arrowLeftPosition + "px";                    
                    arrowBlueLeftPost = "left:" + arrowLeftPosition + "px";                    
                    wleft = screenWidth;                    
                } else {     
                    if (pageX > 30) {                    
                        arrowLeftPosition = pageX - 30;                       
                    } else {
                        arrowLeftPosition = pageX;                        
                        if (arrowLeftPosition == 0) {                        
                            arrowLeftPosition = 10;
                        }
                    }
     
                    arrowLeftPos 		= "left:" + arrowLeftPosition + "px";                    
                    arrowBlueLeftPost 	= "left:" + arrowLeftPosition + "px";                    
                    wleft = 10
                }
                if (pageY > 120) {                
                    wtop = pageY - 120;
                }
                arrowColor = "border-top:20px solid " + defaultOptions.use_color_style.bubbleColor + "; " + arrowBlueLeftPost            
			}			
			//console.log(arrowColor);
			var loader = ' <img src="'+loading+'" style="padding:10px 0 15px 130px;"></img>';
			if(!refresh){
				$("div#askit_bubble").css({'top': wtop+'px','left': wleft+'px',
					'backgroundColor'	:defaultOptions.use_color_style.bubbleColor,
					'color'				:defaultOptions.use_color_style.fontColor,
					'fontSize'			:defaultOptions.use_color_style.fontSize,
					'fontFamily'		:defaultOptions.use_color_style.fontType,
					'visibility'		: 'visible'});
			}
			else{
				$("div#askit_bubble").css('visibility', 'visible');
			}			

			$("div#askit_bubble").html(loader);			
			displayWord = firstUC(selection);
			var apostrophy=selection.indexOf("'");
			
			if(apostrophy !=-1){
				selection = selection.substring(0,apostrophy);
			}
			
			var synonyms = '';             
		self.port.on("error",function(data){ 
			//console.log("error no conenction");
			var nounHtml = $('<div class="selection_bubble_content">'									
									+ '<div class="selection_bubble_word" id="selection_bubble_word">'
									+ '		<div id="selection_bubble_close" style="float:right"></div>'
									+ '</div>'
									+ '<div id="askit_bubble_difinition">'
									+ '</div>' 
									+ '<div id="selection_bubble_more_action">'
									+ '		<a href="'+ourLink+'" target="_blank">'
									+ '			<img style="position: relative;bottom: 5px;" src="'+ askit_logo +'" align="right" alt="ASK-DEV"></img>'
									+ '		</a>'
									+ ' </div>'
									+ '</div>'
									+ '<div class="'+askit_arrow_css+'" style="'+ arrowBlueLeftPost +'"></div>'
									+ '<div class="'+askit_bubble_arrow_css+'" style="'+arrowColor+'"></div>');
									
			var suggestion="<div style='padding:10px;'>No internet connection.</div>";
			
			$("div#askit_bubble").html(nounHtml); 
			$('#askit_bubble_difinition').html(suggestion);
			$('#selection_bubble_close').click(function(){
				$("div#askit_bubble").css('visibility', 'hidden');
			});
		});
		
		self.port.on("nullError",function(data){ 
			//console.log("error no conenction");
			var nounHtml = $('<div class="selection_bubble_content">'									
									+ '<div class="selection_bubble_word" id="selection_bubble_word">'
									+ '		<p id="selection_bubble_close" style="float:right"></p>'
									+ '</div>'
									+ '<div id="askit_bubble_difinition">'
									+ '</div>' 
									+ '<div id="selection_bubble_more_action">'
									+ '		<a href="'+ourLink+'" target="_blank">'
									+ '			<img style="position: relative;bottom: 5px;" src="'+ askit_logo +'" align="right" alt="ASK-DEV"></img>'
									+ '		</a>'
									+ ' </div>'
									+ '</div>'
									+ '<div class="'+askit_arrow_css+'" style="'+ arrowBlueLeftPost +'"></div>'
									+ '<div class="'+askit_bubble_arrow_css+'" style="'+arrowColor+'"></div>');
									
			var suggestion="<div style='padding:10px;'>Select one word.</div>";
			
			$("div#askit_bubble").html(nounHtml); 
			$('#askit_bubble_difinition').html(suggestion);
			$('#selection_bubble_close').click(function(){
				$("div#askit_bubble").css('visibility', 'hidden');
			});
		});

		self.port.emit("completeBubble",selection);	
        self.port.on("completeRes",function(data){ 
            
            //console.log("In dictionary:"+data);
            var searchLink = data[2];
			if(data[1]){ //Wordnet
				//console.log("Def before extract: "+$(data[0]).find('ul').eq(0).find('li').eq(0).text()+" "+selection);
				defVal = extractDef($(data[0]).find('ul').eq(0).find('li').eq(0).text(), selection);
			}
			else{//Google
				defVal =  $(data[0]).find('div.lr_dct_sf_sen.vk_txt').eq(0).find('span').eq(0).text();
			}        
			
			//console.log("Log value: "+defVal);
			defVal = firstUC(defVal);//.substring(0,1).toUpperCase() + defVal.substring(1);
		
            if(defVal != null && defVal.length > 0){ 
                
                var nounHtml = $('<div class="selection_bubble_content">'        							
    									+ '<div class="selection_bubble_word" id="selection_bubble_word">'
    									+ '		<p id="selection_bubble_close" style="float:right"></p>'
    									+ '</div>'
    									+ '<div id="askit_bubble_difinition">' 				
    									+ '		<div id="askit_bubble_dif" class="askit_dif"></div>' 
    									+ '</div>' 
    									+ '<div id="askit_bubble_synonyms">'+defVal+'</div>' 
    									+ '<div id="selection_bubble_more_action">'	
    									+ '		<span>'
    									+ '			<a href="'+searchLink+selection+'" target="_blank">More'
    									//+ '				<!--img  src="'+ askit_more +'"  alt="Search link"></img-->'
    									+ '			</a>'
    									+ '		</span>'
    									+ '		<a href="'+ourLink+'" target="_blank">'
    									+ '			<img style="position: relative;bottom: 5px;" src="'+ askit_logo +'" align="right" alt="ASK-DEV"></img>'
    									+ '		</a>'
    									+ ' </div>'
    									+ '</div>'														
    									+ '<div class="'+askit_arrow_css+'" style="'+ arrowBlueLeftPost +'"></div>'
    									+ '<div class="'+askit_bubble_arrow_css+'" style="'+arrowColor+'"></div>');
                
                
    
								$("div#askit_bubble").html(nounHtml);                                
                                $("div#askit_bubble").attr('fetching', false);                                
                                var adjectiveCount 	= 1;
    							var count 			= 0;
								var dataEntries 	= defVal;
								var selectionFound 	= false;
								var foundDefintion 	= false;
								var dataEntry 		= null;

    							if(!selectionFound){
									 selectionFound = true;
								}
								$('<span style="font-weight:bold;padding-right:10px;"></span>').html(displayWord).appendTo('#selection_bubble_word');							 
								
								
                                    
                }
                else{    							  
						var nounHtml = $('<div class="selection_bubble_content">'									
							+ '<div class="selection_bubble_word" id="selection_bubble_word">'
							+ '		<p id="selection_bubble_close" style="float:right"></p>'
							+ '</div>'
							+ '<div id="askit_bubble_difinition">'
							+ '</div>' 
							+ '<div id="selection_bubble_more_action">'
							+ '     <span>'
    						//+ '			<a href="'+searchLink+selection+'" target="_blank">More'
    						//+ '				<img  src="'+ askit_more +'"  alt="Search link"></img>'
    						+ '			</a>'
    						+ '		</span>'
    						+ '		<a href="'+ourLink+'" target="_blank">'
    						+ '			<img style="position: relative;bottom: 5px;" src="'+ askit_logo +'" align="right" alt="ASK-DEV"></img>'
    						+ '		</a>'

							+ ' </div>'
							+ '</div>'														
							+ '<div class="'+askit_arrow_css+'" style="'+ arrowBlueLeftPost +'"></div>'
							+ '<div class="'+askit_bubble_arrow_css+'" style="'+arrowColor+'"></div>');

						$("div#askit_bubble").html(nounHtml);

						$("div#askit_bubble").attr('fetching', false);                        
                        
                        if (defaultOptions.use_window == "above" && !belowFlag) {
                             wtop = pageY - 156;         
                             $("div#askit_bubble").css({
                               'top': wtop + 'px'
                              });
                        }
                        else if (defaultOptions.use_window == "below" && aboveFlag) {
                             wtop = pageY - 156;         
                             $("div#askit_bubble").css({
                               'top': wtop + 'px'
                              });
                        }
					
						var mainhref = '<a style="color:#12C;font-size:12px;" target="_blank" href="'+searchLink+selection+'">results for ' + selection + '</a>';	

						var suggestion =  '';
						if(selection=='0'){
							suggestion = "<div style='padding:10px;'>Please select one word.</div>";
						}
						else{
							suggestion = "<div style='padding:10px;'>Meaning could not be found for '"+selection+"'.</div>";
						}

						$('#askit_bubble_difinition').html(suggestion);
						
				}
				
                
                 $('#selection_bubble_close').unbind("click");    					 
				 $('#selection_bubble_close').click(function(){
					$("div#askit_bubble").css('visibility', 'hidden');
				});
        });
			
    }
    clearTimeout(timer2);
    },20);
	}
}

function isInsideBubble(currentTarget){     
    var valid = false;
    var current_element = currentTarget;
	var askit_bubble 	= document.getElementById('askit_bubble');	
	while(current_element && current_element != document.body) {
		if (current_element == askit_bubble) {
			valid = true;
			break;
		}
		current_element = current_element.parentNode;       
	}
	return valid;
}

function isValidSelection(currentTarget){
	var valid = true;
	var current_element = currentTarget;
	var askit_bubble 	= document.getElementById('askit_bubble');	
	while(current_element && current_element != document.body) {
		if (current_element == askit_bubble) {
			valid = false;
			break;
		}
		current_element = current_element.parentNode;
	}			
	var tag = currentTarget.tagName.toLowerCase();
	if (tag == 'input' || tag == 'textarea' || tag == 'img'){

		valid = false;
	}

	return valid;
}

function trimmedSelection() {
     var text = window.getSelection().toString();	
     //console.log("In trimmed: "+text);
	 text = text.replace(/^\s+|\s+$/g, '');
	 if(text.indexOf(' ')!=-1){
	 	return '0';
	 }
	 else{
	 	return text;
	 }
}

function checkTrigger(keyTrigger, e) {

	switch (keyTrigger) {
		case 'none':
		  return true;
		case 'ctrl':
		  return e.ctrlKey;
		case 'alt':
		  return e.altKey;
		case 'shift':
		  return e.shiftKey;
		default:
		  return false;
	}
}

function checkDomain(){
    var checkDomain = false;
	var siteDomain 	= document.domain;    
	var index 		= siteDomain.indexOf('www');
	if(index != -1){
		siteDomain = siteDomain.replace('www.','');	
	}
    
    var ignoreDomain = {
        'wordnetweb.princeton.edu' : 'Meaning',
	    'google.com' : 'Dictionary'
    }
    if(ignoreDomain[siteDomain]){
        checkDomain = true
        return checkDomain;
    }
	return checkDomain;	
}

//Not used
function trim(word) {
    return word = word.replace(/[^a-zA-Z]+/g,'');	
}

//For WordNet, Fetch Def
function extractDef(str, sel){
	var regex = /[^\(]*(\(.*\))[^\)]*/;
	
	str=str.substring(7);
	
   /* var i=str.indexOf(sel);
	if(i!=-1){
        str=str.substring(i);
	}*/

    var res = str.match(regex);
    if(res!=null)
	    return res[1].substring(1, res[1].length-1);
	else
		return "";
}

//First letter upper
function firstUC(word){
	return word.substring(0,1).toUpperCase() + word.substring(1);
}

function escapeHTML(str){
    str.replace(/[&"<>]/g, function (m) escapeHTML.replacements[m]);
    escapeHTML.replacements = { "&": "&amp;", '"': "&quot", "<": "&lt;", ">": "&gt;" };
}

