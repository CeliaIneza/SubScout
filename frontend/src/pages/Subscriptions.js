import React, { useState, useEffect } from 'react';
import { subscriptionAPI } from '../services/api';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Filter,
  X,
  Calendar,
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns';

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterActive, setFilterActive] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    cost: '',
    currency: 'USD',
    frequency: 'Monthly',
    categoryId: '',
    nextBillingDate: '',
    notes: '',
    isActive: true
  });

  useEffect(() => {
    fetchSubscriptions();
    fetchCategories();
  }, [filterCategory, filterActive]);

  const fetchSubscriptions = async () => {
    try {
      const params = {};
      if (filterCategory) params.category = filterCategory;
      if (filterActive) params.isActive = filterActive;
      
      const response = await subscriptionAPI.getAll(params);
      setSubscriptions(response.data.data);
    } catch (error) {
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await subscriptionAPI.getCategories();
      setCategories(response.data.data);
    } catch (error) {
      console.error('Failed to load categories');
    }
  };

  const handleOpenModal = (subscription = null) => {
    if (subscription) {
      setEditingSubscription(subscription);
      setFormData({
        name: subscription.name,
        cost: subscription.cost,
        currency: subscription.currency,
        frequency: subscription.frequency,
        categoryId: subscription.category?.id || '',
        nextBillingDate: subscription.nextBillingDate,
        notes: subscription.notes || '',
        isActive: subscription.isActive
      });
    } else {
      setEditingSubscription(null);
      setFormData({
        name: '',
        cost: '',
        currency: 'USD',
        frequency: 'Monthly',
        categoryId: '',
        nextBillingDate: '',
        notes: '',
        isActive: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSubscription(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (parseFloat(formData.cost) <= 0) {
      toast.error('Cost must be greater than 0');
      return;
    }

    try {
      if (editingSubscription) {
        await subscriptionAPI.update(editingSubscription.id, formData);
        toast.success('Subscription updated successfully');
      } else {
        await subscriptionAPI.create(formData);
        toast.success('Subscription created successfully');
      }
      handleCloseModal();
      fetchSubscriptions();
    } catch (error) {
      const message = error.response?.data?.message || 
                     error.response?.data?.errors?.[0]?.message ||
                     'Failed to save subscription';
      toast.error(message);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      await subscriptionAPI.delete(id);
      toast.success('Subscription deleted successfully');
      fetchSubscriptions();
    } catch (error) {
      toast.error('Failed to delete subscription');
    }
  };

  const clearFilters = () => {
    setFilterCategory('');
    setFilterActive('');
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem 0' }}>
        <div className="loading">
          <h2>Loading subscriptions...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <div className="flex-between mb-4">
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>
            My Subscriptions
          </h1>
          <p style={{ color: 'var(--gray-light)', fontSize: '1.125rem' }}>
            Manage all your recurring payments
          </p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => handleOpenModal()}
        >
          <Plus size={20} />
          Add Subscription
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={18} />
            <span style={{ fontWeight: '600' }}>Filters:</span>
          </div>
          
          <select 
            className="form-select" 
            style={{ width: 'auto', minWidth: '150px' }}
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>

          <select 
            className="form-select" 
            style={{ width: 'auto', minWidth: '150px' }}
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>

          {(filterCategory || filterActive) && (
            <button 
              className="btn btn-sm btn-secondary"
              onClick={clearFilters}
            >
              <X size={16} />
              Clear Filters
            </button>
          )}

          <div style={{ marginLeft: 'auto', color: 'var(--gray-light)' }}>
            {subscriptions.length} subscription{subscriptions.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      {subscriptions.length > 0 ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Cost</th>
                <th>Frequency</th>
                <th>Next Billing</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub) => (
                <tr key={sub.id}>
                  <td>
                    <div style={{ fontWeight: '600' }}>{sub.name}</div>
                    {sub.notes && (
                      <div style={{ fontSize: '0.875rem', color: 'var(--gray)', marginTop: '0.25rem' }}>
                        {sub.notes.substring(0, 50)}{sub.notes.length > 50 ? '...' : ''}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="badge badge-primary">
                      {sub.category?.name || 'Uncategorized'}
                    </span>
                  </td>
                  <td>
                    <span className="mono" style={{ fontWeight: '600' }}>
                      {sub.cost} {sub.currency}
                    </span>
                  </td>
                  <td>{sub.frequency}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={14} />
                      {format(new Date(sub.nextBillingDate), 'MMM dd, yyyy')}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${sub.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {sub.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleOpenModal(sub)}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(sub.id, sub.name)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card text-center" style={{ padding: '3rem' }}>
          <DollarSign size={48} style={{ margin: '0 auto 1rem', color: 'var(--gray)' }} />
          <h3 style={{ marginBottom: '0.5rem' }}>No subscriptions found</h3>
          <p style={{ color: 'var(--gray-light)', marginBottom: '1.5rem' }}>
            {filterCategory || filterActive 
              ? 'Try adjusting your filters' 
              : 'Get started by adding your first subscription'}
          </p>
          {!filterCategory && !filterActive && (
            <button 
              className="btn btn-primary"
              onClick={() => handleOpenModal()}
            >
              <Plus size={20} />
              Add Subscription
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingSubscription ? 'Edit Subscription' : 'Add Subscription'}
              </h2>
              <button className="modal-close" onClick={handleCloseModal}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Subscription Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="e.g., Netflix, Spotify, Gym Membership"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Cost *</label>
                  <input
                    type="number"
                    name="cost"
                    className="form-input"
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    value={formData.cost}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Currency *</label>
                  <select
                    name="currency"
                    className="form-select"
                    value={formData.currency}
                    onChange={handleChange}
                    required
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="CAD">CAD</option>
                    <option value="AUD">AUD</option>
                    <option value="JPY">JPY</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Frequency *</label>
                  <select
                    name="frequency"
                    className="form-select"
                    value={formData.frequency}
                    onChange={handleChange}
                    required
                  >
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    name="categoryId"
                    className="form-select"
                    value={formData.categoryId}
                    onChange={handleChange}
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Next Billing Date *</label>
                <input
                  type="date"
                  name="nextBillingDate"
                  className="form-input"
                  value={formData.nextBillingDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  name="notes"
                  className="form-textarea"
                  placeholder="Add any notes about this subscription..."
                  rows="3"
                  value={formData.notes}
                  onChange={handleChange}
                  maxLength="1000"
                />
              </div>

              {editingSubscription && (
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      style={{ width: 'auto', cursor: 'pointer' }}
                    />
                    <span className="form-label" style={{ marginBottom: 0 }}>Active Subscription</span>
                  </label>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editingSubscription ? 'Update Subscription' : 'Add Subscription'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleCloseModal}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscriptions;