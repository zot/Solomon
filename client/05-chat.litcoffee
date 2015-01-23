    {
      maze,
      players,
    } = root = Solomon

    exp = root.Middleware = {}
    user = null
    maze = null

    changeTypes =
      player: (changeType, item)->
        switch changeType
          when 'added', 'changed'
            if item._id == Meteor.userId() then root.user = user = item
          when 'removed'
            if item._id == Meteor.userId() then root.user = user = null

    handleDataChange = (changeType, item)-> changeTypes[item.type]?(changeType, item)

    getUser = -> if maze && root.subscribed && Meteor.user() then initUser()

    initUser = ->
      if !root.user
        root.user = user = maze.findOne Meteor.userId()
        if !user then root.onStart ->
          [x, y] = root.World.randomStartLocation()
          root.user = user =
            _id: Meteor.userId()
            type: 'player'
            username: Meteor.user().username
            x: x
            y: y
          maze.insert user

    subscribed = ->
      #maze = root.maze
      #getUser()

    onLogin = -> root.onStart ->
      maze = root.maze
      getUser()

    onLogout = -> if user? then root.maze.remove user._id

    movePlayer = (x, y)->
      player = players[Meteor.userId()]
      player.x = x
      player.y = y
      maze.update player

    speak = (txt)->
      #TODO make sure this is UTC at some point
      time = Date.now()
      for playerId, player of players
        baseSpeak txt, Meteor.userId(), player, time

    baseSpeak = (txt, from, toUser, time)->
      tail = if toUser.speechTail then maze.findOne toUser.speechTail
      speech =
        _id: new Meteor.Collection.ObjectID().toJSONValue()
        type: 'speech'
        time: time
        content: txt
        from: from
        owner: toUser._id
        prev: oldTail?._id
      toUser.speechTail = speech._id
      maze.update toUser._id, toUser
      maze.insert speech
      if tail
        tail.next = speech._id
        maze.update tail._id, tail

    teamChat = (txt)->

    exp.speak = speak
    exp.teamChat = teamChat
    exp.onLogin = onLogin
    exp.onLogout = onLogout
    exp.subscribed = subscribed
    exp.handleDataChange = handleDataChange
