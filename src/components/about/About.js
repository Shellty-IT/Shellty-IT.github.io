// src/components/About/About.js
import React, { useState, useEffect, useCallback } from "react";
import { HashLink } from "react-router-hash-link";
import "./About.css";
import {
    FaMapMarkerAlt,
    FaBriefcase,
    FaLanguage,
    FaEnvelope,
    FaGithub,
    FaLinkedin,
    FaGraduationCap,
} from "react-icons/fa";
import { useTranslation, Trans } from "react-i18next";
import GlowIcon from "../GlowIcon/GlowIcon";
import aboutIcon from "../../assets/icons/about/about.png";
import aboutGlow from "../../assets/icons/about/about_glow.png";

const RING_SIZE = 88;
const RING_STROKE = 10;

const SkillRing = ({ label, value, color }) => {
    const r = (RING_SIZE - RING_STROKE) / 2;
    const cx = RING_SIZE / 2;
    const cy = RING_SIZE / 2;
    const circ = 2 * Math.PI * r;
    const dash = (value / 100) * circ;

    return (
        <div className="skillring" aria-label={`${label} ${value}%`}>
            <svg
                className="skillring__svg"
                width={RING_SIZE}
                height={RING_SIZE}
                viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
            >
                <circle
                    cx={cx}
                    cy={cy}
                    r={r}
                    stroke="rgba(255,255,255,.12)"
                    strokeWidth={RING_STROKE}
                    fill="none"
                />
                <circle
                    cx={cx}
                    cy={cy}
                    r={r}
                    stroke={color}
                    strokeWidth={RING_STROKE}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${dash} ${circ - dash}`}
                    transform={`rotate(-90 ${cx} ${cy})`}
                />
            </svg>
            <div className="skillring__label">
                <span className="skillring__name">{label}</span>
                <span className="skillring__val">{value}%</span>
            </div>
        </div>
    );
};

const VideoCard = ({ vimeoId, t }) => {
    const [playing, setPlaying] = useState(false);
    const [thumbError, setThumbError] = useState(false);

    useEffect(() => {
        setPlaying(false);
        setThumbError(false);
    }, [vimeoId]);

    return (
        <div className="about__video-card animate-fade-in">
            <h3 className="about__video-title">{t("about.video.title")}</h3>
            <div className="about__video-wrapper">
                {!playing ? (
                    <button
                        className="about__video-play"
                        onClick={() => setPlaying(true)}
                        aria-label={t("about.video.playAria")}
                    >
                        {!thumbError && (
                            <img
                                src={`https://vumbnail.com/${vimeoId}.jpg`}
                                alt=""
                                className="about__video-thumb"
                                loading="lazy"
                                onError={() => setThumbError(true)}
                            />
                        )}
                        <span className="about__video-play-icon" aria-hidden="true">
                            <svg
                                viewBox="0 0 68 48"
                                width="68"
                                height="48"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55C3.97 2.33 2.27 4.81 1.48 7.74.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.63-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z"
                                    fill="rgba(12,192,255,.85)"
                                />
                                <path d="M45 24L27 14v20" fill="#fff" />
                            </svg>
                        </span>
                    </button>
                ) : (
                    <iframe
                        src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=0&byline=0&portrait=0`}
                        title={t("about.video.iframeTitle")}
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        className="about__video-iframe"
                    />
                )}
            </div>
        </div>
    );
};

const About = () => {
    const { t } = useTranslation();
    const vimeoId = t("about.video.vimeoId");

    return (
        <section id="about" className="about">
            <span className="about__blob about__blob--a" />
            <span className="about__blob about__blob--b" />

            <div className="about__container">
                <header className="about__header animate-fade-in">
                    <GlowIcon
                        src={aboutIcon}
                        srcGlow={aboutGlow}
                        alt="About"
                        size={220}
                        floating
                    />
                    <h2 className="about__title">{t("about.title")}</h2>
                </header>

                <div className="about__grid">
                    <div className="about__text animate-slide-up">
                        <p>
                            <Trans i18nKey="about.p1" components={{ strong: <strong /> }} />
                        </p>

                        <p className="about__video-invite">
                            🎬&ensp;{t("about.videoInvite")}
                            <span className="about__video-dir--desktop">
                                {t("about.videoInviteDirDesktop")}
                            </span>
                            <span className="about__video-dir--mobile">
                                {t("about.videoInviteDirMobile")}
                            </span>
                        </p>

                        <p className="about__subhead">
                            <strong>{t("about.approachTitle")}</strong>
                        </p>
                        <p>
                            <Trans i18nKey="about.approachIntro" />
                        </p>

                        <ul className="about__bullets">
                            <li>
                                <Trans i18nKey="about.points.design" components={{ strong: <strong /> }} />
                            </li>
                            <li>
                                <Trans i18nKey="about.points.deploy" components={{ strong: <strong /> }} />
                            </li>
                            <li>
                                <Trans i18nKey="about.points.support" components={{ strong: <strong /> }} />
                            </li>
                        </ul>

                        <p className="about__subhead">
                            <strong>{t("about.growthTitle")}</strong>
                        </p>
                        <p>
                            <Trans i18nKey="about.growth" />
                        </p>

                        <p className="about__subhead">
                            <strong>{t("about.goalTitle")}</strong>
                        </p>
                        <p>
                            <Trans i18nKey="about.goal" />
                        </p>

                        <div className="about__actions">
                            <HashLink smooth to="/experience#experience" className="btn btn--primary">
                                {t("about.ctaExperience")}
                            </HashLink>
                            <HashLink smooth to="/contact#contact" className="btn btn--outline">
                                {t("about.ctaContact")}
                            </HashLink>
                        </div>

                        <div className="about__social">
                            <a href="mailto:crispy.it.office@gmail.com" aria-label={t("about.social.emailAria")} target="_blank" rel="noopener noreferrer">
                                <FaEnvelope />
                            </a>
                            <a href="https://github.com/shellty-IT" aria-label={t("about.social.githubAria")} target="_blank" rel="noopener noreferrer">
                                <FaGithub />
                            </a>
                            <a href="https://www.linkedin.com/in/tomasz-skorupski-a078ba389" aria-label={t("about.social.linkedinAria")} target="_blank" rel="noopener noreferrer">
                                <FaLinkedin />
                            </a>
                        </div>
                    </div>

                    <div className="about__sidebar">
                        <VideoCard vimeoId={vimeoId} t={t} />

                        <aside className="about__card animate-fade-in delay-1s">
                            <div className="about__fact">
                                <FaMapMarkerAlt />
                                <div>
                                    <h4>{t("about.facts.locationTitle")}</h4>
                                    <p>{t("about.facts.locationValue")}</p>
                                </div>
                            </div>
                            <div className="about__fact">
                                <FaBriefcase />
                                <div>
                                    <h4>{t("about.facts.statusTitle")}</h4>
                                    <p>{t("about.facts.statusValue")}</p>
                                </div>
                            </div>
                            <div className="about__fact">
                                <FaLanguage />
                                <div>
                                    <h4>{t("about.facts.languagesTitle")}</h4>
                                    <p>{t("about.facts.languagesValue")}</p>
                                </div>
                            </div>
                            <div className="about__fact">
                                <FaGraduationCap />
                                <div>
                                    <h4>{t("about.facts.educationTitle")}</h4>
                                    <p>
                                        <a
                                            href={t("about.facts.educationUrl")}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {t("about.facts.educationValue")}
                                        </a>
                                    </p>
                                </div>
                            </div>
                            <div>
                                <h4>{t("about.facts.certsTitle")}</h4>
                                <ul className="certs-list">
                                    <li>
                                        <a href={t("about.facts.cert1Url")} target="_blank" rel="noopener noreferrer">
                                            {t("about.facts.cert1Name")}
                                        </a>
                                    </li>
                                    <li>
                                        <a href={t("about.facts.cert2Url")} target="_blank" rel="noopener noreferrer">
                                            {t("about.facts.cert2Name")}
                                        </a>
                                    </li>
                                    <li>
                                        <a href={t("about.facts.cert3Url")} target="_blank" rel="noopener noreferrer">
                                            {t("about.facts.cert3Name")}
                                        </a>
                                    </li>
                                    <li>
                                        <a href={t("about.facts.cert4Url")} target="_blank" rel="noopener noreferrer">
                                            {t("about.facts.cert4Name")}
                                        </a>
                                    </li>
                                    <li>
                                        <a href={t("about.facts.cert5Url")} target="_blank" rel="noopener noreferrer">
                                            {t("about.facts.cert5Name")}
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div className="about__rings-block">
                                <div className="about__rings-grid">
                                    <SkillRing label={t("about.soft.pass")} value={95} color="#9b5cff" />
                                    <SkillRing label={t("about.soft.account")} value={90} color="#3aa2ff" />
                                    <SkillRing label={t("about.soft.team")} value={80} color="#ffb640" />
                                    <SkillRing label={t("about.soft.creativity")} value={74} color="#31d287" />
                                    <SkillRing label={t("about.soft.flex")} value={90} color="#22e1d9" />
                                    <SkillRing label={t("about.soft.lead")} value={60} color="#ff6f7d" />
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;