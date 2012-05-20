//=============================================================================
// tcliper
//=============================================================================
// @version 0.0.1 2009/08/25 ファーストリリース。GM版tcliperと同等の機能を実装
// @version 0.0.2 2009/09/01 クリップ完了イベントをステータスバー上で表示
// @version 0.0.3 2009/09/07 設定画面でキーイベントを変更に
// @version 0.0.4 2009/09/12 設定画面にタブ(prefpane)を追加、一部bugfix
//=============================================================================

var Tcliper = {
	appVarsion: '0.0.4',
	appName: 'tcliper'
};

Tcliper.init = function(){
	var self = this;
	this.disabled = this.getPref('extensions.tcliper.status');
	window.addEventListener('load', function(){
		gBrowser.addEventListener('DOMContentLoaded', function(){
			document.addEventListener('keypress', self.setKeyEvent, false);
		}, false);
	}, false);
};

Tcliper.showContextMenu = function(){
	this.openConfigManager();
};

Tcliper.switchMode = function(e){
	if(e.button != 0) return;
	this.disabled = this.disabled === true ? false : true;
	this.setPref('extensions.tcliper.status', this.disabled);
	this.switchIcon();
};

Tcliper.switchIcon = function(){
	document.getElementById('tcliperPanel')
		.setAttribute('class', (this.disabled ? 'tcliperPanelImageOff' : 'tcliperPanelImageOn'));
};

Tcliper.extractComment = function(){
	var comments = [], comment;
	var sel = window.content.getSelection();
	for(var i = 0; i < sel.rangeCount; i++){
		comment = sel.getRangeAt(i).toString().replace(/^\s+|\s+$/g, "");
		comments.push(comment);
	}
	return comments;
};

Tcliper.setKeyEvent = function(e){
	var self = Tcliper;
	var bundle = document.getElementById("tcliper-bundle");
	if(self.disabled){ return; }
	var keycode = e.which;
	var keychar = String.fromCharCode(keycode).toUpperCase();
	var ctrl    = e.ctrlKey;
	var alt     = e.altKey;
	var shift   = e.shiftKey;

	if(
		(keychar == self.getPref('extensions.tcliper.keyevent.pub') || keychar == self.getPref('extensions.tcliper.keyevent.prv')) &&
		ctrl  == self.getPref('extensions.tcliper.keyeventopt.ctrl') &&
		alt   == self.getPref('extensions.tcliper.keyeventopt.alt')  &&
		shift == self.getPref('extensions.tcliper.keyeventopt.shift')
	){
		var is_public = self.getPref('extensions.tcliper.keyevent.pub') ? 1 : 0;
		if(window.content.document.URL.match(/^(https?|ftp)(:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+)$/) == null){
			self.showResult(bundle.getFormattedString("ERROR_MESSAGE_INVALID_URL", [window.content.document.URL]));
			return;
		}
		var params = "title=" + encodeURIComponent(window.content.document.title) +
		             "&url=" + encodeURIComponent(window.content.document.URL) +
		             "&comment=" + (encodeURIComponent(self.extractComment().join('/')) || encodeURIComponent(window.content.document.title)) +
		             "&public=" + is_public +
		             "&apikey=" + self.getPref('extensions.tcliper.apikey') || "";
		self.xhr(params);
	}
};

Tcliper.xhr = function(params){
	var self = this;
	var bundle = document.getElementById("tcliper-bundle");
	var req = new XMLHttpRequest();
	req.open('POST', bundle.getString("TCLIPER_POST_URL"), true);
	req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	req.setRequestHeader('User-Agent', this.appName + '/' + this.appVersion);
	req.setRequestHeader('Content-Length', params.length);
	req.onreadystatechange = function(){ if(req.readyState == 4 && req.status == 200) self.showResult(req.responseText); };
	req.send(params);
};

Tcliper.showResult = function(message){
	var self = this;
	this.statusLabel = document.getElementById('tcliperStatusLabel');
	this.statusLabel.value = message;
	if(this.statusLabel.collapsed) this.statusLabel.collapsed = false;
	var box = document.createElement('vbox');
	var label = document.createElement('label');
	label.setAttribute('value', message + " ");
	box.style.position = 'fixed';
	box.style.left = "-10000px";
	box.style.top = "10000px";
	box.appendChild(label);
	document.documentElement.appendChild(box);
	this.labelWidth = label.boxObject.width;
	this.startAnimation();
};

Tcliper.startAnimation = function(){
	var self = this;
	var onend = function(){ return function(){ self.autoHideTimer = window.setTimeout(self.endAnimation, 3000); }; };
	var showAnimation = new Accelimation(this.statusLabel.style, "width", this.labelWidth, 300, 2, "px");
	showAnimation.onend = onend();
	showAnimation.start();
};

Tcliper.endAnimation = function(){
	var self = Tcliper;
	var onend = function(){ return function(){ self.statusLabel.collapsed = true; }; };
	var hideAnimation = new Accelimation(self.statusLabel.style, "width", 0, 300, 2, "px");
	hideAnimation.onend = onend();
	hideAnimation.start();
	window.clearTimeout(self.autoHideTimer);
};

Tcliper.openConfigManager = function(){
	window.openDialog('chrome://tcliper/content/manage.xul', '', 'chrome,titlebar,toolbar,centerscreen,modal');
};

Tcliper.duplicateCheckKeyEvent = function(){
	var bundle = document.getElementById("tcliper-bundle");
	var selected_key = function(id){
		var items = document.getElementById(id).firstChild.childNodes;
		var key;
		for(var i = 0; i < items.length; i++){
			if(items[i].selected) key = items[i].value;
		}
		return key;
	};
	if(selected_key('tcliperManageKeyEventPublic') == selected_key('tcliperManageKeyEventPrivate')){
		alert(bundle.getString("ERROR_MESSAGE_DUPLICATE_KEY"));
		return false;
	}
	else{
		return true;
	}
};

Tcliper.moveHomePage = function(){
	var bundle = document.getElementById("tcliper-bundle");
	gBrowser.selectedTab = gBrowser.addTab(bundle.getString("TCLIPER_HOME_URL"));
};

Tcliper.setPref = function(prefName, value){
	var PREF = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService).getBranch("");
	switch(typeof value){
	case 'string':
		var nsISupportsString = Components.interfaces.nsISupportsString;
		var string = Components.classes['@mozilla.org/supports-string;1'].createInstance(nsISupportsString);
		string.data = value;
		PREF.setComplexValue(prefName, nsISupportsString, string);
		break;
	case 'number':
		PREF.setIntPref(prefName, parseInt(value));
		break;
	default:
		PREF.setBoolPref(prefName, value);
		break;
	}
};

Tcliper.getPref = function(prefName){
	var PREF = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService).getBranch("");
	var type = PREF.getPrefType(prefName);
	switch(type){
	case PREF.PREF_STRING:
		var nsISupportsString = Components.interfaces.nsISupportsString;
		return PREF.getComplexValue(prefName, nsISupportsString).data;
		break;
	case PREF.PREF_INT:
		return PREF.getIntPref(prefName);
		break;
	case PREF.PREF_BOOL:
		return PREF.getBoolPref(prefName);
		break;
	default:
		return;
		break;
	}
};