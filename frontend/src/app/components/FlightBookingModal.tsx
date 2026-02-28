import React, { useState } from 'react';
import { FlightOffer } from '../services/FlightService';
import '../../styles/FlightBooking.css';

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
  currency: string;
  paymentMethod: 'bank-transfer';
  bankAccount: BankAccount;
  transferConfirmed: boolean;
}

interface BankAccount {
  bank: string;
  accountName: string;
  accountNumber: string;
  currency: string;
}

const BANK_ACCOUNTS: { [key: string]: BankAccount } = {
  NGN: {
    bank: 'GT Bank',
    accountName: 'JAFAR GWAMMAJA INVESTMENT LIMITED',
    accountNumber: '0918510388',
    currency: 'NGN'
  },
  USD: {
    bank: 'GT bank',
    accountName: 'Jafar gwammaja investment limited',
    accountNumber: '3003404883',
    currency: 'USD'
  },
  EUR: {
    bank: 'GT bank',
    accountName: 'Jafar gwammaja investment limited',
    accountNumber: '3003404163',
    currency: 'EUR'
  }
};

const FLIGHT_CLASSES = [
  { id: 'economy', name: 'Economy', priceMultiplier: 1 },
  { id: 'business', name: 'Business', priceMultiplier: 2.5 },
  { id: 'first', name: 'First Class', priceMultiplier: 4 }
];

export const FlightBookingModal: React.FC<FlightBookingModalProps> = ({
  flight,
  passengers,
  selectedCurrency,
  onClose,
  onConfirm
}) => {
  const [selectedClass, setSelectedClass] = useState<'economy' | 'business' | 'first'>('economy');
  const [transferConfirmed, setTransferConfirmed] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);

  const classInfo = FLIGHT_CLASSES.find(c => c.id === selectedClass)!;
  const basePrice = flight.price;
  const perPassengerPrice = basePrice * classInfo.priceMultiplier;
  const totalAmount = perPassengerPrice * passengers;

  const bankAccount = BANK_ACCOUNTS[selectedCurrency] || BANK_ACCOUNTS['NGN'];

  const getCurrencySymbol = (currency: string) => {
    const symbols: { [key: string]: string } = {
      NGN: '₦',
      USD: '$',
      EUR: '€'
    };
    return symbols[currency] || currency;
  };

  const handleConfirmTransfer = () => {
    setTransferConfirmed(true);
    setTimeout(() => {
      onConfirm({
        flight,
        passengers,
        flightClass: selectedClass,
        totalAmount,
        currency: selectedCurrency,
        paymentMethod: 'bank-transfer',
        bankAccount,
        transferConfirmed: true
      });
    }, 2000);
  };

  if (transferConfirmed) {
    return (
      <div className="flight-booking-modal-overlay">
        <div className="flight-booking-modal flight-booking-success">
          <div className="success-icon">✓</div>
          <h2>Transfer Successful!</h2>
          <p>Your flight booking has been confirmed.</p>
          <p className="booking-reference">Reference: {Math.random().toString(36).substring(7).toUpperCase()}</p>
          <button className="btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flight-booking-modal-overlay" onClick={onClose}>
      <div className="flight-booking-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>

        <h2>Flight Booking Details</h2>

        {/* Flight Details */}
        <div className="booking-section">
          <h3>Flight Information</h3>
          <div className="flight-details">
            <div className="detail-item">
              <span className="label">Airline:</span>
              <span className="value">{flight.airline}</span>
            </div>
            <div className="detail-item">
              <span className="label">Route:</span>
              <span className="value">{flight.from} → {flight.to}</span>
            </div>
            <div className="detail-item">
              <span className="label">Time:</span>
              <span className="value">{flight.departureTime} - {flight.arrivalTime}</span>
            </div>
            <div className="detail-item">
              <span className="label">Duration:</span>
              <span className="value">{flight.duration}</span>
            </div>
          </div>
        </div>

        {/* Passengers */}
        <div className="booking-section">
          <h3>Passengers</h3>
          <div className="passenger-info">
            <span className="label">Number of Passengers:</span>
            <span className="value">{passengers}</span>
          </div>
        </div>

        {/* Flight Class Selection */}
        <div className="booking-section">
          <h3>Select Flight Class</h3>
          <div className="class-selection">
            {FLIGHT_CLASSES.map(flightClass => (
              <div
                key={flightClass.id}
                className={`class-option ${selectedClass === flightClass.id ? 'selected' : ''}`}
                onClick={() => setSelectedClass(flightClass.id as 'economy' | 'business' | 'first')}
              >
                <div className="class-name">{flightClass.name}</div>
                <div className="class-price">
                  {getCurrencySymbol(selectedCurrency)} {Math.round(perPassengerPrice * flightClass.priceMultiplier / classInfo.priceMultiplier).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="booking-section price-section">
          <h3>Price Breakdown</h3>
          <div className="price-breakdown">
            <div className="breakdown-item">
              <span>{classInfo.name} per person:</span>
              <span>{getCurrencySymbol(selectedCurrency)} {Math.round(perPassengerPrice).toLocaleString()}</span>
            </div>
            <div className="breakdown-item">
              <span>Number of passengers:</span>
              <span>×{passengers}</span>
            </div>
            <div className="breakdown-item total">
              <span>Total Amount:</span>
              <span className="total-amount">{getCurrencySymbol(selectedCurrency)} {Math.round(totalAmount).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="booking-section">
          <h3>Payment Method</h3>
          <div className="payment-method">
            <input type="radio" id="bank-transfer" name="payment" defaultChecked />
            <label htmlFor="bank-transfer">Bank Transfer</label>
          </div>
        </div>

        {/* Bank Account Details */}
        {!showBankDetails ? (
          <button
            className="btn-secondary"
            onClick={() => setShowBankDetails(true)}
          >
            Show Bank Details
          </button>
        ) : (
          <div className="booking-section bank-details-section">
            <h3>Bank Transfer Details</h3>
            <div className="bank-details">
              <div className="detail-item">
                <span className="label">Bank:</span>
                <span className="value">{bankAccount.bank}</span>
              </div>
              <div className="detail-item">
                <span className="label">Account Name:</span>
                <span className="value">{bankAccount.accountName}</span>
              </div>
              <div className="detail-item">
                <span className="label">Account Number:</span>
                <span className="value account-number">{bankAccount.accountNumber}</span>
              </div>
              <div className="detail-item">
                <span className="label">Currency:</span>
                <span className="value">{bankAccount.currency}</span>
              </div>
              <div className="detail-item">
                <span className="label">Amount to Transfer:</span>
                <span className="value amount">{getCurrencySymbol(selectedCurrency)} {Math.round(totalAmount).toLocaleString()}</span>
              </div>
            </div>
            <p className="instruction">
              Please transfer exactly <strong>{getCurrencySymbol(selectedCurrency)} {Math.round(totalAmount).toLocaleString()}</strong> to the bank account above. Use your booking reference as the transfer description.
            </p>
          </div>
        )}

        {/* Transfer Confirmation */}
        {showBankDetails && (
          <div className="booking-section">
            <label className="transfer-confirmation">
              <input
                type="checkbox"
                checked={transferConfirmed}
                onChange={(e) => {
                  // This is just for UI, actual transfer confirmation happens on button click
                }}
              />
              <span>I have made the transfer to the account above</span>
            </label>
            <button
              className="btn-primary"
              disabled={!transferConfirmed}
              onClick={handleConfirmTransfer}
            >
              Confirm Transfer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
