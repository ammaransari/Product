 const express = require('express');
const bodyParser = require('body-parser');

const { mongoose } = require('./db.js');

var productController = require('./controllers/productController.js');

var app = express();
app.use(bodyParser.json());


app.listen(3000, () => console.log("server started as port : 3000"));

app.use('/products', productController);