const { selectTopics, selectDescriptions } = require("../models/models");

function getTopics(req, res, next) {
  const topics = req.body;
  selectTopics(topics)
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
}
function getApi(req, res, next) {
  const descriptions = req.body;
  selectDescriptions(descriptions)
    .then((descriptions) => {
      res.status(200).send({ descriptions });
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
}

module.exports = {
  getTopics,
  getApi,
};
