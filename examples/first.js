'use strict'
// More production oriented
let Consumer = require('../'),
    options,
    firstWorker

options = {
    onJob: onJob,
    queueName: 'test.first',
    pipeName: 'test.second',
    prefetch: 100
}

function onJob(job, ack, pipe) {

    // do some work....
    simulateWork(job, function(err, result) {
        // pipe if you're gonna pipe
        pipe('initial job output ' + result)
        // otherwise just ack when done
        // you can send a message if something somewhere is waiting    
        ack('done with ' + result)
        // or plain ack
        // ack()
    })
    
}

function onError(err) {
    // log to actual logger
    // hit pagerduty etc
    console.log('gots me an error ',err)
    process.exit(1)
}

function simulateWork(job, callback) {
    setTimeout(function(){
        callback(null, Math.floor(parseInt(job)))
    },Math.random()*5)
}

// do any prep work, connecting to db etc before calling this.
firstWorker = new Consumer(options)

firstWorker.spread(function(consumer, queue) {
    queue.on('disconnected', onError)
})
.catch(onError)

/*
    currently while handling apparently 'normal' disconnects
    jackrabbit still throws on rabbit dying or something
    catch that here / use domains
*/
process.on('uncaughtException', onError)