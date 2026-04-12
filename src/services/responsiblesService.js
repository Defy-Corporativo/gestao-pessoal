import { supabase } from './supabaseClient';

export const responsiblesService = {
    // Get all responsibles (active only by default)
    async getResponsibles(includeInactive = false) {
        let query = supabase
            .from('pepl_responsibles')
            .select('*')
            .order('name', { ascending: true });

        if (!includeInactive) {
            query = query.eq('is_active', true);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    },

    // Create a new responsible
    async createResponsible(name, email = null) {
        const { data, error } = await supabase
            .from('pepl_responsibles')
            .insert([{ name: name.trim(), email: email ? email.trim() : null }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Update a responsible
    async updateResponsible(id, name, email = null) {
        const { data, error } = await supabase
            .from('pepl_responsibles')
            .update({
                name: name.trim(),
                email: email ? email.trim() : null,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Toggle active status
    async toggleActive(id, isActive) {
        const { data, error } = await supabase
            .from('pepl_responsibles')
            .update({
                is_active: isActive,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Get a responsible by ID
    async getResponsibleById(id) {
        const { data, error } = await supabase
            .from('pepl_responsibles')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    // Get a responsible by email
    async getResponsibleByEmail(email) {
        const { data, error } = await supabase
            .from('pepl_responsibles')
            .select('*')
            .eq('email', email.toLowerCase())
            .maybeSingle();

        if (error) throw error;
        return data; // pode ser null se não encontrar
    },

    // Delete a responsible
    async deleteResponsible(id) {
        const { error } = await supabase
            .from('pepl_responsibles')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
