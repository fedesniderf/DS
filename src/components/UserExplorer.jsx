import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const UserExplorer = ({ currentUser, onClose }) => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [following, setFollowing] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    loadUsers();
    loadFollowing();
    loadPendingRequests();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, avatar_url')
        .neq('id', currentUser.id)
        .limit(50);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFollowing = async () => {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', currentUser.id);

      if (error) throw error;
      setFollowing(data?.map(f => f.following_id) || []);
    } catch (error) {
      console.error('Error loading following:', error);
    }
  };

  const loadPendingRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('follow_requests')
        .select('requested_id')
        .eq('requester_id', currentUser.id)
        .eq('status', 'pending');

      if (error) throw error;
      setPendingRequests(data?.map(r => r.requested_id) || []);
    } catch (error) {
      console.error('Error loading pending requests:', error);
    }
  };

  const handleFollowRequest = async (targetUserId) => {
    try {
      const { error } = await supabase
        .from('follow_requests')
        .insert({
          requester_id: currentUser.id,
          requested_id: targetUserId,
          status: 'pending'
        });

      if (error) throw error;
      
      setPendingRequests(prev => [...prev, targetUserId]);
      alert('Solicitud de seguimiento enviada');
    } catch (error) {
      console.error('Error sending follow request:', error);
      if (error.code === '23505') {
        alert('Ya has enviado una solicitud a este usuario');
      } else {
        alert('Error al enviar solicitud');
      }
    }
  };

  const handleUnfollow = async (targetUserId) => {
    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUser.id)
        .eq('following_id', targetUserId);

      if (error) throw error;
      
      setFollowing(prev => prev.filter(id => id !== targetUserId));
      alert('Dejaste de seguir al usuario');
    } catch (error) {
      console.error('Error unfollowing user:', error);
      alert('Error al dejar de seguir');
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getButtonState = (userId) => {
    if (following.includes(userId)) {
      return 'following';
    } else if (pendingRequests.includes(userId)) {
      return 'pending';
    } else {
      return 'follow';
    }
  };

  const renderActionButton = (user) => {
    const state = getButtonState(user.id);

    switch (state) {
      case 'following':
        return (
          <button
            onClick={() => handleUnfollow(user.id)}
            className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
          >
            Siguiendo
          </button>
        );
      case 'pending':
        return (
          <button
            disabled
            className="px-3 py-1 bg-yellow-500 text-white rounded text-sm cursor-not-allowed"
          >
            Pendiente
          </button>
        );
      case 'follow':
        return (
          <button
            onClick={() => handleFollowRequest(user.id)}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Seguir
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Descubrir Usuarios</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b border-gray-200">
          <input
            type="text"
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios disponibles'}
                </div>
              ) : (
                filteredUsers.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{user.name || 'Sin nombre'}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                    {renderActionButton(user)}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserExplorer;
