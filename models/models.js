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

function selectComments(id) {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT article_id, votes, created_at, author, body FROM articles WHERE article_id = $1;`,
      [id]
    )
      .then((result) => {
        if (result.rows.length === 0) {
          return Promise.reject({ status: 404, msg: "article does not exist" });
        }
        const response = {
          ...result.rows[0],
          comment_id: 1,
        };
        resolve(response);
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
};
