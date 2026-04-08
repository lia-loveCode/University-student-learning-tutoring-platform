import { Routes, Route } from 'react-router-dom'
import RootLayout from './layout/RootLayout.jsx'

import HomePage from '../modules/home/pages/HomePage.jsx'
import CoursesPage from '../modules/courses/pages/CoursesPage.jsx'
import CourseDetailPage from '../modules/courses/pages/CourseDetailPage.jsx'
import PlanPage from '../modules/plan/pages/PlanPage.jsx'
import ProgressPage from '../modules/progress/pages/ProgressPage.jsx'
import QAPage from '../modules/qa/pages/QAPage.jsx'
import ProfilePage from '../modules/profile/pages/ProfilePage.jsx'
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
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

