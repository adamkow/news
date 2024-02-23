const request = require("supertest");
const db = require("../db/connection");
const app = require("../app");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data");
const endpoints = require("../endpoints.json");
require("jest-sorted");

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
        expect(topics.length).toBe(3);
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
        expect(res.body.descriptions).toEqual(endpoints);
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
        expect(article.article_id).toBe(2);
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
        expect(res.body.article.length).toBe(13);
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
  test("Should be sorted by date descending", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((res) => {
        const articles = res.body.article;
        expect(articles).toBeSortedBy("created_at", {
          descending: true,
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
      .get("/api/articles/9/comments")
      .expect(200)
      .then((res) => {
        const comments = res.body.article;
        expect(comments.length).toBe(2);
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
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("user does not exist");
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
  test("POST:404 posts comment on non-existing article", () => {
    return request(app)
      .post("/api/articles/9999/comments")
      .send({
        username: "lurker",
        body: "new comment",
      })
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("article does not exist");
      });
  });

  test("POST:400 responds with bad request when given invalid article_id format", () => {
    return request(app)
      .post("/api/articles/not-a-valid-id/comments")
      .send({
        username: "lurker",
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

  test("PATCH:404 responds with 'path not found' for non-existing article ID", () => {
    const nonExistingId = "123456";
    return request(app)
      .patch(`/api/articles/${nonExistingId}`)
      .send({ inc_votes: 1 })
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("path not found");
      });
  });

  test("PATCH:400 for empty request body", () => {
    return request(app)
      .patch("/api/articles/2")
      .send({})
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("bad request");
      });
  });

  test("PATCH:400 for invalid article ID format", () => {
    return request(app)
      .patch("/api/articles/not-a-number")
      .send({ inc_votes: 1 })
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("bad request");
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("DELETE:204 deletes specific comment", () => {
    return request(app).delete("/api/comments/10").expect(204);
  });
  test("DELETE:404 responds with error message when comment doesn't exist", () => {
    return request(app)
      .delete("/api/comments/1000")
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("comment does not exist");
      });
  });
  test("DELETE:400 responds with error message when given an invalid id", async () => {
    const response = await request(app).delete("/api/comments/apple");
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("bad request");
  });
});

describe("GET /api/users", () => {
  test("GET:200 responds with all users", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then((res) => {
        const users = res.body.users;
        expect(users.length).toBe(4);
        users.forEach((user) => {
          expect(user).toHaveProperty("username");
          expect(user).toHaveProperty("name");
          expect(user).toHaveProperty("avatar_url");
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

describe("GET /api/articles (topic query)", () => {
  test("GET:200 responds with articles with specific topic", () => {
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then((res) => {
        const articles = res.body.article;
        expect(articles.length).toBe(12);
      });
  });
  test("GET:404 respond with not found for invalid path", () => {
    return request(app)
      .get("/api/articles/topic/fridge")
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("path not found");
      });
  });
  test("GET:200 no topic query gets all articles", () => {
    return request(app)
      .get("/api/articles/")
      .expect(200)
      .then((res) => {
        articles = res.body.article;
        expect(articles.length).toBe(13);
        articles.forEach((article) => {
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

describe("GET /api/articles/:article_id/comment_count", () => {
  test("GET:200 responds with count of all comments for specific article", () => {
    return (
      request(app)
        //.get("/api/articles?topic=mitch")
        .get("/api/articles/1")
        .expect(200)
        .then((res) => {
          const article = res.body.article;
          expect(article.article_id).toBe(1);
          expect(article.comment_count).toBe(11);
          expect(article).toHaveProperty("author");
          expect(article).toHaveProperty("title");
          expect(article).toHaveProperty("article_id");
          expect(article).toHaveProperty("body");
          expect(article).toHaveProperty("topic");
          expect(article).toHaveProperty("created_at");
          expect(article).toHaveProperty("votes");
          expect(article).toHaveProperty("article_img_url");
        })
    );
  });
  test("GET:200 responds with comment count of 0 for an article without comments", () => {
    return request(app)
      .get("/api/articles/2")
      .expect(200)
      .then((res) => {
        const article = res.body.article;
        expect(article.article_id).toBe(2);
        expect(article.comment_count).toBe(0);
        expect(article).toHaveProperty("author");
        expect(article).toHaveProperty("title");
        expect(article).toHaveProperty("article_id");
        expect(article).toHaveProperty("body");
        expect(article).toHaveProperty("topic");
        expect(article).toHaveProperty("created_at");
        expect(article).toHaveProperty("votes");
        expect(article).toHaveProperty("article_img_url");
      });
  });

  test("GET:404 respond with error message for an article that doesn't exist", () => {
    return request(app)
      .get("/api/articles/99999/comment_count")
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("article does not exist");
      });
  });
});
