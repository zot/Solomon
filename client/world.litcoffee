    {
      maze,
    } = root = Solomon

    ext = Solomon.World = {}

    replaceWorld = ->
      map = Solomon.maze.findOne 'world'
      $("#world").replaceWith "<div id='world'>" + (for x in [0...map.height]
        "<div class='mapRow'>" + ("<div class='mapTile'>#{map.map[x][y]}</div>" for y in [0...map.width]).join('') + "</div>").join('') + "</div>"

    ext.replaceWorld = replaceWorld
