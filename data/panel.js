/*
|===============================================================================
|		Last Modified Date 	: 05/04/2015
|===============================================================================
|		Copyright 2014-2015 ASK-DEV.Inc. All Rights Reserved. Released under the GPL license
|		Developed by 	: Shashidhar and Alwyn Edison Mendonca
|		WebSite 		: http://www.theaskdev.com
|===============================================================================
*/
var totalRequestDone=0;
var d=true;
function replaceNumber(text){
	return text.replace(/<strong>\d*<\/strong>./g, '');
}

function replaceWordNetChar(text){
	return text.replace(/(S:)|(\(v\))|(\(n\))/g, '');
}

function removeAnchorTag(text){
	text=text.replace("Wikipedia", "");
	return (text.replace(/<a\b[^>]*>/ig,"")).replace(/<\/a>/ig, "");
}

//First letter upper
function firstUC(word){
	return word.substring(0,1).toUpperCase() + word.substring(1);
}
	
self.port.on("takeDefn", function(text)
{
	if( (text[1]==1 && $(text[0]).find('ul').eq(0).find('li').length) || 
		(text[1]==0 && $(text[0]).find('div.lr_dct_sf_sen.vk_txt').length) || 
		(text[1]==0 && $(text[0]).find('div._oDd').length) ||
		(text[1]==0 && $(text[0]).find('div.kno-rdesc').length) )
		
	{
		if(d==true){
			d=false;
			$('#definition').css("border","1px solid #CCC");
			$('#definition').css("background-color","#F6F2D4");
			if(text[1]==0){ //Google
				//if($(text[0]).find('div.lr_container')
			
				var respData = $(text[0]).find('div.lr_container');
				respData.find('div.lr_dct_ent_ph').remove();
				respData.find('div.vkc_np').remove();
				respData.find('div.xpdxpnd').eq(respData.find('div.xpdxpnd').length-1).remove();
				//lr_dct_sf_sen
		
				//console.log("Def: Displayed..0");
				if(respData.html() != undefined && respData.html() !="")
					$("#definition").html(removeAnchorTag(replaceNumber(respData.html())));
				else { //console.log("Def: Displayed..2");
				
					if($(text[0]).find('div._oDd').length)
					{
						respData = $(text[0]).find('div._oDd').eq(0).text();
						$('#definition').css("text-align","justify");
						$("#definition").html(removeAnchorTag(replaceNumber(respData)));
					}
					else if($(text[0]).find('div.kno-rdesc').length){
						respData =  $(text[0]).find('div.kno-rdesc').eq(0).text();
						//$('#definition').css("text-align","justify");
						$("#definition").html(removeAnchorTag(replaceNumber(respData)));
					}
					else{
						$('#definition').css("border","0px solid #CCC");
						$("#definition").html("<div class=\"alert\"><strong>Warning!</strong> Meaning could not be found.</div>");
					}
				}
			}
			else{ //WordNet
				//self.port.emit("fetchDefWordNet", [$(text[0]).find('ul').eq(0).find('li').eq(0).text(), data]);
				////console.log(text[0]);
				var ulCount = $(text[0]).find('ul').length;
				var h3Count = $(text[0]).find('h3').length;
				text = removeAnchorTag(text[0]);
		
				if(h3Count == ulCount)
				{
					var count=0;
					var text2="", ulTag;
					while(count < h3Count)
					{
							//ulTag = ($(text[0]).find('ul').eq(count).html()).replace('S:', '');
						text2 += "<h4>"+$(text).find('h3').eq(count).html()+"</h4>"+$(text).find('ul').eq(count).html();
						count++;
					}
					text2 = replaceWordNetChar(text2);
					//console.log("Def: Displayed..1");
					if(text2=="")
					{
						$('#definition').css("border","0px solid #CCC");
						$("#definition").html("<div class=\"alert\"><strong>Warning!</strong> Meaning could not be found.</div>");
					}
					else{ 
						$("#definition").html('<div style="margin:10px;">'+text2+'</div>');
					}
					//$("#definition").html($(text[0]).find('h3').eq(0).html()+$(text[0]).find('ul').eq(0).html()+$(text[0]).find('h3').eq(1).html()+$(text[0]).find('ul').eq(1).html());	
				}
				else
				{
					var text2 = $(text).find('ul').eq(0).html()
					text2 = replaceWordNetChar(text2);
					//console.log("Def: Displayed..2");
					$("#definition").html(text2);
				}
			}
			self.port.on("dispDone");
			self.port.emit("abortReq");
		}
	}else{
		if(text[3]==1){
			self.port.emit("findDefn2",[$("#data").val(), 1]);
		}
		else{
			$('#definition').css("border","0px solid #CCC");
			$("#definition").html("<div class=\"alert\"><strong>Warning!</strong> Meaning could not be found.</div>");
		}
	}
});

self.port.on("takeDefn2", function(text)
{
	if( (text[1]==1 && $(text[0]).find('ul').eq(0).find('li').length) || 
		(text[1]==0 && $(text[0]).find('div.lr_dct_sf_sen.vk_txt').length) || 
		(text[1]==0 && $(text[0]).find('div._oDd').length) ||
		(text[1]==0 && $(text[0]).find('div.kno-rdesc').length) )
		
	{
		if(d==true){
			d=false;
			$('#definition').css("border","1px solid #CCC");
			if(text[1]==0){ //Google
				//if($(text[0]).find('div.lr_container')
			
				var respData = $(text[0]).find('div.lr_container');
				respData.find('div.lr_dct_ent_ph').remove();
				respData.find('div.vkc_np').remove();
				respData.find('div.xpdxpnd').eq(respData.find('div.xpdxpnd').length-1).remove();
				//lr_dct_sf_sen
		
				//console.log("Def: Displayed..0");
				if(respData.html() != undefined && respData.html() !="")
					$("#definition").html(removeAnchorTag(replaceNumber(respData.html())));
				else { //console.log("Def: Displayed..2");
				
					if($(text[0]).find('div._oDd').length)
					{
						respData = $(text[0]).find('div._oDd').eq(0).text();
						$('#definition').css("text-align","justify");
						$("#definition").html(removeAnchorTag(replaceNumber(respData)));
					}
					else if($(text[0]).find('div.kno-rdesc').length){
						respData =  $(text[0]).find('div.kno-rdesc').eq(0).text();
						//$('#definition').css("text-align","justify");
						$("#definition").html(removeAnchorTag(replaceNumber(respData)));
					}
					else{
						$('#definition').css("border","0px solid #CCC");
						$("#definition").html("<div class=\"alert\"><strong>Warning!</strong> Meaning could not be found.</div>");
					}
				}
			}
			else{ //WordNet
				//self.port.emit("fetchDefWordNet", [$(text[0]).find('ul').eq(0).find('li').eq(0).text(), data]);
				////console.log(text[0]);
				var ulCount = $(text[0]).find('ul').length;
				var h3Count = $(text[0]).find('h3').length;
				text = removeAnchorTag(text[0]);
		
				if(h3Count == ulCount)
				{
					var count=0;
					var text2="", ulTag;
					while(count < h3Count)
					{
							//ulTag = ($(text[0]).find('ul').eq(count).html()).replace('S:', '');
						text2 += "<h4>"+$(text).find('h3').eq(count).html()+"</h4>"+$(text).find('ul').eq(count).html();
						count++;
					}
					text2 = replaceWordNetChar(text2);
					//console.log("Def: Displayed..1");
					if(text2=="")
					{
						$('#definition').css("border","0px solid #CCC");
						$("#definition").html("<div class=\"alert\"><strong>Warning!</strong> Meaning could not be found.</div>");
					}
					else{ 
						$("#definition").html('<div style="margin:10px;">'+text2+'</div>');
					}
					//$("#definition").html($(text[0]).find('h3').eq(0).html()+$(text[0]).find('ul').eq(0).html()+$(text[0]).find('h3').eq(1).html()+$(text[0]).find('ul').eq(1).html());	
				}
				else
				{
					var text2 = $(text).find('ul').eq(0).html()
					text2 = replaceWordNetChar(text2);
					//console.log("Def: Displayed..2");
					$("#definition").html(text2);
				}
			}
			self.port.on("dispDone");
			self.port.emit("abortReq");
		}
	}else{
		//if(text[3]==1){
			//self.port.emit("findDefn2",[$("#data").val(), 1]);
		//}
		
		$('#definition').css("border","0px solid #CCC");
		$("#definition").html("<div class=\"alert\"><strong>Warning!</strong> Meaning could not be found.</div>");
	}
});

function dispDef(){
	//console.log("Starting dispDef function");
	var data = $("#data").val();
	//$('#setting').hide();
	//$('#about').hide();	
	$('#definition').show();
	if(data.length==0){
		$('#definition').css("border","0px solid #CCC");
		$('#definition').html("<div class=\"alert\"><strong>Warning!</strong> Please enter a word</div>");
	}
	else{
		$('#definition').css("border","0px solid #CCC");
		$('#definition').css("background-color","#F8ECC2");
		$('#definition').html('<i style="color:blue" class="fa fa-circle-o-notch fa-spin fa-2x"></i>');
		////console.log("hi");
		d=true;
		//console.log("Emit find def..");
		self.port.emit("findDefn", [data, 0]);
	}
}

$('#search').click(function(e) 
{
	//console.log("Clicked..");
	dispDef();
	self.port.on("error", function(text)
	{
		if(text==2)
			$("#definition").html("<div class=\"alert\"><strong>Warning!</strong> Check internet connection.</div>");
		else{
			$("#definition").html("<div class=\"alert\"><strong>Warning!</strong> Check internet connection.</div>");
		}
	});
});

$('#set').click(function(e) {
		e.preventDefault();
		if($("#setting").is(":visible")){	
			$("#setting").hide();
			$("#def").show();
			$("#about").hide();
			$('#data').focus();
		}
		else{
			$("#setting").show();
			$("#def").hide();
			$("#about").hide();
		}
	});

self.port.on("notFound", function(){
	$("#definition").html("<div class=\"alert\"><strong>Warning!</strong> Meaning could not be found.</div>");
});
	
self.port.on("takeSelectionFromTab", function(text){
	//console.log("takeSelectionFromTab catched");
	text = text.replace(/^\s+|\s+$/g, '');
	//console.log("In panel "+text.length);
	if(text.indexOf(' ')!=-1){
		//Select one word
	//	console.log("1");
		$("#data").val("");
		$('#definition').css("border","0px solid #CCC");
		$('#definition').html("<div class=\"alert\"><strong>Warning!</strong> Please select one word</div>");
	}
	else if(text.length!=0 && text!='' && text!=undefined ){
	//	console.log("2");
		$("#data").val(text);
		$("#search").click();
	}
	else if($("#data").val() == ""){
	//	console.log("3");
		$("#data").val("");
		$('#setting').hide();
		$('#about').hide();
		$('#definition').css("border","0px solid #CCC");
		$('#definition').html('<i class="tipDetail"><u class="tip">Tip:</u> Select any word from webpage and click ASKIt add-on icon on toolbar to view the meaning.</i>');
		$('#def').show();
	}
});

self.port.on("panelLoad", function(){
		//console.log("Loading panel..");
		d=true;
		//self.port.emit("getSelectionFromTab");
		self.port.emit("closeBubble");
		$('#setting').hide();
		$('#about').hide();
		$('#def').show();
		$('#data').focus();
	});
	
$(document).ready(function(){    
	$('#setting').hide();
	$('#about').hide();
	//$('#definition').hide();
	//$('#definition').css({"max-height":"200px","overflow-y":"auto", "padding":"10px"});
	
});

		
	$('#data').keypress(function(event){
 
		var keycode = (event.keyCode ? event.keyCode : event.which);
		if(keycode == '13'){
			dispDef();
		}
	 
	});	
	
	$('#info').click(function() {
		//self.port.emit("aboutOpen");
		
		if($("#about").is(":visible")){	
			$("#setting").hide();
			$("#def").show();
			$("#about").hide();
			$('#data').focus();
		}
		else{
			$("#setting").hide();
			$("#def").hide();
			$("#about").show();
			$('#details').css({"background-color":"#F6F2D4", "padding":"10px", "border":"1px solid #CCC"});
			$('#details').html('<div>\
						<p><u>Created By:</u> Shashidhara and Alwyn Edison Mendonca</p>\
						<p><u>Contributions By:</u> Ashwin Loyal Mendonca</p>\
						Copyright 2014-2015 ASK-DEV.Inc<br />\
						All Rights Reserved<br />\
						Released under the GPL license\
					</div>');
		}
	});
					
	$('#version').click(function() {
		$('#details').css({"background-color":"#F6F2D4", "padding":"10px", "border":"1px solid #CCC"});
		$('#details').html('<div>\
							<b>ASKIt 0.3.3</b>\
								<ol class="noType">\
									<li><span class="label label-warning">FIXED</span> Minor bug Fixes </li>\
                            	</ol>\
                            <b>ASKIt 0.3.1</b>\
								<ol class="noType">\
									<li><span class="label label-warning">FIXED</span> Many bug Fixes </li>\
                            	</ol>\
							<b>ASKIt 0.3</b>\
								<ol class="noType">\
									<li><span class="label label-success">NEW</span> `Smart Search` is default now instead Google - Combination of Google and WordNet. </li>\
									<li><span class="label label-info">CHANGED</span> UI Improvement for ASKIt Panel. </li>\
                            	</ol>\
							<b>ASKIt 0.2.2</b>\
								<ol class="noType">\
									<li><span class="label label-warning">FIXED</span> ASKIt add-on in private window. </li>\
                            	</ol>\
							<b>ASKIt 0.2.1</b>\
								<ol class="noType">\
									<li><span class="label label-warning">FIXED</span> Power button issue. </li>\
									<li><span class="label label-warning">FIXED</span> Bubble display postion above and below the word. </li>\
									<li><span class="label label-warning">FIXED</span> WordNet search result in ASKIt panel. </li>\
									<li><span class="label label-info">CHANGED</span> Many changes to the bubble UI. </li>\
									<li><span class="label label-warning">FIXED</span> Many more bug fixes. </li>\
                            	</ol>\
							<b>ASKIt 0.2</b>\
                                <ol class="noType">\
                                	<li><span class="label label-success">NEW</span>  Redesigned ASKIt panel. </li>\
                                    <li><span class="label label-success">NEW</span> ASKIt panel provides option to search meaning in detail. </li>\
                                    <li><span class="label label-success">NEW</span>  Select the word to see the meaning in ASKIt panel. </li>\
                                    <li><span class="label label-success">NEW</span> UI improvements to ASKIt bubble. </li>\
                                   	<li><span class="label label-warning">FIXED</span> Many more bug fixes. </li>\
                                </ol>\
							<b>ASKIt 0.1.1</b>\
                                <ol class="noType">\
                                    <li><span class="label label-warning">FIXED</span> Add-on enabling and disabling(on/off) issue. </li>\
                                </ol>\
							<b>ASKIt 0.1</b>\
							<ol class="noType">\
								<li><span class="label label-success">NEW</span> ASKIt fetches meaning from Google and WordNet.</li>\
								<li><span class="label label-success">NEW</span> Add-on icon changes its behavior while turning it off and on. </li>\
							</ol>\
						</div>');
	});
					
	$('#guide').click(function() {
		$('#details').css({"background-color":"#F6F2D4", "padding":"10px", "border":"1px solid #CCC"});
		$('#details').html('<div>\
		<span>This add-on is helpful to view the meanings easily as you browse the websites.</span>\
		<br /><u>Note:</u>\
		<ul>\
			<li>Your computer must be connected to Internet for the Add-on to work.</li>\
 			<li>If the ASKIt add-on is not working for you, please make sure it\'s up to date. Visit www.theaskdev.com, and download recent ASKIt add-on.</li>\
		</ul>\
		How to use ASKIt?\
		<ol>\
			<li>You can turn on and off the add-on, under add-on menu.</li>\
			<li>Under add-on menu you can choose required dictionary to fetch meaning, default `Smart Search` is selected. Right now "Google" and "WordNet" are optional. </li>\
			<li>Double-click on any word to view its meaning in a small pop-up bubble. In bubble "more" link is provided to visit the related website to check meaning.</li>\
		</ol></div>');
	});
	
	var on=true;

	$('#onoff').click(function() {
		on=!on;
		////console.log(on);
		if(on){
			self.port.emit("onIt");
			$('#onoff').css("color","green");
		}
		else{
			self.port.emit("offIt");
			$('#onoff').css("color","#D14237");
		}
		////console.log(this.checked);
	});
	
	$('#searchLink1').click(function() {
		self.port.emit("set1");
	});
	
	$('#searchLink0').click(function() {
		self.port.emit("set0");
	});
	
	$('#searchLink2').click(function() {
		self.port.emit("set2");
	});
