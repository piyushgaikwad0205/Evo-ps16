import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../store/useAppStore';
import { isUserAuthenticated } from '../utils/authUtils';
import { Calendar, Users, ArrowRight, MapPin, MessageCircle, CalendarPlus, Code, Palette, Zap, Briefcase, Info, Phone, Mail, Globe } from 'lucide-react';
import Prathinav from '../assets/Prathinav.png';
import Rutu from '../assets/Rutu.png';
import Sagar from '../assets/Sagar.png';
import Aryan from '../assets/Aryan.png';
import Arman from '../assets/Arman.png';
import eventService from '../services/eventService';

const teamMembers = [
  { name: "Prathinav Meshram", role: "Product Manager", image: Prathinav },
  { name: "Ruturaj Nakshane", role: "UX Designer", image: Rutu },
  { name: "Sagar Gajbhar", role: "Lead Developer", image: Sagar },
  { name: "Aryan Dakhre", role: "Community Lead", image: Aryan },
  { name: "Arman Ansari", role: "Marketing Specialist", image: Arman },
];

const footerLinks = {
  platform: [
    { label: "Features", href: "#features" },
    { label: "Clubs", href: "#clubs" },
    { label: "Events", href: "#events" },
    { label: "Student Matchmaking", href: "#features" },
  ],
  company: [
    { label: "About Us", href: "#about" },
    { label: "Our Team", href: "#about" },
    { label: "Careers", href: "#" },
    { label: "Get Started", href: "/signup" },
  ],
  resources: [
    { label: "Help Center", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Blog", href: "#" },
  ],
};

const Intro = () => {
  const signInUrl = "/signin";
  const signUpUrl = "/signup";
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();
  const currentUser = useAppStore((state) => state.currentUser);

  useEffect(() => {
    if (currentUser || isUserAuthenticated()) {
      navigate("/home");
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await eventService.getEvents();
        setEvents(data);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="header">
        <div className="container header-grid">
          <div className="brand">
            <div className="logo">Campus<span className="accent">Connect</span></div>
            <div className="tagline">Connect • Collaborate • Grow</div>
          </div>

          <nav className="nav">
            <a href="#features">Features</a>
            <a href="#clubs">Clubs</a>
            <a href="#events">Events</a>
            <a href="#roles">Interests</a>
            <a href="#about">About Us</a>
            <a href="#footer">Contact</a>
          </nav>

          <div className="header-actions-group">
            <a href={signInUrl} className="btn-secondary small-btn">Sign In</a>
            <a href={signUpUrl} className="btn-primary small-btn">Sign Up</a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-left">
            <div className="hero-badge">NEW • STUDENT NETWORK</div>
            <h1 className="hero-title">
              Connecting students, clubs, and colleges —<br />where opportunity meets community
            </h1>
            <p className="hero-sub">
              Discover campus events, find teammates for projects, message peers, and explore colleges — all in one student-first platform.
            </p>

            <div className="hero-actions">
              <a href="#features" className="btn-primary">Explore Features</a>
              <a href={signUpUrl} className="btn-secondary">Create Account <ArrowRight size={18} /></a>
            </div>

            <div className="quick-stats">
              <div className="stat">
                <div className="stat-num">120+</div>
                <div className="stat-label">Colleges</div>
              </div>
              <div className="stat">
                <div className="stat-num">7k+</div>
                <div className="stat-label">Students</div>
              </div>
              <div className="stat">
                <div className="stat-num">300+</div>
                <div className="stat-label">Clubs & Events</div>
              </div>
            </div>
          </div>

          <div className="hero-right">
            <div className="hero-card">
              <img
                src="https://image.pollinations.ai/prompt/illustration%20of%20diverse%20students%20collaborating%20on%20a%20modern%20campus%20digital%20art%20vibrant"
                alt="Campus illustration"
                className="hero-illustration"
              />
              <div className="floating-card">
                <div className="fc-row">
                  <Users size={18} />
                  <div>
                    <div className="fc-title">Find teammates</div>
                    <div className="fc-sub">Match by skills & interests</div>
                  </div>
                </div>
                <div className="fc-row">
                  <CalendarPlus size={18} />
                  <div>
                    <div className="fc-title">Upcoming events</div>
                    <div className="fc-sub">Workshops & campus fairs</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="features">
        <div className="container">
          <h2 className="section-title center">Platform Features</h2>
          <p className="section-sub center">Everything students need to connect, learn, and launch projects together.</p>

          <div className="features-grid">
            <div className="feature-card fun">
              <div className="icon-wrap"><MessageCircle size={22} /></div>
              <h3>Real-time Chat</h3>
              <p>One-to-one & group chats, media sharing, read receipts, and safe reporting tools.</p>
            </div>

            <div className="feature-card fun">
              <div className="icon-wrap"><Users size={22} /></div>
              <h3>Student Profiles & Matchmaking</h3>
              <p>Profiles with skills, projects and interests — find teammates or mentors fast.</p>
            </div>

            <div className="feature-card fun">
              <div className="icon-wrap"><Calendar size={22} /></div>
              <h3>Events & Workshops</h3>
              <p>Discover and register for campus events, hackathons, talks and fairs.</p>
            </div>

            <div className="feature-card fun">
              <div className="icon-wrap"><MapPin size={22} /></div>
              <h3>College & Dept Pages</h3>
              <p>Browse colleges, departments, and official announcements — centralized and verified.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Clubs */}
      <section id="clubs" className="clubs">
        <div className="container">
          <h2 className="section-title">Clubs & Communities</h2>
          <p className="section-sub">Join active clubs or create your own — manage members, post announcements, and host events.</p>

          <div className="clubs-grid">
            <div className="club-card">
              <img src="https://image.pollinations.ai/prompt/illustration%20of%20robotics%20club%20students%20building%20robot%20futuristic%20art" alt="Club" />
              <div className="club-body">
                <h4>Robotics Club</h4>
                <p>Build robots, compete in challenges, and get mentored by alumni.</p>
              </div>
            </div>

            <div className="club-card">
              <img src="https://image.pollinations.ai/prompt/illustration%20of%20design%20and%20ux%20students%20collaborating%20on%20ui%20ux%20project%20colorful%20art" alt="Club" />
              <div className="club-body">
                <h4>Design & UX</h4>
                <p>Workshops, portfolio reviews, and collaborative design sprints.</p>
              </div>
            </div>

            <div className="club-card">
              <img src="https://image.pollinations.ai/prompt/illustration%20of%20startup%20society%20students%20pitching%20ideas%20innovative%20entrepreneurship%20art" alt="Club" />
              <div className="club-body">
                <h4>Startup Society</h4>
                <p>Pitch nights, mentor office hours, and startup-building cohorts.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Events */}
      <section id="events" className="events">
        <div className="container">
          <h2 className="section-title center">Featured Events</h2>

          <div className="events-grid">
            {events.length > 0 ? (
              events.slice(0, 3).map((event) => (
                <div key={event._id} className="event-card">
                  <img src={event.bannerUrl || "https://via.placeholder.com/300x200"} alt={event.title} />
                  <div className="event-body">
                    <h4>{event.title}</h4>
                    <p className="event-meta"><Calendar size={14} /> {new Date(event.eventDate).toLocaleDateString()} • {event.location}</p>
                    <p className="text-sm text-gray-500 mb-2 line-clamp-2">{event.description}</p>
                    <a href="/signin" className="event-cta">Register <ArrowRight size={14} /></a>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 col-span-full">No upcoming events at the moment.</p>
            )}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section id="roles" className="roles-section">
        <div className="container">
          <h2 className="section-title center">Connect by Interest</h2>
          <p className="section-sub center">Find communities based on your role, skills, and career path.</p>
          <div className="roles-grid">
            <div className="role-card">
              <div className="icon-wrap"><Code size={24} /></div>
              <h3>Developers</h3>
              <p>Find teammates for hackathons, share code, and discuss new frameworks.</p>
            </div>
            <div className="role-card">
              <div className="icon-wrap"><Palette size={24} /></div>
              <h3>Designers</h3>
              <p>Get portfolio critiques, collaborate on UI/UX, and explore design principles.</p>
            </div>
            <div className="role-card">
              <div className="icon-wrap"><Zap size={24} /></div>
              <h3>Entrepreneurs</h3>
              <p>Pitch startup ideas, meet co-founders, and get feedback from mentors.</p>
            </div>
            <div className="role-card">
              <div className="icon-wrap"><Briefcase size={24} /></div>
              <h3>Marketers</h3>
              <p>Learn growth hacking, discuss campaigns, and build marketing strategies.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="about-section">
        <div className="container">
          <div className="about-header">
            <div className="icon-wrap large"><Info size={36} /></div>
            <h2 className="section-title center">The Team Behind Campus Connect</h2>
            <p className="section-sub center narrow">Campus Connect was founded by a dedicated team of students and educators committed to building the best platform for campus collaboration.</p>
          </div>

          <div className="team-grid">
            {teamMembers.map((member) => (
              <div key={member.name} className="team-card">
                <div className="team-image-wrap">
                  <img src={member.image} alt={member.name} className="team-image" />
                </div>
                <h4>{member.name}</h4>
                <p className="team-role">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer id="footer" className="main-footer">
        <div className="container footer-grid">
          <div className="footer-col brand-col">
            <div className="logo large">Campus<span className="accent">Connect</span></div>
            <p className="tagline">Connect • Collaborate • Grow</p>
            <p className="copy-note">© {new Date().getFullYear()} Campus Connect. All rights reserved.</p>
          </div>

          <div className="footer-col links-col">
            <h4>Platform</h4>
            <ul className="footer-links">
              {footerLinks.platform.map(link => (
                <li key={link.label}><a href={link.href}>{link.label}</a></li>
              ))}
            </ul>
          </div>

          <div className="footer-col links-col">
            <h4>Company</h4>
            <ul className="footer-links">
              {footerLinks.company.map(link => (
                <li key={link.label}><a href={link.href}>{link.label}</a></li>
              ))}
            </ul>
          </div>

          <div className="footer-col contact-col">
            <h4>Get in Touch</h4>
            <div className="contact-info">
              <div className="info-row"><MapPin size={18} /><p>Khandala, Valni, Kalmeshwar Road, Nagpur - 441501</p></div>
              <div className="info-row"><Phone size={18} /><p>+91 9226144288</p></div>
              <div className="info-row"><Mail size={18} /><p>info@campusconnect.in</p></div>
              <div className="info-row"><Globe size={18} /><p>gajbharsn@jdcoem.ac.in (Personal Mail)</p></div>
            </div>
          </div>

          <div className="footer-col map-col">
            <h4>Our Location (JD College Nagpur)</h4>
            <div className="map-embed-wrap">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d11414.284011588526!2d78.97958962072299!3d21.23702868298593!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bd4c0e17bfced61%3A0x9ae844b1b1bf3e59!2sJ%20D%20College%20Of%20Engineering%20%26%20Management!5e0!3m2!1sen!2sin!4v1763534799947!5m2!1sen!2sin"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="JD College Nagpur Map Location"
              ></iframe>
            </div>
          </div>
        </div>
      </footer>

      {/* Styles */}
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: #f4f6fb;
          --card: #ffffff;
          --accent: #6c5ce7;
          --accent-2: #7c6ef6;
          --muted: #5b6170;
          --text-dark: #081025;
        }
        body { font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; background: var(--bg); color: var(--text-dark); }

        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }

        /* Header */
        .header { background: var(--card); padding: 18px 0; box-shadow: 0 6px 20px rgba(15,23,42,0.06); position: sticky; top: 0; z-index: 40; }
        .header-grid { display: flex; align-items: center; gap: 20px; justify-content: space-between; }
        .brand .logo { font-weight: 800; font-size: 20px; color: #0f172a; }
        .brand .accent { color: var(--accent); margin-left: 4px; }
        .brand .tagline { font-size: 12px; color: var(--muted); margin-top: 4px; }

        .nav { display: flex; gap: 22px; align-items: center; }
        .nav a { text-decoration: none; color: var(--muted); font-weight: 600; font-size: 14px; transition: color 0.2s ease; }
        .nav a:hover { color: var(--accent); }

        /* CSS for header button group */
        .header-actions-group {
            display: flex;
            gap: 10px; /* Space between Sign In and Sign Up buttons */
            align-items: center;
        }
        .btn-secondary.small-btn {
            padding: 8px 16px;
            font-size: 14px;
            border-radius: 10px;
            border: 2px solid var(--accent); 
            background: transparent;
            color: var(--accent);
            text-decoration: none;
            font-weight: 700;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        }
        .btn-secondary.small-btn:hover {
            background: rgba(108,92,231,0.1);
        }
        /* End header button CSS */

        .btn-primary.small-btn { padding: 8px 16px; font-size: 14px; border-radius: 10px; }


        /* Hero */
        .hero { padding: 60px 0 40px; }
        .hero-grid { display: grid; grid-template-columns: 1fr 420px; gap: 28px; align-items: center; }
        .hero-left { padding-right: 8px; }
        .hero-badge { display: inline-block; background: rgba(124,110,246,0.12); color: var(--accent); padding: 8px 14px; border-radius: 999px; font-weight: 700; font-size: 12px; margin-bottom: 14px; }
        .hero-title { font-size: 40px; line-height: 1.05; color: var(--text-dark); margin-bottom: 16px; font-weight: 800; }
        .hero-sub { color: var(--muted); font-size: 16px; margin-bottom: 20px; }

        .hero-actions { display:flex; gap: 12px; margin-bottom: 18px; align-items:center; }
        .btn-primary { background: linear-gradient(90deg, var(--accent), var(--accent-2)); color: white; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 700; box-shadow: 0 8px 24px rgba(108,92,231,0.18); transition: transform 0.2s ease; display: inline-flex; align-items: center; justify-content: center;}
        .btn-primary:hover { transform: translateY(-2px); }

        /* Unique Start button style and animation */
        .btn-secondary {
          background: var(--card);
          border: 2px solid var(--accent);
          color: var(--accent);
          padding: 10px 18px;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: background 0.3s ease, color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
        }
        .btn-secondary:hover {
          background: var(--accent);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(108,92,231,0.25);
        }
        .btn-secondary svg { transition: transform 0.2s ease; }
        .btn-secondary:hover svg { transform: translateX(4px); }


        .quick-stats { display:flex; gap: 26px; margin-top: 14px; }
        .stat { display:flex; flex-direction:column; gap:6px; }
        .stat-num { font-weight: 800; font-size: 18px; color: var(--text-dark); }
        .stat-label { font-size: 13px; color: var(--muted); font-weight: 600; }

        .hero-right .hero-card { background: linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.85)); border-radius: 18px; padding: 18px; position: relative; box-shadow: 0 12px 40px rgba(15,23,42,0.08); overflow: visible; }
        .hero-illustration { width: 100%; height: 320px; object-fit: cover; border-radius: 12px; display:block; }

        .floating-card { position: absolute; left: 18px; bottom: -22px; right: 18px; background: white; border-radius: 12px; padding: 12px 14px; display:flex; gap:12px; justify-content: space-between; box-shadow: 0 8px 30px rgba(15,23,42,0.06); }
        .fc-row { display:flex; gap:10px; align-items:center; }
        .fc-title { font-weight: 700; font-size: 14px; }
        .fc-sub { font-size: 12px; color: var(--muted); }

        /* Features */
        .features { padding: 40px 0; }
        .section-title { font-size: 26px; font-weight: 800; color: var(--text-dark); margin-bottom: 8px; }
        .section-sub { color: var(--muted); margin-bottom: 18px; }
        .section-sub.narrow { max-width: 700px; margin-left: auto; margin-right: auto; }
        .center { text-align: center; }
        .features-grid { display:grid; grid-template-columns: repeat(4,1fr); gap: 18px; margin-top: 20px; }

        .feature-card { background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,255,255,0.95)); border-radius: 14px; padding: 22px; text-align: left; box-shadow: 0 8px 30px rgba(15,23,42,0.04); transition: transform .18s ease; }
        .feature-card:hover { transform: translateY(-6px); }
        .icon-wrap { width:44px; height:44px; border-radius:10px; background: linear-gradient(90deg, rgba(108,92,231,0.12), rgba(124,110,246,0.08)); display:flex; align-items:center; justify-content:center; margin-bottom: 12px; color: var(--accent); }
        .icon-wrap.large { width: 60px; height: 60px; border-radius: 14px; margin-bottom: 16px; } /* For About section icon */
        .feature-card h3 { font-size: 16px; margin-bottom: 8px; font-weight: 700; }
        .feature-card p { color: var(--muted); font-size: 14px; line-height: 1.55; }

        /* Clubs */
        .clubs { padding: 40px 0; }
        .clubs-grid { display:flex; gap:18px; margin-top:18px; }
        .club-card { background: white; border-radius: 12px; overflow: hidden; flex:1; display:flex; gap:12px; box-shadow: 0 8px 30px rgba(15,23,42,0.04); }
        .club-card img { width: 160px; object-fit: cover; }
        .club-body { padding: 16px; display:flex; flex-direction:column; justify-content:center; }
        .club-body h4 { font-size: 16px; font-weight: 800; }
        .club-body p { color: var(--muted); font-size: 14px; margin-top:6px; }

        /* Events */
        .events { padding: 40px 0; }
        .events-grid { display:flex; gap:18px; margin-top:18px; }
        .event-card { background: white; border-radius: 12px; overflow: hidden; display:flex; gap:12px; flex:1; box-shadow: 0 8px 30px rgba(15,23,42,0.04); align-items: center; }
        .event-card img { width: 160px; height: 120px; object-fit: cover; }
        .event-body { padding: 14px; }
        .event-meta { color: var(--muted); display:flex; gap:8px; align-items:center; font-size:13px; margin:8px 0; }
        .event-cta { color: var(--accent); text-decoration: none; font-weight: 700; display:inline-flex; gap:8px; align-items:center; transition: color 0.2s ease; }
        .event-cta:hover { color: var(--accent-2); }
        .event-cta svg { transition: transform 0.2s ease; }
        .event-cta:hover svg { transform: translateX(4px); }


        /* Roles (Connect by Interest) */
        .roles-section { padding: 40px 0; }
        .roles-grid { display:grid; grid-template-columns: repeat(4,1fr); gap: 18px; margin-top: 20px; }
        .role-card {
          background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,255,255,0.95));
          border-radius: 14px;
          padding: 22px;
          text-align: center;
          box-shadow: 0 8px 30px rgba(15,23,42,0.04);
          transition: transform .18s ease;
        }
        .role-card:hover { transform: translateY(-6px); }
        .role-card h3 { font-size: 18px; margin-bottom: 8px; font-weight: 800; }
        .role-card p { color: var(--muted); font-size: 14px; line-height: 1.55; }
        .roles-section .icon-wrap {
          margin: 0 auto 12px;
          background: linear-gradient(90deg, rgba(108,92,231,0.12), rgba(124,110,246,0.08));
        }

        /* About Us Section (Team Cards) */
        .about-section { padding: 60px 0; background: var(--card); border-top: 1px solid rgba(15,23,42,0.02); box-shadow: 0 -6px 20px rgba(15,23,42,0.03); }
        .about-header { text-align: center; margin-bottom: 40px; display: flex; flex-direction: column; align-items: center; }

        .team-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr); /* MODIFIED: to handle 5 members */
            gap: 24px;
        }
        .team-card {
            background: var(--bg);
            border-radius: 12px;
            padding: 16px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(15,23,42,0.05);
            transition: transform 0.3s ease;
        }
        .team-card:hover { transform: scale(1.05); box-shadow: 0 8px 25px rgba(15,23,42,0.1); }
        .team-image-wrap {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            overflow: hidden;
            margin: 0 auto 12px;
            border: 4px solid var(--accent);
        }
        .team-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .team-card h4 { font-size: 16px; margin-bottom: 4px; }
        .team-role { font-size: 13px; color: var(--muted); font-weight: 600; }
        
        /* Footer (New Section) */
        .main-footer {
            background: var(--text-dark);
            color: white;
            padding: 40px 0 20px;
        }
        .footer-grid {
            display: grid;
            grid-template-columns: 1.5fr repeat(3, 1fr) 2fr;
            gap: 30px;
            padding-bottom: 30px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .footer-col h4 {
            font-size: 16px;
            font-weight: 800;
            margin-bottom: 15px;
            color: var(--accent-2);
        }
        .footer-col.brand-col .logo {
            font-size: 24px;
            font-weight: 900;
            color: white;
            margin-bottom: 4px;
        }
        .footer-col.brand-col .tagline {
            color: rgba(255,255,255,0.7);
            font-size: 14px;
            margin-bottom: 15px;
        }
        .footer-col.brand-col .copy-note {
            font-size: 12px;
            color: rgba(255,255,255,0.5);
        }
        
        /* Links */
        .footer-links {
            list-style: none;
            padding: 0;
        }
        .footer-links li { margin-bottom: 8px; }
        .footer-links a {
            color: rgba(255,255,255,0.8);
            text-decoration: none;
            font-size: 14px;
            transition: color 0.2s ease;
        }
        .footer-links a:hover { color: var(--accent); }

        /* Contact */
        .contact-info .info-row {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            margin-bottom: 10px;
        }
        .contact-info .info-row p {
            font-size: 14px;
            color: rgba(255,255,255,0.8);
            line-height: 1.4;
        }
        .contact-info .info-row svg { color: var(--accent); flex-shrink: 0; margin-top: 2px; }

        /* Map */
        .map-embed-wrap {
            height: 180px;
            border-radius: 8px;
            overflow: hidden;
            border: 2px solid var(--accent);
        }
        .map-embed-wrap iframe {
            width: 100%;
            height: 100%;
            border: none;
            display: block;
        }
        
        /* Responsive Footer */
        @media (max-width: 1024px) {
            .footer-grid {
                grid-template-columns: 1fr 1fr;
            }
            .footer-col.map-col {
                grid-column: 1 / -1; /* Full width for map */
            }
        }
        @media (max-width: 640px) {
            .footer-grid {
                grid-template-columns: 1fr;
            }
        }

        /* General Responsive */
        @media (max-width: 1200px) and (min-width: 1025px) {
            .team-grid { grid-template-columns: repeat(5, 1fr); } /* Keep 5 columns for larger screens */
        }

        @media (max-width: 1024px) {
          .hero-grid { grid-template-columns: 1fr 360px; }
          .features-grid { grid-template-columns: repeat(2, 1fr); }
          .clubs-grid, .events-grid { flex-direction: column; }
          .roles-grid { grid-template-columns: repeat(2, 1fr); }
          .team-grid { grid-template-columns: repeat(2, 1fr); } /* MODIFIED: change to 2 columns for better layout of 5 members */
          .nav { display: none; }
          .header-actions-group { margin-left: auto; }
        }

        @media (max-width: 640px) {
          .header-grid { flex-direction: column; align-items:flex-start; gap:10px; }
          .header-actions-group { margin-top: 5px; } /* Adjust spacing for mobile */
          .hero-title { font-size: 28px; }
          .hero-grid { grid-template-columns: 1fr; }
          .hero-right { order: -1; }
          .features-grid { grid-template-columns: 1fr; }
          .roles-grid { grid-template-columns: 1fr; }
          .team-grid { grid-template-columns: 1fr; } /* MODIFIED: change to 1 column for mobile */
          .stat { flex-direction: row; gap:10px; align-items:center; }
          .team-image-wrap { margin-bottom: 8px; }
        }
      `}</style>
    </div>
  );
};

export default Intro;