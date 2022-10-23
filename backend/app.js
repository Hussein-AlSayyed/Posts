const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const postsRouter = require('./routes/posts');

const app = express();

mongoose.connect("mongodb+srv://Hussein:ahv2RYlOoBV9lNbC@cluster0.whjimmz.mongodb.net/node-angular?retryWrites=true&w=majority")
    .then(() => {
        console.log("Connected Successfully");
    })
    .catch(() => {
        console.log('Connection Failed');
    })

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/images', express.static(path.join('backend/images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
    );
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PATCH, PUT, DELETE, OPTIONS'
    );
    next();
});

app.use('/api/posts', postsRouter);

module.exports = app;