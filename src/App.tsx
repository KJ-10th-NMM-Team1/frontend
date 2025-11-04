import { LoginView } from '@/components/LoginPage'
import { SignUpView } from '@/components/SignUpPage'
import MainLayout from '@/layouts/MainLayout'
import OwnerPage from '@/pages/OwnerPage'
import TranslatorManagementPage from '@/pages/TranslatorManagementPage'
import TranslatorPage from '@/pages/TranslatorPage'
import { AuthProvider } from '@/providers/AuthProvider'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<OwnerPage />} />
            <Route path="/translator" element={<TranslatorPage />} />
            <Route path="/translators/manage" element={<TranslatorManagementPage />} />
            <Route path="/login" element={<LoginView />} />
            <Route path="/signup" element={<SignUpView />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
