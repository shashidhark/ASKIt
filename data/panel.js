
//For WordNet, Fetch Def
function extractDef(str){
	/*var regex = /[^\(]*(\(.*\))[^\)]/;
	
	str=str.substring(7);
	
    var res = str.match(regex);
    if(res!=null)
	    return res[1].substring(1, res[1].length-1);
	else
		return "";*/
	//console.log("Data: "+str);
	var tree = $(str);
	tree=tree.find('div.form').eq(0).html();
	console.log($(tree).text());
	$(tree).find('.key').remove();
	$(tree).find('.pos').remove();
	//return tree.html();
	return tree;
}

function removeAnchorTag(text){
	return (text.replace(/<a\b[^>]*>/ig,"")).replace(/<\/a>/ig, "");
}

//First letter upper
function firstUC(word){
	return word.substring(0,1).toUpperCase() + word.substring(1);
}

$(document).ready(function(){    
	$('#setting').hide();
	$('#about').hide();
	//$('#definition').hide();
	//$('#definition').css({"max-height":"200px","overflow-y":"auto", "padding":"10px"});
	self.port.on("panelLoad", function(){
		$('#setting').hide();
		$('#about').hide();
		$('#def').show();
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
	
	$("#set").hover(function(e){
		$("#gear").attr("class","fa fa-cog fa-1x fa-spin");
	});
	
	$("#set").mouseout(function(e){
		$("#gear").attr("class","fa fa-cog fa-1x");
	});
		
		
	function dispDef(){
		var data = $("#data").val();
		//$('#setting').hide();
		//$('#about').hide();	
		$('#definition').show();
		if(data.length==0){
			$('#definition').html("Please enter a word");
		}
		else{
			$('#definition').css("border","0px solid #CCC");
			$('#definition').html('<i style="color:blue" class="fa fa-circle-o-notch fa-spin fa-2x"></i>');
			//console.log("hi");
	
			self.port.emit("findDefn", data);
			self.port.on("takeDefn", function(text){
				$('#definition').css("border","1px solid #CCC");
				if(text[1]==0){
					//$("#definition").html(firstUC($(text[0]).find('div.lr_dct_ent').eq(0).find('span').eq(0).text()));
					//text[0]=$(text[0]).attr('href', ''); //Remove href of anchor tag
					//console.log(text[0]);
					//console.log(removeAnchorTag($(text[0]).find('div.lr_container').eq(0).find('ol').eq(0).html()));
					//$("#definition").html($(removeAnchorTag(text[0])).find('div.lr_container').eq(0).find('ol').eq(0).html());
					$("#definition").html($(removeAnchorTag(text[0])).find('div.lr_container').eq(0).html());
				}
				else{
					//self.port.emit("fetchDefWordNet", [$(text[0]).find('ul').eq(0).find('li').eq(0).text(), data]);
					//console.log(text[0]);
					$("#definition").html(extractDef(text[0]));	
				}
			});
		}
	}
	
	$('#data').keypress(function(event){
 
		var keycode = (event.keyCode ? event.keyCode : event.which);
		if(keycode == '13'){
			dispDef();
		}
	 
	});	
			
	$('#search').click(function(e) {
		dispDef();
		self.port.on("error", function(text){
			$("#definition").html("Check internet connection.");
		});
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
							<b>ASKIt 0.1</b>\
							<ol>\
								<li>ASKIt fetches meaning from Google and WordNet.\
								<li>Add-on icon changes its behavior while turning it off and on. </li>\
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
		//console.log(on);
		if(on){
			self.port.emit("onIt");
			$('#onoff').attr("class","btn btn-success");
		}
		else{
			self.port.emit("offIt");
			$('#onoff').attr("class","btn btn-danger");
		}
		//console.log(this.checked);
	});
	
	$('#searchLink1').click(function() {
		self.port.emit("getLocalStorage");
		var prefs_data = new Object;
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
		prefs_data.searchLink		 	= 0;
		self.port.emit('save', prefs_data);
		//console.log("google");
	});
	
	$('#searchLink2').click(function() {
		self.port.emit("getLocalStorage");
		var prefs_data = new Object;
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
		prefs_data.searchLink		 	= 1;
		self.port.emit('save', prefs_data);
		//console.log("wordnet");
	});
});
