
import React from 'react';
import Header from '../components/Header';
import BridgeInterface from '../components/BridgeInterface';
import TransactionHistory from '../components/TransactionHistory';
import WagmiTestComponent from '../components/WagmiTestComponent';
import Footer from '../components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-primary/5 dong-son-pattern">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold lotus-text-gradient mb-4">
            Lotus Bridge
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Seamlessly bridge your assets across multiple blockchains with Vietnamese cultural elegance and cutting-edge DeFi technology.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <BridgeInterface />
            <WagmiTestComponent />
          </div>
          <div>
            <TransactionHistory />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
