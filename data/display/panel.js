
self.on('message', function onMessage(text) {
  	document.getElementById('mean').innerHTML=$(text).find('ul').html();
	
});
