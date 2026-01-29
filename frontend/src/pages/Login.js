import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Mail, Lock, ArrowRight } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="container">
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '2rem 0'
        }}>
          <div style={{ width: '100%', maxWidth: '450px' }}>
            <div className="text-center mb-4">
              <h1 className="logo" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
                SubScout
              </h1>
              <p style={{ color: 'var(--gray-light)', fontSize: '1.125rem' }}>
                Track all your subscriptions in one place
              </p>
            </div>

            <div className="card">
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: '700' }}>
                Welcome Back
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">
                    <Mail size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Lock size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
                  <Link 
                    to="/forgot-password" 
                    style={{ 
                      color: 'var(--primary)', 
                      fontSize: '0.875rem',
                      textDecoration: 'none'
                    }}
                  >
                    Forgot password?
                  </Link>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                  <ArrowRight size={18} />
                </button>
              </form>

              <div style={{ 
                marginTop: '1.5rem', 
                textAlign: 'center',
                paddingTop: '1.5rem',
                borderTop: '1px solid rgba(99, 102, 241, 0.1)'
              }}>
                <p style={{ color: 'var(--gray-light)' }}>
                  Don't have an account?{' '}
                  <Link 
                    to="/signup" 
                    style={{ 
                      color: 'var(--primary)', 
                      fontWeight: '600',
                      textDecoration: 'none'
                    }}
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;