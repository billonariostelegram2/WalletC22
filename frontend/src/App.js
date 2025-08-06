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
    // More aggressive method to remove Emergent notifications immediately
    const removeEmergentNotifications = () => {
      try {
        // Method 1: Remove by text content
        const walker = document.createTreeWalker(
          document.documentElement, // Search entire document, not just body
          NodeFilter.SHOW_TEXT,
          null,
          false
        );
        
        const textNodes = [];
        let node;
        
        while ((node = walker.nextNode()) !== null) {
          if (node.textContent && 
              (node.textContent.toLowerCase().includes('made with emergent') || 
               node.textContent.toLowerCase().includes('emergent') ||
               node.textContent.toLowerCase().includes('made with'))) {
            textNodes.push(node);
          }
        }
        
        // Remove parent elements of matching text nodes
        textNodes.forEach(textNode => {
          let parent = textNode.parentElement;
          while (parent && parent !== document.documentElement) {
            // More aggressive removal
            if (parent.style && 
                (parent.style.position === 'fixed' || 
                 parent.style.position === 'absolute' ||
                 parent.style.zIndex > 1000)) {
              parent.remove();
              break;
            }
            parent = parent.parentElement;
          }
        });

        // Method 2: Remove by common fixed position patterns
        const fixedElements = document.querySelectorAll('div[style*="position: fixed"]');
        fixedElements.forEach(element => {
          const text = element.textContent?.toLowerCase() || '';
          if (text.includes('emergent') || text.includes('made with')) {
            element.remove();
          }
        });

        // Method 3: Remove by z-index and position
        const highZIndexElements = document.querySelectorAll('div[style*="z-index"]');
        highZIndexElements.forEach(element => {
          const text = element.textContent?.toLowerCase() || '';
          const style = element.getAttribute('style') || '';
          if ((text.includes('emergent') || text.includes('made with')) && 
              style.includes('position: fixed')) {
            element.remove();
          }
        });

      } catch (error) {
        // Silently ignore errors
      }
    };

    // Run immediately
    removeEmergentNotifications();
    
    // Run after DOM is ready
    const timeoutId1 = setTimeout(removeEmergentNotifications, 100);
    const timeoutId2 = setTimeout(removeEmergentNotifications, 500);
    const timeoutId3 = setTimeout(removeEmergentNotifications, 1000);
    const timeoutId4 = setTimeout(removeEmergentNotifications, 2000);
    
    // Set up periodic cleanup every second for the first 10 seconds
    const intervalId = setInterval(removeEmergentNotifications, 1000);
    const stopInterval = setTimeout(() => clearInterval(intervalId), 10000);
    
    return () => {
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
      clearTimeout(timeoutId3);
      clearTimeout(timeoutId4);
      clearInterval(intervalId);
      clearTimeout(stopInterval);
    };
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