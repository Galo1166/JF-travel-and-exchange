
import React, { useState } from 'react';
import { FlightSearchParams } from '../services/FlightService';
import '../../styles/FlightSearch.css';

interface FlightSearchFormProps {
    onSearch: (params: FlightSearchParams) => void;
    isLoading: boolean;
}

const NIGERIAN_AIRPORTS = [
    // Southwest
    { code: 'LOS', name: 'Lagos (LOS) - Murtala Muhammed' },
    { code: 'ABK', name: 'Abeokuta (ABK) - Ogun State' },
    { code: 'AKU', name: 'Akure (AKU) - Ondo State' },
    { code: 'OSG', name: 'Osogbo (OSG) - Osun State' },
    
    // Northcentral
    { code: 'ABV', name: 'Abuja (ABV) - Nnamdi Azikiwe' },
    { code: 'KAD', name: 'Kaduna (KAD) - Kaduna State' },
    { code: 'MKU', name: 'Makurdi (MKU) - Benue State' },
    { code: 'ILR', name: 'Ilorin (ILR) - Kwara State' },
    { code: 'JOS', name: 'Jos (JOS) - Plateau State' },
    { code: 'BCD', name: 'Bauchi (BCD) - Bauchi State' },
    
    // Northeast
    { code: 'MJU', name: 'Maiduguri (MJU) - Borno State' },
    { code: 'YLA', name: 'Yola (YLA) - Adamawa State' },
    
    // Northwest
    { code: 'KAN', name: 'Kano (KAN) - Mallam Aminu Kano' },
    { code: 'KTG', name: 'Katsina (KTG) - Katsina State' },
    { code: 'SKO', name: 'Sokoto (SKO) - Sokoto State' },
    { code: 'GSU', name: 'Gusau (GSU) - Zamfara State' },
    { code: 'ZAR', name: 'Zaria (ZAR) - Kaduna State' },
    
    // South-South
    { code: 'PHC', name: 'Port Harcourt (PHC) - Rivers State' },
    { code: 'WAR', name: 'Warri (WAR) - Delta State' },
    { code: 'CBQ', name: 'Calabar (CBQ) - Cross River State' },
    { code: 'QUO', name: 'Uyo (QUO) - Akwa Ibom State' },
    { code: 'ABB', name: 'Asaba (ABB) - Delta State' },
    
    // Southeast
    { code: 'ENU', name: 'Enugu (ENU) - Akanu Ibiam' },
    { code: 'OWR', name: 'Owerri (OWR) - Imo State' },
    { code: 'ASE', name: 'Asata (ASE) - Anambra State' }
];

export const FlightSearchForm: React.FC<FlightSearchFormProps> = ({ onSearch, isLoading }) => {
    const today = new Date().toISOString().split('T')[0];
    const [formData, setFormData] = useState<FlightSearchParams>({
        origin: 'LOS',
        destination: 'ABV',
        departureDate: today,
        adults: 1
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Ensure adults is sent as number
        onSearch({
            ...formData,
            adults: Number(formData.adults)
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'adults') {
            setFormData({
                ...formData,
                [name]: Number(value)
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    return (
        <form className="flight-search-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label className="form-label">From</label>
                <select
                    name="origin"
                    value={formData.origin}
                    onChange={handleChange}
                    className="form-select"
                    required
                >
                    {NIGERIAN_AIRPORTS.map(airport => (
                        <option key={`origin-${airport.code}`} value={airport.code}>
                            {airport.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label className="form-label">To</label>
                <select
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    className="form-select"
                    required
                >
                    {NIGERIAN_AIRPORTS.map(airport => (
                        <option key={`dest-${airport.code}`} value={airport.code}>
                            {airport.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label className="form-label">Departure</label>
                <input
                    type="date"
                    name="departureDate"
                    value={formData.departureDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="form-input"
                    required
                />
            </div>

            <div className="form-group">
                <label className="form-label">Passengers</label>
                <input
                    type="number"
                    name="adults"
                    value={formData.adults}
                    onChange={handleChange}
                    min="1"
                    max="9"
                    className="form-input"
                    required
                />
            </div>

            <button type="submit" className="search-button" disabled={isLoading}>
                {isLoading ? 'Searching...' : 'Search Flights'}
            </button>
        </form>
    );
};
