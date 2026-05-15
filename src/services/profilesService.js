import { supabase } from './supabaseClient';

export const profilesService = {
    // Buscar resumo de todos os responsáveis com papéis e habilidades (para busca global)
    async getAllProfilesSummary() {
        const { data: responsibles, error: rError } = await supabase
            .from('pepl_responsibles')
            .select('*')
            .eq('is_active', true)
            .order('name', { ascending: true });
        if (rError) throw rError;

        const { data: allRoleLinks, error: rlError } = await supabase
            .from('pepl_responsible_roles')
            .select('responsible_id, pepl_roles(id, name)');
        if (rlError) throw rlError;

        const { data: allSkills, error: sError } = await supabase
            .from('pepl_responsible_skills')
            .select('responsible_id, skill')
            .order('order_index', { ascending: true });
        if (sError) throw sError;

        // Montar mapa de roles e skills por responsible_id
        const rolesMap = {};
        (allRoleLinks || []).forEach(link => {
            if (!rolesMap[link.responsible_id]) rolesMap[link.responsible_id] = [];
            if (link.pepl_roles) rolesMap[link.responsible_id].push(link.pepl_roles);
        });

        const skillsMap = {};
        (allSkills || []).forEach(s => {
            if (!skillsMap[s.responsible_id]) skillsMap[s.responsible_id] = [];
            skillsMap[s.responsible_id].push(s.skill);
        });

        return (responsibles || []).map(r => ({
            ...r,
            roles: rolesMap[r.id] || [],
            skillTexts: skillsMap[r.id] || [],
        }));
    },

    // Buscar perfil completo de um responsável (roles + skills + kpis + functions + mission)
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

        const { data: kpis, error: kpisError } = await supabase
            .from('pepl_responsible_kpis')
            .select('*')
            .eq('responsible_id', responsibleId)
            .order('order_index', { ascending: true });
        if (kpisError) throw kpisError;

        const { data: funcLinks, error: funcError } = await supabase
            .from('pepl_responsible_functions')
            .select('function_id, pepl_functions(id, name, pilar)')
            .eq('responsible_id', responsibleId);
        if (funcError) throw funcError;

        return {
            ...responsible,
            roles: roles?.map(r => r.pepl_roles) || [],
            skills: skills || [],
            kpis: kpis || [],
            functions: funcLinks?.map(l => l.pepl_functions).filter(Boolean) || [],
        };
    },

    // ══════════════════════════════════════════════
    // MISSÃO
    // ══════════════════════════════════════════════

    async saveMission(responsibleId, mission) {
        const { data, error } = await supabase
            .from('pepl_responsibles')
            .update({ mission, updated_at: new Date().toISOString() })
            .eq('id', responsibleId)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // ══════════════════════════════════════════════
    // JOB DESCRIPTION
    // ══════════════════════════════════════════════

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

    // ══════════════════════════════════════════════
    // PAPÉIS
    // ══════════════════════════════════════════════

    async setRoles(responsibleId, roleIds) {
        const { error: deleteError } = await supabase
            .from('pepl_responsible_roles')
            .delete()
            .eq('responsible_id', responsibleId);
        if (deleteError) throw deleteError;

        if (roleIds.length === 0) return;

        const inserts = roleIds.map(role_id => ({ responsible_id: responsibleId, role_id }));
        const { error: insertError } = await supabase
            .from('pepl_responsible_roles')
            .insert(inserts);
        if (insertError) throw insertError;
    },

    // ══════════════════════════════════════════════
    // HABILIDADES
    // ══════════════════════════════════════════════

    async addSkill(responsibleId, skill, orderIndex) {
        const { data, error } = await supabase
            .from('pepl_responsible_skills')
            .insert([{ responsible_id: responsibleId, skill: skill.trim(), order_index: orderIndex }])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

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

    async deleteSkill(id) {
        const { error } = await supabase
            .from('pepl_responsible_skills')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    // ══════════════════════════════════════════════
    // KPIs (Indicadores de Desempenho)
    // ══════════════════════════════════════════════

    async addKpi(responsibleId, description, measurement, orderIndex) {
        const { data, error } = await supabase
            .from('pepl_responsible_kpis')
            .insert([{
                responsible_id: responsibleId,
                description: description.trim(),
                measurement: measurement.trim(),
                order_index: orderIndex,
            }])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async updateKpi(id, description, measurement) {
        const { data, error } = await supabase
            .from('pepl_responsible_kpis')
            .update({ description: description.trim(), measurement: measurement.trim() })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async deleteKpi(id) {
        const { error } = await supabase
            .from('pepl_responsible_kpis')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    // ══════════════════════════════════════════════
    // PILARES DE ATUAÇÃO (Funções Organizacionais)
    // ══════════════════════════════════════════════

    async setFunctions(responsibleId, functionIds) {
        const { error: deleteError } = await supabase
            .from('pepl_responsible_functions')
            .delete()
            .eq('responsible_id', responsibleId);
        if (deleteError) throw deleteError;

        if (functionIds.length === 0) return;

        const inserts = functionIds.map(function_id => ({ responsible_id: responsibleId, function_id }));
        const { error: insertError } = await supabase
            .from('pepl_responsible_functions')
            .insert(inserts);
        if (insertError) throw insertError;
    },

    // Buscar responsável pelo email
    async getResponsibleByEmail(email) {
        const { data, error } = await supabase
            .from('pepl_responsibles')
            .select('*')
            .eq('email', email.toLowerCase())
            .maybeSingle();
        if (error) throw error;
        return data;
    },
};
