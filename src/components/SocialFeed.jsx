import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useProfileImageModal } from '../hooks/useProfileImageModal';
import ClickableAvatar from './ClickableAvatar';
import ProfileImageModal from './ProfileImageModal';
import UserExplorer from './UserExplorer';

const SocialFeed = ({ currentUser, onClose }) => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [followRequests, setFollowRequests] = useState([]);
  const [following, setFollowing] = useState([]);
  const [activeTab, setActiveTab] = useState('feed'); // feed, explore, requests
  const [showUserExplorer, setShowUserExplorer] = useState(false);
  
  // Hook para el modal de imagen de perfil
  const { showProfileImageModal, selectedProfileImage, handleProfileImageClick, closeModal } = useProfileImageModal();
  
  const fileInputRef = useRef(null);

  // Helper para obtener información del usuario actual de manera consistente
  const getCurrentUserInfo = () => {
    console.log('🔍 getCurrentUserInfo - currentUser prop:', currentUser);
    
    // Buscar ID en múltiples campos posibles, incluyendo email como fallback
    let userId = currentUser?.id || currentUser?.user_id || currentUser?.userId || currentUser?.ID || currentUser?.email;
    let userInfo = currentUser;
    
    console.log('🔍 ID encontrado en currentUser:', userId);
    
    if (!userId || !userInfo) {
      console.log('⚠️ No currentUser o no ID, intentando localStorage...');
      try {
        const savedUser = localStorage.getItem('ds_user');
        console.log('🔍 localStorage ds_user:', savedUser);
        
        if (savedUser) {
          const user = JSON.parse(savedUser);
          console.log('✅ Usuario desde localStorage:', user);
          // Buscar ID en múltiples campos del localStorage también, incluyendo email
          userId = user.id || user.user_id || user.userId || user.ID || user.email;
          userInfo = user;
          console.log('🔍 ID encontrado en localStorage:', userId);
        } else {
          console.log('❌ No hay datos en localStorage');
        }
      } catch (e) {
        console.error('❌ Error parsing user from localStorage:', e);
      }
    }
    
    console.log('📊 getCurrentUserInfo resultado:', { userId, userInfo });
    console.log('📊 Todos los campos del usuario:', Object.keys(userInfo || {}));
    return { userId, userInfo };
  };

  useEffect(() => {
    loadPosts();
    loadFollowRequests();
    loadFollowing();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando posts...');
      
      // Cargar posts
      const { data: postsData, error: postsError } = await supabase
        .from('social_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (postsError) {
        console.error('❌ Error loading posts:', postsError);
        setPosts([]);
        return;
      }

      console.log('✅ Posts cargados:', postsData?.length || 0);
      
      // Obtener información de usuarios para cada post
      const postsWithUserInfo = await Promise.all(
        (postsData || []).map(async (post) => {
          let userInfo = {
            name: `Usuario ${post.user_id}`,
            email: '',
            avatar_url: null,
            fullName: ''
          };

          // Intentar obtener info del usuario desde tabla usuarios
          try {
            // Primero intentar por ID, luego por email si el user_id es un email
            let userQuery = supabase.from('usuarios').select('email, fullName, profilePhoto, role');
            
            // Si user_id parece ser un email, buscar por email
            if (post.user_id && post.user_id.includes('@')) {
              userQuery = userQuery.eq('email', post.user_id);
            } else {
              // Si no es email, intentar buscar por un campo ID (cuando sepamos cuál es)
              userQuery = userQuery.eq('email', post.user_id); // fallback a email por ahora
            }

            const { data: userData, error: userError } = await userQuery.single();

            if (userData && !userError) {
              userInfo = {
                name: userData.fullName || userData.email || `Usuario ${post.user_id}`,
                email: userData.email || '',
                avatar_url: userData.profilePhoto || null,
                fullName: userData.fullName || '',
                role: userData.role || ''
              };
              console.log('✅ Info usuario cargada:', userData);
            } else {
              console.log('⚠️ Usuario no encontrado:', post.user_id, userError);
            }
          } catch (error) {
            console.log('⚠️ Error cargando usuario:', error);
          }

          return {
            ...post,
            user: userInfo,
            likes: [], // Por ahora vacío, cargaremos después
            comments: [] // Por ahora vacío, cargaremos después
          };
        })
      );
      
      console.log('✅ Posts con info de usuario:', postsWithUserInfo.length);
      setPosts(postsWithUserInfo);
    } catch (error) {
      console.error('❌ Error loading posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadFollowRequests = async () => {
    try {
      // Obtener userId igual que en handleCreatePost
      let userId = currentUser?.id;
      if (!userId) {
        try {
          const savedUser = localStorage.getItem('ds_user');
          if (savedUser) {
            const user = JSON.parse(savedUser);
            userId = user.id;
          }
        } catch (e) {
          console.error('Error parsing user from localStorage:', e);
        }
      }
      
      if (!userId) {
        console.log('❌ No hay usuario para cargar follow requests');
        setFollowRequests([]);
        return;
      }

      console.log('🔄 Cargando follow requests para usuario:', userId);
      
      // Simplificar consulta sin JOINs por ahora
      const { data, error } = await supabase
        .from('follow_requests')
        .select('*')
        .eq('requested_id', userId.toString())
        .eq('status', 'pending');

      if (error) {
        console.error('❌ Error loading follow requests:', error);
        setFollowRequests([]);
        return;
      }
      
      console.log('✅ Follow requests cargados:', data?.length || 0);
      setFollowRequests(data || []);
    } catch (error) {
      console.error('❌ Error loading follow requests:', error);
      setFollowRequests([]);
    }
  };

  const loadFollowing = async () => {
    try {
      // Obtener userId igual que en handleCreatePost
      let userId = currentUser?.id;
      if (!userId) {
        try {
          const savedUser = localStorage.getItem('ds_user');
          if (savedUser) {
            const user = JSON.parse(savedUser);
            userId = user.id;
          }
        } catch (e) {
          console.error('Error parsing user from localStorage:', e);
        }
      }
      
      if (!userId) {
        console.log('❌ No hay usuario para cargar following');
        setFollowing([]);
        return;
      }

      console.log('🔄 Cargando following para usuario:', userId);
      
      const { data, error } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId.toString());

      if (error) {
        console.error('❌ Error loading following:', error);
        setFollowing([]);
        return;
      }
      
      console.log('✅ Following cargado:', data?.length || 0);
      setFollowing(data?.map(f => f.following_id) || []);
    } catch (error) {
      console.error('❌ Error loading following:', error);
      setFollowing([]);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim() && !selectedMedia) return;

    try {
      setLoading(true);
      
      // Obtener información del usuario actual
      const { userId, userInfo } = getCurrentUserInfo();
      
      // Si no encontramos usuario, usar un fallback temporal pero informar al usuario
      let finalUserId = userId;
      let finalUserInfo = userInfo;
      
      if (!finalUserId) {
        console.log('⚠️ No se encontró usuario, usando fallback temporal');
        // Intentar obtener cualquier dato de usuario que tengamos
        finalUserId = "temp-user"; // ID temporal
        finalUserInfo = {
          id: "temp-user",
          email: "usuario.temporal@example.com",
          fullName: "Usuario Temporal"
        };
        
        // Mostrar warning pero continuar
        console.warn('🚨 Creando post con usuario temporal. Recomendable verificar autenticación.');
      }

      console.log('🔍 DEBUG - Creando post para usuario:', finalUserInfo?.fullName || finalUserInfo?.email, 'ID:', finalUserId);
      
      let mediaUrl = null;

      // Upload media if selected
      if (selectedMedia) {
        console.log('🔍 DEBUG - Subiendo media...');
        const fileExt = selectedMedia.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('social-media')
          .upload(fileName, selectedMedia);

        if (uploadError) {
          console.error('❌ Error subiendo media:', uploadError);
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('social-media')
          .getPublicUrl(fileName);
        
        mediaUrl = publicUrl;
        console.log('✅ Media subida:', mediaUrl);
      }

      // Preparar datos del post
      const postData = {
        user_id: finalUserId.toString(),
        content: newPost.trim(),
        media_url: mediaUrl,
        media_type: selectedMedia?.type?.startsWith('video/') ? 'video' : selectedMedia ? 'image' : null
      };
      
      console.log('🔍 DEBUG - Datos del post:', postData);

      const { error } = await supabase
        .from('social_posts')
        .insert(postData);

      if (error) {
        console.error('❌ Error insertando post:', error);
        throw error;
      }

      console.log('✅ Post creado exitosamente por:', finalUserInfo?.fullName || finalUserInfo?.email);
      
      // Mostrar mensaje de éxito
      if (finalUserId === "temp-user") {
        alert('Post creado exitosamente (modo temporal). Recomendamos verificar tu sesión.');
      }
      
      setNewPost('');
      setSelectedMedia(null);
      setMediaPreview(null);
      loadPosts(); // Recargar posts para mostrar el nuevo
    } catch (error) {
      console.error('❌ Error creating post:', error);
      console.error('❌ Error details:', error.message);
      alert(`Error al crear la publicación: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMediaSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedMedia(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setMediaPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      // Obtener userId igual que en otras funciones
      let userId = currentUser?.id;
      if (!userId) {
        try {
          const savedUser = localStorage.getItem('ds_user');
          if (savedUser) {
            const user = JSON.parse(savedUser);
            userId = user.id;
          }
        } catch (e) {
          console.error('Error parsing user from localStorage:', e);
        }
      }
      
      if (!userId) {
        console.log('❌ No hay usuario para dar like');
        return;
      }

      console.log('🔄 Toggle like para post:', postId, 'usuario:', userId);

      const existingLike = await supabase
        .from('social_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId.toString())
        .single();

      if (existingLike.data) {
        // Remove like
        console.log('🔄 Removiendo like...');
        await supabase
          .from('social_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId.toString());
      } else {
        // Add like
        console.log('🔄 Agregando like...');
        await supabase
          .from('social_likes')
          .insert({
            post_id: postId,
            user_id: userId.toString()
          });
      }

      console.log('✅ Like toggle exitoso');
      loadPosts();
    } catch (error) {
      console.error('❌ Error toggling like:', error);
    }
  };

  const handleFollowRequest = async (targetUserId) => {
    try {
      // Obtener userId igual que en otras funciones
      let userId = currentUser?.id;
      if (!userId) {
        try {
          const savedUser = localStorage.getItem('ds_user');
          if (savedUser) {
            const user = JSON.parse(savedUser);
            userId = user.id;
          }
        } catch (e) {
          console.error('Error parsing user from localStorage:', e);
        }
      }
      
      if (!userId) {
        console.log('❌ No hay usuario para follow request');
        return;
      }

      const { error } = await supabase
        .from('follow_requests')
        .insert({
          requester_id: userId.toString(),
          requested_id: targetUserId,
          status: 'pending'
        });

      if (error) throw error;
      alert('Solicitud de seguimiento enviada');
    } catch (error) {
      console.error('Error sending follow request:', error);
      alert('Error al enviar solicitud');
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      // Obtener userId igual que en otras funciones
      let userId = currentUser?.id;
      if (!userId) {
        try {
          const savedUser = localStorage.getItem('ds_user');
          if (savedUser) {
            const user = JSON.parse(savedUser);
            userId = user.id;
          }
        } catch (e) {
          console.error('Error parsing user from localStorage:', e);
        }
      }
      
      if (!userId) {
        console.log('❌ No hay usuario para accept request');
        return;
      }

      // Accept the request
      const { error: updateError } = await supabase
        .from('follow_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Create follow relationship
      const request = followRequests.find(r => r.id === requestId);
      const { error: followError } = await supabase
        .from('follows')
        .insert({
          follower_id: request.requester_id,
          following_id: userId.toString()
        });

      if (followError) throw followError;

      loadFollowRequests();
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const { error } = await supabase
        .from('follow_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;
      loadFollowRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  const PostCard = ({ post }) => {
    // Obtener usuario igual que en otras funciones
    let userId = currentUser?.id;
    if (!userId) {
      try {
        const savedUser = localStorage.getItem('ds_user');
        if (savedUser) {
          const user = JSON.parse(savedUser);
          userId = user.id;
        }
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    }
    
    const isLiked = post.likes?.some(like => like.user_id === userId?.toString()) || false;
    const likesCount = post.likes?.length || 0;
    const commentsCount = post.comments?.length || 0;

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        {/* User info mejorada */}
        <div className="flex items-center space-x-3 mb-3">
          {/* Avatar del usuario - MEJORADO CON COMPONENTE REUTILIZABLE */}
          <ClickableAvatar 
            user={{
              profilePhoto: post.user?.avatar_url,
              fullName: post.user?.fullName || post.user?.name,
              email: post.user?.email
            }}
            size="md"
            onProfileImageClick={handleProfileImageClick}
            className="flex-shrink-0"
          />
          
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <div className="font-semibold text-gray-900">
                {post.user?.fullName || post.user?.name || 'Usuario Anónimo'}
              </div>
              {/* Badge de rol si está disponible */}
              {post.user?.role && (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  post.user.role === 'admin' 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {post.user.role}
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500 flex items-center space-x-2">
              <span>{new Date(post.created_at).toLocaleDateString()}</span>
              <span>•</span>
              <span>{new Date(post.created_at).toLocaleTimeString()}</span>
              {post.user?.email && (
                <>
                  <span>•</span>
                  <span className="text-xs">{post.user.email}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        {post.content && (
          <p className="text-gray-800 mb-3">{post.content}</p>
        )}

        {/* Media */}
        {post.media_url && (
          <div className="mb-3">
            {post.media_type === 'video' ? (
              <video
                className="w-full max-h-96 rounded-lg"
                controls
                src={post.media_url}
              />
            ) : (
              <img
                className="w-full max-h-96 object-cover rounded-lg"
                src={post.media_url}
                alt="Post media"
              />
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center space-x-6 pt-3 border-t border-gray-100">
          <button
            onClick={() => handleLikePost(post.id)}
            className={`flex items-center space-x-2 text-sm ${
              isLiked ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
            }`}
          >
            <svg className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>{likesCount}</span>
          </button>

          <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>{commentsCount}</span>
          </button>

          <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-green-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            <span>Compartir</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Red Social DS</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 py-3 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('feed')}
              className={`pb-2 text-sm font-medium border-b-2 ${
                activeTab === 'feed'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Feed
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`pb-2 text-sm font-medium border-b-2 ${
                activeTab === 'requests'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Solicitudes ({followRequests.length})
            </button>
            <button
              onClick={() => setShowUserExplorer(true)}
              className="pb-2 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Descubrir
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'feed' && (
            <div className="h-full flex">
              {/* Main Feed */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* DEBUG: Estado del usuario */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-sm">
                  <div className="font-semibold text-yellow-800 mb-2">🔍 Debug Usuario:</div>
                  <div className="text-yellow-700">
                    <div>• currentUser prop: {currentUser ? '✅ Existe' : '❌ undefined'}</div>
                    <div>• currentUser.id: {currentUser?.id || 'N/A'}</div>
                    <div>• currentUser.email: {currentUser?.email || 'N/A'}</div>
                    <div>• localStorage ds_user: {localStorage.getItem('ds_user') ? '✅ Existe' : '❌ No existe'}</div>
                    <div>• getCurrentUserInfo: {(() => {
                      const { userId } = getCurrentUserInfo();
                      return userId ? `✅ ${userId}` : '❌ No encontrado';
                    })()}</div>
                    <div className="mt-2">
                      <details className="text-xs">
                        <summary className="cursor-pointer font-semibold">📊 Estructura completa currentUser:</summary>
                        <pre className="mt-1 bg-gray-100 p-2 rounded overflow-auto max-h-32">
                          {JSON.stringify(currentUser, null, 2)}
                        </pre>
                      </details>
                    </div>
                    <div className="mt-1">
                      <details className="text-xs">
                        <summary className="cursor-pointer font-semibold">📦 localStorage ds_user:</summary>
                        <pre className="mt-1 bg-gray-100 p-2 rounded overflow-auto max-h-32">
                          {localStorage.getItem('ds_user')}
                        </pre>
                      </details>
                    </div>
                  </div>
                </div>

                {/* Create Post - Mejorado */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                  <div className="flex space-x-3">
                    {/* Avatar del usuario actual */}
                    <div className="flex-shrink-0">
                      {currentUser?.profilePhoto ? (
                        <img
                          className="w-10 h-10 rounded-full object-cover"
                          src={currentUser.profilePhoto}
                          alt={`Avatar de ${currentUser.fullName || currentUser.email}`}
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {currentUser?.fullName?.charAt(0)?.toUpperCase() || 
                           currentUser?.email?.charAt(0)?.toUpperCase() || 
                           'U'}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      {/* Info del usuario actual */}
                      <div className="mb-2">
                        <span className="text-sm text-gray-600">
                          Publicando como: <span className="font-semibold text-gray-900">
                            {currentUser?.fullName || currentUser?.email || 'Usuario'}
                          </span>
                        </span>
                      </div>
                      
                      <textarea
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        placeholder="¿Qué está pasando en tu entrenamiento?"
                        className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                      />
                      
                      {mediaPreview && (
                        <div className="mt-3 relative">
                          {selectedMedia?.type?.startsWith('video/') ? (
                            <video className="max-h-48 rounded-lg" controls src={mediaPreview} />
                          ) : (
                            <img className="max-h-48 rounded-lg" src={mediaPreview} alt="Preview" />
                          )}
                          <button
                            onClick={() => {
                              setSelectedMedia(null);
                              setMediaPreview(null);
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex space-x-3">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,video/*"
                            onChange={handleMediaSelect}
                            className="hidden"
                          />
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Foto/Video</span>
                          </button>
                        </div>
                        
                        <button
                          onClick={handleCreatePost}
                          disabled={loading || (!newPost.trim() && !selectedMedia)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? 'Publicando...' : 'Publicar'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Posts */}
                {loading && posts.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : (
                  <div>
                    {posts.map(post => (
                      <PostCard key={post.id} post={post} />
                    ))}
                    {posts.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No hay publicaciones aún. ¡Sé el primero en compartir!
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Solicitudes de seguimiento</h3>
              {followRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No tienes solicitudes pendientes
                </div>
              ) : (
                <div className="space-y-4">
                  {followRequests.map(request => (
                    <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {request.requester?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="font-semibold">{request.requester?.name}</div>
                          <div className="text-sm text-gray-500">{request.requester?.email}</div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAcceptRequest(request.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Aceptar
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Rechazar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* User Explorer Modal */}
      {showUserExplorer && (
        <UserExplorer 
          currentUser={currentUser} 
          onClose={() => setShowUserExplorer(false)} 
        />
      )}

      {/* Profile Image Modal */}
      {showProfileImageModal && selectedProfileImage && (
        <ProfileImageModal 
          imageData={selectedProfileImage}
          onClose={closeModal} 
        />
      )}
    </div>
  );
};

export default SocialFeed;
