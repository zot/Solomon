    {
      maze,
    } = root = (window ? global).Solomon

    exp = root.Middleware = {}
    user = null
    maze = null

    getUser = ->
      if maze && root.subscribed
        root.user = user = maze.findOne Meteor.userId()
        if !user
          root.user = user =
            type: 'player'
            user: Meteor.userId()
          maze.insert user

    subscribed = ->
      maze = root.maze
      getUser()

    onLogin = -> getUser()

    speak = (txt)->
      id = new Meteor.Collection.ObjectID().toJSONValue()
      tail = if user.speechTail then maze.findOne user.speechTail
      speech =
        _id: id
        type: 'speech'
        from: Meteor.userId()
        owner: Meteor.userId()
        prev: oldTail?._id
      user.speechTail = speech._id
      maze.update user._id, user
      maze.insert speech
      if tail
        tail.next = speech._id
        maze.update tail._id, tail

    teamChat = (txt)->

    exp.speak = speak
    exp.teamChat = teamChat
    exp.onLogin = onLogin
    exp.subscribed = subscribed
