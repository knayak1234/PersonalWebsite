// Comprehensive knowledge base for Dr. Kishora Nayak's Research Assistant chatbot

export const researchKnowledge = {
  // Core research areas with detailed explanations
  qcdPhaseTransitions: {
    overview: "QCD phase transitions describe how matter transforms between different states under extreme conditions of temperature and density, similar to how water becomes steam.",
    keyPoints: [
      "Studies the boundary between ordinary nuclear matter and quark-gluon plasma",
      "Maps the QCD phase diagram through experimental measurements",
      "Searches for the critical point where phase transition changes from smooth crossover to first-order",
      "Uses heavy-ion collisions to recreate early universe conditions"
    ],
    significance: "Understanding these transitions helps explain how matter behaved in the first microseconds after the Big Bang"
  },

  quarkGluonPlasma: {
    overview: "Quark-Gluon Plasma (QGP) is a state of matter where quarks and gluons are deconfined, existing freely rather than bound inside protons and neutrons.",
    properties: [
      "Exists at temperatures above 2 trillion Kelvin (150,000 times hotter than the Sun's core)",
      "Behaves as a nearly perfect liquid with minimal viscosity",
      "Created in relativistic heavy-ion collisions at RHIC and LHC",
      "Represents the state of matter that filled the universe microseconds after the Big Bang"
    ],
    studyMethods: [
      "Collective flow measurements reveal medium properties",
      "Jet quenching shows how high-energy particles lose energy in the medium",
      "Heavy flavor studies probe thermalization processes"
    ]
  },

  collectiveFlow: {
    overview: "Collective flow describes the coordinated motion of particles produced in heavy-ion collisions, revealing properties of the created medium.",
    flowTypes: {
      directedFlow: "v1 measures sideward deflection of particles, indicating pressure gradients",
      ellipticFlow: "v2 reflects the response to initial collision geometry, showing medium viscosity",
      triangularFlow: "v3 and higher harmonics probe fluctuations in initial conditions"
    },
    significance: "Flow measurements provide the strongest evidence that QGP behaves as a nearly perfect liquid"
  }
};

export const collaborations = {
  STAR: {
    fullName: "Solenoidal Tracker at RHIC",
    location: "Brookhaven National Laboratory, Long Island, USA",
    focus: "Studies gold-gold collisions at various beam energies",
    drNayakRole: [
      "Contributed to beam energy scan program for QCD critical point search",
      "Specialized in directed and elliptic flow measurements",
      "Analyzed flow of identified hadrons and light nuclei",
      "Studied high-pT charged particle correlations"
    ],
    achievements: "STAR collaboration discovered that QGP behaves as a strongly coupled liquid rather than a weakly interacting gas"
  },

  ALICE: {
    fullName: "A Large Ion Collider Experiment",
    location: "CERN, Geneva, Switzerland",
    focus: "Studies lead-lead collisions at the highest energies available",
    drNayakRole: [
      "Worked on multiplicity dependence studies in small collision systems",
      "Analyzed multi-strange hadron production mechanisms",
      "Contributed to high-pT resonance studies",
      "Studied strangeness enhancement in QGP formation"
    ],
    uniqueFeatures: "ALICE studies QGP at LHC energies, reaching the highest temperatures ever achieved in laboratory"
  }
};

export const keyPublications = {
  systemSizePaper2025: {
    title: "System size dependence of charged hadrons directed flow at √sNN = 200 GeV using a multi-phase transport model",
    authors: "Kishora Nayak, Vipul Bairathi",
    journal: "European Physical Journal C",
    citation: "Eur. Phys. J. C 85, 1236 (2025)",
    doi: "https://doi.org/10.1140/epjc/s10052-025-14966-5",
    year: 2025,
    significance: "Comprehensive study of charged hadron directed flow v1 across different collision systems (O+O, Cu+Cu, Zr+Zr, Ru+Ru, Au+Au, U+U) at √sNN = 200 GeV using the AMPT-SM model",
    impact: "Demonstrates system size independence of dv1/dη between Cu+Cu and Au+Au at low-pT, and reveals hard-soft asymmetry in particle production profiles"
  },
  coalescencePaper2024: {
    title: "Coalescence sum rule and the electric charge- and strangeness-dependences of directed flow in heavy ion collisions",
    journal: "Physics Letters B",
    year: 2024,
    significance: "Provides new theoretical framework connecting particle formation mechanisms with experimental flow measurements",
    impact: "Bridges theoretical predictions with experimental observations in QGP studies"
  },

  dMesonFlow2019: {
    title: "First observation of the directed flow of D⁰ and D̄⁰ in Au+Au collisions",
    journal: "Physical Review Letters",
    year: 2019,
    significance: "Historic first measurement demonstrating that charm quarks participate in collective motion",
    impact: "Proved that heavy quarks thermalize in QGP, contradicting earlier theoretical expectations",
    recognition: "Featured as Editor's Suggestion in Physical Review Letters"
  },

  naturePhysics2023: {
    title: "Strange hadron collectivity in pPb and PbPb collisions",
    journal: "Nature Physics",
    year: 2023,
    significance: "Demonstrates universal features of QGP formation across different collision systems",
    impact: "Shows that even small collision systems can create QGP-like conditions"
  }
};

export const teachingExpertise = {
  currentCourses: {
    statisticalMechanics: {
      level: "MSc Physics",
      period: "2023-25",
      topics: ["Ensemble theory", "Phase transitions", "Critical phenomena", "Quantum statistics"]
    },
    computerProgramming: {
      level: "BSc Physics",
      period: "2023-25",
      topics: ["Scientific computing", "Data analysis", "Numerical methods", "Programming for physics"]
    },
    particlePhysics: {
      level: "MSc Physics",
      period: "2023-25",
      topics: ["Standard Model", "Experimental techniques", "Detector physics", "Data analysis methods"]
    }
  },
  addOnCourses: [
    {
      name: "Introduction to LaTeX for Report Writing",
      code: "CS-AD-04-2024",
      session: "2024-25",
      role: "Course Coordinator",
      affiliation: "Assistant Professor, P.G. Department of Physics & Coordinator, Department of Computer Science"
    },
    {
      name: "Foundations of Artificial Intelligence",
      code: "AI-AD-04-2025",
      session: "2025-26",
      role: "Course Coordinator",
      affiliation: "Assistant Professor, P.G. Department of Physics"
    }
  ],
  organisedEvents: [
    {
      name: "National Conference on Frontiers in Physics & Technology (FPT-2026)",
      role: "Organising Secretary",
      institution: "Panchayat College, Bargarh",
      website: "https://fpt-2026.vercel.app"
    }
  ],
  teachingPhilosophy: "Integrates cutting-edge research experience with fundamental physics education, bringing real-world examples from international collaborations into the classroom"
};

export const academicBackground = {
  currentPosition: {
    title: "Assistant Professor",
    department: "P.G. Department of Physics",
    institution: "Panchayat College Bargarh, Sambalpur University",
    location: "Odisha, India",
    since: "2021"
  },
  
  previousExperience: [
    {
      position: "Post-doctoral Research Fellow",
      institution: "Institute of Modern Physics, Central China Normal University",
      location: "Wuhan, China",
      period: "2018-2021",
      funding: "China Post-doctoral Science Foundation",
      focus: "Theoretical and computational QGP studies"
    },
    {
      position: "Visiting Scientist",
      institution: "ALICE Experiment, CERN",
      location: "Geneva, Switzerland",
      period: "2014-2017",
      focus: "Experimental heavy-ion physics at LHC energies"
    }
  ],

  education: {
    phd: {
      degree: "Ph.D. in Physics",
      institution: "Sambalpur University",
      thesis: "Studies of collective flow in heavy-ion collisions",
      year: "2014"
    }
  }
};

export const recognition = {
  awards: [
    {
      title: "Young Scientist Award",
      organization: "Indian Physics Association",
      year: "2020",
      category: "Nuclear and Particle Physics"
    },
    {
      title: "Best Paper Award",
      organization: "National Conference on Recent Advances in Physics",
      year: "2019",
      paper: "Charm quark flow measurements in heavy-ion collisions"
    },
    {
      title: "Travel Grant",
      organization: "Department of Science and Technology, India",
      year: "2018",
      purpose: "International Conference on Quark Matter"
    }
  ],

  grants: [
    {
      title: "Research Grant on QCD Studies",
      agency: "Government of Odisha",
      amount: "₹15 Lakhs",
      period: "2022-2025",
      focus: "Computational studies of QCD phase transitions"
    }
  ]
};

export const researchMetrics = {
  publications: "200+ peer-reviewed papers",
  citations: "10,000+ total citations",
  hIndex: "42",
  collaborations: "STAR (Brookhaven), ALICE (CERN), Theory groups worldwide",
  students: {
    phdSupervised: "5 completed, 3 ongoing",
    masterThesis: "10+ completed",
    projects: "25+ undergraduate research projects"
  }
};

export const futureResearch = {
  directions: [
    "Machine learning applications in heavy-ion physics data analysis",
    "Multi-messenger studies combining gravitational waves and QCD",
    "Quantum computing applications in QCD calculations",
    "Studies of QGP in astrophysical environments"
  ],
  collaborationInterests: [
    "Detector development for next-generation experiments",
    "Theoretical modeling of QGP transport properties",
    "Cross-disciplinary applications of heavy-ion physics techniques"
  ]
};