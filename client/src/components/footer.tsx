import { ExternalLink } from "lucide-react";
import logoImage from "@assets/Panchyat_Logo_1749470233751.jpg";

export default function Footer() {
  const quickLinks = [
    { name: "About", href: "#about" },
    { name: "Research", href: "#research" },
    { name: "Publications", href: "#publications" },
    { name: "Teaching", href: "#teaching" },
  ];

  const researchFocus = [
    "QCD Phase Diagram",
    "Quark-Gluon Plasma",
    "Heavy-Ion Collisions",
    "Flow Measurements",
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-slate-900 text-white py-12 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src={logoImage} 
                alt="Panchayat College" 
                className="h-8 w-8 object-contain rounded-full"
              />
              <div>
                <div className="font-semibold">Dr. Kishora Nayak</div>
                <div className="text-gray-400 text-sm">Panchayat College, Bargarh</div>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Assistant Professor in Physics specializing in experimental high energy physics and nuclear physics research. 
              Committed to advancing scientific knowledge through international collaborations.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2 text-sm">
              {quickLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollToSection(link.href)}
                  className="text-gray-400 hover:text-white transition-colors block w-full text-left"
                >
                  {link.name}
                </button>
              ))}
            </div>
            
            <div className="mt-6">
              <h5 className="font-medium mb-2">External Links</h5>
              <div className="space-y-2 text-sm">
                <a 
                  href="https://cern.ch" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-400 hover:text-white transition-colors flex items-center"
                >
                  CERN <ExternalLink className="w-3 h-3 ml-1" />
                </a>
                <a 
                  href="https://www.bnl.gov/rhic/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-400 hover:text-white transition-colors flex items-center"
                >
                  RHIC <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
            </div>
          </div>
          
          {/* Research Focus */}
          <div>
            <h4 className="font-semibold mb-4">Research Focus</h4>
            <div className="space-y-2 text-sm text-gray-400">
              {researchFocus.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-1 h-1 bg-blue-400 rounded-full mr-2 flex-shrink-0"></div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-6">
              <h5 className="font-medium mb-2">Contact</h5>
              <div className="space-y-1 text-sm text-gray-400">
                <p>Panchayat College Bargarh</p>
                <p>Odisha, India - 768028</p>
                <p>kishora.nayak@panchayatcollege.edu</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>
              © 2024 Dr. Kishora Nayak. All rights reserved.
            </p>
            <div className="flex items-center gap-4 mt-2 md:mt-0">
              <p>Assistant Professor in Physics, Panchayat College | Last updated: January 2024</p>
              <a href="/admin" className="text-gray-500 hover:text-gray-300 text-xs">Admin</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
