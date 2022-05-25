const express = require("express");
const v1 = express.Router();

v1.get("", function (req, res) {
  res.json({ success: true });
});

v1.get("/auth", (req, res) => {
  if (!req.hasOwnProperty("query")) {
    res.send(418);
    return;
  } else if (!req.query.hasOwnProperty("code"));
  {
    res.send(418);
    return;
  }
  res.send(200);
  console.log(req.query);
});

module.exports = v1;
