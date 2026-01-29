import React, { useState, useEffect } from 'react';
import { subscriptionAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Package,
  PieChart,
  AlertCircle 
} from 'lucide-react';
import { format } from 'date-fns';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await subscriptionAPI.getDashboard();
      setDashboardData(response.data.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem 0' }}>
        <div className="loading">
          <h2>Loading dashboard...</h2>
        </div>
      </div>
    );
  }

  const {
    totalMonthly = 0,
    totalYearly = 0,
    totalSubscriptions = 0,
    categoryBreakdown = [],
    upcomingRenewals = [],
    currencyBreakdown = {}
  } = dashboardData || {};

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <div className="flex-between mb-4">
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>
            Dashboard
          </h1>
          <p style={{ color: 'var(--gray-light)', fontSize: '1.125rem' }}>
            Overview of your subscription spending
          </p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/subscriptions')}
        >
          View All Subscriptions
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-3 mb-4">
        <div className="stat-card">
          <div className="stat-label">
            <DollarSign size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
            Monthly Spend
          </div>
          <div className="stat-value mono">
            ${totalMonthly.toFixed(2)}
          </div>
          <div className="stat-change">
            <TrendingUp size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
            Active subscriptions
          </div>
        </div>

        <div className="stat-card" style={{ background: 'var(--gradient-secondary)' }}>
          <div className="stat-label">
            <Calendar size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
            Yearly Spend
          </div>
          <div className="stat-value mono">
            ${totalYearly.toFixed(2)}
          </div>
          <div className="stat-change">
            Projected annual cost
          </div>
        </div>

        <div className="stat-card" style={{ background: 'var(--gradient-success)' }}>
          <div className="stat-label">
            <Package size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
            Total Subscriptions
          </div>
          <div className="stat-value mono">
            {totalSubscriptions}
          </div>
          <div className="stat-change">
            Active services
          </div>
        </div>
      </div>

      <div className="grid grid-2 mb-4">
        {/* Category Breakdown */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <PieChart size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Spending by Category
            </h3>
          </div>
          {categoryBreakdown.length > 0 ? (
            <div>
              {categoryBreakdown.map((cat, index) => {
                const percentage = totalMonthly > 0 
                  ? (cat.monthlyCost / totalMonthly * 100).toFixed(1) 
                  : 0;
                
                return (
                  <div 
                    key={index} 
                    style={{ 
                      marginBottom: '1rem',
                      paddingBottom: '1rem',
                      borderBottom: index < categoryBreakdown.length - 1 
                        ? '1px solid rgba(99, 102, 241, 0.1)' 
                        : 'none'
                    }}
                  >
                    <div className="flex-between mb-1">
                      <span style={{ fontWeight: '600' }}>{cat.category}</span>
                      <span className="mono" style={{ color: 'var(--primary)' }}>
                        ${cat.monthlyCost.toFixed(2)}/mo
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ 
                        flex: 1, 
                        height: '8px', 
                        background: 'rgba(99, 102, 241, 0.1)',
                        borderRadius: '999px',
                        overflow: 'hidden'
                      }}>
                        <div style={{ 
                          width: `${percentage}%`, 
                          height: '100%',
                          background: 'var(--gradient-primary)',
                          borderRadius: '999px',
                          transition: 'width 0.5s ease'
                        }} />
                      </div>
                      <span style={{ fontSize: '0.875rem', color: 'var(--gray-light)', minWidth: '45px' }}>
                        {percentage}%
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray)', marginTop: '0.25rem' }}>
                      {cat.count} subscription{cat.count !== 1 ? 's' : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: 'var(--gray-light)', textAlign: 'center', padding: '2rem 0' }}>
              No subscriptions yet
            </p>
          )}
        </div>

        {/* Upcoming Renewals */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <AlertCircle size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Upcoming Renewals
            </h3>
          </div>
          {upcomingRenewals.length > 0 ? (
            <div>
              {upcomingRenewals.map((sub) => (
                <div 
                  key={sub.id}
                  style={{ 
                    padding: '1rem',
                    background: 'rgba(99, 102, 241, 0.05)',
                    borderRadius: '0.5rem',
                    marginBottom: '0.75rem',
                    border: '1px solid rgba(99, 102, 241, 0.1)'
                  }}
                >
                  <div className="flex-between mb-1">
                    <span style={{ fontWeight: '600' }}>{sub.name}</span>
                    <span className="badge badge-warning">
                      {format(new Date(sub.nextBillingDate), 'MMM dd')}
                    </span>
                  </div>
                  <div className="flex-between" style={{ fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--gray-light)' }}>
                      {sub.category || 'Uncategorized'}
                    </span>
                    <span className="mono" style={{ color: 'var(--primary)', fontWeight: '600' }}>
                      {sub.cost} {sub.currency}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--gray-light)', textAlign: 'center', padding: '2rem 0' }}>
              No upcoming renewals in the next 30 days
            </p>
          )}
        </div>
      </div>

      {/* Currency Breakdown */}
      {Object.keys(currencyBreakdown).length > 1 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Currency Breakdown</h3>
          </div>
          <div className="grid grid-4">
            {Object.entries(currencyBreakdown).map(([currency, amounts]) => (
              <div 
                key={currency}
                style={{ 
                  padding: '1rem',
                  background: 'rgba(99, 102, 241, 0.05)',
                  borderRadius: '0.5rem',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '0.875rem', color: 'var(--gray-light)', marginBottom: '0.5rem' }}>
                  {currency}
                </div>
                <div className="mono" style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                  {amounts.monthly.toFixed(2)}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>
                  per month
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;