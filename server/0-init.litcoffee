    maze = null

    init = ->
      maze = new Meteor.Collection 'maze'
      if !(maze.findOne 'master')
        maze.insert
          _id: 'master'
          players: []

    init()
