import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import PostForm from '../components/PostForm';
import { useAppContext } from '../../store/appContext';

const PostEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchPostById, savePost } = useAppContext();
  const [post, setPost] = useState(null);

  useEffect(() => {
    const loadPost = async () => {
      try {
        const data = await fetchPostById(id);
        setPost(data);
      } catch (error) {
        navigate('/admin/posts', { replace: true });
      }
    };
    loadPost();
  }, [id, fetchPostById, navigate]);

  if (!post) return null;

  return (
    <AdminLayout
      title="Editar post"
      description="Atualize o conteúdo antes de publicar."
    >
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <PostForm initialValues={post} onSubmit={savePost} />
      </section>
    </AdminLayout>
  );
};

export default PostEdit;
