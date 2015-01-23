    {
      maze,
      Gui,
      Middleware:mid,
      players,
    } = root = Solomon

    {changePlayer} = Gui
    ext = Solomon.World = ready: false
    world = null
    WALLS = ['w', '1', '2', '3', '4', '5', '6', '7', '8', 'c']
    FLOORS = ['f']

    findPlayer = (x, y)->
      for playerId, player of players
        if player.x == x && player.y == y then return player
      null

    randomStartLocation = ->
      while true
        x = Math.floor Math.random() * world.width
        y = Math.floor Math.random() * world.height
        if world.map[y][x] in FLOORS && !findPlayer(x, y) then return [x, y]

    isLegal = (player, x, y)->
      p = findPlayer x, y
      !(world.map[y][x] in WALLS) && (!p || p == player)

    movePlayer = (player, x, y)->
      x = clampWidth x
      y = clampHeight y
      if (x != player.x || y != player.y) && isLegal player, x, y
        player.x = x
        player.y = y
        Solomon.maze.update player._id, player

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
        
    root.onStart -> replaceWorld()

    ext.replaceWorld = replaceWorld
    ext.clampWidth = clampWidth
    ext.clampHeight = clampHeight
    ext.movePlayer = movePlayer
    ext.randomStartLocation = randomStartLocation
