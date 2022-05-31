const express = require("express");
const axios = require("axios");
const v1 = express.Router();

const { Client } = require("pg");

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const BOT_TOKEN = process.env.BOT_TOKEN;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const CONNECTION_STRING = process.env.DATABASE_URL;

const API_URL = "https://slack.com/api/";

const PostgresConnect = async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  await client.connect();

  return client;
};

const PostgresCheckExist = async (id) => {
  try {
    const client = await PostgresConnect();
    console.log(`-=STARTING POSTGRES CHECK EXISTS=-`);
    const entries = await client.query(
      `SELECT token from oauth where id = $1;`,
      [id]
    );
    console.log(`Number of DB entries for id ${id}: ${entries.rowCount}`);
    const rowCount = entries.rowCount;
    if (rowCount <= 0) {
      console.log(`The row count was ${rowCount}!\nEntered the <= if marker`);
      client.end();
      console.log(`Made is passed the 'client.end()' call!`);
      return false;
    } else if (rowCount >= 2) {
      client.end();
      console.log(`The row count was ${rowCount}!\nEntered the >= if marker`);
      throw "ERROR: More than one item returned on for Primary Key. Please check database";
    } else {
      console.log(`The row count was ${rowCount}!\nEntered the else marker`);
      console.log(rowCount);
      client.end();
      return true;
    }
  } catch (err) {
    console.error(`Error Line 49: ${err}`);
  }
};

async function PostgresUpdateOauth(id, token, refreshToken, time) {
  try {
    const client = await PostgresConnect();
    client.query(
      `UPDATE oauth SET token = ${token}, refresh = ${time}, refresh_token = ${refreshToken} where id = '${id}';`,
      (err, res) => {
        if (err) throw err;

        console.log(res);
      }
    );
  } catch (err) {
    console.error(`Error Line 64: ${err}`);
  }
}

async function PostgresAddOauth(id, token, refreshToken, time) {
  try {
    const client = await PostgresConnect();
    const res = await client.query(
      `INSERT INTO oauth( id, token, refresh, refresh_token) VALUES ($1, $2, $3, $4) ;`,
      [id, token, time, refreshToken]
    );
    client.end();
    console.log(res);
    //   (err, res) => {
    //     if (err) throw err;

    //     console.log(res);
    //   }
    // );
  } catch (err) {
    console.error(`Error Line 82: ${err}`);
  }
}

v1.get("", async (req, res) => {
  const date = new Date();
  const dateUTC = date.getUTCDate();
  const dateSeconds = date.getUTCSeconds();
  console.log(`The current date is ${date}\nThe current UTC date is ${dateUTC}\nThe current UTC seconds ${dateSeconds}`);
  res.json({ success: false });
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
    .then(async (res) => {
      const username = res.data.username;
      const token = res.data.token;
      const refresh_token = res.data.refresh_token;
      const time_to_refresh = res.data.time_to_refresh;
      if (res.data.hasOwnProperty("bot_user_id")) {
        console.log(`Check bot user ID for token`);
        const id = res.data.bot_user_id;
        if (await PostgresCheckExist(res.data.bot_user_id)) {
          console.log(
            `Postgres Checked and found that the Bot User does exist in db`
          );
        } else {
          console.log(
            `Postgres Checked and found that the Bot User does not exist in db`
          );
          let date = new Date();
          console.log(`Current Date is: ${date}`);
          date.setSeconds(date.getSeconds() + time_to_refresh);
          console.log(`Refresh Date is: ${date}`);
          //   await PostgresAddOauth(id, token, refresh_token, date);
        }
      } else if (res.data.hasOwnProperty("user_id")) {
        console.log(`Check user ID for token`);
        if (PostgresCheckExist(res.data.user_id)) {
        }
      }
      console.log(res.data);
    })
    .catch((err) => {
      console.error(`Error Line 144: ${err}`);
    });
  res.send(200);
  //   res.redirect('/sharks/shark-facts')
});

module.exports = v1;

// const pgClient = new pg.Client({
//     user:"cufwbkefsdzvid",
//     password:env.DATABASE_PASSWORD,
//     database:"d4p1b8dfaja8ng",
//     port:5432,
//     host:"ec2-54-204-56-171.compute-1.amazonaws.com",
//     ssl:true
// });
