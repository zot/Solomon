(function() {

var Gui = Solomon.Gui = {};
var speak = Solomon.Middleware.speak;
var teamChat = Solomon.Middleware.teamChat;
var offerMap = Solomon.Middleware.offerMap = {};

Gui.g = {
	DEFAULT_CHAT_TEXT : "Type chat message here..."
};

Gui.arrowKeyPressed = function (deltaX, deltaY) {
	var whatToMove, leftWas, topWas;
	whatToMove = $('#localViewInner div:not("#me")');
	whatToMove.each(function() {
		leftWas = parseInt($(this).css("left"));
		topWas = parseInt($(this).css("top"));
		$(this).css("left", leftWas - deltaX * 32);
		$(this).css("top", topWas - deltaY * 32);
	});
};

Gui.sendMessage = function (target) {
	if (target.parent().attr("id") === "speak") {
		speak(target.val());
	} else {
		teamChat(target.val());
	}
	target.val("");
};

function ownsItem(item) {
	return item.owner == Meteor.userId();   
}

Gui.receiveMessage = function (changeType, item) {
	if (ownsItem(item)) {
		if (changeType != 'added') {
			console.log("Message change: ", changeType);
		} else {
			var chatBox, content, from, newDiv;
			
			if (item.type === 'speech') {
				chatBox = $('#speak .chatBody');
			} else {
				chatBox = $('#teamChat .chatBody');
			}
			from = Solomon.maze.findOne(item.from);
			content = item.content;
			newDiv = $("<div></div>");
			newDiv.html("<span class='chatName'>" + from.username + ":</span> " + content);
			chatBox.append(newDiv);
			chatBox.scrollTop(1E10);
		}
	}
};

changeTypes = {
	speech: Gui.receiveMessage,
	teamChat: null,
	mapTile: null,
	player: null
};

Gui.handleDataChange = function (changeType, item) {
	var ch = changeTypes[item.type];
	
	if (ch) ch(changeType, item);
};

Gui.onLogin = function () {
};

Gui.askToShareMaps = function (event, ui) {
	$("#shareName").text(ui.target.text());
	$("#dialog-confirm-share").dialog({
		resizable: false,
		height: 200,
		modal: true,
		buttons: {
			"Ask to share maps": function() {
				offerMap();
				console.log("yes");
				$( this ).dialog( "close" );
			},
			Cancel: function() {
				console.log("no");
				$( this ).dialog( "close" );
			}
		},
		width: 600
	});
};

$(document).keydown(function (event) {
	switch (event.keyCode) {
	case 37:
		Gui.arrowKeyPressed(-1,0);
		break;
	case 38:
		Gui.arrowKeyPressed(0,-1);
		break;
	case 39:
		Gui.arrowKeyPressed(1,0);
		break;
	case 40:
		Gui.arrowKeyPressed(0,1);
		break;
	default:
		return true;
	}
	return false;
});

$(document).ready(function () {
	  $("#chatTabs").tabs();
	  $(".chatInput").val(Gui.g.DEFAULT_CHAT_TEXT);
	  $(".chatInput").focus(function () {
		  $(this).removeClass("notEmpty");
		  if ($(this).val() === Gui.g.DEFAULT_CHAT_TEXT) {
			  $(this).val("");
		  }
	  }).blur(function () {
		  if ($(this).val().trim() === "") {
			  $(this).val(Gui.g.DEFAULT_CHAT_TEXT);
		  } else {
			  $(this).addClass("notEmpty");
		  }
	  }).keydown(function (event) {
		  if (event.keyCode === 13) {
			  Gui.sendMessage($(this));
		  }
	  });
	  $(".statsSection").contextmenu({
		  delegate: ".personStats",
		  menu: [
		         {title: "Share map", cmd: "share", uiIcon: "ui-icon-copy", action: Gui.askToShareMaps}
		  ]	  
	  });
	  Gui.canvasElem = $('#map');
	  Gui.canvasElem.attr("height", Gui.canvasElem.height());
	  Gui.canvasElem.attr("width", Gui.canvasElem.width());
	  Gui.context = Gui.canvasElem[0].getContext("2d");
	  Solomon.Gui.context.fillStyle = '#000';
});
})();
