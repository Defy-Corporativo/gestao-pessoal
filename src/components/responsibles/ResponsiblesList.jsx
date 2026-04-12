import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X, User } from 'lucide-react';
import { responsiblesService } from '../../services/responsiblesService';
import styles from './Responsibles.module.css';

const ResponsiblesList = () => {
    const [responsibles, setResponsibles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState('');
    const [editingEmail, setEditingEmail] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadResponsibles();
    }, []);

    const loadResponsibles = async () => {
        try {
            const data = await responsiblesService.getResponsibles(true); // include inactive
            setResponsibles(data || []);
        } catch (error) {
            console.error('Erro ao carregar responsáveis:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newName.trim()) return;

        try {
            setSaving(true);
            await responsiblesService.createResponsible(newName, newEmail);
            setNewName('');
            setNewEmail('');
            await loadResponsibles();
        } catch (error) {
            console.error('Erro ao adicionar responsável:', error);
            if (error.code === '23505') {
                alert('Já existe um responsável com este nome.');
            } else {
                alert('Erro ao adicionar responsável.');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleStartEdit = (responsible) => {
        setEditingId(responsible.id);
        setEditingName(responsible.name);
        setEditingEmail(responsible.email || '');
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingName('');
        setEditingEmail('');
    };

    const handleSaveEdit = async () => {
        if (!editingName.trim()) return;

        try {
            await responsiblesService.updateResponsible(editingId, editingName, editingEmail);
            setEditingId(null);
            setEditingName('');
            setEditingEmail('');
            await loadResponsibles();
        } catch (error) {
            console.error('Erro ao atualizar responsável:', error);
            if (error.code === '23505') {
                alert('Já existe um responsável com este nome.');
            } else {
                alert('Erro ao atualizar responsável.');
            }
        }
    };

    const handleToggleActive = async (responsible) => {
        try {
            await responsiblesService.toggleActive(responsible.id, !responsible.is_active);
            await loadResponsibles();
        } catch (error) {
            console.error('Erro ao alterar status:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir este responsável?')) return;

        try {
            await responsiblesService.deleteResponsible(id);
            await loadResponsibles();
        } catch (error) {
            console.error('Erro ao excluir responsável:', error);
            alert('Erro ao excluir. O responsável pode estar vinculado a registros existentes.');
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    const activeCount = responsibles.filter(r => r.is_active).length;
    const inactiveCount = responsibles.filter(r => !r.is_active).length;

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Responsáveis</h1>
                <div className={styles.statsRow}>
                    <span className={styles.statBadge} style={{ background: 'var(--color-success-light)', color: 'var(--color-success)' }}>
                        {activeCount} ativo{activeCount !== 1 ? 's' : ''}
                    </span>
                    {inactiveCount > 0 && (
                        <span className={styles.statBadge} style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>
                            {inactiveCount} inativo{inactiveCount !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>
            </div>

            <div className="card">
                <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>
                        <User size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                        Cadastro de Responsáveis
                    </h3>
                </div>

                <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>
                    Cadastre os responsáveis que poderão ser atribuídos às oportunidades e ações de todo o portfólio corporativo.
                </p>

                {/* Form to add new responsible */}
                <form onSubmit={handleAdd} style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        className="input"
                        placeholder="Nome do responsável"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        style={{ flex: '1 1 180px', minWidth: '160px' }}
                    />
                    <input
                        type="email"
                        className="input"
                        placeholder="E-mail (opcional)"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        style={{ flex: '1 1 200px', minWidth: '180px' }}
                    />
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={!newName.trim() || saving}
                    >
                        <Plus size={16} />
                        {saving ? 'Adicionando...' : 'Adicionar'}
                    </button>
                </form>

                {/* List of responsibles */}
                <div className={styles.fieldsList}>
                    {responsibles.length === 0 ? (
                        <p className={styles.emptyState}>Nenhum responsável cadastrado ainda.</p>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>E-mail</th>
                                    <th style={{ width: '100px' }}>Status</th>
                                    <th style={{ width: '120px' }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {responsibles.map((responsible) => (
                                    <tr
                                        key={responsible.id}
                                        style={{
                                            opacity: responsible.is_active ? 1 : 0.6,
                                            background: responsible.is_active ? 'white' : 'var(--bg-main)'
                                        }}
                                    >
                                        <td>
                                            {editingId === responsible.id ? (
                                                <input
                                                    type="text"
                                                    className="input"
                                                    value={editingName}
                                                    onChange={(e) => setEditingName(e.target.value)}
                                                    autoFocus
                                                    style={{ margin: 0 }}
                                                />
                                            ) : (
                                                responsible.name
                                            )}
                                        </td>
                                        <td>
                                            {editingId === responsible.id ? (
                                                <input
                                                    type="email"
                                                    className="input"
                                                    value={editingEmail}
                                                    onChange={(e) => setEditingEmail(e.target.value)}
                                                    placeholder="E-mail (opcional)"
                                                    style={{ margin: 0 }}
                                                />
                                            ) : (
                                                <span style={{ color: responsible.email ? 'inherit' : 'var(--text-secondary)', fontSize: '13px' }}>
                                                    {responsible.email || '—'}
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <span
                                                className={styles.badge}
                                                style={{
                                                    background: responsible.is_active ? 'var(--color-success-light)' : 'var(--bg-secondary)',
                                                    color: responsible.is_active ? 'var(--color-success)' : 'var(--text-secondary)'
                                                }}
                                            >
                                                {responsible.is_active ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={styles.actions}>
                                                {editingId === responsible.id ? (
                                                    <>
                                                        <button
                                                            className={styles.actionBtn}
                                                            onClick={handleSaveEdit}
                                                            title="Salvar"
                                                            style={{ color: 'var(--color-success)' }}
                                                        >
                                                            <Check size={16} />
                                                        </button>
                                                        <button
                                                            className={styles.actionBtn}
                                                            onClick={handleCancelEdit}
                                                            title="Cancelar"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            className={styles.actionBtn}
                                                            onClick={() => handleStartEdit(responsible)}
                                                            title="Editar"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            className={styles.actionBtn}
                                                            onClick={() => handleToggleActive(responsible)}
                                                            title={responsible.is_active ? 'Desativar' : 'Ativar'}
                                                            style={{ color: responsible.is_active ? 'var(--text-secondary)' : 'var(--color-success)' }}
                                                        >
                                                            {responsible.is_active ? <X size={16} /> : <Check size={16} />}
                                                        </button>
                                                        <button
                                                            className={`${styles.actionBtn} ${styles.danger}`}
                                                            onClick={() => handleDelete(responsible.id)}
                                                            title="Excluir"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResponsiblesList;
