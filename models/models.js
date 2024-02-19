const { all } = require("../app");
const db = require("../db/connection");

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

module.exports = { selectTopics };
