import React, { useState } from 'react';
import { ChevronRight, Copy, CheckCircle } from 'lucide-react';
import '../styles/FlightPayment.css';
import { convertCurrency } from '../utils/currencyConverter';

interface FlightPaymentPageProps {
  flight?: any;
  passengers?: number;
  flightClass?: string;
  totalAmount?: number;
  onNavigate?: (page: string, data?: any) => void;
  onCurrencySelect?: (currency: string) => void;
}

interface BankAccount {
  bank: string;
  accountName: string;
  accountNumber: string;
  currency: string;
  code: string;
  swift?: string;
}

interface Currency {
  code: string;
  name: string;
  symbol: string;
  icon: string;
  accountDetails: BankAccount;
}

const CURRENCIES: Currency[] = [
  {
    code: 'NGN',
    name: 'Nigerian Naira',
    symbol: '₦',
    icon: '🇳🇬',
    accountDetails: {
      bank: 'Zenith Bank',
      accountName: 'JF Travel & Tours Limited',
      accountNumber: '1234567890',
      currency: 'NGN',
      code: 'NGN',
      swift: 'ZEIBNGLA'
    }
  },
  {
    code: 'USD',
    name: 'United States Dollar',
    symbol: '$',
    icon: '🇺🇸',
    accountDetails: {
      bank: 'Access Bank',
      accountName: 'JF Travel & Tours Limited',
      accountNumber: '9876543210',
      currency: 'USD',
      code: 'USD',
      swift: 'ABNGNGLA'
    }
  },
  {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    icon: '🇪🇺',
    accountDetails: {
      bank: 'Guaranty Trust Bank',
      accountName: 'JF Travel & Tours Limited',
      accountNumber: '5555666677',
      currency: 'EUR',
      code: 'EUR',
      swift: 'GTBINGLA'
    }
  }
];

const CONVERSION_RATES: Record<string, number> = {
  'NGN': 1440.00,  // 1 USD = 1440 NGN
  'USD': 1.0,
  'EUR': 0.92
};

export const FlightPaymentPage: React.FC<FlightPaymentPageProps> = ({
  flight,
  passengers = 1,
  flightClass = 'Economy',
  totalAmount = 0,
  onNavigate,
  onCurrencySelect
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState<string>('NGN');
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const [transferConfirmed, setTransferConfirmed] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const selectedCurrencyData = CURRENCIES.find(c => c.code === selectedCurrency);
  const account = selectedCurrencyData?.accountDetails;

  // Calculate converted price from NGN to selected currency
  const getConvertedPrice = (currency: string): number => {
    if (totalAmount === 0) return 0;
    if (currency === 'NGN') return totalAmount;
    // Convert from NGN to USD first, then to target currency
    const priceInUSD = totalAmount / CONVERSION_RATES['NGN'];
    return Math.round(priceInUSD * CONVERSION_RATES[currency] * 100) / 100;
  };

  const displayPrice = getConvertedPrice(selectedCurrency);

  const handleCopyAccount = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(field);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  const handleConfirmTransfer = () => {
    setIsConfirming(true);
    // Simulate payment verification
    setTimeout(() => {
      setTransferConfirmed(true);
      // Update currency in app state
      if (onCurrencySelect) {
        onCurrencySelect(selectedCurrency);
      }
      // Navigate to booking confirmation
      if (onNavigate && flight) {
        onNavigate('booking-confirmation', { 
          flight,
          passengers,
          flightClass: flightClass || 'Economy',
          totalAmount,
          selectedCurrency,
          paymentMethod: 'bank-transfer',
          paymentStatus: 'confirmed'
        });
      }
    }, 2000);
  };

  const handleProceedToBooking = () => {
    if (onCurrencySelect) {
      onCurrencySelect(selectedCurrency);
    }
    if (onNavigate) {
      onNavigate('book-flight', { selectedCurrency });
    }
  };

  return (
    <div className="flight-payment-page">
      {/* Header */}
      <div className="payment-header">
        <h1>Select Payment Currency</h1>
        <p>Choose your preferred currency for flight payment</p>
      </div>

      <div className="payment-container">
        {/* Currency Selection Cards */}
        <div className="currency-selection-section">
          <h2>Available Payment Options</h2>
          <div className="currency-cards-grid">
            {CURRENCIES.map((currency) => {
              const convertedPrice = getConvertedPrice(currency.code);
              return (
                <div
                  key={currency.code}
                  className={`currency-card ${selectedCurrency === currency.code ? 'selected' : ''}`}
                  onClick={() => setSelectedCurrency(currency.code)}
                >
                  <div className="card-header">
                    <span className="currency-icon">{currency.icon}</span>
                    <span className="currency-code">{currency.code}</span>
                  </div>
                  <div className="card-body">
                    <h3>{currency.name}</h3>
                    <p className="currency-symbol">{currency.symbol}</p>
                    <p className="currency-price">{currency.symbol} {convertedPrice.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className="card-footer">
                    {selectedCurrency === currency.code && (
                      <CheckCircle className="check-icon" size={20} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Account Details Section */}
        {account && (
          <div className="account-details-section">
            <h2>Bank Account Details for {selectedCurrencyData?.name}</h2>
            
            <div className="account-card">
              <div className="account-info">
                <div className="info-item">
                  <label>Bank Name</label>
                  <div className="info-content">
                    <span className="info-value">{account.bank}</span>
                    <button
                      className="copy-btn"
                      onClick={() => handleCopyAccount(account.bank, 'bank')}
                      title="Copy bank name"
                    >
                      {copiedAccount === 'bank' ? '✓ Copied' : <Copy size={16} />}
                    </button>
                  </div>
                </div>

                <div className="info-item">
                  <label>Account Name</label>
                  <div className="info-content">
                    <span className="info-value">{account.accountName}</span>
                    <button
                      className="copy-btn"
                      onClick={() => handleCopyAccount(account.accountName, 'name')}
                      title="Copy account name"
                    >
                      {copiedAccount === 'name' ? '✓ Copied' : <Copy size={16} />}
                    </button>
                  </div>
                </div>

                <div className="info-item">
                  <label>Account Number</label>
                  <div className="info-content">
                    <span className="info-value account-number">{account.accountNumber}</span>
                    <button
                      className="copy-btn"
                      onClick={() => handleCopyAccount(account.accountNumber, 'number')}
                      title="Copy account number"
                    >
                      {copiedAccount === 'number' ? '✓ Copied' : <Copy size={16} />}
                    </button>
                  </div>
                </div>

                <div className="info-item">
                  <label>Currency</label>
                  <div className="info-content">
                    <span className="info-value">{account.currency}</span>
                  </div>
                </div>

                {account.swift && (
                  <div className="info-item">
                    <label>SWIFT Code</label>
                    <div className="info-content">
                      <span className="info-value">{account.swift}</span>
                      <button
                        className="copy-btn"
                        onClick={() => handleCopyAccount(account.swift || '', 'swift')}
                        title="Copy SWIFT code"
                      >
                        {copiedAccount === 'swift' ? '✓ Copied' : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {displayPrice > 0 && (
                <div className="payment-amount">
                  <label>Amount to Transfer</label>
                  <div className="amount-display">
                    <span className="symbol">{selectedCurrencyData?.symbol}</span>
                    <span className="amount">{displayPrice.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <p className="amount-note">Use your booking reference as the transfer description</p>
                  {selectedCurrency !== 'NGN' && (
                    <p className="amount-conversion-note">
                      <small>Base Price in NGN: ₦{totalAmount.toLocaleString('en-NG', { minimumFractionDigits: 0 })}</small>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Flight Summary (if available) */}
        {flight && (
          <div className="flight-summary-section">
            <h2>Flight Summary</h2>
            <div className="summary-card">
              <div className="summary-item">
                <span className="label">Route</span>
                <span className="value">{flight.from} → {flight.to}</span>
              </div>
              <div className="summary-item">
                <span className="label">Class</span>
                <span className="value">{flightClass}</span>
              </div>
              <div className="summary-item">
                <span className="label">Passengers</span>
                <span className="value">{passengers}</span>
              </div>
              <div className="summary-item total">
                <span className="label">Total Amount</span>
                <span className="value">
                  {selectedCurrencyData?.symbol} {totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="instructions-section">
          <h2>Payment Instructions</h2>
          <ol className="instructions-list">
            <li>
              <span className="step-number">1</span>
              <div>
                <strong>Select Your Currency</strong>
                <p>You have selected <strong>{selectedCurrencyData?.name}</strong></p>
              </div>
            </li>
            <li>
              <span className="step-number">2</span>
              <div>
                <strong>Copy Bank Details</strong>
                <p>Use the copy buttons above to easily copy the bank account details</p>
              </div>
            </li>
            <li>
              <span className="step-number">3</span>
              <div>
                <strong>Make Transfer</strong>
                <p>Transfer exactly <strong>{selectedCurrencyData?.symbol} {totalAmount.toLocaleString()}</strong> to the account provided</p>
              </div>
            </li>
            <li>
              <span className="step-number">4</span>
              <div>
                <strong>Confirm Payment</strong>
                <p>Click "✓ Confirm Transfer" below to complete your booking</p>
              </div>
            </li>
          </ol>
        </div>

        {/* Payment Status */}
        {transferConfirmed && (
          <div className="payment-status success">
            <div className="status-icon">✓</div>
            <h3>Payment Confirmed!</h3>
            <p>Your flight booking has been confirmed.</p>
            <p className="booking-reference">Processing your booking...</p>
          </div>
        )}

        {/* Action Buttons */}
        {!transferConfirmed && (
          <div className="payment-actions">
            <button
              className="btn-confirm-payment"
              onClick={handleConfirmTransfer}
              disabled={isConfirming}
            >
              <span>{isConfirming ? 'Confirming...' : '✓ Confirm Transfer'}</span>
              {!isConfirming && <ChevronRight size={20} />}
            </button>
            <button
              className="btn-back"
              onClick={() => onNavigate?.('book-flight')}
              disabled={isConfirming}
            >
              Back to Flight Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
