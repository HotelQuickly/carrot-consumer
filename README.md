Carrot-Consumer
=======

Simple wrapper around jackrabbit to provide a pipe to another queue onJob, as well as simplify and remove extra boilerplate from workers.

Usage
=====

* 'npm i carrot-consumer'
* See examples folder

You can manually provide the ampq url `{ queueUrl: 'whatever' }` when you instantiate or it will be automatically detected from `AMPQ_URL` environment variable

Local Usage / Development
====

* Clone this
* `npm i`
* `node examples/generate.js` give it little bit
*  Monitor your queue wait for 3k msgs, kill it
* in one terminal `node examples/first.js`
* in another `node examples/second.js`
* rerun the generator if you want to watch more useless stuff go by
