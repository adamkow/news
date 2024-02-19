const { selectTopics } = require("../models/models");

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

module.exports = {
  getTopics,
};
