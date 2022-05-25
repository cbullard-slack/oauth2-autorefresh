const express = require("express");
const v1 = express.Router();

v1.get('', function(req, res){
    res.json({ 'success' : true });
});

module.exports = v1;