// Route media through the local server so redirects, CORS and byte-range
// requests behave consistently across desktop and mobile browsers.
const DRIVE = "/api/media/";
const raw = [
  ["1reQCapHuk6snmGuh-UsLL1zawSAX7qsK", "01. Elegie.flac"],
  ["1g4cuEub4D2YI6Sx7Yiy40klszOrQqW4r", "02. IDK.flac"],
  ["1CfH578Cc-HVM_-sZ1vkhH6C5mR1FidsM", "03. Wtf Bby I'm Lit.flac"],
  ["1F2wZ7Pr6Tnbs-3l2RsygMtlG7gCI4-sm", "04. Anh Không Muốn Nó Dễ Dàng.flac"],
  ["1tEMh5fFgtNSVYF6mlCBtqwe9ERMJ9HJ2", "05. Baby (feat. marzuz).flac"],
  ["1p_F8wIPd8zC6U1SN3sEEIZUN6sESazzD", "06. Yêu Anh Giết Anh.flac"],
  [
    "1U4THD6Nit0L83HUJeI4o33yOpKgZk6nl",
    "07. Mắt Môi Tay Chân (feat. Tage).flac",
  ],
  ["1XQzIIkteRgxOVi0MIC57iONtDJAASRFY", "08. Đao Của Anh Vừa.flac"],
  ["1Kuuq4zcDOM3dOw9bRpca-xuz2YPkF6tf", "09. Là Gì Của Nhau.flac"],
  ["1iewpqjjkV-MCw3lAMqfsjITadOFU0Fai", "10. Night In Prague.flac"],
  ["1B8ovUnhGjGn2oWQdmDyJW15xGvTi8AYF", "11. Một Cái Ôm.flac"],
  ["1lwJ77xEBz3sW2_Q_pl2v7Y0plBLHXVZR", "12. Liệm.flac"],
  [
    "1reMXW2DQ2L7cBDBv8l4uLoZH4muvLFcH",
    "13. Nếu Như Ta Chẳng Còn (feat. AAP Ướt Mi).flac",
  ],
  ["1HgFc6Iq9s5ItZN17AvjxwcVBmeOo50Vx", "14. Ai Mới Là Kẻ Xấu Xa.flac"],
  ["1LRE3CvLiF1gxikWwhbHGNxR3rwPBul8C", "15. Slippery (feat. Tùng Dương).flac"],
  ["1cWjcrQcRnX_BOykhrbiLiRiKHshqh5oE", "16. Intenpol.flac"],
  ["10Sn7Vh5Hgf22DO-mqfkWxNZggFvDHcZl", "17. Tây Thi.flac"],
  ["1YA8-K4yZNIUBCWIxob42PHNJLB8S_7ll", "18. Hút và Hút.flac"],
  ["1oDLEyuU1VzSiOpIYvW0ZN8C6HEOYrUF7", "19. Dưa Chua.flac"],
  ["1D-cedj0JdydUk_PZUOhQMwF3kJoyoO_V", "20. Xa Xôi (feat. Obito).flac"],
  ["1XYcz8yfRsocHezKnxNN5ZyBrAaR6iJ5J", "21. Che Phủ.flac"],
  ["1_EwdyYj0zzQ1GET39WDdSzUe7SHLkCUt", "22. Oanh M = Thuoc.flac"],
  ["17qz4-zYF5Nua3Z1-7fnoz0x0n2ot5_Eo", "23. Ghet Xog Lai Thik.flac"],
  ["1wLfTMctsfkLvBqsTt2Vobpwo4PglqY5N", "24. Nhìn Kẻ Thù Của Tao.flac"],
  ["1YUJsyNer2Tp840LxryYfkr_ze_-KolQ2", "25. Envy (feat. THANHDRAW).flac"],
  ["1_Wk2qmDPZEiMzI-J2g3ooT6tgfeJmZCj", "26. Cảm Ơn.flac"],
  ["12l3zXy3uIQIMrkCYm_3RaWNdKtaHnEw7", "27. Không Cần Lo Cho Tao.flac"],
  [
    "1Lye7RRsmEaw6sG4stOTf5okjIuc_s-kY",
    "28. Huh (feat. RPT Orijinn & THANHDRAW).flac",
  ],
  ["1_kZXWCfGs93M2hb0hL3b-JKxb0yXTEy4", "29. Nguyễn Văn Mười.flac"],
  ["1yMjUyzfcbMWrExKlPkWSjQITrrIlqGhe", "30. Thịt Lợn.flac"],
  ["1xok_TDmBCsbisujQ8klAvHA3kDA3WpgU", "IDK.mp4"],
  ["1zJOPsHCIdgdnqg9yKn4eMK12XwruRXbc", "MẮT MÔI TAY CHÂN.mp4"],
  ["1qfYDLZTITE1MZ4KTHvxvuFT_5Sf_9JxT", "SLIPPERY.mp4"],
  ["1jsK7PkASKSDmkpuUJcrZ_SCmgQfYQLw9", "OANH MÀY = THUỐC.mp4"],
  ["1dAEU4VGt05hqPhR5eRS-3VZfO0_zM3vT", "XA XÔI.mp4"],
  ["15B29zvDUrzvvqEgmPuT9kErV3n4_KRXY", "NHÌN KẺ THÙ CỦA TAO.mp4"],
];
const media = raw.map(([id, file], i) => ({
  id,
  file,
  type: file.endsWith(".mp4") ? "video" : "audio",
  title: file.replace(/^\d+\.\s*/, "").replace(/\.(flac|mp4)$/i, ""),
  url: DRIVE + id,
  no: String(i + 1).padStart(2, "0"),
}));
const $ = (s) => document.querySelector(s),
  $$ = (s) => [...document.querySelectorAll(s)];
const audio = $("#audio"),
  video = $("#video"),
  grid = $("#mediaGrid");
const playSvg = '<svg class="control-icon play-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7V5Z" /></svg>';
const pauseSvg = '<svg class="control-icon pause-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zM14 5h4v14h-4z" /></svg>';
let current = null,
  view = "all",
  shuffle = false,
  repeat = false;
let favorites = new Set(
  JSON.parse(localStorage.getItem("mck-favorites") || "[]"),
);
const clean = (s) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
function render() {
  const q = clean($("#search").value);
  const items = media.filter(
    (m) =>
      (view === "all" ||
        m.type === view ||
        (view === "favorite" && favorites.has(m.id))) &&
      clean(m.title).includes(q),
  );
  grid.innerHTML = items
    .map(
      (m, i) =>
        `<article class="card ${m.type}-card ${current?.id === m.id ? "active" : ""}" data-id="${m.id}"><div class="cover" data-no="${m.no}" style="--tone:${["#57261d", "#1d3c3b", "#34301a", "#3f1e37", "#253118"][i % 5]}"><button class="heart ${favorites.has(m.id) ? "on" : ""}" data-fav="${m.id}" aria-label="Yêu thích">${favorites.has(m.id) ? "♥" : "♡"}</button><span class="format">${m.type === "audio" ? "FLAC · LOSSLESS" : "MP4 · VIDEO"}</span><button class="card-play" aria-label="Phát">▶</button></div><h3>${m.title}</h3><p>MCK · ${m.type === "audio" ? "Lossless Audio" : "Official Visual"}</p></article>`,
    )
    .join("");
  $("#empty").hidden = items.length > 0;
}
function playItem(m) {
  if (!m) return;
  if (m.type === "video") {
    audio.pause();
    openVideo(m);
    return;
  }
  current = m;
  audio.src = m.url;
  audio.play().catch(() => toast("Trình duyệt không thể phát file này."));
  updateNow();
  render();
}
function updateNow() {
  if (!current) return;
  $("#nowTitle").textContent = current.title;
  $("#nowMeta").textContent = "MCK · FLAC Lossless";
  $("#favoriteNow").textContent = favorites.has(current.id) ? "♥" : "♡";
  document.body.classList.toggle("playing", !audio.paused);
  $("#play").innerHTML = audio.paused ? playSvg : pauseSvg;
  $("#play").setAttribute("aria-label", audio.paused ? "Phát" : "Tạm dừng");
  $("#play").setAttribute("title", audio.paused ? "Phát" : "Tạm dừng");
}
function audioList() {
  return media.filter((m) => m.type === "audio");
}
function step(n) {
  const a = audioList();
  let i = Math.max(
    0,
    a.findIndex((m) => m.id === current?.id),
  );
  i = shuffle
    ? Math.floor(Math.random() * a.length)
    : (i + n + a.length) % a.length;
  playItem(a[i]);
}
function toggleFav(id) {
  favorites.has(id) ? favorites.delete(id) : favorites.add(id);
  localStorage.setItem("mck-favorites", JSON.stringify([...favorites]));
  render();
  updateNow();
  toast(favorites.has(id) ? "Đã thêm vào yêu thích" : "Đã bỏ khỏi yêu thích");
}
function setView(v) {
  view = v;
  $$("[data-view]").forEach((x) =>
    x.classList.toggle("active", x.dataset.view === v),
  );
  $("#sectionTitle").textContent = {
    all: "Tất cả tác phẩm",
    audio: "Thư viện lossless",
    video: "Video âm nhạc",
    favorite: "Tác phẩm yêu thích",
  }[v];
  render();
  document.querySelector(".library").scrollIntoView({ behavior: "smooth" });
  $(".sidebar").classList.remove("open");
}
function openVideo(m) {
  $("#videoTitle").textContent = m.title;
  video.src = m.url;
  $("#videoStage").hidden = false;
  $("#videoStage").scrollIntoView({ behavior: "smooth", block: "start" });
  video.play().catch(() => {});
}
function closeVideo() {
  video.pause();
  video.removeAttribute("src");
  video.load();
  $("#videoStage").hidden = true;
}
function fmt(s) {
  if (!Number.isFinite(s)) return "0:00";
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}
let toastTimer;
function toast(msg) {
  $("#toast").textContent = msg;
  $("#toast").classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("#toast").classList.remove("show"), 2200);
}
grid.addEventListener("click", (e) => {
  const fav = e.target.closest("[data-fav]");
  if (fav) {
    e.stopPropagation();
    toggleFav(fav.dataset.fav);
    return;
  }
  const card = e.target.closest(".card");
  if (card) playItem(media.find((m) => m.id === card.dataset.id));
});
$$("[data-view]").forEach((b) =>
  b.addEventListener("click", () => setView(b.dataset.view)),
);
$("#search").addEventListener("input", render);
$("#playFeatured").onclick = () => playItem(audioList()[0]);
$("#play").onclick = () =>
  current
    ? audio.paused
      ? audio.play()
      : audio.pause()
    : playItem(audioList()[0]);
$("#prev").onclick = () => step(-1);
$("#next").onclick = () => step(1);
$("#shuffle").onclick = () => {
  $("#shuffle").classList.toggle("on", (shuffle = !shuffle));
};
$("#repeat").onclick = () => {
  $("#repeat").classList.toggle("on", (repeat = !repeat));
};
$("#favoriteNow").onclick = () => current && toggleFav(current.id);
$("#volume").oninput = (e) => {
  audio.volume = e.target.value;
  localStorage.setItem("mck-volume", e.target.value);
};
audio.volume = localStorage.getItem("mck-volume") ?? 0.8;
$("#volume").value = audio.volume;
audio.addEventListener("play", updateNow);
audio.addEventListener("pause", updateNow);
audio.addEventListener("waiting", () => toast("Đang tải âm thanh lossless..."));
audio.addEventListener("error", () => {
  const messages = {
    2: "Không tải được media. Kiểm tra kết nối mạng.",
    3: "Trình duyệt không giải mã được file FLAC này.",
    4: "Nguồn media không khả dụng. Hãy chạy python server.py.",
  };
  toast(messages[audio.error?.code] || "Có lỗi khi phát nhạc.");
  updateNow();
});
audio.addEventListener("ended", () =>
  repeat ? ((audio.currentTime = 0), audio.play()) : step(1),
);
audio.addEventListener("timeupdate", () => {
  $("#currentTime").textContent = fmt(audio.currentTime);
  $("#duration").textContent = fmt(audio.duration);
  $("#seek").value = audio.duration
    ? (audio.currentTime / audio.duration) * 100
    : 0;
});
$("#seek").oninput = (e) => {
  if (audio.duration)
    audio.currentTime = (e.target.value / 100) * audio.duration;
};
$("#closeVideo").onclick = closeVideo;
$("#fullscreenVideo").onclick = async () => {
  try {
    if (video.requestFullscreen) await video.requestFullscreen();
    else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
  } catch { toast("Thiết bị không cho phép mở toàn màn hình."); }
};
$(".menu-btn").onclick = () => $(".sidebar").classList.toggle("open");
let lastScrollY = window.scrollY;
let scrollTicking = false;
window.addEventListener("scroll", () => {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(() => {
    const y = window.scrollY;
    const goingDown = y > lastScrollY && y > 100;
    document.body.classList.toggle("bars-hidden", goingDown);
    lastScrollY = Math.max(0, y);
    scrollTicking = false;
  });
}, { passive: true });
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeVideo();
  if (e.code === "Space" && !/INPUT/.test(e.target.tagName)) {
    e.preventDefault();
    $("#play").click();
  }
});
render();
