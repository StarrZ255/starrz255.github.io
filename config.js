// Clé publique (publishable) : faite pour être visible côté navigateur. Aucun secret ici.
// Ce fichier est public : il ne contient volontairement ni date, ni lieu, ni programme.
// Le contenu de chaque invitation vient de la base, via le lien personnel.
window.MARIAGE = {
  supabaseUrl: "https://xxkluzumjevtbhrlrmyy.supabase.co",
  supabaseKey: "sb_publishable_6RGaowxl2jPq89DToDeeRA_qW3cJrPO",

  couple: "Marie-Christelle & René",
  devise: "Dieu est fidèle",

  // Adresse du site, utilisée dans les liens envoyés. Vide = adresse de la page ouverte.
  siteUrl: "https://starrz255.github.io",

  // Adresse de l'envoi du code QR par e-mail (Worker Cloudflare), ex. "https://mon-domaine.com/api/qr".
  // Vide = pas d'e-mail : le champ n'est pas affiché sur la page d'invitation.
  mailUrl: "",

  // Vide = la ligne n'est pas affichée. À remplir quand la date limite est fixée.
  reponseAvant: ""
};

(function () {
  var C = window.MARIAGE;

  // Écran simple remplaçant la page (site fermé, ou connexion impossible)
  function ecran(titre, texte, bouton) {
    var b = document.body;
    b.innerHTML = "";
    var m = document.createElement("main");
    m.style.cssText = "max-width:460px;margin:0 auto;padding:18vh 24px;text-align:center;font:18px/1.5 Georgia,serif";
    var h = document.createElement("h1");
    h.textContent = titre; h.style.cssText = "font-weight:600;font-size:28px;margin:0 0 12px";
    var p = document.createElement("p");
    p.textContent = texte; p.style.cssText = "margin:0 0 22px;opacity:.8";
    m.appendChild(h); m.appendChild(p);
    if (bouton) {
      var x = document.createElement("button");
      x.type = "button"; x.textContent = bouton; x.style.cssText = "font:inherit;padding:10px 22px;border-radius:8px;border:1px solid currentColor;background:transparent;color:inherit;cursor:pointer";
      x.addEventListener("click", function () { location.reload(); });
      m.appendChild(x);
    }
    b.appendChild(m);
    b.style.display = "block";
  }

  // Pas de réseau ou serveur injoignable : on garde la connexion, on propose de réessayer (jamais de déconnexion)
  window.MARIAGE_HORS_LIGNE = function () { ecran("Connexion impossible", "Vérifiez la connexion internet de votre téléphone, puis réessayez. Vous restez connecté.", "Réessayer"); };

  // Après la date de fermeture fixée dans la base, toutes les pages se ferment
  function verifier() {
    fetch(C.supabaseUrl + "/rest/v1/rpc/site_statut", {
      method: "POST",
      headers: { "apikey": C.supabaseKey, "Authorization": "Bearer " + C.supabaseKey, "Content-Type": "application/json" },
      body: "{}"
    }).then(function (r) { return r.ok ? r.json() : true; })
      .then(function (ouvert) { if (ouvert === false) ecran("Merci", "Ce site est fermé. Merci d'avoir partagé ces journées avec nous."); })
      .catch(function () {});
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", verifier); else verifier();
})();
