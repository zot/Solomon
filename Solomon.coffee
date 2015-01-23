{
  Gui:gui,
  Middleware:mid,
  setSubscribed,
  setReady,
  onStart,
} = root = (window ? global).Solomon

handleChange = (changeType, item)->
  gui.handleDataChange changeType, item
  mid.handleDataChange changeType, item

loggedIn = ->
  if root.user?._id != Meteor.userId()
    root.loggedIn = true
    console.log "LOGGED IN"
    #Gui.onLogin()
    mid.onLogin()

loggedOut = -> if root.user then mid.onLogout()

initCollections = ->
  Meteor.autorun ->
    if Meteor.user() then loggedIn()
    else loggedOut()
  Meteor.subscribe 'maze', ->
    root.subscribed = true
    maze = root.maze = new Meteor.Collection 'maze'
    maze.find().observe
      #_suppress_initial: true
      added: (item)-> handleChange 'added', item
      removed: (item)-> handleChange 'removed', item
      changed: (item)-> handleChange 'changed', item
    setSubscribed()

if Meteor.isClient
  onStart -> mid.subscribed()
  $(document).ready -> setReady()
  initCollections()

#if Meteor.isServer
 # Meteor.startup ->
    # code to run on server at startup
