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
    description: "Explore your chart and sample features.",
    features: [
      "Weekly & Monthly horoscopes",
      "Unlimited chart & relationship creation",
      "10 credits per month",
      "Buy credits anytime",
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
    description: "Daily guidance + monthly credits.",
    features: [
      "Daily, Weekly & Monthly horoscopes",
      "Everything in Free",
      "200 credits per month",
      "Best value for ongoing insight",
    ],
    cta: "Start Plus",
    highlight: true,
  },
  {
    id: "creditPack",
    name: "Credit Pack",
    price: "10",
    suffix: "",
    description: "One-time credits. No subscription.",
    features: [
      "100 credits",
      "Never expire",
      "Use for any analysis or question",
    ],
    cta: "Buy Credits",
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
    } else if (planId === 'creditPack') {
      if (stelliumUser) {
        checkout.purchaseCreditPack();
      } else {
        navigate('/birthChartEntry?intent=creditPack');
      }
    }
  };

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '40px 20px',
      minHeight: '100vh',
      background: '#1a1b2e'
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
          fontSize: '16px',
          color: 'rgba(255,255,255,0.85)',
          maxWidth: '600px',
          margin: '0 auto 16px',
          lineHeight: '1.6'
        }}>
          All users use credits for in-depth analyses.<br />
          Free and Plus determine how much guidance you get by default — and how many credits you receive each month.
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
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        alignItems: 'stretch'
      }}>
        {plans.map((plan) => (
          <div
            key={plan.id}
            style={{
              background: plan.highlight
                ? 'linear-gradient(145deg, rgba(167, 139, 250, 0.15), rgba(167, 139, 250, 0.05))'
                : '#2a2d4a',
              borderRadius: '16px',
              padding: '24px',
              border: plan.highlight
                ? '2px solid rgba(167, 139, 250, 0.5)'
                : '1px solid #3d3f5f',
              boxShadow: plan.highlight
                ? '0 8px 32px rgba(167, 139, 250, 0.2)'
                : '0 4px 16px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, opacity 0.2s ease',
              cursor: 'pointer'
            }}
          >
            {/* Badge area - fixed height for alignment */}
            <div style={{
              height: '32px',
              display: 'flex',
              justifyContent: 'flex-end',
              marginBottom: '8px'
            }}>
              {plan.badge && (
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
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  height: 'fit-content'
                }}>
                  {plan.badge}
                </span>
              )}
            </div>

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

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <ul style={{
                marginBottom: '24px',
                padding: 0,
                listStyle: 'none',
                flex: 1
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
                    ? '#a78bfa'
                    : '#353852',
                  color: plan.highlight ? '#1a1b2e' : 'white',
                  border: plan.highlight
                    ? 'none'
                    : '1px solid #3d3f5f',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: checkout.isLoading ? 'wait' : 'pointer',
                  transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, opacity 0.2s ease',
                  backdropFilter: 'blur(10px)',
                  opacity: checkout.isLoading ? 0.7 : 1,
                  marginTop: 'auto'
                }}
              >
                {checkout.isLoading && (plan.id === 'plus' || plan.id === 'creditPack') ? 'Loading...' : plan.cta}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Horoscope Access Comparison */}
      <div style={{
        marginTop: '48px',
        background: '#2a2d4a',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '500px',
        margin: '48px auto 0',
        border: '1px solid #3d3f5f'
      }}>
        <h3 style={{
          color: 'white',
          fontSize: '18px',
          fontWeight: 'bold',
          marginBottom: '16px',
          textAlign: 'center'
        }}>
          Horoscope Access
        </h3>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          color: 'white'
        }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #3d3f5f' }}></th>
              <th style={{ textAlign: 'center', padding: '8px 12px', borderBottom: '1px solid #3d3f5f', fontSize: '14px' }}>Free</th>
              <th style={{ textAlign: 'center', padding: '8px 12px', borderBottom: '1px solid #3d3f5f', fontSize: '14px', color: '#a78bfa' }}>Plus</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '8px 12px', fontSize: '14px' }}>Daily Horoscope</td>
              <td style={{ textAlign: 'center', padding: '8px 12px', color: 'rgba(255,255,255,0.4)' }}>—</td>
              <td style={{ textAlign: 'center', padding: '8px 12px', color: '#22c55e' }}>✓</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 12px', fontSize: '14px' }}>Weekly Horoscope</td>
              <td style={{ textAlign: 'center', padding: '8px 12px', color: '#22c55e' }}>✓</td>
              <td style={{ textAlign: 'center', padding: '8px 12px', color: '#22c55e' }}>✓</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 12px', fontSize: '14px' }}>Monthly Horoscope</td>
              <td style={{ textAlign: 'center', padding: '8px 12px', color: '#22c55e' }}>✓</td>
              <td style={{ textAlign: 'center', padding: '8px 12px', color: '#22c55e' }}>✓</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* How Credits Work */}
      <div style={{
        marginTop: '48px',
        background: '#2a2d4a',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '400px',
        margin: '48px auto 0',
        border: '1px solid #3d3f5f'
      }}>
        <h3 style={{
          color: 'white',
          fontSize: '18px',
          fontWeight: 'bold',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          How Credits Work
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'white', fontSize: '14px' }}>Full Birth Chart Analysis</span>
            <span style={{ color: '#a78bfa', fontSize: '14px', fontWeight: '600' }}>75 credits</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'white', fontSize: '14px' }}>Relationship Analysis</span>
            <span style={{ color: '#a78bfa', fontSize: '14px', fontWeight: '600' }}>60 credits</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'white', fontSize: '14px' }}>Ask Stellium (1 question)</span>
            <span style={{ color: '#a78bfa', fontSize: '14px', fontWeight: '600' }}>1 credit</span>
          </div>
        </div>
      </div>
    </div>
  );
}
