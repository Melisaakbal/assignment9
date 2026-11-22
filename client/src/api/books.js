const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function request(path, options = {}) {
  const { body, signal, method = "GET" } = options;

  const headers = {};
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  if (response.status === 204) {
    return null;
  }

  let data = null;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    data = await response.json();
  }

  if (!response.ok) {
    const message =
      data && typeof data.error === "string"
        ? data.error
        : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}

export function fetchBooks(filters = {}, signal) {
  const params = new URLSearchParams();

  if (filters.genre) {
    params.set("genre", filters.genre);
  }
  if (filters.read === "true" || filters.read === "false") {
    params.set("read", filters.read);
  }
  if (filters.q && filters.q.trim() !== "") {
    params.set("q", filters.q.trim());
  }
  if (filters.sort) {
    params.set("sort", filters.sort);
  }
  if (filters.order) {
    params.set("order", filters.order);
  }

  const queryString = params.toString();
  const path = queryString ? `/api/books?${queryString}` : "/api/books";

  return request(path, { signal });
}

export function fetchStats(signal) {
  return request("/api/stats", { signal });
}

export function createBook(bookData) {
  return request("/api/books", {
    method: "POST",
    body: bookData,
  });
}

export function replaceBook(id, bookData) {
  return request(`/api/books/${id}`, {
    method: "PUT",
    body: bookData,
  });
}

export function patchBook(id, partialData) {
  return request(`/api/books/${id}`, {
    method: "PATCH",
    body: partialData,
  });
}

export function deleteBook(id) {
  return request(`/api/books/${id}`, {
    method: "DELETE",
  });
}
