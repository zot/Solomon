    {
      maze,
    } = root = Solomon

    exp = root.Middleware = {}
    user = null
    maze = null
    players = {}

    changeTypes =
      player: (changeType, item)->
        switch changeType
          when 'added', 'changed'
            players[item._id] = item
            if item._id == user?._id then user = item
          when 'removed' then delete players[item._id]

    handleDataChange = (changeType, item)-> changeTypes[item.type]?(changeType, item)

    getUser = -> if maze && root.subscribed && Meteor.user() then initUser()

    initUser = _.once ->
      root.user = user = maze.findOne Meteor.userId()
      if !user
        root.user = user =
          _id: Meteor.userId()
          type: 'player'
          username: Meteor.user().username
          x: 17
          y: 23
        maze.insert user
      $(document).ready -> root.World.replaceWorld()

    subscribed = ->
      maze = root.maze
      getUser()

    onLogin = -> getUser()

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
    exp.subscribed = subscribed
    exp.handleDataChange = handleDataChange
    exp.players = players
