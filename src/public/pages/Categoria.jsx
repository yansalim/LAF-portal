import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PublicHeader from '../components/PublicHeader';
import PostFeed from '../components/PostFeed';
import { useAppContext } from '../../store/appContext';
import { setCanonicalLink, setDocumentTitle, setMetaDescription } from '../../utils/seo';

const Categoria = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { getVisiblePosts, getCategoryBySlug } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');

  const category = getCategoryBySlug(slug);
  const posts = getVisiblePosts({ categorySlug: slug });

  useEffect(() => {
    if (!category) {
      navigate('/', { replace: true });
      return;
    }

    setDocumentTitle(`${category?.nome ?? 'Categoria'} | Portal LAF`);
    setMetaDescription(
      category?.descricao ?? `Publicações relacionadas à categoria ${category?.nome}.`,
    );
    setCanonicalLink(`/categoria/${slug}`);
  }, [category, navigate, slug]);

  const filteredPosts = useMemo(() => {
    if (!searchTerm) return posts;
    const term = searchTerm.toLowerCase();
    return posts.filter(
      (post) =>
        post.titulo.toLowerCase().includes(term) || post.resumo.toLowerCase().includes(term),
    );
  }, [posts, searchTerm]);

  if (!category) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicHeader onSearch={setSearchTerm} />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-wide text-primary-600">Categoria</p>
          <h2 className="text-2xl font-semibold text-slate-900">{category.nome}</h2>
          {category.descricao && <p className="text-sm text-slate-500">{category.descricao}</p>}
        </div>
        <PostFeed posts={filteredPosts} />
      </main>
    </div>
  );
};

export default Categoria;
