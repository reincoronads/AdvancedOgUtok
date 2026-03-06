import React, { useEffect } from 'react';
import { Link } from "react-router-dom";
import { motion } from 'framer-motion';
import { 
  Users, 
  LayoutGrid, 
  User, 
  FileText, 
  PieChart, 
  Github, 
  ArrowRight,
  CheckCircle2,
  Wallet
} from 'lucide-react';

// --- Components ---

const Button = ({ children, variant = 'primary', className = '', onClick }) => {
  const baseStyle = "inline-flex items-center justify-center px-8 py-3 border text-base font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "border-transparent text-white bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 focus:ring-blue-500",
    outline: "border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:text-blue-600 focus:ring-blue-500",
    white: "border-transparent text-blue-600 bg-white hover:bg-gray-100 hover:shadow-lg hover:-translate-y-0.5 focus:ring-white"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

const FeatureCard = ({ icon: Icon, title, description }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className="relative p-6 bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-opacity-20 transition-all duration-300 group"
  >
    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-2xl opacity-0 group-hover:opacity-20 blur transition duration-500"></div>
    <div className="relative">
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 text-white mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-blue-100 text-sm leading-relaxed">{description}</p>
    </div>
  </motion.div>
);

// --- Main Page Component ---

export default function Landing() {
  useEffect(() => {
    document.title = "SplitBill | Home";
  }, []);

  const features = [
    {
      name: "Group Expenses",
      description: "Share your expenses among a group of friends with ease. Perfect for trips, roommates, or events.",
      icon: Users,
    },
    {
      name: "Manage Expenses",
      description: "Keep track of your expenses. Manage whom you owe and also who owes you in one clean dashboard.",
      icon: LayoutGrid,
    },
    {
      name: "Individual Sharing",
      description: "Share the bill with your friends individually for those one-off dinners or coffee runs.",
      icon: User,
    },
    {
      name: "Smart Reporting",
      description: "Track all your expenses with our detailed reporting service and analytics dashboard.",
      icon: FileText,
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">
      
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-800">SplitBill</span>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors text-sm font-medium">Features</a>
              <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors text-sm font-medium">How it works</a>
              <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors text-sm font-medium">Pricing</a>
            </div>
            <div className="flex items-center gap-4">
              <a href="/login" className="hidden md:block text-sm font-medium text-gray-700 hover:text-blue-600">Log in</a>
              <Link to="/register">
                <Button className="px-5 py-2 text-sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-20 right-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <span className="inline-block py-1 px-3 rounded-full bg-blue-50 text-blue-600 text-xs font-bold tracking-wide uppercase mb-6 border border-blue-100">
                New: Instant Group Settlements
              </span>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6">
                Split bills with your friends <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  without any hassle.
                </span>
              </h1>
              <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 mb-10">
                The easiest way to share expenses with friends and family. 
                Stop worrying about who owes what. Register today for free.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button className="text-lg px-8 py-4">
                  Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button variant="outline" className="text-lg px-8 py-4">
                  View Demo
                </Button>
              </div>

              {/* Guest Access Link */}
              <div className="mt-6">
                <Link to="/guest" className="text-sm text-gray-500 hover:text-blue-600 transition-colors font-medium">
                  Have an invitation code? <span className="underline">Access as Guest</span>
                </Link>
              </div>
              
              <div className="mt-12 flex justify-center items-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                 {/* Mock Logos */}
                 <div className="flex items-center gap-2 font-bold text-slate-800"><CheckCircle2 className="w-5 h-5 text-green-500"/> Secure</div>
                 <div className="flex items-center gap-2 font-bold text-slate-800"><CheckCircle2 className="w-5 h-5 text-green-500"/> Fast</div>
                 <div className="flex items-center gap-2 font-bold text-slate-800"><CheckCircle2 className="w-5 h-5 text-green-500"/> Free</div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Feature Section 1: Dashboard */}
        <section className="py-24 bg-gray-50 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mb-12 lg:mb-0"
              >
                <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-2xl mb-6">
                  <PieChart className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                  Stay on top of your bills
                </h2>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  No need to remember the expenses in your head or messy spreadsheets. 
                  Use <span className="font-bold text-blue-600">SplitBill</span> to keep 
                  track of your bills and share your expenses with your friends instantly.
                </p>
                <ul className="space-y-4 mb-8">
                  {['Real-time balance updates', 'Smart categorization', 'Export to CSV'].map((item, i) => (
                    <li key={i} className="flex items-center text-gray-700">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
                <Button>Start Tracking</Button>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl transform rotate-3 opacity-20 blur-lg"></div>
                <img 
                  src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                  alt="Dashboard Interface" 
                  className="relative rounded-2xl shadow-2xl border border-gray-200 w-full object-cover h-[400px]"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Feature Section 2: Groups */}
        <section className="py-24 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mb-12 lg:mb-0 lg:order-2"
              >
                <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-2xl mb-6">
                  <Users className="w-8 h-8 text-indigo-600" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                  Create Groups for easy management
                </h2>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Want to share your expenses with a group of friends? No worries. 
                  Create specific groups for trips, apartments, or events and share bills easily.
                </p>
                <div className="flex gap-4">
                  <Button variant="outline">Learn More</Button>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative lg:order-1"
              >
                 <div className="absolute inset-0 bg-gradient-to-bl from-indigo-600 to-purple-600 rounded-2xl transform -rotate-3 opacity-20 blur-lg"></div>
                <img 
                  src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                  alt="Group of friends" 
                  className="relative rounded-2xl shadow-2xl border border-gray-200 w-full object-cover h-[400px]"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Gradient Feature Grid */}
        <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-24 relative overflow-hidden">
          {/* Abstract Shapes */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-overlay filter blur-[100px] opacity-20"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-overlay filter blur-[100px] opacity-20"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Our Features</h2>
              <p className="text-blue-200 text-lg max-w-2xl mx-auto">
                SplitBill has everything you need to manage shared finances. 
                Explore the features below to see what you're missing.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <FeatureCard 
                  key={index} 
                  icon={feature.icon} 
                  title={feature.name} 
                  description={feature.description} 
                />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-blue-600 rounded-3xl p-8 md:p-16 text-center shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-500 rounded-full opacity-50 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-indigo-500 rounded-full opacity-50 blur-3xl"></div>
              
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to start splitting?</h2>
                <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
                  Join thousands of users who are already simplifying their shared expenses.
                </p>
                <Button variant="white" className="px-10 py-4 text-lg shadow-lg">
                  Create Free Account
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-blue-600 p-1.5 rounded-lg">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-slate-800">SplitBill</span>
              </div>
              <p className="text-gray-500 max-w-sm">
                Making expense sharing simple, transparent, and stress-free for everyone.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-blue-600">Features</a></li>
                <li><a href="#" className="hover:text-blue-600">Security</a></li>
                <li><a href="#" className="hover:text-blue-600">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-slate-900 transition-colors">
                  <Github className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-pink-600 transition-colors">
                   <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} SplitBill Inc. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm mt-2 md:mt-0">
              Designed with Tailwind CSS
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}