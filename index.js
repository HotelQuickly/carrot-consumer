'use strict'

let Promise = require('bluebird'),
    Queue = require('jackrabbit/lib/queue'),
    jackrabbit = require('jackrabbit'),
    uuid = require('node-uuid')

// monkeypatch this to make sure messagse don't vanish in a second
Queue.prototype.publish = function(obj, replyHandler) {
    var msg = JSON.stringify(obj)
    var id = uuid.v4()
    if (replyHandler) {
        this.channel.replyHandlers[id] = replyHandler
    }
    this.channel.sendToQueue(this.name, new Buffer(msg), {
        persistent: true,
        correlationId: id,
        replyTo: replyHandler ? this.channel.replyName : undefined
    })
}

function Consumer( opts, ready ) {
    
    if ( !opts.queueName ) {
        throw new Error('Must provide { queueName: "string"}')
    }
    
    let onJob,
        queue,
        queueUrl,
        queueName,
        pipeName,
        prefetch
    
    queueUrl = opts.queueUrl || process.env.AMQP_URL || 'amqp://localhost'
    prefetch = opts.prefetch || 1
    queueName = opts.queueName
    queue = Promise.promisifyAll( jackrabbit( queueUrl ) )
    onJob = opts.onJob
    pipeName = opts.pipeName

    if ( opts.pipeName ) {
        queue.on('connected', onConnectPipe)
    } else {
        queue.on('connected', onConnect)
    }

    function onConnectPipe() {
        queue.createAsync(pipeName, { noAck: true })
            .then(onConnect)
            .catch(onBootError)
    }
    
    function onConnect() {
        queue.createAsync(queueName, { prefetch: prefetch })
            .then(onCreated)
            .catch(onBootError)
    }
    
    function onCreated() {
        if ( onJob ) {
            queue.handle(queueName, handlerWrapper)
        }
        
        ready(null, queue)
        
        function handlerWrapper( job, ack ) {
            onJob(job, ack, pipe)
        }
        
        function pipe( msg ) {
            return queue.publishAsync(pipeName, msg)
        }

    }
    
    function onBootError(err) {
        console.log('boot err called')
        ready(err, null)
    }

}

module.exports = function createConsumer( opts ) {
    
    return new Promise(function(resolve, reject) {
        let consumer = new Consumer( opts, ready )
        
        function ready(err, queue) {
            if (err) {
                return reject(err)
            } else {
                return resolve([consumer,queue])
            }
        }

    })
}