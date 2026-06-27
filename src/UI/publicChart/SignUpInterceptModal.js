import React, { useEffect, useRef } from 'react';

/**
 * Sign-up intercept modal for the logged-out celebrity chart.
 * Instead of hard-redirecting to /login, it captures the moment of curiosity:
 * an example question, a real-but-locked answer, and the credits explained in context.
 */
function SignUpInterceptModal({
  open,
  onClose,
  celebrityName,
  exampleQuestion,
  exampleAnswer,
  onCreateAccount,
  onSignIn
}) {
  const closeRef = useRef(null);
  const firstName = (celebrityName || '').trim().split(/\s+/)[0] || 'this';

  useEffect(() => {
    if (!open) return undefined;

    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Move focus into the dialog for keyboard/screen-reader users.
    closeRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  return (
    <div
      className={`pcc pcc-scrim${open ? ' open' : ''}`}
      aria-hidden={open ? undefined : 'true'}
      onClick={onClose}
    >
      <div
        className="pcc-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`Create a free account to ask Stellium about ${celebrityName || 'this chart'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pcc-modal__thread" aria-hidden="true" />
        <button type="button" className="pcc-modal__close" aria-label="Close" onClick={onClose} ref={closeRef}>
          ✕
        </button>

        <div className="pcc-modal__body">
          <div className="pcc-modal__eyebrow">
            <span className="sp" aria-hidden="true">&#10022;</span> Ask Stellium
          </div>
          <h2>
            One question away from <span className="italic">reading {firstName} like a person.</span>
          </h2>

          <div className="pcc-chat">
            <div className="pcc-chat__q">{exampleQuestion}</div>
            <div className="pcc-chat__a-wrap">
              <div className="pcc-chat__a">
                <span className="pcc-chat__locked">{exampleAnswer}</span>
              </div>
              <span className="pcc-chat__lock">🔒 Create a free account to read the full answer</span>
            </div>
          </div>

          <div className="pcc-modal__input" aria-disabled="true">
            <svg className="lock-i" width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <rect x="3" y="7" width="10" height="7" rx="1.5" />
              <path d="M5 7V5a3 3 0 0 1 6 0v2" />
            </svg>
            <span className="ph">Ask anything about {firstName}'s chart…</span>
            <span className="send" aria-hidden="true">→</span>
          </div>

          <div className="pcc-modal__props">
            <span className="pcc-modal__prop"><span className="ck" aria-hidden="true">&#10022;</span> <b>25 free credits</b> on sign-up</span>
            <span className="pcc-modal__prop"><span className="ck" aria-hidden="true">✓</span> No credit card</span>
            <span className="pcc-modal__prop"><span className="ck" aria-hidden="true">✓</span> Spend them on any chart</span>
          </div>

          <button type="button" className="pcc-modal__cta" onClick={onCreateAccount}>
            Create your free account →
          </button>
          <div className="pcc-modal__signin">
            Already have an account? <button type="button" onClick={onSignIn}>Sign in</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUpInterceptModal;
