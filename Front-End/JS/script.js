
"use strict";

/* =========================================
   LUNELLE WEDDING
   Frontend JavaScript
   ========================================= */

const SUPABASE_URL = "https://kkuwqdluicotbzgdmfjk.supabase.co";
const SUPABASE_KEY = "sb_publishable_Cs1-1HixNDSvTVVJyfp32Q_o1e94vZn";

const state = {
    pelanggan: [],
    paket: [],
    transaksi: [],
    pembayaran: [],
    dashboard: {},
    currentPage: "dashboard"
};

const $ = (id) => document.getElementById(id);

async function supabaseRequest(table, options = {}) {
    const query = options.query || "select=*";
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/${table}?${query}`,
        {
            method: options.method || "GET",
            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": `Bearer ${SUPABASE_KEY}`,
                "Content-Type": "application/json",
                "Prefer": options.prefer || "return=representation"
            },
            body: options.body ? JSON.stringify(options.body) : undefined
        }
    );

    const text = await response.text();
    let result = null;

    if (text) {
        try {
            result = JSON.parse(text);
        } catch {
            throw new Error(`Respons Supabase tidak valid (${response.status}).`);
        }
    }

    if (!response.ok) {
        throw new Error(
            result?.message || result?.hint || `Supabase error ${response.status}`
        );
    }

    return result;
}


const rupiah = (angka) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(Number(angka) || 0);

const tanggalIndonesia = (tanggal) => {
    if (!tanggal) return "-";

    const date = new Date(tanggal);
    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
};

const escapeHTML = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);

const angka = (value) => Number(value) || 0;

function showToast(message, type = "success") {
    const container = $("toastContainer");

    if (!container) {
        alert(message);
        return;
    }

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => toast.remove(), 3500);
}

async function apiRequest(endpoint, options = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    });

    const text = await response.text();
    let result = null;

   if (text) {
    try {
        result = JSON.parse(text);
    } catch {
        throw new Error(`API ${endpoint} tidak tersedia di GitHub Pages.`);
    }
}

    if (!response.ok) {
        throw new Error(
            result?.message ||
            result?.error ||
            `Permintaan gagal (${response.status}).`
        );
    }

    if (result?.error) {
        throw new Error(
            typeof result.error === "string"
                ? result.error
                : JSON.stringify(result.error)
        );
    }

    return result;
}

function getRows(result) {
    if (Array.isArray(result)) return result;
    if (Array.isArray(result?.data)) return result.data;
    if (Array.isArray(result?.records)) return result.records;
    return [];
}

function getRecord(result) {
    if (Array.isArray(result)) return result[0] || {};
    if (Array.isArray(result?.data)) return result.data[0] || {};
    return result?.data || result || {};
}

function getNamaPelanggan(id) {
    const item = state.pelanggan.find(
        (row) => String(row.id_pelanggan) === String(id)
    );

    return item?.nama_pelanggan || "Pelanggan tidak ditemukan";
}

function getNamaPaket(id) {
    const item = state.paket.find(
        (row) => String(row.id_paket) === String(id)
    );

    return item?.nama_paket || "Paket tidak ditemukan";
}

function getTransaksi(id) {
    return state.transaksi.find(
        (row) => String(row.id_transaksi) === String(id)
    );
}

function getTotalPembayaran(idTransaksi) {
    return state.pembayaran
        .filter(
            (row) =>
                String(row.id_transaksi) === String(idTransaksi)
        )
        .reduce((total, row) => total + angka(row.jumlah_bayar), 0);
}

function getPiutang(transaksi) {
    const total = angka(transaksi.total_transaksi);
    const dibayar = getTotalPembayaran(transaksi.id_transaksi);

    return Math.max(total - dibayar, 0);
}

function statusClass(status) {
    const value = String(status || "").toLowerCase();

    if (["lunas", "selesai", "berhasil"].includes(value)) {
        return "success";
    }

    if (["dibatalkan", "batal", "gagal"].includes(value)) {
        return "danger";
    }

    if (["proses", "berlangsung", "dp", "sebagian"].includes(value)) {
        return "warning";
    }

    return "info";
}

function badgeStatus(status) {
    const value = status || "Belum ada status";

    return `<span class="status-badge ${statusClass(value)}">${escapeHTML(value)}</span>`;
}

function actionButtons(id, type) {
    return `
        <div class="table-actions">
            <button
                type="button"
                class="btn-small"
                data-action="edit"
                data-type="${type}"
                data-id="${escapeHTML(id)}"
            >Edit</button>
            <button
                type="button"
                class="btn-small delete"
                data-action="delete"
                data-type="${type}"
                data-id="${escapeHTML(id)}"
            >Hapus</button>
        </div>
    `;
}

/* =========================================
   MEMUAT DATA DARI BACKEND
   ========================================= */



async function loadAllData() {
    try {
        const results = await Promise.all([
            apiRequest("/api/pelanggan"),
            apiRequest("/api/paket"),
            apiRequest("/api/transaksi"),
            apiRequest("/api/pembayaran"),
            apiRequest("/api/dashboard")
        ]);

        state.pelanggan = getRows(results[0]);
        state.paket = getRows(results[1]);
        state.transaksi = getRows(results[2]);
        state.pembayaran = getRows(results[3]);
        state.dashboard = getRecord(results[4]);

    } catch (error) {
        console.error("Gagal memuat data:", error);
        state.pelanggan = [];
        state.paket = [];
        state.transaksi = [];
        state.pembayaran = [];
        state.dashboard = {};
    }

    renderAll();
}


function renderAll() {
    renderDashboard();
    renderPelanggan();
    renderPaket();
    renderTransaksi();
    renderPembayaran();
    renderPiutang();
    renderLaporan();
    renderPilihanDropdown();
}

/* =========================================
   NAVIGASI HALAMAN
   ========================================= */

const pageTitles = {
    dashboard: "Dashboard",
    pelanggan: "Data Pelanggan",
    paket: "Paket Wedding",
    transaksi: "Transaksi Wedding",
    pembayaran: "Pembayaran",
    laporan: "Laporan"
};


function showPage(page) {
    document.querySelectorAll(".page").forEach((section) => {
        section.classList.toggle(
            "active",
            section.id === `${page}-page`
        );
    });

    document.querySelectorAll(".nav-link[data-page]").forEach((link) => {
        link.classList.toggle("active", link.dataset.page === page);
    });

    const judul = document.getElementById("page-title");

    
    const daftarJudul = {
        dashboard: "Dashboard",
        pelanggan: "Pelanggan",
        paket: "Paket Wedding",
        transaksi: "Transaksi Wedding",
        pembayaran: "Pembayaran",
        piutang: "Piutang",
        laporan: "Laporan"
    };

    if (judul) {
        judul.textContent = daftarJudul[page] || "Lunelle Wedding";
    }
}

function setupNavigation() {
    document.querySelectorAll(".nav-link[data-page]").forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            showPage(link.dataset.page);
        });
    });

    document.querySelectorAll("[data-go]").forEach((button) => {
        button.addEventListener("click", () => {
            showPage(button.dataset.go);
        });
    });
}


/* =========================================
   DASHBOARD
   ========================================= */

function renderDashboard() {
    const totalPendapatan = state.pembayaran.reduce(
        (total, row) => total + angka(row.jumlah_bayar),
        0
    );

    const totalTagihan = state.transaksi.reduce(
        (total, row) => total + angka(row.total_transaksi),
        0
    );

    const totalPiutang = state.transaksi.reduce(
        (total, row) => total + getPiutang(row),
        0
    );

    // Memperbarui kartu statistik
    if ($("total-pendapatan")) {
        $("total-pendapatan").textContent = rupiah(totalPendapatan);
    }

    if ($("total-piutang")) {
        $("total-piutang").textContent = rupiah(totalPiutang);
    }

    if ($("total-transaksi")) {
        $("total-transaksi").textContent = state.transaksi.length;
    }

    if ($("total-pelanggan")) {
        $("total-pelanggan").textContent = state.pelanggan.length;
    }

    if ($("total-paket")) {
        $("total-paket").textContent = state.paket.length;
    }

    // Memperbarui diagram keuangan
    const maksimum = Math.max(
        totalTagihan,
        totalPendapatan,
        totalPiutang,
        1
    );

    const dataDiagram = [
        {
            bar: "bar-tagihan",
            label: "nilai-tagihan",
            nilai: totalTagihan
        },
        {
            bar: "bar-pembayaran",
            label: "nilai-pembayaran",
            nilai: totalPendapatan
        },
        {
            bar: "bar-piutang",
            label: "nilai-piutang",
            nilai: totalPiutang
        }
    ];

    dataDiagram.forEach((item) => {
        const batang = document.getElementById(item.bar);
        const label = document.getElementById(item.label);

        if (batang) {
            batang.style.width =
                `${(item.nilai / maksimum) * 100}%`;
        }

        if (label) {
            label.textContent = rupiah(item.nilai);
        }
    });

    // Memperbarui tabel transaksi terbaru jika tersedia
    const table = $("dashboardTransaksi");

    if (table) {
        const latest = [...state.transaksi]
            .sort((a, b) =>
                new Date(b.tanggal_transaksi || 0) -
                new Date(a.tanggal_transaksi || 0)
            )
            .slice(0, 5);

        if (!latest.length) {
            table.innerHTML = `
                <tr>
                    <td colspan="6">Belum ada transaksi wedding.</td>
                </tr>
            `;
        } else {
            table.innerHTML = latest.map((row) => `
                <tr>
                    <td>${escapeHTML(row.id_transaksi)}</td>
                    <td>${escapeHTML(getNamaPelanggan(row.id_pelanggan))}</td>
                    <td>${escapeHTML(getNamaPaket(row.id_paket))}</td>
                    <td>${rupiah(row.total_transaksi)}</td>
                    <td>${badgeStatus(row.status)}</td>
                    <td>${tanggalIndonesia(row.tanggal_acara)}</td>
                </tr>
            `).join("");
        }
    }
}

/* =========================================
   PELANGGAN
   ========================================= */

function renderPelanggan() {
    const table = $("tabel-pelanggan");
    if (!table) return;

    const keyword = ($("cariPelanggan")?.value || "").toLowerCase();

    const data = state.pelanggan.filter((row) =>
        [
            row.nama_pelanggan,
            row.no_telepon,
            row.email,
            row.alamat
        ].some((value) =>
            String(value || "").toLowerCase().includes(keyword)
        )
    );

    if (!data.length) {
        table.innerHTML = `
            <tr><td colspan="6">Data pelanggan belum tersedia.</td></tr>
        `;
        return;
    }

    table.innerHTML = data.map((row) => `
        <tr>
            <td>${escapeHTML(row.id_pelanggan)}</td>
            <td>${escapeHTML(row.nama_pelanggan)}</td>
            <td>${escapeHTML(row.no_telepon || "-")}</td>
            <td>${escapeHTML(row.email || "-")}</td>
            <td>${escapeHTML(row.alamat || "-")}</td>
            <td>${actionButtons(row.id_pelanggan, "pelanggan")}</td>
        </tr>
    `).join("");
}

function resetFormPelanggan() {
    $("formPelanggan")?.reset();
    if ($("idPelanggan")) $("idPelanggan").value = "";

    if ($("judulFormPelanggan")) {
        $("judulFormPelanggan").textContent = "Tambah Pelanggan";
    }
}

function editPelanggan(id) {
    const row = state.pelanggan.find(function (item) {
        return String(item.id_pelanggan) === String(id);
    });

    if (!row) {
        alert("Data pelanggan tidak ditemukan.");
        return;
    }

    const form = document.getElementById("form-pelanggan");

    if (!form) {
        alert("Form pelanggan tidak ditemukan.");
        return;
    }

    form.querySelector('[name="id_pelanggan"]').value =
        row.id_pelanggan;

    form.querySelector('[name="nama_pelanggan"]').value =
        row.nama_pelanggan || "";

    form.querySelector('[name="no_telepon"]').value =
        row.no_telepon || "";

    form.querySelector('[name="email"]').value =
        row.email || "";

    form.querySelector('[name="alamat"]').value =
        row.alamat || "";

    form.classList.remove("hidden");

    form.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


async function savePelanggan(event) {
    event.preventDefault();

    const form = $("form-pelanggan");

    if (!form) {
        showToast("Form pelanggan tidak ditemukan.", "error");
        return;
    }

    const id = form.elements.namedItem("id_pelanggan").value;

    const payload = {
        nama_pelanggan: form.elements.namedItem("nama_pelanggan").value.trim(),
        no_telepon: form.elements.namedItem("no_telepon").value.trim(),
        email: form.elements.namedItem("email").value.trim(),
        alamat: form.elements.namedItem("alamat").value.trim()
    };

    if (!payload.nama_pelanggan) {
        showToast("Nama pelanggan wajib diisi.", "error");
        return;
    }

    try {
        await apiRequest(
            id
                ? `/api/pelanggan/${encodeURIComponent(id)}`
                : "/api/pelanggan",
            {
                method: id ? "PATCH" : "POST",
                body: JSON.stringify(payload)
            }
        );

        showToast(
            id
                ? "Data pelanggan berhasil diperbarui."
                : "Pelanggan berhasil ditambahkan."
        );

        form.reset();
        form.classList.add("hidden");

        await loadAllData();
    } catch (error) {
        console.error("Gagal menyimpan pelanggan:", error);
        showToast(error.message || "Gagal menyimpan pelanggan.", "error");
    }
}

/* =========================================
   PAKET WEDDING
   ========================================= */

function renderPaket() {
    const table = $("tabel-paket");
    if (!table) return;

    const keyword = ($("cariPaket")?.value || "").toLowerCase();

    const data = state.paket.filter((row) =>
        [
            row.nama_paket,
            row.deskripsi
        ].some((value) =>
            String(value || "").toLowerCase().includes(keyword)
        )
    );

    if (!data.length) {
        table.innerHTML = `
            <tr><td colspan="5">Data paket wedding belum tersedia.</td></tr>
        `;
        return;
    }

    table.innerHTML = data.map((row) => `
        <tr>
            <td>${escapeHTML(row.id_paket)}</td>
            <td>${escapeHTML(row.nama_paket)}</td>
            <td>${rupiah(row.harga)}</td>
            <td>${escapeHTML(row.deskripsi || "-")}</td>
            <td>${actionButtons(row.id_paket, "paket")}</td>
        </tr>
    `).join("");
}

function resetFormPaket() {
    $("formPaket")?.reset();
    if ($("idPaket")) $("idPaket").value = "";

    if ($("judulFormPaket")) {
        $("judulFormPaket").textContent = "Tambah Paket Wedding";
    }
}

function editPaket(id) {
    const row = state.paket.find(
        (item) => String(item.id_paket) === String(id)
    );

    if (!row) return;

    $("idPaket").value = row.id_paket;
    $("namaPaket").value = row.nama_paket || "";
    $("hargaPaket").value = row.harga || "";
    $("deskripsiPaket").value = row.deskripsi || "";

    $("judulFormPaket").textContent = "Edit Paket Wedding";
    $("formPaketCard").hidden = false;
    $("formPaketCard").scrollIntoView({ behavior: "smooth" });
}

async function savePaket(event) {
    event.preventDefault();

    const id = $("idPaket").value;

    const payload = {
        nama_paket: $("namaPaket").value.trim(),
        harga: angka($("hargaPaket").value),
        deskripsi: $("deskripsiPaket").value.trim()
    };

    if (!payload.nama_paket || payload.harga <= 0) {
        showToast("Nama paket dan harga yang valid wajib diisi.", "error");
        return;
    }

    try {
        await apiRequest(
            id ? `/api/paket/${encodeURIComponent(id)}` : "/api/paket",
            {
                method: id ? "PATCH" : "POST",
                body: JSON.stringify(payload)
            }
        );

        showToast(id ? "Paket berhasil diperbarui." : "Paket berhasil ditambahkan.");
        resetFormPaket();
        $("formPaketCard").hidden = true;
        await loadAllData();
    } catch (error) {
        showToast(error.message, "error");
    }
}

/* =========================================
   TRANSAKSI WEDDING
   ========================================= */

function renderTransaksi() {
    const table = $("tabel-transaksi");
    if (!table) return;

    const keyword = ($("cariTransaksi")?.value || "").toLowerCase();

    const data = state.transaksi.filter((row) =>
        [
            row.id_transaksi,
            getNamaPelanggan(row.id_pelanggan),
            getNamaPaket(row.id_paket),
            row.status,
            row.tanggal_acara
        ].some((value) =>
            String(value || "").toLowerCase().includes(keyword)
        )
    );

    if (!data.length) {
        table.innerHTML = `
            <tr><td colspan="7">Data transaksi belum tersedia.</td></tr>
        `;
        return;
    }

    table.innerHTML = data.map((row) => `
        <tr>
            <td>${escapeHTML(row.id_transaksi)}</td>
            <td>${escapeHTML(getNamaPelanggan(row.id_pelanggan))}</td>
            <td>${escapeHTML(getNamaPaket(row.id_paket))}</td>
            <td>${tanggalIndonesia(row.tanggal_transaksi)}</td>
            <td>${tanggalIndonesia(row.tanggal_acara)}</td>
            <td>${rupiah(row.total_transaksi)}</td>
            <td>
                ${badgeStatus(row.status)}
                ${actionButtons(row.id_transaksi, "transaksi")}
            </td>
        </tr>
    `).join("");
}

function renderPilihanDropdown() {
    const pelangganSelect = $("pilihPelanggan");
    if (pelangganSelect) {
        const selected = pelangganSelect.value;

        pelangganSelect.innerHTML = `
            <option value="">Pilih pelanggan</option>
            ${state.pelanggan.map((row) => `
                <option value="${escapeHTML(row.id_pelanggan)}">
                    ${escapeHTML(row.nama_pelanggan)}
                </option>
            `).join("")}
        `;

        pelangganSelect.value = selected;
    }

    const paketSelect = $("pilihPaket");
    if (paketSelect) {
        const selected = paketSelect.value;

        paketSelect.innerHTML = `
            <option value="">Pilih paket wedding</option>
            ${state.paket.map((row) => `
                <option value="${escapeHTML(row.id_paket)}">
                    ${escapeHTML(row.nama_paket)} — ${rupiah(row.harga)}
                </option>
            `).join("")}
        `;

        paketSelect.value = selected;
    }

    const transaksiSelect = $("pilihTransaksiBayar");
    if (transaksiSelect) {
        const selected = transaksiSelect.value;

        transaksiSelect.innerHTML = `
            <option value="">Pilih transaksi</option>
            ${state.transaksi.map((row) => `
                <option value="${escapeHTML(row.id_transaksi)}">
                    #${escapeHTML(row.id_transaksi)} — ${escapeHTML(getNamaPelanggan(row.id_pelanggan))}
                    (${rupiah(row.total_transaksi)})
                </option>
            `).join("")}
        `;

        transaksiSelect.value = selected;
    }
}

function resetFormTransaksi() {
    $("formTransaksi")?.reset();
    if ($("idTransaksi")) $("idTransaksi").value = "";

    if ($("judulFormTransaksi")) {
        $("judulFormTransaksi").textContent = "Tambah Transaksi";
    }
}

function editTransaksi(id) {
    const row = state.transaksi.find(
        (item) => String(item.id_transaksi) === String(id)
    );

    if (!row) return;

    $("idTransaksi").value = row.id_transaksi;
    $("pilihPelanggan").value = row.id_pelanggan || "";
    $("pilihPaket").value = row.id_paket || "";
    $("tanggalTransaksi").value = row.tanggal_transaksi || "";
    $("tanggalAcara").value = row.tanggal_acara || "";
    $("totalTransaksiInput").value = row.total_transaksi || "";
    $("statusTransaksi").value = row.status || "Belum Lunas";

    $("judulFormTransaksi").textContent = "Edit Transaksi";
    $("formTransaksiCard").hidden = false;
    $("formTransaksiCard").scrollIntoView({ behavior: "smooth" });
}

function isiHargaPaket() {
    const paket = state.paket.find(
        (row) => String(row.id_paket) === String($("pilihPaket")?.value)
    );

    if (paket && $("totalTransaksiInput")) {
        $("totalTransaksiInput").value = paket.harga;
    }
}

async function saveTransaksi(event) {
    event.preventDefault();

    const id = $("idTransaksi").value;

    const payload = {
        id_pelanggan: $("pilihPelanggan").value,
        id_paket: $("pilihPaket").value,
        tanggal_transaksi: $("tanggalTransaksi").value,
        tanggal_acara: $("tanggalAcara").value,
        total_transaksi: angka($("totalTransaksiInput").value),
        status: $("statusTransaksi").value
    };

    if (
        !payload.id_pelanggan ||
        !payload.id_paket ||
        !payload.tanggal_transaksi ||
        !payload.tanggal_acara ||
        payload.total_transaksi <= 0
    ) {
        showToast("Lengkapi seluruh data transaksi terlebih dahulu.", "error");
        return;
    }

    try {
        await apiRequest(
            id ? `/api/transaksi/${encodeURIComponent(id)}` : "/api/transaksi",
            {
                method: id ? "PATCH" : "POST",
                body: JSON.stringify(payload)
            }
        );

        showToast(id ? "Transaksi berhasil diperbarui." : "Transaksi berhasil ditambahkan.");
        resetFormTransaksi();
        $("formTransaksiCard").hidden = true;
        await loadAllData();
    } catch (error) {
        showToast(error.message, "error");
    }
}

/* =========================================
   PEMBAYARAN
   ========================================= */

function renderPembayaran() {
    const table = $("tabel-pembayaran");
    if (!table) return;

    const keyword = ($("cariPembayaran")?.value || "").toLowerCase();

    const data = state.pembayaran.filter((row) =>
        [
            row.id_pembayaran,
            row.id_transaksi,
            getNamaPelanggan(
                getTransaksi(row.id_transaksi)?.id_pelanggan
            ),
            row.metode_pembayaran,
            row.keterangan
        ].some((value) =>
            String(value || "").toLowerCase().includes(keyword)
        )
    );

    if (!data.length) {
        table.innerHTML = `
            <tr><td colspan="7">Data pembayaran belum tersedia.</td></tr>
        `;
        return;
    }

    table.innerHTML = data.map((row) => `
        <tr>
            <td>${escapeHTML(row.id_pembayaran)}</td>
            <td>${escapeHTML(row.id_transaksi)}</td>
            <td>${escapeHTML(getNamaPelanggan(
                getTransaksi(row.id_transaksi)?.id_pelanggan
            ))}</td>
            <td>${tanggalIndonesia(row.tanggal_pembayaran)}</td>
            <td>${rupiah(row.jumlah_bayar)}</td>
            <td>${escapeHTML(row.metode_pembayaran || "-")}</td>
            <td>${actionButtons(row.id_pembayaran, "pembayaran")}</td>
        </tr>
    `).join("");
}


function renderPiutang() {
    const table = $("tabel-piutang");
    if (!table) return;

    if (!state.transaksi.length) {
        table.innerHTML = `
            <tr>
                <td colspan="6">Belum ada transaksi wedding.</td>
            </tr>
        `;
        return;
    }

    table.innerHTML = state.transaksi.map((row) => {
        const totalTagihan = angka(row.total_transaksi);
        const totalDibayar = getTotalPembayaran(row.id_transaksi);
        const sisaPiutang = getPiutang(row);

        return `
            <tr>
                <td>${escapeHTML(row.id_transaksi)}</td>
                <td>${escapeHTML(getNamaPelanggan(row.id_pelanggan))}</td>
                <td>${escapeHTML(getNamaPaket(row.id_paket))}</td>
                <td>${rupiah(totalTagihan)}</td>
                <td>${rupiah(totalDibayar)}</td>
                <td>${rupiah(sisaPiutang)}</td>
            </tr>
        `;
    }).join("");
}


function resetFormPembayaran() {
    $("formPembayaran")?.reset();
    if ($("idPembayaran")) $("idPembayaran").value = "";
}

async function savePembayaran(event) {
    event.preventDefault();

    const id = $("idPembayaran")?.value || "";

    const payload = {
        id_transaksi: $("pilihTransaksiBayar").value,
        tanggal_pembayaran: $("tanggalPembayaran").value,
        jumlah_bayar: angka($("jumlahBayar").value),
        metode_pembayaran: $("metodePembayaran").value,
        keterangan: $("keteranganPembayaran").value.trim()
    };

    if (
        !payload.id_transaksi ||
        !payload.tanggal_pembayaran ||
        payload.jumlah_bayar <= 0 ||
        !payload.metode_pembayaran
    ) {
        showToast("Lengkapi data pembayaran dengan benar.", "error");
        return;
    }

    const transaksi = getTransaksi(payload.id_transaksi);

    if (transaksi) {
        const totalBayarSebelumnya = getTotalPembayaran(transaksi.id_transaksi);
        const batasPembayaran =
            angka(transaksi.total_transaksi) - totalBayarSebelumnya;

        if (!id && payload.jumlah_bayar > batasPembayaran) {
            showToast(
                `Pembayaran melebihi sisa tagihan ${rupiah(batasPembayaran)}.`,
                "error"
            );
            return;
        }
    }

    try {
        await apiRequest(
            id ? `/api/pembayaran/${encodeURIComponent(id)}` : "/api/pembayaran",
            {
                method: id ? "PATCH" : "POST",
                body: JSON.stringify(payload)
            }
        );

        showToast(id ? "Pembayaran berhasil diperbarui." : "Pembayaran berhasil dicatat.");
        resetFormPembayaran();
        $("formPembayaranCard").hidden = true;
        await loadAllData();
    } catch (error) {
        showToast(error.message, "error");
    }
}

function editPembayaran(id) {
    const row = state.pembayaran.find(
        (item) => String(item.id_pembayaran) === String(id)
    );

    if (!row) return;

    $("idPembayaran").value = row.id_pembayaran;
    $("pilihTransaksiBayar").value = row.id_transaksi || "";
    $("tanggalPembayaran").value = row.tanggal_pembayaran || "";
    $("jumlahBayar").value = row.jumlah_bayar || "";
    $("metodePembayaran").value = row.metode_pembayaran || "";
    $("keteranganPembayaran").value = row.keterangan || "";

    $("formPembayaranCard").hidden = false;
    $("formPembayaranCard").scrollIntoView({ behavior: "smooth" });
}

/* =========================================
   HAPUS DATA
   ========================================= */

async function deleteRecord(type, id) {
    const config = {
        pelanggan: {
            endpoint: "/api/pelanggan",
            name: "pelanggan"
        },
        paket: {
            endpoint: "/api/paket",
            name: "paket wedding"
        },
        transaksi: {
            endpoint: "/api/transaksi",
            name: "transaksi"
        },
        pembayaran: {
            endpoint: "/api/pembayaran",
            name: "pembayaran"
        }
    };

    const item = config[type];
    if (!item) return;

    const confirmed = confirm(
        `Yakin ingin menghapus data ${item.name} ini?`
    );

    if (!confirmed) return;

    try {
        await apiRequest(
            `${item.endpoint}/${encodeURIComponent(id)}`,
            { method: "DELETE" }
        );

        showToast(`Data ${item.name} berhasil dihapus.`);
        await loadAllData();
    } catch (error) {
        showToast(
            `Data gagal dihapus: ${error.message}`,
            "error"
        );
    }
}

function setupTableActions() {
    document.addEventListener("click", (event) => {
        const button = event.target.closest("[data-action]");
        if (!button) return;

        const { action, type, id } = button.dataset;

        if (action === "delete") {
            deleteRecord(type, id);
            return;
        }

        if (action === "edit") {
            const editFunctions = {
                pelanggan: editPelanggan,
                paket: editPaket,
                transaksi: editTransaksi,
                pembayaran: editPembayaran
            };

            editFunctions[type]?.(id);
        }
    });
}

/* =========================================
   LAPORAN
   ========================================= */

function renderLaporan() {
    const pendapatan = state.pembayaran.reduce(
        (total, row) => total + angka(row.jumlah_bayar),
        0
    );

    const piutang = state.transaksi.reduce(
        (total, row) => total + getPiutang(row),
        0
    );

    if ($("laporanPendapatan")) {
        $("laporanPendapatan").textContent = rupiah(pendapatan);
    }

    if ($("laporanPiutang")) {
        $("laporanPiutang").textContent = rupiah(piutang);
    }

    if ($("laporanTransaksi")) {
        $("laporanTransaksi").textContent = state.transaksi.length;
    }

    const table = $("tabelLaporan");
    if (!table) return;

    if (!state.transaksi.length) {
        table.innerHTML = `
            <tr><td colspan="7">Belum ada data untuk dilaporkan.</td></tr>
        `;
        return;
    }

    table.innerHTML = state.transaksi.map((row) => {
        const dibayar = getTotalPembayaran(row.id_transaksi);
        const sisa = getPiutang(row);

        return `
            <tr>
                <td>${escapeHTML(row.id_transaksi)}</td>
                <td>${escapeHTML(getNamaPelanggan(row.id_pelanggan))}</td>
                <td>${escapeHTML(getNamaPaket(row.id_paket))}</td>
                <td>${rupiah(row.total_transaksi)}</td>
                <td>${rupiah(dibayar)}</td>
                <td>${rupiah(sisa)}</td>
                <td>${sisa <= 0 ? badgeStatus("Lunas") : badgeStatus("Belum Lunas")}</td>
            </tr>
        `;
    }).join("");
}

/* =========================================
   FORM, PENCARIAN, DAN TOMBOL
   ========================================= */


function setupForms() {
    // Tombol untuk membuka form tambah data
    const daftarForm = [
        {
            tombol: "tambah-pelanggan",
            form: "form-pelanggan"
        },
        {
            tombol: "tambah-paket",
            form: "form-paket"
        },
        {
            tombol: "tambah-transaksi",
            form: "form-transaksi"
        },
        {
            tombol: "tambah-pembayaran",
            form: "form-pembayaran"
        }
    ];

    daftarForm.forEach(({ tombol, form }) => {
        const btn = $(tombol);
        const formElement = $(form);

        if (!btn || !formElement) {
            console.warn(
                "Elemen tidak ditemukan:",
                tombol,
                form
            );
            return;
        }

        btn.addEventListener("click", () => {
            formElement.reset();
            formElement.classList.remove("hidden");

            formElement.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });
    });

    // Event untuk menyimpan data
    $("form-pelanggan")?.addEventListener(
        "submit",
        savePelanggan
    );

    $("form-paket")?.addEventListener(
        "submit",
        savePaket
    );

    $("form-transaksi")?.addEventListener(
        "submit",
        saveTransaksi
    );

    $("form-pembayaran")?.addEventListener(
        "submit",
        savePembayaran
    );

    // Tombol untuk menutup form
    document.querySelectorAll("[data-close]").forEach((button) => {
        button.addEventListener("click", () => {
            const target = $(button.dataset.close);

            if (target) {
                target.classList.add("hidden");
            }
        });
    });

    // Mengisi harga paket saat paket dipilih
    $("pilih-paket")?.addEventListener(
        "change",
        isiHargaPaket
    );

    // Fitur pencarian jika elemen pencarian tersedia
    $("cari-pelanggan")?.addEventListener(
        "input",
        renderPelanggan
    );

    $("cari-paket")?.addEventListener(
        "input",
        renderPaket
    );

    $("cari-transaksi")?.addEventListener(
        "input",
        renderTransaksi
    );

    $("cari-pembayaran")?.addEventListener(
        "input",
        renderPembayaran
    );

    // Tombol refresh laporan jika tersedia
    $("btnRefreshLaporan")?.addEventListener(
        "click",
        async () => {
            await loadAllData();
            showToast("Laporan berhasil diperbarui.");
        }
    );
}

/* =========================================
   INISIALISASI
   ========================================= */

function initializeApp() {
    if ($("currentDate")) {
        $("currentDate").textContent = new Date().toLocaleDateString(
            "id-ID",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );
    }

    if ($("currentYear")) {
        $("currentYear").textContent = new Date().getFullYear();
    }

    setupNavigation();
    setupForms();
    setupTableActions();

    showPage("dashboard");
    loadAllData();
       } catch (error) {
        console.error("Gagal memuat data:", error);

        state.pelanggan = [];
        state.paket = [];
        state.transaksi = [];
        state.pembayaran = [];
        state.dashboard = {};
    }

    renderAll();
}

document.addEventListener("DOMContentLoaded", initializeApp);
