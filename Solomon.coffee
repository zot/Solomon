{
  handlers,
  Gui,
  Middleware,
} = root = (window ? global).Solomon

handleChange = (changeType, item)-> handlers[item.type]?[changeType]?(item)

initCollections = ->
  Meteor.autorun ->
    root.loggedIn = true
    console.log "LOGGED IN"
    #Gui.onLogin()
    Middleware.onLogin()
  handlers.chat =
    added: (item)-> gui.chatLog.added item
    removed: (item)-> gui.chatLog.removed item
    changed: (item)-> gui.chatLog.changed item
  Meteor.subscribe 'maze', ->
    root.subscribed = true
    maze = root.maze = new Meteor.Collection 'maze'
    maze.find().observe
      _suppress_initial: true
      added: (item)-> handleChange 'added', item
      removed: (item)-> handleChange 'removed', item
      changed: (item)-> handleChange 'changed', item
    Middleware.subscribed()

if Meteor.isClient
  initCollections()

#if Meteor.isServer
 # Meteor.startup ->
    # code to run on server at startup
