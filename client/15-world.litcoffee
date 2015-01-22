    {
      maze,
      Gui,
      Middleware:mid,
    } = root = Solomon

    {changePlayer} = Gui
    ext = Solomon.World = {}

    replaceWorld = ->
      map = Solomon.maze.findOne 'world'
      Solomon.Gui.setMapSize map.width, map.height
      $("#world").replaceWith "<div id='world'>" + (for x in [0...map.height]
        "<div class='mapRow'>" + ("<div class='mapTile'>#{map.map[x][y]}</div>" for y in [0...map.width]).join('') + "</div>").join('') + "</div>"
      $("#world").css 'width', (map.width * 64) + 'px'
      $("#world").css 'height', (map.height * 64) + 'px'
      for playerId, player of mid.players
        changePlayer 'added', player
        

    ext.replaceWorld = replaceWorld
