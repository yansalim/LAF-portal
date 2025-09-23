import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PublicHeader from '../components/PublicHeader';
import MarkdownViewer from '../components/MarkdownViewer';
import PostCard from '../components/PostCard';
import { setCanonicalLink, setDocumentTitle, setMetaDescription } from '../../utils/seo';
import { fetchPublicPost, fetchPublicFeed } from '../../services/postsService';

const Post = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [morePosts, setMorePosts] = useState([]);

  useEffect(() => {
    const loadPost = async () => {
      try {
        const data = await fetchPublicPost(slug);
        setPost(data);
        setDocumentTitle(`${data.titulo} | Portal LAF`);
        setMetaDescription(data.resumo ?? 'Publicação do portal LAF.');
        setCanonicalLink(`/post/${slug}`);
      } catch (error) {
        navigate('/', { replace: true });
      }
    };
    loadPost();
  }, [slug, navigate]);

  useEffect(() => {
    const loadMore = async () => {
      const { data } = await fetchPublicFeed({ page_size: 4 });
      setMorePosts(data.filter((item) => item.slug !== slug).slice(0, 3));
    };
    loadMore();
  }, [slug]);

  const category = useMemo(() => post?.categoria, [post]);

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
              {post.publicadoEm && (
                <time dateTime={post.publicadoEm} className="font-medium text-slate-600">
                  {new Date(post.publicadoEm).toLocaleString('pt-BR')}
                </time>
              )}
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
