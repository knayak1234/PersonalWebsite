import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Award, ExternalLink, Globe, Presentation, Calendar, GraduationCap, TrendingUp, Quote, Star } from "lucide-react";

export default function PublicationsSection() {
  const publicationStats = [
    { number: "200+", label: "Total Publications", icon: BookOpen, color: "from-blue-500 to-blue-600", impact: "High" },
    { number: "10K+", label: "Total Citations", icon: TrendingUp, color: "from-green-500 to-green-600", impact: "Research Impact" },
    { number: "16", label: "Conference Papers", icon: Presentation, color: "from-purple-500 to-purple-600", impact: "International" },
    { number: "11", label: "Invited Talks", icon: Globe, color: "from-orange-500 to-orange-600", impact: "Global" },
  ];

  const selectedPublications = [
    {
      title: "System size dependence of charged hadrons directed flow at √sNN = 200 GeV using a multi-phase transport model",
      authors: "Kishora Nayak, Vipul Bairathi",
      journal: "European Physical Journal C",
      volume: "85",
      pages: "1236",
      year: "2025",
      type: "First Author",
      collaboration: "Theory",
      color: "bg-purple-100 text-purple-800",
      doi: "https://doi.org/10.1140/epjc/s10052-025-14966-5"
    },
    {
      title: "Coalescence sum rule and the electric charge- and strangeness-dependences of directed flow in heavy ion collisions",
      authors: "Kishora Nayak, Shusu Shi, Zi-Wei Lin",
      journal: "Physics Letters B",
      volume: "849",
      pages: "138479",
      year: "2024",
      type: "First Author",
      collaboration: "Theory",
      color: "bg-red-100 text-red-800",
      doi: "https://doi.org/10.1016/j.physletb.2024.138479"
    },
    {
      title: "Directed and elliptic flow of identified hadrons, high-pT charged hadrons and light nuclei in Au+Au collisions at STAR",
      authors: "Kishora Nayak (STAR Collaboration)",
      journal: "Nuclear Physics A",
      volume: "1005",
      pages: "121855",
      year: "2021",
      type: "First Author",
      collaboration: "STAR",
      color: "bg-blue-100 text-blue-800",
      doi: "https://doi.org/10.1016/j.nuclphysa.2020.121855"
    },
    {
      title: "First observation of the directed flow of D⁰ and D̄⁰ in Au+Au collisions at √sNN = 200 GeV",
      authors: "J. Adam et al. (STAR Collaboration)",
      journal: "Physical Review Letters",
      volume: "123",
      pages: "162301",
      year: "2019",
      type: "High Impact",
      collaboration: "STAR",
      color: "bg-red-100 text-red-800",
      doi: "https://doi.org/10.1103/PhysRevLett.123.162301"
    },
    {
      title: "Energy dependence study of directed flow in Au+Au collisions using an improved coalescence in a multiphase transport model",
      authors: "Kishora Nayak et al.",
      journal: "Physical Review C",
      volume: "100",
      pages: "054903",
      year: "2019",
      type: "Lead Author",
      collaboration: "Theory",
      color: "bg-yellow-100 text-yellow-800",
      doi: "https://doi.org/10.1103/PhysRevC.100.054903"
    },
    {
      title: "Enhanced production of multi-strange hadrons in high-multiplicity proton collisions",
      authors: "J. Adam et al. (ALICE Collaboration)",
      journal: "Nature Physics",
      volume: "13",
      pages: "535-539",
      year: "2017",
      type: "High Impact",
      collaboration: "ALICE",
      color: "bg-green-100 text-green-800",
      doi: "https://www.nature.com/articles/nphys4111"
    },
  ];

  const organisedEvents = [
    {
      title: "National Conference on Frontiers in Physics & Technology (FPT-2026)",
      role: "Organising Secretary",
      institution: "Panchayat College, Bargarh",
      year: "2026",
      link: "https://fpt-2026.vercel.app",
      description: "Organised and coordinated a national-level conference on cutting-edge topics in physics and technology."
    },
  ];

  const recentConferences: {
    title: string;
    location: string;
    year: string;
    talk: string;
    type: string;
    date?: string;
    link?: string;
    publication?: string;
  }[] = [
    {
      title: "10th Asian Triangle Heavy-Ion Conference (ATHIC 2025)",
      location: "IISER, Berhampur, India",
      year: "2025",
      talk: "Dependence of directed flow on system size and net conserved charges from quark coalescence in heavy-ion collisions",
      type: "Talk",
      link: "https://indico.cern.ch/event/1424442/overview"
    },
    {
      title: "52nd International Symposium on Multiparticle Dynamics (ISMD 2023)",
      location: "Károly Róbert Campus of MATE in Gyöngyös, Hungary",
      year: "2023",
      talk: "Understanding the effect of strangeness and electric charge on the NCQ scaling of directed flow",
      type: "Talk",
      date: "August 21-25, 2023",
      link: "https://indico.cern.ch/event/1258038/timetable/?view=standard_numbered"
    },
    {
      title: "10th International Conference on New Frontiers in Physics (ICNFP)",
      location: "Online Conference",
      year: "2021",
      talk: "Collective flow in relativistic heavy-ion collisions (A short review on experimental results)",
      type: "Talk",
      date: "August 23, 2021 to October 7, 2021",
      link: "https://indico.cern.ch/event/1025480"
    },
    {
      title: "XXIV DAE-BRNS High Energy Physics Symposium",
      location: "NISER, India",
      year: "2020",
      talk: "Directed flow of identified hadrons in Au+Au collisions with the STAR experiment at RHIC",
      type: "Talk",
      date: "December 14-18, 2020",
      publication: "Springer Proc. Phys. 277, 381-384 (2022)"
    },
    {
      title: "Quark Matter 2019",
      location: "Wuhan, China",
      year: "2019",
      talk: "Directed and elliptic flow of identified hadrons, high-pT charged hadrons and light nuclei in Au+Au collisions at STAR",
      type: "Invited",
      link: "https://indico.cern.ch/event/792436"
    },
    {
      title: "ATHIC 2018",
      location: "Hefei, China",
      year: "2018",
      talk: "Using AMPT study: The directed flow in Au+Au collisions at 7.7-200 GeV",
      type: "Talk",
      link: "https://indico.ihep.ac.cn/event/8180/timetable/?view=standard"
    },
  ];

  return (
    <section id="publications" className="section-padding bg-gradient-to-br from-gray-50 to-slate-100 particles">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 fade-in">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 font-serif gradient-text">Publications & Presentations</h2>
          <p className="text-xl text-muted-foreground">
            Peer-reviewed research contributions and international conference presentations
          </p>
        </div>
        
        {/* Publication Statistics */}
        <div className="grid md:grid-cols-4 gap-6 mb-16 fade-in">
          {publicationStats.map((stat, index) => (
            <Card key={index} className={`text-center research-card glow hover:glow-border stagger-${index + 1} group`}>
              <CardContent className="p-6">
                <div className={`w-16 h-16 bg-gradient-to-r ${stat.color} text-white rounded-full flex items-center justify-center mx-auto mb-4 float group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-8 h-8" />
                </div>
                <div className="text-3xl font-bold stat-number mb-2 counter">{stat.number}</div>
                <div className="text-muted-foreground font-medium mb-2">{stat.label}</div>
                <Badge variant="outline" className="text-xs">{stat.impact}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Selected Publications */}
        <div className="mb-16 slide-in-left">
          <h3 className="text-2xl font-semibold text-foreground mb-8 font-serif gradient-text">Selected Publications</h3>
          <div className="space-y-3">
            {selectedPublications.map((pub, index) => (
              <Card key={index} className={`publication-card research-card group cursor-pointer stagger-${index + 1}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge className={`${pub.color} text-xs px-2 py-0.5`}>{pub.type}</Badge>
                      {pub.type === "First Author" && <Star className="w-3.5 h-3.5 text-yellow-500" />}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">{pub.collaboration}</Badge>
                      <span className="text-xs text-muted-foreground">{pub.year}</span>
                    </div>
                  </div>

                  <a
                    href={pub.doi}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-base font-semibold text-foreground mb-1 leading-snug hover:text-primary transition-colors"
                  >
                    "{pub.title}"
                  </a>

                  <p className="text-sm text-muted-foreground mb-1">
                    <span className="font-medium">{pub.authors}</span>
                  </p>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      <span className="italic">{pub.journal}</span>{" "}
                      <span className="font-mono">{pub.volume}</span>, {pub.pages} ({pub.year})
                    </p>
                    <a
                      href={pub.doi}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs text-primary hover:text-primary/80 transition-colors font-medium ml-4 shrink-0"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      DOI
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Button 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              onClick={() => window.open('https://inspirehep.net/literature?sort=mostrecent&size=25&page=1&q=a%20Kishora.Nayak.1&ui-citation-summary=true', '_blank')}
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              View Complete Publication List
            </Button>
          </div>
        </div>
        
        {/* Research Profiles */}
        <div className="mb-16 fade-in">
          <h3 className="text-2xl font-semibold text-foreground mb-8 font-serif text-center">Research Profiles</h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.open('https://orcid.org/0000-0003-1942-317X', '_blank')}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ExternalLink className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">ORCID</h4>
                <p className="text-xs text-muted-foreground">0000-0003-1942-317X</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.open('https://www.researchgate.net/profile/Kishora-Nayak', '_blank')}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">ResearchGate</h4>
                <p className="text-sm text-muted-foreground">Profile</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.open('https://scholar.google.com/citations?hl=en&user=ow_EdYoAAAAJ&view_op=list_works&sortby=pubdate', '_blank')}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-6 h-6 text-orange-600" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Google Scholar</h4>
                <p className="text-sm text-muted-foreground">Citations</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.open('https://vidwan.inflibnet.ac.in/myprofile', '_blank')}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Vidwan</h4>
                <p className="text-sm text-muted-foreground">Profile</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Conference Presentations */}
        <div className="fade-in">
          <h3 className="text-2xl font-semibold text-foreground mb-8 font-serif">Recent Conference Presentations</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            {recentConferences.map((conf, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Presentation className="w-5 h-5 text-primary" />
                      {conf.link ? (
                        <a 
                          href={conf.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer"
                        >
                          {conf.title}
                        </a>
                      ) : (
                        <h4 className="font-semibold text-foreground">{conf.title}</h4>
                      )}
                    </div>
                    {conf.type === "Invited" && (
                      <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                        {conf.type}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 mb-3 text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <Globe className="w-4 h-4 mr-1" />
                      {conf.location}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {conf.year}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground italic mb-3">
                    "{conf.talk}"
                  </p>
                  
                  {conf.publication && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-muted-foreground mb-2">
                        <strong>Publication:</strong> {conf.publication}
                      </p>
                      {conf.link && (
                        <a 
                          href={conf.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-xs text-primary hover:text-primary/80 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Conference Website
                        </a>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Organised Events */}
        <div className="mt-16 fade-in">
          <h3 className="text-2xl font-semibold text-foreground mb-8 font-serif gradient-text">Organised Events</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {organisedEvents.map((event, index) => (
              <Card key={index} className="research-card hover:glow-border group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-primary" />
                      <a
                        href={event.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-foreground hover:text-primary transition-colors"
                      >
                        {event.title}
                      </a>
                    </div>
                    <Badge className="bg-indigo-100 text-indigo-800 text-xs shrink-0 ml-2">{event.year}</Badge>
                  </div>
                  <div className="flex items-center space-x-2 mb-3 text-sm text-muted-foreground">
                    <Award className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium text-foreground">{event.role}</span>
                    <span>·</span>
                    <span>{event.institution}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{event.description}</p>
                  <a
                    href={event.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs text-primary hover:text-primary/80 transition-colors font-medium"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Conference Website
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
