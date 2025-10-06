"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter for navigation
import { ChevronRight, CheckCircle, Truck, Clock, Shield, Star, Phone, Mail, MapPin, ShoppingBag, Users, Award, Heart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import EnhancedNavbar from './components/MNav';

const OjarunzHomepage = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const router = useRouter(); // Initialize useRouter

const handleWaitlistSubmit = async () => {
  if (email && phone && location) {
    try {
      const response = await fetch('https://spawnback.vercel.app/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, phone, location }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        console.log('Waitlist signup successful:', data);
        setTimeout(() => {
          setIsSubmitted(false);
          setName('');
          setEmail('');
          setPhone('');
          setLocation('');
        }, 3000);
      } else {
        console.error('Waitlist signup failed:', data.message);
        alert(data.message); // Show error to user
      }
    } catch (error) {
      console.error('Error submitting waitlist:', error);
      alert('An error occurred. Please try again later.');
    }
  } else {
    alert('Please fill in all required fields.');
  }
};

  interface ScrollToSection {
    (sectionId: string): void;
  }

  const scrollToSection: ScrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'services', 'location', 'photos', 'contact'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'services', label: 'Services' },
    { id: 'location', label: 'Location' },
    { id: 'photos', label: 'Photos' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100">
      {/* Header Section */}
      <div id="home" className="relative min-h-screen overflow-hidden">
       
        <div className="relative z-10 flex items-center min-h-screen px-4 sm:px-6 md:px-12 lg:px-24 xl:px-36 pt-20">
          <div className="flex flex-col lg:flex-row items-center w-full mx-auto">
            <div className="flex-1 lg:pr-8 mb-8 lg:mb-0">
              <div className="inline-block bg-green-600 text-white px-4 py-2 rounded-full text-xs sm:text-sm font-medium mb-6">
                Fresh Farm Produce and Foodstuffs
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-4 leading-tight">
                OJARUNZ
              </h1>
              <p className="text-gray-600 text-base sm:text-lg lg:text-xl mb-6 max-w-md">
                Get fresh farm produce and foodstuffs directly from Nigerian markets delivered to your doorstep. 
                Quality produce, unbeatable convenience.
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
                {[2, 3, 4, 5].map((num) => (
                  <div key={num} className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500 rounded-full flex items-center justify-center overflow-hidden">
                    <img 
                      src={`/oj${num}.jpg`}
                      alt="Fresh Produce" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <button 
                onClick={() => router.push('/shop')} // Navigate to /pages/shop
                className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center space-x-2 text-sm sm:text-base"
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Shop now</span>
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
            <div className="flex-1 flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute -inset-6 sm:-inset-8 bg-yellow-400 rounded-full opacity-20"></div>
                <div className="absolute -inset-3 sm:-inset-4 bg-yellow-500 rounded-full opacity-30"></div>
                <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 lg:w-[500px] lg:h-[500px] bg-yellow-600 rounded-full overflow-hidden border-6 border-white shadow-xl">
                  <img 
                    src="/oj1.jpg"
                    alt="Fresh Produce" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <section id="about" className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-16">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">About Ojarunz</h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
              Your trusted partner for fresh Nigerian produce delivery
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12">
            <div>
              <div className="bg-green-100 p-6 sm:p-8 rounded-2xl mb-6 sm:mb-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Our Story</h3>
                <p className="text-gray-600 text-sm sm:text-base mb-4">
                  Ojarunz was born from a simple idea: making fresh, authentic Nigerian produce accessible to everyone. 
                  We understand the importance of quality ingredients in creating delicious Nigerian meals.
                </p>
                <p className="text-gray-600 text-sm sm:text-base">
                  Our team works directly with local farmers and trusted market vendors to bring you the freshest 
                  produce while supporting local agriculture.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-yellow-50 p-4 sm:p-6 rounded-xl text-center">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600 mx-auto mb-2" />
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">500+</div>
                  <div className="text-xs sm:text-sm text-gray-600">Happy Customers</div>
                </div>
                <div className="bg-green-50 p-4 sm:p-6 rounded-xl text-center">
                  <Award className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">50+</div>
                  <div className="text-xs sm:text-sm text-gray-600">Local Farmers</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img src="/oj2.jpg" alt="Farm Fresh" className="rounded-xl h-48 sm:h-64 object-cover" />
              <img src="/oj3.jpg" alt="Market Quality" className="rounded-xl h-48 sm:h-64 object-cover mt-4 sm:mt-8" />
              <img src="/oj4.jpg" alt="Fresh Vegetables" className="rounded-xl h-48 sm:h-64 object-cover" />
              <img src="/oj5.jpg" alt="Quality Produce" className="rounded-xl h-48 sm:h-64 object-cover mt-4 sm:mt-8" />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-16">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-gray-600 text-base sm:text-lg">Everything you need for your kitchen, delivered fresh</p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md text-center">
              <Truck className="w-12 h-12 sm:w-16 sm:h-16 text-green-600 mx-auto mb-4 sm:mb-6" />
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Same-Day Delivery</h3>
              <p className="text-gray-600 text-sm sm:text-base mb-4">
                Order before 2PM and receive your fresh produce the same day. Perfect for last-minute cooking needs.
              </p>
              <ul className="text-left text-gray-600 text-sm sm:text-base space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2" />
                  Fast and reliable delivery
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2" />
                  Real-time tracking
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2" />
                  Flexible time slots
                </li>
              </ul>
            </div>
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md text-center">
              <Shield className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-600 mx-auto mb-4 sm:mb-6" />
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Quality Guarantee</h3>
              <p className="text-gray-600 text-sm sm:text-base mb-4">
                Every item is hand-picked and inspected for freshness. We maintain traditional market quality standards.
              </p>
              <ul className="text-left text-gray-600 text-sm sm:text-base space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2" />
                  Freshness guaranteed
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2" />
                  Direct from farms & markets
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2" />
                  Quality inspection
                </li>
              </ul>
            </div>
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md text-center">
              <Clock className="w-12 h-12 sm:w-16 sm:h-16 text-orange-600 mx-auto mb-4 sm:mb-6" />
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Weekly Subscriptions</h3>
              <p className="text-gray-600 text-sm sm:text-base mb-4">
                Subscribe to weekly deliveries and never run out of essentials. Customize your box based on preferences.
              </p>
              <ul className="text-left text-gray-600 text-sm sm:text-base space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2" />
                  Regular deliveries
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2" />
                  Customizable boxes
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2" />
                  Pause or cancel anytime
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section id="location" className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-16">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">Delivery Locations</h2>
            <p className="text-gray-600 text-base sm:text-lg">Currently serving major cities across Nigeria</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 place-content-center">
            {[
                            { city: 'Ibadan', areas: ['Orogun', 'Bodija', 'Mokola', 'UI Area'] },

              { city: 'Lagos', areas: ['Coming soon'] },
              { city: 'Abuja', areas: ['Coming soon'] },
              { city: 'Port Harcourt', areas: ['Coming soon'] },
            ].map((location, index) => (
              <div key={index} className="bg-green-50 p-4 sm:p-6 rounded-xl">
                <div className="flex items-center mb-3 sm:mb-4">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mr-2" />
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">{location.city}</h3>
                </div>
                <ul className="space-y-2 text-sm sm:text-base">
                  {location.areas.map((area, areaIndex) => (
                    <li key={areaIndex} className="flex items-center text-gray-600">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2 sm:mr-3"></div>
                      {area}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="text-center mt-8 sm:mt-12">
            <p className="text-gray-600 text-sm sm:text-base mb-4">
              Don't see your area? Join our waitlist and we'll notify you when we expand to your location!
            </p>
            <button 
              onClick={() => scrollToSection('contact')}
              className="bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors text-sm sm:text-base"
            >
              Request Your Area
            </button>
          </div>
        </div>
      </section>

      {/* Photos Section */}
      <section id="photos" className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-16">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">Fresh From Our Markets</h2>
            <p className="text-gray-600 text-base sm:text-lg">See the quality and variety of produce we deliver</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8 sm:mb-12">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
              <div key={num} className="relative group overflow-hidden rounded-xl">
                <img 
                  src={`/oj${num}.jpg`} 
                  alt={`Fresh Produce ${num}`}
                  className="w-full h-40 sm:h-48 object-cover transition-transform group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">What We Offer</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm sm:text-base text-gray-600">
              <div className="bg-white p-3 sm:p-4 rounded-xl">Fresh Vegetables</div>
              <div className="bg-white p-3 sm:p-4 rounded-xl">Seasonal Fruits</div>
              <div className="bg-white p-3 sm:p-4 rounded-xl">Nigerian Staples</div>
              <div className="bg-white p-3 sm:p-4 rounded-xl">Spices & Herbs</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-16">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">Get In Touch</h2>
            <p className="text-gray-600 text-base sm:text-lg">We'd love to hear from you</p>
          </div>
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Contact Information</h3>
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center">
                  <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mr-3 sm:mr-4" />
                  <div>
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">Phone</div>
                    <div className="text-gray-600 text-sm sm:text-base">+234 7049374912</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mr-3 sm:mr-4" />
                  <div>
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">Email</div>
                    <div className="text-gray-600 text-sm sm:text-base">service@ojarunz.ng</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mr-3 sm:mr-4" />
                  <div>
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">Office</div>
                    <div className="text-gray-600 text-sm sm:text-base"> Ibadan, Nigeria</div>
                  </div>
                </div>
              </div>
              <div className="mt-6 sm:mt-8 bg-green-50 p-4 sm:p-6 rounded-xl">
                <h4 className="font-bold text-gray-900 text-sm sm:text-base mb-2">Business Hours</h4>
                <div className="text-gray-600 text-sm sm:text-base space-y-1">
                  <div>Monday - Friday:8:00 AM - 6:00 PM</div>
                  <div>Saturday: 8:00 AM - 6:00 PM</div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Join Our Waitlist</h3>
              <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
                Be the first to experience fresh Nigerian produce delivered to your doorstep. 
                Sign up now for exclusive early access!
              </p>
              {!isSubmitted ? (
                <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                  <div className="space-y-4">
                    <div>
                      <input
                        type="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Your phone number"
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <select
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none bg-white text-sm sm:text-base"
                      >
                        <option value="">Select your location</option>
                        <option value="lagos">Lagos</option>
                        <option value="abuja">Abuja</option>
                        <option value="port-harcourt">Port Harcourt</option>
                        <option value="ibadan">Ibadan</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <button
                      onClick={handleWaitlistSubmit}
                      className="w-full bg-green-600 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm sm:text-base"
                    >
                      Join Waitlist
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 rounded-xl p-4 sm:p-6 text-center">
                  <CheckCircle className="w-8 h-8 sm:w-12 sm:h-12 text-green-500 mx-auto mb-3 sm:mb-4" />
                  <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Thank You!</h4>
                  <p className="text-gray-600 text-sm sm:text-base">
                    We've added you to our waitlist. You'll be the first to know when we launch in your area!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-green-600 to-green-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12 lg:px-16 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">Why Choose Ojarunz?</h2>
          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8 mt-8 sm:mt-12">
            <div className="text-center">
              <Truck className="w-8 h-8 sm:w-12 sm:h-12 text-white mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Fast Delivery</h3>
              <p className="text-green-100 text-sm sm:text-base">Same-day delivery to your doorstep</p>
            </div>
            <div className="text-center">
              <Shield className="w-8 h-8 sm:w-12 sm:h-12 text-white mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Quality Guaranteed</h3>
              <p className="text-green-100 text-sm sm:text-base">Fresh from trusted Nigerian markets</p>
            </div>
            <div className="text-center">
              <Clock className="w-8 h-8 sm:w-12 sm:h-12 text-white mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Save Time</h3>
              <p className="text-green-100 text-sm sm:text-base">Skip market queues and traffic</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-16">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">Customer Reviews</h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                text: "Finally! Fresh tomatoes and peppers delivered to my hostel in CMF. The quality is exactly like what I get from Bodija market.",
                author: "Funmi A. - Ui",
                rating: 5,
              },
              {
                text: "As a busy student, Ojarunz saves me so much time. No more market wahala, fresh vegetables delivered same day!",
                author: "Kemi O. - UI",
                rating: 5,
              },
              {
                text: "The prices are reasonable and the delivery is always on time. I can focus on working instead of market runs.",
                author: "David M. - Barika",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
                <div className="flex text-yellow-400 mb-3 sm:mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4 italic">"{testimonial.text}"</p>
                <div className="font-semibold text-gray-900 text-sm sm:text-base">{testimonial.author}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-amber-50 to-yellow-100 text-black py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-4">Ojarunz</h3>
              <p className="text-gray-900 text-sm sm:text-base mb-4">
                Fresh fruits and vegetables from Nigerian markets, delivered to your doorstep.
              </p>
              <div className="text-xs sm:text-sm text-gray-500">Made with ❤️ for Nigerians</div>
            </div>
            <div>
              <h4 className="font-semibold text-sm sm:text-base mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-900 text-sm sm:text-base">
                {navItems.map((item) => (
                  <li key={item.id}>
                    <button 
                      onClick={() => scrollToSection(item.id)}
                      className="hover:text-green-600 transition-colors"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm sm:text-base mb-4">Support</h4>
              <ul className="space-y-2 text-gray-900 text-sm sm:text-base">
                <li><button className="hover:text-green-600 transition-colors">Help Center</button></li>
                <li><button className="hover:text-green-600 transition-colors">Track Order</button></li>
                <li><button className="hover:text-green-600 transition-colors">Returns & Refunds</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm sm:text-base mb-4">Contact Info</h4>
              <div className="space-y-2 text-gray-900 text-sm sm:text-base">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  services@ojarunz.ng
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  +2347049374912
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Ibadan, Nigeria
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-300 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center text-gray-900 text-sm sm:text-base">
            <p>&copy; 2024 Ojarunz. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default OjarunzHomepage;