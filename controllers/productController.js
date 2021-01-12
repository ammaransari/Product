const express = require('express');
var router = express.Router();
var ObjectId = require('mongoose').Types.ObjectId;
var { Product } = require('../model/product');

router.get('/list', (req, res)=>{
    Employee.find((err, docs) =>{
        if(!err)
        {
            res.send(docs);

        }else{
            console.log('Error in retriving data :' + JSON.stringify(err, undefined, 2));
        
        }

    });
});


router.post('/', (req, res) => {
    var emp = new Product({
        name: req.body.name,
        detail: req.body.detail,
        price: req.body.price,
        quantity: req.body.quantity


    });
    emp.save((err, doc) => {
        if(!err)
        {
            res.send(doc);
        }else{
            console.log('Error in Employee save: ' + JSON.stringify(err, undefined, 2));
        }
    });
});



module.exports = router;