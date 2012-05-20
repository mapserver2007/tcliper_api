// ==UserScript==
// @author           tcliper_admin
// @name             tcliper
// @namespace        http://summer-lights.dyndns.ws/tcliper/
// @include          http://*
// @description      tcliper script
// @version          0.1.0
// ==/UserScript==
(function(w){
var KEYCODE = 113;
var SEND_TO = "http://localhost:3001/clip/";
var API_KEY = "cea74fcb67af64f41e209a8c47cbed0c4b13cf2e3d8469805c11406dc46ffdc5";

w.document.onkeypress = setKeyEvent;

function execExtract(){
	var range = {}, extract_text = "";
	try{
		range.obj = w.getSelection().getRangeAt(0);
		range.fragment = document.createDocumentFragment();
		range.html = document.createElement("span");
		range.html.appendChild(range.obj.cloneContents());
		extract_text = range.html.textContent;
	}
	catch(err){
		//alert(err);
	}

	return extract_text;
}

function sendClipData(title, url, comment){
	GM_xmlhttpRequest({
		method: "post",
		url: SEND_TO,
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		data: "title=" + title + "&url=" + url + "&comment=" + comment + "&apikey=" + API_KEY,
		onload: function(res){
			alert(res.responseText);
		},
		onerror: function(res){
			alert(res.status);
		}
	});
}

function setKeyEvent(e){
	var code = e.keyCode != 0 ? e.keyCode : e.charCode;
	if(code == KEYCODE){
		var title   = encodeURIComponent(document.getElementsByTagName("title")[0].innerHTML);
		var url     = encodeURIComponent(location.href);
		var comment = encodeURIComponent(execExtract()) || title;
		sendClipData(title, url, comment);
	}
	else{
		//return false;
	}
}

})(this.unsafeWindow || window);
