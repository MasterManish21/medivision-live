import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Hospitals from './pages/Hospitals';
import ChatbotPage from './pages/ChatbotPage';
import Auth from './pages/Auth';
import SymptomChecker from './pages/SymptomChecker';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 500,
              },
              success: {
                style: { background: '#10b981', color: '#fff' },
                iconTheme: { primary: '#fff', secondary: '#10b981' },
              },
              error: {
                style: { background: '#ef4444', color: '#fff' },
                iconTheme: { primary: '#fff', secondary: '#ef4444' },
              },
            }}
          />

          {/* Global floating chatbot (visible on all pages) */}
          <Chatbot />

          <Routes>
            {/* Auth page — no navbar/footer */}
            <Route path="/auth" element={<Auth />} />

            {/* Main layout */}
            <Route
              path="/*"
              element={
                <div className="flex flex-col min-h-screen">
                  <Navbar />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/"          element={<Home />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/hospitals" element={<Hospitals />} />
                      <Route path="/chatbot"   element={<ChatbotPage />} />
                      <Route path="/symptoms"  element={<SymptomChecker />} />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
