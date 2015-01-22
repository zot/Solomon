    {
      maze,
    } = root = (window ? global).Solomon

    exp = root.Middleware = {}
    user = null
    maze = null
    players = null

    getUser = ->
      if maze && root.subscribed && Meteor.user()
        players = root.players
        root.user = user = maze.findOne Meteor.userId()
        if !user
          root.user = user =
            _id: Meteor.userId()
            type: 'player'
            username: Meteor.user().username
          maze.insert user

    subscribed = ->
      maze = root.maze
      getUser()

    onLogin = -> getUser()

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
