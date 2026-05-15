import { supabase } from './supabaseClient';

export const functionsService = {
    // Listar todas as funções (com pilar)
    async getFunctions() {
        const { data, error } = await supabase
            .from('pepl_functions')
            .select('*')
            .order('pilar', { ascending: true })
            .order('name', { ascending: true });
        if (error) throw error;
        return data || [];
    },

    // Criar função
    async createFunction(payload) {
        const { data, error } = await supabase
            .from('pepl_functions')
            .insert([{
                name: payload.name.trim(),
                pilar: payload.pilar.trim(),
                responsabilidades: payload.responsabilidades?.trim() || null,
                resultado_esperado: payload.resultado_esperado?.trim() || null,
            }])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // Atualizar função
    async updateFunction(id, payload) {
        const { data, error } = await supabase
            .from('pepl_functions')
            .update({
                name: payload.name.trim(),
                pilar: payload.pilar.trim(),
                responsabilidades: payload.responsabilidades?.trim() || null,
                resultado_esperado: payload.resultado_esperado?.trim() || null,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // Excluir função
    async deleteFunction(id) {
        const { error } = await supabase
            .from('pepl_functions')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    // Listar pilares únicos
    async getPilares() {
        const { data, error } = await supabase
            .from('pepl_functions')
            .select('pilar')
            .order('pilar', { ascending: true });
        if (error) throw error;
        const unique = [...new Set((data || []).map(r => r.pilar))];
        return unique;
    },
};
