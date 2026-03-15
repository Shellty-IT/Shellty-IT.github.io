import React, { useState } from "react";
import "./Experience.css";
import {
    FaBuilding,
    FaCalendarAlt,
    FaMapMarkerAlt,
    FaServer,
    FaNetworkWired,
    FaDatabase,
    FaPrint,
    FaCode,
    FaCogs,
} from "react-icons/fa";
import { useTranslation } from "react-i18next";
import GlowIcon from "../glowIcon/GlowIcon";
import experienceIcon from "../../assets/icons/experience/experience.webp";
import experienceGlow from "../../assets/icons/experience/experience_glow.webp";

const TAG_ICONS = {
    servers: FaServer,
    net: FaNetworkWired,
    db: FaDatabase,
    tools: FaCode,
    print: FaPrint,
    mon: FaCogs,
    backup: FaDatabase,
    win: FaServer,
    pos: FaCogs,
    cfg: FaNetworkWired,
};

const JOBS = [
    { key: "streetcom", bulletCount: 4, tags: ["servers", "net", "db", "tools"] },
    { key: "ata", bulletCount: 4, tags: ["print", "net", "mon"] },
    { key: "hisert", bulletCount: 4, tags: ["servers", "net", "backup"] },
    { key: "rzgw", bulletCount: 4, tags: ["net", "win"] },
    { key: "exorigo", bulletCount: 3, tags: ["pos", "cfg"] },
    { key: "wasko", bulletCount: 3, tags: [] },
    { key: "eot", bulletCount: 3, tags: [] },
];

const Experience = () => {
    const { t: rawT } = useTranslation();
    const [titleHovered, setTitleHovered] = useState(false);

    /** @type {function(string): string} */
    const t = rawT;

    return (
        <section id="experience" className="exp">
            <div className="exp__container">
                <header className="exp__header">
                    <div
                        className="exp__header-hover-area"
                        onMouseEnter={() => setTitleHovered(true)}
                        onMouseLeave={() => setTitleHovered(false)}
                    >
                        <GlowIcon
                            src={experienceIcon}
                            srcGlow={experienceGlow}
                            alt="Experience"
                            size={240}
                            floating
                            className={titleHovered ? "hovered" : ""}
                        />
                        <h2 className={`exp__title ${titleHovered ? "hovered" : ""}`}>
                            {t("experience.title")}
                        </h2>
                    </div>
                </header>

                <ol className="exp__timeline">
                    {JOBS.map(({ key, bulletCount, tags }) => (
                        <li key={key} className="exp__item">
                            <div className="exp__pin" aria-hidden="true" />
                            <div className="exp__card">
                                <div className="exp__top">
                                    <div className="exp__where">
                                        <FaBuilding /> {t(`experience.jobs.${key}.where`)}
                                    </div>
                                    <div className="exp__meta">
                    <span className="exp__meta-item">
                      <FaCalendarAlt /> {t(`experience.jobs.${key}.date`)}
                    </span>
                                        <span className="exp__meta-item">
                      <FaMapMarkerAlt /> {t(`experience.jobs.${key}.loc`)}
                    </span>
                                    </div>
                                </div>

                                <ul className="exp__bullets">
                                    {Array.from({ length: bulletCount }, (_, i) => (
                                        <li key={i}>
                                            {t(`experience.jobs.${key}.bullets.${i}`)}
                                        </li>
                                    ))}
                                </ul>

                                {tags.length > 0 && (
                                    <div className="exp__tags">
                                        {tags.map((tag) => {
                                            const Icon = TAG_ICONS[tag];
                                            return (
                                                <span key={tag} className="tag">
                          <Icon /> {t(`experience.jobs.${key}.tags.${tag}`)}
                        </span>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
};

export default Experience;