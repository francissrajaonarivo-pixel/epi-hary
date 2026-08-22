const shareBtn = document.getElementById("shareBtn");

if (shareBtn) {
  shareBtn.addEventListener("click", async () => {
    const shareData = {
      title: "EPI-HARY — Épicerie en ligne",
      text: "Découvrez EPI-HARY : vos courses fraîches livrées le jour même à Mahajanga.",
      url: "https://francissrajaonarivo-pixel.github.io/epi-hary/",
    };

    if (typeof gtag === "function") {
      gtag("event", "share", { method: navigator.share ? "web_share_api" : "fallback" });
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // L'utilisateur a annulé le partage, rien à faire.
      }
      return;
    }

    const text = `${shareData.text} ${shareData.url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  });
}
