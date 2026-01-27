import React, { useState, useEffect } from 'react';
import { ChevronRight, Copy, CheckCircle } from 'lucide-react';
import { FlightOffer } from '../services/FlightService';
import { convertCurrencyLive } from '../utils/currencyConverter';
import '../../styles/FlightBooking3Step.css';

interface FlightBookingModalProps {
    flight: FlightOffer;
    passengers: number;
    selectedCurrency: string;
    onClose: () => void;
    onConfirm: (bookingDetails: BookingDetails) => void;
}

export interface BookingDetails {
    flight: FlightOffer;
    passengers: number;
    flightClass: 'economy' | 'business' | 'first';
    totalAmount: number;
    convertedAmount: number;
    currency: string;
    paymentMethod: 'bank-transfer';
    bankAccount: BankAccount;
    transferConfirmed: boolean;
    passengerName: string;
    email: string;
    phoneNumber: string;
}

interface BankAccount {
    bank: string;
    accountName: string;
    accountNumber: string;
    currency: string;
}

const BANK_ACCOUNTS: Record<string, BankAccount> = {
    NGN: { bank: 'GT Bank', accountName: 'JAFAR GWAMMAJA INVESTMENT LIMITED', accountNumber: '0918510388', currency: 'NGN' },
    USD: { bank: 'Access Bank', accountName: 'JF Travel & Tours Ltd', accountNumber: '9876543210', currency: 'USD' },
    EUR: { bank: 'GTBank', accountName: 'JF Travel & Tours Ltd', accountNumber: '5555666677', currency: 'EUR' }
};

const FLIGHT_CLASSES = [
    { id: 'economy', name: 'Economy', priceMultiplier: 1, benefits: ['Basic seating', '1 checked bag', 'Standard meals'] },
    { id: 'business', name: 'Business', priceMultiplier: 2.5, benefits: ['Priority seating', '2 checked bags', 'Premium meals', 'Extra legroom'] },
    { id: 'first', name: 'First Class', priceMultiplier: 4, benefits: ['Luxury seating', 'Unlimited baggage', 'Gourmet meals', 'Lounge access', 'Personal service'] }
];

export const FlightBookingModal3Step: React.FC<FlightBookingModalProps> = ({
    flight,
    passengers,
    selectedCurrency,
    onClose,
    onConfirm
}) => {
    const [step, setStep] = useState(1);
    const [selectedClass, setSelectedClass] = useState<'economy' | 'business' | 'first'>('economy');
    const [paymentCurrency, setPaymentCurrency] = useState(selectedCurrency);
    const [convertedAmount, setConvertedAmount] = useState(0);
    const [copiedAccount, setCopiedAccount] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [transferConfirmed, setTransferConfirmed] = useState(false);
    const [bookingCompleted, setBookingCompleted] = useState(false);

    // Passenger details
    const [passengerName, setPassengerName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    const [loading, setLoading] = useState(false);
    const [allCurrencyPrices, setAllCurrencyPrices] = useState({ NGN: 0, USD: 0, EUR: 0 });

    const classInfo = FLIGHT_CLASSES.find(c => c.id === selectedClass)!;

    const basePriceNGN = flight.price;
    const totalAmountNGN = basePriceNGN * classInfo.priceMultiplier;

    const bankAccount = BANK_ACCOUNTS[paymentCurrency] || BANK_ACCOUNTS.NGN;

    useEffect(() => {
        const fetchConversion = async () => {
            setLoading(true);
            try {
                const usd = await convertCurrencyLive(totalAmountNGN, 'NGN', 'USD');
                const eur = await convertCurrencyLive(totalAmountNGN, 'NGN', 'EUR');

                setAllCurrencyPrices({ NGN: totalAmountNGN, USD: usd, EUR: eur });
                setConvertedAmount(paymentCurrency === 'USD' ? usd : paymentCurrency === 'EUR' ? eur : totalAmountNGN);
            } catch {
                const usd = totalAmountNGN / 1420;
                const eur = usd / 1.08;
                setAllCurrencyPrices({ NGN: totalAmountNGN, USD: usd, EUR: eur });
                setConvertedAmount(paymentCurrency === 'USD' ? usd : paymentCurrency === 'EUR' ? eur : totalAmountNGN);
            } finally {
                setLoading(false);
            }
        };

        fetchConversion();
    }, [paymentCurrency, totalAmountNGN]);

    const getCurrencySymbol = (currency: string) =>
        ({ NGN: '₦', USD: '$', EUR: '€' }[currency] || currency);

    // Email validation function
    const isValidEmail = (emailValue: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(emailValue);
    };

    // Generate confirmation number
    const generateConfirmationNumber = (): string => {
        const randomNumbers = Math.floor(100000 + Math.random() * 900000); // 6 random digits
        return `JF${randomNumbers}`;
    };

    const handleCopyAccount = () => {
        navigator.clipboard.writeText(bankAccount.accountNumber);
        setCopiedAccount(true);
        setTimeout(() => setCopiedAccount(false), 2000);
    };

    const handleConfirmTransfer = () => {
        setIsConfirming(true);
        setTimeout(() => {
            setBookingCompleted(true);
            onConfirm({
                flight,
                passengers,
                flightClass: selectedClass,
                totalAmount: totalAmountNGN,
                convertedAmount,
                currency: paymentCurrency,
                paymentMethod: 'bank-transfer',
                bankAccount,
                transferConfirmed: true,
                passengerName,
                email,
                phoneNumber
            });
        }, 2000);
    };

    if (bookingCompleted) {
        return (
            <div className="booking-modal-overlay">
                <div className="booking-modal booking-success-modal">
                    <CheckCircle className="w-16 h-16 text-green-500" />
                    <h2>Booking Confirmed!</h2>
                    <p className="success-message">Your flight booking has been successfully completed.</p>
                    <p className="booking-reference">Reference: {generateConfirmationNumber()}</p>
                    <button className="btn-success" onClick={onClose}>Done</button>
                </div>
            </div>
        );
    }

    return (
        <div className="booking-modal-overlay" onClick={onClose}>
            <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>×</button>

                {/* Progress Indicator */}
                <div className="progress-indicator">
                    <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                        <span>1</span>
                        <p>Information</p>
                    </div>
                    <div className="progress-line">
                        <div className={`line-fill ${step > 1 ? 'active' : ''}`}></div>
                    </div>
                    <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                        <span>2</span>
                        <p>Class & Price</p>
                    </div>
                    <div className="progress-line">
                        <div className={`line-fill ${step > 2 ? 'active' : ''}`}></div>
                    </div>
                    <div className={`step ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
                        <span>3</span>
                        <p>Passenger</p>
                    </div>
                    <div className="progress-line">
                        <div className={`line-fill ${step > 3 ? 'active' : ''}`}></div>
                    </div>
                    <div className={`step ${step >= 4 ? 'active' : ''}`}>
                        <span>4</span>
                        <p>Payment</p>
                    </div>
                </div>

                {/* Step 1: Flight Information */}
                {step === 1 && (
                    <div className="step-content">
                        <h2>Flight Information</h2>

                        <div className="flight-info-section">
                            <div className="info-card">
                                <div className="info-row">
                                    <span className="label">Flight</span>
                                    <span className="value">{flight.airline}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Route</span>
                                    <span className="value route">{flight.from} <ChevronRight className="inline w-4 h-4" /> {flight.to}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Departure</span>
                                    <span className="value">{flight.departureTime}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Arrival</span>
                                    <span className="value">{flight.arrivalTime}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Duration</span>
                                    <span className="value">{flight.duration}</span>
                                </div>
                            </div>

                            <div className="passenger-card">
                                <h3>Passenger Details</h3>
                                <div className="passenger-info">
                                    <div className="info-item">
                                        <span className="label">Number of Passengers</span>
                                        <span className="value">{passengers}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Base Price (per person)</span>
                                        <span className="value">₦{flight.price.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="button-group">
                            <button className="btn-cancel" onClick={onClose}>Cancel</button>
                            <button className="btn-next" onClick={() => setStep(2)}>
                                Next <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Flight Class Selection & Price Breakdown */}
                {step === 2 && (
                    <div className="step-content">
                        <h2>Select Flight Class & Review Price</h2>

                        <div className="class-selection-section">
                            <h3>Choose Your Class</h3>
                            <div className="class-options">
                                {FLIGHT_CLASSES.map(flightClass => (
                                    <div
                                        key={flightClass.id}
                                        className={`class-card ${selectedClass === flightClass.id ? 'selected' : ''}`}

                                        onClick={() => setSelectedClass(flightClass.id as 'economy' | 'business' | 'first')}
                                    >
                                        <div className="class-header">
                                            <h4>{flightClass.name}</h4>
                                            <div className="price-tag">
                                                ₦{(flight.price * flightClass.priceMultiplier).toFixed(2)}
                                            </div>
                                        </div>
                                        <ul className="benefits-list">
                                            {flightClass.benefits.map((benefit, idx) => (
                                                <li key={idx}>✓ {benefit}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="price-breakdown-section">
                            <h3>Price Breakdown</h3>
                            <div className="price-table">
                                <div className="price-row">
                                    <span>{classInfo.name}</span>
                                    <span>₦{totalAmountNGN.toFixed(2)}</span>

                                </div>
                                <div className="price-row">
                                    <span>Number of passengers</span>
                                    <span>{passengers}</span>
                                </div>
                                <div className="price-row divider">
                                    <span></span>
                                    <span></span>
                                </div>
                                <div className="price-row total">
                                    <span>Total Amount (NGN)</span>
                                    <span className="total-amount">₦{totalAmountNGN.toFixed(2)}</span>

                                </div>
                            </div>
                        </div>

                        <div className="button-group">
                            <button className="btn-back" onClick={() => setStep(1)}>← Back</button>
                            <button className="btn-next" onClick={() => setStep(3)}>
                                Next <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Passenger Details */}
                {step === 3 && (
                    <div className="step-content">
                        <h2>Passenger Details</h2>

                        <div className="flight-info-section">
                            <div className="info-card">
                                <div className="info-row">
                                    <label className="label">Full Name (as on Passport)</label>
                                    <input
                                        type="text"
                                        value={passengerName}
                                        onChange={(e) => setPassengerName(e.target.value)}
                                        placeholder="Enter full name"
                                        className="value input-field"
                                        required
                                    />
                                </div>
                                <div className="info-row">
                                    <label className="label">Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter email address"
                                        className={`value input-field ${email && !isValidEmail(email) ? 'input-error' : ''}`}
                                        required
                                    />
                                    {email && !isValidEmail(email) && (
                                        <span className="error-message" style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                            Please enter a valid email address
                                        </span>
                                    )}
                                </div>
                                <div className="info-row">
                                    <label className="label">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        placeholder="Enter phone number"
                                        className="value input-field"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="button-group">
                            <button className="btn-back" onClick={() => setStep(2)}>← Back</button>
                            <button
                                className="btn-next"
                                onClick={() => setStep(4)}
                                disabled={!passengerName || !email || !phoneNumber || !isValidEmail(email)}
                            >
                                Next <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Payment Currency & Bank Details */}
                {step === 4 && (
                    <div className="step-content">
                        <h2>Select Payment Currency & Complete Booking</h2>

                        <div className="currency-selection-section">
                            <h3>Choose Payment Currency</h3>
                            <div className="currency-selector">
                                <select
                                    value={paymentCurrency}
                                    onChange={(e) => setPaymentCurrency(e.target.value)}
                                    className="currency-select-dropdown"
                                >
                                    <option value="NGN">NGN (Nigerian Naira)</option>
                                    <option value="USD">USD (US Dollar)</option>
                                    <option value="EUR">EUR (Euro)</option>
                                </select>
                            </div>

                            <div className="currency-card-display">
                                <div className="currency-card selected">
                                    <div className="currency-symbol">{getCurrencySymbol(paymentCurrency)}</div>
                                    <div className="currency-name">{paymentCurrency}</div>
                                    <div className="currency-price-display">
                                        <div className="price-row">
                                            <span className="price-label">₦</span>
                                            <span className="price-value">{loading ? '...' : allCurrencyPrices.NGN.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                        </div>
                                        {paymentCurrency !== 'NGN' && (
                                            <div className="price-row">
                                                <span className="price-label">{getCurrencySymbol(paymentCurrency)}</span>
                                                <span className="price-value">
                                                    {loading ? '...' : (paymentCurrency === 'USD' ? allCurrencyPrices.USD.toLocaleString(undefined, { maximumFractionDigits: 2 }) : allCurrencyPrices.EUR.toLocaleString(undefined, { maximumFractionDigits: 2 }))}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bank-details-section">
                            <h3>Bank Account Details</h3>
                            <div className="bank-card">
                                <div className="bank-info">
                                    <div className="info-row">
                                        <span className="label">Bank Name</span>
                                        <span className="value">{bankAccount.bank}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Account Name</span>
                                        <span className="value">{bankAccount.accountName}</span>
                                    </div>
                                    <div className="info-row account-number-row">
                                        <span className="label">Account Number</span>
                                        <div className="account-number-container">
                                            <span className="value account-number">{bankAccount.accountNumber}</span>
                                            <button
                                                className={`copy-button ${copiedAccount ? 'copied' : ''}`}
                                                onClick={handleCopyAccount}
                                                title="Copy account number"
                                            >
                                                {copiedAccount ? (
                                                    <>
                                                        <CheckCircle className="w-4 h-4" /> Copied!
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="w-4 h-4" /> Copy
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Amount to Transfer</span>
                                        <span className="value amount">
                                            {getCurrencySymbol(paymentCurrency)} {convertedAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>

                                <div className="transfer-instruction">
                                    <p>
                                        Please transfer exactly <strong>{getCurrencySymbol(paymentCurrency)} {convertedAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong> to the bank account above.
                                    </p>
                                    <p>Use your booking reference as the transfer description.</p>
                                </div>
                            </div>
                        </div>

                        <div className="confirmation-section">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={transferConfirmed}
                                    onChange={(e) => setTransferConfirmed(e.target.checked)}
                                />
                                <span>I have completed the bank transfer to the account above</span>
                            </label>
                        </div>

                        <div className="button-group">
                            <button className="btn-back" onClick={() => setStep(3)}>← Back</button>
                            <button
                                className={`btn-confirm ${isConfirming ? 'confirming' : ''}`}
                                disabled={!transferConfirmed || isConfirming}
                                onClick={handleConfirmTransfer}
                            >
                                {isConfirming ? 'Processing...' : 'Confirm Booking'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
