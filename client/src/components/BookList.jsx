export default function BookList({
  books,
  loading,
  error,
  busyId,
  onToggleRead,
  onRate,
  onEdit,
  onDelete,
}) {
  if (loading) {
    return <p className="status-message">Loading books...</p>;
  }

  if (error) {
    return (
      <p className="status-message error-banner" role="alert">
        {error}
      </p>
    );
  }

  if (books.length === 0) {
    return (
      <p className="status-message">
        No books found matching the current filters.
      </p>
    );
  }

  return (
    <section className="book-list" aria-label="Books">
      {books.map((book) => {
        const isBusy = busyId === book.id;

        return (
          <article key={book.id} className="book-card">
            <div className="book-card-header">
              <div>
                <h3 className="book-title">{book.title}</h3>
                <p className="book-meta">
                  by <strong>{book.author}</strong> · {book.year} ·{" "}
                  <span className="badge-genre">{book.genre}</span>
                </p>
              </div>
              <span
                className={`badge-status ${
                  book.read ? "badge-read" : "badge-unread"
                }`}
              >
                {book.read ? "Read" : "Unread"}
              </span>
            </div>

            <div className="book-card-controls">
              <button
                type="button"
                className="btn-secondary"
                disabled={isBusy}
                onClick={() => onToggleRead(book)}
              >
                {book.read ? "Mark as Unread" : "Mark as Read"}
              </button>

              <label className="rating-control">
                <span>Rating:</span>
                <select
                  value={book.rating === null ? "" : String(book.rating)}
                  disabled={!book.read || isBusy}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const nextRating = raw === "" ? null : Number(raw);
                    onRate(book, nextRating);
                  }}
                >
                  <option value="">No rating</option>
                  <option value="1">1 ★</option>
                  <option value="2">2 ★★</option>
                  <option value="3">3 ★★★</option>
                  <option value="4">4 ★★★★</option>
                  <option value="5">5 ★★★★★</option>
                </select>
              </label>

              <div className="card-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={isBusy}
                  onClick={() => onEdit(book)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn-danger"
                  disabled={isBusy}
                  onClick={() => onDelete(book)}
                >
                  Delete
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
