
self.on('message', function onMessage(text) {
	var result="";
	if(text==0)
		result = "Sorry.. Meaning not found.";
	else{
  		result = $(text).find('ul').eq(0).text();
  	}
  	document.getElementById('mean').innerHTML = result;
  	self.port.emit('show', result);
});
