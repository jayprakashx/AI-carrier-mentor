import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Briefcase, TrendingUp, Cpu, User, Lightbulb } from "lucide-react";

const navLinks = [
  { title: "Career Navigator", href: "/career-navigator", icon: <Cpu size={20} /> },
  { title: "Internships", href: "/internships", icon: <Briefcase size={20} /> },
  { title: "Skill Path", href: "/skill-path", icon: <TrendingUp size={20} /> },
  { title: "Career Insights", href: "/career-roadmap", icon: <Lightbulb size={20} /> },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const handleLinkClick = () => setIsOpen(false);

  return (
    <nav className="bg-white border-b-2 border-violet-100 shadow-xl sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link
              to="/"
              className="text-2xl font-extrabold text-gray-900 tracking-tight transition duration-300"
            >
              <span className="text-violet-700">BPUT</span> Career Navigator
            </Link>
          </div>

          {/* Desktop Links */}
          <div className="hidden lg:flex md:space-x-4">
            {navLinks.map((link) =>
              link.href.startsWith("/") ? (
                <Link
                  key={link.title}
                  to={link.href}
                  onClick={handleLinkClick}
                  className="relative text-gray-700 hover:text-violet-700 font-semibold px-3 py-2 text-sm transition-all duration-300 group flex items-center"
                >
                  {link.icon}
                  <span className="ml-1">{link.title}</span>
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                </Link>
              ) : (
                <a
                  key={link.title}
                  href={link.href}
                  onClick={handleLinkClick}
                  className="relative text-gray-700 hover:text-violet-700 font-semibold px-3 py-2 text-sm transition-all duration-300 group flex items-center"
                >
                  {link.icon}
                  <span className="ml-1">{link.title}</span>
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                </a>
              )
            )}
          </div>

          {/* Right Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/login"
              className="text-gray-700 hover:text-violet-700 px-3 py-2 text-sm font-medium rounded-xl transition duration-300 flex items-center border border-transparent hover:border-violet-300"
            >
              <User size={18} className="mr-1" /> Login
            </Link>
            <Link
              to="/ai-interview"
              className="bg-violet-600 text-white hover:bg-violet-700 px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-violet-300 transition duration-300 transform hover:scale-[1.05]"
            >
              AI Mock Interview
            </Link>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden">
            <button
              aria-label="Toggle menu"
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-violet-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-violet-500 transition duration-150"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden ${isOpen ? "block" : "hidden"} bg-gray-50/95 backdrop-blur-sm`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-violet-100">
          {navLinks.map((link) =>
            link.href.startsWith("/") ? (
              <Link
                key={link.title}
                to={link.href}
                onClick={handleLinkClick}
                className="text-gray-700 hover:bg-violet-100 hover:text-violet-700 block px-4 py-3 rounded-lg text-base font-semibold transition duration-300 flex items-center"
              >
                <span className="mr-3">{link.icon}</span>
                {link.title}
              </Link>
            ) : (
              <a
                key={link.title}
                href={link.href}
                onClick={handleLinkClick}
                className="text-gray-700 hover:bg-violet-100 hover:text-violet-700 block px-4 py-3 rounded-lg text-base font-semibold transition duration-300 flex items-center"
              >
                <span className="mr-3">{link.icon}</span>
                {link.title}
              </a>
            )
          )}

          {/* Mobile Buttons */}
          <div className="pt-4 border-t border-violet-100 space-y-2">
            <Link
              to="/login"
              onClick={handleLinkClick}
              className="text-violet-600 hover:bg-violet-50 block px-4 py-3 text-base font-semibold rounded-lg transition duration-300 flex items-center"
            >
              <User size={20} className="mr-3" />
              Login
            </Link>
            <Link
              to="/ai-interview"
              onClick={handleLinkClick}
              className="block w-full text-center bg-violet-600 text-white hover:bg-violet-700 px-4 py-3 rounded-xl text-base font-bold shadow-lg transition duration-300"
            >
              AI Mock Interview
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
