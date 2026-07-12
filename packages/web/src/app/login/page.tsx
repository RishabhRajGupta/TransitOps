"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation, ArrowRight, Lock, Mail, Key, Users } from "lucide-react";
import { api } from "../../lib/api";
import { useAuthStore } from "../../stores/auth-store";
import "./login.css";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [email, setEmail] = useState("manager@transitops.com");
  const [password, setPassword] = useState("password123");
  const [role, setRole] = useState("Fleet Manager");
  const [mfaStep, setMfaStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-fill email based on role selection
  const handleRoleChange = (selectedRole: string) => {
    setRole(selectedRole);
    switch (selectedRole) {
      case "Fleet Manager":
        setEmail("manager@transitops.com");
        break;
      case "Driver":
        setEmail("driver@transitops.com");
        break;
      case "Safety Officer":
        setEmail("safety@transitops.com");
        break;
      case "Financial Analyst":
        setEmail("analyst@transitops.com");
        break;
    }
  };

  // Mouse hover coordinate tracking
  const mouse = useRef<{ x: number | null; y: number | null; radius: number }>({ x: null, y: null, radius: 180 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    let animationFrameId: number;
    let particles: Particle[] = [];

    const handleResize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      initParticles();
    };

    // Particle Class representing fleet nodes
    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      baseColor: string;
      
      constructor(w: number, h: number) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
        this.radius = Math.random() * 2.5 + 1;
        this.baseColor = "rgba(234, 88, 12, " + (Math.random() * 0.4 + 0.2) + ")"; // Transit warm amber
      }

      update(w: number, h: number) {
        // Bounce off borders
        if (this.x < 0 || this.x > w) this.vx = -this.vx;
        if (this.y < 0 || this.y > h) this.vy = -this.vy;

        // Gravity pull to mouse
        if (mouse.current.x !== null && mouse.current.y !== null) {
          const dx = mouse.current.x - this.x;
          const dy = mouse.current.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < mouse.current.radius) {
            const force = (mouse.current.radius - distance) / mouse.current.radius;
            this.vx += (dx / distance) * force * 0.05;
            this.vy += (dy / distance) * force * 0.05;

            // Speed clamping
            const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            if (speed > 1.5) {
              this.vx = (this.vx / speed) * 1.5;
              this.vy = (this.vy / speed) * 1.5;
            }
          }
        }

        // Apply drag friction
        this.vx *= 0.98;
        this.vy *= 0.98;

        this.x += this.vx;
        this.y += this.vy;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.baseColor;
        ctx.fill();
      }
    }

    const initParticles = () => {
      particles = [];
      const density = Math.floor((canvas.width * canvas.height) / 8000);
      const count = Math.min(density, 120);
      for (let i = 0; i < count; i++) {
        particles.push(new Particle(canvas.width, canvas.height));
      }
    };

    const drawLines = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            const alpha = ((120 - distance) / 120) * 0.15;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(226, 92, 5, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        // Mouse gravity connections
        if (mouse.current.x !== null && mouse.current.y !== null) {
          const dx = particles[i].x - mouse.current.x;
          const dy = particles[i].y - mouse.current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < mouse.current.radius) {
            const alpha = ((mouse.current.radius - distance) / mouse.current.radius) * 0.25;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mouse.current.x, mouse.current.y);
            ctx.strokeStyle = `rgba(249, 115, 22, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Grid lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Pulse glow under cursor
      if (mouse.current.x !== null && mouse.current.y !== null) {
        const gradient = ctx.createRadialGradient(
          mouse.current.x, mouse.current.y, 10,
          mouse.current.x, mouse.current.y, mouse.current.radius
        );
        gradient.addColorStop(0, "rgba(234, 88, 12, 0.08)");
        gradient.addColorStop(1, "rgba(234, 88, 12, 0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(mouse.current.x, mouse.current.y, mouse.current.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      particles.forEach((p) => {
        p.update(canvas.width, canvas.height);
        p.draw();
      });

      drawLines();
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current.x = e.clientX - rect.left;
      mouse.current.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.current.x = null;
      mouse.current.y = null;
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseleave", handleMouseLeave);
    }
    window.addEventListener("resize", handleResize);

    handleResize();
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseleave", handleMouseLeave);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter valid email and password.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      // First, we call our real API. If it succeeds, we proceed to MFA simulation.
      const response = await api.post("/auth/login", { email, password });
      
      // Store the real token temporarily so we can apply it after MFA
      // In a real MFA setup, the server would return an MFA token.
      (window as any)._tempAuth = response.data.data;
      
      setMfaStep(true);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6 || isNaN(Number(otp))) {
      setError("Enter the 6-digit dynamic OTP verification code.");
      return;
    }
    setError("");
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      
      // Retrieve the real auth payload
      const authData = (window as any)._tempAuth;
      if (authData) {
        setAuth(authData.accessToken, authData.user);
        
        // Route based on role
        switch (authData.user.role) {
          case "fleet_manager":
            router.push("/fleet-manager");
            break;
          case "driver":
            router.push("/driver");
            break;
          case "safety_officer":
            router.push("/safety-officer");
            break;
          case "financial_analyst":
            router.push("/financial-analyst");
            break;
          default:
            router.push("/");
        }
      } else {
        setError("Session expired. Please sign in again.");
        setMfaStep(false);
      }
    }, 800); // simulate a slight delay for MFA
  };

  return (
    <div className="login-page">
      {/* Left Panel: Canvas with Floating Fleet Nodes */}
      <div className="login-left" ref={containerRef}>
        <canvas ref={canvasRef} className="login-canvas" />
        <div className="login-left-content">
          <div className="login-logo-container">
            <Navigation className="login-logo-icon" size={32} />
            <span className="login-logo-text">TRANSITOPS</span>
          </div>

          <div className="login-marketing-wrapper">
            <h1 className="login-marketing-title">Smart Transport Operations</h1>
            <p className="login-marketing-desc">
              End-to-end transport operations console digitizing vehicles, drivers, dispatches, maintenance schedules, and fuel logs.
            </p>

            <ul className="login-features-list">
              <li>
                <div className="feature-bullet"></div>
                <div>
                  <strong>Asset Registry:</strong> Maintain load capacity profiles, maintenance schedules, and odometers.
                </div>
              </li>
              <li>
                <div className="feature-bullet"></div>
                <div>
                  <strong>Compliance Guard:</strong> Verify driver license categories, expiration logs, and safety metrics.
                </div>
              </li>
              <li>
                <div className="feature-bullet"></div>
                <div>
                  <strong>Trip Dispatch:</strong> Dispatch drivers and vehicles with weight limit checks and lifecycle controls.
                </div>
              </li>
            </ul>
          </div>

          <div className="login-left-footer">
            <span>© {new Date().getFullYear()} TransitOps Platform. All rights reserved.</span>
          </div>
        </div>
      </div>

      {/* Right Panel: Login form */}
      <div className="login-right">
        <div className="login-right-content">
          {!mfaStep ? (
            <div className="login-form-container">
              <div className="login-header">
                <h2>Operational Portal</h2>
                <p>Provide registry email and authentication role to access dashboard.</p>
              </div>

              {error && <div className="login-error-alert">{error}</div>}

              <form onSubmit={handleLoginSubmit} className="login-form">
                <div className="login-field-group">
                  <label htmlFor="role-select">Console Security Persona</label>
                  <div className="login-input-wrapper">
                    <Users className="login-input-icon" size={18} style={{ left: 14, zIndex: 5 }} />
                    <select
                      id="role-select"
                      value={role}
                      onChange={(e) => handleRoleChange(e.target.value)}
                      style={{ paddingLeft: 44 }}
                    >
                      <option value="Fleet Manager">Fleet Manager (Assets & Lifecycle)</option>
                      <option value="Driver">Driver / Operator (Trips & Dispatch)</option>
                      <option value="Safety Officer">Safety Officer (License Validity & Compliance)</option>
                      <option value="Financial Analyst">Financial Analyst (Expenses & ROI)</option>
                    </select>
                  </div>
                </div>

                <div className="login-field-group">
                  <label htmlFor="email">Operator Email Address</label>
                  <div className="login-input-wrapper">
                    <Mail className="login-input-icon" size={18} />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. manager@transitops.com"
                      required
                    />
                  </div>
                </div>

                <div className="login-field-group">
                  <label htmlFor="password">Security Password</label>
                  <div className="login-input-wrapper">
                    <Lock className="login-input-icon" size={18} />
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <div className="login-form-options">
                  <label className="login-checkbox-label">
                    <input type="checkbox" defaultChecked />
                    <span>Trust workstation for 24 hours</span>
                  </label>
                  <a href="#reset" className="login-forgot-link">Help?</a>
                </div>

                <button type="submit" className="btn btn-primary login-submit-btn" disabled={loading}>
                  {loading ? "Validating credentials..." : "Enter Operator Session"}
                  {!loading && <ArrowRight size={18} />}
                </button>
              </form>
            </div>
          ) : (
            <div className="login-form-container mfa-step-container">
              <div className="login-header">
                <h2>Dynamic MFA Verification</h2>
                <p>A secure temporary OTP verification code has been dispatched to your device. Please enter the code.</p>
              </div>

              {error && <div className="login-error-alert">{error}</div>}

              <form onSubmit={handleMfaSubmit} className="login-form">
                <div className="login-field-group">
                  <label htmlFor="otp">Verification OTP (6 Digits)</label>
                  <div className="login-input-wrapper">
                    <Key className="login-input-icon" size={18} />
                    <input
                      id="otp"
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="e.g. 123456"
                      autoFocus
                      required
                    />
                  </div>
                  <small className="login-field-helper">Enter any 6 digits to bypass simulation.</small>
                </div>

                <button type="submit" className="btn btn-primary login-submit-btn" disabled={loading}>
                  {loading ? "Verifying..." : "Submit Verification Code"}
                  {!loading && <ArrowRight size={18} />}
                </button>
              </form>

              <div className="login-back-to-sign-in">
                <a href="#back" onClick={() => setMfaStep(false)}>Change Operator Details</a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
