// Barre de navigation des pages d'administration (mariés). N'apparaît que lorsque l'on est connecté.
// Elle porte aussi « + Invité » (créer un invité depuis n'importe quelle page) et l'outil de suppression.
// Chaque page d'administration expose window.MARIAGE_API (sa fonction d'appel à la base, déjà connectée).
(function () {
  var CLE = "mariage-envoi";
  var PAGES = [["Tableau de bord", "/tableau.html"], ["Envoi", "/envoi.html"], ["Plan", "/plan.html"], ["Liste", "/liste.html"], ["Cartes", "/cartes.html"],["Accueil", "/accueil.html"]];
  var nav, ajout;

  function connecte() { try { return !!JSON.parse(localStorage.getItem(CLE) || "{}").refresh; } catch (e) { return false; } }
  function api() { return window.MARIAGE_API; }
  function prevenir() { try { window.dispatchEvent(new Event("invites-modifies")); } catch (e) {} }
  function baseUrl() { var C = window.MARIAGE || {}; return (C.siteUrl || location.origin).replace(/\/$/, ""); }

  function normaliserTel(b) {
    var s = (b || "").replace(/[\s.\-()]/g, "");
    if (s.indexOf("00") === 0) s = "+" + s.slice(2);
    if (/^\+\d{8,15}$/.test(s)) return s;
    if (/^\d{10}$/.test(s)) return "+225" + s;
    return null;
  }

  // ---------- fenêtre « Ajouter un invité » ----------
  function style() {
    if (document.getElementById("mi-style")) return;
    var s = document.createElement("style"); s.id = "mi-style";
    s.textContent =
      "#mi-dlg{width:min(480px,calc(100% - 24px));max-height:calc(100% - 24px);overflow:auto;padding:20px 18px;border:1px solid rgba(180,208,238,.3);border-radius:12px;background:#0f2340;color:#f4efe6;font:16px/1.4 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif}" +
      "#mi-dlg::backdrop{background:rgba(0,0,0,.6)}" +
      "#mi-dlg h2{margin:0 0 12px;font-size:20px}#mi-dlg label{display:block;margin:10px 0 0;color:#a9bdd8;font-size:14px}" +
      "#mi-dlg input[type=text],#mi-dlg input[type=tel],#mi-dlg input[type=number],#mi-dlg select{display:block;width:100%;min-height:44px;margin-top:4px;font:inherit;color:#f4efe6;background:#0a1a30;border:1px solid rgba(180,208,238,.3);border-radius:8px;padding:6px 10px;box-sizing:border-box}" +
      "#mi-dlg .case{display:flex;align-items:center;gap:10px;min-height:44px;color:#f4efe6;font-size:15px}#mi-dlg .case input{width:20px;height:20px}" +
      "#mi-dlg .pied{display:flex;gap:10px;justify-content:flex-end;margin-top:16px}" +
      "#mi-dlg button{min-height:44px;padding:0 16px;font:inherit;font-weight:600;color:#f4efe6;background:transparent;border:1px solid rgba(180,208,238,.4);border-radius:8px;cursor:pointer}" +
      "#mi-dlg button.principal{background:#c9a227;border-color:#c9a227;color:#0a1a30}" +
      "#mi-dlg .err{color:#ff9d8f;margin:10px 0 0}#mi-dlg .ok{margin:6px 0;word-break:break-all}#mi-dlg .ok strong{color:#c9a227}";
    document.head.appendChild(s);
  }

  function ajouter() {
    if (!api()) return;
    style();
    var old = document.getElementById("mi-dlg"); if (old) old.remove();
    var d = document.createElement("dialog"); d.id = "mi-dlg";
    var f = document.createElement("form"); f.method = "dialog";
    function h(tag, txt, cls) { var e = document.createElement(tag); if (txt) e.textContent = txt; if (cls) e.className = cls; return e; }
    function champ(label, type, val, extra) {
      var l = h("label", label); var i = document.createElement("input"); i.type = type; i.value = val == null ? "" : val; i.autocomplete = "off";
      if (extra) for (var k in extra) i[k] = extra[k];
      l.appendChild(i); f.appendChild(l); return i;
    }
    function choix(label, opts, val) {
      var l = h("label", label); var s = document.createElement("select");
      opts.forEach(function (o) { var op = document.createElement("option"); op.value = o[0]; op.textContent = o[1]; if (o[0] === val) op.selected = true; s.appendChild(op); });
      l.appendChild(s); f.appendChild(l); return s;
    }
    function caseA(label, val) { var l = h("label", null, "case"); var i = document.createElement("input"); i.type = "checkbox"; i.checked = !!val; l.appendChild(i); l.appendChild(document.createTextNode(label)); f.appendChild(l); return i; }

    f.appendChild(h("h2", "Ajouter un invité"));
    var nom = champ("Nom complet", "text", "", { required: true });
    var pl = champ("Nombre de personnes (1 = seul, 2 = couple…)", "number", 1, { min: 1, max: 10, required: true, inputMode: "numeric" });
    var cote = choix("Invité par", [["marie", "Le marié"], ["mariee", "La mariée"]], "mariee");
    var cat = choix("Catégorie", [["famille", "Famille"], ["eglise", "Église"], ["travail", "Travail"], ["amis", "Amis"], ["", "Autre"]], "famille");
    var seg = choix("Invité à", [["jour_j", "Le mariage seulement"], ["tous", "La dot et le mariage"], ["dot", "La dot seulement"]], "jour_j");
    var dotZone = h("div"); f.appendChild(dotZone);
    var dc = caseA("Dot : cérémonie du matin", true), dr = caseA("Dot : repas", true);
    dotZone.appendChild(dc.parentNode); dotZone.appendChild(dr.parentNode);
    function majDot() { dotZone.hidden = seg.value === "jour_j"; }
    seg.addEventListener("change", majDot); majDot();
    var tel = champ("Numéro WhatsApp de l'invité (facultatif)", "tel", "", { inputMode: "tel" });
    var exp = champ("Numéro qui envoie l'invitation (vide = automatique)", "tel", "", { inputMode: "tel", placeholder: "Automatique selon le côté et la catégorie" });
    var carte = caseA("Ajouter aux cartes physiques (génère aussi son code QR)", false);
    var err = h("p", "", "err"); err.hidden = true; f.appendChild(err);
    var pied = h("div", null, "pied");
    var ann = h("button", "Annuler"); ann.type = "button"; ann.addEventListener("click", function () { d.close(); });
    var ok = h("button", "Ajouter", "principal"); ok.type = "submit";
    pied.appendChild(ann); pied.appendChild(ok); f.appendChild(pied);

    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var n = null, x = null;
      if (tel.value.trim()) { n = normaliserTel(tel.value); if (!n) { err.textContent = "Numéro de l'invité non reconnu : 10 chiffres, ou +indicatif et numéro."; err.hidden = false; return; } }
      if (exp.value.trim()) { x = normaliserTel(exp.value); if (!x) { err.textContent = "Numéro d'envoi non reconnu : 10 chiffres, ou +indicatif et numéro."; err.hidden = false; return; } }
      if (seg.value !== "jour_j" && !dc.checked && !dr.checked) { err.textContent = "Cochez la cérémonie, le repas, ou les deux."; err.hidden = false; return; }
      err.hidden = true; ok.disabled = true;
      api()("/rest/v1/rpc/creer_invite", { method: "POST", body: {
        p_prenom: nom.value.trim(), p_cote: cote.value, p_segment: seg.value, p_places: Math.min(10, Math.max(1, +pl.value || 1)),
        p_categorie: cat.value || null, p_telephone: n, p_expediteur: x, p_dot_ceremonie: dc.checked, p_dot_repas: dr.checked, p_carte: carte.checked
      } }).then(function (g) {
        prevenir();
        f.innerHTML = "";
        f.appendChild(h("h2", "Invité ajouté"));
        var p1 = h("p", "", "ok"); p1.appendChild(document.createTextNode(g.prenom + (g.reference ? " · " : ""))); if (g.reference) p1.appendChild(h("strong", g.reference)); f.appendChild(p1);
        if (g.carte) f.appendChild(h("p", "Ajouté aux cartes physiques : son code QR est dans l'onglet Cartes.", "ok"));
        f.appendChild(h("p", "Lien d'invitation : " + baseUrl() + "/i/" + g.token, "ok"));
        var pd = h("div", null, "pied");
        var autre = h("button", "Ajouter un autre"); autre.type = "button"; autre.addEventListener("click", function () { ajouter(); });
        var fin = h("button", "Fermer", "principal"); fin.type = "button"; fin.addEventListener("click", function () { d.close(); });
        pd.appendChild(autre); pd.appendChild(fin); f.appendChild(pd);
      }, function () { ok.disabled = false; err.textContent = "Ajout impossible. Vérifiez la connexion."; err.hidden = false; });
    });
    d.appendChild(f); document.body.appendChild(d); d.showModal(); nom.focus();
    var debut = false;
    d.addEventListener("pointerdown", function (e) { debut = e.target === d; });
    d.addEventListener("click", function (e) { if (e.target === d && debut) d.close(); });
  }

  // Suppression définitive (invitation et personnes détaillées qui en dépendent)
  function supprimer(id, nom, apres) {
    if (!api()) return;
    if (!confirm("Supprimer " + nom + " définitivement ?\nSon lien d'invitation et son QR cesseront de fonctionner. Cette action est irréversible.")) return;
    api()("/rest/v1/rpc/supprimer_invite", { method: "POST", body: { p_id: id } }).then(function () {
      prevenir(); if (apres) apres();
    }, function () { alert("Suppression impossible. Vérifiez la connexion."); });
  }

  window.MARIAGE_INVITES = { ajouter: ajouter, supprimer: supprimer };

  function construire() {
    nav = document.createElement("nav");
    nav.setAttribute("aria-label", "Pages d'administration");
    nav.style.cssText = "position:fixed;top:0;left:0;right:0;z-index:50;display:none;gap:4px;padding:0 10px;overflow-x:auto;background:#0a1a30;border-bottom:1px solid rgba(180,208,238,.22);font:600 15px system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;-webkit-overflow-scrolling:touch";
    PAGES.forEach(function (p) {
      var a = document.createElement("a");
      a.href = p[1]; a.textContent = p[0];
      var ici = location.pathname === p[1];
      a.style.cssText = "flex:none;display:flex;align-items:center;min-height:48px;padding:0 14px;text-decoration:none;white-space:nowrap;color:" + (ici ? "#f4efe6" : "#a9bdd8") + ";border-bottom:3px solid " + (ici ? "#c9a227" : "transparent");
      if (ici) a.setAttribute("aria-current", "page");
      nav.appendChild(a);
    });
    ajout = document.createElement("button");
    ajout.type = "button"; ajout.textContent = "+ Invité"; ajout.setAttribute("aria-label", "Ajouter un invité");
    ajout.style.cssText = "flex:none;margin:6px 0 6px auto;min-height:36px;padding:0 14px;font:inherit;color:#0a1a30;background:#c9a227;border:0;border-radius:8px;cursor:pointer;white-space:nowrap;display:none";
    ajout.addEventListener("click", ajouter);
    nav.appendChild(ajout);
    document.body.insertBefore(nav, document.body.firstChild);
  }

  function maj() {
    var on = connecte();
    nav.style.display = on ? "flex" : "none";
    ajout.style.display = on && api() ? "block" : "none";
    document.body.style.paddingTop = on ? "52px" : "";
  }

  function demarrer() { construire(); maj(); setInterval(maj, 1200); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", demarrer); else demarrer();
})();
