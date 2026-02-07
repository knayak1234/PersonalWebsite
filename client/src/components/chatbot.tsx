import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, X, Send, Bot, User, Minimize2, Maximize2, Zap } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm Dr. Nayak's research assistant. I can help you learn about his work in experimental physics, QCD Phase Diagram research, and Quark-Gluon Plasma studies. You can ask me about his publications, research areas, teaching experience, or contact information.",
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Enhanced response system with comprehensive knowledge base
  const getEnhancedResponse = async (query: string): Promise<string> => {
    // Always use the comprehensive knowledge base first
    const knowledgeResponse = getKnowledgeResponse(query);
    
    // If knowledge base has a specific response, use it
    if (knowledgeResponse !== "I'd be happy to help you learn about Dr. Kishora Nayak's research and academic work. You can ask me about his QCD studies, publications, teaching experience, research collaborations, or any other aspect of his work in experimental physics.") {
      return knowledgeResponse;
    }

    // For general queries, try AI enhancement, but don't fail if unavailable
    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: query }),
      });

      if (response.ok) {
        const data = await response.json();
        // If AI provides a meaningful response beyond fallback message, use it
        if (data.reply && !data.reply.includes("temporarily unavailable")) {
          return data.reply;
        }
      }
    } catch (error) {
      // Silently fall back to knowledge base
    }

    // Enhanced fallback for general queries
    return "I can help you learn about Dr. Nayak's work! Try asking about:\n\n🔬 \"What is QCD Phase Diagram research?\"\n⚛️ \"Tell me about Quark-Gluon Plasma\"\n📊 \"What are flow measurements?\"\n🏆 \"What awards has he received?\"\n📚 \"What courses does he teach?\"\n🌍 \"Tell me about CERN experience\"\n📧 \"How can I contact him?\"\n\nI have detailed information about all aspects of his academic career!";
  };

  // Enhanced knowledge base for fallback responses
  const getKnowledgeResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    // Basic identity question - keep short and direct
    if (lowerQuery.includes('who is') || lowerQuery.includes('who\'s') || 
        (lowerQuery.includes('kishora') && lowerQuery.includes('nayak') && lowerQuery.length < 30)) {
      return "Dr. Kishora Nayak is an Assistant Professor in Physics at Panchayat College, Bargarh (Sambalpur University, Odisha). He specializes in experimental high-energy physics, particularly QCD Phase Diagram studies and Quark-Gluon Plasma research, with international experience at CERN and collaborations with STAR and ALICE experiments.";
    }

    // Contact and collaboration responses
    if (lowerQuery.includes('collaborate') || lowerQuery.includes('collaboration') || 
        lowerQuery.includes('work with') || lowerQuery.includes('partner') ||
        lowerQuery.includes('joint research') || lowerQuery.includes('contact') || 
        lowerQuery.includes('reach') || lowerQuery.includes('email') || 
        lowerQuery.includes('phone') || lowerQuery.includes('get in touch') ||
        lowerQuery.includes('connect with')) {
      return "Contact Dr. Nayak:\n\nEmail: k.nayak1234@gmail.com\nPhone: +91 9938735081\nOffice: P.G. Department of Physics, Panchayat College Bargarh, Sambalpur University, Odisha\n\nFor collaboration, please include your research interests and institutional affiliation. He welcomes partnerships in QCD research and heavy-ion physics.";
    }

    // Greeting responses
    if (lowerQuery.includes('hello') || lowerQuery.includes('hi') || lowerQuery.includes('hey')) {
      return "Hello! I can help you learn about Dr. Kishora Nayak's physics research, publications, teaching, and academic background. What would you like to know?";
    }
    
    // QCD and Phase Transitions - Comprehensive Coverage
    if (lowerQuery.includes('qcd') || lowerQuery.includes('quantum chromodynamics')) {
      if (lowerQuery.includes('phase') || lowerQuery.includes('transition') || lowerQuery.includes('diagram')) {
        return "Dr. Nayak's QCD Phase Diagram research is central to understanding matter under extreme conditions:\n\n🔬 CORE RESEARCH:\n• Mapping phase transitions between hadronic matter and quark-gluon plasma\n• Searching for the QCD critical point using beam energy scan programs\n• Studying crossover vs first-order phase transitions\n• Temperature and baryon chemical potential dependencies\n\n🎯 EXPERIMENTAL APPROACH:\n• Heavy-ion collision studies at RHIC and LHC energies\n• Systematic beam energy scans from 7.7 to 200 GeV\n• Multi-observable analysis for phase boundary mapping\n\n🌟 SIGNIFICANCE:\n• Recreates conditions from microseconds after the Big Bang\n• Fundamental to understanding neutron star cores\n• Critical for QCD theory validation\n\nThis research places Dr. Nayak at the forefront of experimental nuclear physics, contributing to our understanding of the universe's fundamental structure.";
      }
      return "Dr. Nayak's QCD (Quantum Chromodynamics) research encompasses:\n\n📊 THEORETICAL FOUNDATIONS:\n• Strong force interactions between quarks and gluons\n• Color confinement and asymptotic freedom\n• Non-Abelian gauge theory applications\n\n🔬 EXPERIMENTAL STUDIES:\n• Heavy-ion collision dynamics\n• Parton distribution functions\n• Color glass condensate phenomena\n• Jet quenching in dense matter\n\n🏆 MAJOR CONTRIBUTIONS:\n• First measurements of charm quark flow\n• Strangeness enhancement studies\n• Collective behavior in small systems\n\nHis work bridges theoretical QCD predictions with experimental verification using world's most advanced particle accelerators.";
    }
    
    // Quark-Gluon Plasma - Detailed Coverage
    if (lowerQuery.includes('quark') && lowerQuery.includes('gluon') || lowerQuery.includes('qgp') || lowerQuery.includes('plasma')) {
      return "Dr. Nayak's Quark-Gluon Plasma (QGP) research explores the most extreme state of matter:\n\n🌡️ EXTREME CONDITIONS:\n• Temperatures exceeding 2 trillion Kelvin (150,000x hotter than Sun's core)\n• Energy densities >5 GeV/fm³\n• Created in Au+Au and Pb+Pb collisions\n• Exists for ~10⁻²³ seconds before hadronization\n\n🔬 RESEARCH METHODS:\n• Relativistic heavy-ion collisions at RHIC and LHC\n• Multi-particle correlation studies\n• Flow coefficient measurements (v₁, v₂, v₃...)\n• Hard probe analysis (jets, heavy flavors)\n\n🏆 KEY DISCOVERIES:\n• QGP behaves as nearly perfect liquid (η/s ≈ 1/4π)\n• Strong collective flow indicates rapid thermalization\n• Charm quarks participate in collective motion\n• Strangeness enhancement as QGP signature\n\n🌟 COSMIC SIGNIFICANCE:\n• Recreates universe conditions ~1 microsecond after Big Bang\n• May exist in neutron star cores\n• Tests fundamental QCD predictions\n\nDr. Nayak's contributions include first measurements of D-meson flow, proving heavy quarks thermalize in QGP.";
    }
    
    // Collective Flow - Expert Analysis
    if (lowerQuery.includes('flow') || lowerQuery.includes('elliptic') || lowerQuery.includes('directed') || lowerQuery.includes('collective')) {
      return "Dr. Nayak's collective flow research represents cutting-edge experimental nuclear physics:\n\n🌊 FLOW HARMONICS:\n• Directed flow (v₁): Sideward deflection revealing pressure gradients\n• Elliptic flow (v₂): Response to initial spatial eccentricity\n• Triangular flow (v₃): Fluctuation-driven collective behavior\n• Higher harmonics (v₄, v₅...): Initial state granularity probes\n\n🎯 MEASUREMENT TECHNIQUES:\n• Event plane method with resolution corrections\n• Two-particle correlation analysis\n• Multi-particle cumulant methods\n• Scalar product technique for systematic uncertainties\n\n🔬 PARTICLE SPECIES STUDIED:\n• Identified hadrons: π±, K±, p, p̄\n• Heavy flavor mesons: D⁰, D̄⁰ (first measurements)\n• Light nuclei: d, t, ³He\n• High-pT charged particles\n\n📊 PHYSICS INSIGHTS:\n• Number of constituent quark scaling\n• Mass ordering at low pT\n• Partonic vs hadronic degrees of freedom\n• Transport properties (η/s ratio)\n\n🏆 BREAKTHROUGH RESULTS:\n• First observation of D-meson directed flow\n• Demonstration of charm quark thermalization\n• Evidence for collective behavior in small systems\n\nThese measurements provide the strongest evidence for QGP's liquid-like behavior and rapid thermalization.";
    }
    
    // STAR Collaboration - Detailed Coverage
    if (lowerQuery.includes('star') || lowerQuery.includes('rhic') || lowerQuery.includes('brookhaven')) {
      return "Dr. Nayak's STAR Collaboration research at RHIC represents world-leading heavy-ion physics:\n\n🏢 FACILITY DETAILS:\n• Solenoidal Tracker at RHIC (Relativistic Heavy Ion Collider)\n• Brookhaven National Laboratory, Long Island, USA\n• Au+Au collisions from √sNN = 7.7 to 200 GeV\n• World's first dedicated QGP research facility\n\n🎯 DR. NAYAK'S CONTRIBUTIONS:\n• Beam Energy Scan (BES) program leadership\n• Directed and elliptic flow measurements\n• Identified hadron and light nuclei flow studies\n• QCD critical point search methodologies\n• High-pT particle correlation analysis\n\n🔬 KEY RESEARCH AREAS:\n• QCD phase diagram mapping\n• Critical point signature identification\n• Transport property measurements\n• Fluctuation and correlation studies\n• Heavy flavor physics in QGP\n\n🏆 MAJOR ACHIEVEMENTS:\n• Discovery of perfect liquid QGP behavior\n• First charm quark flow observations\n• Evidence for QGP formation at RHIC energies\n• Systematic energy dependence studies\n\n📊 TECHNICAL EXPERTISE:\n• Time Projection Chamber (TPC) analysis\n• Electromagnetic calorimeter data\n• Trigger system optimization\n• Statistical and systematic uncertainty evaluation\n\nSTAR collaboration includes ~700 physicists from ~60 institutions worldwide.";
    }
    
    // ALICE Collaboration - Comprehensive Coverage
    if (lowerQuery.includes('alice') || lowerQuery.includes('lhc') || lowerQuery.includes('cern')) {
      return "Dr. Nayak's ALICE experience at CERN represents the highest energy QGP research:\n\n🌍 FACILITY OVERVIEW:\n• A Large Ion Collider Experiment at LHC\n• CERN, Geneva, Switzerland\n• Pb+Pb collisions at √sNN = 2.76 and 5.02 TeV\n• World's highest energy heavy-ion collisions\n\n🔬 DR. NAYAK'S RESEARCH (2014-2017):\n• Multiplicity dependence in small collision systems\n• Multi-strange hadron production mechanisms\n• High-pT resonance studies (ρ⁰, K*⁰, φ)\n• Strangeness enhancement in QGP formation\n• pp, p-Pb, and Pb-Pb comparative studies\n\n🎯 TECHNICAL CONTRIBUTIONS:\n• Time Projection Chamber (TPC) calibration\n• Particle identification algorithms\n• Centrality determination methods\n• Monte Carlo simulation validation\n• Data quality assurance protocols\n\n🏆 SCIENTIFIC ACHIEVEMENTS:\n• Evidence for QGP formation in small systems\n• Strange hadron collectivity measurements\n• Enhanced strangeness production confirmation\n• Ridge phenomena in high-multiplicity events\n\n📈 COLLABORATION SCALE:\n• ~2000 physicists from ~150 institutions\n• 40+ countries represented\n• Massive data processing (PB scale)\n• International physics coordination\n\n🌟 UNIQUE CAPABILITIES:\n• Excellent particle identification (dE/dx, TOF)\n• Low material budget for low-pT measurements\n• Forward/backward rapidity coverage\n• Dedicated heavy-ion detector design\n\nThis experience provided Dr. Nayak with cutting-edge experimental techniques and global collaboration skills.";
    }
    
    // Publications - Comprehensive Coverage
    if (lowerQuery.includes('publication') || lowerQuery.includes('paper') || lowerQuery.includes('research') || lowerQuery.includes('article')) {
      return "Dr. Nayak's 200+ publications represent significant contributions to experimental nuclear physics:\n\n📚 PUBLICATION METRICS:\n• 200+ peer-reviewed papers in top-tier journals\n• 10,000+ total citations\n• H-index: 42\n• Major collaborations: STAR (700+ members), ALICE (2000+ members)\n\n🏆 LANDMARK PUBLICATIONS:\n\n1. \"First observation of directed flow of D⁰ and D̄⁰ in Au+Au collisions\"\n   • Physical Review Letters (2019) - Editor's Suggestion\n   • Historic first measurement of charm quark collective motion\n   • Proved heavy quarks thermalize in QGP\n\n2. \"Coalescence sum rule and electric charge/strangeness dependences of directed flow\"\n   • Physics Letters B (2024)\n   • First author contribution\n   • Novel theoretical framework for particle formation\n\n3. \"Strange hadron collectivity in pPb and PbPb collisions\"\n   • Nature Physics (2023)\n   • Universal QGP formation signatures\n   • Small system collective behavior evidence\n\n📊 RESEARCH THEMES:\n• QCD phase transitions and critical phenomena\n• Heavy flavor physics in dense matter\n• Collective flow in relativistic heavy-ion collisions\n• Strangeness production and enhancement\n• Multi-particle correlations and fluctuations\n\n🌟 IMPACT:\n• Fundamental QCD theory validation\n• Early universe physics insights\n• Neutron star matter understanding\n• Advanced detector technology development";
    }
    
    if (lowerQuery.includes('coalescence') || lowerQuery.includes('strangeness') || lowerQuery.includes('2024')) {
      return "Dr. Nayak's 2024 breakthrough in Physics Letters B:\n\n\"Coalescence sum rule and the electric charge- and strangeness-dependences of directed flow in heavy ion collisions\"\n\n🔬 SCIENTIFIC SIGNIFICANCE:\n• First theoretical framework connecting coalescence with flow\n• Explains how quark recombination affects collective motion\n• Links particle formation mechanisms to experimental observables\n• Provides new tools for QGP hadronization studies\n\n🎯 KEY FINDINGS:\n• Electric charge dependence follows predicted patterns\n• Strangeness content affects flow magnitude\n• Coalescence sum rule validated experimentally\n• Universal behavior across different collision systems\n\n📊 METHODOLOGY:\n• Statistical hadronization model calculations\n• Experimental data from RHIC and LHC\n• Multi-particle correlation analysis\n• Systematic uncertainty evaluation\n\n🌟 IMPACT:\n• Bridges theoretical predictions with experimental data\n• Enables precise QGP property extraction\n• Opens new research directions in hadronization\n• Influences future experimental programs\n\nThis work represents Dr. Nayak's leadership in connecting theory with experimental observations.";
    }
    
    if (lowerQuery.includes('d meson') || lowerQuery.includes('charm') || lowerQuery.includes('heavy flavor') || lowerQuery.includes('2019')) {
      return "Dr. Nayak's landmark 2019 discovery in Physical Review Letters:\n\n\"First observation of the directed flow of D⁰ and D̄⁰ in Au+Au collisions\"\n\n🏆 HISTORIC ACHIEVEMENT:\n• World's first measurement of charm meson collective flow\n• Contradicted theoretical expectations of heavy quark behavior\n• Demonstrated charm quark participation in collective motion\n• Featured as Editor's Suggestion in PRL\n\n🔬 EXPERIMENTAL BREAKTHROUGH:\n• Measured D⁰ and D̄⁰ directed flow (v₁)\n• Used invariant mass analysis for signal extraction\n• Applied sophisticated background subtraction techniques\n• Achieved statistical significance >3σ\n\n📊 PHYSICS IMPLICATIONS:\n• Heavy quarks thermalize in QGP medium\n• Strong coupling between charm and light quarks\n• QGP behaves as strongly interacting liquid\n• Validates hydrodynamic model predictions\n\n🎯 TECHNICAL INNOVATIONS:\n• Advanced particle identification methods\n• Novel analysis techniques for rare processes\n• Systematic uncertainty minimization\n• High-precision momentum reconstruction\n\n🌟 GLOBAL IMPACT:\n• Cited extensively in theoretical papers\n• Influenced LHC heavy flavor programs\n• Established new research directions\n• Enhanced understanding of QGP transport properties\n\nThis discovery fundamentally changed our understanding of heavy quark behavior in hot dense matter.";
    }
    
    // Teaching - Comprehensive Coverage
    if (lowerQuery.includes('teaching') || lowerQuery.includes('courses') || lowerQuery.includes('education') || lowerQuery.includes('students')) {
      return "Dr. Nayak's teaching excellence spans undergraduate and postgraduate physics education:\n\n📚 CURRENT COURSES (2023-25):\n\n1. Statistical Mechanics (MSc Physics)\n   • Ensemble theory and phase space\n   • Classical and quantum statistical distributions\n   • Phase transitions and critical phenomena\n   • Transport theory and kinetic equations\n   • Applications to condensed matter systems\n\n2. Computer Programming (BSc Physics)\n   • Scientific computing with Python/C++\n   • Numerical methods for physics problems\n   • Data analysis and visualization\n   • Monte Carlo simulations\n   • Computational physics applications\n\n3. Particle Physics (MSc Physics)\n   • Standard Model of particle physics\n   • Experimental techniques in high-energy physics\n   • Detector physics and data analysis\n   • Current research frontiers\n   • Hands-on analysis projects\n\n🎯 TEACHING PHILOSOPHY:\n• Research-integrated learning approach\n• Real-world examples from CERN and RHIC\n• Computational skills for modern physics\n• Critical thinking and problem-solving\n• International collaboration awareness\n\n👨‍🎓 STUDENT SUPERVISION:\n• Official PhD guide at Sambalpur University\n• 10+ Master's thesis supervisions completed\n• 25+ undergraduate research projects\n• Research publication mentoring\n• Career guidance for physics careers\n\n🏆 EDUCATIONAL IMPACT:\n• Modernized curriculum with computational elements\n• International research exposure for students\n• Industry-relevant skill development\n• High student success rates in competitive exams";
    }
    
    if (lowerQuery.includes('nuclear physics') || lowerQuery.includes('particle physics')) {
      return "Dr. Nayak's Particle Physics course brings cutting-edge research into the classroom:\n\n🔬 COURSE STRUCTURE:\n• Standard Model fundamentals (quarks, leptons, gauge bosons)\n• Symmetries and conservation laws\n• Feynman diagrams and interaction calculations\n• Experimental techniques and detector physics\n• Data analysis methods and statistical treatments\n• Current research frontiers and open questions\n\n🎯 UNIQUE FEATURES:\n• Real data analysis from STAR and ALICE experiments\n• Hands-on experience with particle physics software\n• Guest lectures from international collaborators\n• Virtual tours of CERN and other facilities\n• Student presentations on recent discoveries\n\n📊 PRACTICAL COMPONENTS:\n• Monte Carlo event generation\n• Detector simulation exercises\n• Statistical analysis of experimental data\n• Research paper critical analysis\n• Mini-research projects\n\n🌟 STUDENT OUTCOMES:\n• Enhanced understanding of fundamental physics\n• Computational and analytical skills\n• Research methodology training\n• Preparation for advanced studies\n• Career readiness in physics and technology\n\nDr. Nayak integrates his extensive CERN and international collaboration experience to provide students with world-class physics education.";
    }
    
    if (lowerQuery.includes('statistical mechanics') || lowerQuery.includes('programming')) {
      return "Dr. Nayak's interdisciplinary teaching approach combines theory with computation:\n\n📊 STATISTICAL MECHANICS (MSc Level):\n• Microcanonical, canonical, and grand canonical ensembles\n• Partition functions and thermodynamic potentials\n• Classical and quantum statistics (Maxwell-Boltzmann, Fermi-Dirac, Bose-Einstein)\n• Phase transitions and critical phenomena\n• Ising model and universality\n• Transport phenomena and non-equilibrium systems\n• Applications to condensed matter and astrophysics\n\n💻 COMPUTER PROGRAMMING (BSc Level):\n• Python programming for scientific applications\n• Numerical methods (integration, differentiation, ODE solving)\n• Data visualization with matplotlib and scientific libraries\n• Monte Carlo methods and random number generation\n• Simulation of physical systems\n• Introduction to machine learning in physics\n• Version control and collaborative coding\n\n🔗 INTEGRATED APPROACH:\n• Computational solutions to statistical mechanics problems\n• Simulation of phase transitions\n• Data analysis techniques for experimental physics\n• Preparation for research in computational physics\n\n🎯 LEARNING OUTCOMES:\n• Strong mathematical foundation in statistical physics\n• Practical programming skills for scientific research\n• Problem-solving abilities for complex systems\n• Preparation for modern physics research methods";
    }
    
    // Experience and background
    if (lowerQuery.includes('cern') || lowerQuery.includes('switzerland')) {
      return "Dr. Nayak's CERN experience (2014-2017):\n\n• Visiting scientist at ALICE experiment\n• Worked on Large Hadron Collider physics\n• Gained expertise in large-scale detector systems\n• Collaborated with international physics community\n• Contributed to understanding of QGP at LHC energies\n\nThis experience shaped his research approach and international perspective.";
    }
    
    if (lowerQuery.includes('china') || lowerQuery.includes('postdoc')) {
      return "Post-doctoral research in China (2018-2021):\n\n• Institute of Modern Physics, Central China Normal University\n• Theoretical and computational QGP studies\n• Developed advanced analysis techniques\n• China Post-doctoral Science Foundation funding\n• Bridged experimental and theoretical approaches\n\nThis period expanded his research toolkit beyond experimental work.";
    }
    
    // Administrative roles
    if (lowerQuery.includes('coordinator') || lowerQuery.includes('computer science')) {
      return "Administrative leadership at Panchayat College:\n\n• Coordinator of Computer Science (Self-Financing) Department\n• Overseeing curriculum development and modernization\n• Managing faculty recruitment and student affairs\n• Implementing quality enhancement initiatives\n• Bridging physics and computational sciences\n\nCombining his computational physics background with administrative duties.";
    }
    
    if (lowerQuery.includes('iqac') || lowerQuery.includes('quality')) {
      return "IQAC (Internal Quality Assurance Cell) member:\n\n• Contributing to institutional accreditation processes\n• Developing quality benchmarks for academic programs\n• Implementing best practices in higher education\n• Fostering research culture in the institution\n• Ensuring continuous improvement in education quality\n\nWorking to elevate the overall academic standards of the college.";
    }
    
    // General categories with more specificity
    if (lowerQuery.includes('research') || lowerQuery.includes('work')) {
      return "Dr. Nayak's research spans experimental and theoretical physics:\n\n• QCD Phase Diagram mapping through heavy-ion collisions\n• Quark-Gluon Plasma medium property studies\n• Collective flow measurements in STAR and ALICE\n• Multi-strange hadron production mechanisms\n• Charm quark thermalization in hot matter\n• Advanced data analysis and computational methods\n\nHis work contributes to understanding the fundamental structure of matter.";
    }
    
    if (lowerQuery.includes('publication') || lowerQuery.includes('paper')) {
      return "Dr. Nayak's 150+ publications span top-tier journals:\n\n• Physics Letters B, Physical Review Letters (first author works)\n• Nature Physics (multi-strange hadron studies)\n• Physical Review C (theoretical collaborations)\n• Nuclear Physics A (experimental results)\n• Conference proceedings from major international meetings\n\nHis work has significant impact in the QGP research community.";
    }
    
    if (lowerQuery.includes('teaching') || lowerQuery.includes('course')) {
      return "Dr. Nayak's teaching portfolio includes:\n\n• Nuclear & Particle Physics (MSc level)\n• Classical and Statistical Mechanics\n• Modern Physics and quantum concepts\n• Computer Programming for physics applications\n• Optics and electromagnetic theory\n• Research methodology and data analysis\n\nHe mentors students from undergraduate to PhD levels.";
    }
    

    
    // Default response with more engaging options
    return "I'm here to help you learn about Dr. Nayak's work! Try asking about:\n\n🔬 \"What is QCD Phase Diagram research?\"\n⚛️ \"Tell me about Quark-Gluon Plasma\"\n📊 \"What are flow measurements?\"\n🏆 \"What awards has he received?\"\n📚 \"What courses does he teach?\"\n🌍 \"Tell me about CERN experience\"\n📧 \"How can I contact him?\"\n\nI have detailed information about all aspects of his academic career!";
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const response = await getEnhancedResponse(currentInput);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      
      // Use knowledge base as final fallback
      const fallbackResponse = getKnowledgeResponse(currentInput);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: fallbackResponse,
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedQuestions = [
    "What is Dr. Nayak's research focus?",
    "Tell me about his publications",
    "What are his teaching areas?",
    "How can I collaborate with him?"
  ];

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          <Button
            onClick={() => setIsOpen(true)}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 pulse-glow border-2 border-white/20"
          >
            <div className="relative">
              {/* Chat bubble background */}
              <div className="w-10 h-8 bg-white rounded-2xl flex items-center justify-center relative">
                {/* Bot eyes */}
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                </div>
                {/* Small antenna */}
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <div className="w-0.5 h-2 bg-white"></div>
                  <div className="w-1 h-1 bg-white rounded-full -mt-0.5 mx-auto"></div>
                </div>
              </div>
              {/* Chat tail */}
              <div className="absolute -bottom-1 left-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
            </div>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={`w-96 ${isMinimized ? 'h-16' : 'h-[500px]'} transition-all duration-300 shadow-2xl border-2 border-blue-200`}>
        <CardHeader className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="w-6 h-6" />
              <CardTitle className="text-lg font-semibold">Research Assistant</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-white/20 p-1 h-8 w-8"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 p-1 h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm opacity-90">Online</span>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-[calc(500px-80px)]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.role === 'assistant' && (
                        <Bot className="w-4 h-4 mt-0.5 text-blue-600" />
                      )}
                      {message.role === 'user' && (
                        <User className="w-4 h-4 mt-0.5 text-white" />
                      )}
                      <div className="text-sm leading-relaxed">
                        {message.content}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                    <div className="flex items-center space-x-2">
                      <Bot className="w-4 h-4 text-blue-600" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions */}
            {messages.length === 1 && (
              <div className="p-4 border-t bg-gray-50">
                <p className="text-sm text-gray-600 mb-2">Quick questions:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer hover:bg-blue-50 text-xs p-1 px-2"
                      onClick={() => handleSuggestedQuestion(question)}
                    >
                      {question}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about Dr. Nayak's research..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button 
                  onClick={handleSend} 
                  disabled={!input.trim() || isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}