(function() {

var Gui = Solomon.Gui = {};
var speak = Solomon.Middleware.speak;
var teamChat = Solomon.Middleware.teamChat;
var offerMap = Solomon.Middleware.offerMap = {};
var shareMaps = Solomon.Middleware.shareMaps;

Gui.g = {
	DEFAULT_CHAT_TEXT : "Type chat message here...",
	OFFSET_X : 7,
	OFFSET_Y : 5,
	revealedMap : []
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

Gui.playerMoved = function (player, map) {
	var playerX, playerY, startX, startY, topCornerX, topCornerY, i, j, bottomCornerX, bottomCornerY;
	if (typeof player.x === 'undefined') {
		return;
	}
	playerX = player.x;
	playerY = player.y;
	
	topCornerX = playerX - Gui.g.OFFSET_X;
	topCornerY = playerY - Gui.g.OFFSET_Y;
	bottomCornerX = playerX + Gui.g.OFFSET_X + 1;
	bottomCornerY = playerY + Gui.g.OFFSET_Y + 1;
	
	for (j = topCornerY; j < bottomCornerY; j++) {
		for (i = topCornerX; i < bottomCornerX; i++) {
			Gui.g.revealedMap[j][i] = map[i][j];
			Gui.context.fillRect(i * 5, j * 5, 5, 5);
		}
	}
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

function changePlayer(changeType, item) {
	switch (changeType) {
	case 'added':
		$("#localViewInner").append("<div id='" + item._id + "' class='character' style='left: 224px; top: 160px; background-color: orange'>" + item.username + "</div>");
		if (item._id === Meteor.userId()) {
			//Gui.playerMoved(Meteor.user(), Solomon.maze.findOne("world").map);
		}
		break;
	case 'changed':
		$("##{item._id}");
		if (item._id === Meteor.userId()) {
			Gui.playerMoved(Meteor.user(), Solomon.maze.findOne("world").map);
		}
		break;
	case 'removed':
		$("##{item._id}").remove();
		break;
	}
}

changeTypes = {
	speech: Gui.receiveMessage,
	teamChat: null,
	mapTile: null,
	player: changePlayer
};

Gui.handleDataChange = function (changeType, item) {
	var ch = changeTypes[item.type];
	
	if (ch) ch(changeType, item);
};

Gui.onLogin = function () {
};

Gui.receiveMapShareRequest = function (user) {
	$(".shareName").text(user.username);
	$("#dialog-agree-to-share").dialog({
		resizable: false,
		height: 200,
		modal: true,
		buttons: {
			"Agree": function() {
				shareMaps(user);
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

Gui.askToShareMaps = function (event, ui) {
	$(".shareName").text(ui.target.text());
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
	var map, i, j;
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
	map = Solomon.maze.findOne("world").map
	Gui.g.revealedMap = [];
	for (i = 0; i < map.length; i++) {
		Gui.g.revealedMap[i] = [];
		for (j = 0; j < map[i].length; j++) {
			Gui.g.revealedMap[i][j] = null;
		}
	}
	
});
})();
