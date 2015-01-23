(function() {
var Gui = Solomon.Gui = {};
var speak = Solomon.Middleware.speak;
var teamChat = Solomon.Middleware.teamChat;
var offerMap = Solomon.Middleware.offerMap = {};
var clampWidth = null;
var clampHeight = null;
var movePlayer = null;
var tileSize = 0;
var viewPortWidth = null;
var viewPortHeight = null;
var mapWidth;
var mapHeight;

Gui.setMapSize = function(width, height) {
	mapWidth = width;
	mapHeight = height;
}

var shareMaps = Solomon.Middleware.shareMaps;

Gui.g = {
	DEFAULT_CHAT_TEXT : "Type chat message here...",
	OFFSET_X : 4,
	OFFSET_Y : 3,
	revealedMap : [],
	rgbMap : {
		'e' : '#ddd',
		'f' : '#aaa',
		'p' : '#000',
		'w' : '#000',
		'x' : '#0f0',
		'z' : '#040'
	}
/*
 *	e "empty.png"
	f "floor.png"
	p "pit.png"
	w "wall.png"
	x "exit.png"				
	z "food.png"
 */
};

Gui.arrowKeyPressed = function (deltaX, deltaY) {
	movePlayer(Solomon.user, Solomon.user.x + deltaX, Solomon.user.y + deltaY);
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
	var playerX, playerY, startX, startY, topCornerX, topCornerY, i, j, bottomCornerX, bottomCornerY, playerLocations;
	
	if (typeof player.x === 'undefined' || !Solomon.World.ready) {
		return;
	}
	playerX = player.x;
	playerY = player.y;
	
	topCornerX = clampWidth(playerX - Gui.g.OFFSET_X);
	topCornerY = clampHeight(playerY - Gui.g.OFFSET_Y);
	bottomCornerX = clampWidth(playerX + Gui.g.OFFSET_X) + 1;
	bottomCornerY = clampHeight(playerY + Gui.g.OFFSET_Y) + 1;

	if (Gui.g.revealedMap.length) {
		playerLocations = _.map(Solomon.Middleware.players, function(v) {
			return v._id === Meteor.userId() ? null : {x: v.x, y: v.y};
		});
		for (j = topCornerY; j < bottomCornerY; j++) {
			for (i = topCornerX; i < bottomCornerX; i++) {
				//Gui.g.revealedMap[j][i] = map[i][j];
				Gui.g.revealedMap[j][i] = map[j][i];
				/*
				 *	e "empty.png"
				 f "floor.png"
				 p "pit.png"
				 w "wall.png"
				 x "exit.png"				
				 z "food.png"
				 */
				
				Gui.context.fillStyle = playerX == i && playerY == j ? '#f00' : Gui.g.rgbMap[map[j][i]] || '#000';				
				
				_.each(playerLocations, function (v) {
					if (v && v.x === i && v.y === j) {
						Gui.context.fillStyle = '#00f';
					}
				});
				
				Gui.context.fillRect(i * 5, j * 5, 5, 5);
			}
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

function validView() {
	return viewPortWidth != null || getSizes();
}

function changePlayer(changeType, item) {
	switch (changeType) {
	case 'added':
		Solomon.players[item._id] = item;
		if (validView()) {
			if ($('#' + item._id).length == 0) {
				if (item.image) {
					$("#world").append("<image id='" + item._id + "' class='character' style='left: 224px; top: 160px' src='players/" + item.image + "'>");
				} else {
					$("#world").append("<div id='" + item._id + "' class='character' style='left: 224px; top: 160px; background-color: orange'>" + item.username + "</div>");
				}
			}
			updatePlayer(item);
		}
		break;
	case 'changed':
		Solomon.players[item._id] = item;
		validView() && updatePlayer(item);
		break;
	case 'removed':
		delete Solomon.players[item._id];
		validView() && $("#" + item._id).remove();
		break;
	}
}

function getSizes() {
	if ($('#world:first').length) {
		tileSize = $('#world').children().children()[0].offsetWidth;
		viewPortWidth = $('#localViewInner').innerWidth();
		viewPortHeight = $('#localViewInner').innerWidth();
		return true;
	}
	return false;
}

function updatePlayer(item) {
	var el = $('#' + item._id);
	var itemX = item.x * tileSize + (tileSize - el.width()) / 2;
	var itemY = item.y * tileSize + (tileSize - el.height()) / 2;

	console.log("updating player: " + item.username);
	el.css('left', itemX + 'px').css('top', itemY + 'px');
	if (item._id == Meteor.userId()) {
		var worldX = viewPortWidth / 2 - (item.x + 0.5) * tileSize;
		var worldY = viewPortHeight / 2 - (item.y + 1.5) * tileSize;
		$("#world").css('left', worldX + 'px').css('top', worldY + 'px');
	}
	Gui.playerMoved(item, Solomon.maze.findOne("world").map);
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

Gui.toggleSound = function () {
	if ($('#regularBackground')[0].paused) {
		document.getElementById('regularBackground').play();
	} else {
		document.getElementById('regularBackground').pause();
	}
}

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
	  $('#toggleSound').click(Gui.toggleSound);
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
	//Gui.context.scale(1, -1);
	//Gui.context.translate(0, -Gui.canvasElem.height());
	  Solomon.Gui.context.fillStyle = '#000';
});

Solomon.onStart(function() {
	var i;
	var p = Solomon.maze.find({type: 'player'}).fetch();

	for (i = 0; i < p.length; i++) {
		Solomon.players[p[i]._id] = p[i];
	}
	clampWidth = Solomon.World.clampWidth;
	clampHeight = Solomon.World.clampHeight;
	movePlayer = Solomon.World.movePlayer;
	map = Solomon.maze.findOne("world").map;
	Gui.g.revealedMap = [];
	for (i = 0; i < map.length; i++) {
		var n = [];
		Gui.g.revealedMap.push(n);
		for (var j = 0; j < map[i].length; j++) {
			n.push(null);
		}
	}
	for (i in Solomon.players) {
		var player = Solomon.players[i];

		changePlayer('added', player);
	}
});

Gui.changePlayer = changePlayer;
})();
