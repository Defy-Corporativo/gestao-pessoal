import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Users, Menu, ChevronLeft, UserCog, Briefcase, UserCircle } from 'lucide-react';
import styles from './Layout.module.css';

const Sidebar = ({ isCollapsed, onToggle }) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <>
            {!isCollapsed && <div className={styles.sidebarOverlay} onClick={onToggle} />}
            <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
                <div className={styles.sidebarHeader}>
                    {isCollapsed ? (
                        <button
                            className={styles.toggleBtn}
                            onClick={onToggle}
                            title="Abrir menu"
                        >
                            <Menu size={20} />
                        </button>
                    ) : (
                        <>
                            <div className={styles.appBrand}>
                                <div className={styles.appIcon}>
                                    <UserCog size={22} />
                                </div>
                                <div className={styles.appBrandText}>
                                    <span className={styles.appName}>Gestão</span>
                                    <span className={styles.appTagline}>Pessoal</span>
                                </div>
                            </div>
                            <button
                                className={styles.toggleBtnLight}
                                onClick={onToggle}
                                title="Recolher menu"
                            >
                                <ChevronLeft size={18} />
                            </button>
                        </>
                    )}
                </div>
                <nav className={styles.nav}>
                    <NavLink
                        to="/"
                        className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
                        end
                        title="Responsáveis"
                        onClick={() => { window.innerWidth < 768 && onToggle(); }}
                    >
                        <Users size={20} />
                        {!isCollapsed && <span>Responsáveis</span>}
                    </NavLink>
                    <NavLink
                        to="/papeis"
                        className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
                        title="Papéis"
                        onClick={() => { window.innerWidth < 768 && onToggle(); }}
                    >
                        <Briefcase size={20} />
                        {!isCollapsed && <span>Papéis</span>}
                    </NavLink>
                    <NavLink
                        to="/perfis"
                        className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
                        title="Perfis"
                        onClick={() => { window.innerWidth < 768 && onToggle(); }}
                    >
                        <UserCircle size={20} />
                        {!isCollapsed && <span>Perfis</span>}
                    </NavLink>
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;
