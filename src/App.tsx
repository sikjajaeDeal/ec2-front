
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Sell from "./pages/Sell";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Profile from "./pages/Profile";
import ProfileSettings from "./pages/ProfileSettings";
import LikedProducts from "./pages/LikedProducts";
import MyPosts from "./pages/MyPosts";
import SignupVerify from "./pages/SignupVerify";
import SocialCallback from "./pages/SocialCallback";
import NotFound from "./pages/NotFound";
import ChatButton from "./components/chat/ChatButton";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:postPk" element={<ProductDetail />} />
            <Route path="/sell" element={<Sell />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/settings" element={<ProfileSettings />} />
            <Route path="/liked-products" element={<LikedProducts />} />
            <Route path="/my-posts" element={<MyPosts />} />
            <Route path="/signup/verify" element={<SignupVerify />} />
            <Route path="/login/oauth2/code/kakao" element={<SocialCallback />} />
            <Route path="/login/oauth2/code/google" element={<SocialCallback />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ChatButton />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
