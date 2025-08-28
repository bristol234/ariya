import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  CreditCard, 
  DollarSign, 
  Users, 
  CheckCircle, 
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  Star,
  Award,
  Home,
  Calculator,
  GraduationCap,
  Building,
  Menu,
  MessageCircle,
  Percent,
  Lock,
  Facebook,
  Instagram,
  Linkedin
} from 'lucide-react';
import LoginModal from '../components/LoginModal';

// Custom ApplyOnline Icon Component
const ApplyOnlineIcon: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 512 512" 
    className={className}
    fill="currentColor"
  >
    <path d="M304 24V41.3c8.5 1.2 16.7 3.1 24.1 5.1c8.5 2.3 13.6 11 11.3 19.6s-11 13.6-19.6 11.3c-11.1-3-22-5.2-32.1-5.3c-8.4-.1-17.3 1.8-23.6 5.5c-5.7 3.4-8.1 7.3-8.1 12.8c0 3.7 1.3 6.5 7.3 10.1c6.9 4.1 16.6 7.1 29.2 10.9l.5 .1 0 0c11.3 3.4 25.3 7.6 36.3 14.6c12.1 7.6 22.4 19.7 22.7 38.2c.3 19.3-9.6 33.3-22.9 41.6c-7.7 4.8-16.4 7.6-25.1 9.1V232c0 8.8-7.2 16-16 16s-16-7.2-16-16V214.2c-11.2-2.1-21.7-5.7-30.9-8.9c-2.1-.7-4.2-1.4-6.2-2.1c-8.4-2.8-12.9-11.9-10.1-20.2s11.9-12.9 20.2-10.1c2.5 .8 4.8 1.6 7.1 2.4l0 0 0 0c13.6 4.6 24.6 8.4 36.3 8.7c9.1 .3 17.9-1.7 23.7-5.3c5.1-3.2 7.9-7.3 7.8-14c-.1-4.6-1.8-7.8-7.7-11.6c-6.8-4.3-16.5-7.4-29-11.2l-1.6-.5 0 0c-11-3.3-24.3-7.3-34.8-13.7c-12-7.2-22.6-18.9-22.7-37.3C224 71.1 234.9 57.7 247.9 50c7.5-4.4 15.8-7.2 24.1-8.7V24c0-8.8 7.2-16 16-16s16 7.2 16 16zM151 317.4c13.1-8.8 28.6-13.4 44.4-13.4H344c30.9 0 56 25.1 56 56c0 8.6-1.9 16.7-5.4 24h5.6l94.7-56.4c8.3-4.9 17.8-7.6 27.5-7.6h1.3c28.9 0 52.3 23.4 52.3 52.3c0 17.7-9 34.2-23.8 43.8L432.6 493.9c-18.2 11.8-39.4 18.1-61 18.1H16c-8.8 0-16-7.2-16-16s7.2-16 16-16H371.5c15.5 0 30.6-4.5 43.6-12.9l119.6-77.8c5.8-3.7 9.2-10.2 9.2-17c0-11.2-9.1-20.3-20.3-20.3h-1.3c-3.9 0-7.7 1.1-11.1 3l-98.5 58.7c-2.5 1.5-5.3 2.3-8.2 2.3H344 320 256c-8.8 0-16-7.2-16-16s7.2-16 16-16h64 24c13.3 0 24-10.7 24-24s-10.7-24-24-24H195.4c-9.5 0-18.7 2.8-26.6 8.1L88.9 397.3c-2.6 1.8-5.7 2.7-8.9 2.7H16c-8.8 0-16-7.2-16-16s7.2-16 16-16H75.2L151 317.4z"></path>
  </svg>
);

const HomePage: React.FC = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const loginButtonRef = useRef<HTMLButtonElement>(null);

  const heroPromotions = [
    {
      title: 'Kids and Teens Bonus',
      subtitle: 'Our Big Kids and Teens offer is back! Earn some summer spend on us!',
      cta: 'Learn More and Apply Online',
      image: 'family-camping'
    }
  ];

  const promotionalCards = [
    {
      title: 'Celebrating 70 Years',
      subtitle: 'A Letter from Our President',
      image: '/stock-34-1x1.jpg',
      bgColor: 'bg-[#002C5F]'
    },
    {
      title: 'Cornerstone Cares',
      subtitle: 'Harris-Hillman PENCIL Partner',
      image: '/stock-23-1x1.jpg',
      bgColor: 'bg-[#002C5F]'
    },
    {
      title: 'Certificate Promotion',
      subtitle: 'Earn up to 4.15% APY',
      image: '/stock-36-1x1.jpg',
      bgColor: 'bg-[#002C5F]'
    }
  ];

  const quickActions = [
    { name: 'Apply Online', icon: ApplyOnlineIcon, href: '/apply' },
    { name: 'Open Account', icon: CreditCard, href: '/login' },
    { name: 'Bank Online', icon: Home, href: '/login' },
    { name: 'Branches', icon: MapPin, href: '/branches' },
    { name: 'Calculators', icon: Calculator, href: '/calculators' },
    { name: 'Careers', icon: GraduationCap, href: '/careers' }
  ];

  const rates = [
    { type: 'Vehicle Loans', rate: '5.75%', label: 'APR as low as' },
    { type: 'Personal Loans', rate: '11.25%', label: 'APR as low as' },
    { type: 'Home Equity Loans', rate: '6.750%', label: 'APR as low as' },
    { type: 'Certificates', rate: '4.15%', label: 'APY as high as' }
  ];

  const openLoginModal = () => {
    if (loginButtonRef.current) {
      const rect = loginButtonRef.current.getBoundingClientRect();
      setModalPosition({
        x: window.innerWidth - rect.right,
        y: rect.bottom + 5
      });
    }
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };



  return (
    <div className="min-h-screen bg-[#faf5f0]">
      {/* Header with Logo */}
      <header className="bg-[#002C5F] text-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center">
                <img 
                  src="/Untitledlogo.png" 
                  alt="Cornerstone Financial Credit Union" 
                  className="h-16 w-auto"
                />
              </Link>
            </div>

            {/* Navigation Icons */}
            <div className="flex items-center space-x-6">
              <div className="flex flex-col items-center">
                <Menu size={24} />
                <span className="text-xs mt-1">Menu</span>
              </div>
              <div className="flex flex-col items-center">
                <MessageCircle size={24} />
                <span className="text-xs mt-1">Contact</span>
              </div>
              <div className="flex flex-col items-center">
                <DollarSign size={24} />
                <span className="text-xs mt-1">Payments</span>
              </div>
              <div className="flex flex-col items-center">
                <Percent size={24} />
                <span className="text-xs mt-1">Rates</span>
              </div>
              <div className="flex flex-col items-center relative">
                <button
                  ref={loginButtonRef}
                  onClick={openLoginModal}
                  className="flex flex-col items-center hover:bg-[#003d99] p-2 rounded transition-colors"
                >
                  <Lock size={24} />
                  <span className="text-xs mt-1">Login</span>
                </button>
                
                {/* Login Modal */}
                <LoginModal 
                  isOpen={isLoginModalOpen} 
                  onClose={closeLoginModal} 
                  position={modalPosition}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Alert Banner */}
      <div className="bg-gray-300 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-800 text-sm">
            Attention: If you have experienced fraud on your debit card, please call 855-448-8197. Please note Instant Issue cards at branch locations are temporarily unavailable.
          </p>
        </div>
      </div>

      {/* Hero Section with Family Image */}
      <section className="py-12 bg-[#faf5f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Family Image */}
            <div className="relative">
              <img 
                src="/stock-43-2x1.jpg" 
                alt="Family camping around campfire" 
                className="w-full h-96 object-cover rounded-lg"
              />
              {/* Carousel Dots */}
              <div className="flex justify-center mt-4 space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <div className="w-2 h-2 bg-[#BE9B4C] rounded-full"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              </div>
            </div>

            {/* Promotional Content */}
            <div className="p-8">
              <h2 className="text-3xl font-bold mb-4 text-black">Kids and Teens Bonus</h2>
              <p className="text-lg mb-6 text-black">Our Big Kids and Teens offer is back! Earn some summer spend on us!</p>
              <button className="bg-[#BE9B4C] text-[#002C5F] font-semibold px-6 py-3 rounded hover:bg-[#a88a43] transition-colors">
                Learn More and Apply Online
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-12 bg-[#f9f3ed]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.href}
                className="flex flex-col items-center p-6 bg-[#faf5f0] rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-[#BE9B4C] rounded-lg flex items-center justify-center mb-3">
                  <action.icon size={24} className="text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900 text-center">{action.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Promotional Cards */}
      <section className="py-12 bg-[#faf5f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {promotionalCards.map((card, index) => (
              <div key={index} className="relative overflow-hidden rounded-lg shadow-lg">
                <div className="w-full h-48 relative">
                  <img 
                    src={card.image} 
                    alt={card.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className={`${card.bgColor} text-white p-6`}>
                  <h3 className="text-xl font-bold mb-2">{card.title}</h3>
                  <p className="text-sm opacity-90">{card.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rates Section */}
      <section className="py-16 bg-[#f9f3ed]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#002C5F] mb-4">Our Rates</h2>
            <p className="text-lg text-gray-600">We are proud to offer competitive rates for our members.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {rates.map((rate, index) => (
              <div key={index} className="text-center">
                <h3 className="text-xl font-bold text-[#002C5F] mb-2">{rate.type}</h3>
                <p className="text-sm text-gray-600 mb-2">{rate.label}</p>
                <p className="text-4xl font-bold text-[#002C5F]">{rate.rate}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="flex justify-center space-x-6 mb-4">
              <a href="/careers" className="text-gray-300 hover:text-white">Careers</a>
              <a href="/disclosures" className="text-gray-300 hover:text-white">Disclosures</a>
              <a href="/privacy" className="text-gray-300 hover:text-white">Privacy Policy</a>
            </div>
            <p className="text-gray-300 mb-2">PO Box 120729, Nashville, TN 37212 - Routing # 264080811</p>
            <p className="text-gray-400 text-sm">Copyright © 2025 Cornerstone Financial Credit Union. All rights reserved. Federally insured by NCUA.</p>
          </div>
          
          <div className="flex justify-center space-x-4 mb-8">
            <a href="#" className="w-10 h-10 bg-[#002C5F] rounded flex items-center justify-center hover:bg-[#003d99] transition-colors">
              <Facebook size={20} className="text-white" />
            </a>
            <a href="#" className="w-10 h-10 bg-[#002C5F] rounded flex items-center justify-center hover:bg-[#003d99] transition-colors">
              <Instagram size={20} className="text-white" />
            </a>
            <a href="#" className="w-10 h-10 bg-[#002C5F] rounded flex items-center justify-center hover:bg-[#003d99] transition-colors">
              <Linkedin size={20} className="text-white" />
            </a>
          </div>
          
          <div className="flex justify-center space-x-6 mb-6">
            <div className="flex items-center space-x-2">
              <img 
                src="/icon-ehl.svg" 
                alt="Equal Housing Lender" 
                className="h-8 w-auto"
              />
              
            </div>
            <div className="flex items-center space-x-2">
              <img 
                src="/icon-ncua.svg" 
                alt="NCUA" 
                className="h-8 w-auto"
              />
              
            </div>
            <div className="flex items-center space-x-2">
              <img 
                src="/darkgray-seal-200-42-bbb-10479.png" 
                alt="BBB Accredited Business" 
                className="h-8 w-auto"
              />
              
            </div>
          </div>
          
          <div className="text-center text-sm text-gray-400">
            <p>APR=Annual Percentage Rate. APY=Annual Percentage Yield.</p>
            <p>Membership is limited. Credit subject to approval. Rates subject to change.</p>
            <p>Loan rates based on credit history, so your rate may differ.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage; 