
$(document).ready(function(){    

	$('#about').click(function() {
		self.port.emit("aboutOpen");
	});

	$('#askitEnable').click(function() {
		if(this.checked)
			self.port.emit("onIt");
		else
			self.port.emit("offIt");
		console.log(this.checked);
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
