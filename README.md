# Northcoders News API

This project is an API for Northcoders News. 

You can access the API at [https://news-945o.onrender.com/api](https://news-945o.onrender.com/api).

Visit the frontend repo here [https://github.com/adamkow/nc-news](https://github.com/adamkow/nc-news)

## Environment Setup

Create the following environment files in the top-level of your project:

- `.env.test` containing `PGDATABASE=nc_news_test;`
- `.env.development` containing `PGDATABASE=nc_news;`
- `.env.production` containing `DATABASE_URL=<your-url>`

## Installation and Setup

Clone the repository:

```bash
git clone https://github.com/adamkow/news
```

Install dependencies:

```bash
npm install
```

Set up databases:

```bash
npm run setup-dbs
```

Seed databases:

```bash
npm run seed
npm run seed-prod
```

## Testing

To run tests, execute:

```bash
npm test ../__tests__/api.test.js
```

### Version Information

- Node.js: v21.5.0
- npm: v10.2.4
- PostgreSQL: PostgreSQL 14.10 (Homebrew)

Feel free to modify the `.env` files as per your environment configuration and ensure that PostgreSQL is properly set up before running the project.
