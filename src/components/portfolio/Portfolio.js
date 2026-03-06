// src/components/Portfolio/Portfolio.js
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import './Portfolio.css';
import { FaGithub, FaExternalLinkAlt, FaKey, FaCopy, FaCheck } from 'react-icons/fa';
import { useTranslation, Trans } from 'react-i18next';

import mobisalonThumbnail from '../../assets/thumbnails/mobisalon.jpg';
import ksefThumbnail from '../../assets/thumbnails/ksef-master.jpg';
import ksefThumbnailAng from '../../assets/thumbnails/ksef_master_ang.jpg';
import smartquoteThumbnail from '../../assets/thumbnails/smartquote.jpg';
import smartquoteThumbnailAng from '../../assets/thumbnails/smart_quoute_ang.jpg';
import postlioThumbnail from '../../assets/thumbnails/postlio.jpg';
import postlioThumbnailAng from '../../assets/thumbnails/postlio_ang.jpg';
import cookbookThumbnail from '../../assets/thumbnails/mobile_cook.jpg';
import animalsThumbnail from '../../assets/thumbnails/one_page_animals.jpg';
import shelltyBlogThumbnail from '../../assets/thumbnails/shellty_blog.jpg';
import GlowIcon from '../GlowIcon/GlowIcon';
import portfolioIcon from '../../assets/icons/portfolio/portfolio.png';
import portfolioGlow from '../../assets/icons/portfolio/portfolio_glow.png';

const CopyButton = ({ text, label }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(text);
        } catch {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.cssText = 'position:fixed;opacity:0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [text]);

    return (
        <button
            className={`copy-btn${copied ? ' copied' : ''}`}
            onClick={handleCopy}
            aria-label={label}
            title={label}
            type="button"
        >
            {copied ? <FaCheck /> : <FaCopy />}
        </button>
    );
};

const TestAccountBox = ({ account, t }) => {
    if (!account?.fields?.length) return null;

    return (
        <div className="test-account" role="region" aria-label={t('portfolio.testAccount.title')}>
            <div className="test-account-header">
                <FaKey className="test-account-icon" />
                <span>{t('portfolio.testAccount.title')}</span>
            </div>
            <p className="test-account-note">
                {account.noteKey ? t(account.noteKey) : t('portfolio.testAccount.note')}
            </p>
            <div className="test-account-credentials">
                {account.fields.map(({ labelKey, value }) => (
                    <div className="credential-row" key={labelKey}>
                        <span className="credential-label">
                            {t(`portfolio.testAccount.fields.${labelKey}`)}
                        </span>
                        <code className="credential-value">{value}</code>
                        <CopyButton
                            text={value}
                            label={t(`portfolio.testAccount.copy.${labelKey}`)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

const Portfolio = () => {
    const { t, i18n } = useTranslation();
    const currentLanguage = i18n.language;
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const tm = setTimeout(() => setIsLoading(false), 350);
        return () => clearTimeout(tm);
    }, []);

    const projects = useMemo(() => ([
        {
            id: "postlio",
            image: currentLanguage === 'en' ? postlioThumbnailAng : postlioThumbnail,
            demoLink: 'https://postlio.netlify.app/',
            githubLink: null,
            title: t('portfolio.projects.postlio.title'),
            subtitle: t('portfolio.projects.postlio.subtitle'),
            description: t('portfolio.projects.postlio.description'),
            technologies: t('portfolio.projects.postlio.tech', { returnObjects: true }),
            role: t('portfolio.projects.postlio.role', { defaultValue: 'Developer' }),
            year: '2026',
            caseStudyLink: t('portfolio.projects.postlio.case', { defaultValue: '' }) || null,
            testAccount: {
                fields: [
                    { labelKey: 'login', value: 'test@test.pl' },
                    { labelKey: 'password', value: 'Testowe123!' },
                ],
            },
        },
        {
            id: "smartQuoteAI",
            image: currentLanguage === 'en' ? smartquoteThumbnailAng : smartquoteThumbnail,
            demoLink: 'https://smartquote-ai.netlify.app',
            githubLink: null,
            title: t('portfolio.projects.smartQuoteAI.title'),
            subtitle: t('portfolio.projects.smartQuoteAI.subtitle'),
            description: t('portfolio.projects.smartQuoteAI.description'),
            technologies: t('portfolio.projects.smartQuoteAI.tech', { returnObjects: true }),
            role: t('portfolio.projects.smartQuoteAI.role', { defaultValue: 'WIP' }),
            year: '2026',
            caseStudyLink: t('portfolio.projects.smartQuoteAI.case', { defaultValue: '' }) || null,
            testAccount: {
                fields: [
                    { labelKey: 'login', value: 'testowy@test.pl' },
                    { labelKey: 'password', value: 'Testowe123!' },
                ],
            },
        },
        {
            id: "ksefMaster",
            image: currentLanguage === 'en' ? ksefThumbnailAng : ksefThumbnail,
            demoLink: 'https://ksef-master.netlify.app/',
            githubLink: 'https://github.com/Shellty-IT/KSeF-Master',
            title: t('portfolio.projects.ksefMaster.title'),
            subtitle: t('portfolio.projects.ksefMaster.subtitle'),
            description: t('portfolio.projects.ksefMaster.description'),
            technologies: t('portfolio.projects.ksefMaster.tech', { returnObjects: true }),
            role: t('portfolio.projects.ksefMaster.role', { defaultValue: 'WIP' }),
            year: '2026',
            caseStudyLink: t('portfolio.projects.ksefMaster.case', { defaultValue: '' }) || null,
            testAccount: {
                noteKey: 'portfolio.testAccount.noteKsef',
                fields: [
                    { labelKey: 'nip', value: '6181020505' },
                    { labelKey: 'token', value: '20260128-EC-2BE47EC000-2F20D717BD-7C|nip-6181020505|3692b1e486304d4d9c02a486434b8a143f7547aea0d847e7bf00af38dcae3b8b\n' },
                ],
            },
        },
        {
            id: "shelltyBlog",
            image: shelltyBlogThumbnail,
            demoLink: 'https://shellty-blog.onrender.com',
            githubLink: 'https://github.com/Shellty-IT/Shellty_Blog',
            title: t('portfolio.projects.shelltyBlog.title'),
            subtitle: t('portfolio.projects.shelltyBlog.subtitle'),
            description: t('portfolio.projects.shelltyBlog.description'),
            technologies: t('portfolio.projects.shelltyBlog.tech', { returnObjects: true }),
            role: t('portfolio.projects.shelltyBlog.role', { defaultValue: 'Developer' }),
            year: '2026',
            caseStudyLink: t('portfolio.projects.shelltyBlog.case', { defaultValue: '' }) || null,
            testAccount: {
                fields: [
                    { labelKey: 'login', value: 'admin@shellty.com' },
                    { labelKey: 'password', value: 'Admin123!' },
                ],
            },
        },
        {
            id: "mobiSalon",
            image: mobisalonThumbnail,
            demoLink: 'https://mobisalon.netlify.app/',
            githubLink: 'https://github.com/Shellty-IT/mobi-grooming',
            title: t('portfolio.projects.mobiSalon.title'),
            subtitle: t('portfolio.projects.mobiSalon.subtitle'),
            description: t('portfolio.projects.mobiSalon.description'),
            technologies: t('portfolio.projects.mobiSalon.tech', { returnObjects: true }),
            role: t('portfolio.projects.mobiSalon.role', { defaultValue: 'Developer' }),
            year: '2025',
            caseStudyLink: t('portfolio.projects.mobiSalon.case', { defaultValue: '' }) || null,
        },
        {
            id: "pwaCookbook",
            image: cookbookThumbnail,
            demoLink: 'https://mobilnaksiazkakucharska.netlify.app',
            githubLink: 'https://github.com/shellty-it/Mobilna-ksiazka-kucharska',
            title: t('portfolio.projects.pwaCookbook.title'),
            subtitle: t('portfolio.projects.pwaCookbook.subtitle'),
            description: t('portfolio.projects.pwaCookbook.description'),
            technologies: t('portfolio.projects.pwaCookbook.tech', { returnObjects: true }),
            role: t('portfolio.projects.pwaCookbook.role', { defaultValue: 'Developer' }),
            year: '2021',
            caseStudyLink: t('portfolio.projects.pwaCookbook.case', { defaultValue: '' }) || null,
            testAccount: {
                fields: [
                    { labelKey: 'login', value: 'test@testowy.pl' },
                    { labelKey: 'password', value: 'Testowe123!' },
                ],
            },
        },
        {
            id: "animalsOnePage",
            image: animalsThumbnail,
            demoLink: 'https://zwierzeta.netlify.app/#fourty-page',
            githubLink: 'https://github.com/shellty-it/Strona-typu-One-Page',
            title: t('portfolio.projects.animalsOnePage.title'),
            subtitle: t('portfolio.projects.animalsOnePage.subtitle'),
            description: t('portfolio.projects.animalsOnePage.description'),
            technologies: t('portfolio.projects.animalsOnePage.tech', { returnObjects: true }),
            role: t('portfolio.projects.animalsOnePage.role', { defaultValue: 'Developer' }),
            year: '2018',
            caseStudyLink: t('portfolio.projects.animalsOnePage.case', { defaultValue: '' }) || null,
        }
    ]), [t, currentLanguage]);

    return (
        <div className="portfolio-container" id="portfolio">
            <div className="gradient-background" aria-hidden="true"></div>
            <div className="content-wrapper">
                <header className="portfolio-header animate-fade-in">
                    <GlowIcon
                        src={portfolioIcon}
                        srcGlow={portfolioGlow}
                        alt="Portfolio"
                        size={200}
                        floating
                    />
                    <h1 className="portfolio-title">{t('portfolio.title')}</h1>
                    <p className="portfolio-subtitle">
                        <Trans
                            i18nKey="portfolio.subtitleHtml"
                            components={{
                                link: <a href="https://github.com/shellty-it" target="_blank" rel="noopener noreferrer" aria-label="GitHub" />
                            }}
                        />
                    </p>
                </header>

                <section className="projects-grid" aria-live="polite">
                    {isLoading ? (
                        <>
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="project-card skeleton" aria-hidden="true">
                                    <div className="project-image-wrapper"><div className="skeleton-box"></div></div>
                                    <div className="project-content">
                                        <div className="skeleton-line w-60" />
                                        <div className="skeleton-line w-40" />
                                        <div className="skeleton-line w-90" />
                                        <div className="skeleton-line w-70" />
                                        <div className="skeleton-badges" />
                                    </div>
                                </div>
                            ))}
                        </>
                    ) : (
                        projects.map((project, index) => (
                            <article
                                key={project.id}
                                className={`project-card animate-slide-up delay-${index + 1}`}
                                itemScope
                                itemType="https://schema.org/CreativeWork"
                            >
                                {project.image && (
                                    <div className="project-image-wrapper">
                                        <img
                                            src={project.image}
                                            alt={project.title}
                                            className="project-image"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                        <div className="image-overlay">
                                            {project.demoLink && (
                                                <a
                                                    href={project.demoLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="overlay-cta"
                                                    aria-label={`${t('portfolio.actions.demo')} — ${project.title}`}
                                                >
                                                    <FaExternalLinkAlt /> {t('portfolio.actions.demo')}
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="project-content">
                                    <header className="project-header">
                                        <h3 className="project-heading" itemProp="name">{project.title}</h3>
                                        <div className="project-meta">
                                            {project.subtitle && <span className="project-subtitle" itemProp="about">{project.subtitle}</span>}
                                            {project.year && (
                                                <span className="project-chipset">
                                                    <span className="chip">{project.year}</span>
                                                </span>
                                            )}
                                        </div>
                                    </header>

                                    <p className="project-description" itemProp="description">
                                        {project.description.split('\n').map((line, i) => (
                                            <React.Fragment key={i}>
                                                {line}
                                                {i < project.description.split('\n').length - 1 && <br />}
                                            </React.Fragment>
                                        ))}
                                    </p>

                                    <div className="project-tech-stack" aria-label={t('portfolio.tech.aria', { defaultValue: 'Technologie' })}>
                                        {project.technologies?.map((tech) => (
                                            <span key={tech} className="tech-badge">{tech}</span>
                                        ))}
                                    </div>

                                    <div className="project-bottom">
                                        <TestAccountBox account={project.testAccount} t={t} />
                                        <div className="project-links">
                                            {project.demoLink && (
                                                <a href={project.demoLink} target="_blank" rel="noopener noreferrer" className="project-link">
                                                    <FaExternalLinkAlt /> {t('portfolio.actions.demo')}
                                                </a>
                                            )}
                                            {project.githubLink && (
                                                <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="project-link">
                                                    <FaGithub /> {t('portfolio.actions.code')}
                                                </a>
                                            )}
                                            {project.caseStudyLink && (
                                                <a href={project.caseStudyLink} target="_blank" rel="noopener noreferrer" className="project-link subtle">
                                                    {t('portfolio.actions.case', { defaultValue: 'Case study' })}
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))
                    )}
                </section>
            </div>
        </div>
    );
};

export default Portfolio;