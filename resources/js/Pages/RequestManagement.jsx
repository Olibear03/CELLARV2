import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

export default function RequestManagement({ requests = [] }) {
    const [activeTab, setActiveTab] = useState('pending');

    const filteredRequests = requests.filter(req => req.status === activeTab);

    return (
        <AuthenticatedLayout>
            <Head title="Request Management" />
            <div className="max-w-[1400px] mx-auto space-y-8">
                
                {/* Header */}
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-[2.5rem] font-extrabold text-gray-900 tracking-tight leading-none">Request Management</h1>
                        <p className="text-gray-500 mt-2">Review, approve, or deny resource access requests.</p>
                    </div>
                    <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 flex">
                        <button 
                            onClick={() => setActiveTab('pending')}
                            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'pending' ? 'bg-[#059669] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Pending
                        </button>
                        <button 
                            onClick={() => setActiveTab('approved')}
                            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'approved' ? 'bg-[#059669] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Approved
                        </button>
                        <button 
                            onClick={() => setActiveTab('rejected')}
                            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'rejected' ? 'bg-[#059669] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Rejected
                        </button>
                    </div>
                </div>

                {/* Table Container */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="py-5 px-8 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="py-5 px-8 text-xs font-bold text-gray-500 uppercase tracking-wider">Requested Resource</th>
                                    <th className="py-5 px-8 text-xs font-bold text-gray-500 uppercase tracking-wider">Date Requested</th>
                                    <th className="py-5 px-8 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="py-5 px-8 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredRequests.length > 0 ? (
                                    filteredRequests.map((request) => (
                                        <tr key={request.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="py-5 px-8">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                                                        {request.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">{request.name}</p>
                                                        <p className="text-xs text-gray-500 font-medium">{request.role}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-5 px-8">
                                                <p className="text-sm font-semibold text-gray-900">{request.resource}</p>
                                                <p className="text-xs text-emerald-600 font-medium cursor-pointer hover:underline">View Details</p>
                                            </td>
                                            <td className="py-5 px-8">
                                                <p className="text-sm text-gray-600 font-medium">{request.date}</p>
                                            </td>
                                            <td className="py-5 px-8">
                                                {request.status === 'pending' && <span className="px-3 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-full border border-amber-100 uppercase tracking-wide">Pending</span>}
                                                {request.status === 'approved' && <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full border border-emerald-100 uppercase tracking-wide">Approved</span>}
                                                {request.status === 'rejected' && <span className="px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-full border border-red-100 uppercase tracking-wide">Rejected</span>}
                                            </td>
                                            <td className="py-5 px-8 text-right">
                                                {request.status === 'pending' ? (
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <button className="w-9 h-9 rounded-full bg-white border border-gray-200 text-red-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600 flex items-center justify-center transition-all shadow-sm">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                        </button>
                                                        <button className="w-9 h-9 rounded-full bg-[#059669] border border-[#059669] text-white hover:bg-emerald-700 flex items-center justify-center transition-all shadow-sm">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">
                                                        View Log
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="py-24 text-center">
                                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-5">
                                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                            </div>
                                            <h4 className="text-gray-900 font-bold text-xl">All Caught Up</h4>
                                            <p className="text-gray-500 mt-2 text-base">There are currently no {activeTab} requests in the system.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
