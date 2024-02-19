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
module.exports = { selectTopics, selectDescriptions };
