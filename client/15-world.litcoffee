    {
      maze,
      Gui,
      Middleware:mid,
    } = root = Solomon

    {changePlayer} = Gui
    ext = Solomon.World = ready: false
    world = null

    clampWidth = (w)-> Math.min world.width - 1, Math.max 0, w
    clampHeight = (h)-> Math.min world.height - 1, Math.max 0, h

    replaceWorld = ->
      ext.world = world = Solomon.maze.findOne 'world'
      map = world.map
      Solomon.Gui.setMapSize world.width, world.height
      $("#world").replaceWith "<div id='world'>" + (for y in [0...world.height]
        "<div class='mapRow'>" + ("<img class='mapTile' src='tiles/#{world.types[map[y][x]]}'>" for x in [0...world.width]).join('') + "</div>").join('') + "</div>"
      $("#world").css 'width', (world.width * 64) + 'px'
      $("#world").css 'height', (world.height * 64) + 'px'
      ext.ready = true
      for playerId, player of mid.players
        changePlayer 'added', player
        
    ext.replaceWorld = replaceWorld
    ext.clampWidth = clampWidth
    ext.clampHeight = clampHeight
