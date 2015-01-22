    init = ->
      maze = new Meteor.Collection 'maze'
      # for now, always toast the database on start
      maze.remove {}
      if !(maze.findOne 'master')
        for [u, p, e] in [['bill', 'bill', 'bill@bill'], ['gilan', 'gilan', 'gilan@gilan']]
          console.log "creating account:", u, p, e
          try
            Accounts.createUser
              username: u
              password: p
              email: e
              profile: name: u
          catch
        maze.insert
          _id: 'master'
          players: []
      else console.log "Maze already exists"
      Meteor.publish 'maze', -> maze.find()

    init()
