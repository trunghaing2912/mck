
// Route media through the local server so redirects, CORS and byte-range
// requests behave consistently across desktop and mobile browsers.
const DRIVE = "/api/media/";
let media = [];
async function loadMedia() {
  const response = await fetch("/media.json");
  if (!response.ok) throw new Error("Không thể tải danh sách media");
  const catalog = await response.json();
  media = catalog.map(({ id, file }, i) => ({
    id,
    file,
    type: file.toLowerCase().endsWith(".mp4") ? "video" : "audio",
    title: file.replace(/^\\d+\\.\\s*/, "").replace(/\\.(flac|mp4)$/i, ""),
    url: DRIVE + id,
    no: String(i + 1).padStart(2, "0"),
  }));
  render();
}
const $ = (s) => document.querySelector(s),
  $$ = (s) => [...document.querySelectorAll(s)];
const audio = $("#audio"),
  video = $("#video"),
  grid = $("#mediaGrid");
const playSvg =
  '<svg class="control-icon play-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7V5Z" /></svg>';
const pauseSvg =
  '<svg class="control-icon pause-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zM14 5h4v14h-4z" /></svg>';
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
        `<article class="card ${m.type}-card ${current?.id === m.id ? "active" : ""}" data-id="${m.id}"><div class="cover" data-no="${m.no}" style="--tone:${["#57261d", "#1d3c3b", "#34301a", "#3f1e37", "#253118"][i % 5]}"><button class="heart ${favorites.has(m.id) ? "on" : ""}" data-fav="${m.id}" aria-label="Yêu thích">${favorites.has(m.id) ? "♥" : "♡"}</button><span class="format">${m.type === "audio" ? "FLAC · LOSSLESS" : "MP4 · VIDEO"}</span><button class="card-play" aria-label="Phát">${playSvg}</button></div><h3>${m.title}</h3><p>MCK · ${m.type === "audio" ? "Lossless Audio" : "Official Visual"}</p></article>`,
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
  $("#favoriteNow").textContent = favorites.has(current.id) ? "â™¥" : "â™¡";
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
    4: "Nguồn media không khả dụng.",
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
  } catch {
    toast("Thiết bị không cho phép mở toàn màn hình.");
  }
};
$(".menu-btn").onclick = () => $(".sidebar").classList.toggle("open");
let lastScrollY = window.scrollY;
let scrollTicking = false;
window.addEventListener(
  "scroll",
  () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      const goingDown = y > lastScrollY && y > 100;
      document.body.classList.toggle("bars-hidden", goingDown);
      lastScrollY = Math.max(0, y);
      scrollTicking = false;
    });
  },
  { passive: true },
);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeVideo();
  if (e.code === "Space" && !/INPUT/.test(e.target.tagName)) {
    e.preventDefault();
    $("#play").click();
  }
});
loadMedia().catch((error) => toast(error.message));
