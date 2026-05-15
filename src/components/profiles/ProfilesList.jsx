import React, { useState, useEffect } from 'react';
import { UserCircle, ChevronDown, ChevronUp, Search, X } from 'lucide-react';
import { rolesService } from '../../services/rolesService';
import { profilesService } from '../../services/profilesService';
import ProfilePanel from './ProfilePanel';
import styles from './Profiles.module.css';

const ProfilesList = () => {
    const [profiles, setProfiles] = useState([]);
    const [allRoles, setAllRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [profs, roles] = await Promise.all([
                profilesService.getAllProfilesSummary(),
                rolesService.getRoles(),
            ]);
            setProfiles(profs);
            setAllRoles(roles);
        } catch (err) {
            console.error('Erro ao carregar dados:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggle = (id) => setExpandedId(prev => prev === id ? null : id);

    // Filtro global: nome, email, papéis, habilidades, job description
    const filtered = profiles.filter(r => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        if (r.name?.toLowerCase().includes(q)) return true;
        if (r.email?.toLowerCase().includes(q)) return true;
        if (r.job_description?.toLowerCase().includes(q)) return true;
        if (r.roles?.some(role => role.name?.toLowerCase().includes(q))) return true;
        if (r.skillTexts?.some(s => s.toLowerCase().includes(q))) return true;
        return false;
    });

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
            <p style={{ color: 'var(--text-secondary)' }}>Carregando...</p>
        </div>
    );

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Perfis dos Responsáveis</h1>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    {filtered.length} de {profiles.length} responsável{profiles.length !== 1 ? 'is' : ''}
                </span>
            </div>

            {/* Barra de busca global */}
            <div className={styles.searchBar}>
                <Search size={18} className={styles.searchIcon} />
                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Buscar por nome, papel, habilidade ou job description..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                {search && (
                    <button className={styles.searchClear} onClick={() => setSearch('')} title="Limpar busca">
                        <X size={16} />
                    </button>
                )}
            </div>

            {profiles.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--text-secondary)' }}>
                    <UserCircle size={48} color="var(--border-color)" style={{ marginBottom: 12 }} />
                    <p>Nenhum responsável ativo encontrado.</p>
                    <span style={{ fontSize: 14 }}>Cadastre responsáveis no menu "Responsáveis".</span>
                </div>
            ) : filtered.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--text-secondary)' }}>
                    <Search size={40} color="var(--border-color)" style={{ marginBottom: 12 }} />
                    <p style={{ margin: 0, fontWeight: 500 }}>Nenhum resultado para "{search}"</p>
                    <span style={{ fontSize: 14, marginTop: 4, display: 'block' }}>Tente buscar por nome, papel, habilidade ou trecho da descrição.</span>
                </div>
            ) : (
                <div className={styles.accordionList}>
                    {filtered.map(r => (
                        <div key={r.id} className={styles.accordionItem}>
                            <button className={styles.accordionHeader} onClick={() => toggle(r.id)}>
                                <div className={styles.accordionInfo}>
                                    <div className={styles.accordionAvatar}>
                                        {r.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <span className={styles.accordionName}>{r.name}</span>
                                        {r.email && <span className={styles.accordionEmail}>{r.email}</span>}
                                        {r.roles.length > 0 && (
                                            <div className={styles.accordionRoles}>
                                                {r.roles.map(role => (
                                                    <span key={role.id} className={styles.accordionRoleBadge}>{role.name}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span className={styles.expandHint}>
                                        {expandedId === r.id ? 'Fechar' : 'Editar perfil'}
                                    </span>
                                    {expandedId === r.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                </div>
                            </button>
                            {expandedId === r.id && (
                                <ProfilePanel
                                    responsible={r}
                                    allRoles={allRoles}
                                    onClose={() => setExpandedId(null)}
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProfilesList;
