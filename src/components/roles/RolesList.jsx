import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, X, Briefcase } from 'lucide-react';
import { rolesService } from '../../services/rolesService';
import styles from './Roles.module.css';

const RolesList = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => { loadRoles(); }, []);

    const loadRoles = async () => {
        try {
            const data = await rolesService.getRoles();
            setRoles(data);
        } catch (err) {
            console.error('Erro ao carregar papéis:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newName.trim()) return;
        try {
            setSaving(true);
            await rolesService.createRole(newName);
            setNewName('');
            await loadRoles();
        } catch (err) {
            if (err.code === '23505') alert('Já existe um papel com este nome.');
            else alert('Erro ao adicionar papel.');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveEdit = async () => {
        if (!editingName.trim()) return;
        try {
            await rolesService.updateRole(editingId, editingName);
            setEditingId(null);
            await loadRoles();
        } catch (err) {
            if (err.code === '23505') alert('Já existe um papel com este nome.');
            else alert('Erro ao atualizar papel.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Excluir este papel? Ele será desvinculado de todos os responsáveis.')) return;
        try {
            await rolesService.deleteRole(id);
            await loadRoles();
        } catch (err) {
            alert('Erro ao excluir papel.');
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
            <p style={{ color: 'var(--text-secondary)' }}>Carregando...</p>
        </div>
    );

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Papéis</h1>
                <span className={styles.countBadge}>
                    {roles.length} cadastrado{roles.length !== 1 ? 's' : ''}
                </span>
            </div>

            <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <Briefcase size={20} color="var(--color-primary)" />
                    <h3 style={{ margin: 0, fontSize: 16, color: 'var(--text-primary)' }}>Cadastro de Papéis</h3>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20, marginTop: 0 }}>
                    Papéis são cargos ou funções que podem ser atribuídos aos responsáveis. Ex: Desenvolvedor, Gerente de Projetos, Designer.
                </p>

                <form onSubmit={handleAdd} style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
                    <input
                        type="text"
                        className="input"
                        placeholder="Nome do papel (ex: Desenvolvedor Frontend)"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        style={{ flex: 1 }}
                    />
                    <button type="submit" className="btn btn-primary" disabled={!newName.trim() || saving}>
                        <Plus size={16} />
                        {saving ? 'Adicionando...' : 'Adicionar'}
                    </button>
                </form>

                {roles.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Briefcase size={40} color="var(--border-color)" />
                        <p>Nenhum papel cadastrado ainda.</p>
                        <span>Adicione papéis para atribuir aos responsáveis.</span>
                    </div>
                ) : (
                    <div className={styles.rolesList}>
                        {roles.map(role => (
                            <div key={role.id} className={styles.roleItem}>
                                {editingId === role.id ? (
                                    <input
                                        type="text"
                                        className="input"
                                        value={editingName}
                                        onChange={e => setEditingName(e.target.value)}
                                        autoFocus
                                        style={{ flex: 1, margin: 0 }}
                                        onKeyDown={e => { if (e.key === 'Enter') handleSaveEdit(); if (e.key === 'Escape') setEditingId(null); }}
                                    />
                                ) : (
                                    <span className={styles.roleName}>{role.name}</span>
                                )}
                                <div className={styles.roleActions}>
                                    {editingId === role.id ? (
                                        <>
                                            <button className={styles.actionBtn} onClick={handleSaveEdit} title="Salvar" style={{ color: 'var(--color-success)' }}>
                                                <Check size={16} />
                                            </button>
                                            <button className={styles.actionBtn} onClick={() => setEditingId(null)} title="Cancelar">
                                                <X size={16} />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button className={styles.actionBtn} onClick={() => { setEditingId(role.id); setEditingName(role.name); }} title="Editar">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className={`${styles.actionBtn} ${styles.danger}`} onClick={() => handleDelete(role.id)} title="Excluir">
                                                <Trash2 size={16} />
                                            </button>
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

export default RolesList;
