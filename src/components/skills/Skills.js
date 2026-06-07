// src/components/skills/Skills.js
import React, { useState, memo } from "react";
import "./Skills.css";
import {
    FaWindows,
    FaLinux,
    FaNetworkWired,
    FaDatabase,
    FaCloud,
    FaHtml5,
    FaCss3,
    FaAmazon
} from "react-icons/fa";
import {
    SiDocker,
    SiReact,
    SiJavascript,
    SiMysql,
    SiPostgresql,
    SiGit,
    SiGithubactions,
    SiJira,
    SiFirebase,
    SiGooglecloud,
    SiPhp,
    SiNextdotjs,
    SiAngular,
    SiTailwindcss,
    SiNodedotjs,
    SiTypescript,
    SiPython,
    SiDotnet,
    SiAnsible
} from "react-icons/si";
import { TbBrandAzure, TbApi } from "react-icons/tb";
import { FaMobileAlt } from "react-icons/fa";
import { MdSecurity } from "react-icons/md";
import { useTranslation } from "react-i18next";
import { useIconPhase } from "../../hooks/useIconPhase";

import skillsIcon from "../../assets/icons/skills/skills.webp";
import skillsGlow from "../../assets/icons/skills/skills_glow.webp";

const ICON_NODES = [
    { id: 0, x: "20%", y: "12%" },
    { id: 1, x: "80%", y: "12%" },
    { id: 2, x: "10%", y: "42%" },
    { id: 3, x: "50%", y: "35%" },
    { id: 4, x: "90%", y: "42%" },
    { id: 5, x: "25%", y: "72%" },
    { id: 6, x: "50%", y: "88%" },
    { id: 7, x: "75%", y: "72%" },
    { id: 8, x: "50%", y: "55%" },
];

// ─── Konfiguracja umiejętności ────────────────────────────────────────────────
// Edytuj tę tablicę, aby dodać/usunąć/zmienić technologie.
// portfolioLink – opcjonalny link do projektu w portfolio (href do sekcji lub URL)
const SKILLS_CONFIG = {
    core: [
        { name: "Administracja systemami i sieciami", Icon: FaNetworkWired },
        { name: "Windows Server (AD, GPO)", Icon: FaWindows },
        { name: "React", Icon: SiReact },
        { name: "JavaScript", Icon: SiJavascript },
        { name: "REST API", Icon: TbApi },
        { name: "SQL", Icon: FaDatabase },
        { name: "HTML5 / CSS3", Icon: FaHtml5, twinIcon: FaCss3 },
        { name: "Git / GitHub", Icon: SiGit },
        { name: "Jira", Icon: SiJira },
    ],
    solid: [
        { name: "C# / .NET", Icon: SiDotnet },
        { name: "TypeScript", Icon: SiTypescript },
        { name: "Docker", Icon: SiDocker },
        { name: "CI/CD (GitHub Actions)", Icon: SiGithubactions },
        { name: "PostgreSQL", Icon: SiPostgresql },
        { name: "MySQL", Icon: SiMysql },
        { name: "Linux / Bash", Icon: FaLinux },
        { name: "PWA", Icon: FaMobileAlt },
        { name: "Bezpieczeństwo aplikacji", Icon: MdSecurity },
        { name: "Node.js", Icon: SiNodedotjs },
        { name: "Next.js", Icon: SiNextdotjs },
        { name: "Python", Icon: SiPython },
        { name: "PHP", Icon: SiPhp },
    ],
    growing: [
        { name: "Ansible (IaC)", Icon: SiAnsible },
        { name: "Chmura (AWS/Azure/GCP/Oracle)", Icon: FaCloud, suffixIcons: [FaAmazon, TbBrandAzure, SiGooglecloud] },
        { name: "Firebase", Icon: SiFirebase },
        { name: "Angular", Icon: SiAngular },
        { name: "Tailwind CSS", Icon: SiTailwindcss },
    ],
};

// ─── Komponent karty umiejętności (poziomy core i solid) ─────────────────────
const SkillCard = memo(function SkillCard({ name, Icon, twinIcon: Twin, suffixIcons }) {
    return (
        <div className="sk-item glass">
            <div className="sk-head">
                <div className="sk-icons">
                    <Icon className="sk-icon" />
                    {Twin && <Twin className="sk-icon sk-icon--twin" />}
                    {suffixIcons && suffixIcons.map((S, i) => <S key={i} className="sk-icon sk-icon--mini" />)}
                </div>
                <div className="sk-title">{name}</div>
            </div>
        </div>
    );
});

// ─── Komponent tagu (poziom "Aktywnie rozwijam") ──────────────────────────────
const GrowingTag = memo(function GrowingTag({ name, Icon, suffixIcons }) {
    return (
        <span className="sk-tag">
            <Icon className="sk-tag__icon" />
            {suffixIcons && suffixIcons.map((S, i) => <S key={i} className="sk-tag__icon sk-tag__icon--mini" />)}
            <span className="sk-tag__name">{name}</span>
        </span>
    );
});

// ─── Główny komponent ─────────────────────────────────────────────────────────
const Skills = () => {
    const { t } = useTranslation();
    const [titleHovered, setTitleHovered] = useState(false);
    const { iconRef, iconPhase } = useIconPhase('sk-icon-wrap--pulse');

    return (
        <section id="skills" className="skills">
            <div className="skills__container">
                <header className="skills__header">
                    <div
                        ref={iconRef}
                        className={`sk-icon-wrap sk-icon-wrap--${iconPhase}`}
                    >
                        <div className="sk-icon-wrap__nodes" aria-hidden="true">
                            {ICON_NODES.map((n) => (
                                <span
                                    key={n.id}
                                    className="sk-icon-wrap__node"
                                    style={{ left: n.x, top: n.y }}
                                />
                            ))}
                        </div>
                        <img
                            src={skillsIcon}
                            alt=""
                            aria-hidden="true"
                            className="sk-icon-wrap__img sk-icon-wrap__img--base"
                            draggable="false"
                            width="200"
                            height="200"
                        />
                        <img
                            src={skillsGlow}
                            alt=""
                            aria-hidden="true"
                            className="sk-icon-wrap__img sk-icon-wrap__img--lit"
                            draggable="false"
                            width="200"
                            height="200"
                        />
                    </div>

                    <div
                        className="skills__header-hover-area"
                        onMouseEnter={() => setTitleHovered(true)}
                        onMouseLeave={() => setTitleHovered(false)}
                    >
                        <h2 className={`skills__title ${titleHovered ? 'hovered' : ''}`}>
                            {t("skills.title")}
                        </h2>
                    </div>
                </header>

                {/* Poziom 1: Kluczowe kompetencje */}
                <section className="sk-group">
                    <h3 className="sk-group__title">{t("skills.groups.core")}</h3>
                    <div className="sk-grid">
                        {SKILLS_CONFIG.core.map((s) => (
                            <SkillCard key={s.name} {...s} />
                        ))}
                    </div>
                </section>

                {/* Poziom 2: Solidna znajomość */}
                <section className="sk-group">
                    <h3 className="sk-group__title">{t("skills.groups.solid")}</h3>
                    <div className="sk-grid">
                        {SKILLS_CONFIG.solid.map((s) => (
                            <SkillCard key={s.name} {...s} />
                        ))}
                    </div>
                </section>

                {/* Poziom 3: Aktywnie rozwijam – chmura tagów */}
                <section className="sk-group">
                    <h3 className="sk-group__title">{t("skills.groups.growing")}</h3>
                    <div className="sk-tag-cloud">
                        {SKILLS_CONFIG.growing.map((s) => (
                            <GrowingTag key={s.name} {...s} />
                        ))}
                    </div>
                </section>
            </div>
        </section>
    );
};

export default Skills;
