import { useMemo, useState } from 'react';
import PostCard from './PostCard';
import LoadMoreButton from './LoadMoreButton';

const DEFAULT_PAGE_SIZE = 6;

const PostFeed = ({ posts = [], itemsPerPage = DEFAULT_PAGE_SIZE }) => {
  const [visible, setVisible] = useState(itemsPerPage);

  const hasMore = visible < posts.length;
  const visiblePosts = useMemo(() => posts.slice(0, visible), [posts, visible]);

  const handleLoadMore = () => {
    setVisible((current) => current + itemsPerPage);
  };

  if (posts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">
        Nenhuma publicação disponível no momento.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        {visiblePosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      <LoadMoreButton onClick={handleLoadMore} hasMore={hasMore} />
    </div>
  );
};

export default PostFeed;
