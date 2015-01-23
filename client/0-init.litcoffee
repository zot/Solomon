    root = Solomon

    started = false
    subscribed = false
    ready = false
    pending = []
    
    setSubscribed = ->
      subscribed = true
      if ready then runStarted()

    setReady = ->
      ready = true
      if subscribed then runStarted()

    runStarted = ->
       for f in pending
         f()
       pending = null
    
    onStart = (func)->
       if !started then pending.push func
       else func()

    Solomon.onStart = onStart
    Solomon.setSubscribed = setSubscribed
    Solomon.setReady = setReady
