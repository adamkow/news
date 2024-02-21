const {
  selectTopics,
  selectDescriptions,
  selectArticle,
  selectAllArticles,
  selectComments,
  newComment,
  updateVotes,
} = require("../models/models");

function getTopics(req, res, next) {
  const topics = req.body;
  selectTopics(topics)
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch((err) => {
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
      next(err);
    });
}

function getArticles(req, res, next) {
  const article = req.body;
  const id = req.params.id;
  selectArticle(id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
}
function getAllArticles(req, res, next) {
  const article = req.body;
  const id = req.params.id;
  selectAllArticles()
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
}

function getComments(req, res, next) {
  const article = req.body;
  const id = req.params.id;
  selectComments(id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
}

function postComment(req, res, next) {
  const { username, body } = req.body;
  const { id } = req.params;
  newComment(id, username, body)
    .then((comment) => {
      res.status(201).send({ article: comment });
    })
    .catch(next);
}

function patchArticle(req, res, next) {
  const { id } = req.params;
  const votes = req.body.inc_votes;
  updateVotes(id, votes)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
}
module.exports = {
  getTopics,
  getApi,
  getArticles,
  getAllArticles,
  getComments,
  postComment,
  patchArticle,
};
