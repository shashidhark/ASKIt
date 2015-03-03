
self.on('message', function onMessage(text) {
	if(text==0)
		document.getElementById('mean').innerHTML="Sorry.. Meaning not found.";
	else
  		document.getElementById('mean').innerHTML=$(text).find('ul').html();
});
