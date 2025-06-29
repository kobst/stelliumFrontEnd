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
      "Browse celebrity charts",
      "Unlimited Quick Compatibility Scores",
    ],
    cta: "Get Started",
  },
  {
    id: "base",
    name: "Base Plan",
    price: "20",
    suffix: "/mo",
    badge: "Most Popular",
    description: "Daily guidance + deep insights into your own chart.",
    features: [
      "Daily / Weekly / Monthly Horoscopes",
      "Transit Vision Chat for *your* chart",
      "1 Full Birth Chart Reading (or credit)",
      "1 Celebrity Compatibility Analysis / mo",
    ],
    cta: "Start Free Month",
    highlight: true,
  },
  {
    id: "alaChart",
    name: "Birth Chart Reading",
    price: "20",
    suffix: "one‑time",
    description: "Detailed natal analysis + 1‑hr Insight Chat.",
    features: [
      "Lifetime access to your reading",
      "1‑hr Insight Chat Q&A",
      "Includes 1‑month Base Plan trial",
    ],
    cta: "Purchase",
  },
  {
    id: "alaRel",
    name: "Relationship Analysis",
    price: "10",
    suffix: "each",
    description: "Synastry + composite report between two charts.",
    features: [
      "Full compatibility report",
      "1‑hr Insight Chat Q&A",
      "Upgrade to Transit Vision for +$10/mo",
    ],
    cta: "Purchase",
  },
  {
    id: "pro",
    name: "Pro",
    price: "100",
    suffix: "/mo",
    description: "For coaches & astro pros managing many clients.",
    features: [
      "Up to 10 charts / relationships",
      "Transit Vision Chat for each",
      "Priority support",
    ],
    cta: "Upgrade",
  },
  {
    id: "max",
    name: "Pro Max",
    price: "200",
    suffix: "/mo",
    description: "For studios & power users — unlimited guidance.",
    features: [
      "Up to 30 charts / relationships",
      "Transit Vision Chat for each",
      "White‑glove onboarding",
    ],
    cta: "Upgrade",
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
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = plan.highlight 
                ? '0 12px 40px rgba(139, 92, 246, 0.4)' 
                : '0 8px 24px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = plan.highlight 
                ? '0 8px 32px rgba(139, 92, 246, 0.3)' 
                : '0 4px 16px rgba(0, 0, 0, 0.1)';
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
                  transition: 'all 0.2s ease',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
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
