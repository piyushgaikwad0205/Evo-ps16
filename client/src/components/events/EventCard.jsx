import React from "react";
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react";
import dayjs from "dayjs";

const EventCard = ({ event, onRegister }) => {
  const isFull = event.filledSlots >= event.totalSlots;
  const availableSlots = event.totalSlots - event.filledSlots;

  return (
    <div className="event-card">
      <div className="event-image-wrap">
        <img src={event.bannerUrl} alt={event.title} className="event-image" />
        <div className="event-badge">
          {isFull ? "Sold Out" : `${availableSlots} spots left`}
        </div>
      </div>
      <div className="event-body">
        <h4 className="event-title">{event.title}</h4>
        <p className="event-desc">{event.description.substring(0, 100)}...</p>

        <div className="event-meta-row">
          <div className="meta-item">
            <Calendar size={14} />
            <span>{dayjs(event.eventDate).format("MMM D, YYYY")}</span>
          </div>
          <div className="meta-item">
            <MapPin size={14} />
            <span>{event.location || "Online"}</span>
          </div>
        </div>

        <button
          className={`event-cta ${isFull ? "disabled" : ""}`}
          onClick={() => !isFull && onRegister(event)}
          disabled={isFull}
        >
          {isFull ? "Full" : "Register"} <ArrowRight size={14} />
        </button>
      </div>

      <style>{`
        .event-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 8px 30px rgba(15,23,42,0.04);
          transition: transform 0.2s ease;
          height: 100%;
        }
        .event-card:hover {
          transform: translateY(-4px);
        }
        .event-image-wrap {
          position: relative;
          height: 160px;
        }
        .event-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .event-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(0,0,0,0.6);
          color: white;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          backdrop-filter: blur(4px);
        }
        .event-body {
          padding: 16px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .event-title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 8px;
          color: #0f172a;
        }
        .event-desc {
          font-size: 14px;
          color: #64748b;
          margin-bottom: 16px;
          flex: 1;
        }
        .event-meta-row {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #64748b;
        }
        .event-cta {
          background: transparent;
          border: none;
          color: #6c5ce7;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          padding: 0;
          font-size: 14px;
          transition: all 0.2s ease;
          margin-top: auto;
        }
        .event-cta:hover:not(.disabled) {
          color: #5b4bc4;
          gap: 12px;
        }
        .event-cta.disabled {
          color: #cbd5e1;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default EventCard;
