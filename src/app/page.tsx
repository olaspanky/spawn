"use client"
import React, { useState, useEffect } from 'react';
import { ChevronRight, CheckCircle, Truck, Clock, Shield, Star, Phone, Mail, MapPin, ShoppingBag, Users, Award, Heart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const OjarunzHomepage = () => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const handleWaitlistSubmit = () => {
    if (email && phone && location) {
      setIsSubmitted(true);
      console.log('Waitlist signup:', { email, phone, location });
      
      setTimeout(() => {
        setIsSubmitted(false);
        setEmail('');
        setPhone('');
        setLocation('');
      }, 3000);
    }
  };

  // Smooth scroll function
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Update active section on scroll
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
    { id: 'contact', label: 'Contact' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100">
      {/* Header Section */}
      <div id="home" className="relative min-h-screen overflow-hidden">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50  backdrop-blur-md shadow-sm">
          <div className="flex justify-between items-center px-6 md:px-16 py-4">
            <div className="flex items-center">
              <Link href="/" className="flex flex-col items-center">
                <Image src="/oj.png" alt="Oja Logo" width={60} height={60} className="rounded-lg" />
                <p className="text-xs text-gray-500 italic">Keep moving, let's do the running</p>
              </Link>
              <Link href="/home" className="flex flex-col items-center">
                <p className="text-xs text-gray-500 ">Market floor</p>
              </Link>
            </div>
            
            <div className="flex space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`${
                    activeSection === item.id 
                      ? 'text-green-600 border-b-2 border-green-600' 
                      : 'text-gray-600 hover:text-green-600'
                  } transition-colors font-medium pb-1`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Hero Content */}
        <div className="relative z-10 flex items-center min-h-screen px-6 md:px-36 pt-20">
          <div className="flex flex-col lg:flex-row items-center w-full mx-auto">
            {/* Left Content */}
            <div className="flex-1 lg:pr-12 mb-12 lg:mb-0">
              <div className="inline-block bg-green-600 text-white px-6 py-3 rounded-full text-sm font-medium mb-8">
                Fresh Farm Produce and Foodstuffs
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                OJARUNZ
              </h1>
              
              <p className="text-gray-600 text-lg lg:text-xl mb-8 max-w-lg">
                Get fresh farm produce and foodstuffs directly from Nigerian markets delivered to your doorstep. 
                Quality produce, unbeatable convenience.
              </p>
              
              <div className="flex space-x-6 mb-12">
                {[2, 3, 4, 5].map((num) => (
                  <div key={num} className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center overflow-hidden">
                    <img 
                      src={`/oj${num}.jpg`}
                      alt="Fresh Produce" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              
              <button 
                onClick={() => scrollToSection('services')}
                className="bg-green-600 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Explore Our Services</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            {/* Right Content */}
            <div className="flex-1 flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute -inset-8 bg-yellow-400 rounded-full opacity-20"></div>
                <div className="absolute -inset-4 bg-yellow-500 rounded-full opacity-30"></div>
                
                <div className="relative w-96 h-96 lg:w-[600px] lg:h-[600px] bg-yellow-600 rounded-full overflow-hidden border-8 border-white shadow-2xl">
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
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">About Ojarunz</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Your trusted partner for fresh Nigerian produce delivery
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="bg-green-100 p-8 rounded-3xl mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h3>
                <p className="text-gray-600 mb-4">
                  Ojarunz was born from a simple idea: making fresh, authentic Nigerian produce accessible to everyone. 
                  We understand the importance of quality ingredients in creating delicious Nigerian meals.
                </p>
                <p className="text-gray-600">
                  Our team works directly with local farmers and trusted market vendors to bring you the freshest 
                  produce while supporting local agriculture.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-yellow-50 p-6 rounded-2xl text-center">
                  <Users className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">500+</div>
                  <div className="text-sm text-gray-600">Happy Customers</div>
                </div>
                <div className="bg-green-50 p-6 rounded-2xl text-center">
                  <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">50+</div>
                  <div className="text-sm text-gray-600">Local Farmers</div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <img src="/oj2.jpg" alt="Farm Fresh" className="rounded-2xl h-64 object-cover" />
              <img src="/oj3.jpg" alt="Market Quality" className="rounded-2xl h-64 object-cover mt-8" />
              <img src="/oj4.jpg" alt="Fresh Vegetables" className="rounded-2xl h-64 object-cover" />
              <img src="/oj5.jpg" alt="Quality Produce" className="rounded-2xl h-64 object-cover mt-8" />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-gray-600 text-lg">Everything you need for your kitchen, delivered fresh</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-8 rounded-3xl shadow-lg text-center">
              <Truck className="w-16 h-16 text-green-600 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Same-Day Delivery</h3>
              <p className="text-gray-600 mb-4">
                Order by 12 PM and receive your fresh produce the same day. Perfect for last-minute cooking needs.
              </p>
              <ul className="text-left text-gray-600 space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Fast and reliable delivery
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Real-time tracking
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Flexible time slots
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-8 rounded-3xl shadow-lg text-center">
              <Shield className="w-16 h-16 text-yellow-600 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Quality Guarantee</h3>
              <p className="text-gray-600 mb-4">
                Every item is hand-picked and inspected for freshness. We maintain traditional market quality standards.
              </p>
              <ul className="text-left text-gray-600 space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Freshness guaranteed
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Direct from farms & markets
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Quality inspection
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-8 rounded-3xl shadow-lg text-center">
              <Clock className="w-16 h-16 text-orange-600 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Weekly Subscriptions</h3>
              <p className="text-gray-600 mb-4">
                Subscribe to weekly deliveries and never run out of essentials. Customize your box based on preferences.
              </p>
              <ul className="text-left text-gray-600 space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Regular deliveries
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Customizable boxes
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Pause or cancel anytime
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section id="location" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Delivery Locations</h2>
            <p className="text-gray-600 text-lg">Currently serving major cities across Nigeria</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {[
              { city: 'Lagos', areas: ['Lekki', 'Victoria Island', 'Ikoyi', 'Surulere', 'Ikeja'] },
              { city: 'Abuja', areas: ['Maitama', 'Wuse', 'Garki', 'Asokoro', 'Gwarinpa'] },
              { city: 'Port Harcourt', areas: ['GRA', 'Rumuola', 'Trans-Amadi', 'Old GRA'] },
              { city: 'Ibadan', areas: ['Bodija', 'Iwo Road', 'Mokola', 'UI Area'] }
            ].map((location, index) => (
              <div key={index} className="bg-green-50 p-6 rounded-2xl">
                <div className="flex items-center mb-4">
                  <MapPin className="w-6 h-6 text-green-600 mr-2" />
                  <h3 className="text-xl font-bold text-gray-900">{location.city}</h3>
                </div>
                <ul className="space-y-2">
                  {location.areas.map((area, areaIndex) => (
                    <li key={areaIndex} className="flex items-center text-gray-600">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                      {area}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Don't see your area? Join our waitlist and we'll notify you when we expand to your location!
            </p>
            <button 
              onClick={() => scrollToSection('contact')}
              className="bg-green-600 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-green-700 transition-colors"
            >
              Request Your Area
            </button>
          </div>
        </div>
      </section>

      {/* Photos Section */}
      <section id="photos" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Fresh From Our Markets</h2>
            <p className="text-gray-600 text-lg">See the quality and variety of produce we deliver</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
              <div key={num} className="relative group overflow-hidden rounded-2xl">
                <img 
                  src={`/oj${num}.jpg`} 
                  alt={`Fresh Produce ${num}`}
                  className="w-full h-48 object-cover transition-transform group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Heart className="w-8 h-8 text-white" />
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">What We Offer</h3>
            <div className="grid md:grid-cols-4 gap-4 text-gray-600">
              <div className="bg-white p-4 rounded-xl">Fresh Vegetables</div>
              <div className="bg-white p-4 rounded-xl">Seasonal Fruits</div>
              <div className="bg-white p-4 rounded-xl">Nigerian Staples</div>
              <div className="bg-white p-4 rounded-xl">Spices & Herbs</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Get In Touch</h2>
            <p className="text-gray-600 text-lg">We'd love to hear from you</p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h3>
              
              <div className="space-y-6">
                <div className="flex items-center">
                  <Phone className="w-6 h-6 text-green-600 mr-4" />
                  <div>
                    <div className="font-semibold text-gray-900">Phone</div>
                    <div className="text-gray-600">+234 800 OJA RUNZ</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Mail className="w-6 h-6 text-green-600 mr-4" />
                  <div>
                    <div className="font-semibold text-gray-900">Email</div>
                    <div className="text-gray-600">hello@ojarunz.ng</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <MapPin className="w-6 h-6 text-green-600 mr-4" />
                  <div>
                    <div className="font-semibold text-gray-900">Office</div>
                    <div className="text-gray-600">Lagos, Nigeria</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 bg-green-50 p-6 rounded-2xl">
                <h4 className="font-bold text-gray-900 mb-2">Business Hours</h4>
                <div className="text-gray-600 space-y-1">
                  <div>Monday - Friday: 6:00 AM - 9:00 PM</div>
                  <div>Saturday: 7:00 AM - 8:00 PM</div>
                  <div>Sunday: 8:00 AM - 6:00 PM</div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Join Our Waitlist</h3>
              <p className="text-gray-600 mb-6">
                Be the first to experience fresh Nigerian produce delivered to your doorstep. 
                Sign up now for exclusive early access!
              </p>
              
              {!isSubmitted ? (
                <div className="bg-gray-50 rounded-2xl p-6">
                  <div className="space-y-4">
                    <div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-green-500 focus:outline-none"
                      />
                    </div>
                    
                    <div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Your phone number"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-green-500 focus:outline-none"
                      />
                    </div>
                    
                    <div>
                      <select
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-green-500 focus:outline-none bg-white"
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
                      className="w-full bg-green-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-green-700 transition-colors"
                    >
                      Join Waitlist
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 rounded-2xl p-6 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h4>
                  <p className="text-gray-600">
                    We've added you to our waitlist. You'll be the first to know when we launch in your area!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-green-700">
        <div className="max-w-4xl mx-auto px-6 md:px-16 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Why Choose Ojarunz?</h2>
          
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <Truck className="w-12 h-12 text-white mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Fast Delivery</h3>
              <p className="text-green-100">Same-day delivery to your doorstep</p>
            </div>
            
            <div className="text-center">
              <Shield className="w-12 h-12 text-white mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Quality Guaranteed</h3>
              <p className="text-green-100">Fresh from trusted Nigerian markets</p>
            </div>
            
            <div className="text-center">
              <Clock className="w-12 h-12 text-white mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Save Time</h3>
              <p className="text-green-100">Skip market queues and traffic</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Customer Reviews</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                text: "Finally! Fresh tomatoes and peppers delivered to my house in Lekki. The quality is exactly like what I get from Mile 12 market.",
                author: "Funmi A. - Lagos",
                rating: 5
              },
              {
                text: "As a busy mom, Ojarunz saves me so much time. No more market wahala, fresh vegetables delivered same day!",
                author: "Kemi O. - Abuja",
                rating: 5
              },
              {
                text: "The prices are reasonable and the delivery is always on time. I can focus on cooking instead of market runs.",
                author: "David M. - Port Harcourt",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.text}"</p>
                <div className="font-semibold text-gray-900">{testimonial.author}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-amber-50 to-yellow-100 text-black py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">Ojarunz</h3>
              <p className="text-gray-900 mb-4">
                Fresh fruits and vegetables from Nigerian markets, delivered to your doorstep.
              </p>
              <div className="text-sm text-gray-500">Made with ❤️ for Nigerians</div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-900">
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
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-900">
                <li><button className="hover:text-green-600 transition-colors">Help Center</button></li>
                <li><button className="hover:text-green-600 transition-colors">Track Order</button></li>
                <li><button className="hover:text-green-600 transition-colors">Returns & Refunds</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact Info</h4>
              <div className="space-y-2 text-gray-900">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  hello@ojarunz.ng
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  +234 800 OJA RUNZ
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Lagos, Nigeria
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-300 mt-12 pt-8 text-center text-gray-900">
            <p>&copy; 2024 Ojarunz. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default OjarunzHomepage;