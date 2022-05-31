const slackv1 = require("./slackv1");
const oauth = require("./oauth");

module.exports = (app) => {
  app.use("/slack/v1", slackv1);
  app.use("/oauth", oauth);
};
