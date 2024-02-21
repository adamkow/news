const request = require("supertest");
const db = require("../db/connection");
const app = require("../app");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data");

beforeEach(() => {
  return seed(data);
});
afterAll(() => db.end());

describe("GET /api/topics", () => {
  test("GET:200 responds with all topics", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then((res) => {
        const topics = res.body.topics;
        topics.forEach((topic) => {
          expect(topic).toHaveProperty("slug");
          expect(topic).toHaveProperty("description");
        });
      });
  });

  test("GET:404 respond with not found for invalid path", () => {
    return request(app)
      .get("/api/fridge")
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("path not found");
      });
  });
});

describe("GET /api/", () => {
  test("GET:200 responds with description of api endpoints", () => {
    return request(app)
      .get("/api/")
      .expect(200)
      .then((res) => {
        const descriptionsObj = res.body.descriptions;
        Object.keys(descriptionsObj).forEach((key) => {
          expect(descriptionsObj[key]).toHaveProperty("description");
        });
      });
  });
  test("GET:404 respond with not found for invalid path", () => {
    return request(app)
      .get("/api/apiarticle")
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("path not found");
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("GET:200 responds with specific article", () => {
    return request(app)
      .get("/api/articles/2")
      .expect(200)
      .then((res) => {
        const article = res.body.article;
        expect(article).toHaveProperty("article_id");
        expect(article).toHaveProperty("title");
        expect(article).toHaveProperty("topic");
        expect(article).toHaveProperty("author");
        expect(article).toHaveProperty("body");
        expect(article).toHaveProperty("created_at");
        expect(article).toHaveProperty("votes");
        expect(article).toHaveProperty("article_img_url");
      });
  });
  test("GET:404 respond with not found for invalid path", () => {
    return request(app)
      .get("/api/articles/20")
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("article does not exist");
      });
  });
});

describe("GET /api/articles", () => {
  test("GET:200 gets all articles", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((res) => {
        expect(Array.isArray(res.body.article)).toBe(true);
        res.body.article.forEach((article) => {
          expect(article).toHaveProperty("article_id");
          expect(article).toHaveProperty("title");
          expect(article).toHaveProperty("topic");
          expect(article).toHaveProperty("author");
          expect(article).toHaveProperty("created_at");
          expect(article).toHaveProperty("votes");
          expect(article).toHaveProperty("article_img_url");
        });
      });
  });
  test("GET:404 respond with not found for invalid path", () => {
    return request(app)
      .get("/api/articles2")
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("path not found");
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("GET:200 gets comments of a specific article", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then((res) => {
        const comments = res.body.article;
        comments.forEach((comment) => {
          expect(comment).toHaveProperty("comment_id");
          expect(comment).toHaveProperty("votes");
          expect(comment).toHaveProperty("created_at");
          expect(comment).toHaveProperty("author");
          expect(comment).toHaveProperty("body");
          expect(comment).toHaveProperty("article_id");
        });
      });
  });

  test("GET:404 respond with not found for invalid path", () => {
    return request(app)
      .get("/api/articles/20/comments")
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("article does not exist");
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("POST:201 posts comment on specific article for user that doesn't exist", () => {
    return request(app)
      .post("/api/articles/2/comments")
      .send({
        username: "Adam",
        body: "new comment",
      })
      .expect(201)
      .then((res) => {
        const comments = res.body.article;
        expect(comments.length).toBe(1);
        comments.forEach((comment) => {
          expect(comment).toHaveProperty("comment_id");
          expect(comment).toHaveProperty("votes");
          expect(comment).toHaveProperty("created_at");
          expect(comment).toHaveProperty("author", "Adam");
          expect(comment).toHaveProperty("body", "new comment");
          expect(comment).toHaveProperty("article_id", 2);
        });
      });
  });
  test("POST:201 posts comment on specific article for user that exists", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({
        username: "lurker",
        body: "new comment",
      })
      .expect(201)
      .then((res) => {
        let comments = res.body.article;
        expect(comments.length).toBe(12);
        comments = comments.filter((comment) => comment.author === "lurker");

        comments.forEach((comment) => {
          expect(comment).toHaveProperty("comment_id");
          expect(comment).toHaveProperty("votes");
          expect(comment).toHaveProperty("created_at");
          expect(comment).toHaveProperty("author", "lurker");
          expect(comment).toHaveProperty("body", "new comment");
          expect(comment).toHaveProperty("article_id", 1);
        });
      });
  });
  test("POST:400 sends appropriate error message when send bad request", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({
        body: "new comment",
      })
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("bad request");
      });
  });
});

describe("PATCH /api/articles/:article_id/", () => {
  test("PATCH:200 updates an article's votes", () => {
    return request(app)
      .patch("/api/articles/2")
      .send({ inc_votes: 1 })
      .expect(200)
      .then((res) => {
        const article = res.body.article;
        expect(article).toHaveProperty("article_id", 2);
        expect(article).toHaveProperty("title");
        expect(article).toHaveProperty("body");
        expect(article).toHaveProperty("votes", 1);
      });
  });
  test("PATCH:200 updates an article's votes", () => {
    return request(app)
      .patch("/api/articles/2")
      .send({ inc_votes: -100 })
      .expect(200)
      .then((res) => {
        const article = res.body.article;
        expect(article).toHaveProperty("article_id", 2);
        expect(article).toHaveProperty("title");
        expect(article).toHaveProperty("body");
        expect(article).toHaveProperty("votes", -100);
      });
  });
  test("PATCH:404 responds with article not found for invalid article ID", () => {
    return request(app)
      .patch("/api/articles/999999")
      .send({ inc_votes: 1 })
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("path not found");
      });
  });
  test("PATCH:400 responds with bad request for invalid request body", () => {
    return request(app)
      .patch("/api/articles/2")
      .send({})
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("bad request");
      });
  });
});
