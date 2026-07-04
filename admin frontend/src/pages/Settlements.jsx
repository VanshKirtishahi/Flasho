import React, { useState, useEffect } from 'react';
import { Wallet, User, Building2, Loader2, IndianRupee, History, ArrowRightLeft, XCircle, Landmark, QrCode, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api'; // 🟢 IMPORT THE CENTRALIZED API CLIENT

const formatCurrency = (amount) => Number(amount || 0).toFixed(2);

export default function Settlements() {
  const [activeTab, setActiveTab] = useState('requests'); 
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchSettlements();
  }, [activeTab]);

  const fetchSettlements = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'requests' 
        ? '/admin/withdrawals/pending' 
        : `/admin/settlements/${activeTab}`;

      // 🟢 NO MORE MANUAL SESSIONS OR HEADERS - The API client handles it!
      const response = await api.get(endpoint);
      
      setData(response?.data || []);
    } catch (error) {
      toast.error("Failed to load financial data");
    } finally {
      setLoading(false);
    }
  };

  // ONLY PENDING REQUESTS CAN BE ACTIONED NOW
  const handleWithdrawalAction = async (id, status) => {
    const isApprove = status === 'approved';
    const msg = isApprove 
      ? `Are you sure? This will instantly transfer real money to the partner's account via RazorpayX.` 
      : `Are you sure? This will reject the request and refund the money back to the partner's in-app wallet.`;
      
    if (!window.confirm(msg)) return;
    
    setProcessingId(id);
    try {
      // 🟢 DYNAMIC ENDPOINTS & NO MANUAL HEADERS
      await api.put(`/admin/withdrawals/${id}`, { status });
      
      toast.success(isApprove ? `Funds transferred successfully!` : `Request rejected & refunded!`);
      setData((prev) => prev.filter(item => item?._id !== id));
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to process request");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center">
            <Wallet className="mr-3 text-[#00C896]" size={32} />
            Payouts & Settlements
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-2">
            Manage pending bank transfers. Partner wallets are view-only until they request a withdrawal.
          </p>
        </div>
        <div className="flex bg-white rounded-xl shadow-sm border border-gray-100 p-1 overflow-x-auto">
          <button onClick={() => setActiveTab('requests')} className={`whitespace-nowrap flex items-center px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'requests' ? 'bg-[#00C896]/10 text-[#00C896]' : 'text-gray-500 hover:text-gray-900'}`}>
            <ArrowRightLeft size={16} className="mr-2" /> Pending Requests
          </button>
          <button onClick={() => setActiveTab('workers')} className={`whitespace-nowrap flex items-center px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'workers' ? 'bg-[#00C896]/10 text-[#00C896]' : 'text-gray-500 hover:text-gray-900'}`}>
            <User size={16} className="mr-2" /> Independent Partners
          </button>
          <button onClick={() => setActiveTab('agencies')} className={`whitespace-nowrap flex items-center px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'agencies' ? 'bg-[#00C896]/10 text-[#00C896]' : 'text-gray-500 hover:text-gray-900'}`}>
            <Building2 size={16} className="mr-2" /> Agencies
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl shadow-black/5 border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="p-5">{activeTab === 'requests' ? 'Date & ID' : activeTab === 'workers' ? 'Partner Name' : 'Agency Name'}</th>
                <th className="p-5">{activeTab === 'requests' ? 'Requester Details' : 'Contact Info'}</th>
                <th className="p-5">{activeTab === 'requests' ? 'Payout Destination' : 'Completed Jobs'}</th>
                <th className="p-5 text-right">{activeTab === 'requests' ? 'Requested Amount' : 'Current Wallet Balance'}</th>
                <th className="p-5 text-center">{activeTab === 'requests' ? 'Actions' : 'Status'}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center">
                    <Loader2 className="animate-spin mx-auto text-[#00C896]" size={32} />
                    <p className="text-sm text-gray-500 mt-3 font-medium">Loading financial data...</p>
                  </td>
                </tr>
              ) : data?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center">
                    <History className="mx-auto text-gray-300 mb-3" size={40} />
                    <p className="text-gray-500 font-bold">No data found in this category.</p>
                  </td>
                </tr>
              ) : (
                data?.map((item) => {
                  const isSettled = activeTab !== 'requests' && (!item?.wallet_balance || item?.wallet_balance <= 0);
                  
                  return (
                    <tr key={item?._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="p-5">
                        {activeTab === 'requests' ? (
                           <div>
                             <p className="font-bold text-gray-900">{new Date(item.created_at).toLocaleDateString()}</p>
                             <p className="text-[10px] font-bold text-gray-400 mt-0.5 tracking-wider uppercase">ID: {item._id.slice(-6)}</p>
                           </div>
                        ) : (
                          <div className="font-bold text-gray-900 flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3 text-[#00C896] font-black text-xs">
                              {activeTab === 'workers' ? item?.full_name?.charAt(0) : item?.name?.charAt(0)}
                            </div>
                            {activeTab === 'workers' ? item?.full_name : item?.name}
                          </div>
                        )}
                      </td>
                      
                      <td className="p-5">
                        {activeTab === 'requests' ? (
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-gray-900">{item.entity_name}</span>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${item.entity_type === 'agency' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                {item.entity_type}
                              </span>
                            </div>
                            <p className="text-xs font-medium text-gray-500">{item.contact_info}</p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm font-medium text-gray-800">{item?.phone || 'N/A'}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{item?.email || 'No email provided'}</p>
                          </div>
                        )}
                      </td>

                      <td className="p-5">
                        {activeTab === 'requests' ? (
                          <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm inline-block min-w-[200px]">
                            <div className="flex items-center gap-1.5 mb-2">
                              {item.payout_method === 'upi' ? <QrCode size={14} className="text-purple-600"/> : <Landmark size={14} className="text-blue-600"/>}
                              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                {item.payout_method === 'upi' ? 'UPI Transfer' : 'Bank Transfer'}
                              </span>
                            </div>
                            {item.payout_method === 'upi' ? (
                              <p className="text-sm font-bold text-gray-800">{item.payout_details?.upi_id || 'N/A'}</p>
                            ) : (
                              <div>
                                <p className="text-sm font-bold text-gray-800">{item.payout_details?.account_name || 'N/A'}</p>
                                <p className="text-xs text-gray-600 font-medium font-mono mt-1">A/C: {item.payout_details?.account_number || 'N/A'}</p>
                                <p className="text-xs text-gray-600 font-medium font-mono">IFSC: {item.payout_details?.ifsc_code || 'N/A'}</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="font-bold text-gray-600 ml-6">{item?.completed_jobs || 0}</span>
                        )}
                      </td>

                      <td className="p-5 text-right">
                        <div className={`inline-flex items-center px-3 py-1.5 rounded-lg font-black text-sm ${isSettled ? 'bg-gray-100 text-gray-400' : activeTab === 'requests' ? 'bg-[#E8F8F0] text-[#048C4F]' : 'bg-orange-50 text-orange-600'}`}>
                          <IndianRupee size={14} className="mr-0.5" />
                          {formatCurrency(activeTab === 'requests' ? item.amount : item?.wallet_balance)}
                        </div>
                      </td>

                      <td className="p-5 text-center">
                        {activeTab === 'requests' ? (
                          <div className="flex items-center justify-center gap-2">
                             <button
                               onClick={() => handleWithdrawalAction(item._id, 'approved')}
                               disabled={processingId === item._id}
                               className="px-3 py-2 bg-[#00C896] hover:bg-[#00A87A] text-white text-xs font-bold rounded-lg transition-colors flex items-center shadow-md shadow-[#00C896]/20"
                             >
                               {processingId === item._id ? <Loader2 size={14} className="animate-spin mr-1"/> : null}
                               Approve & Transfer
                             </button>
                             <button
                               onClick={() => handleWithdrawalAction(item._id, 'rejected')}
                               disabled={processingId === item._id}
                               className="px-3 py-2 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-500 text-xs font-bold rounded-lg transition-colors flex items-center"
                               title="Reject & Refund to Wallet"
                             >
                               Reject <XCircle size={14} className="ml-1" />
                             </button>
                          </div>
                        ) : (
                          // READ-ONLY BADGE
                          <div className={`inline-flex items-center justify-center px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg ${isSettled ? 'bg-gray-50 text-gray-400' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                            {isSettled ? (
                              <>No Pending Funds</>
                            ) : (
                              <><Clock size={12} className="mr-1.5" /> Waiting for Withdrawal Request</>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}