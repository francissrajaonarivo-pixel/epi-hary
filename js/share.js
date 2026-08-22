const SHARE_URL = "https://francissrajaonarivo-pixel.github.io/epi-hary/";
const SHARE_TEXT = "Découvrez EPI-HARY : vos courses fraîches livrées le jour même à Mahajanga.";

const shareBtn = document.getElementById("shareBtn");
const shareModalOverlay = document.getElementById("shareModalOverlay");

function trackShare(method) {
  if (typeof gtag === "function") {
    gtag("event", "share", { method });
  }
}

if (shareBtn && shareModalOverlay) {
  const shareLinkInput = document.getElementById("shareLinkInput");
  const copyLinkBtn = document.getElementById("copyLinkBtn");
  const shareWhatsapp = document.getElementById("shareWhatsapp");
  const shareFacebook = document.getElementById("shareFacebook");
  const shareMoreBtn = document.getElementById("shareMoreBtn");
  const closeShareModal = document.getElementById("closeShareModal");

  shareWhatsapp.href = `https://wa.me/?text=${encodeURIComponent(`${SHARE_TEXT} ${SHARE_URL}`)}`;
  shareFacebook.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SHARE_URL)}`;
  shareWhatsapp.addEventListener("click", () => trackShare("whatsapp"));
  shareFacebook.addEventListener("click", () => trackShare("facebook"));

  if (navigator.share) {
    shareMoreBtn.hidden = false;
    shareMoreBtn.addEventListener("click", async () => {
      try {
        await navigator.share({ title: "EPI-HARY", text: SHARE_TEXT, url: SHARE_URL });
        trackShare("web_share_api");
      } catch (err) {
        // L'utilisateur a annulé le partage, rien à faire.
      }
    });
  }

  shareBtn.addEventListener("click", () => {
    shareModalOverlay.classList.add("open");
  });

  closeShareModal.addEventListener("click", () => {
    shareModalOverlay.classList.remove("open");
  });

  shareModalOverlay.addEventListener("click", (e) => {
    if (e.target === shareModalOverlay) shareModalOverlay.classList.remove("open");
  });

  copyLinkBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(SHARE_URL);
    } catch (err) {
      shareLinkInput.select();
      document.execCommand("copy");
    }
    trackShare("copy_link");
    const original = copyLinkBtn.textContent;
    copyLinkBtn.textContent = "Copié !";
    setTimeout(() => {
      copyLinkBtn.textContent = original;
    }, 2000);
  });
}
