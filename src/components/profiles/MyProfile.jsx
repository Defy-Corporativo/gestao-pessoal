import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { profilesService } from '../../services/profilesService';
import { rolesService } from '../../services/rolesService';
import ProfilePanel from './ProfilePanel';
import styles from './Profiles.module.css';

const MyProfile = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [responsible, setResponsible] = useState(null);
    const [allRoles, setAllRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadProfile();
    }, [id, user]);

    const loadProfile = async () => {
        try {
            setLoading(true);
            setError(null);

            const loggedEmail = user?.email?.toLowerCase();
            if (!loggedEmail) {
                setError('Usuário não autenticado.');
                return;
            }

            // Buscar o responsável pelo email logado
            const myResponsible = await profilesService.getResponsibleByEmail(loggedEmail);

            if (!myResponsible) {
                setError('Seu e-mail não está cadastrado como responsável no sistema. Solicite ao administrador que cadastre seu e-mail.');
                return;
            }

            // Se o id da URL não corresponde ao do usuário logado, redireciona para o próprio perfil
            if (id !== myResponsible.id) {
                navigate(`/meu-perfil/${myResponsible.id}`, { replace: true });
                return;
            }

            setResponsible(myResponsible);

            const roles = await rolesService.getRoles();
            setAllRoles(roles);
        } catch (err) {
            console.error('Erro ao carregar perfil:', err);
            setError('Erro ao carregar perfil.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <p style={{ color: 'var(--text-secondary)' }}>Carregando seu perfil...</p>
        </div>
    );

    if (error) return (
        <div style={{ maxWidth: 500, margin: '60px auto', textAlign: 'center', padding: 32 }}>
            <UserCircle size={48} color="var(--border-color)" style={{ marginBottom: 16 }} />
            <h3 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>Acesso ao Perfil</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{error}</p>
        </div>
    );

    if (!responsible) return null;

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Meu Perfil</h1>
            </div>

            <div className={styles.accordionItem}>
                <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid var(--border-color-light)' }}>
                    <div className={styles.accordionAvatar}>
                        {responsible.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <span className={styles.accordionName}>{responsible.name}</span>
                        {responsible.email && <span className={styles.accordionEmail}>{responsible.email}</span>}
                    </div>
                </div>
                <ProfilePanel
                    responsible={responsible}
                    allRoles={allRoles}
                    readOnly={false}
                />
            </div>
        </div>
    );
};

export default MyProfile;
