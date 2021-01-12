const mongoose = require('mongoose');

var Product = mongoose.model('Product', {
    name: {type: String },
    detail: {type: String},
    price: {type: Number},
    quantity: {type: Number},

}, 'prod');
module.exports = {Product} ;