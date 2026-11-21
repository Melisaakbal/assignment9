import express from "express";
import cors from "cors";
import {
  getAllBooks,
  getBookById,
  createBook,
  replaceBook,
  updateBook,
  deleteBook,
} from "./booksStore.js";
import {
  parsePositiveId,
  validateCompleteBook,
  validatePatchBook,
  validateQueryParams,
} from "./validate.js";

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(
  cors({
    origin: CLIENT_ORIGIN,
  })
);
app.use(express.json());

function hasDuplicateTitleAndAuthor(allBooks, title, author, excludeId = null) {
  const normalizedTitle = title.toLowerCase();
  const normalizedAuthor = author.toLowerCase();

  return allBooks.some(
    (book) =>
      book.id !== excludeId &&
      book.title.toLowerCase() === normalizedTitle &&
      book.author.toLowerCase() === normalizedAuthor
  );
}

function applyQueryOptions(booksList, filters) {
  let result = [...booksList];

  if (filters.genre !== undefined) {
    result = result.filter((book) => book.genre === filters.genre);
  }

  if (filters.read !== undefined) {
    result = result.filter((book) => book.read === filters.read);
  }

  if (filters.q !== undefined && filters.q.length > 0) {
    result = result.filter(
      (book) =>
        book.title.toLowerCase().includes(filters.q) ||
        book.author.toLowerCase().includes(filters.q)
    );
  }

  if (filters.sort !== undefined) {
    const direction = filters.order === "desc" ? -1 : 1;

    result.sort((a, b) => {
      if (filters.sort === "rating") {
        if (a.rating === null && b.rating === null) return 0;
        if (a.rating === null) return 1;
        if (b.rating === null) return -1;
        return (a.rating - b.rating) * direction;
      }

      if (filters.sort === "year") {
        return (a.year - b.year) * direction;
      }

      return a[filters.sort].localeCompare(b[filters.sort]) * direction;
    });
  } else if (filters.order === "desc") {
    result.sort((a, b) => b.id - a.id);
  }

  const startIndex = (filters.page - 1) * filters.limit;
  return result.slice(startIndex, startIndex + filters.limit);
}

app.get("/api/books", async (req, res) => {
  const { error, value: filters } = validateQueryParams(req.query);
  if (error) {
    return res.status(400).json({ error });
  }

  const allBooks = await getAllBooks();
  const filteredBooks = applyQueryOptions(allBooks, filters);
  return res.status(200).json(filteredBooks);
});

app.get("/api/books/:id", async (req, res) => {
  const id = parsePositiveId(req.params.id);
  if (!id) {
    return res.status(400).json({ error: "Book id must be a positive integer" });
  }

  const book = await getBookById(id);
  if (!book) {
    return res.status(404).json({ error: "Book not found" });
  }

  return res.status(200).json(book);
});

app.post("/api/books", async (req, res) => {
  const { error, value } = validateCompleteBook(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const allBooks = await getAllBooks();
  if (hasDuplicateTitleAndAuthor(allBooks, value.title, value.author)) {
    return res
      .status(409)
      .json({ error: "A book with the same title and author already exists" });
  }

  const created = await createBook(value);
  return res
    .status(201)
    .location(`/api/books/${created.id}`)
    .json(created);
});

app.put("/api/books/:id", async (req, res) => {
  const id = parsePositiveId(req.params.id);
  if (!id) {
    return res.status(400).json({ error: "Book id must be a positive integer" });
  }

  const existing = await getBookById(id);
  if (!existing) {
    return res.status(404).json({ error: "Book not found" });
  }

  const { error, value } = validateCompleteBook(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const allBooks = await getAllBooks();
  if (hasDuplicateTitleAndAuthor(allBooks, value.title, value.author, id)) {
    return res
      .status(409)
      .json({ error: "A book with the same title and author already exists" });
  }

  const updated = await replaceBook(id, value);
  return res.status(200).json(updated);
});

app.patch("/api/books/:id", async (req, res) => {
  const id = parsePositiveId(req.params.id);
  if (!id) {
    return res.status(400).json({ error: "Book id must be a positive integer" });
  }

  const existing = await getBookById(id);
  if (!existing) {
    return res.status(404).json({ error: "Book not found" });
  }

  const { error, value } = validatePatchBook(req.body, existing);
  if (error) {
    return res.status(400).json({ error });
  }

  const allBooks = await getAllBooks();
  if (hasDuplicateTitleAndAuthor(allBooks, value.title, value.author, id)) {
    return res
      .status(409)
      .json({ error: "A book with the same title and author already exists" });
  }

  const updated = await updateBook(id, value);
  return res.status(200).json(updated);
});

app.delete("/api/books/:id", async (req, res) => {
  const id = parsePositiveId(req.params.id);
  if (!id) {
    return res.status(400).json({ error: "Book id must be a positive integer" });
  }

  const deleted = await deleteBook(id);
  if (!deleted) {
    return res.status(404).json({ error: "Book not found" });
  }

  return res.status(204).end();
});

app.get("/api/stats", async (req, res) => {
  const allBooks = await getAllBooks();
  const total = allBooks.length;
  const read = allBooks.filter((book) => book.read).length;
  const unread = total - read;

  const ratedBooks = allBooks.filter((book) => book.rating !== null);
  const averageRating =
    ratedBooks.length > 0
      ? Number(
          (
            ratedBooks.reduce((sum, book) => sum + book.rating, 0) /
            ratedBooks.length
          ).toFixed(1)
        )
      : null;

  const byGenre = {};
  for (const book of allBooks) {
    byGenre[book.genre] = (byGenre[book.genre] || 0) + 1;
  }

  return res.status(200).json({
    total,
    read,
    unread,
    averageRating,
    byGenre,
  });
});

app.get("/api/crash", async (req, res) => {
  throw new Error("Intentional crash to verify error middleware");
});

app.use("/api", (req, res) => {
  return res.status(404).json({ error: "Not found" });
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Malformed JSON in request body" });
  }

  console.error(err);
  return res.status(500).json({ error: "Something went wrong" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
