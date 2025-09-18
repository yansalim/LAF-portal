import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import PostForm from '../components/PostForm';
import { useAppContext } from '../../store/appContext';

const PostEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getPostById, savePost } = useAppContext();

  const post = getPostById(id);

  useEffect(() => {
    if (!post) {
      navigate('/admin/posts', { replace: true });
    }
  }, [post, navigate]);

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
