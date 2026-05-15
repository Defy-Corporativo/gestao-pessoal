import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, LayoutGrid, Target } from 'lucide-react';
import { functionsService } from '../../services/functionsService';
import styles from './Functions.module.css';

const PILARES = [
    'Estratégia & Negócios',
    'Produto & Tecnologia',
    'Operação & Clientes',
    'Governança & Financeiro',
    'Inovação & Escala',
];

const EMPTY_FORM = {
    name: '',
    pilar: PILARES[0],
    responsabilidades: '',
    resultado_esperado: '',
};

const FunctionsList = () => {
    const [functions, setFunctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterPilar, setFilterPilar] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingFunction, setEditingFunction] = useState(null); // null = nova, obj = edição
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    useEffect(() => { loadFunctions(); }, []);

    const loadFunctions = async () => {
        try {
            setLoading(true);
            const data = await functionsService.getFunctions();
            setFunctions(data);
        } catch (err) {
            console.error('Erro ao carregar funções:', err);
        } finally {
            setLoading(false);
        }
    };

    /* ── Computed ── */
    const filtered = filterPilar
        ? functions.filter(f => f.pilar === filterPilar)
        : functions;

    const grouped = PILARES.reduce((acc, pilar) => {
        const items = filtered.filter(f => f.pilar === pilar);
        if (items.length > 0) acc[pilar] = items;
        return acc;
    }, {});

    /* ── Modal helpers ── */
    const openAdd = () => {
        setEditingFunction(null);
        setForm(EMPTY_FORM);
        setShowModal(true);
    };

    const openEdit = (fn) => {
        setEditingFunction(fn);
        setForm({
            name: fn.name,
            pilar: fn.pilar,
            responsabilidades: fn.responsabilidades || '',
            resultado_esperado: fn.resultado_esperado || '',
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingFunction(null);
        setForm(EMPTY_FORM);
    };

    const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    /* ── CRUD ── */
    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.pilar.trim()) return;
        try {
            setSaving(true);
            if (editingFunction) {
                await functionsService.updateFunction(editingFunction.id, form);
            } else {
                await functionsService.createFunction(form);
            }
            closeModal();
            await loadFunctions();
        } catch (err) {
            if (err.code === '23505') alert('Já existe uma função com este nome.');
            else alert('Erro ao salvar função.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Excluir a função "${name}"?`)) return;
        try {
            await functionsService.deleteFunction(id);
            await loadFunctions();
        } catch (err) {
            alert('Erro ao excluir função.');
        }
    };

    /* ── Render ── */
    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
            <p style={{ color: 'var(--text-secondary)' }}>Carregando...</p>
        </div>
    );

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Funções</h1>
                <span className={styles.countBadge}>
                    {functions.length} cadastrada{functions.length !== 1 ? 's' : ''}
                </span>
            </div>

            <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <LayoutGrid size={20} color="var(--color-primary)" />
                    <h3 style={{ margin: 0, fontSize: 16, color: 'var(--text-primary)' }}>Funções Organizacionais</h3>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20, marginTop: 0 }}>
                    Funções representam papéis estratégicos e operacionais organizados por pilar. Cada função possui responsabilidades-chave e resultado esperado.
                </p>

                {/* Toolbar */}
                <div className={styles.toolbar}>
                    <select
                        className={styles.filterSelect}
                        value={filterPilar}
                        onChange={e => setFilterPilar(e.target.value)}
                    >
                        <option value="">Todos os pilares</option>
                        {PILARES.map(p => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>
                    <button className={`btn btn-primary ${styles.addBtn}`} onClick={openAdd}>
                        <Plus size={16} />
                        Nova Função
                    </button>
                </div>

                {/* Lista agrupada por pilar */}
                {filtered.length === 0 ? (
                    <div className={styles.emptyState}>
                        <LayoutGrid size={40} color="var(--border-color)" />
                        <p>Nenhuma função encontrada.</p>
                        <span>Adicione funções ou ajuste o filtro de pilar.</span>
                    </div>
                ) : (
                    Object.entries(grouped).map(([pilar, items]) => (
                        <div key={pilar} className={styles.pilarGroup}>
                            <div className={styles.pilarHeader}>
                                <span className={styles.pilarLabel}>{pilar}</span>
                                <span className={styles.pilarCount}>{items.length}</span>
                            </div>
                            <div className={styles.functionsList}>
                                {items.map(fn => (
                                    <div key={fn.id} className={styles.functionItem}>
                                        <div className={styles.functionBody}>
                                            <span className={styles.functionName}>{fn.name}</span>
                                            {fn.responsabilidades && (
                                                <p className={styles.functionMeta}>
                                                    <strong>Responsabilidades:</strong> {fn.responsabilidades}
                                                </p>
                                            )}
                                            {fn.resultado_esperado && (
                                                <p className={styles.functionMeta} style={{ marginBottom: 0 }}>
                                                    <strong>Resultado esperado:</strong> {fn.resultado_esperado}
                                                </p>
                                            )}
                                        </div>
                                        <div className={styles.functionActions}>
                                            <button
                                                className={styles.actionBtn}
                                                onClick={() => openEdit(fn)}
                                                title="Editar"
                                            >
                                                <Edit2 size={15} />
                                            </button>
                                            <button
                                                className={`${styles.actionBtn} ${styles.danger}`}
                                                onClick={() => handleDelete(fn.id, fn.name)}
                                                title="Excluir"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal de criação/edição */}
            {showModal && (
                <div className={styles.modalOverlay} onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
                    <div className={styles.modal}>
                        <h2 className={styles.modalTitle}>
                            {editingFunction ? 'Editar Função' : 'Nova Função'}
                        </h2>
                        <form onSubmit={handleSave}>
                            <div className={styles.formGroup}>
                                <label htmlFor="fn-pilar">Pilar *</label>
                                <select
                                    id="fn-pilar"
                                    className="input"
                                    value={form.pilar}
                                    onChange={e => handleChange('pilar', e.target.value)}
                                    required
                                >
                                    {PILARES.map(p => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="fn-name">Nome da Função *</label>
                                <input
                                    id="fn-name"
                                    type="text"
                                    className="input"
                                    placeholder="Ex: Arquitetura de Software"
                                    value={form.name}
                                    onChange={e => handleChange('name', e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="fn-resp">Responsabilidades-Chave</label>
                                <textarea
                                    id="fn-resp"
                                    placeholder="Descreva as responsabilidades principais desta função..."
                                    value={form.responsabilidades}
                                    onChange={e => handleChange('responsabilidades', e.target.value)}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="fn-result">Resultado Esperado</label>
                                <textarea
                                    id="fn-result"
                                    placeholder="Qual o resultado esperado desta função na organização..."
                                    value={form.resultado_esperado}
                                    onChange={e => handleChange('resultado_esperado', e.target.value)}
                                />
                            </div>

                            <div className={styles.modalActions}>
                                <button type="button" className="btn btn-secondary" onClick={closeModal} disabled={saving}>
                                    <X size={16} />
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={!form.name.trim() || saving}
                                >
                                    <Target size={16} />
                                    {saving ? 'Salvando...' : editingFunction ? 'Salvar Alterações' : 'Criar Função'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FunctionsList;
