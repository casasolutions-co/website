import React from "react";
import Link from "next/link";
import { MapPin, Phone, Mail, Award } from "lucide-react";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Company Info */}
        <div className={styles.section}>
          <h4 className={styles.heading}>CASA Solutions</h4>
          <p className={styles.text}>
            <MapPin size={16} className={styles.icon} />
            Hallstraße 1a<br />
            92318 Neumarkt in der Oberpfalz, Germany
          </p>
          <p className={styles.text}>
            <Phone size={16} className={styles.icon} />
            +49 179 1449246
          </p>
          <p className={styles.text}>
            <Mail size={16} className={styles.icon} />
            info@casasolutions.co
          </p>
        </div>

        {/* For Students */}
        <div className={styles.section}>
          <h4 className={styles.heading}>For Students</h4>
          <ul className={styles.list}>
            <li><Link href="/referral" className={styles.link}>Refer and Earn</Link></li>
            <li><Link href="/ambassador" className={styles.link}>Become an Ambassador</Link></li>
            <li><Link href="/solutions#success" className={styles.link}>Success Stories</Link></li>
            <li><Link href="/careers" className={styles.link}>Careers</Link></li>
          </ul>
        </div>

        {/* For Companies */}
        <div className={styles.section}>
          <h4 className={styles.heading}>For Partners</h4>
          <ul className={styles.list}>
            <li><Link href="/become-agent" className={styles.link}>Become an Agent</Link></li>
            <li><Link href="/partner" className={styles.link}>Partner with Us</Link></li>
          </ul>
        </div>

        {/* Legal Links */}
        <div className={styles.section}>
          <h4 className={styles.heading}>Legal</h4>
          <ul className={styles.list}>
            <li><Link href="/imprint" className={styles.link}>Imprint</Link></li>
            <li><Link href="/privacy-policy" className={styles.link}>Privacy Policy</Link></li>
          </ul>
        </div>

        {/* Social & Trust */}
        <div className={styles.section}>
          <h4 className={styles.heading}>Follow Us</h4>
          <div className={styles.socials}>
            <a href="https://www.linkedin.com/company/casasolutions/" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="LinkedIn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
            <a href="https://instagram.com/casasolutions.de" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Instagram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a href="http://www.youtube.com/@casa.solutions" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="YouTube">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
              </svg>
            </a>
          </div>
          
          <div className={styles.trustBadge}>
            <div className={styles.badgeWrapper}>
              <Award size={20} className={styles.badgeIcon} />
              <span>ICEF Accredited Agent</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <p className={styles.copyright}>&copy; {new Date().getFullYear()} CASA Solutions. All rights reserved.</p>
      </div>
    </footer>
  );
}
