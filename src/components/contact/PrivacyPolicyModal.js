// src/components/contact/PrivacyPolicyModal.js
import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import "./PrivacyPolicyModal.css";

export default function PrivacyPolicyModal({ onClose }) {
    const { t } = useTranslation();
    const overlayRef = useRef(null);
    const modalRef = useRef(null);

    useEffect(() => {
        const previouslyFocused = document.activeElement;
        modalRef.current?.focus();

        const handleKeyDown = (e) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
            previouslyFocused?.focus();
        };
    }, [onClose]);

    const handleOverlayClick = (e) => {
        if (e.target === overlayRef.current) onClose();
    };

    const pp = t("privacyPolicy", { returnObjects: true });

    return (
        <div
            className="pp-overlay"
            ref={overlayRef}
            onClick={handleOverlayClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="pp-title"
        >
            <div
                className="pp-modal"
                ref={modalRef}
                tabIndex={-1}
            >
                <div className="pp-modal__header">
                    <h2 id="pp-title" className="pp-modal__title">{pp.title}</h2>
                    <p className="pp-modal__updated">{pp.updated}</p>
                    <button
                        className="pp-modal__close"
                        onClick={onClose}
                        aria-label={pp.closeAria}
                    >
                        ✕
                    </button>
                </div>

                <div className="pp-modal__body">

                    {/* 1. Administrator */}
                    <section className="pp-section">
                        <h3 className="pp-section__title">{pp.s1.title}</h3>
                        <p>{pp.s1.p1}</p>
                        <p>
                            {pp.s1.contactLabel}{" "}
                            <a href="mailto:shellty@zohomail.eu" className="pp-link">
                                shellty@zohomail.eu
                            </a>
                        </p>
                    </section>

                    {/* 2. Jakie dane */}
                    <section className="pp-section">
                        <h3 className="pp-section__title">{pp.s2.title}</h3>
                        <p>{pp.s2.intro}</p>
                        <ul className="pp-list">
                            {pp.s2.items.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>
                        <p>{pp.s2.purpose}</p>
                    </section>

                    {/* 3. Podstawa prawna */}
                    <section className="pp-section">
                        <h3 className="pp-section__title">{pp.s3.title}</h3>
                        <p>{pp.s3.p}</p>
                    </section>

                    {/* 4. Jak długo */}
                    <section className="pp-section">
                        <h3 className="pp-section__title">{pp.s4.title}</h3>
                        <p>{pp.s4.p}</p>
                    </section>

                    {/* 5. Formspree */}
                    <section className="pp-section">
                        <h3 className="pp-section__title">{pp.s5.title}</h3>
                        <p>{pp.s5.p1}</p>
                        <p>{pp.s5.p2}</p>
                        <p>
                            {pp.s5.linkLabel}{" "}
                            <a
                                href="https://formspree.io/legal/privacy-policy"
                                className="pp-link"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                formspree.io/legal/privacy-policy
                            </a>
                        </p>
                        <p>{pp.s5.p3}</p>
                    </section>

                    {/* 6. Cookies */}
                    <section className="pp-section">
                        <h3 className="pp-section__title">{pp.s6.title}</h3>
                        <ul className="pp-list">
                            <li>
                                {pp.s6.ga}{" "}
                                <a
                                    href="https://policies.google.com/privacy"
                                    className="pp-link"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    policies.google.com/privacy
                                </a>
                                .
                            </li>
                        </ul>
                    </section>

                    {/* 7. Prawa */}
                    <section className="pp-section">
                        <h3 className="pp-section__title">{pp.s7.title}</h3>
                        <p>{pp.s7.intro}</p>
                        <ul className="pp-list">
                            {pp.s7.rights.map((right, i) => (
                                <li key={i}>{right}</li>
                            ))}
                        </ul>
                        <p>
                            {pp.s7.contact}{" "}
                            <a href="mailto:shellty@zohomail.eu" className="pp-link">
                                shellty@zohomail.eu
                            </a>
                        </p>
                    </section>

                </div>

                <div className="pp-modal__footer">
                    <button className="pp-modal__close-btn" onClick={onClose}>
                        {pp.closeBtn}
                    </button>
                </div>
            </div>
        </div>
    );
}
