import AdminLayout from '../components/AdminLayout';
import PostForm from '../components/PostForm';
import { useAppContext } from '../../store/appContext';

const PostNew = () => {
  const { savePost } = useAppContext();

  return (
    <AdminLayout
      title="Novo post"
      description="Crie uma nova publicação para o portal."
    >
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <PostForm onSubmit={savePost} />
      </section>
    </AdminLayout>
  );
};

export default PostNew;
