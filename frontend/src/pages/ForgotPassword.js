import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft, Send } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authAPI.forgotPassword({ email });
      setSubmitted(true);
      toast.success('Password reset link sent to your email');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send reset link. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
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
              <div className="card text-center">
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  margin: '0 auto 1.5rem',
                  background: 'var(--gradient-success)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Send size={40} />
                </div>
                
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: '700' }}>
                  Check Your Email
                </h2>
                
                <p style={{ color: 'var(--gray-light)', marginBottom: '1.5rem' }}>
                  If an account exists with <strong>{email}</strong>, you will receive a password reset link shortly.
                </p>
                
                <p style={{ color: 'var(--gray)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                  The link will expire in 1 hour.
                </p>

                <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
                  <ArrowLeft size={18} />
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            </div>

            <div className="card">
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: '700' }}>
                Forgot Password?
              </h2>
              
              <p style={{ color: 'var(--gray-light)', marginBottom: '1.5rem' }}>
                No worries! Enter your email and we'll send you a reset link.
              </p>

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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                  <Send size={18} />
                </button>
              </form>

              <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <Link 
                  to="/login" 
                  style={{ 
                    color: 'var(--gray-light)', 
                    fontSize: '0.875rem',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.25rem'
                  }}
                >
                  <ArrowLeft size={16} />
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;