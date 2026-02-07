import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import logoImage from "@assets/Panchyat_Logo_1749470233751.jpg";

export default function Navigation() {
  const [activeSection, setActiveSection] = useState("home");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // Update active section based on scroll position
      const sections = document.querySelectorAll("section[id]");
      let current = "";
      
      sections.forEach(section => {
        const sectionTop = (section as HTMLElement).offsetTop - 100;
        if (window.pageYOffset >= sectionTop) {
          current = section.getAttribute("id") || "";
        }
      });
      
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { href: "#home", label: "Home" },
    { href: "#about", label: "About" },
    { href: "#research", label: "Research" },
    { href: "#publications", label: "Publications" },
    { href: "#teaching", label: "Teaching" },
    { href: "#contact", label: "Contact" },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 no-print ${
      isScrolled 
        ? "bg-gradient-to-r from-white/95 via-blue-50/95 to-white/95 backdrop-blur-md shadow-xl border-b border-blue-200/50" 
        : "bg-gradient-to-r from-white/90 via-blue-50/80 to-white/90 shadow-lg border-b border-blue-100/30"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-14">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <img 
                src={logoImage} 
                alt="Panchayat College Logo" 
                className="h-9 w-9 sm:h-10 sm:w-10 max-h-10 max-w-10 object-contain object-center rounded-full shadow-md ring-1 ring-blue-200/80 hover:ring-blue-400 transition-all duration-300 hover:scale-105"
              />
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full opacity-15 pointer-events-none"></div>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="font-bold text-base sm:text-lg bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent truncate">
                Dr. Kishora Nayak
              </div>
              <div className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                High Energy Physicist
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-2">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => scrollToSection(item.href)}
                className={`nav-link px-4 py-2 text-base font-semibold transition-all duration-300 rounded-lg relative group overflow-hidden ${
                  activeSection === item.href.slice(1) 
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105" 
                    : "text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:shadow-lg hover:scale-105"
                }`}
              >
                <span className="relative z-10">{item.label}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </button>
            ))}
          </div>

          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-white">
              <div className="flex flex-col space-y-6 mt-8">
                {navItems.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => scrollToSection(item.href)}
                    className={`text-left text-base font-semibold transition-colors hover:text-primary p-3 rounded-lg ${
                      activeSection === item.href.slice(1) 
                        ? "text-primary bg-blue-50 border-l-4 border-primary" 
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
