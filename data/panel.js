/*
|===============================================================================
|		Last Modified Date 	: 26/03/2015
|===============================================================================
|		Copyright 2014-2015 ASK-DEV.Inc. All Rights Reserved. Released under the GPL license
|		Developed by 	: Shashidhar and Alwyn Edison Mendonca
|		WebSite 		: http://www.theaskdev.com
|===============================================================================
*/

var d=true;
function replaceNumber(text){
	return text.replace(/<strong>\d*<\/strong>./g, '');
}

function replaceWordNetChar(text){
	return text.replace(/(S:)|(\(v\))|(\(n\))/g, '');
}

function removeAnchorTag(text){
	return (text.replace(/<a\b[^>]*>/ig,"")).replace(/<\/a>/ig, "");
}

//First letter upper
function firstUC(word){
	return word.substring(0,1).toUpperCase() + word.substring(1);
}
	
self.port.on("takeDefn", function(text)
{
	if(((text[1]==1 && $(text[0]).find('ul').eq(0).find('li').length) || (text[1]==0 && $(text[0]).find('div.lr_dct_sf_sen.vk_txt').length)) && d==true)
	{
		d=false;
		$('#definition').css("border","1px solid #CCC");
		if(text[1]==0){
			var respData = $(text[0]).find('div.lr_container');
			respData.find('div.lr_dct_ent_ph').remove();
			respData.find('div.vkc_np').remove();
			respData.find('div.xpdxpnd').eq(respData.find('div.xpdxpnd').length-1).remove();
			//lr_dct_sf_sen
		
			//console.log("Def: Displayed..0");
			if(respData.html() != undefined && respData.html() !="")
				$("#definition").html(removeAnchorTag(replaceNumber(respData.html())));
			else {
				$('#definition').css("border","0px solid #CCC");
				$("#definition").html("<div class=\"alert\"><strong>Warning!</strong> Meaning could not be found.</div>");
			}
		}
		else{
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
					$("#definition").html(text2);
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
});

function dispDef(){
	//console.log("Starting dispDef function");
	var data = $("#data").val();
	//$('#setting').hide();
	//$('#about').hide();	
	$('#definition').show();
	if(data.length==0){
		$('#definition').html("<div class=\"alert\"><strong>Warning!</strong> Please enter a word</div>");
	}
	else{
		$('#definition').css("border","0px solid #CCC");
		$('#definition').html('<i style="color:blue" class="fa fa-circle-o-notch fa-spin fa-2x"></i>');
		////console.log("hi");
		d=true;
		//console.log("Emit find def..");
		self.port.emit("findDefn", data);
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
			$("#definition").html("<div class=\"alert\"><strong>Warning!</strong> It's taking too much time to load.</div>");
		}
	});
});

$('#set').click(function(e) {
		e.preventDefault();
		if($("#setting").is(":visible")){	
			$("#setting").hide();
			$("#def").show();
			$("#about").hide();
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
	if(text!='' && text != undefined && text!=0){
		$("#data").val(text);
		$("#search").click();
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
	});
	
$(document).ready(function(){    
	$('#setting').hide();
	$('#about').hide();
	//$('#definition').hide();
	//$('#definition').css({"max-height":"200px","overflow-y":"auto", "padding":"10px"});
	
});

$("#set").hover(function(e){
		$("#gear").attr("class","fa fa-cog fa-1x fa-spin");
	});
	
	$("#set").mouseout(function(e){
		$("#gear").attr("class","fa fa-cog fa-1x");
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
		}
		else{
			$("#setting").hide();
			$("#def").hide();
			$("#about").show();
			$('#details').html('<div class="well">\
						<p><u>Created By:</u> Shashidhara and Alwyn Edison Mendonca</p>\
						<p><u>Contributions By:</u> Ashwin Loyal Mendonca</p>\
						Copyright 2014-2015 ASK-DEV.Inc<br />\
						All Rights Reserved<br />\
						Released under the GPL license\
					</div>');
		}
	});
					
	$('#version').click(function() {
		$('#details').html('<div class="well">\
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
		$('#details').html('<div class="well">\
		<span>This add-on is helpful to view the meanings easily as you browse the websites.</span>\
		<br /><u>Note:</u>\
		<ul>\
			<li>Your computer must be connected to Internet for the Add-on to work.</li>\
 			<li>If the ASKIt add-on is not working for you, please make sure it\'s up to date. Visit www.theaskdev.com, and download recent ASKIt add-on.</li>\
		</ul>\
		How to use ASKIt?\
		<ol>\
			<li>You can turn on and off the add-on, under add-on menu.</li>\
			<li>Under add-on menu you can choose required dictionary to fetch meaning, default Google is selected. Right now another dictionary "WordNet" is supported. </li>\
			<li>Double-click on any word to view its meaning in a small pop-up bubble. In bubble "more" link is provided to visit the related website to check meaning.</li>\
		</ol></div>');
					});
	var on=true;

	$('#onoff').click(function() {
		on=!on;
		////console.log(on);
		if(on){
			self.port.emit("onIt");
			$('#onoff').attr("class","btn btn-success");
		}
		else{
			self.port.emit("offIt");
			$('#onoff').attr("class","btn btn-danger");
		}
		////console.log(this.checked);
	});
	
	$('#searchLink1').click(function() {
		self.port.emit("set1");
	});
	
	$('#searchLink2').click(function() {
		self.port.emit("set2");
	});
