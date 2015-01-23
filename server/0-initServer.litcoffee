    initialAccounts = [['bill', 'bill.png'], ['gilan', 'gilan.png'], ['roy'], ['rotem'], ['shlomi']]

    init = ->
      maze = new Meteor.Collection 'maze'
      # for now, always toast the database on start
      maze.remove {}
      map = JSON.parse Assets.getText 'map2.json'
      map._id = 'world'
      maze.insert map
      if !(maze.findOne 'master')
        for [n, image] in initialAccounts
          console.log "creating account:", n
          try
            profile = name: n
            if image? then profile.image = image
            Accounts.createUser
              username: n
              password: n
              email: "#{n}@#{n}"
              profile: profile
          catch
        maze.insert
          _id: 'master'
          #players seems to be obsolete
          players: []
      else console.log "Maze already exists"
      Meteor.publish 'maze', -> maze.find()

    init()
