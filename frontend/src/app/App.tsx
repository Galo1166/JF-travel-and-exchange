import { useState, useEffect } from 'react';
import { Toaster } from './components/ui/sonner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { DestinationsPage } from './pages/DestinationsPage';
import { ToursPage } from './pages/ToursPage';
import { TourDetailsPage } from './pages/TourDetailsPage';
import { BookingPage } from './pages/BookingPage';
import { BookingConfirmationPage } from './pages/BookingConfirmationPage';
import { CurrencyExchangePage } from './pages/CurrencyExchangePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { UserDashboard } from './pages/UserDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { auth } from '../config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

type Page = 
  | 'home' 
  | 'about' 
  | 'destinations' 
  | 'tours' 
  | 'tour-details' 
  | 'booking' 
  | 'booking-confirmation'
  | 'currency'
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'dashboard'
  | 'admin';

interface PageData {
  tourId?: string;
  filterCountry?: string;
  booking?: any;
  tour?: any;
}

export default function App() {
  // Initialize state from localStorage
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    const saved = localStorage.getItem('currentPage');
    return (saved as Page) || 'home';
  });
  const [pageData, setPageData] = useState<PageData>(() => {
    const saved = localStorage.getItem('pageData');
    return saved ? JSON.parse(saved) : {};
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    return localStorage.getItem('selectedCurrency') || 'USD';
  });
  const [isLoading, setIsLoading] = useState(true);

  const handleNavigate = (page: Page, data?: PageData) => {
    setCurrentPage(page);
    setPageData(data || {});
    // Save to localStorage
    localStorage.setItem('currentPage', page);
    localStorage.setItem('pageData', JSON.stringify(data || {}));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCurrencyChange = (currency: string) => {
    setSelectedCurrency(currency);
    localStorage.setItem('selectedCurrency', currency);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    // sign out from Firebase as well
    signOut(auth).catch(() => {});
    setIsAuthenticated(false);
    setCurrentPage('home');
    // Clear page state on logout
    localStorage.setItem('currentPage', 'home');
    localStorage.setItem('pageData', '{}');
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        setUserEmail(user.email);
        
        // Check if user is admin
        try {
          const response = await fetch('http://localhost:8000/api/auth/check-admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email }),
          });
          const data = await response.json();
          setIsAdmin(data.isAdmin || false);
        } catch (error) {
          console.error('Failed to check admin status:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAuthenticated(false);
        setIsAdmin(false);
        setUserEmail(null);
      }
      // Set loading to false after auth check completes
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Pages that don't need navbar/footer
  const fullPageLayouts = ['login', 'register', 'forgot-password'];
  const showLayout = !fullPageLayouts.includes(currentPage);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} selectedCurrency={selectedCurrency} />;
      case 'about':
        return <AboutPage />;
      case 'destinations':
        return <DestinationsPage onNavigate={handleNavigate} />;
      case 'tours':
        return <ToursPage onNavigate={handleNavigate} initialFilter={pageData} selectedCurrency={selectedCurrency} />;
      case 'tour-details':
        return pageData.tourId ? (
          <TourDetailsPage tourId={pageData.tourId} onNavigate={handleNavigate} selectedCurrency={selectedCurrency} />
        ) : (
          <HomePage onNavigate={handleNavigate} />
        );
      case 'booking':
        return pageData.tourId ? (
          <BookingPage 
            tourId={pageData.tourId} 
            onNavigate={handleNavigate} 
            isAuthenticated={isAuthenticated}
            selectedCurrency={selectedCurrency}
          />
        ) : (
          <HomePage onNavigate={handleNavigate} />
        );
      case 'booking-confirmation':
        return (
          <ErrorBoundary>
            <BookingConfirmationPage 
              bookingData={pageData} 
              onNavigate={handleNavigate} 
            />
          </ErrorBoundary>
        );
      case 'currency':
        return <CurrencyExchangePage onNavigate={handleNavigate} isAuthenticated={isAuthenticated} />;
      case 'login':
        return <LoginPage onNavigate={handleNavigate} onLogin={handleLogin} />;
      case 'register':
        return <RegisterPage onNavigate={handleNavigate} onLogin={handleLogin} />;
      case 'forgot-password':
        return <ForgotPasswordPage onNavigate={handleNavigate} />;
      case 'dashboard':
        return isAuthenticated ? (
          <UserDashboard onNavigate={handleNavigate} selectedCurrency={selectedCurrency} />
        ) : (
          <LoginPage onNavigate={handleNavigate} onLogin={handleLogin} />
        );
      case 'admin':
        return <AdminDashboard onNavigate={handleNavigate} selectedCurrency={selectedCurrency} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Loading Screen */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-6">
            {/* Spinner Animation */}
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-gray-200 rounded-full" />
              <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 border-r-blue-600 rounded-full animate-spin" />
            </div>
            
            {/* Loading Text */}
            <div className="text-center">
              <p className="text-xl font-semibold text-gray-800">Loading</p>
              <p className="text-sm text-gray-500 mt-1">Please wait while we prepare everything...</p>
            </div>
          </div>
        </div>
      )}

      {!isLoading && (
        <>
          {showLayout && (
            <Navbar
              currentPage={currentPage}
              onNavigate={handleNavigate}
              isAuthenticated={isAuthenticated}
              isAdmin={isAdmin}
              onLogout={handleLogout}
              selectedCurrency={selectedCurrency}
              onCurrencyChange={handleCurrencyChange}
            />
          )}
          
          <main className="flex-1">
            {renderPage()}
          </main>
          
          {showLayout && <Footer onNavigate={handleNavigate} />}
          
          <Toaster position="top-right" />
        </>
      )}
    </div>
  );
}
