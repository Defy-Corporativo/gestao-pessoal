import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    UserCog, Edit2, Save, X, Check, Plus, Trash2, LayoutGrid,
    Target, Briefcase, BookOpen, Award, Zap, LogOut,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { profilesService } from '../../services/profilesService';
import { rolesService } from '../../services/rolesService';
import { functionsService } from '../../services/functionsService';
import s from './MyProfile.module.css';

const PILARES = [
    'Estratégia & Negócios',
    'Produto & Tecnologia',
    'Operação & Clientes',
    'Governança & Financeiro',
    'Inovação & Escala',
];

// ─── Modal bottom-sheet: seleção de funções ──────────────────────────────────
const FunctionsSheet = ({ selectedIds, onSave, onClose }) => {
    const [allFunctions, setAllFunctions] = useState([]);
    const [selected, setSelected] = useState(new Set(selectedIds));
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        functionsService.getFunctions()
            .then(data => setAllFunctions(data))
            .finally(() => setLoading(false));
    }, []);

    const toggle = (id) => setSelected(prev => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
    });

    const handleSave = async () => {
        setSaving(true);
        await onSave([...selected]);
        setSaving(false);
    };

    const grouped = PILARES.reduce((acc, pilar) => {
        const items = allFunctions.filter(f => f.pilar === pilar);
        if (items.length > 0) acc[pilar] = items;
        return acc;
    }, {});

    return (
        <div className={s.modalOverlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className={s.modalSheet}>
                <div className={s.modalHandle} />
                <div className={s.modalSheetHeader}>
                    <p className={s.modalSheetTitle}>Pilares de Atuação</p>
                    <p className={s.modalSheetSub}>
                        Selecione as funções que você pode exercer.
                        {selected.size > 0 && <strong> {selected.size} selecionada{selected.size !== 1 ? 's' : ''}</strong>}
                    </p>
                </div>
                <div className={s.modalSheetBody}>
                    {loading ? (
                        <p className={s.errorText}>Carregando...</p>
                    ) : allFunctions.length === 0 ? (
                        <p className={s.errorText}>Nenhuma função cadastrada ainda.</p>
                    ) : (
                        Object.entries(grouped).map(([pilar, items]) => (
                            <div key={pilar} className={s.pilarGroup}>
                                <span className={s.pilarLabel}>{pilar}</span>
                                {items.map(fn => (
                                    <label
                                        key={fn.id}
                                        className={`${s.funcCheckItem} ${selected.has(fn.id) ? s.funcCheckItemSelected : ''}`}
                                        onClick={() => toggle(fn.id)}
                                    >
                                        <input
                                            type="checkbox"
                                            className={s.funcCheckbox}
                                            checked={selected.has(fn.id)}
                                            onChange={() => {}}
                                        />
                                        <div>
                                            <span className={s.funcName}>{fn.name}</span>
                                            {fn.responsabilidades && (
                                                <span className={s.funcResp}>{fn.responsabilidades}</span>
                                            )}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        ))
                    )}
                </div>
                <div className={s.modalSheetFooter}>
                    <div className={s.saveBar}>
                        <button className={s.btnSecondary} onClick={onClose} disabled={saving}>
                            <X size={16} /> Cancelar
                        </button>
                        <button className={s.btnPrimary} onClick={handleSave} disabled={saving}>
                            <Save size={16} /> {saving ? 'Salvando...' : 'Confirmar'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Componente principal ─────────────────────────────────────────────────────
const MyProfile = () => {
    const { id } = useParams();
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const [responsible, setResponsible] = useState(null);
    const [allRoles, setAllRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Missão
    const [mission, setMission] = useState('');
    const [editingMission, setEditingMission] = useState(false);
    const [savingMission, setSavingMission] = useState(false);

    // Job Description
    const [jobDesc, setJobDesc] = useState('');
    const [editingJob, setEditingJob] = useState(false);
    const [savingJob, setSavingJob] = useState(false);

    // Papéis
    const [selectedRoleIds, setSelectedRoleIds] = useState([]);
    const [savingRoles, setSavingRoles] = useState(false);
    const [rolesSaved, setRolesSaved] = useState(false);

    // Habilidades
    const [skills, setSkills] = useState([]);
    const [newSkill, setNewSkill] = useState('');
    const [editingSkillId, setEditingSkillId] = useState(null);
    const [editingSkillText, setEditingSkillText] = useState('');

    // KPIs
    const [kpis, setKpis] = useState([]);
    const [newKpiDesc, setNewKpiDesc] = useState('');
    const [newKpiMeasure, setNewKpiMeasure] = useState('');
    const [editingKpiId, setEditingKpiId] = useState(null);
    const [editingKpiDesc, setEditingKpiDesc] = useState('');
    const [editingKpiMeasure, setEditingKpiMeasure] = useState('');

    // Funções
    const [functions, setFunctions] = useState([]);
    const [showFuncSheet, setShowFuncSheet] = useState(false);

    useEffect(() => { loadProfile(); }, [id, user]);

    const loadProfile = async () => {
        try {
            setLoading(true);
            setError(null);

            const loggedEmail = user?.email?.toLowerCase();
            if (!loggedEmail) { setError('auth'); return; }

            const myResponsible = await profilesService.getResponsibleByEmail(loggedEmail);
            if (!myResponsible) { setError('not_registered'); return; }

            // Redireciona para o próprio perfil se o ID não bater
            if (id !== myResponsible.id) {
                navigate(`/meu-perfil/${myResponsible.id}`, { replace: true });
                return;
            }

            const [data, roles] = await Promise.all([
                profilesService.getProfile(myResponsible.id),
                rolesService.getRoles(),
            ]);

            setResponsible(myResponsible);
            setAllRoles(roles);
            setMission(data.mission || '');
            setJobDesc(data.job_description || '');
            setSelectedRoleIds(data.roles.map(r => r.id));
            setSkills(data.skills);
            setKpis(data.kpis);
            setFunctions(data.functions);
        } catch (err) {
            console.error(err);
            setError('generic');
        } finally {
            setLoading(false);
        }
    };

    // ── MISSÃO ──
    const handleSaveMission = async () => {
        setSavingMission(true);
        try { await profilesService.saveMission(responsible.id, mission); setEditingMission(false); }
        catch { alert('Erro ao salvar missão.'); }
        finally { setSavingMission(false); }
    };

    // ── JOB DESCRIPTION ──
    const handleSaveJob = async () => {
        setSavingJob(true);
        try { await profilesService.saveJobDescription(responsible.id, jobDesc); setEditingJob(false); }
        catch { alert('Erro ao salvar descrição.'); }
        finally { setSavingJob(false); }
    };

    // ── PAPÉIS ──
    const toggleRole = (roleId) =>
        setSelectedRoleIds(prev => prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]);

    const handleSaveRoles = async () => {
        setSavingRoles(true);
        try {
            await profilesService.setRoles(responsible.id, selectedRoleIds);
            setRolesSaved(true); setTimeout(() => setRolesSaved(false), 2000);
        }
        catch { alert('Erro ao salvar papéis.'); }
        finally { setSavingRoles(false); }
    };

    // ── HABILIDADES ──
    const handleAddSkill = async (e) => {
        e.preventDefault();
        if (!newSkill.trim()) return;
        try {
            const created = await profilesService.addSkill(responsible.id, newSkill, skills.length);
            setSkills(prev => [...prev, created]); setNewSkill('');
        } catch { alert('Erro ao adicionar habilidade.'); }
    };

    const handleUpdateSkill = async (id) => {
        if (!editingSkillText.trim()) return;
        try {
            const updated = await profilesService.updateSkill(id, editingSkillText);
            setSkills(prev => prev.map(s => s.id === id ? updated : s)); setEditingSkillId(null);
        } catch { alert('Erro ao atualizar habilidade.'); }
    };

    const handleDeleteSkill = async (id) => {
        try { await profilesService.deleteSkill(id); setSkills(prev => prev.filter(s => s.id !== id)); }
        catch { alert('Erro ao excluir.'); }
    };

    // ── KPIs ──
    const handleAddKpi = async (e) => {
        e.preventDefault();
        if (!newKpiDesc.trim() || !newKpiMeasure.trim()) return;
        try {
            const created = await profilesService.addKpi(responsible.id, newKpiDesc, newKpiMeasure, kpis.length);
            setKpis(prev => [...prev, created]); setNewKpiDesc(''); setNewKpiMeasure('');
        } catch { alert('Erro ao adicionar KPI.'); }
    };

    const handleUpdateKpi = async (id) => {
        if (!editingKpiDesc.trim() || !editingKpiMeasure.trim()) return;
        try {
            const updated = await profilesService.updateKpi(id, editingKpiDesc, editingKpiMeasure);
            setKpis(prev => prev.map(k => k.id === id ? updated : k)); setEditingKpiId(null);
        } catch { alert('Erro ao atualizar KPI.'); }
    };

    const handleDeleteKpi = async (id) => {
        try { await profilesService.deleteKpi(id); setKpis(prev => prev.filter(k => k.id !== id)); }
        catch { alert('Erro ao excluir.'); }
    };

    // ── FUNÇÕES ──
    const handleSaveFunctions = async (ids) => {
        try { await profilesService.setFunctions(responsible.id, ids); setShowFuncSheet(false); await loadProfile(); }
        catch { alert('Erro ao salvar pilares.'); }
    };

    // ── LOADING ──
    if (loading) return (
        <div className={s.fullScreen}>
            <UserCog size={40} color="#94a3b8" />
            <p className={s.errorTitle}>Carregando seu perfil...</p>
        </div>
    );

    // ── ERROS ──
    if (error === 'auth') return (
        <div className={s.fullScreen}>
            <UserCog size={48} color="#94a3b8" />
            <p className={s.errorTitle}>Login necessário</p>
            <p className={s.errorText}>Você precisa estar autenticado para acessar este perfil.</p>
        </div>
    );

    if (error === 'not_registered') return (
        <div className={s.fullScreen}>
            <UserCog size={48} color="#94a3b8" />
            <p className={s.errorTitle}>Perfil não encontrado</p>
            <p className={s.errorText}>Seu e-mail não está cadastrado como responsável. Solicite ao administrador que cadastre seu e-mail no sistema.</p>
        </div>
    );

    if (error) return (
        <div className={s.fullScreen}>
            <UserCog size={48} color="#94a3b8" />
            <p className={s.errorTitle}>Erro ao carregar perfil</p>
            <p className={s.errorText}>Tente novamente mais tarde.</p>
        </div>
    );

    if (!responsible) return null;

    return (
        <div className={s.page}>
            {/* ── TOP BAR ── */}
            <div className={s.topBar}>
                <div className={s.topBarBrand}>
                    <div className={s.topBarLogo}>G</div>
                    <div>
                        <span className={s.topBarName}>Meu Perfil</span>
                        <span className={s.topBarSub}>Gestão Pessoal · Defy</span>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className={`${s.topBarSaved} ${rolesSaved ? s.visible : ''}`}>
                        <Check size={14} /> Salvo!
                    </span>
                    <button className={s.logoutBtn} onClick={signOut} title="Sair">
                        <LogOut size={15} /> Sair
                    </button>
                </div>
            </div>

            {/* ── HERO ── */}
            <div className={s.hero}>
                <div className={s.heroAvatar}>{responsible.name.charAt(0).toUpperCase()}</div>
                <p className={s.heroName}>{responsible.name}</p>
                {responsible.email && <p className={s.heroEmail}>{responsible.email}</p>}
            </div>

            {/* ── CONTEÚDO ── */}
            <div className={s.content}>

                {/* MISSÃO */}
                <div className={s.card}>
                    <div className={s.cardHeader}>
                        <div className={s.cardIcon} style={{ background: '#eff6ff' }}>
                            <Target size={18} color="#3b82f6" />
                        </div>
                        <p className={s.cardTitle}>Missão</p>
                        {!editingMission && (
                            <button className={s.cardEditBtn} onClick={() => setEditingMission(true)}>
                                <Edit2 size={13} /> Editar
                            </button>
                        )}
                    </div>
                    <div className={s.cardBody}>
                        {editingMission ? (
                            <>
                                <textarea
                                    className={s.mobileTextarea}
                                    value={mission}
                                    onChange={e => setMission(e.target.value)}
                                    placeholder="Ex: Catalisar um ecossistema de abundância através da curadoria e integração de empresas AI-native..."
                                    rows={5}
                                    autoFocus
                                />
                                <div className={s.saveBar}>
                                    <button className={s.btnSecondary} onClick={() => { setEditingMission(false); setMission(responsible.mission || ''); }} disabled={savingMission}>
                                        <X size={16} /> Cancelar
                                    </button>
                                    <button className={s.btnPrimary} onClick={handleSaveMission} disabled={savingMission}>
                                        <Save size={16} /> {savingMission ? 'Salvando...' : 'Salvar'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <p className={mission ? s.textPreview : s.emptyHint}>
                                {mission || 'Nenhuma missão definida. Toque em "Editar" para adicionar.'}
                            </p>
                        )}
                    </div>
                </div>

                {/* PAPÉIS */}
                <div className={s.card}>
                    <div className={s.cardHeader}>
                        <div className={s.cardIcon} style={{ background: '#f5f3ff' }}>
                            <Briefcase size={18} color="#7c3aed" />
                        </div>
                        <p className={s.cardTitle}>Papéis</p>
                    </div>
                    <div className={s.cardBody}>
                        {allRoles.length === 0 ? (
                            <p className={s.emptyHint}>Nenhum papel cadastrado no sistema.</p>
                        ) : (
                            <>
                                <div className={s.chipsGrid}>
                                    {allRoles.map(role => (
                                        <span
                                            key={role.id}
                                            className={`${s.chip} ${selectedRoleIds.includes(role.id) ? s.chipSelected : ''}`}
                                            onClick={() => toggleRole(role.id)}
                                        >
                                            {selectedRoleIds.includes(role.id) && <Check size={12} />}
                                            {role.name}
                                        </span>
                                    ))}
                                </div>
                                <div className={s.saveBar} style={{ marginTop: 14 }}>
                                    <button className={s.btnPrimary} onClick={handleSaveRoles} disabled={savingRoles}>
                                        <Save size={16} /> {savingRoles ? 'Salvando...' : 'Salvar Papéis'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* JOB DESCRIPTION */}
                <div className={s.card}>
                    <div className={s.cardHeader}>
                        <div className={s.cardIcon} style={{ background: '#f0fdf4' }}>
                            <BookOpen size={18} color="#16a34a" />
                        </div>
                        <p className={s.cardTitle}>Job Description</p>
                        {!editingJob && (
                            <button className={s.cardEditBtn} onClick={() => setEditingJob(true)}>
                                <Edit2 size={13} /> Editar
                            </button>
                        )}
                    </div>
                    <div className={s.cardBody}>
                        {editingJob ? (
                            <>
                                <textarea
                                    className={s.mobileTextarea}
                                    value={jobDesc}
                                    onChange={e => setJobDesc(e.target.value)}
                                    placeholder="Descreva sua função, responsabilidades e expectativas..."
                                    rows={5}
                                    autoFocus
                                />
                                <div className={s.saveBar}>
                                    <button className={s.btnSecondary} onClick={() => { setEditingJob(false); setJobDesc(responsible.job_description || ''); }} disabled={savingJob}>
                                        <X size={16} /> Cancelar
                                    </button>
                                    <button className={s.btnPrimary} onClick={handleSaveJob} disabled={savingJob}>
                                        <Save size={16} /> {savingJob ? 'Salvando...' : 'Salvar'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <p className={jobDesc ? s.textPreview : s.emptyHint}>
                                {jobDesc || 'Nenhuma descrição cadastrada. Toque em "Editar" para adicionar.'}
                            </p>
                        )}
                    </div>
                </div>

                {/* KPIs */}
                <div className={s.card}>
                    <div className={s.cardHeader}>
                        <div className={s.cardIcon} style={{ background: '#fff7ed' }}>
                            <Award size={18} color="#ea580c" />
                        </div>
                        <p className={s.cardTitle}>Indicadores de Desempenho (KPIs)</p>
                    </div>
                    <div className={s.cardBody}>
                        {kpis.length > 0 && (
                            <div className={s.itemList}>
                                {kpis.map((kpi, i) => (
                                    <div key={kpi.id} className={s.listItem}>
                                        <span className={s.itemNum}>{i + 1}</span>
                                        {editingKpiId === kpi.id ? (
                                            <div className={s.itemBody}>
                                                <input className={s.mobileInput} value={editingKpiDesc} onChange={e => setEditingKpiDesc(e.target.value)} placeholder="Descrição do KPI" style={{ marginBottom: 6 }} autoFocus />
                                                <input className={s.mobileInput} value={editingKpiMeasure} onChange={e => setEditingKpiMeasure(e.target.value)} placeholder="Como será mensurado" onKeyDown={e => { if (e.key === 'Enter') handleUpdateKpi(kpi.id); if (e.key === 'Escape') setEditingKpiId(null); }} />
                                                <div className={s.saveBar} style={{ marginTop: 8 }}>
                                                    <button className={s.btnSecondary} onClick={() => setEditingKpiId(null)}><X size={14} /></button>
                                                    <button className={s.btnPrimary} onClick={() => handleUpdateKpi(kpi.id)}><Check size={14} /> Salvar</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className={s.itemBody}>
                                                <span className={s.itemTitle}>{kpi.description}</span>
                                                <span className={s.itemSub}><strong>Mensuração:</strong> {kpi.measurement}</span>
                                            </div>
                                        )}
                                        {editingKpiId !== kpi.id && (
                                            <div className={s.itemActions}>
                                                <button className={s.iconBtn} onClick={() => { setEditingKpiId(kpi.id); setEditingKpiDesc(kpi.description); setEditingKpiMeasure(kpi.measurement); }} title="Editar"><Edit2 size={14} /></button>
                                                <button className={`${s.iconBtn} ${s.iconBtnDanger}`} onClick={() => handleDeleteKpi(kpi.id)} title="Excluir"><Trash2 size={14} /></button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        <form onSubmit={handleAddKpi} className={s.addForm}>
                            <input className={s.mobileInput} value={newKpiDesc} onChange={e => setNewKpiDesc(e.target.value)} placeholder="Descrição do KPI (ex: Taxa de retenção de clientes)" />
                            <input className={s.mobileInput} value={newKpiMeasure} onChange={e => setNewKpiMeasure(e.target.value)} placeholder="Mensuração (ex: % de clientes que renovam no mês)" />
                            <button type="submit" className={s.btnPrimary} disabled={!newKpiDesc.trim() || !newKpiMeasure.trim()}>
                                <Plus size={16} /> Adicionar KPI
                            </button>
                        </form>
                    </div>
                </div>

                {/* HABILIDADES */}
                <div className={s.card}>
                    <div className={s.cardHeader}>
                        <div className={s.cardIcon} style={{ background: '#fdf4ff' }}>
                            <Zap size={18} color="#a21caf" />
                        </div>
                        <p className={s.cardTitle}>Habilidades</p>
                    </div>
                    <div className={s.cardBody}>
                        {skills.length > 0 && (
                            <div className={s.itemList}>
                                {skills.map((skill, i) => (
                                    <div key={skill.id} className={s.listItem}>
                                        <span className={s.itemNum}>{i + 1}</span>
                                        {editingSkillId === skill.id ? (
                                            <div className={s.itemBody}>
                                                <input className={s.mobileInput} value={editingSkillText} onChange={e => setEditingSkillText(e.target.value)} autoFocus onKeyDown={e => { if (e.key === 'Enter') handleUpdateSkill(skill.id); if (e.key === 'Escape') setEditingSkillId(null); }} />
                                                <div className={s.saveBar} style={{ marginTop: 8 }}>
                                                    <button className={s.btnSecondary} onClick={() => setEditingSkillId(null)}><X size={14} /></button>
                                                    <button className={s.btnPrimary} onClick={() => handleUpdateSkill(skill.id)}><Check size={14} /> Salvar</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className={s.itemTitle} style={{ marginTop: 2 }}>{skill.skill}</span>
                                        )}
                                        {editingSkillId !== skill.id && (
                                            <div className={s.itemActions}>
                                                <button className={s.iconBtn} onClick={() => { setEditingSkillId(skill.id); setEditingSkillText(skill.skill); }}><Edit2 size={14} /></button>
                                                <button className={`${s.iconBtn} ${s.iconBtnDanger}`} onClick={() => handleDeleteSkill(skill.id)}><Trash2 size={14} /></button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        <form onSubmit={handleAddSkill} className={s.addForm}>
                            <input className={s.mobileInput} value={newSkill} onChange={e => setNewSkill(e.target.value)} placeholder="Ex: Experiência com React e Node.js" />
                            <button type="submit" className={s.btnPrimary} disabled={!newSkill.trim()}>
                                <Plus size={16} /> Adicionar Habilidade
                            </button>
                        </form>
                    </div>
                </div>

                {/* PILARES DE ATUAÇÃO */}
                <div className={s.card}>
                    <div className={s.cardHeader}>
                        <div className={s.cardIcon} style={{ background: '#f0fdf4' }}>
                            <LayoutGrid size={18} color="#059669" />
                        </div>
                        <p className={s.cardTitle}>Pilares de Atuação</p>
                        <button className={s.cardEditBtn} onClick={() => setShowFuncSheet(true)}>
                            <Edit2 size={13} /> Selecionar
                        </button>
                    </div>
                    <div className={s.cardBody}>
                        {functions.length === 0 ? (
                            <p className={s.emptyHint}>Nenhuma função selecionada. Toque em "Selecionar" para definir seus pilares.</p>
                        ) : (
                            <div className={s.funcTagsList}>
                                {functions.map(fn => (
                                    <span key={fn.id} className={s.funcTag}>
                                        <span className={s.funcTagPilar}>{fn.pilar?.split(' ')[0]}</span>
                                        {fn.name}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* ── SHEET DE FUNÇÕES ── */}
            {showFuncSheet && (
                <FunctionsSheet
                    selectedIds={functions.map(f => f.id)}
                    onSave={handleSaveFunctions}
                    onClose={() => setShowFuncSheet(false)}
                />
            )}
        </div>
    );
};

export default MyProfile;
