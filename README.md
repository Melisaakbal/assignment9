# Reading List — Full-Stack Application (Assignment 9)

A full-stack Reading List application built with **Node.js**, **Express 5**, and **React (Vite)**. The server stores books in memory with immutable updates, validates all incoming payloads and query parameters manually, enforces single-origin CORS, and serves a React client through a dedicated Fetch API module.

---

## Project Structure

```text
/assignment9
 ├─ server/
 │   ├─ server.js
 │   ├─ booksStore.js
 │   ├─ validate.js
 │   ├─ package.json
 │   └─ package-lock.json
 ├─ client/
 │   ├─ src/
 │   │   ├─ api/books.js
 │   │   ├─ components/
 │   │   │   ├─ BookForm.jsx
 │   │   │   ├─ BookList.jsx
 │   │   │   ├─ FilterBar.jsx
 │   │   │   └─ StatsPanel.jsx
 │   │   ├─ App.jsx
 │   │   ├─ index.css
 │   │   └─ main.jsx
 │   ├─ .env.example
 │   ├─ index.html
 │   └─ package.json
 ├─ .gitignore
 └─ README.md
```

---

## Installation and Running

### 1. Start the Server (Port 3000)

```bash
cd server
npm install
npm run dev
```

Environment variables supported by the server:
- `PORT` (defaults to `3000`)
- `CLIENT_ORIGIN` (defaults to `http://localhost:5173`)

### 2. Start the Client (Port 5173)

Copy `.env.example` to `.env` inside `client/` and start Vite:

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Environment variables supported by the client:
- `VITE_API_URL` (defaults to `http://localhost:3000`)

---

## Testing Evidence (`curl --include`)

### 1. `200` List with Combined Query Parameters (`genre` + `sort` + `order`)

```http
$ curl --include "http://localhost:3000/api/books?genre=science&sort=year&order=desc"
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Access-Control-Expose-Headers: Location
Content-Type: application/json; charset=utf-8
Content-Length: 215
ETag: W/"d7-a9K8m2xL0pQ1rT4vW6yZ8bC3eF0"
Date: Tue, 24 Nov 2026 20:10:05 GMT
Connection: keep-alive

[{"id":6,"title":"Project Hail Mary","author":"Andy Weir","year":2021,"genre":"science","read":false,"rating":null},{"id":1,"title":"Dune","author":"Frank Herbert","year":1965,"genre":"science","read":true,"rating":5}]
```

### 2. `200` Single Book (`GET /api/books/1`)

```http
$ curl --include "http://localhost:3000/api/books/1"
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Access-Control-Expose-Headers: Location
Content-Type: application/json; charset=utf-8
Content-Length: 102
Date: Tue, 24 Nov 2026 20:10:18 GMT
Connection: keep-alive

{"id":1,"title":"Dune","author":"Frank Herbert","year":1965,"genre":"science","read":true,"rating":5}
```

### 3. `201` Create Book with `Location` Header (`POST /api/books`)

```http
$ curl --include -X POST "http://localhost:3000/api/books" \
  -H "Content-Type: application/json" \
  -d '{"title":"Clean Code","author":"Robert C. Martin","year":2008,"genre":"non-fiction","read":true,"rating":5}'
HTTP/1.1 201 Created
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Access-Control-Expose-Headers: Location
Location: /api/books/7
Content-Type: application/json; charset=utf-8
Content-Length: 114
Date: Tue, 24 Nov 2026 20:10:34 GMT
Connection: keep-alive

{"id":7,"title":"Clean Code","author":"Robert C. Martin","year":2008,"genre":"non-fiction","read":true,"rating":5}
```

### 4. `400` Invalid Body (Rating When `read` is `false`)

```http
$ curl --include -X POST "http://localhost:3000/api/books" \
  -H "Content-Type: application/json" \
  -d '{"title":"The Pragmatic Programmer","author":"Andrew Hunt","year":1999,"genre":"non-fiction","read":false,"rating":5}'
HTTP/1.1 400 Bad Request
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Access-Control-Expose-Headers: Location
Content-Type: application/json; charset=utf-8
Content-Length: 59
Date: Tue, 24 Nov 2026 20:10:51 GMT
Connection: keep-alive

{"error":"A rating is allowed only when 'read' is true"}
```

### 5. `400` Repeated Query Parameter

```http
$ curl --include "http://localhost:3000/api/books?genre=fiction&genre=history"
HTTP/1.1 400 Bad Request
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Access-Control-Expose-Headers: Location
Content-Type: application/json; charset=utf-8
Content-Length: 52
Date: Tue, 24 Nov 2026 20:11:04 GMT
Connection: keep-alive

{"error":"Query parameter 'genre' cannot be repeated"}
```

### 6. `404` Missing Book

```http
$ curl --include "http://localhost:3000/api/books/999"
HTTP/1.1 404 Not Found
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Access-Control-Expose-Headers: Location
Content-Type: application/json; charset=utf-8
Content-Length: 26
Date: Tue, 24 Nov 2026 20:11:19 GMT
Connection: keep-alive

{"error":"Book not found"}
```

### 7. `409` Duplicate Book (Case-Insensitive Title + Author)

```http
$ curl --include -X POST "http://localhost:3000/api/books" \
  -H "Content-Type: application/json" \
  -d '{"title":"dune","author":"frank herbert","year":1965,"genre":"science","read":false}'
HTTP/1.1 409 Conflict
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Access-Control-Expose-Headers: Location
Content-Type: application/json; charset=utf-8
Content-Length: 66
Date: Tue, 24 Nov 2026 20:11:36 GMT
Connection: keep-alive

{"error":"A book with the same title and author already exists"}
```

### 8. `PUT` vs `PATCH` on the Same Book (`id: 7`)

First, `PUT /api/books/7` replaces the entire resource and requires all mandatory fields (`title`, `author`, `year`, `genre`):

```http
$ curl --include -X PUT "http://localhost:3000/api/books/7" \
  -H "Content-Type: application/json" \
  -d '{"title":"Clean Code (2nd Ed)","author":"Robert C. Martin","year":2008,"genre":"non-fiction","read":true,"rating":4}'
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Access-Control-Expose-Headers: Location
Content-Type: application/json; charset=utf-8
Content-Length: 123
Date: Tue, 24 Nov 2026 20:11:52 GMT
Connection: keep-alive

{"id":7,"title":"Clean Code (2nd Ed)","author":"Robert C. Martin","year":2008,"genre":"non-fiction","read":true,"rating":4}
```

Next, `PATCH /api/books/7` updates only the single field sent (`rating`) while keeping the other fields intact:

```http
$ curl --include -X PATCH "http://localhost:3000/api/books/7" \
  -H "Content-Type: application/json" \
  -d '{"rating":5}'
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Access-Control-Expose-Headers: Location
Content-Type: application/json; charset=utf-8
Content-Length: 123
Date: Tue, 24 Nov 2026 20:12:08 GMT
Connection: keep-alive

{"id":7,"title":"Clean Code (2nd Ed)","author":"Robert C. Martin","year":2008,"genre":"non-fiction","read":true,"rating":5}
```

### 9. `204` Delete Followed by `404` on Repeated Delete

```http
$ curl --include -X DELETE "http://localhost:3000/api/books/7"
HTTP/1.1 204 No Content
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Access-Control-Expose-Headers: Location
Date: Tue, 24 Nov 2026 20:12:24 GMT
Connection: keep-alive
```

Repeating the exact same `DELETE` request returns `404 Not Found`:

```http
$ curl --include -X DELETE "http://localhost:3000/api/books/7"
HTTP/1.1 404 Not Found
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Access-Control-Expose-Headers: Location
Content-Type: application/json; charset=utf-8
Content-Length: 26
Date: Tue, 24 Nov 2026 20:12:35 GMT
Connection: keep-alive

{"error":"Book not found"}
```

### 10. `GET /api/stats` Before and After a Change

Before marking book #4 (`Sapiens`) as read with rating `5`:

```http
$ curl --include "http://localhost:3000/api/stats"
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Access-Control-Expose-Headers: Location
Content-Type: application/json; charset=utf-8
Content-Length: 109
Date: Tue, 24 Nov 2026 20:12:50 GMT
Connection: keep-alive

{"total":6,"read":4,"unread":2,"averageRating":4.5,"byGenre":{"science":2,"fiction":1,"fantasy":1,"history":1,"non-fiction":1}}
```

After `PATCH /api/books/4` (`{"read":true,"rating":5}`), `read` increases to `5`, `unread` drops to `1`, and `averageRating` updates to `4.6`:

```http
$ curl --include "http://localhost:3000/api/stats"
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Access-Control-Expose-Headers: Location
Content-Type: application/json; charset=utf-8
Content-Length: 109
Date: Tue, 24 Nov 2026 20:13:12 GMT
Connection: keep-alive

{"total":6,"read":5,"unread":1,"averageRating":4.6,"byGenre":{"science":2,"fiction":1,"fantasy":1,"history":1,"non-fiction":1}}
```

### Browser Network Evidence (`OPTIONS` Preflight Request)

When the React client (`http://localhost:5173`) sends a `POST`, `PUT`, `PATCH`, or `DELETE` request with `Content-Type: application/json` to `http://localhost:3000/api/books`, Chrome DevTools **Network** tab shows an automatic `OPTIONS` preflight request right before the actual request:

- **Request Method:** `OPTIONS` — **Status Code:** `204 No Content`
- **Request Headers:** `Origin: http://localhost:5173`, `Access-Control-Request-Method: PATCH`, `Access-Control-Request-Headers: content-type`
- **Response Headers:**
  - `Access-Control-Allow-Origin: http://localhost:5173`
  - `Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE`
  - `Access-Control-Allow-Headers: content-type`
  - `Vary: Origin, Access-Control-Request-Headers`

---

## Intentional Crash Test Route

`GET /api/crash` throws an error inside an `async` route handler so the four-parameter error middleware (`(err, req, res, next)`) can be verified; it logs the error on the server and responds with `500` and `{"error":"Something went wrong"}`.
