import { useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PublicHeader from '../components/PublicHeader';
import MarkdownViewer from '../components/MarkdownViewer';
import PostCard from '../components/PostCard';
import { useAppContext } from '../../store/appContext';
import { formatDate } from '../../utils/dates';
import { setCanonicalLink, setDocumentTitle, setMetaDescription } from '../../utils/seo';

const Post = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { getPostBySlug, getVisiblePosts, categories } = useAppContext();

  const post = getPostBySlug(slug);
  const category = useMemo(() => {
    if (!post) return undefined;
    return categories.find((item) => item.id === post.categoriaId);
  }, [categories, post]);
  const visiblePosts = getVisiblePosts();
  const morePosts = visiblePosts.filter((item) => item.slug !== slug).slice(0, 3);

  useEffect(() => {
    if (!post) {
      navigate('/', { replace: true });
      return;
    }

    setDocumentTitle(`${post?.titulo ?? 'Publicação'} | Portal LAF`);
    setMetaDescription(post?.resumo ?? 'Publicação do portal LAF.');
    setCanonicalLink(`/post/${slug}`);
  }, [post, navigate, slug]);

  if (!post) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicHeader />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <nav className="mb-6 text-sm text-slate-500">
          <Link to="/" className="hover:text-primary-600">
            Início
          </Link>
          <span className="mx-2">/</span>
          {category ? (
            <Link to={`/categoria/${category.slug}`} className="hover:text-primary-600">
              {category.nome}
            </Link>
          ) : (
            <span>{post.categoriaNome}</span>
          )}
        </nav>

        <article className="space-y-6">
          <header className="space-y-3">
            <p className="text-sm uppercase tracking-wide text-primary-600">{post.categoriaNome}</p>
            <h1 className="text-3xl font-bold text-slate-900">{post.titulo}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <time dateTime={post.publicadoEm} className="font-medium text-slate-600">
                {formatDate(post.publicadoEm)}
              </time>
              {post.autorNome && <span>Por {post.autorNome}</span>}
            </div>
          </header>

          {post.capaUrl && (
            <img
              src={post.capaUrl}
              alt="Capa da publicação"
              className="w-full rounded-3xl border border-slate-200 object-cover"
            />
          )}

          <MarkdownViewer content={post.conteudoMarkdown} />
        </article>

        <section className="mt-12">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Mais recentes</h2>
          {morePosts.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhuma outra publicação disponível.</p>
          ) : (
            <div className="grid gap-5 md:grid-cols-3">
              {morePosts.map((item) => (
                <PostCard key={item.id} post={item} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Post;
