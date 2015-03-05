$ = jQuery.noConflict(true);

/*(function ($) {
   $(document);
}(jQuery));*/

var speaker        	= '';
var loading			= '';
var askit_logo		= '';
var askit_logo_icon	= '';
var askit_close_btn	= '';	;
var askit_more		= '';
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

self.port.on("getImages", function (loading1, speaker1, askit_close_btn1, askit_more1, askit_logo1, askit_logo_icon1){ 
    loading =  loading1;
    speaker = speaker1;
    askit_close_btn = askit_close_btn1;
    askit_more = askit_more1;
    askit_logo = askit_logo1;
    askit_logo_icon = askit_logo_icon1;
});

var bubbleDOM = null;
var defaultOptions = {};
    
$(document).ready(function(){ 
    if($("div#askit_bubble").length == 0){
		var element = document.body.firstElementChild;
		bubbleDOM = $('<div id=askit_bubble class="selection_bubble fontSize13 noSelect" style="z-index:9999; border: 1px solid #4AAEDE;fetching=false"></div>');
		//Modified askit_bubble -> askit_bubble
		bubbleDOM.insertBefore(element);
	}	
	   
	$(document).dblclick(function(e) {
		var target = (e && e.target) || (e && e.srcElement);        
		if(isValidSelection(target)){
			selectEventBind(e,'dblclick');
		}
	});    
    
	$(document).mouseup(function(event) {			
		var target = (event && event.target) || (event && event.srcElement);
        if (!isInsideBubble(target)) {
           selectEventBind(event, 'mouseup')
        }
	});	
    
	$(document).click(function(event) {
		var target = (event && event.target) || (event && event.srcElement);
        selection = trimmedSelection();
        self.port.emit("pageInfo",selection); //send selected word to main.js
        if((!isInsideBubble(target) && selection.length == 0) && selection == ""){ //TODO : Add Exception for special character 
		    $("div#askit_bubble").css('visibility', 'hidden');
		}
	});
});

self.port.on("sendDef", function(data){
	//return $(data).find('ul').eq(0).text();
	self.port.emit("takeDef", $(data).find('ul').eq(0).text());
});

function selectEventBind(e,selectedEvent){
    self.port.emit("getLocalStorage");    
    
    self.port.on("update", function(prefs_data) {    
        defaultOptions = JSON.parse(prefs_data);        
    });

    
    if((defaultOptions.use_popupdbclick && defaultOptions.use_popupdbclick.triggerValue) && e.type == 'dblclick'){
        self.port.emit("pageInfo",selection); 
        createhtml(e,refresh);
	}

	if((defaultOptions.use_popupselect && defaultOptions.use_popupselect.triggerValue) && e.type == 'mouseup'){     
		selection = trimmedSelection();
        self.port.emit("pageInfo",selection);  
		createhtml(e,refresh);
	}
    else if(selectedEvent == 'mouseup'){
        selection = trimmedSelection();
        self.port.emit("pageInfo",selection);  
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

		if(!showDefintion){
			selection = trimmedSelection();			
			return;
		}		

		selection = trimmedSelection();		
		
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
				var askit_arrow_css 			= "dic-arrow-" + defaultOptions.use_window;
				var askit_bubble_arrow_css 	= "dic-bubble-arrow-" + defaultOptions.use_window;	
				var wleft 					= pageX;
				var wtop 					= pageY;
				var arrowColor 				= null;
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
					askit_arrow_css 				= "dic-arrow-above";
					askit_bubble_arrow_css 		= "dic-bubble-arrow-above";
		            arrowFlag 					= false;
		            aboveFlag 					= true;
				}
				else if(pageY <= abovePageHeight+150 && defaultOptions.use_window =="above"){
					defaultOptions.use_window 	= "below";
					askit_arrow_css 				= "dic-arrow-below";
					askit_bubble_arrow_css 		= "dic-bubble-arrow-below";
		            arrowFlag 					= false;
		            belowFlag 					= true; 
				}

			if(defaultOptions.use_window == "below"){				
                if (pageX > 76 && pageX < screenWidth) {
                	wleft 			= pageX - 76;
                    arrowLeftPos 	= null;
                    arrowBlueLeftPost = null;
                    
                } else if (pageX > screenWidth) {
                    arrowLeftPosition = pageX - screenWidth;
                    
                    if (arrowLeftPosition > 20) {
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
                    wleft = 10;
                }
                wtop = pageY + 30;                
                arrowColor = "border-bottom:20px solid " + defaultOptions.use_color_style.bubbleColor + "; " + arrowBlueLeftPost
			}
			else if(defaultOptions.use_window == "above"){                                     
                if (pageX > 75 && pageX < screenWidth) {                
                    wleft 				= pageX - 75;                    
                    arrowLeftPos 		= null;                    
                    arrowBlueLeftPost 	= null;                    
                    
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
     
                    arrowLeftPos = "left:" + arrowLeftPosition + "px";                    
                    arrowBlueLeftPost = "left:" + arrowLeftPosition + "px";                    
                    wleft = 10
                }
                if (pageY > 120) {                
                    wtop = pageY - 120;
                }
                arrowColor = "border-top:20px solid " + defaultOptions.use_color_style.bubbleColor + "; " + arrowBlueLeftPost            
			}			

			var loader = ' <img src="'+loading+'" style="padding:10px 0 15px 190px;"></img>';
			if(!refresh){
				$("div#askit_bubble").css({'top': wtop+'px','left': wleft+'px',
					'backgroundColor':defaultOptions.use_color_style.bubbleColor,
					'color':defaultOptions.use_color_style.fontColor,
					'fontSize':defaultOptions.use_color_style.fontSize,
					'fontFamily':defaultOptions.use_color_style.fontType,
					'visibility': 'visible'});
			}
			else{
				$("div#askit_bubble").css('visibility', 'visible');
			}			

			$("div#askit_bubble").html(loader);			
			displayWord = selection;			
			var apostrophy=selection.indexOf("'");
			
			if(apostrophy !=-1){
				selection = selection.substring(0,apostrophy);
			}
			
			var synonyms = '';             
             
			if(defaultOptions.use_definition.synonyms){                
                self.port.emit("synonymsBubble",selection);                 
                self.port.on("error", function(errorResponse){                        
                        if(!refresh && (defaultOptions.use_window =="above")){    
        						wtop =  pageY - ($("div#askit_bubble")[0].clientHeight+30);    
    							$("div#askit_bubble").css({'top': wtop+'px','left': wleft+'px','visibility': 'visible'});
    					 }	
                    
                        var selection = errorResponse;                      
                        var nounHtml = $('<div class="selection_bubble_content">'            						
        									+ '<div class="selection_bubble_word" id="selection_bubble_word">'
        									+ '		<img src="'+askit_close_btn+'" id="selection_bubble_close" align="right"></img>'
        									+ '</div>'
        									+ '<div id="askit_bubble_difinition">' 				
        									+ '		<i class="selection_bubble_title">adjective</i>' 
        									+ '		<div id="askit_bubble_dif" class="askit_dif"></div>' 
        									+ '</div>' 
        									+ ' <div id="askit_bubble_synonyms">'
        									+ '</div>' 
        									+ '<div id="selection_bubble_more_action">'	
        									+ '		<span>'
        									+ '			<a href="https://www.google.com/?hl=en#hl=en&q='+selection+'" target="_blank">'
        									+ '				<img  src="'+ askit_more +'"  alt="More"></img>'
        									+ '			</a>'
        									+ '		</span>'
        									+ '		<a href="http://www.theaskdev.com" target="_blank">'
        									+ '			<img style="position: relative;bottom: 5px;" src="'+ askit_logo +'" align="right" alt="Dictionary.com"></img>'
        									+ '		</a>'
        									+ ' </div>'
        									+ '</div>'														
        									+ '<div class="'+askit_arrow_css+'" style="'+ arrowBlueLeftPost +'"></div>'
        									+ '<div class="'+askit_bubble_arrow_css+'" style="'+arrowColor+'"></div>');
                    
                    	$('div#askit_bubble').html(nounHtml);
                      
                        var mainhref = '<a target="_blank" style="color:#12C;font-size:12px;" href=https://www.google.com/?hl=en#hl=en&q=' + selection + '>results for ' + selection + '</a>';    
    
        				var suggestion =  "<div style='padding:10px;'>No dictionary results were found. Please try another search.</div><div style='clear:both;padding:10px;' class='seeDefinition'>See " + mainhref + " on Reference.com</div>";
    
                        $('#askit_bubble_difinition').html(suggestion);
    					//$('div#askit_bubble').html(suggestion);
                        $('#selection_bubble_close').unbind("click");
    				    $('#selection_bubble_close').click(function(){								     
    					    $("div#askit_bubble").css('visibility', 'hidden');    
    				    });
                    })
                
                 self.port.on("synonymsRes",function(synonmsResponse){                    
                    //var synonmsRes = JSON.parse(unescape(synonmsResponse));
                    var synonmsRes = decodeURIComponent(synonmsResponse);                    
                    synonmsRes = synonmsRes.split(",");                   
                        			
            		if(synonmsRes != null && synonmsRes.length > 0){								             
            		 	for(var i=0;i<synonmsRes.length;i++){
            			if(i < 10){
              				var linkedUrl = "/browse/" + synonmsRes[i];
               				synonyms = synonyms + '<a href="'+linkedUrl+'">' + synonmsRes[i] +'</a>, ';
            			 }
            		 }
            
            		 var lastIndex = synonyms.lastIndexOf(",");
            
            		 synonyms = synonyms.substring(0,lastIndex);													 
		 
	            }     
            });
			   
	    }

		self.port.emit("completeBubble",selection);	
        
        self.port.on("completeRes",function(defValue){ 
            
            //var defVal = JSON.parse(unescape(defValue));
            console.log("In dictionary:"+defValue);
            var defVal = defValue;           
        
            if(defVal != null && defVal.length > 0){ 
                
                var nounHtml = $('<div class="selection_bubble_content">'        							
    									+ '<div class="selection_bubble_word" id="selection_bubble_word">'
    									+ '		<img src="'+askit_close_btn+'" id="selection_bubble_close" align="right"></img>'
    									+ '</div>'
    									+ '<div id="askit_bubble_difinition">' 				
    									+ '		<i class="selection_bubble_title">adjective</i>' 
    									+ '		<div id="askit_bubble_dif" class="askit_dif"></div>' 
    									+ '</div>' 
    									+ ' <div id="askit_bubble_synonyms">'+defVal+'</div>' 
    									+ '<div id="selection_bubble_more_action">'	
    									+ '		<span>'
    									+ '			<a href="https://www.google.com/?hl=en#hl=en&q='+selection+'" target="_blank">'
    									+ '				<img  src="'+ askit_more +'"  alt="Dictionary More"></img>'
    									+ '			</a>'
    									+ '		</span>'
    									+ '		<a href="http://www.theaskdev.com/" target="_blank">'
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
								
								 //if(window.location.protocol != "https:"){

								/*if(dataEntry.audio_file != null){
								
										var audiovar = "http://sp.dictionary.com/dictstatic/dictionary/audio/luna/"+dataEntry.audio_file +".mp3";
								
										 var speakerDom = '<img style="position: relative;top: 4px;display:inline;cursor:pointer;" src="' + speaker + '" id="playSound">';
                                        $('<span style="padding-right:5px;font-size:12px;"></span>').html(speakerDom).appendTo('#selection_bubble_word');
                                    
                                        $('#playSound').click(function () {
                                            var embedDom = '<embed src="' + audiovar + '" hidden=true autostart=true loop=false>';
                                            $('#soundBox').html(embedDom);
                                        })
                                        //var embedDom1 = '<embed type="application/x-shockwave-flash" src="http://sp.dictionary.com/dictstatic/d/g/speaker.swf" width="17" height="15" id="speaker" align="texttop" quality="high" loop="false" menu="false" salign="t" wmode="transparent" flashvars=soundUrl='+audiovar+'>';
								
										//$('<span style="padding-right:5px;font-size:12px;"></span>').html(embedDom1).appendTo('#selection_bubble_word');						
										
									}*/
								
								//}

								/*if(dataEntry.pronunciation_spell !=null){

									 var pron = "[<span style='padding-right:2px;'> " + dataEntry.pronunciation_spell + "</span>]";

									 $('<span class="selection_bubble_align_with_spearker"></span>').html(pron).appendTo('#selection_bubble_word');	
									 
									 
								 }							
								
								$('<span id="soundBox">&nbsp;</span>').appendTo('#selection_bubble_word');
								
								var defintionLength = 0;

								var defintionsDisplay = null;

								var definitionType = null;	

								for(var type in dataEntry.definitions){

									if(!foundDefintion){

										if(dataEntry.definitions[type].length > defintionLength){

											definitionType = type;

											defintionsDisplay = dataEntry.definitions[definitionType];

											defintionLength = dataEntry.definitions[definitionType].length;	
										}

									}								
									if(defintionLength >= defaultOptions.use_definition.num){

										foundDefintion = true;

										break;

									}
								}							

								$('i.selection_bubble_title').html(definitionType);    

								 if(defintionLength != 0){

									 for(var j = 0; j<defintionLength;j++) { 

										 if(count != defaultOptions.use_definition.num) {

											 var definitionContent = null;

											 if(defintionsDisplay[j].definition){

												 definitionContent = "<div class='itemCount'>" + adjectiveCount + ".</div><div class='itemData'> " + defintionsDisplay[j].definition.content + "</div>";

												 $('<div class=item ></div>').html(definitionContent).appendTo('#askit_bubble_dif');

												count = count + 1;

												adjectiveCount = adjectiveCount + 1;
											 }
											 else if(defintionsDisplay[j].definitions){

												 for(var k =0 ;k<defintionsDisplay[j].definitions.length;k++){

													 if(count != defaultOptions.use_definition.num) {

														definitionContent = "<div class='itemCount'>" + adjectiveCount + ".</div><div class='itemData'> " + defintionsDisplay[j].definitions[k].content + "</div>";

														$('<div class=item ></div>').html(definitionContent).appendTo('#askit_bubble_dif');

														count = count + 1;

														adjectiveCount = adjectiveCount + 1;
													 }

												 }// close inner for loop
											 }										
										}
									 } //close outer for loop

									 if(defaultOptions.use_definition.synonyms){

										 if(synonyms.length > 10) {
										  
											var dicSynonyms = ' <div class="selection_bubble_synonyms">synonyms</div>' +
														' <div id="selection_bubble_defintion"></div>';

											$('#askit_bubble_synonyms').html(dicSynonyms);

											$('<span></span>').html(synonyms).appendTo('#selection_bubble_defintion');						

											$('div#selection_bubble_defintion span a').click(function(){

												var href = $(this).attr('href');					
																	
												self.port.emit("redirectUrl",href);
											 
												return false;
											});	
										 }
									 } // close if for synonyms
									 
									  if(!refresh && (defaultOptions.use_window =="above" && count !=0)){

											wtop =  pageY - ($("div#askit_bubble")[0].clientHeight+30);

											$("div#askit_bubble").css({'top': wtop+'px','left': wleft+'px','visibility': 'visible'});
									  }								  
									  
									  
									  if(count == 0){

											//$('#askit_bubble_difinition').html('<div style="padding:10px;">No dictionary results were found. Please try another search.</div>');

											 var mainhref = '<a style="color:#12C;font-size:12px;" href=/browse/' + selection + '>results for ' + selection + '</a>';	

											var suggestion =  "<div style='padding:10px;'>No dictionary results were found. Please try another search.</div><div style='clear:both;padding:10px;' class='seeDefinition'>See " + mainhref + " on Reference.com</div>";

											$('#askit_bubble_difinition').html(suggestion);
									  }
										  
								 }
								 else if(!selectionFound){

									//$('#askit_bubble_difinition').html('<div style="padding:10px;">No dictionary results were found. Please try another search.</div>');

									var mainhref = '<a style="color:#12C;font-size:12px;" href=/browse/' + selection + '>results for ' + selection + '</a>';	

									var suggestion =  "<div style='padding:10px;'>No dictionary results were found. Please try another search.</div><div style='clear:both;padding:10px;' class='seeDefinition'>See " + mainhref + " on Reference.com</div>";

									$('#askit_bubble_difinition').html(suggestion);

								}
							 
							}//close dataEntry if*/
                                    
                }
                else{    							  
						var nounHtml = $('<div class="selection_bubble_content">'									
							+ '<div class="selection_bubble_word" id="selection_bubble_word">'
							+ '		<img src="'+askit_close_btn+'" id="selection_bubble_close" align="right"></img>'
							+ '</div>'
							+ '<div id="askit_bubble_difinition">'
							+ '</div>' 
							+ '<div id="selection_bubble_more_action">'
							+ '     <span>&nbsp;</span>'
							+ '      <a href="http://app.dictionary.com/click/rovvlr?clkdest=http://dictionary.reference.com/" target="_blank">'
							+ '			<img style="position: relative;bottom: 5px;" src="'+ askit_logo +'" align="right" alt="Dictionary.com"></img>'
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
					
						var mainhref = '<a style="color:#12C;font-size:12px;" href=/browse/' + selection + '>results for ' + selection + '</a>';	

						var suggestion =  "<div style='padding:10px;'>No dictionary results were found. Please try another search.</div><div style='clear:both;padding:10px;' class='seeDefinition'>See " + mainhref + " on Reference.com</div>";

						$('#askit_bubble_difinition').html(suggestion);
						
				}
                
                 $('#selection_bubble_close').unbind("click");
    					 
				 $('#selection_bubble_close').click(function(){								 

					$("div#askit_bubble").css('visibility', 'hidden');

				});
                
                $('.itemData a').unbind("click");

    					 $('.itemData a').click(function(){

							var popHref=$(this).attr("href");

							var checkSpecialChar = popHref.indexOf("@");

							if(checkSpecialChar != -1){

								popHref = $(this).text();								
								
							}														
							
							self.port.emit("itemRedirectUrl",popHref);

							return false;
							
						});	

						$('.seeDefinition a').unbind("click");
						
						$('.seeDefinition a').click(function(){

							var popHref=$(this).attr("href");

						    self.port.emit("getReference",popHref);

							return false;
					 });
                
                    $('div#askit_bubble_dif div.item div.itemData').dblclick(function(e){
    
        				     createhtml(e, true);
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
	var askit_bubble = document.getElementById('askit_bubble');	
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
	var askit_bubble = document.getElementById('askit_bubble');	
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
	 return text.replace(/^\s+|\s+$/g, '');
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
	var siteDomain = document.domain;    
	var index = siteDomain.indexOf('www');
	if(index != -1){
		siteDomain = siteDomain.replace('www.','');	
	}
    
    var ignoreDomain = {
        'dictionary.reference.com' : 'Dictionary',
	    'dictionary.com' : 'Dictionary',
	    'thesaurus.com' :'thesaurus',
	    'reference.com'	: 'reference'
    }
    if(ignoreDomain[siteDomain]){
        checkDomain = true
        return checkDomain;
    }
	return checkDomain;	
}


function trim(word) {
	
    return word = word.replace(/[^a-zA-Z]+/g,'');	

	//return word.replace(/^\s+|\s+$/g, '');
}

function escapeHTML(str){
    str.replace(/[&"<>]/g, function (m) escapeHTML.replacements[m]);
    escapeHTML.replacements = { "&": "&amp;", '"': "&quot", "<": "&lt;", ">": "&gt;" };
}

