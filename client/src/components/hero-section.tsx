import { Button } from "@/components/ui/button";
import { Download, Mail, Award, Users, BookOpen } from "lucide-react";
import logoImage from "@assets/Panchyat_Logo_1749470233751.jpg";
import profileImage from "@assets/knayak_pict_1749469261620.jpg";

export default function HeroSection() {
  const handleDownloadCV = () => {
    // Create a downloadable link for the CV
    const link = document.createElement('a');
    link.href = '/attached_assets/Short_CV_KNayak_1749470083644.pdf';
    link.download = 'Dr_Kishora_Nayak_CV.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const scrollToContact = () => {
    const element = document.querySelector("#contact");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="home" className="gradient-bg text-white pt-20 pb-16 lg:pt-32 lg:pb-24 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-20 h-20 bg-white rounded-full float"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-blue-200 rounded-full float" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-32 left-1/4 w-12 h-12 bg-purple-200 rounded-full float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 right-1/3 w-14 h-14 bg-white rounded-full float" style={{animationDelay: '0.5s'}}></div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 lg:gap-12 items-center">
          <div className="lg:col-span-8 slide-in-left">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 font-serif hero-gradient-text">
              Dr. Kishora Nayak
            </h1>
            
            <h2 className="text-xl lg:text-2xl font-light mb-6 text-white drop-shadow-lg slide-in-left stagger-1">
              Assistant Professor in Physics
            </h2>
            
            <div className="flex items-center space-x-2 mb-6">
              <img 
                src={logoImage} 
                alt="Panchayat College Logo" 
                className="h-8 w-8 object-contain rounded-full"
              />
              <span className="text-lg text-white drop-shadow-md">Panchayat College, Bargarh</span>
            </div>
            
            <p className="text-lg mb-8 text-white drop-shadow-md leading-relaxed max-w-2xl">
              Experimental High-Energy and Nuclear Physicist specializing in QCD Phase Diagram research and 
              Quark-Gluon Plasma studies. Contributing to groundbreaking discoveries at RHIC and LHC through 
              STAR and ALICE collaborations.
            </p>
            
            <div className="flex flex-wrap gap-6 mb-8">
              <Button 
                onClick={handleDownloadCV} 
                className="group relative bg-gradient-to-r from-white to-blue-50 text-blue-600 hover:from-blue-50 hover:to-white border-2 border-white/30 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-110 px-8 py-4 text-lg font-semibold rounded-2xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Download className="w-5 h-5 mr-3 transition-transform duration-300 group-hover:scale-110 relative z-10" />
                <span className="relative z-10">Download CV</span>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
              </Button>
              <Button 
                onClick={scrollToContact}
                className="group relative bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-110 px-8 py-4 text-lg font-semibold rounded-2xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Mail className="w-5 h-5 mr-3 transition-transform duration-300 group-hover:scale-110 relative z-10" />
                <span className="relative z-10">Get in Touch</span>
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-green-500 rounded-2xl opacity-0 group-hover:opacity-30 blur transition-opacity duration-300"></div>
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-md slide-in-left stagger-3">
              <div className="text-center dynamic-card">
                <div className="text-3xl font-bold text-white mb-1 gradient-text">150+</div>
                <div className="text-sm text-blue-200 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 mr-1 bounce" />
                  Publications
                </div>
              </div>
              <div className="text-center dynamic-card">
                <div className="text-3xl font-bold text-white mb-1 gradient-text">10+</div>
                <div className="text-sm text-blue-200 flex items-center justify-center">
                  <Award className="w-4 h-4 mr-1 bounce" style={{animationDelay: '0.5s'}} />
                  Years Experience
                </div>
              </div>
              <div className="text-center dynamic-card">
                <div className="text-3xl font-bold text-white mb-1 gradient-text">2</div>
                <div className="text-sm text-blue-200 flex items-center justify-center">
                  <Users className="w-4 h-4 mr-1 bounce" style={{animationDelay: '1s'}} />
                  Collaborations
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-4 mt-12 lg:mt-0 slide-in-right">
            <div className="relative">
              <div className="w-80 h-80 rounded-full overflow-hidden shadow-2xl mx-auto lg:mx-0 float pulse-glow">
                <img 
                  src={profileImage} 
                  alt="Dr. Kishora Nayak" 
                  className="w-full h-full object-cover scale-hover"
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -bottom-4 -right-4 bg-yellow-400 text-white p-3 rounded-xl float scale-hover">
                <Award className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
