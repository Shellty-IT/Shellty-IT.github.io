import React, { useState, useEffect, useRef } from "react";
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

import experienceIcon from "../../assets/icons/experience/test.webp";
import experienceGlow from "../../assets/icons/experience/test_glow.webp";

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

const NODE_POINTS = [
    { id: 0, x: "20%", y: "20%" },
    { id: 1, x: "50%", y: "10%" },
    { id: 2, x: "80%", y: "20%" },
    { id: 3, x: "10%", y: "50%" },
    { id: 4, x: "50%", y: "50%" },
    { id: 5, x: "90%", y: "50%" },
    { id: 6, x: "20%", y: "80%" },
    { id: 7, x: "50%", y: "90%" },
    { id: 8, x: "80%", y: "80%" },
];

const Experience = () => {
    const { t: rawT } = useTranslation();
    const [titleHovered, setTitleHovered] = useState(false);
    const [iconPhase, setIconPhase] = useState("hidden");
    const iconRef = useRef(null);
    const pulseTimer = useRef(null);

    const t = rawT;

    useEffect(() => {
        const el = iconRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && iconPhase === "hidden") {
                    setIconPhase("nodes");
                }
            },
            { threshold: 0.25 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [iconPhase]);

    useEffect(() => {
        if (iconPhase !== "nodes") return;
        const t1 = setTimeout(() => setIconPhase("forming"), 1000);
        return () => clearTimeout(t1);
    }, [iconPhase]);

    useEffect(() => {
        if (iconPhase !== "forming") return;
        const t2 = setTimeout(() => setIconPhase("visible"), 1200);
        return () => clearTimeout(t2);
    }, [iconPhase]);

    useEffect(() => {
        if (iconPhase !== "visible") return;

        const t3 = setTimeout(() => {
            iconRef.current?.classList.add("exp-icon--pulse");
            setTimeout(() => {
                iconRef.current?.classList.remove("exp-icon--pulse");
            }, 1600);
        }, 600);

        return () => clearTimeout(t3);
    }, [iconPhase]);

    useEffect(() => {
        if (iconPhase !== "visible") return;

        const schedule = () => {
            const delay = 6000 + Math.random() * 2000;
            pulseTimer.current = setTimeout(() => {
                iconRef.current?.classList.add("exp-icon--pulse");
                setTimeout(() => {
                    iconRef.current?.classList.remove("exp-icon--pulse");
                }, 1600);
                schedule();
            }, delay);
        };

        const initial = setTimeout(schedule, 3000);

        return () => {
            clearTimeout(initial);
            clearTimeout(pulseTimer.current);
        };
    }, [iconPhase]);

    return (
        <section id="experience" className="exp">
            <div className="exp__container">
                <header className="exp__header">
                    <div
                        ref={iconRef}
                        className={`exp-icon exp-icon--${iconPhase}`}
                    >
                        <div className="exp-icon__nodes" aria-hidden="true">
                            {NODE_POINTS.map((n) => (
                                <span
                                    key={n.id}
                                    className="exp-icon__node"
                                    style={{ left: n.x, top: n.y }}
                                />
                            ))}
                        </div>
                        <img
                            src={experienceIcon}
                            alt=""
                            aria-hidden="true"
                            className="exp-icon__img exp-icon__img--base"
                            draggable="false"
                        />
                        <img
                            src={experienceGlow}
                            alt=""
                            aria-hidden="true"
                            className="exp-icon__img exp-icon__img--lit"
                            draggable="false"
                        />
                    </div>

                    <div
                        className="exp__header-hover-area"
                        onMouseEnter={() => setTitleHovered(true)}
                        onMouseLeave={() => setTitleHovered(false)}
                    >
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