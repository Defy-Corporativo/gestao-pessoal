import React, { useState, useEffect } from 'react';
import { UserCircle, ChevronDown, ChevronUp, Plus, Trash2, Check, X, Edit2, Save } from 'lucide-react';
import { responsiblesService } from '../../services/responsiblesService';
import { rolesService } from '../../services/rolesService';
import { profilesService } from '../../services/profilesService';
import styles from './Profiles.module.css';

// ─── Subcomponente: painel de perfil expandido ──────────────────────────────
const ProfilePanel = ({ responsible, allRoles, onClose }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Job description
    const [jobDesc, setJobDesc] = useState('');
    const [editingJob, setEditingJob] = useState(false);

    // Papéis selecionados
    const [selectedRoleIds, setSelectedRoleIds] = useState([]);
    const [savingRoles, setSavingRoles] = useState(false);

    // Habilidades
    const [skills, setSkills] = useState([]);
    const [newSkill, setNewSkill] = useState('');
    const [editingSkillId, setEditingSkillId] = useState(null);
    const [editingSkillText, setEditingSkillText] = useState('');
    const [addingSkill, setAddingSkill] = useState(false);

    useEffect(() => { load(); }, [responsible.id]);

    const load = async () => {
        try {
            setLoading(true);
            const data = await profilesService.getProfile(responsible.id);
            setProfile(data);
            setJobDesc(data.job_description || '');
            setSelectedRoleIds(data.roles.map(r => r.id));
            setSkills(data.skills);
        } catch (err) {
            console.error('Erro ao carregar perfil:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveJobDesc = async () => {
        try {
            setSaving(true);
            await profilesService.saveJobDescription(responsible.id, jobDesc);
            setEditingJob(false);
        } catch (err) {
            alert('Erro ao salvar descrição.');
        } finally {
            setSaving(false);
        }
    };

    const toggleRole = (roleId) => {
        setSelectedRoleIds(prev =>
            prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]
        );
    };

    const handleSaveRoles = async () => {
        try {
            setSavingRoles(true);
            await profilesService.setRoles(responsible.id, selectedRoleIds);
        } catch (err) {
            alert('Erro ao salvar papéis.');
        } finally {
            setSavingRoles(false);
        }
    };

    const handleAddSkill = async (e) => {
        e.preventDefault();
        if (!newSkill.trim()) return;
        try {
            setAddingSkill(true);
            const created = await profilesService.addSkill(responsible.id, newSkill, skills.length);
            setSkills(prev => [...prev, created]);
            setNewSkill('');
        } catch (err) {
            alert('Erro ao adicionar habilidade.');
        } finally {
            setAddingSkill(false);
        }
    };

    const handleUpdateSkill = async (id) => {
        if (!editingSkillText.trim()) return;
        try {
            const updated = await profilesService.updateSkill(id, editingSkillText);
            setSkills(prev => prev.map(s => s.id === id ? updated : s));
            setEditingSkillId(null);
        } catch (err) {
            alert('Erro ao atualizar habilidade.');
        }
    };

    const handleDeleteSkill = async (id) => {
        try {
            await profilesService.deleteSkill(id);
            setSkills(prev => prev.filter(s => s.id !== id));
        } catch (err) {
            alert('Erro ao excluir habilidade.');
        }
    };

    if (loading) return (
        <div className={styles.panelLoading}>Carregando perfil...</div>
    );

    return (
        <div className={styles.panel}>
            {/* ── PAPÉIS ── */}
            <div className={styles.section}>
                <h4 className={styles.sectionTitle}>Papéis</h4>
                {allRoles.length === 0 ? (
                    <p className={styles.hint}>Nenhum papel cadastrado. Cadastre papéis no menu "Papéis".</p>
                ) : (
                    <>
                        <div className={styles.rolesGrid}>
                            {allRoles.map(role => (
                                <label key={role.id} className={`${styles.roleChip} ${selectedRoleIds.includes(role.id) ? styles.roleChipSelected : ''}`}>
                                    <input
                                        type="checkbox"
                                        checked={selectedRoleIds.includes(role.id)}
                                        onChange={() => toggleRole(role.id)}
                                        style={{ display: 'none' }}
                                    />
                                    {role.name}
                                    {selectedRoleIds.includes(role.id) && <Check size={13} style={{ marginLeft: 4 }} />}
                                </label>
                            ))}
                        </div>
                        <button
                            className="btn btn-primary"
                            style={{ marginTop: 12, padding: '8px 18px', fontSize: 13 }}
                            onClick={handleSaveRoles}
                            disabled={savingRoles}
                        >
                            <Save size={14} />
                            {savingRoles ? 'Salvando...' : 'Salvar papéis'}
                        </button>
                    </>
                )}
            </div>

            {/* ── JOB DESCRIPTION ── */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h4 className={styles.sectionTitle}>Job Description</h4>
                    {!editingJob && (
                        <button className={styles.editBtn} onClick={() => setEditingJob(true)}>
                            <Edit2 size={14} /> Editar
                        </button>
                    )}
                </div>
                {editingJob ? (
                    <>
                        <textarea
                            className="input"
                            value={jobDesc}
                            onChange={e => setJobDesc(e.target.value)}
                            placeholder="Descreva a função, responsabilidades e expectativas deste profissional..."
                            rows={5}
                            autoFocus
                        />
                        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                            <button className="btn btn-primary" style={{ padding: '8px 18px', fontSize: 13 }} onClick={handleSaveJobDesc} disabled={saving}>
                                <Save size={14} />
                                {saving ? 'Salvando...' : 'Salvar'}
                            </button>
                            <button className="btn btn-secondary" style={{ padding: '8px 18px', fontSize: 13 }} onClick={() => { setEditingJob(false); setJobDesc(profile?.job_description || ''); }}>
                                Cancelar
                            </button>
                        </div>
                    </>
                ) : (
                    <p className={styles.jobDescText}>
                        {jobDesc || <span className={styles.hint}>Nenhuma descrição cadastrada ainda. Clique em "Editar" para adicionar.</span>}
                    </p>
                )}
            </div>

            {/* ── HABILIDADES ── */}
            <div className={styles.section}>
                <h4 className={styles.sectionTitle}>Habilidades</h4>
                <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                    <input
                        type="text"
                        className="input"
                        placeholder="Ex: Experiência com React e Node.js em projetos de alta escala"
                        value={newSkill}
                        onChange={e => setNewSkill(e.target.value)}
                        style={{ flex: 1, margin: 0 }}
                    />
                    <button type="submit" className="btn btn-primary" disabled={!newSkill.trim() || addingSkill}
                        style={{ padding: '8px 16px', fontSize: 13, flexShrink: 0 }}>
                        <Plus size={15} />
                        Adicionar
                    </button>
                </form>

                {skills.length === 0 ? (
                    <p className={styles.hint}>Nenhuma habilidade cadastrada ainda.</p>
                ) : (
                    <div className={styles.skillsList}>
                        {skills.map((skill, i) => (
                            <div key={skill.id} className={styles.skillItem}>
                                <span className={styles.skillIndex}>{i + 1}</span>
                                {editingSkillId === skill.id ? (
                                    <input
                                        type="text"
                                        className="input"
                                        value={editingSkillText}
                                        onChange={e => setEditingSkillText(e.target.value)}
                                        autoFocus
                                        style={{ flex: 1, margin: 0 }}
                                        onKeyDown={e => { if (e.key === 'Enter') handleUpdateSkill(skill.id); if (e.key === 'Escape') setEditingSkillId(null); }}
                                    />
                                ) : (
                                    <span className={styles.skillText}>{skill.skill}</span>
                                )}
                                <div className={styles.skillActions}>
                                    {editingSkillId === skill.id ? (
                                        <>
                                            <button className={styles.iconBtn} onClick={() => handleUpdateSkill(skill.id)} title="Salvar" style={{ color: 'var(--color-success)' }}><Check size={15} /></button>
                                            <button className={styles.iconBtn} onClick={() => setEditingSkillId(null)} title="Cancelar"><X size={15} /></button>
                                        </>
                                    ) : (
                                        <>
                                            <button className={styles.iconBtn} onClick={() => { setEditingSkillId(skill.id); setEditingSkillText(skill.skill); }} title="Editar"><Edit2 size={15} /></button>
                                            <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => handleDeleteSkill(skill.id)} title="Excluir"><Trash2 size={15} /></button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Componente principal ────────────────────────────────────────────────────
const ProfilesList = () => {
    const [responsibles, setResponsibles] = useState([]);
    const [allRoles, setAllRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [resp, roles] = await Promise.all([
                responsiblesService.getResponsibles(false), // só ativos
                rolesService.getRoles(),
            ]);
            setResponsibles(resp);
            setAllRoles(roles);
        } catch (err) {
            console.error('Erro ao carregar dados:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggle = (id) => setExpandedId(prev => prev === id ? null : id);

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
                    {responsibles.length} responsável{responsibles.length !== 1 ? 'is' : ''} ativo{responsibles.length !== 1 ? 's' : ''}
                </span>
            </div>

            {responsibles.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--text-secondary)' }}>
                    <UserCircle size={48} color="var(--border-color)" style={{ marginBottom: 12 }} />
                    <p>Nenhum responsável ativo encontrado.</p>
                    <span style={{ fontSize: 14 }}>Cadastre responsáveis no menu "Responsáveis".</span>
                </div>
            ) : (
                <div className={styles.accordionList}>
                    {responsibles.map(r => (
                        <div key={r.id} className={styles.accordionItem}>
                            <button className={styles.accordionHeader} onClick={() => toggle(r.id)}>
                                <div className={styles.accordionInfo}>
                                    <div className={styles.accordionAvatar}>
                                        {r.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <span className={styles.accordionName}>{r.name}</span>
                                        {r.email && <span className={styles.accordionEmail}>{r.email}</span>}
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
