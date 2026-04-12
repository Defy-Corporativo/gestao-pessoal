import { supabase } from './supabaseClient';

export const profilesService = {
    // Buscar perfil completo de um responsável (roles + skills + job_description)
    async getProfile(responsibleId) {
        const { data: responsible, error: rError } = await supabase
            .from('pepl_responsibles')
            .select('*')
            .eq('id', responsibleId)
            .single();
        if (rError) throw rError;

        const { data: roles, error: rolesError } = await supabase
            .from('pepl_responsible_roles')
            .select('role_id, pepl_roles(id, name)')
            .eq('responsible_id', responsibleId);
        if (rolesError) throw rolesError;

        const { data: skills, error: skillsError } = await supabase
            .from('pepl_responsible_skills')
            .select('*')
            .eq('responsible_id', responsibleId)
            .order('order_index', { ascending: true });
        if (skillsError) throw skillsError;

        return {
            ...responsible,
            roles: roles?.map(r => r.pepl_roles) || [],
            skills: skills || [],
        };
    },

    // Salvar job_description
    async saveJobDescription(responsibleId, jobDescription) {
        const { data, error } = await supabase
            .from('pepl_responsibles')
            .update({ job_description: jobDescription, updated_at: new Date().toISOString() })
            .eq('id', responsibleId)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // Definir papéis de um responsável (substitui todos)
    async setRoles(responsibleId, roleIds) {
        // Remover todos os papéis atuais
        const { error: deleteError } = await supabase
            .from('pepl_responsible_roles')
            .delete()
            .eq('responsible_id', responsibleId);
        if (deleteError) throw deleteError;

        if (roleIds.length === 0) return;

        // Inserir novos vínculos
        const inserts = roleIds.map(role_id => ({ responsible_id: responsibleId, role_id }));
        const { error: insertError } = await supabase
            .from('pepl_responsible_roles')
            .insert(inserts);
        if (insertError) throw insertError;
    },

    // Adicionar habilidade
    async addSkill(responsibleId, skill, orderIndex) {
        const { data, error } = await supabase
            .from('pepl_responsible_skills')
            .insert([{ responsible_id: responsibleId, skill: skill.trim(), order_index: orderIndex }])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // Atualizar habilidade
    async updateSkill(id, skill) {
        const { data, error } = await supabase
            .from('pepl_responsible_skills')
            .update({ skill: skill.trim() })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // Excluir habilidade
    async deleteSkill(id) {
        const { error } = await supabase
            .from('pepl_responsible_skills')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },
};
