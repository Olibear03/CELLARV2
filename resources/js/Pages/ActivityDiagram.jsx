/**
 * ActivityDiagram — Temporary page that renders the CVSU-CELLAR DMS
 * UML Activity Diagram using pure Tailwind CSS.
 *
 * 3 swimlanes: Admin | System | Guest
 * Black and white, printable.
 *
 * Access at: /activity-diagram
 */

/* ── Reusable shape components ─────────────────────────────────── */

/** Rounded rectangle — standard activity node */
const Activity = ({ children, className = '' }) => (
    <div className={`border border-black rounded-lg px-3 py-1.5 text-[11px] font-medium text-center leading-tight bg-white whitespace-pre-line min-w-[110px] ${className}`}>
        {children}
    </div>
);

/** Diamond — decision node */
const Decision = ({ children }) => (
    <div className="relative flex items-center justify-center w-[100px] h-[50px] shrink-0">
        {/* Rotated square to form diamond */}
        <div className="absolute w-[50px] h-[50px] border border-black bg-white rotate-45" />
        <span className="relative z-10 text-[9px] font-medium text-center leading-tight px-1 max-w-[70px]">
            {children}
        </span>
    </div>
);

/** Filled circle — start node */
const StartNode = () => (
    <div className="w-5 h-5 rounded-full bg-black shrink-0" />
);

/** Filled circle with ring — end node */
const EndNode = () => (
    <div className="w-5 h-5 rounded-full border-2 border-black flex items-center justify-center shrink-0">
        <div className="w-3 h-3 rounded-full bg-black" />
    </div>
);

/** Connector circle — lettered reference (A, B, Z) */
const Connector = ({ label }) => (
    <div className="w-7 h-7 rounded-full border border-black flex items-center justify-center text-[10px] font-bold bg-white shrink-0">
        {label}
    </div>
);

/** Vertical arrow */
const ArrowDown = ({ label = '' }) => (
    <div className="flex flex-col items-center">
        <div className="w-px bg-black" style={{ height: 16 }} />
        {label && <span className="text-[8px] text-black -mt-0.5 mb-0.5">{label}</span>}
        {/* Arrowhead */}
        <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[6px] border-l-transparent border-r-transparent border-t-black" />
    </div>
);

/** Horizontal arrow pointing right */
const ArrowRight = ({ label = '' }) => (
    <div className="flex items-center gap-0.5">
        <div className="h-px bg-black" style={{ width: 20 }} />
        {label && <span className="text-[8px] text-black">{label}</span>}
        <div className="w-0 h-0 border-t-[4px] border-b-[4px] border-l-[6px] border-t-transparent border-b-transparent border-l-black" />
    </div>
);

/** Thin horizontal fork/join bar */
const ForkBar = () => (
    <div className="w-full h-[3px] bg-black rounded" />
);

/** Column inside a swimlane — stacks nodes vertically centered */
const Col = ({ children, className = '' }) => (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
        {children}
    </div>
);

/* ── Main diagram ───────────────────────────────────────────────── */
export default function ActivityDiagram() {
    return (
        <div className="min-h-screen bg-white p-6 font-sans">

            {/* Title */}
            <h1 className="text-center text-base font-bold mb-1 tracking-wide uppercase">
                CVSU-CELLAR DMS
            </h1>
            <p className="text-center text-[11px] mb-6 text-gray-600">UML Activity Diagram</p>

            {/* Print button */}
            <div className="flex justify-end mb-4 print:hidden">
                <button
                    onClick={() => window.print()}
                    className="border border-black px-4 py-1.5 text-xs font-semibold rounded hover:bg-gray-100 transition-colors"
                >
                    Print / Save as PDF
                </button>
            </div>

            {/* ── Swimlane container ── */}
            <div className="border border-black w-full overflow-x-auto">

                {/* Lane headers */}
                <div className="grid grid-cols-3 border-b border-black">
                    {['Admin', 'System', 'Guest'].map(lane => (
                        <div key={lane} className="text-center text-[11px] font-bold py-2 border-r last:border-r-0 border-black tracking-widest uppercase">
                            {lane}
                        </div>
                    ))}
                </div>

                {/* Lane body */}
                <div className="grid grid-cols-3 divide-x divide-black min-h-[1200px]">

                    {/* ══ ADMIN LANE ══════════════════════════════════════ */}
                    <div className="flex flex-col items-center gap-2 p-4">

                        <StartNode />
                        <ArrowDown />
                        <Activity>Enter Credentials</Activity>
                        <ArrowDown />

                        {/* Decision: Valid? */}
                        <Decision>Valid?</Decision>

                        {/* Yes path continues down; No path noted */}
                        <div className="flex items-start gap-2 w-full justify-center">
                            <div className="flex flex-col items-center">
                                <span className="text-[8px]">Yes ↓</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-[8px]">No →</span>
                                <span className="text-[8px] text-gray-500">(retry)</span>
                            </div>
                        </div>

                        <ArrowDown label="Yes" />
                        <Activity>View Dashboard</Activity>
                        <ArrowDown />

                        {/* Fork bar — parallel branches start */}
                        <div className="w-full px-2"><ForkBar /></div>
                        <span className="text-[8px] text-gray-500">parallel branches</span>

                        {/* Branch labels */}
                        <div className="grid grid-cols-2 gap-2 w-full text-[9px] text-center mt-1">
                            <Activity className="text-[9px]">Open Documents</Activity>
                            <Activity className="text-[9px]">Open Links</Activity>
                            <Activity className="text-[9px]">Open Search</Activity>
                            <Activity className="text-[9px]">Open Favorites</Activity>
                            <Activity className="text-[9px]">Open Bin</Activity>
                            <Activity className="text-[9px]">Open Security</Activity>
                        </div>

                        <ArrowDown />
                        <Activity>Perform Actions\n(see System lane)</Activity>
                        <ArrowDown />

                        {/* Join bar */}
                        <div className="w-full px-2"><ForkBar /></div>

                        <ArrowDown />
                        <Decision>Continue?</Decision>
                        <ArrowDown label="No" />
                        <Activity>Log Out</Activity>
                        <ArrowDown />
                        <Connector label="Z" />
                        <ArrowDown />
                        <EndNode />
                    </div>

                    {/* ══ SYSTEM LANE ═════════════════════════════════════ */}
                    <div className="flex flex-col items-center gap-2 p-4">

                        {/* Auth */}
                        <div className="w-full flex flex-col items-center gap-1 border border-dashed border-gray-400 rounded p-2 mb-2">
                            <span className="text-[8px] font-bold uppercase text-gray-500 mb-1">Authentication</span>
                            <Activity className="text-[9px]">Validate credentials</Activity>
                            <ArrowDown />
                            <Decision>Valid?</Decision>
                            <div className="flex gap-4 text-[8px]">
                                <span>Yes → Create session</span>
                                <span>No → Reject</span>
                            </div>
                            <Activity className="text-[9px]">Load Dashboard data</Activity>
                        </div>

                        {/* Documents */}
                        <div className="w-full flex flex-col items-center gap-1 border border-dashed border-gray-400 rounded p-2 mb-2">
                            <span className="text-[8px] font-bold uppercase text-gray-500 mb-1">Documents</span>
                            <Activity className="text-[9px]">Store file;\nassign folder_id</Activity>
                            <Activity className="text-[9px]">Create folder record</Activity>
                            <Activity className="text-[9px]">Resolve path;\nupdate breadcrumbs</Activity>
                            <Activity className="text-[9px]">Open preview overlay</Activity>
                            <Activity className="text-[9px]">Rename / Move /\nFavorite / Soft-delete</Activity>
                        </div>

                        {/* Share Link */}
                        <div className="w-full flex flex-col items-center gap-1 border border-dashed border-gray-400 rounded p-2 mb-2">
                            <span className="text-[8px] font-bold uppercase text-gray-500 mb-1">Share Link</span>
                            <Activity className="text-[9px]">Generate signed URL\n(with expiry)</Activity>
                            <ArrowDown />
                            <Decision>Valid &\nnot expired?</Decision>
                            <div className="flex gap-3 text-[8px] mt-1">
                                <span>Yes → Stream file</span>
                                <span>No → 403</span>
                            </div>
                        </div>

                        {/* Links */}
                        <div className="w-full flex flex-col items-center gap-1 border border-dashed border-gray-400 rounded p-2 mb-2">
                            <span className="text-[8px] font-bold uppercase text-gray-500 mb-1">Links</span>
                            <Activity className="text-[9px]">Save / update\nlink record</Activity>
                        </div>

                        {/* Search */}
                        <div className="w-full flex flex-col items-center gap-1 border border-dashed border-gray-400 rounded p-2 mb-2">
                            <span className="text-[8px] font-bold uppercase text-gray-500 mb-1">Search</span>
                            <Activity className="text-[9px]">Query documents\n& links</Activity>
                            <Activity className="text-[9px]">Return results</Activity>
                        </div>

                        {/* Bin */}
                        <div className="w-full flex flex-col items-center gap-1 border border-dashed border-gray-400 rounded p-2 mb-2">
                            <span className="text-[8px] font-bold uppercase text-gray-500 mb-1">Bin</span>
                            <Activity className="text-[9px]">Soft delete /\nRestore /\nForce delete</Activity>
                        </div>

                        {/* Security */}
                        <div className="w-full flex flex-col items-center gap-1 border border-dashed border-gray-400 rounded p-2">
                            <span className="text-[8px] font-bold uppercase text-gray-500 mb-1">Security</span>
                            <Activity className="text-[9px]">Create user record;\nlog action</Activity>
                            <Activity className="text-[9px]">Reset PW /\nPromote / Demote /\nToggle / Delete</Activity>
                            <Activity className="text-[9px]">Destroy session;\nredirect to login</Activity>
                        </div>
                    </div>

                    {/* ══ GUEST LANE ══════════════════════════════════════ */}
                    <div className="flex flex-col items-center gap-2 p-4">

                        <div className="w-full flex flex-col items-center gap-1 border border-dashed border-gray-400 rounded p-3">
                            <span className="text-[8px] font-bold uppercase text-gray-500 mb-1">Share Link Access</span>
                            <Activity className="text-[9px]">Receive shared URL\nfrom Admin</Activity>
                            <ArrowDown />
                            <Activity className="text-[9px]">Open URL in browser\n(no login required)</Activity>
                            <ArrowDown />
                            <Decision>Link\nvalid?</Decision>
                            <div className="flex gap-3 text-[8px] mt-1">
                                <div className="flex flex-col items-center gap-1">
                                    <span>Yes ↓</span>
                                    <Activity className="text-[9px]">View document\ninline</Activity>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <span>No ↓</span>
                                    <Activity className="text-[9px]">See 403\nerror page</Activity>
                                </div>
                            </div>
                        </div>

                        {/* Note */}
                        <div className="mt-4 border border-gray-300 rounded p-2 text-[9px] text-gray-500 w-full">
                            <p className="font-semibold mb-1">Note:</p>
                            <p>Guest only interacts with the system via a time-limited signed URL generated by Admin. No account or login is required.</p>
                        </div>
                    </div>

                </div>
            </div>

            {/* Print styles */}
            <style>{`
                @media print {
                    body { margin: 0; }
                    .print\\:hidden { display: none; }
                    @page { size: A3 landscape; margin: 10mm; }
                }
            `}</style>
        </div>
    );
}
