import { supabase } from '../supabaseClient';

class InstagramService {
  constructor() {
    this.accessToken = null;
    this.userId = null;
    this.baseUrl = 'https://graph.instagram.com';
    this.isConnected = false;
  }

  // ================================
  // CONFIGURACIÓN Y AUTENTICACIÓN
  // ================================

  /**
   * Configurar credenciales de Instagram
   * @param {string} accessToken - Token de acceso de Instagram Basic Display API
   * @param {string} userId - ID del usuario de Instagram
   */
  configure(accessToken, userId) {
    this.accessToken = accessToken;
    this.userId = userId;
    this.isConnected = true;
    
    // Guardar en localStorage para persistencia
    localStorage.setItem('instagram_token', accessToken);
    localStorage.setItem('instagram_user_id', userId);
    
    console.log('✅ Instagram configurado:', { userId, tokenLength: accessToken?.length });
  }

  /**
   * Cargar configuración desde localStorage
   */
  loadFromStorage() {
    const token = localStorage.getItem('instagram_token');
    const userId = localStorage.getItem('instagram_user_id');
    
    if (token && userId) {
      this.configure(token, userId);
      return true;
    }
    return false;
  }

  /**
   * Verificar si está conectado a Instagram
   */
  isInstagramConnected() {
    return this.isConnected && this.accessToken && this.userId;
  }

  /**
   * Desconectar Instagram
   */
  disconnect() {
    this.accessToken = null;
    this.userId = null;
    this.isConnected = false;
    
    localStorage.removeItem('instagram_token');
    localStorage.removeItem('instagram_user_id');
    
    console.log('🔌 Instagram desconectado');
  }

  // ================================
  // IMPORTACIÓN DE POSTS
  // ================================

  /**
   * Obtener posts del feed de Instagram
   * @param {number} limit - Límite de posts a obtener (máximo 25)
   */
  async getInstagramPosts(limit = 10) {
    if (!this.isInstagramConnected()) {
      throw new Error('No hay conexión con Instagram');
    }

    try {
      const fields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp';
      const url = `${this.baseUrl}/${this.userId}/media?fields=${fields}&limit=${limit}&access_token=${this.accessToken}`;
      
      console.log('📡 Obteniendo posts de Instagram...');
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(`Instagram API Error: ${data.error.message}`);
      }
      
      console.log('✅ Posts obtenidos de Instagram:', data.data?.length || 0);
      return data.data || [];
      
    } catch (error) {
      console.error('❌ Error obteniendo posts de Instagram:', error);
      throw error;
    }
  }

  /**
   * Convertir post de Instagram a formato de Red Social DS
   * @param {Object} igPost - Post de Instagram
   * @param {string} dsUserId - ID del usuario en DS
   */
  convertInstagramPost(igPost, dsUserId) {
    return {
      content: igPost.caption || '',
      media_url: igPost.media_url,
      media_type: igPost.media_type?.toLowerCase() === 'video' ? 'video' : 'image',
      user_id: dsUserId,
      instagram_id: igPost.id,
      instagram_permalink: igPost.permalink,
      created_at: igPost.timestamp,
      is_instagram_import: true
    };
  }

  /**
   * Sincronizar posts de Instagram con Red Social DS
   * @param {string} dsUserId - ID del usuario en DS
   */
  async syncInstagramPosts(dsUserId) {
    if (!this.isInstagramConnected()) {
      throw new Error('Instagram no está conectado');
    }

    try {
      console.log('🔄 Iniciando sincronización con Instagram...');
      
      // 1. Obtener posts de Instagram
      const igPosts = await this.getInstagramPosts(20);
      
      // 2. Verificar cuáles ya existen en la BD
      const { data: existingPosts } = await supabase
        .from('social_posts')
        .select('instagram_id')
        .eq('user_id', dsUserId)
        .not('instagram_id', 'is', null);
      
      const existingIds = new Set(existingPosts?.map(p => p.instagram_id) || []);
      
      // 3. Filtrar posts nuevos
      const newPosts = igPosts.filter(post => !existingIds.has(post.id));
      
      if (newPosts.length === 0) {
        console.log('✅ No hay posts nuevos para sincronizar');
        return { imported: 0, total: igPosts.length };
      }
      
      // 4. Convertir y guardar posts nuevos
      const postsToInsert = newPosts.map(post => 
        this.convertInstagramPost(post, dsUserId)
      );
      
      const { error } = await supabase
        .from('social_posts')
        .insert(postsToInsert);
      
      if (error) throw error;
      
      console.log(`✅ Sincronización completada: ${newPosts.length} posts importados`);
      
      return {
        imported: newPosts.length,
        total: igPosts.length,
        newPosts: postsToInsert
      };
      
    } catch (error) {
      console.error('❌ Error en sincronización:', error);
      throw error;
    }
  }

  // ================================
  // PREPARACIÓN PARA PUBLICACIÓN
  // ================================

  /**
   * Preparar contenido para publicar en Instagram
   * @param {Object} dsPost - Post de Red Social DS
   */
  prepareForInstagram(dsPost) {
    const caption = dsPost.content || '';
    const hashtags = this.generateHashtags(dsPost);
    const fullCaption = `${caption}\n\n${hashtags}`;
    
    return {
      caption: fullCaption,
      mediaUrl: dsPost.media_url,
      mediaType: dsPost.media_type,
      instructions: this.getPublishingInstructions(dsPost)
    };
  }

  /**
   * Generar hashtags relevantes
   * @param {Object} dsPost - Post de Red Social DS
   */
  generateHashtags(dsPost) {
    const baseHashtags = [
      '#DSEntrenamiento',
      '#Fitness',
      '#Entrenamiento',
      '#Gym',
      '#Workout'
    ];
    
    // Agregar hashtags basados en el contenido
    const content = dsPost.content?.toLowerCase() || '';
    const additionalHashtags = [];
    
    if (content.includes('pecho') || content.includes('press')) {
      additionalHashtags.push('#Pecho', '#Press');
    }
    if (content.includes('pierna') || content.includes('squat')) {
      additionalHashtags.push('#Piernas', '#Squat');
    }
    if (content.includes('espalda') || content.includes('pullup')) {
      additionalHashtags.push('#Espalda', '#BackWorkout');
    }
    
    return [...baseHashtags, ...additionalHashtags].join(' ');
  }

  /**
   * Obtener instrucciones para publicar manualmente
   * @param {Object} dsPost - Post de Red Social DS
   */
  getPublishingInstructions(dsPost) {
    const prepared = this.prepareForInstagram(dsPost);
    
    return {
      step1: '1. 📱 Abre Instagram en tu móvil',
      step2: '2. 📸 Toca el + para crear nueva publicación',
      step3: dsPost.media_url 
        ? '3. 🖼️ Selecciona la imagen/video desde tu galería'
        : '3. 🖼️ Toma una foto o selecciona contenido',
      step4: '4. 📝 Copia y pega el siguiente texto:',
      caption: prepared.caption,
      step5: '5. ✅ Publica y comparte el enlace aquí para sincronizar'
    };
  }

  // ================================
  // WEBHOOKS Y SINCRONIZACIÓN AUTOMÁTICA
  // ================================

  /**
   * Configurar webhook para sincronización automática
   * NOTA: Requiere servidor backend para recibir webhooks
   */
  async setupWebhook(webhookUrl) {
    // Esta funcionalidad requiere Instagram Webhooks
    // Se implementaría cuando tengamos servidor backend
    console.log('⚠️ Webhooks requieren servidor backend');
    return {
      success: false,
      message: 'Webhooks requieren configuración de servidor'
    };
  }

  // ================================
  // UTILIDADES
  // ================================

  /**
   * Validar token de acceso
   */
  async validateToken() {
    if (!this.accessToken) return false;
    
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.userId}?fields=id,username&access_token=${this.accessToken}`
      );
      const data = await response.json();
      
      return !data.error;
    } catch (error) {
      console.error('❌ Error validando token:', error);
      return false;
    }
  }

  /**
   * Obtener información del perfil de Instagram
   */
  async getProfileInfo() {
    if (!this.isInstagramConnected()) {
      throw new Error('Instagram no está conectado');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/${this.userId}?fields=id,username,account_type,media_count&access_token=${this.accessToken}`
      );
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      return data;
    } catch (error) {
      console.error('❌ Error obteniendo perfil:', error);
      throw error;
    }
  }
}

// Instancia singleton
const instagramService = new InstagramService();

// Cargar configuración al inicializar
instagramService.loadFromStorage();

export default instagramService;
