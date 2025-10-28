import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import PostDetailPage from './pages/PostDetailPage';
import LoginPage from './pages/LoginPage';
import CreatePostPage from './pages/CreatePostPage';
import RegisterPage from './pages/RegisterPage';

function App() {

  return (
    // 🔑 배경색 변경, 폰트 적용
    <div className="min-h-screen flex flex-col items-center bg-gray-100 font-sans"> 
      <Header />
      {/* Main Content: 최대 너비를 가진 블로그 영역 */}
      <main className="w-full max-w-3xl flex-1 p-4 md:p-6 lg:p-8 mt-4"> {/* 🔑 패딩 추가 */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/posts/:id" element={<PostDetailPage />} />
          <Route path="/create-post" element={<CreatePostPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </main>

      <footer className="w-full text-center p-4 text-gray-500 text-sm border-t border-gray-200 mt-8"> {/* 🔑 border-t 추가 */}
        © 2025 My Blog App. All rights reserved.
      </footer>
    </div>
  );
}

export default App;