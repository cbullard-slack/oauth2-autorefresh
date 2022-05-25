const express = require("express");
const v1 = express.Router();

v1.get('', function(req, res){
    res.json({ 'success' : true });
});

v1.get("/auth", (req,res) => {
    res.send(200);
    console.log(req);
});

module.exports = v1;