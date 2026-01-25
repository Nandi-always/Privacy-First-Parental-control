import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import Modal from './Modal';
import { childrenService } from '../services/apiService';
import { useNotification } from '../context/NotificationContext';
import './Modal.css';

const AddChildModal = ({ isOpen, onClose, onSuccess }) => {
  const notify = useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    email: '',
    deviceModel: '',
    osType: 'Android',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.age) {
      notify.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      await childrenService.create(formData);
      notify.success('Child added successfully!');
      setFormData({ name: '', age: '', email: '', deviceModel: '', osType: 'Android' });
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to add child';
      notify.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} title="Add New Child" onClose={onClose} size="md">
      <form onSubmit={handleSubmit} className="modal-form">
        <div className="form-group">
          <label htmlFor="name">Child Name *</label>
          <input
            id="name"
            type="text"
            name="name"
            placeholder="Enter child's name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="age">Age *</label>
          <input
            id="age"
            type="number"
            name="age"
            placeholder="Enter age"
            min="5"
            max="23"
            value={formData.age}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="Enter child's email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="osType">Device OS</label>
          <select
            id="osType"
            name="osType"
            value={formData.osType}
            onChange={handleChange}
          >
            <option value="Android">Android</option>
            <option value="iOS">iOS</option>
            <option value="Windows">Windows</option>
            <option value="macOS">macOS</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="deviceModel">Device Model</label>
          <input
            id="deviceModel"
            type="text"
            name="deviceModel"
            placeholder="e.g., iPhone 12, Samsung S21"
            value={formData.deviceModel}
            onChange={handleChange}
          />
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            <Plus size={18} />
            {loading ? 'Adding...' : 'Add Child'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddChildModal;
