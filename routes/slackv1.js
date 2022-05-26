const express = require("express");
const axios = require("axios");
const v1 = express.Router();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
//const BOT_TOKEN = process.env.BOT_TOKEN;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const API_URL = "https://slack.com/api/";

v1.get("", function (req, res) {
  res.json({ success: true });
});

v1.get("/auth", (req, res) => {
  const query = req.query;
  const params = new URLSearchParams();

  const config = {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };

  params.append("client_id", CLIENT_ID);
  params.append("client_secret", CLIENT_SECRET);
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", REFRESH_TOKEN);
  if (!query.hasOwnProperty("code")) {
    res.status(418).send("No Code");
    return;
  }
  axios
    .post(API_URL + "oauth.v2.access", params, config)
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.error(err);
    });
  res.send(200);
  //   res.redirect('/sharks/shark-facts')
});

module.exports = v1;
