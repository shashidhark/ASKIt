
var matchedElement = null;
var originalBgColor = null;
var active = false;
var oldMousePosX, oldMousePosY;
var gotText=1;

function resetMatchedElement() {
  if (matchedElement) {
    matchedElement.css('background-color', originalBgColor);
    matchedElement.unbind('click.annotator');
  }
}

self.on('message', function onMessage(activation) {
  //alert(activation);
  active = activation;
  if (!active) {
    resetMatchedElement();
  }
});

function getSelectionText() {
    var text = "";
    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
    }
	return text;
}

$('*').mousedown(function(e) {
    gotText=0;
    oldMousePosX = e.pageX;
    oldMousePosY = e.pageY;
});

$('*').mouseup(function(e) {
	if((oldMousePosX != e.pageX || oldMousePosY != e.pageY) || (window.getSelection || (document.selection && document.selection.type != "Control"))){
		//getSelectionText();
		var text;
		if(gotText==0 && (text=getSelectionText()) != ""){
			self.port.emit('show',[text, oldMousePosX, oldMousePosY]);
			gotText=1;
		}
	}
});

$('*').mouseout(function() {
  //console.log("hello");
  resetMatchedElement();
});
