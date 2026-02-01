import React, { useState } from "react";
import { X, Upload, Plus, Trash2 } from "lucide-react";
import eventService from "../../services/eventService";
import { useSelector } from "react-redux";

const RegisterEventModal = ({ event, onClose, onSuccess }) => {
  const { accessToken } = useSelector((state) => state.auth);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    teamName: "",
    teamSize: 1,
    members: [{ name: "", contact: "" }],
    transactionId: "",
    paymentProof: null,
  });

  const handleMemberChange = (index, field, value) => {
    const newMembers = [...formData.members];
    newMembers[index][field] = value;
    setFormData({ ...formData, members: newMembers });
  };

  const addMember = () => {
    setFormData({
      ...formData,
      members: [...formData.members, { name: "", contact: "" }],
      teamSize: formData.teamSize + 1,
    });
  };

  const removeMember = (index) => {
    if (formData.members.length > 1) {
      const newMembers = formData.members.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        members: newMembers,
        teamSize: formData.teamSize - 1,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append("teamName", formData.teamName);
      data.append("teamSize", formData.teamSize);
      data.append("members", JSON.stringify(formData.members));
      data.append("transactionId", formData.transactionId);
      data.append("paymentProof", formData.paymentProof);

      await eventService.registerForEvent(event._id, data, accessToken);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Registration failed", error);
      alert("Registration failed: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <h2 className="modal-title">Register for {event.title}</h2>

        <div className="steps-indicator">
          <div className={`step ${step === 1 ? "active" : ""}`}>1. Team Details</div>
          <div className={`step ${step === 2 ? "active" : ""}`}>2. Payment</div>
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="step-content">
              <div className="form-group">
                <label>Team Name</label>
                <input
                  type="text"
                  value={formData.teamName}
                  onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                  required
                  placeholder="Enter your team name"
                />
              </div>

              <div className="members-section">
                <label>Team Members</label>
                {formData.members.map((member, index) => (
                  <div key={index} className="member-row">
                    <input
                      type="text"
                      placeholder="Name"
                      value={member.name}
                      onChange={(e) => handleMemberChange(index, "name", e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Contact No."
                      value={member.contact}
                      onChange={(e) => handleMemberChange(index, "contact", e.target.value)}
                      required
                    />
                    {formData.members.length > 1 && (
                      <button type="button" className="remove-btn" onClick={() => removeMember(index)}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" className="add-btn" onClick={addMember}>
                  <Plus size={16} /> Add Member
                </button>
              </div>

              <button type="button" className="next-btn" onClick={() => setStep(2)}>
                Next: Payment
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="step-content">
              <div className="qr-section">
                <p>Scan to Pay</p>
                <img src={event.qrCodeUrl} alt="Payment QR Code" className="qr-code" />
                <p className="help-text">For help, contact: {event.helpContact}</p>
              </div>

              <div className="form-group">
                <label>Transaction ID</label>
                <input
                  type="text"
                  value={formData.transactionId}
                  onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                  required
                  placeholder="Enter UPI Transaction ID"
                />
              </div>

              <div className="form-group">
                <label>Upload Payment Proof</label>
                <div className="file-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({ ...formData, paymentProof: e.target.files[0] })}
                    required
                  />
                  <div className="upload-placeholder">
                    <Upload size={20} />
                    <span>{formData.paymentProof ? formData.paymentProof.name : "Click to upload screenshot"}</span>
                  </div>
                </div>
              </div>

              <div className="action-buttons">
                <button type="button" className="back-btn" onClick={() => setStep(1)}>
                  Back
                </button>
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? "Submitting..." : "Submit Registration"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }
        .modal-content {
          background: white;
          border-radius: 16px;
          width: 90%;
          max-width: 500px;
          padding: 24px;
          position: relative;
          max-height: 90vh;
          overflow-y: auto;
        }
        .close-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          background: none;
          border: none;
          cursor: pointer;
          color: #64748b;
        }
        .modal-title {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 20px;
          color: #0f172a;
        }
        .steps-indicator {
          display: flex;
          gap: 20px;
          margin-bottom: 24px;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 12px;
        }
        .step {
          font-size: 14px;
          font-weight: 600;
          color: #94a3b8;
          padding-bottom: 12px;
          margin-bottom: -13px;
        }
        .step.active {
          color: #6c5ce7;
          border-bottom: 2px solid #6c5ce7;
        }
        .form-group {
          margin-bottom: 16px;
        }
        .form-group label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #475569;
          margin-bottom: 6px;
        }
        .form-group input {
          width: 100%;
          padding: 10px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
        }
        .members-section {
          margin-bottom: 20px;
        }
        .member-row {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
        }
        .member-row input {
          flex: 1;
          padding: 8px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 13px;
        }
        .remove-btn {
          background: #fee2e2;
          color: #ef4444;
          border: none;
          border-radius: 8px;
          width: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .add-btn {
          background: none;
          border: 1px dashed #cbd5e1;
          color: #6c5ce7;
          width: 100%;
          padding: 8px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .next-btn, .submit-btn {
          width: 100%;
          background: #6c5ce7;
          color: white;
          border: none;
          padding: 12px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 10px;
        }
        .qr-section {
          text-align: center;
          margin-bottom: 20px;
          background: #f8fafc;
          padding: 16px;
          border-radius: 12px;
        }
        .qr-code {
          width: 150px;
          height: 150px;
          object-fit: contain;
          margin: 10px 0;
        }
        .help-text {
          font-size: 12px;
          color: #64748b;
        }
        .file-upload {
          position: relative;
          border: 2px dashed #cbd5e1;
          border-radius: 10px;
          padding: 20px;
          text-align: center;
          cursor: pointer;
        }
        .file-upload input {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }
        .upload-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          color: #64748b;
          font-size: 13px;
        }
        .action-buttons {
          display: flex;
          gap: 10px;
        }
        .back-btn {
          flex: 1;
          background: #f1f5f9;
          color: #475569;
          border: none;
          padding: 12px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
        }
        .submit-btn {
          flex: 2;
          margin-top: 0;
        }
        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default RegisterEventModal;
