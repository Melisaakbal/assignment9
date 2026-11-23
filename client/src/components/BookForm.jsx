import { useEffect, useState } from "react";

const GENRES = [
  "fiction",
  "non-fiction",
  "science",
  "history",
  "fantasy",
  "other",
];

const EMPTY_FORM = {
  title: "",
  author: "",
  year: String(new Date().getFullYear()),
  genre: "fiction",
  read: false,
  rating: "",
};

export default function BookForm({
  editingBook,
  submitting,
  formError,
  onSubmit,
  onCancelEdit,
}) {
  const [values, setValues] = useState(EMPTY_FORM);

  useEffect(() => {
    if (editingBook) {
      setValues({
        title: editingBook.title,
        author: editingBook.author,
        year: String(editingBook.year),
        genre: editingBook.genre,
        read: editingBook.read,
        rating: editingBook.rating === null ? "" : String(editingBook.rating),
      });
    } else {
      setValues(EMPTY_FORM);
    }
  }, [editingBook]);

  function handleChange(event) {
    const { name, type, value, checked } = event.target;

    if (type === "checkbox") {
      setValues((prev) => ({
        ...prev,
        [name]: checked,
        rating: checked ? prev.rating : "",
      }));
      return;
    }

    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const parsedYear = Number(values.year);
    const payload = {
      title: values.title,
      author: values.author,
      year: Number.isNaN(parsedYear) ? values.year : parsedYear,
      genre: values.genre,
      read: values.read,
      rating:
        values.read && values.rating !== "" ? Number(values.rating) : null,
    };

    const succeeded = await onSubmit(payload);
    if (succeeded && !editingBook) {
      setValues(EMPTY_FORM);
    }
  }

  return (
    <section className="form-panel" aria-label="Book Form">
      <h2>{editingBook ? `Edit Book #${editingBook.id}` : "Add a New Book"}</h2>

      {formError && (
        <p className="error-banner" role="alert">
          {formError}
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate className="book-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="book-title">Title</label>
            <input
              id="book-title"
              name="title"
              type="text"
              value={values.title}
              onChange={handleChange}
              placeholder="Book title"
            />
          </div>

          <div className="form-group">
            <label htmlFor="book-author">Author</label>
            <input
              id="book-author"
              name="author"
              type="text"
              value={values.author}
              onChange={handleChange}
              placeholder="Author name"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="book-year">Year</label>
            <input
              id="book-year"
              name="year"
              type="number"
              value={values.year}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="book-genre">Genre</label>
            <select
              id="book-genre"
              name="genre"
              value={values.genre}
              onChange={handleChange}
            >
              {GENRES.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group checkbox-group">
            <label htmlFor="book-read">
              <input
                id="book-read"
                name="read"
                type="checkbox"
                checked={values.read}
                onChange={handleChange}
              />
              <span>Already read</span>
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="book-rating">Rating (1-5)</label>
            <select
              id="book-rating"
              name="rating"
              value={values.rating}
              disabled={!values.read}
              onChange={handleChange}
            >
              <option value="">No rating</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting
              ? "Saving..."
              : editingBook
              ? "Save Changes"
              : "Add Book"}
          </button>

          {editingBook && (
            <button
              type="button"
              className="btn-secondary"
              disabled={submitting}
              onClick={onCancelEdit}
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
