import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Check, X, Edit2, Save, LayoutGrid, Link as LinkIcon, Copy } from 'lucide-react';
import { profilesService } from '../../services/profilesService';
import FunctionsModal from './FunctionsModal';
import styles from './Profiles.module.css';

const ProfilePanel = ({ responsible, allRoles, onClose, readOnly = false }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Mission
    const [mission, setMission] = useState('');
    const [editingMission, setEditingMission] = useState(false);

    // Job description
    const [jobDesc, setJobDesc] = useState('');
    const [editingJob, setEditingJob] = useState(false);

    // Papéis
    const [selectedRoleIds, setSelectedRoleIds] = useState([]);
    const [savingRoles, setSavingRoles] = useState(false);

    // Habilidades
    const [skills, setSkills] = useState([]);
    const [newSkill, setNewSkill] = useState('');
    const [editingSkillId, setEditingSkillId] = useState(null);
    const [editingSkillText, setEditingSkillText] = useState('');
    const [addingSkill, setAddingSkill] = useState(false);

    // KPIs
    const [kpis, setKpis] = useState([]);
    const [newKpiDesc, setNewKpiDesc] = useState('');
    const [newKpiMeasure, setNewKpiMeasure] = useState('');
    const [editingKpiId, setEditingKpiId] = useState(null);
    const [editingKpiDesc, setEditingKpiDesc] = useState('');
    const [editingKpiMeasure, setEditingKpiMeasure] = useState('');
    const [addingKpi, setAddingKpi] = useState(false);

    // Funções (pilares)
    const [functions, setFunctions] = useState([]);
    const [showFuncModal, setShowFuncModal] = useState(false);

    // Link
    const [copied, setCopied] = useState(false);

    useEffect(() => { load(); }, [responsible.id]);

    const load = async () => {
        try {
            setLoading(true);
            const data = await profilesService.getProfile(responsible.id);
            setProfile(data);
            setMission(data.mission || '');
            setJobDesc(data.job_description || '');
            setSelectedRoleIds(data.roles.map(r => r.id));
            setSkills(data.skills);
            setKpis(data.kpis);
            setFunctions(data.functions);
        } catch (err) {
            console.error('Erro ao carregar perfil:', err);
        } finally {
            setLoading(false);
        }
    };

    const profileLink = `${window.location.origin}/meu-perfil/${responsible.id}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(profileLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // ── MISSÃO ──
    const handleSaveMission = async () => {
        try {
            setSaving(true);
            await profilesService.saveMission(responsible.id, mission);
            setEditingMission(false);
        } catch { alert('Erro ao salvar missão.'); }
        finally { setSaving(false); }
    };

    // ── JOB DESCRIPTION ──
    const handleSaveJobDesc = async () => {
        try {
            setSaving(true);
            await profilesService.saveJobDescription(responsible.id, jobDesc);
            setEditingJob(false);
        } catch { alert('Erro ao salvar descrição.'); }
        finally { setSaving(false); }
    };

    // ── PAPÉIS ──
    const toggleRole = (roleId) => {
        setSelectedRoleIds(prev =>
            prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]
        );
    };

    const handleSaveRoles = async () => {
        try {
            setSavingRoles(true);
            await profilesService.setRoles(responsible.id, selectedRoleIds);
        } catch { alert('Erro ao salvar papéis.'); }
        finally { setSavingRoles(false); }
    };

    // ── HABILIDADES ──
    const handleAddSkill = async (e) => {
        e.preventDefault();
        if (!newSkill.trim()) return;
        try {
            setAddingSkill(true);
            const created = await profilesService.addSkill(responsible.id, newSkill, skills.length);
            setSkills(prev => [...prev, created]);
            setNewSkill('');
        } catch { alert('Erro ao adicionar habilidade.'); }
        finally { setAddingSkill(false); }
    };

    const handleUpdateSkill = async (id) => {
        if (!editingSkillText.trim()) return;
        try {
            const updated = await profilesService.updateSkill(id, editingSkillText);
            setSkills(prev => prev.map(s => s.id === id ? updated : s));
            setEditingSkillId(null);
        } catch { alert('Erro ao atualizar habilidade.'); }
    };

    const handleDeleteSkill = async (id) => {
        try {
            await profilesService.deleteSkill(id);
            setSkills(prev => prev.filter(s => s.id !== id));
        } catch { alert('Erro ao excluir habilidade.'); }
    };

    // ── KPIs ──
    const handleAddKpi = async (e) => {
        e.preventDefault();
        if (!newKpiDesc.trim() || !newKpiMeasure.trim()) return;
        try {
            setAddingKpi(true);
            const created = await profilesService.addKpi(responsible.id, newKpiDesc, newKpiMeasure, kpis.length);
            setKpis(prev => [...prev, created]);
            setNewKpiDesc('');
            setNewKpiMeasure('');
        } catch { alert('Erro ao adicionar KPI.'); }
        finally { setAddingKpi(false); }
    };

    const handleUpdateKpi = async (id) => {
        if (!editingKpiDesc.trim() || !editingKpiMeasure.trim()) return;
        try {
            const updated = await profilesService.updateKpi(id, editingKpiDesc, editingKpiMeasure);
            setKpis(prev => prev.map(k => k.id === id ? updated : k));
            setEditingKpiId(null);
        } catch { alert('Erro ao atualizar KPI.'); }
    };

    const handleDeleteKpi = async (id) => {
        try {
            await profilesService.deleteKpi(id);
            setKpis(prev => prev.filter(k => k.id !== id));
        } catch { alert('Erro ao excluir KPI.'); }
    };

    // ── FUNÇÕES (PILARES) ──
    const handleSaveFunctions = async (ids) => {
        try {
            await profilesService.setFunctions(responsible.id, ids);
            setShowFuncModal(false);
            await load();
        } catch { alert('Erro ao salvar pilares.'); }
    };

    if (loading) return <div className={styles.panelLoading}>Carregando perfil...</div>;

    return (
        <div className={styles.panel}>
            {/* ── LINK DO PERFIL ── */}
            {!readOnly && (
                <div className={styles.section}>
                    <h4 className={styles.sectionTitle}>Link do Perfil</h4>
                    <div className={styles.profileLinkBar}>
                        <LinkIcon size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                        <input className={styles.profileLinkInput} value={profileLink} readOnly />
                        <button className={styles.copyBtn} onClick={handleCopyLink}>
                            <Copy size={13} /> {copied ? 'Copiado!' : 'Copiar'}
                        </button>
                    </div>
                    <p className={styles.hint} style={{ fontStyle: 'normal' }}>
                        Envie este link para o responsável preencher seu próprio perfil.
                    </p>
                </div>
            )}

            {/* ── MISSÃO ── */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h4 className={styles.sectionTitle}>Missão</h4>
                    {!editingMission && (
                        <button className={styles.editBtn} onClick={() => setEditingMission(true)}>
                            <Edit2 size={14} /> Editar
                        </button>
                    )}
                </div>
                {editingMission ? (
                    <>
                        <textarea
                            className="input"
                            value={mission}
                            onChange={e => setMission(e.target.value)}
                            placeholder="Descreva a missão deste responsável na organização..."
                            rows={4}
                            autoFocus
                        />
                        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                            <button className="btn btn-primary" style={{ padding: '8px 18px', fontSize: 13 }} onClick={handleSaveMission} disabled={saving}>
                                <Save size={14} /> {saving ? 'Salvando...' : 'Salvar'}
                            </button>
                            <button className="btn btn-secondary" style={{ padding: '8px 18px', fontSize: 13 }} onClick={() => { setEditingMission(false); setMission(profile?.mission || ''); }}>
                                Cancelar
                            </button>
                        </div>
                    </>
                ) : (
                    <p className={styles.jobDescText}>
                        {mission || <span className={styles.hint}>Nenhuma missão definida ainda. Clique em "Editar" para adicionar.</span>}
                    </p>
                )}
            </div>

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
                                    <input type="checkbox" checked={selectedRoleIds.includes(role.id)} onChange={() => toggleRole(role.id)} style={{ display: 'none' }} />
                                    {role.name}
                                    {selectedRoleIds.includes(role.id) && <Check size={13} style={{ marginLeft: 4 }} />}
                                </label>
                            ))}
                        </div>
                        <button className="btn btn-primary" style={{ marginTop: 12, padding: '8px 18px', fontSize: 13 }} onClick={handleSaveRoles} disabled={savingRoles}>
                            <Save size={14} /> {savingRoles ? 'Salvando...' : 'Salvar papéis'}
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
                        <textarea className="input" value={jobDesc} onChange={e => setJobDesc(e.target.value)} placeholder="Descreva a função, responsabilidades e expectativas..." rows={5} autoFocus />
                        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                            <button className="btn btn-primary" style={{ padding: '8px 18px', fontSize: 13 }} onClick={handleSaveJobDesc} disabled={saving}>
                                <Save size={14} /> {saving ? 'Salvando...' : 'Salvar'}
                            </button>
                            <button className="btn btn-secondary" style={{ padding: '8px 18px', fontSize: 13 }} onClick={() => { setEditingJob(false); setJobDesc(profile?.job_description || ''); }}>
                                Cancelar
                            </button>
                        </div>
                    </>
                ) : (
                    <p className={styles.jobDescText}>
                        {jobDesc || <span className={styles.hint}>Nenhuma descrição cadastrada ainda.</span>}
                    </p>
                )}
            </div>

            {/* ── KPIs ── */}
            <div className={styles.section}>
                <h4 className={styles.sectionTitle}>Indicadores de Desempenho (KPIs)</h4>
                <form onSubmit={handleAddKpi}>
                    <div className={styles.kpiFormRow}>
                        <input type="text" className="input" placeholder="Descrição do KPI" value={newKpiDesc} onChange={e => setNewKpiDesc(e.target.value)} style={{ margin: 0 }} />
                        <input type="text" className="input" placeholder="Como será mensurado/calculado" value={newKpiMeasure} onChange={e => setNewKpiMeasure(e.target.value)} style={{ margin: 0 }} />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={!newKpiDesc.trim() || !newKpiMeasure.trim() || addingKpi} style={{ padding: '8px 16px', fontSize: 13 }}>
                        <Plus size={15} /> Adicionar KPI
                    </button>
                </form>

                {kpis.length === 0 ? (
                    <p className={styles.hint} style={{ marginTop: 16 }}>Nenhum KPI cadastrado ainda.</p>
                ) : (
                    <div className={styles.skillsList} style={{ marginTop: 16 }}>
                        {kpis.map((kpi, i) => (
                            <div key={kpi.id} className={styles.kpiItem}>
                                <span className={styles.skillIndex}>{i + 1}</span>
                                {editingKpiId === kpi.id ? (
                                    <div className={styles.kpiBody}>
                                        <input type="text" className="input" value={editingKpiDesc} onChange={e => setEditingKpiDesc(e.target.value)} style={{ margin: '0 0 6px 0' }} autoFocus />
                                        <input type="text" className="input" value={editingKpiMeasure} onChange={e => setEditingKpiMeasure(e.target.value)} style={{ margin: 0 }} onKeyDown={e => { if (e.key === 'Enter') handleUpdateKpi(kpi.id); if (e.key === 'Escape') setEditingKpiId(null); }} />
                                    </div>
                                ) : (
                                    <div className={styles.kpiBody}>
                                        <span className={styles.kpiDesc}>{kpi.description}</span>
                                        <span className={styles.kpiMeasure}><strong>Mensuração:</strong> {kpi.measurement}</span>
                                    </div>
                                )}
                                <div className={styles.skillActions}>
                                    {editingKpiId === kpi.id ? (
                                        <>
                                            <button className={styles.iconBtn} onClick={() => handleUpdateKpi(kpi.id)} title="Salvar" style={{ color: 'var(--color-success)' }}><Check size={15} /></button>
                                            <button className={styles.iconBtn} onClick={() => setEditingKpiId(null)} title="Cancelar"><X size={15} /></button>
                                        </>
                                    ) : (
                                        <>
                                            <button className={styles.iconBtn} onClick={() => { setEditingKpiId(kpi.id); setEditingKpiDesc(kpi.description); setEditingKpiMeasure(kpi.measurement); }} title="Editar"><Edit2 size={15} /></button>
                                            <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => handleDeleteKpi(kpi.id)} title="Excluir"><Trash2 size={15} /></button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── HABILIDADES ── */}
            <div className={styles.section}>
                <h4 className={styles.sectionTitle}>Habilidades</h4>
                <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                    <input type="text" className="input" placeholder="Ex: Experiência com React e Node.js" value={newSkill} onChange={e => setNewSkill(e.target.value)} style={{ flex: 1, margin: 0 }} />
                    <button type="submit" className="btn btn-primary" disabled={!newSkill.trim() || addingSkill} style={{ padding: '8px 16px', fontSize: 13, flexShrink: 0 }}>
                        <Plus size={15} /> Adicionar
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
                                    <input type="text" className="input" value={editingSkillText} onChange={e => setEditingSkillText(e.target.value)} autoFocus style={{ flex: 1, margin: 0 }} onKeyDown={e => { if (e.key === 'Enter') handleUpdateSkill(skill.id); if (e.key === 'Escape') setEditingSkillId(null); }} />
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

            {/* ── PILARES DE ATUAÇÃO ── */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h4 className={styles.sectionTitle}>Pilares de Atuação</h4>
                    <button className={styles.editBtn} onClick={() => setShowFuncModal(true)}>
                        <LayoutGrid size={14} /> Selecionar Funções
                    </button>
                </div>
                {functions.length === 0 ? (
                    <p className={styles.hint}>Nenhuma função selecionada. Clique em "Selecionar Funções" para definir os pilares de atuação.</p>
                ) : (
                    <div className={styles.funcTagsList}>
                        {functions.map(fn => (
                            <span key={fn.id} className={styles.funcTag}>
                                <span className={styles.funcTagPilar}>{fn.pilar?.split(' ')[0]}</span>
                                {fn.name}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {showFuncModal && (
                <FunctionsModal
                    selectedIds={functions.map(f => f.id)}
                    onSave={handleSaveFunctions}
                    onClose={() => setShowFuncModal(false)}
                />
            )}
        </div>
    );
};

export default ProfilePanel;
