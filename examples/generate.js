'use strict'

let Consumer = require('../')

let options = {
    queueName: 'test.first'
}

let generator = new Consumer(options)

generator.spread(function(consumer,queue) {
    
    for (var i = 0; i < 3000; i++) {
        queue.publish('test.first', Math.random() * 10000)
    }

})
