import React from 'react';

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
      "Your Quick Chart (at signup)",
      "Weekly horoscope (personalized)",
      "5 Quick actions/mo — any mix of Quick Charts (guests) or Quick Matches (relationships/celebs)",
      "No chat. Upgrade for daily/monthly, Reports, and chat.",
    ],
    cta: "Get Started",
  },
  {
    id: "premium",
    name: "Premium",
    price: "20",
    suffix: "/mo",
    badge: "Most Popular",
    description: "Full access to personalized insights.",
    features: [
      "Your Natal Report included",
      "Daily + Weekly + Monthly horoscopes",
      "2 Reports/mo — Natal or Compatibility (roll for 3 months)",
      "10 Quick actions/mo — Quick Charts or Quick Matches",
      "Unlimited AI chat (fair use): Transit Chat + Chart Chat (for anyone with a Natal Report) + Relationship Chat (for any pair with a Compatibility Report)",
    ],
    cta: "Get My Reading",
    highlight: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: "49",
    suffix: "/mo",
    description: "For coaches & power users.",
    features: [
      "Everything in Premium",
      "10 Complete readings/mo (rolls 3 months)",
      "Higher chat cap + Unlimited Quick Charts & Scores",
    ],
    cta: "Upgrade",
  },
  {
    id: "alaChart",
    name: "Birth Chart Reading",
    price: "20",
    suffix: "one‑time",
    description: "Complete natal analysis with lifetime access.",
    features: [
      "Keep forever",
      "Non-members get a 30-day Chat Boost for that entity",
      "Premium includes ongoing chat",
    ],
    cta: "Purchase",
  },
  {
    id: "alaRel",
    name: "Relationship Analysis",
    price: "10",
    suffix: "one‑time",
    description: "Synastry & composite insights for any relationship.",
    features: [
      "Keep forever",
      "Non-members get a 30-day Chat Boost for that entity",
      "Premium includes ongoing chat",
    ],
    cta: "Purchase",
  },
];

export default function PricingTable() {
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
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, opacity 0.2s ease',
                  backdropFilter: 'blur(10px)'
                }}
              >
                {plan.cta}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =============================
   UX Flow Notes (inline comments)
   =============================
 1. Users encounter Quick Compatibility Score (Free).
 2. On score reveal, show a motion.div modal "Unlock full analysis for $10".
 3. After purchase, auto‑scroll to this pricing table with Base & Pro plans highlighted (cross‑sell).
 4. Inside chat interface, if user exceeds 1‑hr quota → inline banner "Upgrade to Transit Vision Chat ($10/mo)".
*/
