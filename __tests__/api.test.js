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
        const topicsObject = JSON.parse(res.text);
        const topics = topicsObject.topics;
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
