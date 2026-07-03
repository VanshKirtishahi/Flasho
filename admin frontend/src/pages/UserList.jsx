import { useEffect, useState } from 'react';
import axios from 'axios';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Trash2, Search, Users as UsersIcon, MapPin, Mail, Phone, Calendar } from 'lucide-react';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // 🟢 FIXED: Calling the correct Admin endpoint
      const res = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      
      setUsers(res.data);
    } catch (error) {
      toast.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      
      toast.success('Customer deleted successfully');
      setUsers(users.filter(u => u._id !== id));
    } catch (error) {
      toast.error('Failed to delete customer');
    }
  };

  const filteredUsers = users.filter(u => {
    if (!search) return true;
    const term = search.toLowerCase();
    return u.full_name?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term);
  });

  return (
    <div className="max-w-7xl space-y-6">
      
      {/* Header & Search */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Customer Directory</h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">Manage and view all registered platform clients.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2">
            <UsersIcon size={16} /> Total: {users.length}
          </div>
          
          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00C896]/20 focus:border-[#00C896] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Grid of Users */}
      {loading ? (
        <div className="p-12 text-center text-gray-500 font-medium bg-white rounded-2xl shadow-sm border border-gray-100">
          Loading customers...
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
          <UsersIcon className="mx-auto text-gray-300 mb-3" size={40}/>
          <p className="text-gray-500 font-bold">{search ? 'No customers match your search' : 'No customers found'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div key={user._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow relative group">
              
              {/* Delete Action (Visible on Hover) */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => deleteUser(user._id, user.full_name)}
                  className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors shadow-sm"
                  title="Delete Customer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Top Banner Info */}
              <div className="p-6 border-b border-gray-50 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm flex-shrink-0">
                  {user.full_name?.charAt(0).toUpperCase() || 'C'}
                </div>
                <div className="pt-1 overflow-hidden">
                  <h3 className="font-bold text-gray-900 text-lg truncate pr-8">{user.full_name || 'Unnamed User'}</h3>
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mt-0.5">Client</p>
                </div>
              </div>

              {/* Details List */}
              <div className="p-5 bg-gray-50/50 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-6 flex justify-center"><Mail size={14} className="text-gray-400" /></div>
                  <span className="text-gray-600 truncate">{user.email || 'No email provided'}</span>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-6 flex justify-center"><Phone size={14} className="text-gray-400" /></div>
                  <span className="text-gray-600">{user.phone || 'No phone number'}</span>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-6 flex justify-center"><Calendar size={14} className="text-gray-400" /></div>
                  <span className="text-gray-600">Joined {new Date(user.created_at).toLocaleDateString()}</span>
                </div>

                {user.addresses && user.addresses.length > 0 && (
                  <div className="flex items-start gap-3 text-sm pt-2 mt-2 border-t border-gray-100">
                    <div className="w-6 flex justify-center mt-0.5"><MapPin size={14} className="text-gray-400" /></div>
                    <div className="text-gray-600">
                      <span className="font-bold text-gray-700 block mb-0.5">Saved Addresses ({user.addresses.length}):</span>
                      {user.addresses[0].address}, {user.addresses[0].city}
                      {user.addresses.length > 1 && <span className="text-xs italic text-gray-400 block mt-0.5">+{user.addresses.length - 1} more</span>}
                    </div>
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}