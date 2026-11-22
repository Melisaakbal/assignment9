const GENRES = [
  "fiction",
  "non-fiction",
  "science",
  "history",
  "fantasy",
  "other",
];

export default function FilterBar({ filters, onFilterChange, onReset }) {
  function handleChange(event) {
    const { name, value } = event.target;
    onFilterChange(name, value);
  }

  const hasActiveFilters =
    filters.q !== "" ||
    filters.genre !== "" ||
    filters.read !== "" ||
    filters.sort !== "" ||
    filters.order !== "asc";

  return (
    <section className="filter-bar" aria-label="Search and Filter Books">
      <div className="filter-grid">
        <div className="filter-group">
          <label htmlFor="filter-q">Search (Title or Author)</label>
          <input
            id="filter-q"
            name="q"
            type="search"
            placeholder="e.g. Dune or Orwell..."
            value={filters.q}
            onChange={handleChange}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="filter-genre">Genre</label>
          <select
            id="filter-genre"
            name="genre"
            value={filters.genre}
            onChange={handleChange}
          >
            <option value="">All Genres</option>
            {GENRES.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filter-read">Status</label>
          <select
            id="filter-read"
            name="read"
            value={filters.read}
            onChange={handleChange}
          >
            <option value="">All Books</option>
            <option value="true">Read</option>
            <option value="false">Unread</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filter-sort">Sort By</label>
          <select
            id="filter-sort"
            name="sort"
            value={filters.sort}
            onChange={handleChange}
          >
            <option value="">Default (ID)</option>
            <option value="title">Title</option>
            <option value="author">Author</option>
            <option value="year">Year</option>
            <option value="rating">Rating</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filter-order">Order</label>
          <select
            id="filter-order"
            name="order"
            value={filters.order}
            onChange={handleChange}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="filter-actions">
          <button type="button" className="btn-secondary" onClick={onReset}>
            Reset Filters
          </button>
        </div>
      )}
    </section>
  );
}
