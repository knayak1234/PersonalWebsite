import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Users, Settings, BookOpen, Award, Quote, Camera, Trophy, Star, Calendar, ExternalLink, FlaskConical } from "lucide-react";

export default function TeachingSection() {
  const courses = [
    { name: "Statistical Mechanics", level: "BSc/MSc", year: "2023-24, 25", semester: "Even", color: "bg-purple-500" },
    { name: "Computer Programming", level: "BSc/MSc", year: "2023-24, 25", semester: "Odd", color: "bg-orange-500", lab: "/teaching/computer-programming" },
    { name: "Particle Physics", level: "MSc", year: "2024-25", semester: "Even", color: "bg-blue-500" },
    { name: "Research Methodology", level: "MSc", year: "2025-26", semester: "Odd", color: "bg-cyan-500" },
    { name: "Classical Mechanics", level: "BSc/MSc", year: "2023-2024", semester: "Even", color: "bg-green-500" },
    { name: "Modern Physics", level: "BSc", year: "2024", semester: "Even", color: "bg-red-500" },
    { name: "Optics", level: "BSc", year: "2023-2024", semester: "Even", color: "bg-indigo-500" },
  ];

  const addOnCourses = [
    {
      name: "Introduction to LaTeX for Report Writing",
      code: "CS-AD-04-2024",
      session: "2024-25",
      color: "bg-teal-500",
      icon: "📄",
    },
    {
      name: "Foundations of Artificial Intelligence",
      code: "AI-AD-04-2025",
      session: "2025-26",
      color: "bg-violet-500",
      icon: "🤖",
    },
  ];

  const administrativeRoles = [
    {
      title: "Coordinator",
      department: "Department of Computer Science (SF)",
      institution: "Panchayat College",
      description: "Leading the self-financing computer science program, overseeing curriculum development and student affairs.",
      icon: Settings,
      link: null,
    },
    {
      title: "IQAC Member",
      department: "Internal Quality Assurance Cell",
      institution: "Panchayat College",
      description: "Contributing to institutional quality enhancement initiatives, accreditation processes, and academic excellence programs.",
      icon: Award,
      link: null,
    },
    {
      title: "Organising Secretary",
      department: "National Conference on Frontiers in Physics & Technology (FPT-2026)",
      institution: "Panchayat College, Bargarh",
      description: "Organised and coordinated a national-level conference on cutting-edge topics in physics and technology.",
      icon: Calendar,
      link: "https://fpt-2026.vercel.app",
    },
  ];

  const supervisionHighlights = [
    "Official PhD guide recognized by Sambalpur University, Odisha",
    "Currently guiding Project Assistant funded by MRIP-2023",
    "Supervising thesis projects for several BSc and MSc students",
    "Teaching assistant experience at NISER, Bhubaneswar",
  ];

  return (
    <section id="teaching" className="section-padding bg-gradient-to-br from-white to-blue-50 particles">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 fade-in">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 font-serif gradient-text">Teaching & Mentorship</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Dedicated to nurturing the next generation of physicists through comprehensive education and research guidance
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Teaching Experience */}
          <div className="fade-in">
            <h3 className="text-2xl font-semibold text-foreground mb-8 flex items-center font-serif">
              <BookOpen className="w-6 h-6 mr-3 text-primary" />
              Courses Taught
            </h3>
            
            <div className="grid gap-4 mb-8">
              {courses.map((course, index) => {
                const cardInner = (
                  <Card className={`research-card hover:glow-border group cursor-pointer h-full ${course.lab ? "ring-1 ring-orange-200 hover:ring-orange-400" : ""}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 ${course.color} text-white rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                            <BookOpen className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground text-lg group-hover:text-primary transition-colors">{course.name}</h4>
                            <div className="flex items-center flex-wrap gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">{course.level}</Badge>
                              <Badge variant="default" className="text-xs">
                                {course.semester} Semester
                              </Badge>
                              {course.lab && (
                                <Badge className="text-xs bg-orange-100 text-orange-800 hover:bg-orange-200 inline-flex items-center gap-1">
                                  <FlaskConical className="w-3 h-3" /> Interactive Lab
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-muted-foreground">{course.year}</span>
                          {course.lab && (
                            <div className="text-xs font-semibold text-orange-600 mt-1 group-hover:underline">Open Lab →</div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
                return course.lab ? (
                  <Link key={index} href={course.lab} aria-label={`Open the ${course.name} interactive laboratory`}>
                    {cardInner}
                  </Link>
                ) : (
                  <div key={index}>{cardInner}</div>
                );
              })}
            </div>
            
            {/* Add-On Courses */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center font-serif">
                <Star className="w-5 h-5 mr-2 text-yellow-500" />
                Add-On Courses (Course Coordinator)
              </h4>
              <div className="grid gap-3">
                {addOnCourses.map((course, index) => (
                  <Card key={index} className="research-card hover:glow-border group border-l-4 border-l-teal-400">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 ${course.color} text-white rounded-lg flex items-center justify-center text-lg group-hover:scale-110 transition-transform duration-300`}>
                            {course.icon}
                          </div>
                          <div>
                            <h5 className="font-semibold text-foreground group-hover:text-primary transition-colors">{course.name}</h5>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs">Code: {course.code}</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <Badge className="bg-teal-100 text-teal-800 text-xs">{course.session}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Teaching Philosophy */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-serif">
                  <Quote className="w-5 h-5 mr-2 text-primary" />
                  Teaching Philosophy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground italic mb-4">
                  "I believe in bridging theoretical concepts with practical applications, inspiring students to see physics as a tool for understanding the universe and solving real-world problems."
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Theory and practical laboratory sessions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>BSc and MSc level instruction</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Research mentorship and guidance</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Administrative Roles & Supervision */}
          <div className="fade-in">
            <h3 className="text-2xl font-semibold text-foreground mb-8 flex items-center font-serif">
              <Settings className="w-6 h-6 mr-3 text-primary" />
              Administrative Roles
            </h3>
            
            <div className="space-y-6 mb-8">
              {administrativeRoles.map((role, index) => (
                <Card key={index} className="research-card hover:glow-border group">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <role.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground text-lg group-hover:text-primary transition-colors">{role.title}</h4>
                        <p className="text-primary font-medium">{role.department}</p>
                        <p className="text-sm text-muted-foreground">{role.institution}</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-3">{role.description}</p>
                    {role.link && (
                      <a
                        href={role.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs text-primary hover:text-primary/80 transition-colors font-medium"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Conference Website
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Research Supervision */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center font-serif">
                  <Users className="w-6 h-6 mr-3 text-primary" />
                  Research Supervision
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {supervisionHighlights.map((highlight, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <GraduationCap className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-muted-foreground text-sm">{highlight}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Teaching Statistics Dashboard */}
            <div className="mt-8">
              <h4 className="text-lg font-semibold text-foreground mb-4 text-center">Teaching Impact</h4>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="text-center research-card glow">
                  <CardContent className="p-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 float">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="text-2xl font-bold stat-number mb-1">8+</div>
                    <div className="text-xs text-muted-foreground">Courses Taught</div>
                  </CardContent>
                </Card>
                <Card className="text-center research-card glow">
                  <CardContent className="p-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 float">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div className="text-2xl font-bold stat-number mb-1">5+</div>
                    <div className="text-xs text-muted-foreground">Years Teaching</div>
                  </CardContent>
                </Card>
                <Card className="text-center research-card glow">
                  <CardContent className="p-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 float">
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="text-2xl font-bold stat-number mb-1">50+</div>
                    <div className="text-xs text-muted-foreground">Students Guided</div>
                  </CardContent>
                </Card>
                <Card className="text-center research-card glow">
                  <CardContent className="p-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 float">
                      <Award className="w-5 h-5" />
                    </div>
                    <div className="text-2xl font-bold stat-number mb-1">2</div>
                    <div className="text-xs text-muted-foreground">Admin Roles</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
        
        {/* Students Achievement Section */}
        <div className="mt-16 fade-in">
          <h3 className="text-2xl font-semibold text-foreground mb-8 text-center font-serif">
            <Trophy className="w-6 h-6 inline mr-3 text-primary" />
            Students Achievement & Moments
          </h3>
          
          {/* Achievement Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="research-card hover:glow-border group">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Award className="w-8 h-8 text-yellow-500 mr-3" />
                  <div>
                    <h4 className="font-semibold text-foreground">Research Excellence</h4>
                    <p className="text-sm text-muted-foreground">Best Master's Thesis Award</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Multiple students received recognition for outstanding research contributions in experimental physics
                </p>
                <Badge className="bg-yellow-100 text-yellow-800 text-xs">Academic Achievement</Badge>
              </CardContent>
            </Card>
            
            <Card className="research-card hover:glow-border group">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Star className="w-8 h-8 text-blue-500 mr-3" />
                  <div>
                    <h4 className="font-semibold text-foreground">Conference Presentations</h4>
                    <p className="text-sm text-muted-foreground">International Physics Conferences</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Students presented research findings at prestigious international physics conferences
                </p>
                <Badge className="bg-blue-100 text-blue-800 text-xs">Research Impact</Badge>
              </CardContent>
            </Card>
            
            <Card className="research-card hover:glow-border group">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <GraduationCap className="w-8 h-8 text-green-500 mr-3" />
                  <div>
                    <h4 className="font-semibold text-foreground">Career Success</h4>
                    <p className="text-sm text-muted-foreground">PhD Admissions & Jobs</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Graduates secured positions in top universities and research institutions worldwide
                </p>
                <Badge className="bg-green-100 text-green-800 text-xs">Career Growth</Badge>
              </CardContent>
            </Card>
          </div>
          
          {/* Photo Gallery Section */}
          <div className="bg-gradient-to-br from-gray-50 to-slate-100 rounded-2xl p-8">
            <h4 className="text-xl font-semibold text-foreground mb-6 text-center flex items-center justify-center">
              <Camera className="w-5 h-5 mr-2 text-primary" />
              Memorable Moments with Students
            </h4>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Photo Placeholder Cards */}
              <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
                <CardContent className="p-0">
                  <div className="aspect-video bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center relative">
                    <Camera className="w-12 h-12 text-blue-500 opacity-50" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-sm font-medium">Graduation Ceremony 2024</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-medium text-foreground">Masters Graduation</p>
                    <p className="text-xs text-muted-foreground">Celebrating student achievements</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
                <CardContent className="p-0">
                  <div className="aspect-video bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center relative">
                    <Camera className="w-12 h-12 text-green-500 opacity-50" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-sm font-medium">Research Lab Sessions</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-medium text-foreground">Laboratory Work</p>
                    <p className="text-xs text-muted-foreground">Hands-on physics experiments</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
                <CardContent className="p-0">
                  <div className="aspect-video bg-gradient-to-br from-purple-100 to-violet-200 flex items-center justify-center relative">
                    <Camera className="w-12 h-12 text-purple-500 opacity-50" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-sm font-medium">Conference Presentations</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-medium text-foreground">Student Conferences</p>
                    <p className="text-xs text-muted-foreground">Research presentations</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
                <CardContent className="p-0">
                  <div className="aspect-video bg-gradient-to-br from-orange-100 to-amber-200 flex items-center justify-center relative">
                    <Camera className="w-12 h-12 text-orange-500 opacity-50" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-sm font-medium">Award Ceremonies</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-medium text-foreground">Recognition Events</p>
                    <p className="text-xs text-muted-foreground">Student achievements</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
                <CardContent className="p-0">
                  <div className="aspect-video bg-gradient-to-br from-red-100 to-rose-200 flex items-center justify-center relative">
                    <Camera className="w-12 h-12 text-red-500 opacity-50" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-sm font-medium">Group Discussions</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-medium text-foreground">Study Groups</p>
                    <p className="text-xs text-muted-foreground">Collaborative learning</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
                <CardContent className="p-0">
                  <div className="aspect-video bg-gradient-to-br from-teal-100 to-cyan-200 flex items-center justify-center relative">
                    <Camera className="w-12 h-12 text-teal-500 opacity-50" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-sm font-medium">Field Visits</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-medium text-foreground">Educational Tours</p>
                    <p className="text-xs text-muted-foreground">Physics facilities visits</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="text-center mt-6">
              <p className="text-sm text-muted-foreground italic">
                "Building the future of physics through dedicated mentorship and inspiring young minds"
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
