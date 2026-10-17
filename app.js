const STATUSES = ["Nouvelle", "À qualifier", "Affectée", "En cours", "En attente", "Résolue", "Clôturée"];
const COMPANIES = [
  { name: "Atlas Livraison", initials: "AL", color: "purple-logo", sector: "Transport & livraison", state: "Active" },
  { name: "NordMarket", initials: "NM", color: "blue-logo", sector: "Commerce en ligne", state: "Active" },
  { name: "Sahara Services", initials: "SS", color: "green-logo", sector: "Services aux entreprises", state: "Active" }
];
const SEED = [
 {id:"REC-2026-0018",customer:"Nadia B.",email:"nadia.demo@example.test",company:"Atlas Livraison",category:"Retard",subject:"Colis reçu en retard",description:"Démonstration : le colis fictif est arrivé après la date annoncée.",date:"2026-10-16",status:"Nouvelle",priority:"Élevée"},
 {id:"REC-2026-0017",customer:"Karim M.",email:"karim.demo@example.test",company:"NordMarket",category:"Produit endommagé",subject:"Emballage abîmé à la réception",description:"Démonstration : l'emballage de l'article fictif est endommagé.",date:"2026-10-16",status:"En cours",priority:"Normale"},
 {id:"REC-2026-0016",customer:"Sarah T.",email:"sarah.demo@example.test",company:"Atlas Livraison",category:"Livraison",subject:"Colis non livré",description:"Démonstration : le suivi indique une livraison mais le colis n'a pas été reçu.",date:"2026-10-15",status:"Affectée",priority:"Urgente"},
 {id:"REC-2026-0015",customer:"Yacine R.",email:"yacine.demo@example.test",company:"Sahara Services",category:"Service client",subject:"Demande de rappel",description:"Démonstration : demande de rappel au sujet d'un service fictif.",date:"2026-10-14",status:"En attente",priority:"Faible"},
 {id:"REC-2026-0014",customer:"Lina K.",email:"lina.demo@example.test",company:"NordMarket",category:"Facturation",subject:"Question sur une facture",description:"Démonstration : demande de clarification d'une facture fictive.",date:"2026-10-13",status:"Résolue",priority:"Normale"},
 {id:"REC-2026-0013",customer:"Amir D.",email:"amir.demo@example.test",company:"Atlas Livraison",category:"Retard",subject:"Suivi bloqué",description:"Démonstration : le suivi fictif n'a pas été mis à jour.",date:"2026-10-12",status:"À qualifier",priority:"Élevée"},
 {id:"REC-2026-0012",customer:"Meriem S.",email:"meriem.demo@example.test",company:"Sahara Services",category:"Service client",subject:"Information sur un dossier",description:"Démonstration : demande d'information sur un dossier fictif.",date:"2026-10-10",status:"Clôturée",priority:"Faible"},
 {id:"REC-2026-0011",customer:"Omar H.",email:"omar.demo@example.test",company:"NordMarket",category:"Produit endommagé",subject:"Article de démonstration abîmé",description:"Démonstration : article fictif endommagé pendant le transport.",date:"2026-10-09",status:"En cours",priority:"Urgente"}
];
const STORE_KEY = "reclapro_prototype_v1";
let complaints = loadComplaints();
let selectedComplaintId = null;
let toastTimer = null;

function loadComplaints() {
  try {
    const saved = localStorage.getItem(STORE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return SEED.map(x => ({...x}));
}
function saveComplaints() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(complaints)); }
  catch (e) { showToast("Le navigateur n'a pas pu enregistrer localement les changements."); }
}
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
}
function statusClass(status) {
  return ({"Nouvelle":"status-new","À qualifier":"status-qualify","Affectée":"status-assigned","En cours":"status-progress","En attente":"status-waiting","Résolue":"status-resolved","Clôturée":"status-closed"})[status] || "status-closed";
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
    <p class="small-note">Démo uniquement : ce changement est conservé dans le stockage local de ce navigateur, pas dans une base de données.</p>`;
  document.getElementById("detailModal").hidden = false;
  document.body.style.overflow = "hidden";
  document.getElementById("saveStatus").addEventListener("click",()=>{
    const newStatus = document.getElementById("detailStatus").value;
    const target = complaints.find(x=>x.id===selectedComplaintId);
    if(target){ target.status = newStatus; saveComplaints(); renderAll(); closeDetail(); showToast("Statut mis à jour dans cette démonstration.");}
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
document.getElementById("complaintForm").addEventListener("submit",e=>{
  e.preventDefault();
  const form = new FormData(e.currentTarget);
  const customer = String(form.get("customer")||"").trim();
  const company = String(form.get("company")||"").trim();
  const category = String(form.get("category")||"").trim();
  const subject = String(form.get("subject")||"").trim();
  const description = String(form.get("description")||"").trim();
  if(!customer||!company||!category||!subject||!description){showToast("Complète tous les champs obligatoires.");return;}
  const today = new Date();
  const date = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
  complaints.unshift({id:nextId(),customer,email:"contact.demo@example.test",company,category,subject,description,date,status:"Nouvelle",priority:String(form.get("priority")||"Normale")});
  saveComplaints(); renderAll(); closeComplaintModal(); showView("complaints"); showToast("Réclamation de démonstration créée.");
});
document.getElementById("resetData").addEventListener("click",()=>{
  if(confirm("Réinitialiser les données fictives de ce navigateur ?")){
    complaints = SEED.map(x=>({...x})); saveComplaints(); renderAll(); showToast("Données de démonstration réinitialisées.");
  }
});
renderAll();
