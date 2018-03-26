'use strict';

const fs = require('fs');
const split2 = require('split2');
const isStream = require('is-stream');
const EventEmitter = require('events');

class API extends EventEmitter  {
    parse(opts) {

        let {file, outputStream} = opts;
        let writeStream = isStream.writable(outputStream) ? outputStream : false;

        try {

            writeStream && writeStream.on('error', err => this.emit('error', err));

            let stream = fs.createReadStream(file)
            .pipe(split2())
            .on('data', line => {

                // Firefox
                // Chrome
                // Pocket
                //
                const link = line.match(/HREF="([^"]+)/i);

                // All EXCEPT Pocket
                //
                let addDate = line.match(/ADD_DATE="([^"]+)/);

                if(!addDate) {
                    // Pocket
                    //
                    addDate = line.match(/time_added="([^"]+)/);
                }
                if(!link || !addDate) {
                    return;
                }

                let entry = {
                    link: link[1],
                    date: new Date(+addDate[1] * 1000)
                };

                if(writeStream) {
                    return writeStream.write(`${entry.link}\n`, () => {
                        this.emit('entry', entry);
                    });
                }

                this.emit('entry', entry);

            })
            .on('error', err => this.emit('error', err))
            .on('end', () => this.emit('end'))

        } catch(err) {

            this.emit('error', err);
        }

        return this;
    }
}

module.exports = {
    parse: (opts={}) => (new API()).parse(opts)
};
