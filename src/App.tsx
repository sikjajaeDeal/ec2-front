
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Home from './pages/Index';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Sell from './pages/Sell';
import Search from './pages/Search';
import LikedProducts from './pages/LikedProducts';
import MyPosts from './pages/MyPosts';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import EditPost from './pages/EditPost';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from "@/components/ui/toaster"

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen bg-background">
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:postPk" element={<ProductDetail />} />
              <Route path="/sell" element={<Sell />} />
              <Route path="/search" element={<Search />} />
              <Route path="/liked-products" element={<LikedProducts />} />
              <Route path="/my-posts" element={<MyPosts />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/edit-post/:postPk" element={<EditPost />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <Toaster />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
