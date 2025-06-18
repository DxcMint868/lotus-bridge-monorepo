
import React from 'react';
import LotusIcon from './LotusIcon';

const Footer = () => {
  return (
    <footer className="border-t border-pink-100 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <LotusIcon size={32} />
              <span className="text-xl font-bold lotus-text-gradient">Lotus Bridge</span>
            </div>
            <p className="text-gray-600 text-sm">
              The premier Vietnamese multichain bridge, connecting your assets with cultural elegance and cutting-edge DeFi technology.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-lotus-pink transition-colors">Bridge Assets</a></li>
              <li><a href="#" className="hover:text-lotus-pink transition-colors">Supported Networks</a></li>
              <li><a href="#" className="hover:text-lotus-pink transition-colors">Transaction History</a></li>
              <li><a href="#" className="hover:text-lotus-pink transition-colors">Gas Estimation</a></li>
            </ul>
          </div>

          {/* Vietnamese Focus */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Vietnamese Tokens</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-lotus-pink transition-colors">VNST (Vietnam Stable Token)</a></li>
              <li><a href="#" className="hover:text-lotus-pink transition-colors">VNDC (VNDC Stablecoin)</a></li>
              <li><a href="#" className="hover:text-lotus-pink transition-colors">Supported Exchanges</a></li>
              <li><a href="#" className="hover:text-lotus-pink transition-colors">Vietnamese DeFi</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-lotus-pink transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-lotus-pink transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-lotus-pink transition-colors">Discord Community</a></li>
              <li><a href="#" className="hover:text-lotus-pink transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-pink-100 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-600">
              © 2024 Lotus Bridge. Made with 🇻🇳 in Vietnam.
            </p>
            <div className="flex space-x-6 text-sm text-gray-600">
              <a href="#" className="hover:text-lotus-pink transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-lotus-pink transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-lotus-pink transition-colors">Security</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
