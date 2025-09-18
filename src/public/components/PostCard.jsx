import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/dates';

const PostCard = ({ post }) => {
  const publishedLabel = post.publicadoEm ? formatDate(post.publicadoEm) : '—';

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      {post.capaUrl && (
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={post.capaUrl}
            alt={post.titulo}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-500">
          <span className="font-semibold text-primary-600">{post.categoriaNome}</span>
          <time dateTime={post.publicadoEm}>{publishedLabel}</time>
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-slate-900">
            <Link to={`/post/${post.slug}`} className="hover:text-primary-600">
              {post.titulo}
            </Link>
          </h2>
          <p className="mt-2 text-sm text-slate-600">{post.resumo}</p>
        </div>
        <div className="text-xs text-slate-500">
          {post.autorNome && <span>Por {post.autorNome}</span>}
        </div>
      </div>
    </article>
  );
};

export default PostCard;
