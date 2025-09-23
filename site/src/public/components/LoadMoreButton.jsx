const LoadMoreButton = ({ onClick, hasMore }) => {
  if (!hasMore) return null;

  return (
    <div className="mt-6 flex justify-center">
      <button
        type="button"
        onClick={onClick}
        className="rounded-full bg-primary-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-200"
      >
        Carregar mais
      </button>
    </div>
  );
};

export default LoadMoreButton;
