/*
|===============================================================================
|		Last Modified Date 	: 26/03/2015
|===============================================================================
|		Copyright 2014-2015 ASK-DEV.Inc. All Rights Reserved. Released under the GPL license
|		Developed by 	: Shashidhar and Alwyn Edison Mendonca
|		WebSite 		: http://www.theaskdev.com
|===============================================================================
*/

//$ = jQuery.noConflict(true);

/*(function ($) {
   $(document);
}(jQuery));*/
var newDisable		= 0;
var speaker        	= '';
var loading			= '';
var askit_logo		= '';
var askit_logo_icon	= '';
var askit_close_btn	= '';
var selection 		= '';
var synonyms		= '';
var displayWord 	= '';
var timer1 			= 1 ;
var defineWord 		= '';
var timer2 			= 1 ;
var timer3			= 0 ;
var errorTimer 		= 0;
var refresh 		= false;
var selectionText 	= '';
//var linkToSearch	= 'https://www.google.com/?hl=en#hl=en&q=';
var ourLink			= 'http://www.theaskdev.com';
var d=true;
var askit_arrow_css;
var arrowBlueLeftPost;
var askit_bubble_arrow_css;
var arrowColor;

self.port.on("closeBubble2", function(){
	$("div#askit_bubble").css('visibility', 'hidden');
});

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
	var target = (event && event.target) || (event && event.srcElement);
    if(!isInsideBubble(target) || selection.length == 0){ 
	    $("div#askit_bubble").css('visibility', 'hidden');
	    self.port.emit("abortReq");//Abort req if bubble closed
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

	//clearTimeout(timer2);
    
    if((defaultOptions.use_popupdbclick && defaultOptions.use_popupdbclick.triggerValue) && e.type == 'dblclick'){
		createhtml(e,refresh);
	}
}

function createhtml(e,refresh){    
	if(checkDomain()){
		return;
	}
	else
	{	
		bubbleDOM = $("div#askit_bubble");
    	self.port.emit("getLocalStorage"); 

		selection = trimmedSelection();
				
		var pageX 	= e.pageX;
		var pageY 	= e.pageY;
		var target 	= (e && e.target) || (event && event.srcElement);     
     	
     	$("div#askit_bubble").attr('fetching', false); 
    
       // timer2 = setTimeout(function() {  
		if (selection.length > 0 ) 
		{
			if($("div#askit_bubble").attr('fetching'))
			{
        		return;
			}
		
			$("div#askit_bubble").attr('fetching', 'true');			
			askit_arrow_css 		= "askit-arrow-" + defaultOptions.use_window;
			askit_bubble_arrow_css 	= "askit-bubble-arrow-" + defaultOptions.use_window;	
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
			
			if(pageY >= belowPageHeight-150 && defaultOptions.use_window == "below")
			{
		   		defaultOptions.use_window 	= "above";
				askit_arrow_css 			= "askit-arrow-above";
				askit_bubble_arrow_css 		= "askit-bubble-arrow-above";
		        arrowFlag 					= false;
		        aboveFlag 					= true;
			}
			else if(pageY <= abovePageHeight+150 && defaultOptions.use_window =="above")
			{
				defaultOptions.use_window 	= "below";
				askit_arrow_css 			= "askit-arrow-below";
				askit_bubble_arrow_css 		= "askit-bubble-arrow-below";
		        arrowFlag 					= false;
		        belowFlag 					= true; 
			}

			if(defaultOptions.use_window == "below")
			{				
                if (pageX > 76 && pageX < screenWidth) 
                {
                	wleft 				= pageX - 76;
                    arrowLeftPos 		= "";
                    arrowBlueLeftPost 	= "";
                } 
                else if (pageX > screenWidth) 
                {
                	arrowLeftPosition = pageX - screenWidth;
                    if (arrowLeftPosition > 20) 
                    {
                    	arrowLeftPosition = arrowLeftPosition - 20;
                    }
                    
                    arrowLeftPos 		= "left:" + arrowLeftPosition + "px";
                    arrowBlueLeftPost 	= "left:" + arrowLeftPosition + "px";
                    wleft = screenWidth;
                } 
                else 
                {
                	if (pageX > 30) 
                	{
                    	arrowLeftPosition = pageX - 30;
                    } 
                    else 
                    {
                        arrowLeftPosition = pageX;
                        if (arrowLeftPosition == 0) 
                        {
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
			else if(defaultOptions.use_window == "above")
			{                                     
                if (pageX > 75 && pageX < screenWidth) 
                {                
                    wleft 				= pageX - 75;                    
                    arrowLeftPos 		= "";                    
                    arrowBlueLeftPost 	= "";                    
                    
                } else if (pageX > screenWidth) 
                {
                
                    arrowLeftPosition = pageX - screenWidth;                      
                    if (pageX > 20) 
                    {                    
                        arrowLeftPosition = arrowLeftPosition - 20;
                    }
                    
                    arrowLeftPos = "left:" + arrowLeftPosition + "px";                    
                    arrowBlueLeftPost = "left:" + arrowLeftPosition + "px";                    
                    wleft = screenWidth;                    
                } else 
                {     
                    if (pageX > 30) 
                    {                    
                        arrowLeftPosition = pageX - 30;                       
                    } else 
                    {
                        arrowLeftPosition = pageX;                        
                        if (arrowLeftPosition == 0) 
                        {                        
                            arrowLeftPosition = 10;
                        }
                    }
     
                    arrowLeftPos 		= "left:" + arrowLeftPosition + "px";                    
                    arrowBlueLeftPost 	= "left:" + arrowLeftPosition + "px";                    
                    wleft = 10
                }
                if (pageY > 120) 
                {                
                    wtop = pageY - 120;
                }
                arrowColor = "border-top:20px solid " + defaultOptions.use_color_style.bubbleColor + "; " + arrowBlueLeftPost            
			}			
			//console.log(arrowColor);
			var loader = ' <img src="'+loading+'" style="padding:10px 0 15px 130px;"></img>';
			loader = '<div style="padding:10px;">Searching...</div>';
			if(!refresh)
			{
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
			
			if(apostrophy !=-1)
			{
				selection = selection.substring(0,apostrophy);
			}
			
			var synonyms = '';     
			d=true;
			self.port.emit("completeBubble",selection);	
    	    self.port.on("progressContent",function(data)
    	    { 
           // clearTimeout(timer2);
           		//console.log("In progress Content");
       			if(((data[1]==1 && $(data[0]).find('ul').length) || (data[1]==0 && $(data[0]).find('div.lr_dct_sf_sen.vk_txt').length)) && d==true)
				{
					d=false;
        		    console.log("In dictionary:");
        		    var searchLink = data[2];
					if(data[1])
					{ //Wordnet
						console.log("Def before extract: "+$(data[0]).find('ul').eq(0).find('li').eq(0).text()+" "+selection);
						defVal = extractDef($(data[0]).find('ul').eq(0).find('li').eq(0).text(), selection);
					}
					else
					{//Google
						defVal =  $(data[0]).find('div.lr_dct_sf_sen.vk_txt').eq(0).find('span').eq(0).text();
					}        
					//console.log("Log value: "+defVal);
					defVal = firstUC(defVal);//.substring(0,1).toUpperCase() + defVal.substring(1);
					var bubbleDesign = '<div class="selection_bubble_content">'      						
    									+ '<div class="selection_bubble_word" id="selection_bubble_word">'
    									+ '<span id="Selword" style="font-weight:bold;padding-right:10px;">'+displayWord+'</span>'
    									+ '		<p id="selection_bubble_close" style="float:right"></p>'
    									+ '</div>'
    									+ '<div id="askit_bubble_difinition">' 				
    									+ '		<div id="askit_bubble_dif" class="askit_dif"></div>' 
    									+ '</div>'  
    									+ '<div id="selection_bubble_more_action">'	
    									+ ' </div>'
    									+ '		<a id="ourlink" href="'+ourLink+'" target="_blank">'
    									+ '			<img style="position:absolute;bottom:0;right:0;" src="'+ askit_logo +'" align="right" alt="ASK-DEV" />'
    									+ '		</a>'
    									+ '</div>'														
    									+ '<div class="'+askit_arrow_css+'" style="'+ arrowBlueLeftPost +'"></div>'
    									+ '<div class="'+askit_bubble_arrow_css+'" style="'+arrowColor+'"></div>';
			
						var nounHtml ;
        	        	if($('#askit_bubble_difinition').length==0)
	        	        	nounHtml = $(bubbleDesign);
    	    	        $("div#askit_bubble").html(nounHtml);
    	    	        //console.log("in disp"+displayWord);
    	    	        linkMore = searchLink+selection;
    	    	        $("div#askit_bubble_dif").html(defVal).append('&nbsp;&nbsp;<a id="more" class="moreSymbol" href="'+searchLink+selection+'" target="_blank">More</a>');
						$('#Selword').show();	
						$('#ourlink').click(function(e){ e.preventDefault();self.port.emit("openTab", ourLink);});
						$('#more').click(function(e){ e.preventDefault();self.port.emit("openTab", searchLink+selection);});				 
						
					self.port.emit("dispDone");
					//self.port.emit("openTab", searchLink+selection);
					//disbleAnchor();
					self.port.emit("abortReq");
				}
							
					$('#selection_bubble_close').unbind("click");    					 
			
					$('#selection_bubble_close').click(function()
					{
						$("div#askit_bubble").css('visibility', 'hidden');
					});
					
					//
					
    		});
    		    		
    		self.port.on("notFound", function(){
    			
    				console.log("in not found");
    	    	    	var bubbleDesign = '<div class="selection_bubble_content">'      						
    									+ '<div class="selection_bubble_word" id="selection_bubble_word">'
    									+ '<span id="Selword" style="font-weight:bold;padding-right:10px;">'+displayWord+'</span>'
    									+ '		<p id="selection_bubble_close" style="float:right"></p>'
    									+ '</div>'
    									+ '<div id="askit_bubble_difinition">' 				
    									+ '		<div id="askit_bubble_dif" class="askit_dif"></div>' 
    									+ '</div>'  
    									+ '<div id="selection_bubble_more_action">'	
    									+ ' </div>'
    									+ '		<a id="ourlink" href="'+ourLink+'" disabled>'
    									+ '			<img style="position:absolute;bottom:0;right:0;" src="'+ askit_logo +'" align="right" alt="ASK-DEV" />'
    									+ '		</a>'
    									+ '</div>'														
    									+ '<div class="'+askit_arrow_css+'" style="'+ arrowBlueLeftPost +'"></div>'
    									+ '<div class="'+askit_bubble_arrow_css+'" style="'+arrowColor+'"></div>';
			
						$('#ourlink').click(function(e){ e.preventDefault();self.port.emit("openTab", ourLink);});
						if($('#askit_bubble_difinition').length==0)
        	        		var nounHtml = $(bubbleDesign);
						$("div#askit_bubble").html(nounHtml);
						$("div#askit_bubble").attr('fetching', false);                        
       	
        	        	if (defaultOptions.use_window == "above" && !belowFlag) 
        	        	{
							wtop = pageY - 156;         
        	            	$("div#askit_bubble").css({'top': wtop + 'px'});
        	       		}
        	       		else if (defaultOptions.use_window == "below" && aboveFlag) 
        	       		{
        	       			wtop = pageY - 156;         
        	            	$("div#askit_bubble").css({'top': wtop + 'px'});
        	       		}
						
						//suggestion = "<div style='padding:10px;'>Please select one word.</div>";
						var suggestion = "<div style='padding:10px;'>Meaning could not be found for '"+selection+"'.</div>";
					

						$('#Selword').hide();	
						$('#askit_bubble_dif').html(suggestion);
						$('#selection_bubble_more_action').hide();
						
					self.port.emit("abortReq");
    				$('#selection_bubble_close').unbind("click");    					 
			
					$('#selection_bubble_close').click(function()
					{
						$("div#askit_bubble").css('visibility', 'hidden');
					});
    		});
    	}
  	}
}

self.port.on("nullError",function(data){ 
			//newDisable=1;
			//console.log("error no conenction");
			var nounHtml = $('<div class="selection_bubble_content">'
									+ '<div class="selection_bubble_word" id="selection_bubble_word">'
    								+ '		<p id="selection_bubble_close" style="float:right"></p>'
    								+ '</div>'
									+ '<div id="askit_bubble_difinition">'
									+ '</div>' 
									+ '<div id="selection_bubble_more_action">'
									+ '		<a  id="ourlink" href="'+ourLink+'" target="_blank">'
									+ '			<img style="position:absolute;bottom:0;right:0;" src="'+ askit_logo +'" alt="ASK-DEV" />'
									+ '		</a>'
									+ ' </div>'
									+ '</div>');
									
			var suggestion="<div style='padding:10px;'><i>Please select one word.</i></div>";
			$('#ourlink').click(function(e){ e.preventDefault();self.port.emit("openTab", ourLink);});
			$("div#askit_bubble").html(nounHtml); 
			$('#askit_bubble_difinition').html(suggestion);
			$('#selection_bubble_close').click(function(){
				$("div#askit_bubble").css('visibility', 'hidden');
			});
		});

self.port.on("error",function(data){ 
			//console.log("error no conenction");
			var nounHtml = $('<div class="selection_bubble_content">'
									+ '<div class="selection_bubble_word" id="selection_bubble_word">'
    								+ '		<p id="selection_bubble_close" style="float:right"></p>'
    								+ '</div>'	
									+ '<div id="askit_bubble_difinition">'
									+ '</div>' 
									+ '<div id="selection_bubble_more_action">'
									+ '		<a  id="ourlink" href="'+ourLink+'" target="_blank">'
									+ '			<img style="position:absolute;bottom:0;right:0;" src="'+ askit_logo +'" alt="ASK-DEV"></img>'
									+ '		</a>'
									+ ' </div>'
									+ '</div>');
									
			var suggestion;
			if(data==2)
				suggestion = "<div style='padding:10px;'>No internet connection.</div>";
			else if(data==1)
				suggestion = "<div style='padding:10px;'>It's taking too much time to load.</div>";
			$('#ourlink').click(function(e){ e.preventDefault();self.port.emit("openTab", ourLink);});
			$("div#askit_bubble").html(nounHtml); 
			$('#askit_bubble_difinition').html(suggestion);
			$('#selection_bubble_close').click(function(){
				$("div#askit_bubble").css('visibility', 'hidden');
			});
		});
		
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
/*
self.port.on("progressContent", function(d){	
	
	if($(d).find('div.lr_dct_sf_sen.vk_txt').length && d)
	{
		d=false
		console.log("Got..:"+$(d).find('div.lr_dct_sf_sen.vk_txt').eq(0).find('span').eq(0).text());
		self.port.emit("abortReq");
	}
});*/
function trimmedSelection() {
     var text = window.getSelection().toString();	
     //console.log("In trimmed: "+text);
	 text = text.replace(/^\s+|\s+$/g, '');
	 if(text.indexOf(' ')!=-1){
	 	console.log("In trim Zero");
	 	return '0';
	 }
	 else{
	 	console.log("In trim not zero");
	 	//newDisable=0;
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
    console.log(res);
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

