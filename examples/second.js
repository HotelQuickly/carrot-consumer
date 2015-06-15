'use strict'
// barebones    
let Consumer = require('../'),
    options,
    secondWorker

options = { queueName: 'test.second', onJob: onJob }
secondWorker = new Consumer(options)

function onJob(job, ack, pipe) {
    // do work
    console.log('Second  got ', job)
    ack()
}
