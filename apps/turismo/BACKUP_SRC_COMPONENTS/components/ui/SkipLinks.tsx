import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccessibility } from '../../hooks/useAccessibility';

export default function SkipLinks() {
  const { skipToContent, skipToNavigation, announce } = useAccessibility();

  const skipLinks = [
    {
      id: 'skip-to-content',
      label: 'Pular para o conteúdo principal',
      action: skipToContent,
      shortcut: 'Alt + 0'
    },
    {
      id: 'skip-to-navigation',
      label: 'Pular para a navegação',
      action: skipToNavigation,
      shortcut: 'Alt + 1'
    }
  ];

  return (
    <div className="skip-links">
      {skipLinks.map((link) => (
        <motion.a
          key={link.id}
          href={`#${link.id}`}
          className="skip-link"
          onClick={(e) => {
            e.preventDefault();
            link.action();
          }}
          onFocus={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.opacity = '1';
          }}
          onBlur={(e) => {
            e.currentTarget.style.transform = 'translateY(-100%)';
            e.currentTarget.style.opacity = '0';
          }}
          initial={{ y: -100, opacity: 0 }}
          whileFocus={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <span className="skip-link-text">{link.label}</span>
          <span className="skip-link-shortcut">({link.shortcut})</span>
        </motion.a>
      ))}
      
      <style jsx>{`
        .skip-links {
          position: fixed;
          top: 0;
          left: 0;
          z-index: 9999;
          width: 100%;
        }

        .skip-link {
          position: absolute;
          top: 0;
          left: 0;
          background: #000;
          color: #fff;
          padding: 12px 16px;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          border-radius: 0 0 8px 0;
          transform: translateY(-100%);
          opacity: 0;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          max-width: 400px;
        }

        .skip-link:focus {
          transform: translateY(0);
          opacity: 1;
          outline: 2px solid #fff;
          outline-offset: 2px;
        }

        .skip-link-text {
          flex: 1;
        }

        .skip-link-shortcut {
          font-size: 12px;
          opacity: 0.8;
          font-family: monospace;
        }

        .skip-link:hover {
          background: #333;
        }

        /* High contrast mode */
        :global(.high-contrast) .skip-link {
          background: #000;
          color: #fff;
          border: 2px solid #fff;
        }

        :global(.high-contrast) .skip-link:focus {
          background: #fff;
          color: #000;
          border: 2px solid #000;
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .skip-link {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}
