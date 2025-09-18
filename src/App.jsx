import { Navigate, Route, Routes } from 'react-router-dom';
import Home from './public/pages/Home';
import Categoria from './public/pages/Categoria';
import Post from './public/pages/Post';
import Login from './auth/Login';
import ProtectedRoute from './auth/ProtectedRoute';
import AdminHome from './admin/pages/AdminHome';
import PostsList from './admin/pages/PostsList';
import PostNew from './admin/pages/PostNew';
import PostEdit from './admin/pages/PostEdit';
import Categories from './admin/pages/Categories';
import Users from './admin/pages/Users';

const App = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/categoria/:slug" element={<Categoria />} />
    <Route path="/post/:slug" element={<Post />} />
    <Route path="/login" element={<Login />} />

    <Route element={<ProtectedRoute />}>
      <Route path="/admin" element={<AdminHome />} />
      <Route path="/admin/posts" element={<PostsList />} />
      <Route path="/admin/posts/novo" element={<PostNew />} />
      <Route path="/admin/posts/:id/editar" element={<PostEdit />} />
      <Route path="/admin/categorias" element={<Categories />} />
      <Route path="/admin/usuarios" element={<Users />} />
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
