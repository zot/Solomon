    maze = null

    init = ->
      maze = new Meteor.Collection 'maze'
      maze.insert
        _id: 'master'
        players: []

    init()
