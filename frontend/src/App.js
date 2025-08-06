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
    // ULTRA AGGRESSIVE method to remove Emergent notifications before they appear
    const removeEmergentNotifications = () => {
      try {
        // Method 1: Remove by text content search
        const walker = document.createTreeWalker(
          document.documentElement,
          NodeFilter.SHOW_TEXT,
          null,
          false
        );
        
        const textNodes = [];
        let node;
        
        while ((node = walker.nextNode()) !== null) {
          const text = node.textContent?.toLowerCase() || '';
          if (text.includes('made with emergent') || 
              text.includes('emergent') ||
              text.includes('made with')) {
            textNodes.push(node);
          }
        }
        
        textNodes.forEach(textNode => {
          let parent = textNode.parentElement;
          while (parent && parent !== document.documentElement) {
            if (parent.style && 
                (parent.style.position === 'fixed' || 
                 parent.style.position === 'absolute' ||
                 parseInt(parent.style.zIndex) > 1000)) {
              parent.remove();
              break;
            }
            parent = parent.parentElement;
          }
        });

        // Method 2: Remove suspicious fixed elements
        const fixedElements = document.querySelectorAll(
          'div[style*="position: fixed"], div[style*="position:fixed"]'
        );
        fixedElements.forEach(element => {
          const text = element.textContent?.toLowerCase() || '';
          const hasEmergentText = text.includes('emergent') || 
                                text.includes('made with') ||
                                text.includes('made') ||
                                text.includes('with');
          
          // Don't remove legitimate UI elements
          const isLegitimate = element.classList.length > 0 || 
                              element.id || 
                              element.closest('.toast') ||
                              element.closest('[class*="toast"]') ||
                              element.closest('[id*="toast"]');
          
          if (hasEmergentText && !isLegitimate) {
            element.remove();
          }
        });

        // Method 3: Remove by z-index and suspicious patterns
        const highZElements = document.querySelectorAll('*[style*="z-index"]');
        highZElements.forEach(element => {
          const text = element.textContent?.toLowerCase() || '';
          const style = element.getAttribute('style') || '';
          const zIndex = parseInt(element.style.zIndex) || 0;
          
          const hasEmergentText = text.includes('emergent') || text.includes('made with');
          const isFixed = style.includes('position: fixed') || style.includes('position:fixed');
          const isLegitimate = element.classList.length > 0 || element.id;
          
          if (hasEmergentText && isFixed && zIndex > 999 && !isLegitimate) {
            element.remove();
          }
        });

      } catch (error) {
        // Silently ignore errors
      }
    };

    // Set up MutationObserver to catch elements as they're added
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node;
            const text = element.textContent?.toLowerCase() || '';
            const style = element.getAttribute('style') || '';
            
            // Check if it's an Emergent notification
            const hasEmergentText = text.includes('emergent') || 
                                  text.includes('made with') ||
                                  text.includes('made') ||
                                  text.includes('with');
            const isFixed = style.includes('position: fixed') || 
                          style.includes('position:fixed');
            const isLegitimate = element.classList.length > 0 || 
                               element.id ||
                               element.closest('.toast') ||
                               element.closest('[class*="toast"]');
            
            if (hasEmergentText && isFixed && !isLegitimate) {
              element.remove();
            }
          }
        });
      });
    });

    // Start observing immediately
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });

    // Run removal immediately and aggressively
    removeEmergentNotifications();
    
    // Multiple immediate timeouts
    setTimeout(removeEmergentNotifications, 0);
    setTimeout(removeEmergentNotifications, 1);
    setTimeout(removeEmergentNotifications, 10);
    setTimeout(removeEmergentNotifications, 50);
    setTimeout(removeEmergentNotifications, 100);
    setTimeout(removeEmergentNotifications, 250);
    setTimeout(removeEmergentNotifications, 500);
    setTimeout(removeEmergentNotifications, 1000);
    
    // Continuous monitoring for first 5 seconds
    const intervalId = setInterval(removeEmergentNotifications, 50);
    const stopInterval = setTimeout(() => clearInterval(intervalId), 5000);
    
    return () => {
      observer.disconnect();
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