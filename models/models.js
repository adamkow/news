const { all } = require("../app");
const db = require("../db/connection");
const fs = require("fs");
const endpoints = require("../endpoints.json");

function selectTopics() {
  return new Promise((resolve, reject) => {
    db.query(`SELECT * FROM topics;`)
      .then((result) => {
        resolve(result.rows);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function selectDescriptions() {
  return new Promise((resolve, reject) => {
    resolve(endpoints).catch((error) => {
      reject(error);
    });
  });
}

function selectArticle(id) {
  return new Promise((resolve, reject) => {
    db.query(`SELECT * FROM articles WHERE article_id = $1;`, [id])
      .then((result) => {
        if (result.rows.length === 0) {
          return Promise.reject({ status: 404, msg: "article does not exist" });
        }
        resolve(result.rows[0]);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function selectAllArticles() {
  return new Promise((resolve, reject) => {
    db.query(`SELECT * FROM articles ORDER BY created_at DESC;`)
      .then((result) => {
        const articlesWithoutBody = result.rows.map((article) => {
          const { body, ...rest } = article;
          return rest;
        });
        resolve(articlesWithoutBody);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function selectComments(articleId) {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT body, votes, author, article_id, created_at FROM comments WHERE article_id = $1 ORDER BY created_at DESC;`,
      [articleId]
    )
      .then((result) => {
        if (result.rows.length === 0) {
          return Promise.reject({
            status: 404,
            msg: "article does not exist",
          });
        }

        const commentsWithIds = result.rows.map((comment, index) => ({
          ...comment,
          comment_id: index + 1,
        }));
        resolve(commentsWithIds);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function newComment(articleId, username, commentBody) {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT username FROM users WHERE username = $1",
      [username],
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result.rows.length === 0) {
          newUser(username)
            .then(() => {
              insertComment(articleId, username, commentBody)
                .then(resolve)
                .catch((error) => {
                  reject(error);
                });
            })
            .catch((error) => {
              reject(error);
            });
        } else {
          insertComment(articleId, username, commentBody)
            .then(resolve)
            .catch((error) => {
              reject(error);
            });
        }
      }
    );
  });
}
function insertComment(articleId, username, commentBody) {
  return new Promise((resolve, reject) => {
    db.query(
      "INSERT INTO comments (article_id, author, body) VALUES ($1, $2, $3) RETURNING *",
      [articleId, username, commentBody],
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          db.query(
            "SELECT * FROM comments WHERE article_id = $1",
            [articleId],
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result.rows);
              }
            }
          );
        }
      }
    );
  });
}
function newUser(username) {
  return new Promise((resolve, reject) => {
    db.query(
      "INSERT INTO users (username, name) VALUES ($1, $2) RETURNING *",
      [username, username],
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.rows[0]);
        }
      }
    );
  });
}

function updateVotes(articleId, votes) {
  return new Promise((resolve, reject) => {
    db.query(
      "UPDATE articles SET votes = $1 WHERE article_id = $2 RETURNING *",
      [votes, articleId],
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          if (result.rows.length === 0) {
            reject({ status: 404, msg: "path not found" });
          } else {
            const updatedArticle = result.rows[0];
            console.log(updatedArticle);
            resolve(updatedArticle);
          }
        }
      }
    );
  });
}

module.exports = {
  selectTopics,
  selectDescriptions,
  selectArticle,
  selectAllArticles,
  selectComments,
  newComment,
  updateVotes,
};
