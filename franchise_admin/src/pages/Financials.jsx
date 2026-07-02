import React, { useState, useEffect } from 'react';
import { Wallet, DollarSign, TrendingUp, CheckCircle, Loader2, AlertCircle, X, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';

const FRANCHISE_COMMISSION_RATE = 0.25; 

const formatCurrency = (amount) => Number(amount || 0).toFixed(2);

const Financials = () => {
  const [workers, setWorkers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Worker Payout Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Agency Wallet State
  const [agencyWallet, setAgencyWallet] = useState(0);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // 🟢 NEW: Agency Bank Details State
  const [agencyPayoutMethod, setAgencyPayoutMethod] = useState('upi');
  const [agencyUpi, setAgencyUpi] = useState('');
  const [agencyAccName, setAgencyAccName] = useState('');
  const [agencyAccNo, setAgencyAccNo] = useState('');
  const [agencyIfsc, setAgencyIfsc] = useState('');

  // Global Stats State
  const [globalStats, setGlobalStats] = useState({
    totalGenerated: 0,
    totalFranchiseCut: 0,
    totalWorkerCut: 0,
    totalPendingPayouts: 0,
  });

  const fetchData = async () => {
    try {
      const [txRes, workersRes, jobsRes, walletRes] = await Promise.all([
        api.get('/franchiseDashboard/transactions/all'),
        api.get('/franchiseDashboard/workers'),
        api.get('/franchiseDashboard/jobs'),
        api.get('/franchiseDashboard/wallet') 
      ]);
      
      const txData = txRes.data;
      const jobsData = jobsRes.data;
      
      setAgencyWallet(Number((walletRes.data.wallet_balance || 0).toFixed(2)));
      
      let sysTotalGenerated = 0;
      let sysTotalFranchise = 0;
      let sysTotalWorker = 0;
      let sysTotalPending = 0;

      const computedWorkers = workersRes.data.map(worker => {
        const wId = String(worker?._id);

        const workerJobs = jobsData.filter(j => {
          const isCompleted = String(j?.status).toLowerCase() === 'completed';
          const jobWorkerId = String(j?.worker_id?._id || j?.worker_id);
          return isCompleted && (jobWorkerId === wId);
        });

        const totalGenerated = Number(workerJobs.reduce((sum, j) => {
          return sum + (Number(j?.price) || Number(j?.amount) || 0);
        }, 0).toFixed(2));
        
        const franchiseCut = Number((totalGenerated * FRANCHISE_COMMISSION_RATE).toFixed(2));
        const workerCut = Number((totalGenerated - franchiseCut).toFixed(2)); 
        
        const workerPayouts = txData.filter(t => 
          String(t?.category).toLowerCase() === 'payout' && 
          String(t?.description).toLowerCase().includes(String(worker?.full_name).toLowerCase())
        );
        
        const totalPaid = Number(workerPayouts.reduce((sum, t) => sum + (Number(t?.amount) || 0), 0).toFixed(2));
        const pendingBalance = Number(Math.max(0, workerCut - totalPaid).toFixed(2));

        sysTotalGenerated += totalGenerated;
        sysTotalFranchise += franchiseCut;
        sysTotalWorker += workerCut;
        sysTotalPending += pendingBalance;

        return {
          ...worker,
          totalGenerated,
          franchiseCut,
          workerCut,
          totalPaid,
          pendingBalance
        };
      });

      setGlobalStats({
        totalGenerated: Number(sysTotalGenerated.toFixed(2)),
        totalFranchiseCut: Number(sysTotalFranchise.toFixed(2)),
        totalWorkerCut: Number(sysTotalWorker.toFixed(2)),
        totalPendingPayouts: Number(sysTotalPending.toFixed(2))
      });

      setTransactions(txData);
      setWorkers(computedWorkers.sort((a, b) => b.pendingBalance - a.pendingBalance));
    } catch (error) {
      console.error("Error fetching financials:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🟢 HANDLE FRANCHISE WALLET WITHDRAWAL
  const handleAgencyWithdraw = async (e) => {
    e.preventDefault();
    const cleanAmount = Number(Number(withdrawAmount).toFixed(2));

    if (cleanAmount <= 0 || cleanAmount > agencyWallet) {
      toast.error("Invalid withdrawal amount!");
      return;
    }

    if (agencyPayoutMethod === 'upi' && !agencyUpi.trim()) {
      toast.error("Please enter your UPI ID.");
      return;
    }
    if (agencyPayoutMethod === 'bank' && (!agencyAccName || !agencyAccNo || !agencyIfsc)) {
      toast.error("Please fill in all bank details.");
      return;
    }

    setIsWithdrawing(true);
    try {
      const payout_details = agencyPayoutMethod === 'upi'
        ? { upi_id: agencyUpi }
        : { account_name: agencyAccName, account_number: agencyAccNo, ifsc_code: agencyIfsc };

      const res = await api.post('/agency/withdraw', { 
        amount: cleanAmount,
        payout_method: agencyPayoutMethod,
        payout_details
      });
      
      toast.success(res.data.message || "Withdrawal successful!");
      
      setAgencyWallet(Number((res.data.new_balance || 0).toFixed(2)));
      setShowWithdrawModal(false);
      setWithdrawAmount('');
    } catch (error) {
      toast.error(error.response?.data?.error || "Withdrawal failed");
    } finally {
      setIsWithdrawing(false);
    }
  };

  // HANDLE WORKER PAYOUT
  const handleProcessPayout = async (e) => {
    e.preventDefault();
    const cleanAmount = Number(Number(payoutAmount).toFixed(2));

    if (!selectedWorker || !cleanAmount || cleanAmount <= 0) {
      toast.error("Please enter a valid payout amount.");
      return;
    }

    if (cleanAmount > selectedWorker.pendingBalance) {
      toast.error("You cannot pay more than the pending balance!");
      return;
    }

    setIsProcessing(true);
    try {
      await api.post('/franchiseDashboard/transactions', {
        amount: cleanAmount,
        category: 'payout',
        type: 'debit',
        description: `Payout to ${selectedWorker.full_name}`,
        user_id: selectedWorker._id
      });
      toast.success(`Successfully paid ₹${formatCurrency(cleanAmount)} to ${selectedWorker.full_name}`);
      setIsModalOpen(false);
      setPayoutAmount('');
      await fetchData(); 
    } catch (error) {
      toast.error("Failed to process payout. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const openPayoutModal = (worker) => {
    setSelectedWorker(worker);
    setPayoutAmount(worker.pendingBalance.toFixed(2));
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#05AC5F] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-10">
      
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Financials & Payouts</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">Manage franchise revenue and worker balances.</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#05AC5F] to-[#03884A] rounded-3xl p-8 mb-10 text-white shadow-xl shadow-[#05AC5F]/20 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
            <Building2 size={32} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white/80 uppercase tracking-wider mb-1">Agency Wallet Balance</p>
            <h2 className="text-4xl font-black">₹{formatCurrency(agencyWallet)}</h2>
          </div>
        </div>
        <button 
          onClick={() => { setWithdrawAmount(agencyWallet.toFixed(2)); setShowWithdrawModal(true); }}
          disabled={agencyWallet <= 0}
          className="px-8 py-4 bg-white text-[#05AC5F] hover:bg-gray-50 rounded-xl font-extrabold text-sm shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
        >
          Withdraw Funds
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard 
          title="Total Gross Revenue" 
          value={`₹${formatCurrency(globalStats.totalGenerated)}`} 
          icon={<TrendingUp className="text-blue-600" />} 
          subtitle="All completed jobs"
          color="bg-blue-50"
        />
        <StatCard 
          title="Franchise Earnings" 
          value={`₹${formatCurrency(globalStats.totalFranchiseCut)}`} 
          icon={<Wallet className="text-[#05AC5F]" />} 
          subtitle={`${FRANCHISE_COMMISSION_RATE * 100}% Commission Cut`}
          color="bg-[#E8F8F0]"
        />
        <StatCard 
          title="Worker Earnings" 
          value={`₹${formatCurrency(globalStats.totalWorkerCut)}`} 
          icon={<DollarSign className="text-purple-600" />} 
          subtitle={`${(1 - FRANCHISE_COMMISSION_RATE) * 100}% Worker Cut`}
          color="bg-purple-50"
        />
        <StatCard 
          title="Pending Payouts" 
          value={`₹${formatCurrency(globalStats.totalPendingPayouts)}`} 
          icon={<AlertCircle className="text-orange-600" />} 
          subtitle="Money owed to workers"
          color="bg-orange-50"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900">Worker Balances</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400 font-bold">
                <th className="px-6 py-4">Professional</th>
                <th className="px-6 py-4 text-right">Total Generated</th>
                <th className="px-6 py-4 text-right">Worker's Cut ({(1 - FRANCHISE_COMMISSION_RATE) * 100}%)</th>
                <th className="px-6 py-4 text-right">Already Paid</th>
                <th className="px-6 py-4 text-right">Pending Balance</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {workers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500 font-medium">No workers found.</td>
                </tr>
              ) : (
                workers.map(worker => (
                  <tr key={worker._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-[#E8F8F0] flex items-center justify-center text-[#05AC5F] font-bold text-lg mr-3">
                          {worker.full_name?.charAt(0).toUpperCase() || 'W'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{worker.full_name}</p>
                          <p className="text-xs font-medium text-gray-500">{worker.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-gray-600">
                      ₹{formatCurrency(worker.totalGenerated)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                      ₹{formatCurrency(worker.workerCut)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-[#05AC5F]">
                      ₹{formatCurrency(worker.totalPaid)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-block px-3 py-1 rounded-lg text-sm font-bold ${
                        worker.pendingBalance > 0 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        ₹{formatCurrency(worker.pendingBalance)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => openPayoutModal(worker)}
                        disabled={worker.pendingBalance <= 0}
                        className={`inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                          worker.pendingBalance > 0 
                            ? 'bg-[#05AC5F] text-white hover:bg-[#048C4F] shadow-sm shadow-[#05AC5F]/30' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {worker.pendingBalance > 0 ? 'Settle Balance' : 'Settled'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">Withdraw Agency Funds</h3>
              <button onClick={() => setShowWithdrawModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAgencyWithdraw} className="p-6">
              <div className="mb-6 bg-[#E8F8F0] rounded-xl p-4 border border-[#05AC5F]/20 text-center">
                <p className="text-xs font-bold text-[#05AC5F] uppercase tracking-wider mb-1">Available to Withdraw</p>
                <p className="text-3xl font-black text-[#048C4F]">₹{formatCurrency(agencyWallet)}</p>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                  Amount to Withdraw (₹)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-500 font-bold text-lg">₹</span>
                  </div>
                  <input
                    type="number" step="0.01" required min="0.01" max={agencyWallet}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#05AC5F]/20 focus:border-[#05AC5F] outline-none text-lg font-bold transition-all text-gray-900"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* 🟢 NEW: AGENCY PAYOUT DETAILS TABS */}
              <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
                <button
                  type="button"
                  onClick={() => setAgencyPayoutMethod('upi')}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${agencyPayoutMethod === 'upi' ? 'bg-white text-[#05AC5F] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  UPI Transfer
                </button>
                <button
                  type="button"
                  onClick={() => setAgencyPayoutMethod('bank')}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${agencyPayoutMethod === 'bank' ? 'bg-white text-[#05AC5F] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Bank Transfer
                </button>
              </div>

              {/* 🟢 NEW: CONDITIONAL INPUTS */}
              {agencyPayoutMethod === 'upi' ? (
                <div className="mb-6">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">UPI ID</label>
                  <input
                    type="text"
                    required
                    value={agencyUpi}
                    onChange={(e) => setAgencyUpi(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#05AC5F]/20 focus:border-[#05AC5F] outline-none text-sm font-bold transition-all text-gray-900"
                    placeholder="e.g. name@okhdfcbank"
                  />
                </div>
              ) : (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Account Name</label>
                    <input
                      type="text"
                      required
                      value={agencyAccName}
                      onChange={(e) => setAgencyAccName(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#05AC5F]/20 focus:border-[#05AC5F] outline-none text-sm font-bold transition-all text-gray-900"
                      placeholder="Name on passbook"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Account Number</label>
                    <input
                      type="number"
                      required
                      value={agencyAccNo}
                      onChange={(e) => setAgencyAccNo(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#05AC5F]/20 focus:border-[#05AC5F] outline-none text-sm font-bold transition-all text-gray-900"
                      placeholder="e.g. 000012345678"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">IFSC Code</label>
                    <input
                      type="text"
                      required
                      value={agencyIfsc}
                      onChange={(e) => setAgencyIfsc(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#05AC5F]/20 focus:border-[#05AC5F] outline-none text-sm font-bold transition-all text-gray-900"
                      placeholder="e.g. HDFC0001234"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setShowWithdrawModal(false)} className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isWithdrawing} className="flex-1 px-4 py-3 bg-[#05AC5F] hover:bg-[#048C4F] text-white rounded-xl shadow-md shadow-[#05AC5F]/20 transition-all font-bold text-sm disabled:opacity-70 flex items-center justify-center">
                  {isWithdrawing ? <Loader2 size={18} className="animate-spin" /> : 'Confirm Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isModalOpen && selectedWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">Process Payout</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleProcessPayout} className="p-6">
              <div className="mb-6 bg-orange-50 rounded-xl p-4 border border-orange-100 text-center">
                <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">Total Owed to {selectedWorker.full_name}</p>
                <p className="text-3xl font-black text-orange-700">₹{formatCurrency(selectedWorker.pendingBalance)}</p>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                  Amount to Pay Now (₹)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-500 font-bold text-lg">₹</span>
                  </div>
                  <input
                    type="number" step="0.01" required min="0.01" max={selectedWorker.pendingBalance}
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#05AC5F]/20 focus:border-[#05AC5F] outline-none text-lg font-bold transition-all text-gray-900"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isProcessing} className="flex-1 px-4 py-3 bg-[#05AC5F] hover:bg-[#048C4F] text-white rounded-xl shadow-md shadow-[#05AC5F]/20 transition-all font-bold text-sm disabled:opacity-70 flex items-center justify-center">
                  {isProcessing ? <Loader2 size={18} className="animate-spin" /> : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

const StatCard = ({ title, value, icon, subtitle, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
    </div>
    <div>
      <h3 className="text-3xl font-black text-gray-900 tracking-tight">{value}</h3>
      <p className="text-sm font-bold text-gray-500 mt-1 uppercase tracking-wider">{title}</p>
      <p className="text-xs font-medium text-gray-400 mt-1">{subtitle}</p>
    </div>
  </div>
);

export default Financials;