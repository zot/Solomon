    initialAccounts = ['bill', 'gilan', 'roy', 'rotem']

    init = ->
      maze = new Meteor.Collection 'maze'
      # for now, always toast the database on start
      maze.remove {}
      if !(maze.findOne 'master')
        for n in initialAccounts
          console.log "creating account:", n
          try
            Accounts.createUser
              username: n
              password: n
              email: "#{n}@#{n}"
              profile: name: n
          catch
        maze.insert
          _id: 'master'
          players: []
      else console.log "Maze already exists"
      Meteor.publish 'maze', -> maze.find()

    init()
