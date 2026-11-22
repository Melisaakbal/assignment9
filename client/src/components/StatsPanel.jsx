export default function StatsPanel({ stats }) {
  if (!stats) {
    return null;
  }

  const genreEntries = Object.entries(stats.byGenre || {});

  return (
    <section className="stats-panel" aria-label="Reading Statistics">
      <h2>Reading Statistics</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Books</span>
          <strong className="stat-value">{stats.total}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Read</span>
          <strong className="stat-value">{stats.read}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Unread</span>
          <strong className="stat-value">{stats.unread}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Average Rating</span>
          <strong className="stat-value">
            {stats.averageRating !== null ? `${stats.averageRating} / 5` : "N/A"}
          </strong>
        </div>
      </div>

      {genreEntries.length > 0 && (
        <div className="genre-breakdown">
          <span className="stat-label">Books by Genre:</span>
          <ul className="genre-tags">
            {genreEntries.map(([genre, count]) => (
              <li key={genre} className="genre-tag">
                {genre}: <strong>{count}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
