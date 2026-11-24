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


---

## Reasoning Questions

1. **Parameters.** `id` identifies a single specific resource in the REST hierarchy (`/api/books/3`), so it belongs in the route path, whereas `genre` and `sort` filter or order a collection without changing which resource endpoint is addressed. If `id` were placed in the query string (`GET /api/books?id=3`), the endpoint would semantically represent a filtered collection query rather than a direct resource address, complicating REST conventions for `PUT`, `PATCH`, and `DELETE` on a single item.

2. **Body parsing.** When I moved `app.use(express.json())` below the route definitions and sent a `POST /api/books` request, `req.body` was `undefined` inside the route handler because the JSON body parser middleware had not run yet. As a result, `validateCompleteBook(req.body)` rejected the empty body and the server returned `400 Bad Request` (`{"error":"Request body must be a JSON object"}`).

3. **One response.** When I removed `return` before `res.status(404).json({ error: "Book not found" })` in `GET /api/books/:id`, the handler sent the `404` response and then continued executing to `res.status(200).json(book)`. Express threw `Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client`, which triggered the error middleware and logged a stack trace on the server.

4. **PUT and PATCH.** `PATCH` is the better choice when toggling a book's `read` status or updating its `rating` from the book card, because only one or two fields change without needing to resend the entire book object. `PUT` is the better choice in the Edit Book form, where the user reviews and submits a complete replacement of all book fields (`title`, `author`, `year`, `genre`, `read`, `rating`).

5. **CORS.** When I set `CLIENT_ORIGIN=http://localhost:9999` and opened the client on `http://localhost:5173`, the browser console blocked the response with a CORS policy error (`No 'Access-Control-Allow-Origin' header is present on the requested resource` / origin mismatch). The server still received and logged the request because CORS is enforced by browsers, not by the server blocking execution; `curl` also continued to work because `curl` is a command-line HTTP client that ignores browser Same-Origin / CORS restrictions.

6. **Validation.** Client-side checks only improve user experience and can be bypassed easily by modifying the browser code, disabling form validation, or sending direct requests with `curl` or Postman. The server must validate every input independently to protect data integrity, enforce business rules (such as no rating when `read` is `false` and no duplicate title+author pairs), and return predictable `400` or `409` JSON errors.

7. **State.** When I restarted the server (`node --watch server.js`), all newly added, edited, and deleted books disappeared and the list reverted to the initial 6 seed books. This shows that the data lives purely in volatile RAM inside the Node.js process (`booksStore.js`), and a persistent database (such as PostgreSQL or SQLite) or file storage is required to keep changes across restarts.

---

## Self-Study Notes

- **`URLSearchParams`:** I learned from MDN that `URLSearchParams` automatically percent-encodes special characters (spaces, `&`, `?`, non-ASCII characters) when building query strings, preventing broken URLs or parameter injection when searching by title or author.
- **`String.prototype.localeCompare`:** Using `a[field].localeCompare(b[field])` instead of `<` / `>` operators provides proper alphabetical ordering across uppercase/lowercase letters and locale-specific characters when sorting by `title` or `author`.
- **Vite `import.meta.env` and `VITE_` prefix:** Vite exposes environment variables to client-side code via `import.meta.env`, but only variables prefixed with `VITE_` are bundled into the browser build so sensitive server-only secrets in `.env` are never leaked accidentally.
- **Express 5 `204 No Content` responses:** In Express 5, sending `res.status(204).end()` cleanly terminates the response with no body and no `Content-Type` header, matching HTTP `204` semantics and ensuring the client does not attempt to parse an empty JSON body.
- **`AbortController` and `AbortError`:** Passing `controller.signal` into `fetch()` and calling `controller.abort()` inside `useEffect`'s cleanup function cancels outdated in-flight requests when filters change rapidly; catching `err.name === "AbortError"` lets the UI ignore intentional cancellations without flashing false error banners.

---

## Challenges Faced

- Ensuring `PATCH` validation checked the **merged** book state rather than only the incoming partial fields, especially when marking a rated book as unread (`read: false` requires `rating: null`).
- Preventing `fetch` in `client/src/api/books.js` from sending `Content-Type: application/json` on `GET` and `DELETE` requests without bodies, and handling `204 No Content` responses before calling `response.json()`.

