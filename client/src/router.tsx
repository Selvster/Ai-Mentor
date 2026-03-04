import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RootLayout } from './layouts/RootLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { ProjectBriefingRoom } from './pages/ProjectBriefingRoom';
import { MentorDesk } from './pages/MentorDesk';
import { ProgressTracking } from './pages/ProgressTracking';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          element={
            <ProtectedRoute>
              <RootLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects/:id" element={<ProjectBriefingRoom />} />
          <Route path="/reviews/:projectId" element={<MentorDesk />} />
          <Route path="/progress/:projectId" element={<ProgressTracking />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
