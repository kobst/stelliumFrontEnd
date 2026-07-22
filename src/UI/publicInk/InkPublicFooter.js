import React from 'react';
import { Link } from 'react-router-dom';
import './InkPublicFooter.css';

function InkPublicFooter() {
  return (
    <footer className="public-ink-footer">
      <div className="ink-wrap public-ink-footer__inner">
        <div className="public-ink-footer__colophon">
          <Link className="public-ink-footer__wordmark" to="/">
            Stellium <span aria-hidden="true">✳</span>
          </Link>
          <p>Personal astrology, drawn from the real sky and read with care.</p>
        </div>

        <nav className="public-ink-footer__links" aria-label="Footer navigation">
          <Link to="/celebrities">Celebrity charts</Link>
          <Link to="/celebrity-relationships">Celebrity relationships</Link>
          <Link to="/privacy-policy">Privacy</Link>
          <Link to="/terms-of-service">Terms</Link>
        </nav>

        <p className="public-ink-footer__signoff">
          © {new Date().getFullYear()} Stellium · Made under a generous sky.
        </p>
      </div>
    </footer>
  );
}

export default InkPublicFooter;
