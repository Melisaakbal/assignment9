import { useCallback, useEffect, useState } from "react";
import {
  createBook,
  deleteBook,
  fetchBooks,
  fetchStats,
  patchBook,
  replaceBook,
} from "./api/books";
import BookForm from "./components/BookForm";
import BookList from "./components/BookList";
import FilterBar from "./components/FilterBar";
import StatsPanel from "./components/StatsPanel";

const INITIAL_FILTERS = {
  q: "",
  genre: "",
  read: "",
  sort: "",
  order: "asc",
};

export default function App() {
  const [books, setBooks] = useState([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [refreshTick, setRefreshTick] = useState(0);

  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [actionError, setActionError] = useState("");
  const [formError, setFormError] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [editingBook, setEditingBook] = useState(null);

  const loadStats = useCallback(async (signal) => {
    try {
      const statsData = await fetchStats(signal);
      setStats(statsData);
    } catch (err) {
      if (err.name !== "AbortError") {
        setActionError(err.message);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setListError("");

    fetchBooks(filters, controller.signal)
      .then((data) => {
        setBooks(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === "AbortError") {
          return;
        }
        setListError(err.message);
        setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [filters, refreshTick]);

  useEffect(() => {
    const controller = new AbortController();
    loadStats(controller.signal);
    return () => {
      controller.abort();
    };
  }, [loadStats, refreshTick]);

  function handleFilterChange(name, value) {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleResetFilters() {
    setFilters(INITIAL_FILTERS);
  }

  function triggerRefresh() {
    setRefreshTick((prev) => prev + 1);
  }

  async function handleFormSubmit(payload) {
    setSubmitting(true);
    setFormError("");
    setActionError("");

    try {
      if (editingBook) {
        await replaceBook(editingBook.id, payload);
        setEditingBook(null);
      } else {
        await createBook(payload);
      }
      triggerRefresh();
      return true;
    } catch (err) {
      setFormError(err.message);
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleRead(book) {
    setBusyId(book.id);
    setActionError("");

    const nextRead = !book.read;
    const patchPayload = {
      read: nextRead,
      rating: nextRead ? book.rating : null,
    };

    try {
      await patchBook(book.id, patchPayload);
      triggerRefresh();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleRate(book, nextRating) {
    setBusyId(book.id);
    setActionError("");

    try {
      await patchBook(book.id, { rating: nextRating });
      triggerRefresh();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(book) {
    setBusyId(book.id);
    setActionError("");

    try {
      await deleteBook(book.id);
      if (editingBook && editingBook.id === book.id) {
        setEditingBook(null);
      }
      triggerRefresh();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  function handleStartEdit(book) {
    setFormError("");
    setActionError("");
    setEditingBook(book);
  }

  function handleCancelEdit() {
    setFormError("");
    setEditingBook(null);
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Reading List</h1>
        <p className="subtitle">Full-Stack REST API &amp; React Client</p>
      </header>

      <main className="app-main">
        <StatsPanel stats={stats} />

        <BookForm
          editingBook={editingBook}
          submitting={submitting}
          formError={formError}
          onSubmit={handleFormSubmit}
          onCancelEdit={handleCancelEdit}
        />

        {actionError && (
          <p className="error-banner" role="alert">
            {actionError}
          </p>
        )}

        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />

        <BookList
          books={books}
          loading={loading}
          error={listError}
          busyId={busyId}
          onToggleRead={handleToggleRead}
          onRate={handleRate}
          onEdit={handleStartEdit}
          onDelete={handleDelete}
        />
      </main>
    </div>
  );
}
