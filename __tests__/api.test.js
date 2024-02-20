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
});

describe("GET /api/articles/:article_id", () => {
  test("GET:200 responds with specific article", () => {
    return request(app)
      .get("/api/articles/2")
      .expect(200)
      .then((res) => {
        const article = res.body.article;
        console.log(article);
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
        console.log(res.body.article);
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
});

describe("GET /api/articles/:article_id/comments", () => {
  test("GET:200 gets comments of a specific article", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then((res) => {
        const comments = res.body.article;
        console.log(typeof comments);
        comments.forEach((comment) => {
          console.log(comment);
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
