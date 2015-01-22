var g = {
	DEFAULT_CHAT_TEXT : "Type chat message here..."
}

function arrowKeyPressed(deltaX, deltaY) {
	var whatToMove, leftWas, topWas;
	whatToMove = $('#localViewInner div:not("#me")');
	whatToMove.each(function() {
		leftWas = parseInt($(this).css("left"));
		topWas = parseInt($(this).css("top"));
		$(this).css("left", leftWas - deltaX * 32);
		$(this).css("top", topWas - deltaY * 32);
	});
}

function sendMessage(target) {
	$(target).val("");
}

$(document).keydown(function (event) {
	switch (event.keyCode) {
	case 37:
		arrowKeyPressed(-1,0);
		break;
	case 38:
		arrowKeyPressed(0,-1);
		break;
	case 39:
		arrowKeyPressed(1,0);
		break;
	case 40:
		arrowKeyPressed(0,1);
		break;
	default:
		return true;
	}
	return false;
});

$(document).ready(function () {
	  $("#chatTabs").tabs();
	  $(".chatInput").val(g.DEFAULT_CHAT_TEXT);
	  $(".chatInput").focus(function () {
		  $(this).removeClass("notEmpty");
		  if ($(this).val() === g.DEFAULT_CHAT_TEXT) {
			  $(this).val("");
		  }
	  }).blur(function () {
		  if ($(this).val().trim() === "") {
			  $(this).val(g.DEFAULT_CHAT_TEXT);
		  } else {
			  $(this).addClass("notEmpty");
		  }
	  }).keydown(function (event) {
		  if (event.keyCode === 13) {
			  sendMessage($(this));
		  }
	  });
});