import React, { useEffect, useState } from "react";
import EventCard from "./EventCard";
import RegisterEventModal from "../modals/RegisterEventModal";
import eventService from "../../services/eventService";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const EventList = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const { userData, accessToken } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    const fetchEvents = async () => {
        try {
            const data = await eventService.getEvents();
            setEvents(data);
        } catch (error) {
            console.error("Error fetching events:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleRegister = (event) => {
        if (!userData || !accessToken) {
            navigate("/signin");
            return;
        }
        setSelectedEvent(event);
    };

    // Hide entire event section while loading
    if (loading) {
        return null;
    }

    // Hide entire event section if no events exist
    if (events.length === 0) {
        return null;
    }

    return (
        <>
            <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4 px-2">Upcoming Events</h2>
                <div className="events-grid">
                    {events.map((event) => (
                        <EventCard
                            key={event._id}
                            event={event}
                            onRegister={handleRegister}
                        />
                    ))}
                </div>
            </div>

            {selectedEvent && (
                <RegisterEventModal
                    event={selectedEvent}
                    onClose={() => setSelectedEvent(null)}
                    onSuccess={() => {
                        alert("Registration submitted successfully! Pending admin approval.");
                        fetchEvents();
                    }}
                />
            )}

            <style>{`
        .events-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
          margin-top: 20px;
        }
        @media (max-width: 640px) {
          .events-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </>
    );
};

export default EventList;
