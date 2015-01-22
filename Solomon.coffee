{
  Gui:gui,
  Middleware:mid,
} = root = (window ? global).Solomon

handleChange = (changeType, item)->
  gui.handleDataChange changeType, item
  mid.handleDataChange changeType, item

loggedIn = _.once ->
  root.loggedIn = true
  console.log "LOGGED IN"
  #Gui.onLogin()
  mid.onLogin()

initCollections = ->
  Meteor.autorun -> if Meteor.user() then loggedIn()
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
