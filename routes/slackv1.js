const express = require("express");
const axios = require("axios");
const pg = require("pg");
const v1 = express.Router();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const BOT_TOKEN = process.env.BOT_TOKEN;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const CONNECTION_STRING = process.env.DATABASE_URL;

const pgClient = new pg.Client(CONNECTION_STRING);

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
      Authorization: BOT_TOKEN,
    },
  };

  params.append("client_id", CLIENT_ID);
  params.append("client_secret", CLIENT_SECRET);
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", REFRESH_TOKEN);
  console.log(REFRESH_TOKEN);
  if (!query.hasOwnProperty("code")) {
    res.status(418).send("No Code");
    return;
  }
  params.append("code", query.code);
  axios
    .post(API_URL + "oauth.v2.access", params, config)
    .then((res) => {
      if (res.data.hasOwnProperty("bot_user_id")) {
        PostgresCheckExist(res.data.bot_user_id);
      } else if (res.data.hasOwnProperty("user_id")) {
        PostgresCheckExist(res.data.user_id);
      }
      console.log(res.data);
    })
    .catch((err) => {
      console.error(err);
    });
  res.send(200);
  //   res.redirect('/sharks/shark-facts')
});

async function PostgresCheckExist(id) {
  pgClient.connect();
  pgClient
    .query(`SELECT token from oauth where id = '${id}'`)
    .then((res) => {
        console.log(res.rows);
    }).catch((err) => {
        console.error(err);
    });
  pgClient.end;
}

module.exports = v1;
