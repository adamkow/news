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
    db.query(
      `
      SELECT articles.*,
      COUNT(comments.comment_id)::integer AS comment_count
      FROM articles
      LEFT JOIN comments ON articles.article_id = comments.article_id
      WHERE articles.article_id = $1
      GROUP BY articles.article_id;
    `,
      [id]
    )
      .then((result) => {
        if (result.rows.length === 0) {
          reject({
            status: 404,
            msg: "article does not exist",
          });
          return;
        }
        resolve(result.rows[0]);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function selectAllArticles(topic) {
  return new Promise((resolve, reject) => {
    let query;
    let queryParams = [];

    if (topic) {
      query = `
        SELECT articles.*, COUNT(comments.comment_id)::integer AS comment_count
        FROM articles
        LEFT JOIN comments ON articles.article_id = comments.article_id
        WHERE articles.topic = $1
        GROUP BY articles.article_id
        ORDER BY articles.created_at DESC;`;
      queryParams = [topic];
    } else {
      query = `
        SELECT articles.*, COUNT(comments.comment_id)::integer AS comment_count
        FROM articles
        LEFT JOIN comments ON articles.article_id = comments.article_id
        GROUP BY articles.article_id
        ORDER BY articles.created_at DESC;`;
    }

    db.query(query, queryParams)
      .then((result) => {
        if (result.rows.length === 0) {
          return reject({ status: 404, msg: "path not found" });
        }

        const articles = topic
          ? result.rows
          : result.rows.map(({ body, ...rest }) => rest);
        resolve(articles);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function selectArticleTopics(topics) {
  return db
    .query("SELECT * FROM articles WHERE topic = $1;", [topics])
    .then((result) => {
      if (result.rows.length === 0) {
        throw { status: 404, msg: "path not found" };
      }
      return result.rows;
    })
    .catch((error) => {
      reject(error);
    });
}

function selectComments(articleId) {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC;",
      [articleId]
    )
      .then((result) => {
        if (result.rows.length === 0) {
          reject({ status: 404, msg: "article does not exist" });
        } else {
          resolve(result.rows);
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function newComment(articleId, username, commentBody) {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM articles WHERE article_id = $1;",
      [articleId],
      (articleError, articleResult) => {
        if (articleError) {
          reject(articleError);
        } else if (articleResult.rows.length === 0) {
          reject({ status: 404, msg: "article does not exist" });
        } else {
          db.query(
            "SELECT username FROM users WHERE username = $1",
            [username],
            (userError, userResult) => {
              if (userError) {
                reject(userError);
              } else if (userResult.rows.length === 0) {
                reject({ status: 404, msg: "user does not exist" });
              } else {
                insertComment(articleId, username, commentBody)
                  .then(resolve)
                  .catch(reject);
              }
            }
          );
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
            resolve(updatedArticle);
          }
        }
      }
    );
  });
}

function deleteCommentById(id) {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM comments WHERE comment_id = $1;", [id])
      .then((result) => {
        if (result.rows.length === 0) {
          reject({ status: 404, msg: "comment does not exist" });
        } else {
          return db.query("DELETE FROM comments WHERE comment_id = $1;", [id]);
        }
      })
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function selectUsers() {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM users;")
      .then((result) => {
        resolve(result.rows);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function commentCount(id) {
  return new Promise((resolve, reject) => {
    db.query(`SELECT * FROM articles WHERE article_id = $1;`, [id])
      .then((result) => {
        if (result.rows.length === 0) {
          return Promise.reject({ status: 404, msg: "article does not exist" });
        } else {
          db.query(`SELECT * FROM comments WHERE article_id = $1;`, [id])
            .then((result) => {
              if (result.rows.length === 0) {
                return Promise.reject({
                  status: 404,
                  msg: "no comments for article",
                });
              }
              const count = result.rows.length;
              resolve(count);
            })
            .catch((error) => {
              reject(error);
            });
        }
      })
      .catch((error) => {
        reject(error);
      });
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
  deleteCommentById,
  selectUsers,
  selectArticleTopics,
  commentCount,
};
