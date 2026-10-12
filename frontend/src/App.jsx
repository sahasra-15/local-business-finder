import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { LocationProvider } from './context/LocationContext';

import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import BusinessDetailPage from './pages/BusinessDetailPage';
import MapViewPage from './pages/MapViewPage';
import CategoriesPage from './pages/CategoriesPage';
import FavoritesPage from './pages/FavoritesPage';
import UserProfilePage from './pages/UserProfilePage';
import OwnerDashboardPage from './pages/owner/OwnerDashboardPage';
import BusinessFormPage from './pages/owner/BusinessFormPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <LocationProvider>
          <BrowserRouter>
            <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/explore" element={<ExplorePage />} />
                  <Route path="/business/:id" element={<BusinessDetailPage />} />
                  <Route path="/map" element={<MapViewPage />} />
                  <Route path="/categories" element={<CategoriesPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />

                  {/* Customer protected routes */}
                  <Route
                    path="/favorites"
                    element={
                      <ProtectedRoute>
                        <FavoritesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <UserProfilePage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Business owner protected routes */}
                  <Route
                    path="/owner"
                    element={
                      <ProtectedRoute allowedRoles={['business_owner', 'admin']}>
                        <OwnerDashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/owner/add"
                    element={
                      <ProtectedRoute allowedRoles={['business_owner', 'admin']}>
                        <BusinessFormPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/owner/edit/:id"
                    element={
                      <ProtectedRoute allowedRoles={['business_owner', 'admin']}>
                        <BusinessFormPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin protected routes */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboardPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* 404 Route */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </LocationProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
