
import React from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import PriceTicker from '@/components/PriceTicker';
import MapSection from '@/components/MapSection';
import FeaturedProducts from '@/components/FeaturedProducts';
import Footer from '@/components/Footer';
import ChatButton from '@/components/chat/ChatButton';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Header />
      <HeroSection />
      <PriceTicker />
      <MapSection />
      <FeaturedProducts />
      <Footer />
      <ChatButton />
    </div>
  );
};

export default Index;
