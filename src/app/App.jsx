import { Routes, Route } from 'react-router-dom'
import RootLayout from './layout/RootLayout.jsx'

import HomePage from '../modules/home/pages/HomePage.jsx'
import CoursesPage from '../modules/courses/pages/CoursesPage.jsx'
import CourseDetailPage from '../modules/courses/pages/CourseDetailPage.jsx'
import PlanPage from '../modules/plan/pages/PlanPage.jsx'
import ProgressPage from '../modules/progress/pages/ProgressPage.jsx'
import QAPage from '../modules/qa/pages/QAPage.jsx'
import ProfilePage from '../modules/profile/pages/ProfilePage.jsx'
import RegisterPage from '../modules/auth/pages/RegisterPage.jsx'
import LoginPage from '../modules/auth/pages/LoginPage.jsx'
import AuthCallbackPage from '../modules/auth/pages/AuthCallbackPage.jsx'
import ResetPasswordPage from '../modules/auth/pages/ResetPasswordPage.jsx'
import NotFoundPage from '../modules/notFound/pages/NotFoundPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:id" element={<CourseDetailPage />} />
        <Route path="/plan" element={<PlanPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/qa" element={<QAPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

