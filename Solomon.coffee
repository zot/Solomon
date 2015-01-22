{
  handlers,
  Gui:gui,
  Middleware:mid,
} = root = (window ? global).Solomon

handleChange = (changeType, item)-> handlers[item.type]?[changeType]?(item)

ownsItem = (item)-> item.owner == Meteor.userId()

root.players = players = {}

initCollections = ->
  Meteor.autorun ->
    if Meteor.user()
      root.loggedIn = true
      console.log "LOGGED IN"
      #Gui.onLogin()
      mid.onLogin()
  handlers.speech =
    added: (item)-> if ownsItem item then gui.chatLog.added item
    removed: (item)-> if ownsItem item then gui.chatLog.removed item
    changed: (item)-> if ownsItem item then gui.chatLog.changed item
  handlers.player =
    added: (item)-> players[item._id] = item
    removed: (item)-> delete players[item._id]
    changed: (item)-> players[item._id] = item
  Meteor.subscribe 'maze', ->
    root.subscribed = true
    maze = root.maze = new Meteor.Collection 'maze'
    maze.find().observe
      #_suppress_initial: true
      added: (item)-> handleChange 'added', item
      removed: (item)-> handleChange 'removed', item
      changed: (item)-> handleChange 'changed', item
    mid.subscribed()

if Meteor.isClient
  initCollections()

#if Meteor.isServer
 # Meteor.startup ->
    # code to run on server at startup
