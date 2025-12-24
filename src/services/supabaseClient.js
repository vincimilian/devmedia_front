import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qbxerekjhyvgymnzskco.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseKey) {
    console.warn('⚠️  VITE_SUPABASE_KEY não encontrada no .env. Upload de imagens pode não funcionar.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Faz upload de uma imagem para o Supabase Storage
 * @param {File} file - Arquivo de imagem
 * @param {string} userId - ID do usuário
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
export const uploadImage = async (file, userId) => {
    try {
        if (!file) {
            return { success: false, error: 'Nenhum arquivo fornecido' };
        }

        // Validar tipo de arquivo
        if (!file.type.startsWith('image/')) {
            return { success: false, error: 'Apenas imagens são permitidas' };
        }

        // Validar tamanho (5MB)
        if (file.size > 5 * 1024 * 1024) {
            return { success: false, error: 'A imagem deve ter no máximo 5MB' };
        }

        const timestamp = Date.now();
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${timestamp}.${fileExt}`;

        // Upload para Supabase Storage
        const { data, error } = await supabase.storage
            .from('image_bucket')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('Erro ao fazer upload no Supabase:', error);
            return { success: false, error: 'Erro ao fazer upload da imagem' };
        }

        // Obter URL pública
        const { data: publicUrlData } = supabase.storage
            .from('image_bucket')
            .getPublicUrl(fileName);

        return {
            success: true,
            url: publicUrlData.publicUrl
        };
    } catch (error) {
        console.error('Erro ao fazer upload:', error);
        return { success: false, error: 'Erro ao fazer upload da imagem' };
    }
};
