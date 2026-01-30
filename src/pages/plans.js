import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCheckout } from '../hooks/useCheckout';

/**
 * Simple helper for list bullets.
 */
const Feature = ({ children }) => (
  <li style={{
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    marginBottom: '8px',
    color: 'white'
  }}>
    <span style={{
      color: '#22c55e',
      fontSize: '16px',
      marginTop: '2px'
    }}>✓</span>
    <span>{children}</span>
  </li>
);

const plans = [
  {
    id: "free",
    name: "Free",
    price: "0",
    suffix: "",
    description: "Dip your toes in the stars — no credit card required.",
    features: [
      "Weekly & Monthly horoscopes",
      "Unlimited birth chart creation & overviews",
      "Unlimited relationship creation & scores",
      "No credit card required",
    ],
    cta: "Get Started Free",
  },
  {
    id: "plus",
    name: "Plus",
    price: "20",
    suffix: "/mo",
    badge: "Most Popular",
    description: "Everything in Free, plus:",
    features: [
      "Your complete Birth Chart 360° Analysis — generated on signup",
      "Daily personalized horoscope",
      "3 deep readings per month (birth chart or relationship)",
      "50 Ask Stellium AI questions per month",
      "40% off additional readings",
    ],
    cta: "Start Plus",
    highlight: true,
  },
  {
    id: "alaCarte",
    name: "Individual Readings",
    price: "",
    suffix: "",
    description: "Available to all users. Plus members save 40%.",
    features: [
      "Birth Chart 360° — Free: $20 • Plus: $12",
      "Relationship 360° — Free: $10 • Plus: $6",
      "Question Pack (10) — $10 for 10",
    ],
    cta: "See Options",
  },
];

export default function PricingTable() {
  const navigate = useNavigate();
  const { stelliumUser } = useAuth();
  const checkout = useCheckout(stelliumUser, () => {
    // Refresh after successful purchase
    window.location.reload();
  });

  const handlePlanClick = (planId) => {
    if (planId === 'free') {
      navigate('/birthChartEntry');
    } else if (planId === 'plus') {
      if (stelliumUser) {
        checkout.startSubscription();
      } else {
        navigate('/birthChartEntry?intent=plus');
      }
    } else if (planId === 'alaCarte') {
      // Scroll to individual readings or navigate to dashboard
      if (stelliumUser) {
        navigate(`/dashboard/${stelliumUser._id}`);
      } else {
        navigate('/birthChartEntry');
      }
    }
  };

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '40px 20px',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{
          fontSize: '48px',
          fontWeight: 'bold',
          color: 'white',
          marginBottom: '16px',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          Pick Your Cosmic Path
        </h1>
        <p style={{
          fontSize: '18px',
          color: 'rgba(255,255,255,0.9)',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          Unlock deeper self‑knowledge and relationship insight with the plan that
          matches your journey.
        </p>
        {checkout.error && (
          <p style={{
            marginTop: '16px',
            padding: '12px 20px',
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            borderRadius: '8px',
            color: '#fca5a5',
            fontSize: '14px'
          }}>
            {checkout.error}
          </p>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '24px',
        alignItems: 'start'
      }}>
        {plans.map((plan) => (
          <div
            key={plan.id}
            style={{
              background: plan.highlight
                ? 'linear-gradient(145deg, rgba(139, 92, 246, 0.15), rgba(139, 92, 246, 0.05))'
                : 'rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '24px',
              border: plan.highlight
                ? '2px solid rgba(139, 92, 246, 0.5)'
                : '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              boxShadow: plan.highlight
                ? '0 8px 32px rgba(139, 92, 246, 0.3)'
                : '0 4px 16px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, opacity 0.2s ease',
              cursor: 'pointer'
            }}
          >
            {plan.badge && (
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginBottom: '16px'
              }}>
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'rgba(139, 92, 246, 0.2)',
                  color: '#a78bfa',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  border: '1px solid rgba(139, 92, 246, 0.3)'
                }}>
                  ⭐ {plan.badge}
                </span>
              </div>
            )}

            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '16px'
              }}>
                {plan.name}
              </h2>
              <div style={{ marginBottom: '16px' }}>
                <span style={{
                  fontSize: '48px',
                  fontWeight: 'bold',
                  color: plan.price === "0" ? '#22c55e' : 'white'
                }}>
                  {plan.price === "0" ? "Free" : `$${plan.price}`}
                </span>
                <span style={{
                  fontSize: '16px',
                  color: 'rgba(255,255,255,0.7)',
                  marginLeft: '4px'
                }}>
                  {plan.suffix}
                </span>
              </div>
              <p style={{
                color: 'rgba(255,255,255,0.8)',
                lineHeight: '1.5'
              }}>
                {plan.description}
              </p>
            </div>

            <div style={{ flex: 1 }}>
              <ul style={{
                marginBottom: '24px',
                padding: 0,
                listStyle: 'none'
              }}>
                {plan.features.map((feature, idx) => (
                  <Feature key={idx}>{feature}</Feature>
                ))}
              </ul>

              <button
                onClick={() => handlePlanClick(plan.id)}
                disabled={checkout.isLoading}
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  background: plan.highlight
                    ? 'linear-gradient(135deg, #8b5cf6, #a78bfa)'
                    : 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  border: plan.highlight
                    ? 'none'
                    : '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: checkout.isLoading ? 'wait' : 'pointer',
                  transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, opacity 0.2s ease',
                  backdropFilter: 'blur(10px)',
                  opacity: checkout.isLoading ? 0.7 : 1
                }}
              >
                {checkout.isLoading && plan.id === 'plus' ? 'Loading...' : plan.cta}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
