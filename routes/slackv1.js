const express = require("express");
const v1 = express.Router();

v1.get("", function (req, res) {
  res.json({ success: true });
});

v1.get("/auth", (req, res) => {
    console.log(req)
  if (!req.hasOwnProperty("query")) {
    res.status(418).send("No Param");
    return;
  } else if (!req.query.hasOwnProperty("code"));
  {
    res.status(418).send("No Code");
    return;
  }
  res.send(200);
  console.log(req.query);
});

module.exports = v1;
