// src/components/Experience/Experience.js
import React from "react";
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
import GlowIcon from "../GlowIcon/GlowIcon";
import experienceIcon from "../../assets/icons/experience/experience2.png";
import experienceGlow from "../../assets/icons/experience/experience_glow.png";

const Experience = () => {
    const { t } = useTranslation();

    return (
        <section id="experience" className="exp">
            <div className="exp__container">
                <header className="exp__header">
                    <GlowIcon
                        src={experienceIcon}
                        srcGlow={experienceGlow}
                        alt="Experience"
                        size={240}
                        floating
                    />
                    <h2 className="exp__title">{t("experience.title")}</h2>
                </header>

                <ol className="exp__timeline">
                    <li className="exp__item">
                        <div className="exp__pin" aria-hidden="true" />
                        <div className="exp__card">
                            <div className="exp__top">
                                <div className="exp__where">
                                    <FaBuilding /> {t("experience.jobs.streetcom.where")}
                                </div>
                                <div className="exp__meta">
                                    <span className="exp__meta-item"><FaCalendarAlt /> {t("experience.jobs.streetcom.date")}</span>
                                    <span className="exp__meta-item"><FaMapMarkerAlt /> {t("experience.jobs.streetcom.loc")}</span>
                                </div>
                            </div>
                            <ul className="exp__bullets">
                                <li>{t("experience.jobs.streetcom.bullets.0")}</li>
                                <li>{t("experience.jobs.streetcom.bullets.1")}</li>
                                <li>{t("experience.jobs.streetcom.bullets.2")}</li>
                                <li>{t("experience.jobs.streetcom.bullets.3")}</li>
                            </ul>
                            <div className="exp__tags">
                                <span className="tag"><FaServer /> {t("experience.jobs.streetcom.tags.servers")}</span>
                                <span className="tag"><FaNetworkWired /> {t("experience.jobs.streetcom.tags.net")}</span>
                                <span className="tag"><FaDatabase /> {t("experience.jobs.streetcom.tags.db")}</span>
                                <span className="tag"><FaCode /> {t("experience.jobs.streetcom.tags.tools")}</span>
                            </div>
                        </div>
                    </li>

                    <li className="exp__item">
                        <div className="exp__pin" aria-hidden="true" />
                        <div className="exp__card">
                            <div className="exp__top">
                                <div className="exp__where">
                                    <FaBuilding /> {t("experience.jobs.ata.where")}
                                </div>
                                <div className="exp__meta">
                                    <span className="exp__meta-item"><FaCalendarAlt /> {t("experience.jobs.ata.date")}</span>
                                    <span className="exp__meta-item"><FaMapMarkerAlt /> {t("experience.jobs.ata.loc")}</span>
                                </div>
                            </div>
                            <ul className="exp__bullets">
                                <li>{t("experience.jobs.ata.bullets.0")}</li>
                                <li>{t("experience.jobs.ata.bullets.1")}</li>
                                <li>{t("experience.jobs.ata.bullets.2")}</li>
                                <li>{t("experience.jobs.ata.bullets.3")}</li>
                            </ul>
                            <div className="exp__tags">
                                <span className="tag"><FaPrint /> {t("experience.jobs.ata.tags.print")}</span>
                                <span className="tag"><FaNetworkWired /> {t("experience.jobs.ata.tags.net")}</span>
                                <span className="tag"><FaCogs /> {t("experience.jobs.ata.tags.mon")}</span>
                            </div>
                        </div>
                    </li>

                    <li className="exp__item">
                        <div className="exp__pin" aria-hidden="true" />
                        <div className="exp__card">
                            <div className="exp__top">
                                <div className="exp__where">
                                    <FaBuilding /> {t("experience.jobs.hisert.where")}
                                </div>
                                <div className="exp__meta">
                                    <span className="exp__meta-item"><FaCalendarAlt /> {t("experience.jobs.hisert.date")}</span>
                                    <span className="exp__meta-item"><FaMapMarkerAlt /> {t("experience.jobs.hisert.loc")}</span>
                                </div>
                            </div>
                            <ul className="exp__bullets">
                                <li>{t("experience.jobs.hisert.bullets.0")}</li>
                                <li>{t("experience.jobs.hisert.bullets.1")}</li>
                                <li>{t("experience.jobs.hisert.bullets.2")}</li>
                                <li>{t("experience.jobs.hisert.bullets.3")}</li>
                            </ul>
                            <div className="exp__tags">
                                <span className="tag"><FaServer /> {t("experience.jobs.hisert.tags.servers")}</span>
                                <span className="tag"><FaNetworkWired /> {t("experience.jobs.hisert.tags.net")}</span>
                                <span className="tag"><FaDatabase /> {t("experience.jobs.hisert.tags.backup")}</span>
                            </div>
                        </div>
                    </li>

                    <li className="exp__item">
                        <div className="exp__pin" aria-hidden="true" />
                        <div className="exp__card">
                            <div className="exp__top">
                                <div className="exp__where">
                                    <FaBuilding /> {t("experience.jobs.rzgw.where")}
                                </div>
                                <div className="exp__meta">
                                    <span className="exp__meta-item"><FaCalendarAlt /> {t("experience.jobs.rzgw.date")}</span>
                                    <span className="exp__meta-item"><FaMapMarkerAlt /> {t("experience.jobs.rzgw.loc")}</span>
                                </div>
                            </div>
                            <ul className="exp__bullets">
                                <li>{t("experience.jobs.rzgw.bullets.0")}</li>
                                <li>{t("experience.jobs.rzgw.bullets.1")}</li>
                                <li>{t("experience.jobs.rzgw.bullets.2")}</li>
                                <li>{t("experience.jobs.rzgw.bullets.3")}</li>
                            </ul>
                            <div className="exp__tags">
                                <span className="tag"><FaNetworkWired /> {t("experience.jobs.rzgw.tags.net")}</span>
                                <span className="tag"><FaServer /> {t("experience.jobs.rzgw.tags.win")}</span>
                            </div>
                        </div>
                    </li>

                    <li className="exp__item">
                        <div className="exp__pin" aria-hidden="true" />
                        <div className="exp__card">
                            <div className="exp__top">
                                <div className="exp__where">
                                    <FaBuilding /> {t("experience.jobs.exorigo.where")}
                                </div>
                                <div className="exp__meta">
                                    <span className="exp__meta-item"><FaCalendarAlt /> {t("experience.jobs.exorigo.date")}</span>
                                    <span className="exp__meta-item"><FaMapMarkerAlt /> {t("experience.jobs.exorigo.loc")}</span>
                                </div>
                            </div>
                            <ul className="exp__bullets">
                                <li>{t("experience.jobs.exorigo.bullets.0")}</li>
                                <li>{t("experience.jobs.exorigo.bullets.1")}</li>
                                <li>{t("experience.jobs.exorigo.bullets.2")}</li>
                            </ul>
                            <div className="exp__tags">
                                <span className="tag"><FaCogs /> {t("experience.jobs.exorigo.tags.pos")}</span>
                                <span className="tag"><FaNetworkWired /> {t("experience.jobs.exorigo.tags.cfg")}</span>
                            </div>
                        </div>
                    </li>

                    <li className="exp__item">
                        <div className="exp__pin" aria-hidden="true" />
                        <div className="exp__card">
                            <div className="exp__top">
                                <div className="exp__where">
                                    <FaBuilding /> {t("experience.jobs.wasko.where")}
                                </div>
                                <div className="exp__meta">
                                    <span className="exp__meta-item"><FaCalendarAlt /> {t("experience.jobs.wasko.date")}</span>
                                    <span className="exp__meta-item"><FaMapMarkerAlt /> {t("experience.jobs.wasko.loc")}</span>
                                </div>
                            </div>
                            <ul className="exp__bullets">
                                <li>{t("experience.jobs.wasko.bullets.0")}</li>
                                <li>{t("experience.jobs.wasko.bullets.1")}</li>
                                <li>{t("experience.jobs.wasko.bullets.2")}</li>
                            </ul>
                        </div>
                    </li>

                    <li className="exp__item">
                        <div className="exp__pin" aria-hidden="true" />
                        <div className="exp__card">
                            <div className="exp__top">
                                <div className="exp__where">
                                    <FaBuilding /> {t("experience.jobs.eot.where")}
                                </div>
                                <div className="exp__meta">
                                    <span className="exp__meta-item"><FaCalendarAlt /> {t("experience.jobs.eot.date")}</span>
                                    <span className="exp__meta-item"><FaMapMarkerAlt /> {t("experience.jobs.eot.loc")}</span>
                                </div>
                            </div>
                            <ul className="exp__bullets">
                                <li>{t("experience.jobs.eot.bullets.0")}</li>
                                <li>{t("experience.jobs.eot.bullets.1")}</li>
                                <li>{t("experience.jobs.eot.bullets.2")}</li>
                            </ul>
                        </div>
                    </li>
                </ol>
            </div>
        </section>
    );
};

export default Experience;