import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Drives from './pages/Drives';
import DriveDetail from './pages/DriveDetail';
import MapPage from './pages/MapPage';
import Leaderboard from './pages/Leaderboard';
import Transparency from './pages/Transparency';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import ReportSpot from './pages/ReportSpot';
import Certificate from './pages/Certificate';

function AnimatedRoutes() {
  const location = useLocation();
  const noFooterPaths = ['/map', '/login', '/register', '/verify-email'];
  const showFooter = !noFooterPaths.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Landing />} />
            <Route path="/drives" element={<Drives />} />
            <Route path="/drives/:id" element={<DriveDetail />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/transparency" element={<Transparency />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/report" element={<ReportSpot />} />
            <Route path="/certificate/:driveId" element={<Certificate />} />
          </Routes>
        </AnimatePresence>
      </main>
      {showFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AnimatedRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
