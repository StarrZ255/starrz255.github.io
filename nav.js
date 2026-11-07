// Barre de navigation des pages d'administration (mariés). N'apparaît que lorsque l'on est connecté.
(function () {
  var CLE = "mariage-envoi";
  var PAGES = [["Tableau de bord", "/tableau.html"], ["Envoi", "/envoi.html"], ["Plan", "/plan.html"], ["Liste", "/liste.html"], ["Cartes", "/cartes.html"],["Accueil", "/accueil.html"]];
  var nav;

  function connecte() { try { return !!JSON.parse(localStorage.getItem(CLE) || "{}").refresh; } catch (e) { return false; } }

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
    document.body.insertBefore(nav, document.body.firstChild);
  }

  function maj() {
    var on = connecte();
    nav.style.display = on ? "flex" : "none";
    document.body.style.paddingTop = on ? "52px" : "";
  }

  function demarrer() { construire(); maj(); setInterval(maj, 1200); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", demarrer); else demarrer();
})();
