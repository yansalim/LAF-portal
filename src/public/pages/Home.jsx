import { useEffect, useMemo, useState } from 'react';
import PublicHeader from '../components/PublicHeader';
import PostFeed from '../components/PostFeed';
import { useAppContext } from '../../store/appContext';
import { setCanonicalLink, setDocumentTitle, setMetaDescription } from '../../utils/seo';

const Home = () => {
  const { getVisiblePosts } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const posts = getVisiblePosts();

  useEffect(() => {
    setDocumentTitle('Últimas publicações | Portal LAF');
    setMetaDescription('Acompanhe as últimas publicações, comunicados e atas oficiais da LAF.');
    setCanonicalLink('/');
  }, []);

  const filteredPosts = useMemo(() => {
    if (!searchTerm) return posts;
    const term = searchTerm.toLowerCase();
    return posts.filter(
      (post) =>
        post.titulo.toLowerCase().includes(term) || post.resumo.toLowerCase().includes(term),
    );
  }, [posts, searchTerm]);

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicHeader onSearch={setSearchTerm} />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-slate-900">Últimas publicações</h2>
          <p className="text-sm text-slate-500">
            Atualizado automaticamente com os posts publicados mais recentes.
          </p>
        </div>
        <PostFeed posts={filteredPosts} />
      </main>
    </div>
  );
};

export default Home;
