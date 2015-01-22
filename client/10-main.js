function arrowKeyPressed(deltaX, deltaY) {
	var whatToMove, leftWas, topWas;
	whatToMove = $('#localView div:not("#me")');
	whatToMove.each(function() {
		leftWas = parseInt($(this).css("left"));
		topWas = parseInt($(this).css("top"));
		$(this).css("left", leftWas - deltaX * 32);
		$(this).css("top", topWas - deltaY * 32);
	});
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