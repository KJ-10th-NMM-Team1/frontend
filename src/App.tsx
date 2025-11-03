import MainLayout from '@/layouts/MainLayout'
import OwnerPage from '@/pages/OwnerPage'
import TranslatorPage from '@/pages/TranslatorPage'
import { LoginView } from '@/components/LoginPage'
import { SignUpView } from '@/components/SignUpPage'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<OwnerPage />} />
          <Route path="/translator" element={<TranslatorPage />} />
          <Route path="/login" element={<LoginView />} />
          <Route path="/signup" element={<SignUpView />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
