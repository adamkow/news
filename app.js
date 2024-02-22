const express = require("express");
const app = express();

const {
  getTopics,
  getApi,
  getArticles,
  getAllArticles,
  getComments,
  postComment,
  patchArticle,
  deleteComment,
  getUsers,
  getArticleTopics,
} = require("./controllers/controller");

app.use(express.json());

app.get("/api/topics", getTopics);
app.get("/api", getApi);
app.get("/api/articles", getAllArticles);
app.get("/api/articles/:id", getArticles);
app.get("/api/articles/:id/comments", getComments);

app.get("/api/articles/topic/:topic", getArticleTopics);
app.get("/api/users", getUsers);
app.post("/api/articles/:id/comments", postComment);
app.patch("/api/articles/:id", patchArticle);
app.delete("/api/comments/:comment_id", deleteComment);

app.all("/*", (req, res, next) => {
  res.status(404).send({ msg: "path not found" });
  next();
});
app.use((err, req, res, next) => {
  if (
    err.code === "42P10" ||
    err.code === "42601" ||
    err.code === "23502" ||
    err.code === "22P02"
  ) {
    res.status(400).send({ msg: "bad request" });
  }
  next(err);
});

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  }
  next(err);
});
module.exports = app;
