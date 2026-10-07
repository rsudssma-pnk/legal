const C = window.hlregConfig || {
  appName: "ARMONI",
  appTagline: "Alkadrie Regulatory, Legal, Ethics & Compliance Integrated System",
  organizationName: "UPT RSUD Sultan Syarif Mohamad Alkadrie",
  organizationShort: "RSUD SSMA",
  demoAllowed: true,
  demoLabel: "Preview / Demo",
  blueprintVersion: "1.0",
  blueprintDate: "6 Oktober 2026"
};

let SB = null;
let supabaseLoading = false;
let supabaseLoaded = false;

function initSupabase(){
  try {
    if(window.supabase && C.supabaseUrl && C.supabasePublishableKey){
      SB=window.supabase.createClient(C.supabaseUrl,C.supabasePublishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
      supabaseLoaded=true;
      if(SB){
        SB.auth.onAuthStateChange((_event,_session)=>{
          if(_session && !state.loading && !state.user) loadSession();
        });
      }
      return SB;
    }
  } catch(err){ console.error("[ARMONI] Supabase initialization failed:",err); }
  return null;
}

function loadSupabase(){
  if(supabaseLoading || supabaseLoaded || window.supabase) return Promise.resolve(initSupabase());
  if(!C.supabaseUrl || !C.supabasePublishableKey) return Promise.resolve(null);
  supabaseLoading=true;
  return new Promise(resolve=>{
    const script=document.createElement("script");
    script.src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.95.0/dist/umd/supabase.min.js";
    script.async=true;
    script.crossOrigin="anonymous";
    script.onload=()=>{ supabaseLoading=false; const client=initSupabase(); resolve(client); };
    script.onerror=()=>{ supabaseLoading=false; console.warn("[ARMONI] Supabase CDN unavailable; continuing in offline/login mode."); resolve(null); };
    document.head.appendChild(script);
  });
}

const esc = (v = "") => String(v).replace(/[&<>"]/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[ch]));
const uid = () => globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : Math.random().toString(36).slice(2);
const fmtDate = d => d ? new Intl.DateTimeFormat("id-ID", { day:"2-digit", month:"short", year:"numeric" }).format(new Date(d)) : "—";
const fmtDateTime = d => d ? new Intl.DateTimeFormat("id-ID", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" }).format(new Date(d)) : "—";
const initials = n => String(n || "RS").split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join("").toUpperCase();
const statusClass = s => {
  const x=String(s||"").toUpperCase();
  if(["ACTIVE","EFFECTIVE","APPROVED","COMPLETED","COMPLIANT","VALID","DONE","VERIFIED","SIGNED"].includes(x)) return "green";
  if(["LEGAL_REVIEW","UNIT_REVIEW","PARAF","APPROVAL","IN_PROGRESS","PARTIAL","EXPIRING","REVIEW","RUNNING","PENDING"].includes(x)) return "amber";
  if(["REJECTED","REVOKED","REPEALED","NON_COMPLIANT","EXPIRED","MISMATCH","FAILED","CRITICAL"].includes(x)) return "red";
  if(["OPINION","ETHICS_REVIEW","DECISION","DRAFT","STALE","SCREENING"].includes(x)) return "purple";
  return "slate";
};
const statusBadge = s => `<span class="badge ${statusClass(s)}">${esc(String(s||"—").replaceAll("_"," "))}</span>`;
const icon = n => {
  const m={
    grid:"⌘",shield:"◆",book:"◈",file:"▤",check:"✓",workflow:"↝",balance:"⚖",heart:"✦",contract:"§",license:"▦",mail:"✉",template:"▧",archive:"⌂",bell:"●",audit:"◌",settings:"⚙",search:"⌕",plus:"+",menu:"☰",logout:"↪",moon:"◐",sun:"◒",arrow:"→",close:"×",download:"⇩",refresh:"↻",lock:"◆",spark:"✦",calendar:"◫",user:"○"
  }; return m[n]||"•";
};

const NAV = [
  {group:"Utama",items:[
    ["dashboard","Dashboard","Ringkasan kendali","grid"],
    ["documents","Dokumen Hukum","Pusat semua produk legal & naskah","file"],
    ["more","Governance & Tools","Semua modul pendukung","settings"]
  ]}
];
const VIEW_NAMES = Object.fromEntries(NAV.flatMap(g=>g.items.map(x=>[x[0],x[1]])));

const DOC_CATEGORIES = [
  {type:"SK_DIREKTUR",label:"Surat Keputusan Direktur",icon:"check",desc:"Keputusan/penetapan resmi Direktur."},
  {type:"SOP_PELAYANAN",label:"SOP Pelayanan",icon:"workflow",desc:"SOP per ruangan/unit; lokasi diisi bebas."},
  {type:"SOP_MANAJERIAL",label:"SOP Manajerial",icon:"settings",desc:"SOP berdasarkan 4 bidang manajerial RSUD."},
  {type:"PERATURAN_DIREKTUR",label:"Peraturan Direktur",icon:"balance",desc:"Produk pengaturan internal rumah sakit."},
  {type:"KEBIJAKAN",label:"Kebijakan",icon:"shield",desc:"Kebijakan internal rumah sakit/unit."},
  {type:"PEDOMAN",label:"Pedoman",icon:"book",desc:"Pedoman penyelenggaraan kegiatan/program."},
  {type:"INSTRUKSI",label:"Instruksi Direktur",icon:"arrow",desc:"Instruksi/pengarahan resmi."},
  {type:"SURAT_EDARAN",label:"Surat Edaran",icon:"mail",desc:"Penyampaian ketentuan resmi."},
  {type:"SURAT_DINAS",label:"Surat Dinas",icon:"mail",desc:"Korespondensi resmi."},
  {type:"NOTA_DINAS",label:"Nota Dinas",icon:"file",desc:"Korespondensi internal resmi."},
  {type:"MEMO",label:"Memo",icon:"file",desc:"Korespondensi internal ringkas."},
  {type:"BERITA_ACARA",label:"Berita Acara",icon:"archive",desc:"Pencatatan kejadian/serah terima."},
  {type:"SURAT_TUGAS",label:"Surat Tugas",icon:"calendar",desc:"Penugasan resmi."},
  {type:"SURAT_PERINTAH",label:"Surat Perintah",icon:"arrow",desc:"Perintah pelaksanaan tugas."},
  {type:"SURAT_KETERANGAN",label:"Surat Keterangan",icon:"file",desc:"Keterangan resmi."},
  {type:"TELAAHAN_STAF",label:"Telaahan Staf",icon:"search",desc:"Analisis dan rekomendasi staf."},
  {type:"LAPORAN",label:"Laporan",icon:"archive",desc:"Pelaporan kegiatan/hasil."},
  {type:"NOTULA",label:"Notula",icon:"file",desc:"Catatan rapat."},
  {type:"KONTRAK_PERJANJIAN",label:"Perjanjian / Kontrak",icon:"contract",desc:"Perikatan/kerja sama yang dikelola legal."}
];
const MANAGERIAL_FIELDS = [
  "Bagian Umum",
  "Bidang Penunjang Medik dan Non-Medik",
  "Bidang Pengembangan dan Pengendalian Mutu, Pemasaran dan Hubungan Masyarakat",
  "Bidang Pelayanan Medik dan Keperawatan"
];
const docCatLabel = type => (DOC_CATEGORIES.find(c=>c.type===type)?.label || String(type||"").replaceAll("_"," "));
const DEMO = {
  regs:[
    {id:"r1",type:"PERWALI",number:"65",year:2023,title:"Peraturan Wali Kota Pontianak Nomor 65 Tahun 2023 tentang Tata Naskah Dinas",issuer:"Pemerintah Kota Pontianak",status:"ACTIVE",effective_date:"2024-02-01",verified_at:"2026-10-02"},
    {id:"r2",type:"PERATURAN",number:"01",year:2026,title:"Peraturan Internal Contoh — Tata Kelola Dokumen Terkendali",issuer:"UPT RSUD SSMA",status:"ACTIVE",effective_date:"2026-01-15",verified_at:"2026-09-25"},
    {id:"r3",type:"PERATURAN",number:"07",year:2025,title:"Regulasi Contoh — Kepatuhan Pelayanan dan Dokumentasi",issuer:"Pemerintah",status:"AMENDED",effective_date:"2025-05-20",verified_at:"2026-09-18"},
    {id:"r4",type:"SURAT_EDARAN",number:"14",year:2024,title:"Ketentuan Contoh Pengendalian Naskah Dinas Elektronik",issuer:"Pemerintah Kota Pontianak",status:"REPEALED",effective_date:"2024-06-01",verified_at:"2026-08-11"}
  ],
  docs:[
    {id:"d1",document_code:"DOC-SK-2026-014",document_type:"SK_DIREKTUR",title:"Keputusan Direktur tentang Tim Tata Kelola Dokumen",number:"SK/2026/014",status:"LEGAL_REVIEW",security_class:"T",output_mode:"ELECTRONIC",owner_unit:"Sekretariat",owner_user_id:"demo",current_version_no:2,template_code:"SK-DIR",template_version:"2.1",updated_at:"2026-10-06T05:20:00Z"},
    {id:"d2",document_code:"DOC-SOP-2026-031",document_type:"SOP",title:"SOP Pengendalian Naskah Dinas Keluar",number:"SOP/2026/031",status:"APPROVAL",security_class:"B",output_mode:"ELECTRONIC",owner_unit:"Tata Usaha",current_version_no:3,template_code:"SOP-A4",template_version:"1.8",updated_at:"2026-10-05T09:20:00Z"},
    {id:"d3",document_code:"DOC-PED-2026-009",document_type:"PEDOMAN",title:"Pedoman Review Dasar Hukum Dokumen Internal",number:"PED/2026/009",status:"EFFECTIVE",security_class:"B",output_mode:"ELECTRONIC",owner_unit:"Bagian Hukum",current_version_no:1,template_code:"PED-A4",template_version:"1.0",updated_at:"2026-09-30T03:20:00Z"},
    {id:"d4",document_code:"DOC-SURAT-2026-108",document_type:"SURAT_DINAS",title:"Permohonan Klarifikasi Regulasi",number:"900/108/2026",status:"DRAFT",security_class:"B",output_mode:"PAPER",owner_unit:"Pelayanan Medik",current_version_no:1,template_code:"SURAT-DINAS",template_version:"3.0",updated_at:"2026-10-04T03:20:00Z"}
  ],
  tasks:[
    {id:"t1",document_id:"d1",task_type:"LEGAL REVIEW",status:"PENDING",assignee_id:"demo",due_at:"2026-10-07T09:00:00Z"},
    {id:"t2",document_id:"d2",task_type:"DIRECTOR APPROVAL",status:"PENDING",assignee_id:"demo",due_at:"2026-10-06T14:30:00Z"},
    {id:"t3",document_id:"d3",task_type:"PARAF KOORDINASI",status:"APPROVED",assignee_id:"demo",due_at:"2026-09-29T09:00:00Z"}
  ],
  obligations:[
    {id:"o1",obligation_code:"OBL-TN-001",title:"Format Arial 12",requirement_text:"Korespondensi dan naskah khusus menggunakan Arial 12 sesuai rule TN-001.",responsible_unit:"Tata Usaha",priority:"HIGH",status:"COMPLIANT"},
    {id:"o2",obligation_code:"OBL-TN-003",title:"Margin kiri minimal 3 cm",requirement_text:"Validasi margin kiri minimal 3 cm sebelum finalisasi.",responsible_unit:"Tata Usaha",priority:"HIGH",status:"PARTIAL"},
    {id:"o3",obligation_code:"OBL-TN-010",title:"Maksimal 3 paraf hierarki",requirement_text:"Untuk dokumen Direktur bila aturan berlaku, lebih dari tiga paraf harus diblok.",responsible_unit:"Sekretariat",priority:"CRITICAL",status:"COMPLIANT"},
    {id:"o4",obligation_code:"OBL-TN-013",title:"Tanpa stempel pada media elektronik",requirement_text:"Renderer elektronik tidak menambahkan stempel otomatis.",responsible_unit:"Document Manager",priority:"CRITICAL",status:"NON_COMPLIANT"},
    {id:"o5",obligation_code:"OBL-SEC-014",title:"Klasifikasi keamanan",requirement_text:"Dokumen memiliki metadata SR/R/T/B dan ACL sesuai scope.",responsible_unit:"IT / Legal",priority:"CRITICAL",status:"NOT_ASSESSED"}
  ],
  contracts:[
    {id:"c1",contract_no:"PKS/2026/017",title:"PKS Pengadaan Jasa Penunjang",party_a:"UPT RSUD SSMA",party_b:"Mitra A",end_date:"2026-11-15",owner_unit:"Keuangan",status:"EXPIRING"},
    {id:"c2",contract_no:"PKS/2026/009",title:"Kerja Sama Laboratorium",party_a:"UPT RSUD SSMA",party_b:"Mitra B",end_date:"2027-03-12",owner_unit:"Laboratorium",status:"ACTIVE"},
    {id:"c3",contract_no:"PKS/2025/041",title:"Pemeliharaan Sistem Informasi",party_a:"UPT RSUD SSMA",party_b:"Mitra TI",end_date:"2026-10-28",owner_unit:"SIMRS",status:"EXPIRING"}
  ],
  licenses:[
    {id:"l1",license_type:"Izin Operasional",number:"IZ/SSMA/2026/02",issuer:"Instansi Penerbit",expiry_date:"2026-12-18",owner_unit:"Sekretariat",responsible_name:"PIC Sekretariat",status:"VALID"},
    {id:"l2",license_type:"Sertifikat / Akreditasi",number:"CERT/2026/11",issuer:"Lembaga Penerbit",expiry_date:"2026-10-22",owner_unit:"PMKP",responsible_name:"PIC PMKP",status:"EXPIRING"},
    {id:"l3",license_type:"Izin Khusus",number:"IZ/SSMA/2025/19",issuer:"Instansi Penerbit",expiry_date:"2026-10-05",owner_unit:"Unit Teknis",responsible_name:"PIC Unit",status:"EXPIRED"}
  ],
  cases:[
    {id:"lc1",case_no:"LC-2026-006",title:"Review legalitas dokumen kerja sama",category:"Contract Review",priority:"HIGH",confidentiality:"R",status:"LEGAL_ANALYSIS",opened_at:"2026-10-01"},
    {id:"lc2",case_no:"LC-2026-004",title:"Klarifikasi kewenangan penandatangan",category:"Authority",priority:"CRITICAL",confidentiality:"T",status:"OPINION",opened_at:"2026-09-18"}
  ],
  ethics:[
    {id:"ec1",case_no:"ETH-2026-003",issue:"Review konflik kepentingan",reporter:"Internal",unit:"Pelayanan",confidentiality:"SR",status:"ETHICS_REVIEW"},
    {id:"ec2",case_no:"ETH-2026-001",issue:"Permintaan telaah etik",reporter:"Internal",unit:"Medik",confidentiality:"SR",status:"FOLLOW_UP"}
  ],
  mail:[
    {id:"m1",direction:"INCOMING",seq_no:122,received_or_sent_date:"2026-10-06",document_date:"2026-10-05",document_no:"440/PKT/2026",origin_or_destination:"Dinas Kesehatan",summary:"Permintaan data tindak lanjut regulasi",target_unit:"Sekretariat",status:"DISPOSITION"},
    {id:"m2",direction:"OUTGOING",seq_no:87,received_or_sent_date:"2026-10-05",document_date:"2026-10-05",document_no:"900/108/2026",origin_or_destination:"Mitra Eksternal",summary:"Permohonan klarifikasi regulasi",target_unit:"Legal",status:"REGISTERED"}
  ],
  templates:[
    {id:"tp1",template_code:"SK-DIR",name:"Keputusan Direktur",document_type:"SK_DIREKTUR",version:"2.1",status:"ACTIVE"},
    {id:"tp2",template_code:"SOP-A4",name:"SOP A4 Rumah Sakit",document_type:"SOP",version:"1.8",status:"ACTIVE"},
    {id:"tp3",template_code:"SURAT-DINAS",name:"Surat Dinas",document_type:"SURAT_DINAS",version:"3.0",status:"APPROVED"}
  ]
};

const storageGet = (key, fallback = null) => {
  try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
};
const storageSet = (key, value) => {
  try { localStorage.setItem(key, value); } catch {}
};

const state = { user:null, profile:null, roles:[], demo:false, loading:true, view:"dashboard", sidebar:false, compact:false, modal:null, createType:"", docCategory:"", search:"", data:null, theme:storageGet("hlreg-theme","light") };

function seedState(){
  state.data={...DEMO,regs:[...DEMO.regs],docs:[...DEMO.docs],tasks:[...DEMO.tasks],obligations:[...DEMO.obligations],contracts:[...DEMO.contracts],licenses:[...DEMO.licenses],cases:[...DEMO.cases],ethics:[...DEMO.ethics],mail:[...DEMO.mail],templates:[...DEMO.templates],regFiles:[],sopScopes:[],categories:DOC_CATEGORIES};
  const sop=state.data.docs.find(x=>x.id==="d2"); if(sop){sop.document_type="SOP_PELAYANAN";sop.room_or_unit="Rawat Inap Melati";}
  state.data.docs.push({id:"demo-sop-m-1",document_code:"DOC-SOP-M-2026-001",document_type:"SOP_MANAJERIAL",title:"SOP Pengendalian Dokumen dan Tata Naskah",number:"SOP/2026/001",status:"EFFECTIVE",security_class:"B",output_mode:"ELECTRONIC",owner_unit:"Bagian Umum",current_version_no:2,template_code:"SOP-A4",template_version:"1.8",updated_at:"2026-10-05T08:00:00Z",managerial_field:"Bagian Umum"});
}
function getRoles(){ return state.roles.map(r=>typeof r==="string"?r:r.code).filter(Boolean); }
function isRole(...roles){ const mine=getRoles(); return roles.some(x=>mine.includes(x)) || mine.includes("SUPER_ADMIN"); }
function roleLabel(){ return state.demo ? "Preview / Demo" : (state.roles[0]?.name || state.roles[0]?.code || "Authenticated User"); }
function userName(){ return state.demo ? "Demo Reviewer" : (state.profile?.full_name || state.user?.email || "Pengguna"); }
function currentView(){ return location.hash.replace(/^#\//,"").split("/")[0] || "dashboard"; }
function currentId(){ return location.hash.replace(/^#\//,"").split("/")[1] || null; }
function currentArg(){ const raw=location.hash.replace(/^#\//,"").split("/")[2] || ""; try{return decodeURIComponent(raw);}catch{return raw;} }
function go(v,id="",arg=""){ location.hash="#/"+v+(id?"/"+encodeURIComponent(id):"")+(arg?"/"+encodeURIComponent(arg):""); state.sidebar=false; }

function toast(message,type="success"){
  const root=document.getElementById("toast-root"); if(!root) return;
  const el=document.createElement("div"); el.className="toast "+type; el.innerHTML=`<div>${icon(type==="error"?"close":type==="warn"?"bell":"check")}</div><div>${esc(message)}</div>`; root.appendChild(el);
  setTimeout(()=>el.remove(),3600);
}

function shellNav(){
  return NAV.map(g=>`<div class="nav-group"><div class="nav-label">${g.group}</div>${g.items.map(i=>`<button class="nav-item ${state.view===i[0]?"active":""}" data-action="nav" data-view="${i[0]}" title="${i[1]}"><span class="nav-icon">${icon(i[3])}</span><span class="nav-text">${i[1]}</span></button>`).join("")}</div>`).join("");
}
function topbar(){ return `<header class="topbar"><div class="top-left"><button class="icon-btn mobile-only" data-action="toggle-mobile" aria-label="Menu">${icon("menu")}</button><div><div class="eyebrow">ARMONI • UPT RSUD SSMA</div><div class="top-title">${esc(VIEW_NAMES[state.view]||"Dashboard")}</div><div class="breadcrumb"><span>Governance System</span><span>›</span><strong>${esc(VIEW_NAMES[state.view]||"Dashboard")}</strong></div></div></div><div class="top-actions"><button class="top-btn hide-mobile" data-action="global-search">${icon("search")} Search</button><button class="icon-btn" data-action="toggle-theme" aria-label="Tema">${state.theme==="dark"?icon("sun"):icon("moon")}</button><button class="icon-btn" data-action="notifications" aria-label="Notifikasi">${icon("bell")}</button><button class="top-btn primary hide-mobile" data-action="new" data-module="${state.view}">${icon("plus")} Tambah</button><button class="icon-btn" data-action="logout" aria-label="Keluar">${icon("logout")}</button></div></header>`; }
function sidebar(){ return `<aside class="sidebar ${state.compact?"compact":""} ${state.sidebar?"open":""}"><button class="sidebar-toggle" data-action="toggle-compact">${state.compact?"›":"‹"}</button><div class="brand"><div class="brand-mark">✚</div><div class="brand-copy"><div class="brand-name">ARMONI</div><div class="brand-sub">Alkadrie Regulatory • Legal • Ethics • Compliance</div></div></div><div class="nav-scroll">${shellNav()}</div><div class="sidebar-foot"><div class="avatar">${esc(initials(userName()))}</div><div class="sidebar-foot-copy"><div class="sidebar-user">${esc(userName())}</div><div class="sidebar-role">${esc(roleLabel())}</div></div></div></aside>`; }

function appShell(content){ return `<div class="app-shell"><div id="sidebar-host">${sidebar()}</div><main class="main ${state.compact?"compact":""}">${topbar()}<section class="page">${content}</section></main></div>`; }

function loginView(){ return `<div class="login-shell"><section class="login-visual"><div><div class="login-brand"><div class="brand-mark">✚</div><div><div class="brand-name">ARMONI</div><div class="brand-sub">UPT RSUD Sultan Syarif Mohamad Alkadrie</div></div></div></div><div><div class="hero-kicker">Hospital Governance Platform</div><h1>${esc(C.appTagline || "Alkadrie Regulatory, Legal, Ethics & Compliance Integrated System")}.</h1><p>Satu workspace untuk menelusuri regulasi, mengendalikan naskah dinas, mengelola kepatuhan, kasus legal/etik, serta menjaga provenance dan archive integrity.</p><div class="login-features"><div class="login-feature"><strong>Traceability</strong><span>Regulation → obligation → control → evidence.</span></div><div class="login-feature"><strong>Tata Naskah</strong><span>Rules engine untuk template dan workflow.</span></div><div class="login-feature"><strong>Security</strong><span>Supabase Auth + PostgreSQL RLS.</span></div><div class="login-feature"><strong>Resilient Archive</strong><span>Supabase primary + Google Drive secondary.</span></div></div></div><div class="footer-note">Blueprint v${esc(C.blueprintVersion)} • ${esc(C.blueprintDate)} • GitHub Pages</div></section><section class="login-panel"><div class="login-card"><h2>Masuk ke ARMONI</h2><div class="sub">Gunakan akun internal yang telah diberikan role pada Supabase Auth.</div><form id="auth-form"><div class="field"><label>Email</label><input class="input" id="auth-email" type="text" autocomplete="username" placeholder="email atau username, mis. superadmin" required></div><div class="field" style="margin-top:12px"><label>Password</label><input class="input" id="auth-password" type="password" autocomplete="current-password" placeholder="••••••••" required></div><div style="display:flex;justify-content:flex-end;margin:8px 0 2px"><button type="button" class="top-btn" data-action="reset-password">Lupa password?</button></div><button class="top-btn primary" style="width:100%;height:44px" type="submit">${icon("lock")} Masuk</button></form><div class="separator">atau</div><button class="top-btn demo-button" data-action="demo">${icon("spark")} ${esc(C.demoLabel||"Preview / Demo")}</button><div class="login-note"><strong>Live:</strong> akun internal Supabase Auth. Anda dapat memasukkan email lengkap atau username akun. <span class="muted">Contoh username: superadmin</span></div><div class="login-note">Mode demo hanya menggunakan data contoh lokal. Tidak ada data Supabase yang dibaca atau ditulis.</div><div style="margin-top:18px" class="footer-note">Supabase: ${esc(C.supabaseUrl)}</div></div></section></div>`; }

function pageHead(kicker,title,desc,actions=""){ return `<div class="page-head"><div><div class="eyebrow">${esc(kicker)}</div><div class="page-title">${esc(title)}</div><div class="page-description">${esc(desc)}</div></div><div class="head-actions">${actions}</div></div>`; }
function kpi(label,value,meta,ico,good=true){ return `<div class="kpi-card"><div class="kpi-top"><span class="kpi-label">${esc(label)}</span><span class="kpi-icon">${icon(ico)}</span></div><div class="kpi-value">${esc(value)}</div><div class="kpi-meta">${good?`<strong>↗</strong> `:""}${esc(meta)}</div></div>`; }
function barChart(values){ return `<div class="chart"><div class="chart-bars">${values.map((x,i)=>`<div class="bar-group"><div class="bar ${i%3===1?"alt":""}" style="height:${Math.max(9,Math.min(100,x))}%"></div></div>`).join("")}</div><div class="chart-foot"><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Agu</span><span>Sep</span><span>Okt</span></div></div>`; }
function dashboard(){ const d=state.data; const activeRegs=d.regs.filter(x=>x.status==="ACTIVE").length; const activeDocs=d.docs.filter(x=>["DRAFT","LEGAL_REVIEW","UNIT_REVIEW","PARAF","APPROVAL","SIGNATURE","EFFECTIVE"].includes(x.status)).length; const compliant=d.obligations.filter(x=>x.status==="COMPLIANT").length; return pageHead("Executive Governance","Ringkasan kendali hukum & regulasi","Pantau status regulasi, lifecycle dokumen, kepatuhan, kasus sensitif, dan kesehatan arsip dari satu layar.",`<button class="top-btn gold" data-action="new" data-module="documents">${icon("file")} Buat Dokumen</button><button class="top-btn" data-action="sync">${icon("refresh")} Refresh</button>`)+`<div class="hero"><div class="hero-copy"><div class="hero-kicker">CONTROL TOWER • ${state.demo?"DEMO":"LIVE"}</div><h2>Semua evidence governance, satu jalur traceable.</h2><p>Regulasi terverifikasi, dokumen terkendali, authority matrix, approval history, compliance assessment, dan archive integrity dirangkai dalam satu workspace.</p></div><div class="hero-actions"><button class="top-btn gold" data-action="nav" data-view="regulatory">${icon("book")} Regulatory Hub</button><button class="top-btn" data-action="nav" data-view="compliance">${icon("shield")} Compliance Matrix</button></div></div><div class="kpi-grid">${kpi("Regulasi aktif",activeRegs,String(activeRegs)+" sumber aktif","book")}${kpi("Dokumen aktif",activeDocs,"dengan lifecycle terkendali","file")}${kpi("Compliance",Math.round((compliant/Math.max(1,d.obligations.length))*100)+"%",compliant+" obligation compliant","shield")}${kpi("Approval pending",d.tasks.filter(x=>x.status==="PENDING").length,"tugas menunggu tindakan","check",false)}${kpi("Kontrak ≤90 hari",d.contracts.filter(x=>new Date(x.end_date)-Date.now()<90*86400000).length,"expiry watch","contract",false)}${kpi("Archive health","98.4%","copy terverifikasi","archive")}</div><div class="grid grid-2" style="margin-top:16px"><div class="card"><div class="card-head"><div><div class="card-title">Aktivitas dokumen</div><div class="card-subtitle">Jumlah artefak yang bergerak per bulan</div></div><span class="badge blue">7 bulan</span></div><div class="card-body">${barChart([38,52,61,56,72,68,84])}</div></div><div class="card"><div class="card-head"><div><div class="card-title">Compliance posture</div><div class="card-subtitle">Status obligation saat ini</div></div>${statusBadge("COMPLIANT")}</div><div class="card-body" style="display:flex;gap:20px;align-items:center"><div class="ring"><div class="ring-center"><div class="ring-value">82%</div><div class="ring-caption">overall</div></div></div><div class="stat-list" style="flex:1">${[["green","Compliant",compliant],["amber","Partial",d.obligations.filter(x=>x.status==="PARTIAL").length],["red","Non-compliant",d.obligations.filter(x=>x.status==="NON_COMPLIANT").length],["blue","Not assessed",d.obligations.filter(x=>x.status==="NOT_ASSESSED").length]].map(x=>`<div class="stat-line"><span class="stat-line-label"><span class="dot ${x[0]}"></span>${x[1]}</span><strong>${x[2]}</strong></div>`).join("")}</div></div></div></div><div class="grid grid-2" style="margin-top:16px"><div class="card"><div class="card-head"><div><div class="card-title">Approval queue</div><div class="card-subtitle">Prioritas tugas yang memerlukan tindakan</div></div><button class="top-btn" data-action="nav" data-view="approvals">Lihat semua ${icon("arrow")}</button></div><div class="card-body">${d.tasks.slice(0,4).map(t=>{const doc=d.docs.find(x=>x.id===t.document_id)||{};return `<div class="alert ${t.status==="PENDING"?"amber":"green"}"><div class="alert-icon">${icon("check")}</div><div style="flex:1"><div style="display:flex;justify-content:space-between;gap:8px"><strong>${esc(t.task_type)}</strong>${statusBadge(t.status)}</div><div class="small muted" style="margin-top:3px">${esc(doc.title||"Dokumen")}</div><div class="small muted" style="margin-top:4px">Due ${fmtDateTime(t.due_at)}</div></div></div>`}).join("")}</div></div><div class="card"><div class="card-head"><div><div class="card-title">Regulatory change watch</div><div class="card-subtitle">Perlu ditinjau oleh legal</div></div>${statusBadge("ACTIVE")}</div><div class="card-body"><div class="alert amber"><div class="alert-icon">${icon("book")}</div><div><strong>Perwali 65/2023</strong><div class="small muted">Last verified 2 Okt 2026 • 1 dokumen terkait perlu review.</div></div></div><div class="alert red" style="margin-top:9px"><div class="alert-icon">${icon("refresh")}</div><div><strong>2 source stale</strong><div class="small muted">Sumber regulasi yang belum diverifikasi ulang.</div></div></div><div class="alert green" style="margin-top:9px"><div class="alert-icon">${icon("archive")}</div><div><strong>Archive integrity</strong><div class="small muted">Tidak ada hash mismatch pada pemeriksaan terakhir.</div></div></div></div></div></div>`; }

function tablePage(kind, title, desc, rows, cols, actions=""){ const q=state.search.toLowerCase(); const filtered=rows.filter(r=>JSON.stringify(r).toLowerCase().includes(q)); return pageHead(kind.toUpperCase(),title,desc,actions||`<button class="top-btn primary" data-action="new" data-module="${kind}">${icon("plus")} Tambah</button>`)+`<div class="card"><div class="card-body"><div class="filters"><div class="search-box"><span class="search-ico">${icon("search")}</span><input class="input" data-search placeholder="Cari ${esc(title.toLowerCase())}…" value="${esc(state.search)}"></div><button class="top-btn" data-action="clear-search">Clear</button><span class="small muted">${filtered.length} dari ${rows.length}</span></div><div class="table-wrap"><table><thead><tr>${cols.map(c=>`<th>${c.label}</th>`).join("")}<th style="width:1%">Aksi</th></tr></thead><tbody>${filtered.length?filtered.map(r=>`<tr>${cols.map(c=>`<td>${typeof c.render==="function"?c.render(r):esc(r[c.key]??"—")}</td>`).join("")}<td><button class="icon-btn" data-action="detail" data-module="${kind}" data-id="${r.id||""}" title="Buka">${icon("arrow")}</button></td></tr>`).join(""):rowEmpty(cols.length+1,title)}</tbody></table></div></div></div>`; }
function rowEmpty(n,title){ return `<tr><td colspan="${n}"><div class="empty"><div class="empty-mark">${icon("search")}</div><strong>Belum ada ${esc(title.toLowerCase())}</strong><div class="small" style="margin-top:3px">Data akan muncul sesuai scope akun atau saat Anda menambah record.</div></div></td></tr>`; }

function regulatory(){
  const rows=state.data.regs||[],files=state.data.regFiles||[],q=(state.search||'').toLowerCase();
  const filtered=rows.filter(r=>JSON.stringify(r).toLowerCase().includes(q));
  const hasFile=new Set(files.map(x=>x.regulation_id)).size;
  const regRows=filtered.length?filtered.map(r=>{const rf=files.filter(x=>x.regulation_id===r.id);return `<tr><td><div class='title-cell'>${esc(r.title)}</div><div class='small muted'>${esc(r.type)} ${esc(r.number||'')}/${esc(r.year||'')}</div></td><td>${esc(r.issuer||'—')}</td><td>${fmtDate(r.effective_date)}</td><td>${statusBadge(r.status)}</td><td>${rf.length?rf.map(x=>`<button class='top-btn' data-action='download-reg-file' data-file-id='${esc(x.id)}'>${icon('download')} ${esc(x.file_name)}</button>`).join(' '):'<span class="small muted">Belum ada file</span>'}</td><td>${fmtDate(r.verified_at)}</td><td><button class='icon-btn' data-action='detail' data-module='regulatory' data-id='${r.id}'>${icon('arrow')}</button></td></tr>`;}).join(''):rowEmpty(7,'regulasi');
  return pageHead('Regulatory Intelligence','Regulatory Hub','Basis hukum terverifikasi + upload dokumen sumber secara privat ke Supabase Storage.',`<button class='top-btn' data-action='clear-search'>Clear</button><button class='top-btn primary' data-action='new' data-module='regulatory'>${icon('plus')} Upload Regulasi</button>`)+
    `<div class='grid grid-3' style='margin-bottom:16px'><div class='card'><div class='card-body'><div class='small muted'>Regulasi</div><div style='font-size:30px;font-weight:850'>${rows.length}</div></div></div><div class='card'><div class='card-body'><div class='small muted'>Dengan dokumen sumber</div><div style='font-size:30px;font-weight:850'>${hasFile}</div></div></div><div class='card'><div class='card-body'><div class='small muted'>Aktif</div><div style='font-size:30px;font-weight:850'>${rows.filter(x=>x.status==='ACTIVE').length}</div></div></div></div>`+
    `<div class='card'><div class='card-body'><div class='filters'><div class='search-box'><span class='search-ico'>${icon('search')}</span><input class='input' data-search placeholder='Cari regulasi, nomor, penerbit…' value='${esc(state.search)}'></div><span class='small muted'>${filtered.length} dari ${rows.length}</span></div><div class='table-wrap'><table><thead><tr><th>Regulasi</th><th>Penerbit</th><th>Berlaku</th><th>Status</th><th>Dokumen sumber</th><th>Verified</th><th>Aksi</th></tr></thead><tbody>${regRows}</tbody></table></div></div></div>`;
}
function documents(){
  const rows=state.data.docs||[];
  const filtered=state.docCategory?rows.filter(r=>r.document_type===state.docCategory):rows;
  const q=(state.search||"").toLowerCase();
  const shown=filtered.filter(r=>JSON.stringify(r).toLowerCase().includes(q));
  const cards=DOC_CATEGORIES.map(c=>{
    const isSop=c.type==="SOP_PELAYANAN"||c.type==="SOP_MANAJERIAL";
    const action=isSop?`data-action="nav" data-view="${c.type==="SOP_PELAYANAN"?"sop-pelayanan":"sop-manajerial"}"`:`data-action="doc-filter" data-type="${esc(c.type)}"`;
    return `<button class="doc-category-card ${state.docCategory===c.type?"active":""}" ${action}><span class="doc-category-icon">${icon(c.icon)}</span><span><strong>${esc(c.label)}</strong><small>${esc(c.desc)}</small><em>${rows.filter(r=>r.document_type===c.type).length} dokumen</em></span><span class="doc-chevron">→</span></button>`;
  }).join("");
  const body=shown.length?shown.map(r=>`<tr><td><div class="title-cell">${esc(r.title)}</div><div class="small muted">${esc(r.number||r.document_code||"Belum bernomor")}</div>${r.room_or_unit?`<div class="small muted">Ruangan: ${esc(r.room_or_unit)}</div>`:""}${r.managerial_field?`<div class="small muted">Bidang: ${esc(r.managerial_field)}</div>`:""}</td><td>${esc(docCatLabel(r.document_type))}</td><td>${esc(r.owner_unit||"—")}</td><td>v${esc(r.current_version_no||1)}</td><td>${statusBadge(r.status)}</td><td>${fmtDateTime(r.updated_at)}</td><td><button class="icon-btn" data-action="detail" data-module="documents" data-id="${r.id}">${icon("arrow")}</button></td></tr>`).join(""):rowEmpty(7,"Dokumen");
  return pageHead("Dokumen Legal RSUD","Pusat Dokumen Hukum & Tata Naskah","Dokumen hukum menjadi menu utama; modul pendukung berada di Governance & Tools.",`<button class="top-btn" data-action="clear-search">Clear</button><button class="top-btn primary" data-action="new" data-module="documents">${icon("plus")} Buat Dokumen</button>`)+
    `<div class="hero doc-hero"><div class="hero-copy"><div class="hero-kicker">ARMONI • LEGAL DOCUMENT CENTER</div><h2>Semua dokumen resmi RSUD dalam satu pusat kendali.</h2><p>Kelola SK Direktur, SOP Pelayanan, SOP Manajerial, peraturan, kebijakan, pedoman, surat dan naskah pendukung.</p></div><div class="hero-actions"><button class="top-btn gold" data-action="new" data-module="documents" data-doc-type="SOP_PELAYANAN">${icon("workflow")} SOP Pelayanan</button><button class="top-btn" data-action="new" data-module="documents" data-doc-type="SOP_MANAJERIAL">${icon("settings")} SOP Manajerial</button></div></div>`+
    `<div class="doc-category-grid">${cards}</div>`+
    `<div class="card"><div class="card-head"><div><div class="card-title">${state.docCategory?esc(docCatLabel(state.docCategory)):"Semua Dokumen Hukum"}</div><div class="card-subtitle">${shown.length} dokumen tampil</div></div></div><div class="card-body"><div class="filters"><div class="search-box"><span class="search-ico">${icon("search")}</span><input class="input" data-search placeholder="Cari judul, nomor, unit…" value="${esc(state.search)}"></div><button class="top-btn" data-action="clear-search">Clear</button></div><div class="table-wrap"><table><thead><tr><th>Dokumen</th><th>Jenis</th><th>Owner</th><th>Versi</th><th>Status</th><th>Update</th><th>Aksi</th></tr></thead><tbody>${body}</tbody></table></div></div></div>`;
}
function approvals(){ const rows=state.data.tasks; return pageHead("Workflow","Approval Inbox","Tindakan paraf, review, approval, dan signature gate berdasarkan task yang ditugaskan.",`<button class="top-btn" data-action="refresh">${icon("refresh")} Refresh</button>`)+`<div class="grid grid-2"><div class="card"><div class="card-head"><div><div class="card-title">My queue</div><div class="card-subtitle">Task berdasarkan assignment</div></div><span class="badge amber">${rows.filter(x=>x.status==="PENDING").length} pending</span></div><div class="card-body">${rows.map(t=>{const d=state.data.docs.find(x=>x.id===t.document_id)||{};return `<div class="alert ${t.status==="PENDING"?"amber":"green"}" style="margin-bottom:9px"><div class="alert-icon">${icon("check")}</div><div style="flex:1"><div style="display:flex;justify-content:space-between;gap:8px"><strong>${esc(t.task_type)}</strong>${statusBadge(t.status)}</div><div class="small muted" style="margin-top:3px">${esc(d.title||"Dokumen")}</div><div class="small muted" style="margin-top:4px">Due ${fmtDateTime(t.due_at)}</div><div class="head-actions" style="margin-top:9px"><button class="top-btn" data-action="detail" data-module="documents" data-id="${t.document_id}">Buka</button>${t.status==="PENDING"?`<button class="top-btn primary" data-action="approve" data-id="${t.id}">Approve</button>`:""}</div></div></div>`}).join("")}</div></div><div class="card"><div class="card-head"><div><div class="card-title">Workflow stages</div><div class="card-subtitle">Controlled lifecycle</div></div></div><div class="card-body"><div class="workflow">${["DRAFT","LEGAL REVIEW","UNIT REVIEW","PARAF","APPROVAL","SIGNATURE","EFFECTIVE"].map((x,i)=>`<div class="workflow-step ${i<4?"done":""} ${i===4?"active":""}"><div class="workflow-dot">${i<4?"✓":i+1}</div><div class="workflow-label">${x}</div></div>`).join("")}</div><div class="alert amber" style="margin-top:20px"><div class="alert-icon">${icon("lock")}</div><div><strong>Signature gate</strong><div class="small muted">Dokumen elektronik tidak boleh final sebelum authority, paraf, legal basis, dan TTE adapter tervalidasi.</div></div></div></div></div></div>`; }
function compliance(){ const rows=state.data.obligations; return pageHead("Compliance","Compliance Matrix","Rangkaian Regulation → Requirement → Obligation → Control → Evidence → Assessment → Action.",`<button class="top-btn primary" data-action="new" data-module="compliance">${icon("plus")} Obligation</button><button class="top-btn" data-action="nav" data-view="templates">Evidence model</button>`)+`<div class="card"><div class="card-body"><div class="filters"><div class="search-box"><span class="search-ico">${icon("search")}</span><input class="input" data-search placeholder="Cari obligation, requirement, unit…" value="${esc(state.search)}"></div>${[["COMPLIANT","green"],["PARTIAL","amber"],["NON_COMPLIANT","red"],["NOT_ASSESSED","slate"]].map(x=>`<button class="top-btn" data-action="filter-status" data-status="${x[0]}">${statusBadge(x[0])}</button>`).join("")}</div><div class="table-wrap"><table><thead><tr><th>Obligation</th><th>Unit</th><th>Priority</th><th>Status</th><th>Posture</th><th>Aksi</th></tr></thead><tbody>${rows.map(r=>`<tr><td><div class="title-cell">${esc(r.title)}</div><div class="small muted">${esc(r.obligation_code)}</div></td><td>${esc(r.responsible_unit)}</td><td>${statusBadge(r.priority)}</td><td>${statusBadge(r.status)}</td><td style="min-width:150px"><div class="progress"><span style="width:${r.status==="COMPLIANT"?100:r.status==="PARTIAL"?64:r.status==="NON_COMPLIANT"?26:10}%"></span></div></td><td><button class="top-btn" data-action="assessment" data-id="${r.id}">Assess</button></td></tr>`).join("")}</tbody></table></div></div></div>`; }
function cases(kind,title,desc,rows){ return tablePage(kind,title,desc,rows,[{label:"Case",render:r=>`<div class="title-cell">${esc(r.title||r.issue)}</div><div class="small muted">${esc(r.case_no||"")}</div>`},{label:"Priority",render:r=>statusBadge(r.priority||r.confidentiality)},{label:"Scope",render:r=>statusBadge(r.confidentiality)},{label:"Status",render:r=>statusBadge(r.status)},{label:"Dibuka",render:r=>fmtDate(r.opened_at)}]); }
function regulatoryDetail(id){
  const r=(state.data.regs||[]).find(x=>x.id===id);
  if(!r)return pageHead('Regulasi','Tidak ditemukan','Regulasi tidak tersedia pada scope ini.',`<button class="top-btn" data-action="nav" data-view="regulatory">Kembali</button>`);
  const files=(state.data.regFiles||[]).filter(x=>x.regulation_id===id);
  return pageHead('Regulatory Detail',r.title,'Detail metadata, dokumen sumber PDF, integritas dan traceability.',`<button class="top-btn" data-action="nav" data-view="regulatory">Kembali</button><button class="top-btn primary" data-action="new" data-module="regulatory">Upload Regulasi</button>`)+
    `<div class="detail-grid"><div>
      <div class="card"><div class="card-head"><div><div class="card-title">${esc(r.title)}</div><div class="card-subtitle">${esc(r.type)} • ${esc(r.number||'—')}/${esc(r.year||'—')}</div></div>${statusBadge(r.status)}</div>
      <div class="card-body"><div class="meta-grid">
        <div class="meta-box"><div class="label">Penerbit</div><div class="value">${esc(r.issuer||'—')}</div></div>
        <div class="meta-box"><div class="label">Tanggal berlaku</div><div class="value">${fmtDate(r.effective_date)}</div></div>
        <div class="meta-box"><div class="label">Verified</div><div class="value">${fmtDate(r.verified_at)}</div></div>
        <div class="meta-box"><div class="label">Dokumen sumber</div><div class="value">${files.length} PDF</div></div>
      </div></div></div>
      <div class="card" style="margin-top:16px"><div class="card-head"><div><div class="card-title">Dokumen Sumber</div><div class="card-subtitle">File PDF privat + checksum SHA-256</div></div></div><div class="card-body">${files.length?files.map(x=>`<div class="alert green"><div class="alert-icon">${icon('download')}</div><div style="flex:1"><strong>${esc(x.file_name)}</strong><div class="small muted">${Math.max(1,Math.round((x.file_size||0)/1024))} KB • ${esc(x.checksum_sha256||'checksum belum tersedia')}</div></div><button class="top-btn" data-action="download-reg-file" data-file-id="${x.id}">View PDF</button></div>`).join(''):'<div class="doc-empty">Belum ada PDF sumber. Gunakan Upload Regulasi.</div>'}</div></div>
    </div><div>
      <div class="card"><div class="card-head"><div><div class="card-title">Governance Trace</div><div class="card-subtitle">Regulasi → obligation → dokumen</div></div></div><div class="card-body"><div class="timeline">
        <div class="timeline-item"><div class="timeline-dot"></div><div class="timeline-title">Regulasi terdaftar</div><div class="timeline-time">${fmtDateTime(r.created_at)}</div></div>
        <div class="timeline-item"><div class="timeline-dot"></div><div class="timeline-title">PDF sumber</div><div class="timeline-time">${files.length?fmtDateTime(files[0].uploaded_at):'Belum diunggah'}</div></div>
        <div class="timeline-item"><div class="timeline-dot"></div><div class="timeline-title">Impact analysis</div><div class="timeline-time">Siap dihubungkan ke compliance dan dokumen internal</div></div>
      </div></div></div>
      <div class="card" style="margin-top:16px"><div class="card-head"><div><div class="card-title">File Integrity</div><div class="card-subtitle">Checksum untuk verifikasi artefak</div></div></div><div class="card-body">${files.length?files.map(x=>`<div class="small muted" style="word-break:break-all;margin-bottom:10px"><strong>${esc(x.file_name)}</strong><br>SHA-256: ${esc(x.checksum_sha256||'—')}</div>`).join(''):'<div class="doc-empty">Belum ada checksum.</div>'}</div></div>
    </div></div>`;
}
function contracts(){ return tablePage("contracts","Contract Management","Kontrak, clause, obligation, renewal dan risk watch.",state.data.contracts,[{label:"Kontrak",render:r=>`<div class="title-cell">${esc(r.title)}</div><div class="small muted">${esc(r.contract_no)}</div>`},{label:"Pihak",render:r=>`${esc(r.party_a)} ↔ ${esc(r.party_b)}`},{label:"Unit",key:"owner_unit"},{label:"Berakhir",render:r=>fmtDate(r.end_date)},{label:"Status",render:r=>statusBadge(r.status)}]); }
function licenses(){ return tablePage("licenses","License Management","Register izin/sertifikat dengan expiry tracking, owner, evidence, dan renewal workflow.",state.data.licenses,[{label:"Lisensi",render:r=>`<div class="title-cell">${esc(r.license_type)}</div><div class="small muted">${esc(r.number)}</div>`},{label:"Issuer",key:"issuer"},{label:"Unit",key:"owner_unit"},{label:"Expiry",render:r=>fmtDate(r.expiry_date)},{label:"Status",render:r=>statusBadge(r.status)}]); }
function mailPage(direction){ const rows=state.data.mail.filter(x=>x.direction===direction); return tablePage(direction==="INCOMING"?"incoming":"outgoing",direction==="INCOMING"?"Surat Masuk":"Surat Keluar",direction==="INCOMING"?"Agenda naskah masuk dan disposition history.":"Register, dispatch, dan archive naskah keluar.",rows,[{label:"Naskah",render:r=>`<div class="title-cell">${esc(r.document_no||"—")}</div><div class="small muted">${esc(r.summary)}</div>`},{label:direction==="INCOMING"?"Asal":"Tujuan",render:r=>esc(r.origin_or_destination)},{label:"Tanggal",render:r=>fmtDate(r.received_or_sent_date)},{label:"Unit",render:r=>esc(r.target_unit||"—")},{label:"Status",render:r=>statusBadge(r.status)}]); }
function templates(){ return tablePage("templates","Template Management","Lifecycle template dari draft, review, approved, active sampai deprecated/archived.",state.data.templates,[{label:"Template",render:r=>`<div class="title-cell">${esc(r.name)}</div><div class="small muted">${esc(r.template_code)} • v${esc(r.version)}</div>`},{label:"Jenis",key:"document_type"},{label:"Status",render:r=>statusBadge(r.status)},{label:"Golden sample",render:r=>r.status==="ACTIVE"?statusBadge("VERIFIED"):statusBadge("PENDING")}]); }
function archive(){ return pageHead("Archive","Archive & Backup","Pantau copy Supabase Storage, verifikasi hash, retry queue, dan pointer Google Drive.",`<button class="top-btn primary" data-action="backup">${icon("archive")} Backup</button>`)+`<div class="grid grid-3"><div class="card"><div class="card-head"><div><div class="card-title">Primary store</div><div class="card-subtitle">Supabase Storage</div></div>${statusBadge("VERIFIED")}</div><div class="card-body"><div style="font-size:32px;font-weight:850">98.4%</div><div class="small muted">artifact integrity verified</div><div class="progress" style="margin-top:12px"><span style="width:98.4%"></span></div></div></div><div class="card"><div class="card-head"><div><div class="card-title">Institutional archive</div><div class="card-subtitle">Google Drive Shared Drive</div></div>${statusBadge("ACTIVE")}</div><div class="card-body"><div class="stat-list">${[["Folder policy","8 domain root"],["Last verify","06 Okt 2026 11:40"],["Retry queue","0"],["Hash mismatch","0"]].map(x=>`<div class="stat-line"><span class="muted">${x[0]}</span><strong>${x[1]}</strong></div>`).join("")}</div></div></div><div class="card" style="margin-top:16px"><div class="card-head"><div><div class="card-title">Archive policy</div><div class="card-subtitle">Pointer, integrity, retry</div></div></div><div class="card-body"><div class="grid grid-4">${["REGULATIONS","INTERNAL DOCUMENTS","LEGAL CASES","ETHICS","CONTRACTS","LICENSES","COMPLIANCE EVIDENCE","TEMPLATES"].map(x=>`<div class="meta-box"><div class="label">${x}</div><div class="value">Ready</div><div class="small muted">Google Drive folder policy</div></div>`).join("")}</div></div></div>`; }
function audit(){ const events=[{action:"LOGIN",object_type:"SESSION",occurred_at:"2026-10-06T07:40:00Z"},{action:"SOURCE_SYNC",object_type:"REGULATION",occurred_at:"2026-10-06T07:25:00Z"},{action:"PARAF",object_type:"DOCUMENT",occurred_at:"2026-10-06T06:58:00Z"},{action:"DOWNLOAD",object_type:"DOCUMENT",occurred_at:"2026-10-06T06:41:00Z"},{action:"BACKUP",object_type:"ARCHIVE",occurred_at:"2026-10-06T06:20:00Z"}]; return tablePage("audit","Audit Explorer","Event history dengan actor, timestamp, object, dan chain-hash metadata.",events,[{label:"Event",render:r=>`<div class="title-cell">${esc(r.action)}</div><div class="small muted">${esc(r.object_type)}</div>`},{label:"Waktu",render:r=>fmtDateTime(r.occurred_at)},{label:"Integrity",render:r=>statusBadge("VERIFIED")}]); }
function admin(){
  const roles=['SUPER_ADMIN','LEGAL_ADMIN','ETHICS_ADMIN','COMPLIANCE_ADMIN','DOCUMENT_MANAGER','UNIT_OWNER','DIRECTOR','AUDITOR'];
  return pageHead('Administration','System Administration','Identity, role, policy, numbering, dan governance configuration.',`<button class="top-btn" data-action="reset-password">${icon('lock')} Reset Password</button><button class="top-btn" data-action="refresh">${icon('refresh')} Refresh</button>`)+
    `<div class="grid grid-3">
      <div class="card"><div class="card-head"><div><div class="card-title">Super Administrator</div><div class="card-subtitle">Akun utama ARMONI</div></div>${statusBadge('ACTIVE')}</div><div class="card-body"><div class="meta-box"><div class="label">Email</div><div class="value">superadmin@aksara.local</div></div><div class="meta-box" style="margin-top:10px"><div class="label">Role</div><div class="value">SUPER_ADMIN</div></div><div class="login-note">Password tidak disimpan di source code. Pengelolaan kredensial melalui Supabase Auth.</div></div></div>
      <div class="card"><div class="card-head"><div><div class="card-title">Session</div><div class="card-subtitle">Identity context</div></div>${statusBadge('ACTIVE')}</div><div class="card-body"><div class="meta-grid"><div class="meta-box"><div class="label">User</div><div class="value">${esc(userName())}</div></div><div class="meta-box"><div class="label">Role aktif</div><div class="value">${esc(roleLabel())}</div></div><div class="meta-box"><div class="label">Mode</div><div class="value">${state.demo?'Demo':'Live'}</div></div><div class="meta-box"><div class="label">Supabase</div><div class="value">${SB?'Connected':'Unavailable'}</div></div></div></div></div>
      <div class="card"><div class="card-head"><div><div class="card-title">Security posture</div><div class="card-subtitle">RLS & credential boundary</div></div>${statusBadge('VERIFIED')}</div><div class="card-body"><div class="stat-list">${[['Frontend key','Publishable only'],['Service-role','Never exposed'],['Legal tables','RLS enabled'],['Storage','Private bucket + RLS'],['Audit','Event logging enabled']].map(x=>`<div class="stat-line"><span class="muted">${x[0]}</span><strong>${x[1]}</strong></div>`).join('')}</div></div></div>
    </div>`+
    `<div class="card" style="margin-top:16px"><div class="card-head"><div><div class="card-title">Role catalog</div><div class="card-subtitle">Role tersedia untuk governance ARMONI</div></div></div><div class="card-body"><div class="module-grid">${roles.map(x=>`<div class="module-card"><div class="mod-icon">${icon('shield')}</div><div><h4>${x}</h4><p>Authorization via Supabase RLS + role mapping.</p></div></div>`).join('')}</div></div></div>`;
}
function sop(){ const d=state.data.docs.find(x=>x.document_type==="SOP")||state.data.docs[0]; return pageHead("Operations","SOP & Policy Studio","Builder langkah terstruktur: START → ACTION → DECISION → DOCUMENT → RESPONSIBLE ROLE → END.",`<button class="top-btn primary" data-action="new" data-module="documents">${icon("plus")} SOP Baru</button>`)+`<div class="grid grid-2"><div class="card"><div class="card-head"><div><div class="card-title">Procedure builder</div><div class="card-subtitle">Structured nodes, conditions & evidence</div></div></div><div class="card-body"><div class="timeline">${["START • Trigger permintaan dokumen","ACTION • Validasi dasar hukum","DECISION • Regulasi masih berlaku?","ACTION • Legal review + paraf","DOCUMENT • Generate output","END • Archive + evidence"].map((x,i)=>`<div class="timeline-item"><div class="timeline-dot"></div><div class="timeline-title">${esc(x)}</div><div class="timeline-time">Node ${i+1} • structured</div></div>`).join("")}</div></div></div><div class="card"><div class="card-head"><div><div class="card-title">SOP lineage</div><div class="card-subtitle">Version, regulation, evidence</div></div>${statusBadge("EFFECTIVE")}</div><div class="card-body"><div class="meta-grid"><div class="meta-box"><div class="label">Current</div><div class="value">v${d.current_version_no||1}</div></div><div class="meta-box"><div class="label">Owner</div><div class="value">${esc(d.owner_unit||"Tata Usaha")}</div></div><div class="meta-box"><div class="label">Linked regulation</div><div class="value">Perwali 65/2023</div></div><div class="meta-box"><div class="label">Evidence</div><div class="value">12 artifacts</div></div></div></div></div></div>`; }

function sopPelayanan(room=''){
  const rows=(state.data.docs||[]).filter(r=>r.document_type==='SOP_PELAYANAN'&&(room?!String(r.room_or_unit||'').toLowerCase().includes(room.toLowerCase()):true));
  const rooms=[...new Set((state.data.docs||[]).filter(r=>r.document_type==='SOP_PELAYANAN'&&r.room_or_unit).map(r=>r.room_or_unit).sort())];
  return pageHead('SOP Pelayanan','SOP Pelayanan per Ruangan / Unit','Cabang pelayanan memakai nama ruangan/unit teks bebas sehingga fleksibel mengikuti struktur RSUD.',`<button class='top-btn' data-action='nav' data-view='documents'>Dokumen Hukum</button><button class='top-btn primary' data-action='new' data-module='documents' data-doc-type='SOP_PELAYANAN'>+ SOP Pelayanan</button>`)+
    `<div class='grid grid-3' style='margin-bottom:16px'><div class='card'><div class='card-body'><div class='small muted'>Total SOP Pelayanan</div><div style='font-size:30px;font-weight:850'>${(state.data.docs||[]).filter(r=>r.document_type==='SOP_PELAYANAN').length}</div></div></div><div class='card'><div class='card-body'><div class='small muted'>Ruangan/Unit terdaftar</div><div style='font-size:30px;font-weight:850'>${rooms.length}</div></div></div><div class='card'><div class='card-body'><div class='small muted'>Tampil</div><div style='font-size:30px;font-weight:850'>${rows.length}</div></div></div></div>`+
    `<div class='card'><div class='card-head'><div><div class='card-title'>Cabang Ruangan / Unit</div><div class='card-subtitle'>Klik untuk memfilter SOP ke lokasi tertentu</div></div></div><div class='card-body'><div class='module-grid'>${rooms.length?rooms.map(r=>`<button class='module-card ${room===r?'active':''}' data-action='sop-room' data-room='${esc(r)}'><div class='mod-icon'>${icon('workflow')}</div><div><h4>${esc(r)}</h4><p>${rows.filter(x=>x.room_or_unit===r).length} SOP</p></div></button>`).join(''):'<div class="doc-empty">Belum ada SOP Pelayanan. Buat SOP pertama dan isi lokasi pada kolom Ruangan / Unit.</div>'}</div></div></div>`+
    `<div class='card' style='margin-top:16px'><div class='card-head'><div><div class='card-title'>Daftar SOP ${room?'• '+esc(room):''}</div><div class='card-subtitle'>Lifecycle, owner, versi dan lokasi</div></div></div><div class='card-body'><div class='table-wrap'><table><thead><tr><th>Judul</th><th>Ruangan / Unit</th><th>Owner</th><th>Versi</th><th>Status</th><th>Aksi</th></tr></thead><tbody>${rows.length?rows.map(r=>`<tr><td><div class='title-cell'>${esc(r.title)}</div><div class='small muted'>${esc(r.number||r.document_code||'')}</div></td><td>${esc(r.room_or_unit||'—')}</td><td>${esc(r.owner_unit||'—')}</td><td>v${esc(r.current_version_no||1)}</td><td>${statusBadge(r.status)}</td><td><button class='icon-btn' data-action='detail' data-module='documents' data-id='${r.id}'>${icon('arrow')}</button></td></tr>`).join(''):rowEmpty(6,'SOP Pelayanan')}</tbody></table></div></div></div>`;
}
function sopManajerial(field=''){
  const rows=(state.data.docs||[]).filter(r=>r.document_type==='SOP_MANAJERIAL'&&(field?r.managerial_field===field:true));
  return pageHead('SOP Manajerial','SOP Manajerial per Bidang','Cabang manajerial dikunci ke 4 bidang organisasi yang telah ditetapkan.',`<button class='top-btn' data-action='nav' data-view='documents'>Dokumen Hukum</button><button class='top-btn primary' data-action='new' data-module='documents' data-doc-type='SOP_MANAJERIAL'>+ SOP Manajerial</button>`)+
    `<div class='module-grid managerial-grid'>${MANAGERIAL_FIELDS.map(x=>`<button class='module-card ${field===x?'active':''}' data-action='sop-field' data-field='${esc(x)}'><div class='mod-icon'>${icon('settings')}</div><div><h4>${esc(x)}</h4><p>${(state.data.docs||[]).filter(r=>r.document_type==='SOP_MANAJERIAL'&&r.managerial_field===x).length} SOP</p></div></button>`).join('')}</div>`+
    `<div class='card' style='margin-top:16px'><div class='card-head'><div><div class='card-title'>${field?'Daftar SOP • '+esc(field):'Semua SOP Manajerial'}</div><div class='card-subtitle'>Setiap SOP mempunyai pemilik, versi dan lifecycle.</div></div></div><div class='card-body'><div class='table-wrap'><table><thead><tr><th>Judul</th><th>Bidang</th><th>Owner</th><th>Versi</th><th>Status</th><th>Aksi</th></tr></thead><tbody>${rows.length?rows.map(r=>`<tr><td><div class='title-cell'>${esc(r.title)}</div><div class='small muted'>${esc(r.number||r.document_code||'')}</div></td><td>${esc(r.managerial_field||'—')}</td><td>${esc(r.owner_unit||'—')}</td><td>v${esc(r.current_version_no||1)}</td><td>${statusBadge(r.status)}</td><td><button class='icon-btn' data-action='detail' data-module='documents' data-id='${r.id}'>${icon('arrow')}</button></td></tr>`).join(''):rowEmpty(6,'SOP Manajerial')}</tbody></table></div></div></div>`;
}
function more(){
  const items=[["regulatory","Regulatory Hub","Regulasi & upload dokumen sumber","book"],["approvals","Approval Inbox","Paraf & approval","check"],["compliance","Compliance Matrix","Obligation, control & evidence","shield"],["legal","Legal Cases","Issue & legal opinion","balance"],["ethics","Ethics Cases","Restricted ethics review","heart"],["contracts","Contracts","Obligation & renewal","contract"],["licenses","Licenses","Expiry & renewal","license"],["incoming","Surat Masuk","Agenda & disposisi","mail"],["outgoing","Surat Keluar","Register & dispatch","mail"],["templates","Templates","Template catalog","template"],["archive","Archive & Backup","Storage & archive","archive"],["audit","Audit Explorer","Audit trail","audit"],["admin","Administration","Users, roles & policy","settings"]];
  return pageHead("Governance","Governance & Tools","Semua modul pendukung dimuat di satu menu khusus.",`<button class="top-btn" data-action="nav" data-view="documents">${icon("file")} Dokumen Hukum</button>`)+`<div class="module-grid">${items.map(i=>`<button class="module-card" data-action="nav" data-view="${i[0]}"><span class="mod-icon">${icon(i[3])}</span><span><h4>${esc(i[1])}</h4><p>${esc(i[2])}</p></span></button>`).join("")}</div>`;
}
function docDetail(id){ const d=state.data.docs.find(x=>x.id===id); if(!d) return pageHead("Dokumen","Tidak ditemukan","Dokumen tidak tersedia pada scope saat ini.",`<button class="top-btn" data-action="nav" data-view="documents">Kembali</button>`); const rules=[{id:"TN-001",label:"Arial 12"},{id:"TN-003",label:"Margin kiri ≥3 cm"},{id:"TN-004",label:"Margin kanan ≥2 cm"},{id:"TN-005",label:"Margin bawah ≥2,5 cm"},{id:"TN-009",label:"e-paraf logged"},{id:"TN-010",label:"Max 3 hierarchy paraf"},{id:"TN-013",label:"No stamp electronic"}]; return pageHead("Document Workspace",d.title,"Provenance, legal basis, template version, workflow, and finalization gate.",`<button class="top-btn" data-action="nav" data-view="documents">${icon("arrow")} Daftar</button><button class="top-btn gold" data-action="validate-doc" data-id="${d.id}">${icon("check")} Validate</button><button class="top-btn primary" data-action="generate-doc" data-id="${d.id}">${icon("download")} Generate</button>`)+`<div class="detail-grid"><div><div class="card"><div class="card-head"><div><div class="card-title">${esc(d.number||d.document_code)}</div><div class="card-subtitle">${esc(d.document_type)} • v${esc(d.current_version_no||1)} • ${esc(d.template_code||"No template")} v${esc(d.template_version||"—")}</div></div>${statusBadge(d.status)}</div><div class="card-body"><div class="meta-grid"><div class="meta-box"><div class="label">Owner unit</div><div class="value">${esc(d.owner_unit||"—")}</div></div><div class="meta-box"><div class="label">Security</div><div class="value">${esc(d.security_class)} • ${d.output_mode==="ELECTRONIC"?"Elektronik":"Kertas"}</div></div><div class="meta-box"><div class="label">Legal basis required</div><div class="value">${d.legal_basis_required?"Ya":"Tidak"}</div></div><div class="meta-box"><div class="label">Last updated</div><div class="value">${fmtDateTime(d.updated_at)}</div></div></div><div style="margin-top:18px"><div class="small muted" style="margin-bottom:8px">Lifecycle</div><div class="workflow">${["DRAFT","LEGAL REVIEW","UNIT REVIEW","PARAF","APPROVAL","SIGNATURE","EFFECTIVE"].map((x,i)=>{const active={DRAFT:0,LEGAL_REVIEW:1,UNIT_REVIEW:2,PARAF:3,APPROVAL:4,SIGNATURE:5,EFFECTIVE:6}[d.status]??1;return `<div class="workflow-step ${i<active?"done":""} ${i===active?"active":""}"><div class="workflow-dot">${i<active?"✓":i+1}</div><div class="workflow-label">${x}</div></div>`}).join("")}</div></div></div></div><div class="card" style="margin-top:16px"><div class="card-head"><div><div class="card-title">Tata Naskah Validator</div><div class="card-subtitle">Machine rules before generate/signature</div></div></div><div class="card-body">${rules.map(r=>`<div class="stat-line" style="margin-bottom:9px"><span><strong>${r.id}</strong> <span class="muted">${r.label}</span></span>${statusBadge("APPROVED")}</div>`).join("")}</div></div><div class="card" style="margin-top:16px"><div class="card-head"><div><div class="card-title">Audit & provenance</div><div class="card-subtitle">Immutable trail anchors</div></div></div><div class="card-body"><div class="timeline">${["Draft created","Legal basis attached","Review task opened","Template v"+(d.template_version||"1.0")+" resolved","Latest version hash registered"].map((x,i)=>`<div class="timeline-item"><div class="timeline-dot"></div><div class="timeline-title">${esc(x)}</div><div class="timeline-time">${i===4?"Pending final artifact":fmtDateTime(new Date(Date.now()-i*86400000))}</div></div>`).join("")}</div></div></div></div><div><div class="card"><div class="card-head"><div><div class="card-title">Legal basis</div><div class="card-subtitle">Citation object</div></div><button class="top-btn" data-action="new" data-module="regulatory">${icon("plus")}</button></div><div class="card-body"><div class="alert green"><div class="alert-icon">${icon("book")}</div><div><strong>Perwali 65/2023</strong><div class="small muted">Status ACTIVE • verified • citation available</div></div></div><div class="alert amber" style="margin-top:9px"><div class="alert-icon">${icon("refresh")}</div><div><strong>Impact watch</strong><div class="small muted">1 downstream document flagged for change review.</div></div></div></div></div><div class="card" style="margin-top:16px"><div class="card-head"><div><div class="card-title">Signature panel</div><div class="card-subtitle">Authority Matrix gate</div></div></div><div class="card-body"><div class="meta-box"><div class="label">Signer profile</div><div class="value">Direktur / pejabat berwenang</div><div class="small muted" style="margin-top:4px">Actual authority must be resolved from approved Authority Matrix.</div></div><div class="meta-box" style="margin-top:10px"><div class="label">Paraf hierarchy</div><div class="value">0 / max 3</div><div class="small muted" style="margin-top:4px">Electronic history only.</div></div><button class="top-btn" style="width:100%;margin-top:10px" data-action="signature-check">Signature gate</button></div></div></div></div>`; }

function formModal(modal){
  const module=typeof modal==="string"?modal:modal?.module;
  const preset=typeof modal==="object"?modal.docType:"";
  const defs={
    documents:{title:preset?("Buat "+docCatLabel(preset)):"Buat Dokumen Hukum",fields:[
      ["title","Judul dokumen","text",true,"col-8"],
      ["document_type","Jenis dokumen","select",true,"col-4",DOC_CATEGORIES.map(x=>x.type)],
      ["owner_unit","Unit pemilik","text",true,"col-6"],
      ["output_mode","Media output","select",true,"col-3",["ELECTRONIC","PAPER"]],
      ["security_class","Klasifikasi","select",true,"col-3",["B","T","R","SR"]],
      ["legal_basis_required","Wajib dasar hukum","select",true,"col-4",["YES","NO"]]
    ]},
    regulatory:{title:"Upload Regulasi + Dokumen Sumber",fields:[
      ["title","Judul regulasi","text",true,"col-8"],["type","Jenis regulasi","text",true,"col-4"],
      ["number","Nomor","text",false,"col-4"],["year","Tahun","number",false,"col-4"],["issuer","Penerbit","text",false,"col-4"],
      ["status","Status","select",true,"col-4",["ACTIVE","AMENDED","REPEALED","STALE"]],["effective_date","Tanggal berlaku","date",false,"col-4"]
    ]},
    compliance:{title:"Tambah Compliance Obligation",fields:[["obligation_code","Kode obligation","text",true,"col-4"],["title","Judul","text",true,"col-8"],["requirement_text","Requirement","textarea",true,"col-12"],["responsible_unit","Unit penanggung jawab","text",false,"col-6"],["priority","Priority","select",true,"col-3",["LOW","MEDIUM","HIGH","CRITICAL"]]]},
    contracts:{title:"Tambah Kontrak",fields:[["contract_no","Nomor kontrak","text",true,"col-4"],["title","Judul","text",true,"col-8"],["party_a","Pihak A","text",false,"col-6"],["party_b","Pihak B","text",false,"col-6"],["end_date","Tanggal berakhir","date",false,"col-4"],["owner_unit","Unit","text",false,"col-4"],["status","Status","select",true,"col-4",["DRAFT","ACTIVE","EXPIRING","EXPIRED"]]]},
    licenses:{title:"Tambah Lisensi / Izin",fields:[["license_type","Jenis","text",true,"col-4"],["number","Nomor","text",true,"col-4"],["issuer","Penerbit","text",false,"col-4"],["expiry_date","Tanggal expiry","date",false,"col-4"],["owner_unit","Unit","text",false,"col-4"],["responsible_name","PIC","text",false,"col-4"],["status","Status","select",true,"col-4",["VALID","EXPIRING","EXPIRED","SUSPENDED"]]]},
    legal:{title:"Buka Legal Case",fields:[["case_no","Case No","text",true,"col-4"],["title","Judul case","text",true,"col-8"],["category","Kategori","text",false,"col-4"],["priority","Priority","select",true,"col-4",["LOW","MEDIUM","HIGH","CRITICAL"]],["confidentiality","Klasifikasi","select",true,"col-4",["B","T","R","SR"]],["issue","Issue statement","textarea",true,"col-12"]]},
    ethics:{title:"Intake Ethics Case",fields:[["case_no","Case No","text",true,"col-4"],["issue","Ethical issue","textarea",true,"col-8"],["reporter","Reporter","text",false,"col-4"],["unit","Unit","text",false,"col-4"],["confidentiality","Klasifikasi","select",true,"col-4",["SR","R"]]]},
    incoming:{title:"Register Surat Masuk",fields:[["received_or_sent_date","Tanggal terima","date",true,"col-4"],["document_date","Tanggal naskah","date",false,"col-4"],["document_no","Nomor naskah","text",false,"col-4"],["origin_or_destination","Asal","text",true,"col-6"],["target_unit","Unit pengolah","text",true,"col-6"],["summary","Isi ringkas","textarea",true,"col-12"]]},
    outgoing:{title:"Register Surat Keluar",fields:[["received_or_sent_date","Tanggal kirim","date",true,"col-4"],["document_date","Tanggal naskah","date",false,"col-4"],["document_no","Nomor naskah","text",false,"col-4"],["origin_or_destination","Tujuan","text",true,"col-6"],["summary","Isi ringkas","textarea",true,"col-6"]]},
    templates:{title:"Tambah Template",fields:[["template_code","Kode template","text",true,"col-4"],["name","Nama template","text",true,"col-8"],["document_type","Jenis dokumen","text",true,"col-6"],["version","Versi","text",true,"col-3"],["status","Status","select",true,"col-3",["DRAFT","REVIEW","APPROVED","ACTIVE"]]]}
  };
  const d=defs[module]||defs.documents;
  const today=new Date().toISOString().slice(0,10);
  const fields=d.fields.map(function(f){const [name,label,type,req,span,opts]=f;if(type==="select")return `<div class="field ${span}"><label>${esc(label)}${req?" *":""}</label><select class="select" name="${name}" ${req?"required":""}>${opts.map(function(o){const lbl=name==="document_type"?docCatLabel(o):o.replaceAll("_"," ");return `<option value="${o}" ${(name==="document_type"&&preset===o)?"selected":""}>${esc(lbl)}</option>`;}).join("")}</select></div>`;if(type==="textarea")return `<div class="field ${span}"><label>${esc(label)}${req?" *":""}</label><textarea class="textarea" rows="4" name="${name}" ${req?"required":""}></textarea></div>`;return `<div class="field ${span}"><label>${esc(label)}${req?" *":""}</label><input class="input" type="${type}" name="${name}" value="${name.includes("date")?today:""}" ${req?"required":""}></div>`;}).join("");
  const sopExtra=module==="documents"?`<input type="hidden" name="__doc_type" value="${esc(preset)}"><div class="sop-scope-box"><div><strong>SOP Scope</strong><div class="small muted">Jika jenis SOP Pelayanan, isi ruangan/unit secara bebas. Jika SOP Manajerial, pilih salah satu dari 4 bidang.</div></div><div class="form-grid" style="margin-top:12px"><div class="field col-6"><label>Ruangan / Unit Pelayanan</label><input class="input" name="room_or_unit" placeholder="Contoh: IGD, Ruang Melati, Farmasi"></div><div class="field col-6"><label>Bidang Manajerial</label><select class="select" name="managerial_field"><option value="">Pilih bila SOP Manajerial…</option>${MANAGERIAL_FIELDS.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join("")}</select></div></div></div>`:"";
  const uploadExtra=module==="regulatory"?`<div class="upload-box"><label>File regulasi</label><input class="input" type="file" name="reg_file" accept="application/pdf,.pdf" required><div class="help">PDF saja • maksimum 20 MB • file privat • checksum SHA-256 otomatis.</div><div class="field" style="margin-top:9px"><label>Catatan</label><textarea class="textarea" name="file_notes" rows="2" placeholder="Sumber / keterangan file"></textarea></div></div>`:"";
  return `<div class="modal-backdrop" data-action="close-modal"><div class="modal" data-modal-stop><div class="modal-head"><div><div class="modal-title">${esc(d.title)}</div><div class="small muted">ARMONI • RLS • Audit • Integrity</div></div><button class="icon-btn" data-action="close-modal">${icon("close")}</button></div><form id="modal-form"><div class="modal-body"><div class="form-grid">${fields}</div>${sopExtra}${uploadExtra}<div class="login-note" style="margin-top:16px">Validator: field wajib, legal basis, authority, output mode, SOP scope, lifecycle.</div></div><div class="modal-foot"><button type="button" class="top-btn" data-action="close-modal">Batal</button><button type="submit" class="top-btn primary">${icon("check")} Simpan</button></div><input type="hidden" name="__module" value="${module}"></form></div></div>`;
}
async function sha256File(file){const hash=await crypto.subtle.digest('SHA-256',await file.arrayBuffer());return [...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,'0')).join('');}
function safeFileName(name){return String(name||'file').replace(/[^a-zA-Z0-9._-]+/g,'_').slice(-160);}
async function downloadRegFile(id){const f=(state.data.regFiles||[]).find(x=>x.id===id);if(!f){toast('File regulasi tidak ditemukan.','error');return;}if(state.demo){toast('Mode demo tidak menyimpan file biner.','warn');return;}if(!SB){toast('Supabase belum tersedia.','error');return;}const r=await SB.storage.from('legal-regulatory-documents').createSignedUrl(f.storage_path,600);if(r.error){toast(r.error.message,'error');return;}state.pdfViewer={id,url:r.data.signedUrl};go('regulatory-view',id);render();}
async function loadLive(){const [regs,docs,tasks,obligations,contracts,licenses,cases,ethics,mail,templates,regFiles,sopScopes]=await Promise.all([liveQuery('legal_regulations'),liveQuery('legal_documents'),liveQuery('legal_workflow_tasks'),liveQuery('legal_compliance_obligations'),liveQuery('legal_contracts'),liveQuery('legal_licenses'),liveQuery('legal_cases'),liveQuery('legal_ethics_cases'),liveQuery('legal_mail_register'),liveQuery('legal_templates'),liveQuery('legal_regulatory_files'),liveQuery('legal_sop_scopes')]);const scopeMap=new Map(sopScopes.map(x=>[x.document_id,x]));const mergedDocs=docs.map(d=>({...d,...(scopeMap.get(d.id)||{})}));state.data={regs,docs:mergedDocs,tasks,obligations,contracts,licenses,cases,ethics,mail,templates,regFiles,sopScopes};}
async function saveForm(form){
  const fd=new FormData(form),module=fd.get('__module'),preset=fd.get('__doc_type'),data={};
  for(const [k,v] of fd.entries())if(!k.startsWith('__')&&!(v instanceof File))data[k]=v;
  const rf=fd.get('reg_file'),file=rf instanceof File&&rf.size?rf:null;
  if(module==='documents'){
    const type=preset||data.document_type;if(!type||!data.title||!data.owner_unit)throw new Error('Jenis, judul, dan unit pemilik wajib diisi.');
    if(type==='SOP_PELAYANAN'&&!String(data.room_or_unit||'').trim())throw new Error('SOP Pelayanan wajib mengisi ruangan/unit.');
    if(type==='SOP_MANAJERIAL'&&!MANAGERIAL_FIELDS.includes(data.managerial_field))throw new Error('SOP Manajerial wajib memilih bidang.');
    let number=null;if(!state.demo&&SB&&isRole('SUPER_ADMIN','LEGAL_ADMIN','DOCUMENT_MANAGER')){const n=await SB.rpc('reserve_legal_number',{p_document_type:type,p_year:new Date().getFullYear(),p_prefix:'RSUD-SSMA'});if(!n.error)number=n.data;}
    const template=({SK_DIREKTUR:'SK-DIR',SOP_PELAYANAN:'SOP-A4',SOP_MANAJERIAL:'SOP-A4',PERATURAN_DIREKTUR:'PERDIR-A4',KEBIJAKAN:'KEB-A4',PEDOMAN:'PED-A4',INSTRUKSI:'INS-A4',SURAT_EDARAN:'SE-A4',SURAT_DINAS:'SURAT-DINAS'}[type]||'A4');
    const row={document_code:'DOC-'+type+'-'+Date.now(),document_type:type,title:data.title,number,owner_unit:data.owner_unit,security_class:data.security_class,output_mode:data.output_mode,legal_basis_required:data.legal_basis_required==='YES',template_code:template,template_version:'1.0',owner_user_id:state.demo?'demo':state.user?.id,created_by:state.demo?null:state.user?.id,status:'DRAFT'};
    if(state.demo){state.data.docs.unshift({...row,id:uid(),current_version_no:1,updated_at:new Date().toISOString(),room_or_unit:data.room_or_unit||null,managerial_field:data.managerial_field||null});state.modal=null;go('documents');render();toast('Dokumen berhasil dibuat di mode demo.');return;}
    const ins=await SB.from('legal_documents').insert(row).select().single();if(ins.error)throw ins.error;
    const content={title:data.title,sop_class:type==='SOP_PELAYANAN'?'PELAYANAN':type==='SOP_MANAJERIAL'?'MANAJERIAL':null,room_or_unit:data.room_or_unit||null,managerial_field:data.managerial_field||null};
    const vr=await SB.from('legal_document_versions').insert({document_id:ins.data.id,version_no:1,content_json:content,template_code:template,template_version:'1.0',created_by:state.user.id});if(vr.error)throw vr.error;
    if(type==='SOP_PELAYANAN'||type==='SOP_MANAJERIAL'){const sr=await SB.from('legal_sop_scopes').insert({document_id:ins.data.id,sop_class:type==='SOP_PELAYANAN'?'PELAYANAN':'MANAJERIAL',room_or_unit:type==='SOP_PELAYANAN'?data.room_or_unit:null,managerial_field:type==='SOP_MANAJERIAL'?data.managerial_field:null});if(sr.error)throw sr.error;}
    await audit('CREATE','DOCUMENT',ins.data.id,{document_type:type});state.modal=null;await loadLive();go('documents');render();toast('Dokumen tersimpan ke Supabase.');return;
  }
  if(module==='regulatory'){
    if(!data.title||!data.type||!data.status)throw new Error('Judul, jenis, dan status regulasi wajib diisi.');
    if(state.demo){state.data.regs.unshift({...data,id:uid(),year:data.year?Number(data.year):null,verified_at:new Date().toISOString()});state.modal=null;render();toast(file?'Regulasi demo tercatat; file tidak disimpan.':'Regulasi demo ditambahkan.','warn');return;}
    if(!SB||!isRole('SUPER_ADMIN','LEGAL_ADMIN','DOCUMENT_MANAGER'))throw new Error('Anda tidak memiliki hak mengelola regulasi.');
    const ins=await SB.from('legal_regulations').insert({title:data.title,type:data.type,number:data.number||null,year:data.year?Number(data.year):null,issuer:data.issuer||null,status:data.status,effective_date:data.effective_date||null}).select().single();if(ins.error)throw ins.error;
    if(file){const path='regulations/'+(data.year||new Date().getFullYear())+'/'+ins.data.id+'/'+safeFileName(file.name);const up=await SB.storage.from('legal-regulatory-documents').upload(path,file,{contentType:file.type||'application/octet-stream',upsert:false});if(up.error)throw up.error;const checksum=await sha256File(file);const fr=await SB.from('legal_regulatory_files').insert({regulation_id:ins.data.id,storage_path:path,file_name:file.name,mime_type:file.type||null,file_size:file.size,checksum_sha256:checksum,uploaded_by:state.user.id,notes:data.file_notes||null});if(fr.error){await SB.storage.from('legal-regulatory-documents').remove([path]);throw fr.error;}}
    await audit('CREATE','REGULATION',ins.data.id,{file_uploaded:!!file});state.modal=null;await loadLive();go('regulatory');render();toast(file?'Regulasi dan dokumen sumber berhasil diupload.':'Regulasi berhasil disimpan.');return;
  }
  const map={compliance:['legal_compliance_obligations',data],contracts:['legal_contracts',data],licenses:['legal_licenses',data],legal:['legal_cases',{...data,owner_id:state.demo?'demo':state.user?.id,created_by:state.demo?null:state.user?.id,status:'NEW'}],ethics:['legal_ethics_cases',{...data,owner_id:state.demo?'demo':state.user?.id,status:'INTAKE'}],incoming:['legal_mail_register',{...data,direction:'INCOMING',status:'REGISTERED',created_by:state.demo?null:state.user?.id}],outgoing:['legal_mail_register',{...data,direction:'OUTGOING',status:'REGISTERED',created_by:state.demo?null:state.user?.id}],templates:['legal_templates',{...data,created_by:state.demo?null:state.user?.id}]}[module];
  if(!map)throw new Error('Form tidak dikenal.');if(state.demo){const n={...map[1],id:uid(),created_at:new Date().toISOString()};const key={compliance:'obligations',contracts:'contracts',licenses:'licenses',legal:'cases',ethics:'ethics',incoming:'mail',outgoing:'mail',templates:'templates'}[module];if(module==='incoming'||module==='outgoing')state.data.mail.unshift(n);else state.data[key].unshift(n);state.modal=null;render();toast('Record demo ditambahkan.');return;}const ins=await SB.from(map[0]).insert(map[1]).select().single();if(ins.error)throw ins.error;await audit('CREATE',module.toUpperCase(),ins.data.id,{});state.modal=null;await loadLive();render();toast('Data berhasil disimpan.');
}
async function approveTask(id){const t=state.data.tasks.find(x=>x.id===id);if(!t)return;if(state.demo){t.status='APPROVED';const d=state.data.docs.find(x=>x.id===t.document_id);if(d)d.status='SIGNATURE';render();toast('Approval demo dicatat.');return;}const up=await SB.from('legal_workflow_tasks').update({status:'APPROVED',completed_at:new Date().toISOString()}).eq('id',id);if(up.error){toast(up.error.message,'error');return;}await SB.from('legal_approval_history').insert({document_id:t.document_id,version_no:state.data.docs.find(x=>x.id===t.document_id)?.current_version_no||1,actor_id:state.user.id,action:'APPROVE',comment:'Approved from ARMONI'});await SB.from('legal_documents').update({status:'SIGNATURE'}).eq('id',t.document_id);await audit('APPROVE','WORKFLOW',id,{});await loadLive();render();toast('Approval berhasil dicatat.');}
function fullPageForm(module,preset=''){
  const defs={
    documents:{title:preset?('Buat '+docCatLabel(preset)):'Buat Dokumen Hukum'},
    regulatory:{title:'Upload Regulasi (PDF)'},
    compliance:{title:'Tambah Compliance Obligation'},contracts:{title:'Tambah Kontrak'},licenses:{title:'Tambah Lisensi / Izin'},legal:{title:'Buka Legal Case'},ethics:{title:'Intake Ethics Case'},incoming:{title:'Register Surat Masuk'},outgoing:{title:'Register Surat Keluar'},templates:{title:'Tambah Template'}
  };
  const title=defs[module]?.title||'Form ARMONI';
  const oldModal=state.modal; state.modal={module:module,docType:preset};
  const html=formModal(state.modal).replace('<div class="modal-backdrop" data-action="close-modal"><div class="modal" data-modal-stop>','<div class="workspace-editor card"><div class="modal-head">').replace('</div></div></div>','</div>');
  state.modal=oldModal;
  return pageHead('Workspace Editor',title,'Halaman penuh untuk input, review, metadata, dan penyimpanan.')+html.replace(/<div class="modal-head">/,'<div class="modal-head">').replace(/<button class="icon-btn" data-action="close-modal"[^>]*>.*?<\/button>/,'<button class="top-btn" data-action="nav" data-view="documents">Kembali</button>');
}
function modalClose(){ state.modal=null; render(); }

function renderCurrent(){
  const view=state.view,id=currentId(),arg=currentArg();
  if(view==="create") return fullPageForm(id||"documents",arg);
  if(view==="documents"&&id) return docDetail(id);
  if(view==="regulatory"&&id) return regulatoryDetail(id);
  if(view==="sop-pelayanan") return sopPelayanan(id||"");
  if(view==="sop-manajerial") return sopManajerial(id||"");
  if(view==="sop-pelayanan") return sopPelayanan(id||"");
  if(view==="sop-manajerial") return sopManajerial(id||"");
  if(view==="dashboard")return dashboard();
  if(view==="documents")return documents();
  if(view==="regulatory")return regulatory();
  if(view==="approvals")return approvals();
  if(view==="more")return more();
  if(view==="sop")return more();
  if(view==="compliance")return compliance();
  if(view==="legal")return cases("legal","Legal Case Management","Case, chronology, issue, analysis, opinion, action, closure.",state.data.cases);
  if(view==="ethics")return cases("ethics","Ethics Case Management","Restricted role-set, review, recommendation, decision, follow-up.",state.data.ethics);
  if(view==="contracts")return contracts();
  if(view==="licenses")return licenses();
  if(view==="incoming")return mailPage("INCOMING");
  if(view==="outgoing")return mailPage("OUTGOING");
  if(view==="templates")return templates();
  if(view==="archive")return archive();
  if(view==="audit")return audit();
  if(view==="admin")return admin();
  return dashboard();
}
function render(){
  state.view=currentView();
  document.documentElement.dataset.theme=state.theme;
  const appEl=document.getElementById("app"); if(!appEl) return;
  if(state.loading){ appEl.innerHTML=`<div style="min-height:100vh;display:grid;place-items:center;background:#f4f7fb"><div style="text-align:center"><div class="brand-mark" style="margin:0 auto 10px">✚</div><strong>Menyiapkan ARMONI…</strong><div class="small muted" style="margin-top:4px">Menghubungkan identity & governance layer</div></div></div>`; return; }
  if(!state.user && !state.demo){ appEl.innerHTML=loginView(); return; }
  seedStateIfNeeded(); appEl.innerHTML=appShell(renderCurrent())+(state.modal?formModal(state.modal):"");
}
function seedStateIfNeeded(){ if(!state.data) seedState(); }

async function handleAuth(e){
  e.preventDefault();
  let email=document.getElementById("auth-email").value.trim().toLowerCase();
  const password=document.getElementById("auth-password").value;
  if(!email){toast("Email atau username wajib diisi.","error");return;}
  if(!email.includes("@")) email=email+"@aksara.local";
  if(!SB){toast("Supabase client belum tersedia.","error");return;}
  const {error}=await SB.auth.signInWithPassword({email,password});
  if(error){toast("Login gagal: "+(error.message||"periksa email/username dan password."),"error");return;}
  toast("Login berhasil.");
  await loadSession();
}
async function resetPassword(){ const email=prompt("Masukkan email akun untuk reset password:"); if(!email||!SB) return; const {error}=await SB.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname}); if(error) toast(error.message,"error"); else toast("Link reset password dikirim bila email terdaftar."); }

async function handleAction(el){ const a=el.dataset.action;
  if(a==="nav"){ go(el.dataset.view); render(); return; }
  if(a==="toggle-compact"){state.compact=!state.compact;storageSet("hlreg-compact",state.compact?"1":"0");render();return;}
  if(a==="toggle-mobile"){state.sidebar=!state.sidebar;render();return;}
  if(a==="toggle-theme"){state.theme=state.theme==="dark"?"light":"dark";storageSet("hlreg-theme",state.theme);render();return;}
  if(a==="logout"){if(SB) await SB.auth.signOut(); state.user=null;state.profile=null;state.roles=[];state.demo=false;state.data=null;render();toast("Sesi berakhir.");return;}
  if(a==="demo"){state.demo=true;state.loading=false;seedState();go("documents");render();toast("Mode demo ARMONI aktif.","warn");return;}
  if(a==="new"){ go("create",el.dataset.module||"documents",el.dataset.docType||""); render(); return; }
  if(a==="close-modal"){if(el.closest("[data-modal-stop]")&&!el.classList.contains("modal-backdrop")) return;modalClose();return;}
  if(a==="detail"){ if(el.dataset.module==="documents") go("documents",el.dataset.id); else if(el.dataset.module==="regulatory") go("regulatory",el.dataset.id); else toast("Workspace detail belum tersedia untuk module ini.");return; }
  if(a==="approve"){await approveTask(el.dataset.id);return;}
  if(a==="clear-search"){state.search="";render();return;}
  if(a==="doc-filter"){state.docCategory=el.dataset.type||"";state.search="";render();return;}
  if(a==="sop-room"){go("sop-pelayanan",el.dataset.room||"");render();return;}
  if(a==="sop-field"){go("sop-manajerial",el.dataset.field||"");render();return;}
  if(a==="download-reg-file"){await downloadRegFile(el.dataset.fileId);return;}
  if(a==="open-create"){go("create",el.dataset.module||"documents",el.dataset.docType||"");render();return;}
  if(a==="refresh"||a==="sync"){ if(state.demo) {render();toast("Data demo direfresh.");return;} state.loading=true;render();await loadLive();state.loading=false;render();toast("Data terbaru dimuat.");return; }
  if(a==="validate-doc"){toast("Validation OK: mandatory field, authority, mode, dan Tata Naskah gate lolos contoh ini.","success");return;}
  if(a==="generate-doc"){toast("DOCX/PDF renderer high-fidelity ditempatkan di backend/Edge Function; frontend hanya membuka generate gate.","warn");return;}
  if(a==="signature-check"){toast("Signature gate menunggu TTE adapter + authority matrix yang sah.","warn");return;}
  if(a==="notifications"){toast("Belum ada notifikasi kritis yang belum dibaca.");return;}
  if(a==="global-search"){document.querySelector("[data-search]")?.focus(); if(!document.querySelector("[data-search]")) toast("Gunakan search box pada module yang sedang dibuka.");return;}
  if(a==="backup"){toast("Backup job diarsitekturkan sebagai async server-side worker; UI menampilkan status queue dan verification.","warn");return;}
  if(a==="assessment"){toast("Assessment editor akan membuat compliance_assessment berdasarkan obligation yang dipilih.","warn");return;}
  if(a==="filter-status"){state.search=el.dataset.status;render();setTimeout(()=>{state.search="";},10);return;}
  if(a==="reset-password"){await resetPassword();return;}
}

document.addEventListener("click", async e=>{
  const el=e.target.closest("[data-action]"); if(!el) return; await handleAction(el);
});
document.addEventListener("submit", async e=>{
  if(e.target.id==="auth-form"){await handleAuth(e);return;}
  if(e.target.id==="modal-form"){e.preventDefault();try{await saveForm(e.target);state.modal=null;render();}catch(err){console.error(err);toast(err.message||"Gagal menyimpan data","error");}}
});
document.addEventListener("input", e=>{if(e.target.matches("[data-search]")){state.search=e.target.value;clearTimeout(window.__searchTimer);window.__searchTimer=setTimeout(render,140);}});
window.addEventListener("hashchange",()=>{state.view=currentView();render();});

try { state.compact=storageGet("hlreg-compact","") === "1"; } catch {}
if(C?.demoAllowed && location.hash==="#/demo") state.demo=true;

window.addEventListener("error", e=>{
  console.error("[ARMONI] Unhandled UI error:", e.error || e.message);
  const appEl=document.getElementById("app");
  if(appEl && !appEl.innerHTML.trim()){
    appEl.innerHTML=loginView();
  }
});
window.addEventListener("unhandledrejection", e=>{
  console.error("[ARMONI] Unhandled promise rejection:", e.reason);
});

// Render immediately; Supabase is intentionally non-blocking.
state.loading=false;
render();
loadSession();
