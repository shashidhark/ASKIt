
self.on('message', function onMessage(text) {
	var result="";
	if(text[0]==0)
		result = "Meaning Could not be found for "+text[1];
	else{
		//result=$(text).text();
  		result = $(text[1]).find('ul').eq(0).text();
  		//result = $(text).find('div[class=vk_ans]').eq(0).text();
  		//result = result.match(/\(([^)]+)\)/)[1];
  	}
  	document.getElementById('mean').innerHTML = result;
  	self.port.emit('show', result);
});
