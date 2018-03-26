'use strict';

const fs = require('fs');
const path = require('path');
const marks = require('../../');

module.exports = (test, Promise) => new Promise((resolve, reject) => {

    marks.parse({
        file: path.join(__dirname, 'browserbookmarks.html'),
        outputStream: fs.createWriteStream(path.join(__dirname, 'test.out'))
    })
    .on('entry', entry => {
        test.ok(typeof entry === 'object' && typeof entry.link === 'string' && entry.date instanceof Date, `Correctly reading Browser bookmark entries`)
    })
    .on('error', reject)
    .on('end', () => {
        marks.parse({
            file: path.join(__dirname, 'pocket.html')
        })
        .on('entry', entry => {
            test.ok(typeof entry === 'object' && typeof entry.link === 'string' && entry.date instanceof Date, `Correctly reading Pocket entries`)
        })
        .on('error', reject)
        .on('end', () => resolve());

    });


});