import React, { useState, useEffect } from 'react';
import { Send, X, AlertTriangle, ShieldAlert, MessageCircle } from 'lucide-react';
import { notificationsService } from '../services/apiService';
import '../styles/Modal.css';

const SendAlertModal = ({ isOpen, onClose, user, childrenList }) => {
    const [message, setMessage] = useState('');
    const [type, setType] = useState('message');
    const [receiverId, setReceiverId] = useState('');
    const [loading, setLoading] = useState(false);

    // Set receiverId when modal opens or childrenList changes
    useEffect(() => {
        if (isOpen && user?.role === 'parent' && childrenList?.length > 0) {
            setReceiverId(childrenList[0]._id);
        } else if (isOpen && user?.role === 'child' && user.parentId) {
            setReceiverId(user.parentId);
        }
    }, [isOpen, childrenList, user]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log('📤 Sending message:', { receiverId, message, type });
        console.log('📋 Current state:', {
            receiverId,
            message,
            type,
            messageLength: message?.length,
            receiverIdValid: !!receiverId
        });

        if (!message?.trim() || !receiverId) {
            console.error('❌ Validation failed:', {
                messageEmpty: !message?.trim(),
                receiverIdEmpty: !receiverId,
                receiverId,
                message
            });
            alert(`Please fill in all required fields.\nMessage: ${message?.trim() ? '✓' : '✗'}\nRecipient: ${receiverId ? '✓' : '✗'}`);
            return;
        }

        try {
            setLoading(true);
            const response = await notificationsService.send({
                receiverId,
                message,
                type
            });
            console.log('✅ Message sent successfully:', response.data);
            alert('Message sent successfully!');
            setMessage('');
            onClose();
        } catch (err) {
            console.error('❌ Failed to send notification:', err);
            console.error('Error details:', err.response?.data || err.message);
            alert(`Failed to send message: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h2>Send Alert / Message</h2>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    {user?.role === 'parent' && childrenList?.length > 1 && (
                        <div className="form-group">
                            <label>Select Child</label>
                            <select
                                value={receiverId}
                                onChange={(e) => setReceiverId(e.target.value)}
                                className="form-input"
                            >
                                {childrenList.map(child => (
                                    <option key={child._id} value={child._id}>{child.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="form-group">
                        <label>Alert Type</label>
                        <div className="type-selector">
                            <button
                                type="button"
                                className={`type-btn ${type === 'message' ? 'active' : ''}`}
                                onClick={() => setType('message')}
                            >
                                <MessageCircle size={18} />
                                <span>Message</span>
                            </button>
                            <button
                                type="button"
                                className={`type-btn ${type === 'alert' ? 'active' : ''}`}
                                onClick={() => setType('alert')}
                            >
                                <AlertTriangle size={18} />
                                <span>Alert</span>
                            </button>
                            <button
                                type="button"
                                className={`type-btn ${type === 'emergency' ? 'active' : ''}`}
                                onClick={() => setType('emergency')}
                            >
                                <ShieldAlert size={18} />
                                <span>Emergency</span>
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Message</label>
                        <textarea
                            className="form-input"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message here..."
                            required
                            rows="4"
                        />
                    </div>

                    <button type="submit" className="submit-button" disabled={loading}>
                        {loading ? 'Sending...' : (
                            <>
                                <span>Send Now</span>
                                <Send size={18} />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SendAlertModal;
