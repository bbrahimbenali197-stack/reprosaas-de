const STATUSES = ["Nouvelle", "En cours", "Résolue", "Clôturée"];
let COMPANIES = [];
let complaints = [];
let selectedComplaintId = null;
let toastTimer = null;
let currentUser = null;
let currentProfile = null;
let currentCompany = null;
const DB_STATUS_TO_UI = {new:"Nouvelle", in_progress:"En cours", resolved:"Résolue", closed:"Clôturée"};
const UI_STATUS_TO_DB = {"Nouvelle":"new", "En cours":"in_progress", "Résolue":"resolved", "Clôturée":"closed"};
const DB_PRIORITY_TO_UI = {low:"Faible", normal:"Normale", high:"Élevée", urgent:"Urgente"};
const UI_PRIORITY_TO_DB = {"Faible":"low", "Normale":"normal", "Élevée":"high", "Urgente":"urgent"};
function fromDb(row) { return {id:row.id, dbId:row.id, customer:row.customer_name, email:row.customer_email||"", company:currentCompany?.name||"", category:row.category||"Autre", subject:row.subject, description:row.description||"", date:(row.created_at||"").slice(0,10), status:DB_STATUS_TO_UI[row.status]||"Nouvelle", priority:DB_PRIORITY_TO_UI[row.priority]||"Normale"}; }
async function requireSession() {
  const {data:{session},error}=await sb.auth.getSession();
  if(error||!session){location.replace("auth.html");return false;}
  currentUser=session.user;
  const {data:profile,error:profileError}=await sb.from("profiles").select("id,company_id,full_name,role").eq("id",currentUser.id).maybeSingle();
  if(profileError) throw profileError;
  if(!profile||!profile.company_id){await sb.auth.signOut();location.replace("auth.html");return false;}
  currentProfile=profile;
  const {data:company,error:companyError}=await sb.from("companies").select("id,name,slug,contact_email,phone").eq("id",profile.company_id).single();
  if(companyError) throw companyError;
  currentCompany=company; COMPANIES=[{id:company.id,name:company.name,initials:company.name.split(/\s+/).map(x=>x[0]).join("").slice(0,2).toUpperCase(),color:"purple-logo",sector:"Votre organisation",state:"Active"}];
  return true;
}
async function loadComplaints() {
  const {data,error}=await sb.from("complaints").select("id,reference_code,company_id,customer_name,customer_email,subject,description,status,priority,category,created_at,updated_at").eq("company_id",currentCompany.id).order("created_at",{ascending:false});
  if(error) throw error;
  complaints=(data||[]).map(row=>({...fromDb(row),id:row.reference_code||row.id,dbId:row.id}));
}
async function saveStatus(complaint,newStatus) {
  const dbStatus=UI_STATUS_TO_DB[newStatus];
  const {error}=await sb.from("complaints").update({status:dbStatus,updated_at:new Date().toISOString()}).eq("id",complaint.dbId).eq("company_id",currentCompany.id);
  if(error) throw error;
  const {error:historyError}=await sb.from("complaint_status_history").insert({complaint_id:complaint.dbId,company_id:currentCompany.id,changed_by:currentUser.id,new_status:dbStatus});
  if(historyError) console.warn("Historique non enregistré:",historyError.message);
  await loadComplaints();
}
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
}
function statusClass(status) {
  return ({"Nouvelle":"status-new","En cours":"status-progress","Résolue":"status-resolved","Clôturée":"status-closed"})[status] || "status-closed";
}
function priorityClass(priority) {
  return ({"Urgente":"priority-urgent","Élevée":"priority-high","Normale":"priority-normal","Faible":"priority-low"})[priority] || "priority-normal";
}
function formatDate(date) {
  if (!date) return "—";
  const parts = date.split("-");
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : date;
}
function statusBadge(status) { return `<span class="status-badge ${statusClass(status)}">${escapeHtml(status)}</span>`; }
function priorityBadge(priority) { return `<span class="priority-badge ${priorityClass(priority)}">${escapeHtml(priority)}</span>`; }
function shortRef(id) { return `<span class="reference" data-open="${escapeHtml(id)}">${escapeHtml(id)}</span>`; }

function renderAll() {
  renderStats(); renderRecent(); renderComplaints(); renderCompanies(); renderFilters(); renderDistribution();
  document.getElementById("navCount").textContent = complaints.length;
}
function renderStats() {
  document.getElementById("statTotal").textContent = complaints.length;
  document.getElementById("statOpen").textContent = complaints.filter(c => !["Résolue","Clôturée"].includes(c.status)).length;
  document.getElementById("statProgress").textContent = complaints.filter(c => ["Affectée","En cours"].includes(c.status)).length;
  document.getElementById("statDone").textContent = complaints.filter(c => ["Résolue","Clôturée"].includes(c.status)).length;
  document.getElementById("companyTotal").textContent = COMPANIES.length;
}
function renderRecent() {
  const rows = [...complaints].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);
  document.getElementById("recentRows").innerHTML = rows.map(c => `<tr><td>${shortRef(c.id)}</td><td><div class="client-cell"><strong>${escapeHtml(c.customer)}</strong><small>${escapeHtml(c.category)}</small></div></td><td class="company-cell">${escapeHtml(c.company)}</td><td>${statusBadge(c.status)}</td><td>${priorityBadge(c.priority)}</td></tr>`).join("") || `<tr><td colspan="5">Aucune réclamation.</td></tr>`;
}
function renderComplaints() {
  const query = (document.getElementById("searchInput")?.value || "").trim().toLowerCase();
  const status = document.getElementById("statusFilter")?.value || "";
  const company = document.getElementById("companyFilter")?.value || "";
  const priority = document.getElementById("priorityFilter")?.value || "";
  const filtered = [...complaints].filter(c => {
    const text = [c.id,c.customer,c.email,c.company,c.category,c.subject].join(" ").toLowerCase();
    return (!query || text.includes(query)) && (!status || c.status === status) && (!company || c.company === company) && (!priority || c.priority === priority);
  }).sort((a,b)=>b.date.localeCompare(a.date));
  const tbody = document.getElementById("complaintRows");
  tbody.innerHTML = filtered.map(c => `<tr><td>${shortRef(c.id)}</td><td><div class="client-cell"><strong>${escapeHtml(c.customer)}</strong><small>${escapeHtml(c.email)}</small></div></td><td class="company-cell">${escapeHtml(c.company)}</td><td>${escapeHtml(c.category)}</td><td>${formatDate(c.date)}</td><td>${statusBadge(c.status)}</td><td>${priorityBadge(c.priority)}</td><td><button class="secondary-button row-action" data-open="${escapeHtml(c.id)}" style="padding:6px 9px;font-size:10px">Ouvrir</button></td></tr>`).join("") || `<tr><td colspan="8" style="padding:28px;text-align:center;color:#929bab">Aucun résultat pour ces filtres.</td></tr>`;
  document.getElementById("resultsCount").textContent = `${filtered.length} réclamation${filtered.length!==1?"s":""}`;
}
function renderDistribution() {
  const colors = {"Nouvelle":"#dfa044","À qualifier":"#8177e6","Affectée":"#5d96e4","En cours":"#5d96e4","En attente":"#d68a42","Résolue":"#35b38a","Clôturée":"#a3aab5"};
  const counts = STATUSES.map(status => ({status,count:complaints.filter(c=>c.status===status).length})).filter(x=>x.count);
  const max = Math.max(1,...counts.map(x=>x.count));
  document.getElementById("statusDistribution").innerHTML = counts.map(x=>`<div class="distribution-item"><div class="distribution-label"><i style="background:${colors[x.status]}"></i>${escapeHtml(x.status)}</div><strong class="distribution-value">${x.count}</strong><div class="bar-track"><div class="bar-fill" style="width:${(x.count/max)*100}%;background:${colors[x.status]}"></div></div></div>`).join("");
}
function renderFilters() {
  const statusEl = document.getElementById("statusFilter");
  if (statusEl && statusEl.options.length === 1) STATUSES.forEach(s => statusEl.add(new Option(s,s)));
  const companyFilter = document.getElementById("companyFilter");
  const newCompany = document.getElementById("newCompanySelect");
  if (companyFilter) {
    const current = companyFilter.value;
    companyFilter.innerHTML = `<option value="">Toutes les entreprises</option>` + COMPANIES.map(c=>`<option>${escapeHtml(c.name)}</option>`).join("");
    companyFilter.value = current;
  }
  if (newCompany) newCompany.innerHTML = `<option value="">Sélectionner</option>` + COMPANIES.map(c=>`<option>${escapeHtml(c.name)}</option>`).join("");
}
function renderCompanies() {
  const counts = name => complaints.filter(c=>c.company===name).length;
  document.getElementById("companyGrid").innerHTML = COMPANIES.map(c=>`<article class="company-card"><div class="company-top"><div class="company-logo ${c.color}">${c.initials}</div><span class="company-state">${c.state}</span></div><h3>${escapeHtml(c.name)}</h3><p>${escapeHtml(c.sector)}</p><div class="company-metrics"><div>Réclamations<strong>${counts(c.name)}</strong></div><div>Statut<strong style="font-size:12px;color:#18866b">Active</strong></div></div></article>`).join("");
}
function showView(view) {
  document.querySelectorAll(".view").forEach(el=>el.classList.toggle("active",el.id===`view-${view}`));
  document.querySelectorAll(".nav-item[data-view]").forEach(el=>el.classList.toggle("active",el.dataset.view===view));
  const labels = {dashboard:"Tableau de bord",complaints:"Réclamations",companies:"Entreprises",public:"Portail public",settings:"Paramètres"};
  document.getElementById("breadcrumbTitle").textContent = labels[view] || "Plateforme";
  document.getElementById("sidebar").classList.remove("open");
  if(view==="complaints") renderComplaints();
  window.scrollTo({top:0,behavior:"smooth"});
}
function openComplaintModal() {
  document.getElementById("complaintForm").reset();
  renderFilters();
  document.getElementById("complaintModal").hidden = false;
  document.body.style.overflow = "hidden";
  document.querySelector('#complaintForm [name="customer"]').focus();
}
function closeComplaintModal() {
  document.getElementById("complaintModal").hidden = true;
  document.body.style.overflow = "";
}
function openDetail(id) {
  const c = complaints.find(x=>x.id===id);
  if(!c) return;
  selectedComplaintId = id;
  document.getElementById("detailRef").textContent = c.id;
  document.getElementById("detailTitle").textContent = c.subject;
  document.getElementById("detailBody").innerHTML = `
    <div class="detail-meta">
      <div class="detail-field"><span>CLIENT</span><strong>${escapeHtml(c.customer)}</strong></div>
      <div class="detail-field"><span>ENTREPRISE</span><strong>${escapeHtml(c.company)}</strong></div>
      <div class="detail-field"><span>CATÉGORIE</span><strong>${escapeHtml(c.category)}</strong></div>
      <div class="detail-field"><span>DATE DE CRÉATION</span><strong>${formatDate(c.date)}</strong></div>
      <div class="detail-field"><span>STATUT ACTUEL</span><strong>${statusBadge(c.status)}</strong></div>
      <div class="detail-field"><span>PRIORITÉ</span><strong>${priorityBadge(c.priority)}</strong></div>
    </div>
    <div class="detail-description"><h3>Description</h3><p>${escapeHtml(c.description)}</p></div>
    <div class="detail-actions"><label>Modifier le statut <select id="detailStatus">${STATUSES.map(s=>`<option ${s===c.status?"selected":""}>${s}</option>`).join("")}</select></label><button class="primary-button" id="saveStatus">Enregistrer le statut</button></div>
    <p class="small-note">Le changement est enregistré dans la base de données de votre entreprise.</p>`;
  document.getElementById("detailModal").hidden = false;
  document.body.style.overflow = "hidden";
  document.getElementById("saveStatus").addEventListener("click",async()=>{
    const newStatus = document.getElementById("detailStatus").value;
    const target = complaints.find(x=>x.id===selectedComplaintId);
    if(!target)return;
    try { await saveStatus(target,newStatus); renderAll(); closeDetail(); showToast("Statut enregistré dans Supabase."); }
    catch(err){showToast("Échec de l’enregistrement : "+err.message);}
  });
}
function closeDetail() {
  document.getElementById("detailModal").hidden = true;
  document.body.style.overflow = "";
  selectedComplaintId = null;
}
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message; toast.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(()=>toast.classList.remove("show"),3000);
}
function nextId() {
  const nums = complaints.map(c=>Number((c.id.match(/(\d+)$/)||[])[1]||0));
  return `REC-2026-${String(Math.max(18,...nums)+1).padStart(4,"0")}`;
}

document.querySelectorAll(".nav-item[data-view]").forEach(btn=>btn.addEventListener("click",()=>showView(btn.dataset.view)));
document.querySelectorAll("[data-goto]").forEach(btn=>btn.addEventListener("click",()=>showView(btn.dataset.goto)));
document.getElementById("newComplaintTop").addEventListener("click",openComplaintModal);
document.getElementById("newComplaintList").addEventListener("click",openComplaintModal);
document.getElementById("publicSubmitButton").addEventListener("click",openComplaintModal);
document.getElementById("addCompanyButton").addEventListener("click",()=>showToast("L'ajout d'entreprises sera connecté à la base de données dans une prochaine version."));
document.getElementById("helpButton").addEventListener("click",()=>showToast("Prototype de démonstration : aucune donnée réelle ne doit être saisie."));
document.getElementById("dismissNotice").addEventListener("click",()=>document.getElementById("dismissNotice").closest(".notice").remove());
document.getElementById("mobileMenu").addEventListener("click",()=>document.getElementById("sidebar").classList.toggle("open"));
["searchInput","statusFilter","companyFilter","priorityFilter"].forEach(id=>document.getElementById(id).addEventListener(id==="searchInput"?"input":"change",renderComplaints));
document.querySelectorAll("[data-close-modal]").forEach(btn=>btn.addEventListener("click",closeComplaintModal));
document.querySelectorAll("[data-close-detail]").forEach(btn=>btn.addEventListener("click",closeDetail));
document.getElementById("complaintModal").addEventListener("click",e=>{if(e.target.id==="complaintModal")closeComplaintModal();});
document.getElementById("detailModal").addEventListener("click",e=>{if(e.target.id==="detailModal")closeDetail();});
document.addEventListener("click",e=>{const el=e.target.closest("[data-open]");if(el)openDetail(el.dataset.open);});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeComplaintModal();closeDetail();}});
document.getElementById("complaintForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const submit=e.currentTarget.querySelector('[type="submit"]');submit.disabled=true;
  const form = new FormData(e.currentTarget);
  const customer = String(form.get("customer")||"").trim();
  const category = String(form.get("category")||"").trim();
  const subject = String(form.get("subject")||"").trim();
  const description = String(form.get("description")||"").trim();
  if(!customer||!category||!subject||!description){showToast("Complète tous les champs obligatoires.");submit.disabled=false;return;}
  try {
    const {error}=await sb.from("complaints").insert({company_id:currentCompany.id,customer_name:customer,customer_email:null,category,subject,description,status:"new",priority:UI_PRIORITY_TO_DB[String(form.get("priority")||"Normale")]||"normal"});
    if(error) throw error;
    await loadComplaints();renderAll();closeComplaintModal();showView("complaints");showToast("Réclamation enregistrée dans Supabase.");
  } catch(err) { showToast("Échec de création : "+err.message); }
  finally {submit.disabled=false;}
});
const resetButton=document.getElementById("resetData");if(resetButton){resetButton.disabled=true;resetButton.title="Indisponible avec les données réelles.";resetButton.addEventListener("click",()=>showToast("La réinitialisation des données a été désactivée."));}
const logoutButton=document.getElementById("logoutButton");if(logoutButton)logoutButton.addEventListener("click",async()=>{await sb.auth.signOut();location.replace("auth.html");});
(async()=>{
  try { const ok=await requireSession();if(!ok)return; await loadComplaints(); renderAll();
    const profileName=currentProfile.full_name||currentUser.email||"Utilisateur";
    const nameEl=document.querySelector(".profile-text strong");if(nameEl)nameEl.textContent=profileName;
    const roleEl=document.querySelector(".profile-text small");if(roleEl)roleEl.textContent=currentCompany.name;
    const avatar=document.querySelector(".avatar");if(avatar)avatar.textContent=profileName.split(/\s+/).map(x=>x[0]).join("").slice(0,2).toUpperCase();
    const notice=document.querySelector(".notice");if(notice)notice.style.display="";
  } catch(err) { console.error(err); document.body.innerHTML='<main style="font-family:Arial,sans-serif;max-width:680px;margin:12vh auto;padding:24px"><h1>Connexion à Supabase impossible</h1><p id="err"></p><p>Vérifiez les paramètres Supabase, les politiques RLS et la confirmation de votre compte.</p><a href="auth.html">Retour à la connexion</a></main>';document.getElementById("err").textContent=err.message||String(err); }
})();
