import { supabase } from './supabaseClient';

export const rolesService = {
    // Listar todos os papéis
    async getRoles() {
        const { data, error } = await supabase
            .from('pepl_roles')
            .select('*')
            .order('name', { ascending: true });
        if (error) throw error;
        return data || [];
    },

    // Criar papel
    async createRole(name) {
        const { data, error } = await supabase
            .from('pepl_roles')
            .insert([{ name: name.trim() }])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // Atualizar papel
    async updateRole(id, name) {
        const { data, error } = await supabase
            .from('pepl_roles')
            .update({ name: name.trim(), updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // Excluir papel
    async deleteRole(id) {
        const { error } = await supabase
            .from('pepl_roles')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },
};
