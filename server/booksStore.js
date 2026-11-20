const delay = (ms = 20) => new Promise((resolve) => setTimeout(resolve, ms));

const initialBooks = [
  {
    id: 1,
    title: "Dune",
    author: "Frank Herbert",
    year: 1965,
    genre: "science",
    read: true,
    rating: 5,
  },
  {
    id: 2,
    title: "1984",
    author: "George Orwell",
    year: 1949,
    genre: "fiction",
    read: true,
    rating: 5,
  },
  {
    id: 3,
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    year: 1937,
    genre: "fantasy",
    read: true,
    rating: 4,
  },
  {
    id: 4,
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    year: 2011,
    genre: "history",
    read: false,
    rating: null,
  },
  {
    id: 5,
    title: "Atomic Habits",
    author: "James Clear",
    year: 2018,
    genre: "non-fiction",
    read: true,
    rating: 4,
  },
  {
    id: 6,
    title: "Project Hail Mary",
    author: "Andy Weir",
    year: 2021,
    genre: "science",
    read: false,
    rating: null,
  },
];

let books = initialBooks.map((book) => ({ ...book }));
let nextId = 7;

export async function getAllBooks() {
  await delay();
  return books.map((book) => ({ ...book }));
}

export async function getBookById(id) {
  await delay();
  const found = books.find((book) => book.id === id);
  return found ? { ...found } : null;
}

export async function createBook(bookData) {
  await delay();
  const newBook = {
    id: nextId,
    title: bookData.title,
    author: bookData.author,
    year: bookData.year,
    genre: bookData.genre,
    read: bookData.read,
    rating: bookData.rating,
  };
  nextId += 1;
  books = [...books, newBook];
  return { ...newBook };
}

export async function replaceBook(id, bookData) {
  await delay();
  const exists = books.some((book) => book.id === id);
  if (!exists) return null;

  const updatedBook = {
    id,
    title: bookData.title,
    author: bookData.author,
    year: bookData.year,
    genre: bookData.genre,
    read: bookData.read,
    rating: bookData.rating,
  };

  books = books.map((book) => (book.id === id ? updatedBook : book));
  return { ...updatedBook };
}

export async function updateBook(id, mergedData) {
  await delay();
  const exists = books.some((book) => book.id === id);
  if (!exists) return null;

  const updatedBook = {
    id,
    title: mergedData.title,
    author: mergedData.author,
    year: mergedData.year,
    genre: mergedData.genre,
    read: mergedData.read,
    rating: mergedData.rating,
  };

  books = books.map((book) => (book.id === id ? updatedBook : book));
  return { ...updatedBook };
}

export async function deleteBook(id) {
  await delay();
  const exists = books.some((book) => book.id === id);
  if (!exists) return false;

  books = books.filter((book) => book.id !== id);
  return true;
}
