    maze = null

    init = ->
      maze = new Meteor.Collection 'maze'
      if !(maze.findOne 'master')
        for [u, p, e] in [['bill', 'bill', 'bill@bill'], ['gilan', 'gilan', 'gilan@gilan']]
          console.log "creating account:", u, p, e
          Accounts.createUser
            username: u
            password: p
            email: e
            profile: name: u
        maze.insert
          _id: 'master'
          players: []
      else console.log "Maze already exists"

    init()
