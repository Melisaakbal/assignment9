export const VALID_GENRES = [
  "fiction",
  "non-fiction",
  "science",
  "history",
  "fantasy",
  "other",
];

const VALID_SORT_FIELDS = ["title", "author", "year", "rating"];
const VALID_ORDERS = ["asc", "desc"];
const ALLOWED_QUERY_KEYS = ["genre", "read", "q", "sort", "order", "limit", "page"];

export function parsePositiveId(rawId) {
  if (typeof rawId !== "string" || !/^[1-9]\d*$/.test(rawId)) {
    return null;
  }
  const parsed = Number(rawId);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

export function validateCompleteBook(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Request body must be a JSON object" };
  }

  const { title, author, year, genre } = body;
  const read = body.read === undefined ? false : body.read;
  const rating = body.rating === undefined ? null : body.rating;

  if (typeof title !== "string") {
    return { error: "Field 'title' is required and must be a string" };
  }
  const trimmedTitle = title.trim();
  if (trimmedTitle.length < 1 || trimmedTitle.length > 100) {
    return { error: "Field 'title' must be between 1 and 100 characters after trimming" };
  }

  if (typeof author !== "string") {
    return { error: "Field 'author' is required and must be a string" };
  }
  const trimmedAuthor = author.trim();
  if (trimmedAuthor.length < 1 || trimmedAuthor.length > 100) {
    return { error: "Field 'author' must be between 1 and 100 characters after trimming" };
  }

  const currentYear = new Date().getFullYear();
  if (
    typeof year !== "number" ||
    !Number.isInteger(year) ||
    year < 1000 ||
    year > currentYear
  ) {
    return {
      error: `Field 'year' must be an integer between 1000 and ${currentYear}`,
    };
  }

  if (typeof genre !== "string" || !VALID_GENRES.includes(genre)) {
    return {
      error: `Field 'genre' must be one of: ${VALID_GENRES.join(", ")}`,
    };
  }

  if (typeof read !== "boolean") {
    return { error: "Field 'read' must be a boolean" };
  }

  if (
    rating !== null &&
    (typeof rating !== "number" ||
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5)
  ) {
    return { error: "Field 'rating' must be an integer between 1 and 5, or null" };
  }

  if (!read && rating !== null) {
    return { error: "A rating is allowed only when 'read' is true" };
  }

  return {
    value: {
      title: trimmedTitle,
      author: trimmedAuthor,
      year,
      genre,
      read,
      rating,
    },
  };
}

export function validatePatchBook(body, existingBook) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Request body must be a JSON object" };
  }

  const merged = {
    title: body.title !== undefined ? body.title : existingBook.title,
    author: body.author !== undefined ? body.author : existingBook.author,
    year: body.year !== undefined ? body.year : existingBook.year,
    genre: body.genre !== undefined ? body.genre : existingBook.genre,
    read: body.read !== undefined ? body.read : existingBook.read,
    rating: body.rating !== undefined ? body.rating : existingBook.rating,
  };

  return validateCompleteBook(merged);
}

export function validateQueryParams(query) {
  for (const [key, value] of Object.entries(query)) {
    if (!ALLOWED_QUERY_KEYS.includes(key)) {
      return { error: `Unknown query parameter '${key}'` };
    }
    if (Array.isArray(value)) {
      return { error: `Query parameter '${key}' cannot be repeated` };
    }
  }

  const filters = {
    genre: undefined,
    read: undefined,
    q: undefined,
    sort: undefined,
    order: "asc",
    limit: 50,
    page: 1,
  };

  if (query.genre !== undefined) {
    if (!VALID_GENRES.includes(query.genre)) {
      return {
        error: `Invalid 'genre' parameter. Must be one of: ${VALID_GENRES.join(", ")}`,
      };
    }
    filters.genre = query.genre;
  }

  if (query.read !== undefined) {
    if (query.read !== "true" && query.read !== "false") {
      return { error: "Invalid 'read' parameter. Must be 'true' or 'false'" };
    }
    filters.read = query.read === "true";
  }

  if (query.q !== undefined) {
    if (typeof query.q !== "string") {
      return { error: "Invalid 'q' parameter" };
    }
    filters.q = query.q.trim().toLowerCase();
  }

  if (query.sort !== undefined) {
    if (!VALID_SORT_FIELDS.includes(query.sort)) {
      return {
        error: `Invalid 'sort' parameter. Must be one of: ${VALID_SORT_FIELDS.join(", ")}`,
      };
    }
    filters.sort = query.sort;
  }

  if (query.order !== undefined) {
    if (!VALID_ORDERS.includes(query.order)) {
      return { error: "Invalid 'order' parameter. Must be 'asc' or 'desc'" };
    }
    filters.order = query.order;
  }

  if (query.limit !== undefined) {
    if (!/^[1-9]\d*$/.test(query.limit)) {
      return { error: "Invalid 'limit' parameter. Must be an integer between 1 and 50" };
    }
    const parsedLimit = Number(query.limit);
    if (parsedLimit < 1 || parsedLimit > 50) {
      return { error: "Invalid 'limit' parameter. Must be an integer between 1 and 50" };
    }
    filters.limit = parsedLimit;
  }

  if (query.page !== undefined) {
    if (!/^[1-9]\d*$/.test(query.page)) {
      return { error: "Invalid 'page' parameter. Must be a positive integer" };
    }
    const parsedPage = Number(query.page);
    if (!Number.isSafeInteger(parsedPage) || parsedPage < 1) {
      return { error: "Invalid 'page' parameter. Must be a positive integer" };
    }
    filters.page = parsedPage;
  }

  return { value: filters };
}
