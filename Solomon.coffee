{
  handlers,
  Gui,
} = root = (window ? global).Solomon

maze = null

handleChange = (changeType, item)-> handlers[item.type]?[changeType]?(item)

initCollections = ->
  Meteor.autorun ->
    console.log "LOGGED IN"
    #if Meteor.user()
    #  Gui.onLogin()
  #Accounts.onLogin -> gui.onLogin()
  #Accounts.onLoginFailure -> gui.onLoginFailure()
  handlers.chat =
    added: (item)-> gui.chatLog.added item
    removed: (item)-> gui.chatLog.removed item
    changed: (item)-> gui.chatLog.changed item
  Meteor.subscribe 'maze', ->
    maze = new Metor.Collection 'maze'
    maze.find().observe
      _suppress_initial: true
      added: (item)-> handleChange 'added', item
      removed: (item)-> handleChange 'removed', item
      changed: (item)-> handleChange 'changed', item

if Meteor.isClient
  initCollections()

#if Meteor.isServer
 # Meteor.startup ->
    # code to run on server at startup
