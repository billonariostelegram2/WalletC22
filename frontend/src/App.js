import React, { useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "./components/ui/toaster";

function App() {
  useEffect(() => {
    // Safer method to remove Emergent notifications
    const removeEmergentNotifications = () => {
      // Wait for DOM to be fully loaded
      if (!document.body) return;
      
      try {
        // Find elements containing "Made with Emergent" text
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
          null,
          false
        );
        
        const textNodes = [];
        let node;
        
        while ((node = walker.nextNode()) !== null) {
          if (node.textContent && 
              (node.textContent.includes('Made with Emergent') || 
               node.textContent.includes('made with emergent'))) {
            textNodes.push(node);
          }
        }
        
        // Remove parent elements of matching text nodes
        textNodes.forEach(textNode => {
          let parent = textNode.parentElement;
          while (parent && parent !== document.body) {
            if (parent.style && parent.style.position === 'fixed') {
              parent.remove();
              break;
            }
            parent = parent.parentElement;
          }
        });
      } catch (error) {
        // Silently ignore errors to prevent breaking the app
        console.warn('Error removing emergent notifications:', error);
      }
    };

    // Run after a delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      removeEmergentNotifications();
      
      // Set up periodic cleanup
      const intervalId = setInterval(removeEmergentNotifications, 3000);
      
      return () => clearInterval(intervalId);
    }, 2000);
    
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <AuthProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/registro" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/panel" element={<UserDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </div>
    </AuthProvider>
  );
}

export default App;