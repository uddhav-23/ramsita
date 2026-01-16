import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';
import Login from './Login';
import AdminDashboard from './AdminDashboard';
import BookingForm from './BookingForm';
import QRScanner from './QRScanner';
import BookingsList from './BookingsList'; // Import the actual component
import Settings from './Settings';
import ErrorBoundary from './ErrorBoundary.jsx';
import QRView from './QRView';

function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <div className="min-h-screen bg-background text-foreground">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<BookingForm />} />
              <Route path="/qr/:id" element={<QRView />} />
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/scanner" element={<ProtectedRoute><QRScanner /></ProtectedRoute>} />
              <Route path="/admin/bookings" element={<ProtectedRoute><BookingsList /></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            </Routes>
          </div>
        </AuthProvider>
      </Router>
      </ErrorBoundary>
  );
}

export default App;