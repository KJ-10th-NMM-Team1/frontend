import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    // 🔑 스크롤 시 상단 고정, 배경색/그림자/패딩 강화
    <header className="w-full bg-white shadow-lg py-4 px-6 sticky top-0 z-50"> 
      <nav className="max-w-3xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-3xl font-extrabold text-blue-700 hover:text-blue-800 transition-colors duration-200"> {/* 🔑 폰트 강조, 호버 효과 */}
          My Blog
        </Link>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link
                to="/create-post"
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 shadow-md"
              >
                새 글 작성
              </Link>
              <span className="text-gray-700 font-medium">환영합니다, {user.email.split('@')[0]}!</span> {/* 🔑 이메일 앞부분만 표시 */}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-md"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link
                to="/register"
                className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200 text-sm font-medium"
              >
                회원가입
              </Link>
              <Link
                to="/login"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
              >
                로그인
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;