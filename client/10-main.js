(function() {
var Gui = Solomon.Gui = {};
var speak = Solomon.Middleware.speak;
var teamChat = Solomon.Middleware.teamChat;
var offerMap = Solomon.Middleware.offerMap = {};
var tileSize = 0;
var viewPortWidth = null;
var viewPortHeight = null;
var mapWidth;
var mapHeight;

Gui.setMapSize = function(width, height) {
	mapWidth = width;
	mapHeight = height;
}

Gui.g = {
	DEFAULT_CHAT_TEXT : "Type chat message here...",
	OFFSET_X : 7,
	OFFSET_Y : 5,
	PLAYER_WIDTH: 32,
	PLAYER_HEIGHT: 32,
	revealedMap : []
};

Gui.arrowKeyPressed = function (deltaX, deltaY) {
	Solomon.user.x += deltaX;
	Solomon.user.y += deltaY;
	Solomon.maze.update(Solomon.user._id, Solomon.user);
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
	playerX = player.X;
	playerY = player.Y;
	
	topCornerX = playerX - Gui.g.OFFSET_X;
	topCornerY = playerY - Gui.g.OFFSET_Y;
	bottomCornerX = playerX + Gui.g.OFFSET_X + Gui.g.PLAYER_WIDTH;
	bottomCornerY = playerY + Gui.g.OFFSET_Y + Gui.g.PLAYER_HEIGHT;
	
	for (j = topCornerY; j < bottomCornerY; j++) {
		for (i = topCornerX; i < bottomCornerX; i++) {
			revealedMap[j][i] = map[i][j];
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
	if (viewPortWidth == null) {
		if (!getSizes()) return;
	}
	switch (changeType) {
	case 'added':
		if ($('#' + item._id).length == 0) {
			$("#world").append("<div id='" + item._id + "' class='character' style='left: 224px; top: 160px; background-color: orange'>" + item.username + "</div>");
		}
		updatePlayer(item);
		break;
	case 'changed':
		updatePlayer(item);
		break;
	case 'removed':
		$("##{item._id}").remove();
		break;
	}
}

function getSizes() {
	if ($('#world:first').length) {
		tileSize = $('#world:first')[0].offsetWidth;
		viewPortWidth = $('#localViewInner').innerWidth();
		viewPortHeight = $('#localViewInner').innerWidth();
		return true;
	}
	return false;
}

function updatePlayer(item) {
	var el = $('#' + item._id);
	var itemX = item.x * tileSize;
	var itemY = item.y * tileSize;

	console.log("updating player: " + item.username);
	el.css('left', itemX + 'px').css('top', itemY + 'px');
	if (item._id == Meteor.userId()) {
		var offset = tileSize / 2;
		//var worldX =  Math.max(viewPortWidth - mapWidth, Math.min(0, (itemX - viewPortWidth / 2 - offset)));
		//var worldY = Math.max(viewPortHeight - mapHeight, Math.min(0, (itemY - viewPortHeight / 2 - offset)));
		var worldX = viewPortWidth / 2 - (itemX + offset);
		var worldY = viewPortHeight / 2 - (itemY + offset);

		$("#world").css('left', worldX + 'px').css('top', worldY + 'px');
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
	  for (var i in Solomon.Middleware.players) {
		  var player = Solomon.Middleware.players[i];

		  changePlayer('added', player);
	  }
});

Gui.changePlayer = changePlayer;
})();
