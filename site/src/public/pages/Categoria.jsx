import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PublicHeader from '../components/PublicHeader';
import PostFeed from '../components/PostFeed';
import { setCanonicalLink, setDocumentTitle, setMetaDescription } from '../../utils/seo';
import { fetchPublicCategoryBySlug } from '../../services/categoriesService';
import { fetchPublicFeed } from '../../services/postsService';

const Categoria = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadCategory = async () => {
      try {
        const data = await fetchPublicCategoryBySlug(slug);
        setCategory(data);
        setDocumentTitle(`${data.nome} | Portal LAF`);
        setMetaDescription(data.descricao || `Publicações da categoria ${data.nome}.`);
        setCanonicalLink(`/categoria/${slug}`);
      } catch (error) {
        navigate('/', { replace: true });
      }
    };
    loadCategory();
  }, [slug, navigate]);

  useEffect(() => {
    const loadPosts = async () => {
      const { data } = await fetchPublicFeed({ category: slug, page_size: 50 });
      setPosts(data);
    };
    loadPosts();
  }, [slug]);

  const filteredPosts = posts.filter((post) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      post.titulo.toLowerCase().includes(term) || (post.resumo || '').toLowerCase().includes(term)
    );
  });

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
