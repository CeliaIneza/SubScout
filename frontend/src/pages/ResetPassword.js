import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Lock, CheckCircle2, ArrowRight } from 'lucide-react';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!token) {
      toast.error('Invalid reset link');
      return;
    }

    setLoading(true);

    try {
      await authAPI.resetPassword({ 
        token, 
        newPassword: formData.newPassword 
      });
      setSuccess(true);
      toast.success('Password reset successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      const message = error.response?.data?.message || 
                     error.response?.data?.errors?.[0]?.message ||
                     'Failed to reset password. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
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
                  <CheckCircle2 size={40} />
                </div>
                
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: '700' }}>
                  Password Reset Successful!
                </h2>
                
                <p style={{ color: 'var(--gray-light)', marginBottom: '1.5rem' }}>
                  Your password has been reset successfully. You can now login with your new password.
                </p>

                <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
                  Go to Login
                  <ArrowRight size={18} />
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
                Reset Password
              </h2>
              
              <p style={{ color: 'var(--gray-light)', marginBottom: '1.5rem' }}>
                Enter your new password below.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">
                    <Lock size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    className="form-input"
                    placeholder="••••••••"
                    value={formData.newPassword}
                    onChange={handleChange}
                    required
                  />
                  <p style={{ fontSize: '0.75rem', color: 'var(--gray)', marginTop: '0.25rem' }}>
                    At least 8 characters with uppercase, lowercase, and number
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    className="form-input"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                  {loading ? 'Resetting...' : 'Reset Password'}
                  <ArrowRight size={18} />
                </button>
              </form>

              <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <Link 
                  to="/login" 
                  style={{ 
                    color: 'var(--gray-light)', 
                    fontSize: '0.875rem',
                    textDecoration: 'none'
                  }}
                >
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

export default ResetPassword;