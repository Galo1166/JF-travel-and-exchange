
import React from 'react';
import { FlightOffer } from '../services/FlightService';
import '../../styles/FlightSearch.css';

interface FlightResultCardProps {
    flight: FlightOffer;
    onBook?: () => void;
}

export const FlightResultCard: React.FC<FlightResultCardProps> = ({ flight, onBook }) => {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    const formatDuration = (duration: string) => {
        // Convert ISO 8601 format (e.g., "PT2H30M") to readable format (e.g., "2h 30m")
        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
        if (!match) return duration;
        const hours = match[1] ? `${match[1]}h` : '';
        const minutes = match[2] ? `${match[2]}m` : '';
        return [hours, minutes].filter(Boolean).join(' ');
    };

    const isBookingAvailable = !!onBook;

    return (
        <div className="flight-card">
            <div className="flight-header">
                <span className="airline-name">{flight.airline}</span>
                <span className="flight-duration">{formatDuration(flight.duration)}</span>
            </div>

            <div className="flight-route">
                <div className="route-point">
                    <span className="airport-code">{flight.from}</span>
                    <div className="flight-time">{flight.departureTime}</div>
                </div>

                <div className="route-line"></div>

                <div className="route-point">
                    <span className="airport-code">{flight.to}</span>
                    <div className="flight-time">{flight.arrivalTime}</div>
                </div>
            </div>

            <div className="flight-footer">
                <div className="flight-price">
                    {formatPrice(flight.price)}
                </div>
                <button 
                    className="book-button" 
                    disabled={!isBookingAvailable}
                    onClick={onBook}
                    title={isBookingAvailable ? "Book this flight" : "Booking coming soon"}
                >
                    {isBookingAvailable ? 'Book Flight' : 'Coming Soon'}
                </button>
            </div>
        </div>
    );
};
