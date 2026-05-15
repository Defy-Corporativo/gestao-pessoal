import React, { useState, useEffect } from 'react';
import { Check, X, Save } from 'lucide-react';
import { functionsService } from '../../services/functionsService';
import styles from './Profiles.module.css';

const PILARES = [
    'Estratégia & Negócios',
    'Produto & Tecnologia',
    'Operação & Clientes',
    'Governança & Financeiro',
    'Inovação & Escala',
];

const FunctionsModal = ({ selectedIds, onSave, onClose }) => {
    const [allFunctions, setAllFunctions] = useState([]);
    const [selected, setSelected] = useState(new Set(selectedIds));
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        functionsService.getFunctions()
            .then(data => setAllFunctions(data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const toggle = (id) => {
        setSelected(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

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
        <div className={styles.modalOverlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className={styles.modal}>
                <h2 className={styles.modalTitle}>Pilares de Atuação</h2>
                <p className={styles.modalSubtitle}>
                    Selecione as funções organizacionais que este responsável pode exercer.
                    {selected.size > 0 && <strong> ({selected.size} selecionada{selected.size !== 1 ? 's' : ''})</strong>}
                </p>

                {loading ? (
                    <p className={styles.hint}>Carregando funções...</p>
                ) : allFunctions.length === 0 ? (
                    <p className={styles.hint}>Nenhuma função cadastrada. Cadastre funções no menu "Funções".</p>
                ) : (
                    Object.entries(grouped).map(([pilar, items]) => (
                        <div key={pilar} className={styles.pilarGroup}>
                            <span className={styles.pilarLabel}>{pilar}</span>
                            <div className={styles.funcCheckList}>
                                {items.map(fn => (
                                    <label
                                        key={fn.id}
                                        className={`${styles.funcCheckItem} ${selected.has(fn.id) ? styles.selected : ''}`}
                                        onClick={() => toggle(fn.id)}
                                    >
                                        <input
                                            type="checkbox"
                                            className={styles.funcCheckbox}
                                            checked={selected.has(fn.id)}
                                            onChange={() => {}}
                                        />
                                        <div className={styles.funcInfo}>
                                            <span className={styles.funcName}>{fn.name}</span>
                                            {fn.responsabilidades && (
                                                <span className={styles.funcResp}>{fn.responsabilidades}</span>
                                            )}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))
                )}

                <div className={styles.modalActions}>
                    <button className="btn btn-secondary" onClick={onClose} disabled={saving}>
                        <X size={16} /> Cancelar
                    </button>
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                        <Save size={16} /> {saving ? 'Salvando...' : 'Salvar Pilares'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FunctionsModal;
