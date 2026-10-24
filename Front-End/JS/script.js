"use strict";

/* =========================================
   LUNELLE WEDDING
   Frontend JavaScript + Supabase
   ========================================= */

// PERTAHANKAN konfigurasi Supabase milikmu dari kode lama.
const SUPABASE_URL = "https://kkuwqdluicotbzgdmfjk.supabase.co";
const SUPABASE_KEY = "sb_publishable_Cs1-1HixNDSvTVVJyfp32Q_o1e94vZn";

/* =========================================
   STATE APLIKASI
   ========================================= */

const state = {
    pelanggan: [],
    paket: [],
    transaksi: [],
    pembayaran: []
};

let sedangMemuat = false;

/* =========================================
   FUNGSI DASAR
   ========================================= */

function angka(nilai) {
    const hasil = Number(nilai);
    return Number.isFinite(hasil) ? hasil : 0;
}

function rupiah(nilai) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(angka(nilai));
}

function tanggalIndonesia(nilai) {
    if (!nilai) return "-";

    const tanggal = new Date(nilai + "T00:00:00");

    if (Number.isNaN(tanggal.getTime())) {
        return String(nilai);
    }

    return tanggal.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function escapeHTML(nilai) {
    return String(nilai ?? "").replace(/[&<>"']/g, karakter => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[karakter]);
}

function tanggalIndonesia(nilai) {
    if (!nilai) return "-";

    const tanggal = new Date(nilai + "T00:00:00");

    if (Number.isNaN(tanggal.getTime())) {
        return escapeHTML(nilai);
    }

    return tanggal.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function tampilkanPesan(pesan, jenis = "success") {
    let toast = document.getElementById("lunelle-toast");

    if (!toast) {
        toast = document.createElement("div");
        toast.id = "lunelle-toast";

        Object.assign(toast.style, {
            position: "fixed",
            right: "20px",
            bottom: "20px",
            zIndex: "99999",
            padding: "14px 20px",
            borderRadius: "12px",
            background: "#ffffff",
            color: "#333333",
            boxShadow: "0 4px 20px rgba(0,0,0,.12)",
            maxWidth: "min(360px, calc(100vw - 40px))",
            fontSize: "14px"
        });

        document.body.appendChild(toast);
    }

    toast.textContent = pesan;
    toast.style.borderLeft =
        jenis === "error" ? "4px solid #dc3545" :
        "4px solid #198754";

    toast.style.display = "block";

    clearTimeout(toast.timer);

    toast.timer = setTimeout(() => {
        toast.style.display = "none";
    }, 3500);
}

// Alias agar pemanggilan kode lama tetap kompatibel.
function showToast(pesan, jenis = "success") {
    tampilkanPesan(pesan, jenis);
}

function getRows(data) {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    return [];
}

function getRecord(data) {
    const rows = getRows(data);
    return rows.length ? rows[0] : null;
}

/* =========================================
   KONEKSI SUPABASE
   ========================================= */

async function supabaseRequest(tabel, opsi = {}) {
    if (
        !SUPABASE_URL ||
        SUPABASE_URL.includes("MASUKKAN_URL") ||
        !SUPABASE_KEY ||
        SUPABASE_KEY.includes("MASUKKAN_PUBLISHABLE")
    ) {
        throw new Error(
            "Konfigurasi Supabase belum diisi. Gunakan URL dan publishable key dari kode lama."
        );
    }

    const {
        method = "GET",
        body = null,
        filters = {},
        select = "*"
    } = opsi;

    const parameter = new URLSearchParams();

    parameter.set("select", select);

    Object.entries(filters).forEach(([kolom, nilai]) => {
        parameter.set(kolom, nilai);
    });

    const url =
        `${SUPABASE_URL.replace(/\/$/, "")}` +
        `/rest/v1/${tabel}?${parameter.toString()}`;

    const headers = {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json"
    };

    if (method === "POST" || method === "PATCH") {
        headers.Prefer = "return=representation";
    }

    if (method === "DELETE") {
        headers.Prefer = "return=representation";
    }

    const respons = await fetch(url, {
        method,
        headers,
        ...(body !== null ? {
            body: JSON.stringify(body)
        } : {})
    });

    const teks = await respons.text();

    let hasil = null;

    if (teks) {
        try {
            hasil = JSON.parse(teks);
        } catch {
            hasil = teks;
        }
    }

    if (!respons.ok) {
        const pesan =
            hasil?.message ||
            hasil?.details ||
            hasil?.hint ||
            `HTTP ${respons.status}`;

        throw new Error(pesan);
    }

    return hasil;
}

/* =========================================
   PEMBACAAN DATA
   ========================================= */

async function loadAllData() {
    if (sedangMemuat) return;

    sedangMemuat = true;

    try {
        const [
            pelanggan,
            paket,
            transaksi,
            pembayaran
        ] = await Promise.all([
            supabaseRequest("pelanggan"),
            supabaseRequest("paket_wedding"),
            supabaseRequest("transaksi_wedding"),
            supabaseRequest("pembayaran")
        ]);

        state.pelanggan = getRows(pelanggan);
        state.paket = getRows(paket);
        state.transaksi = getRows(transaksi);
        state.pembayaran = getRows(pembayaran);

        renderAll();

    } catch (error) {
        console.error("Gagal memuat data:", error);

        tampilkanPesan(
            "Data gagal dimuat: " + error.message,
            "error"
        );
    } finally {
        sedangMemuat = false;
    }
}

/* =========================================
   PENCARIAN RELASI DATA
   ========================================= */

function getNamaPelanggan(id) {
    const data = state.pelanggan.find(
        item => String(item.id_pelanggan) === String(id)
    );

    return data?.nama_pelanggan || "-";
}

function getNamaPaket(id) {
    const data = state.paket.find(
        item => String(item.id_paket) === String(id)
    );

    return data?.nama_paket || "-";
}

function getTransaksi(id) {
    return state.transaksi.find(
        item => String(item.id_transaksi) === String(id)
    );
}

function getTotalPembayaran(idTransaksi) {
    return state.pembayaran
        .filter(item =>
            String(item.id_transaksi) === String(idTransaksi)
        )
        .reduce((total, item) => {
            return total + angka(item.jumlah_bayar);
        }, 0);
}

function getPiutang(transaksi) {
    const totalTagihan = angka(transaksi.total_transaksi);
    const totalBayar = getTotalPembayaran(transaksi.id_transaksi);

    return Math.max(totalTagihan - totalBayar, 0);
}

function badgeStatus(status) {
    const aman = escapeHTML(status || "-");

    const warna = String(status).toLowerCase() === "lunas"
        ? "#198754"
        : "#b7791f";

    return `
        <span style="
            display:inline-block;
            padding:5px 10px;
            border-radius:20px;
            background:${warna}18;
            color:${warna};
            font-size:12px;
        ">
            ${aman}
        </span>
    `;
}

function actionButtons(jenis, id) {
    return `
        <button
            type="button"
            data-edit="${escapeHTML(jenis)}"
            data-id="${escapeHTML(id)}">
            Edit
        </button>

        <button
            type="button"
            data-delete="${escapeHTML(jenis)}"
            data-id="${escapeHTML(id)}">
            Hapus
        </button>
    `;
}

function setIsiTabel(id, html, colspan = 1) {
    const tabel = document.getElementById(id);

    if (!tabel) return;

    tabel.innerHTML = html || `
        <tr>
            <td colspan="${colspan}" style="text-align:center;padding:20px">
                Belum ada data.
            </td>
        </tr>
    `;
}

/* =========================================
   DASHBOARD
   ========================================= */

function renderDashboard() {
    const totalPendapatan = state.pembayaran.reduce(
        (total, item) => total + angka(item.jumlah_bayar),
        0
    );

    const totalTagihan = state.transaksi.reduce(
        (total, item) => total + angka(item.total_transaksi),
        0
    );

    const totalPiutang = state.transaksi.reduce(
        (total, item) => total + getPiutang(item),
        0
    );

    const statistik = {
        "total-pelanggan": state.pelanggan.length,
        "total-paket": state.paket.length,
        "total-transaksi": state.transaksi.length,
        "total-pendapatan": rupiah(totalPendapatan),
        "total-piutang": rupiah(totalPiutang)
    };

    Object.entries(statistik).forEach(([id, nilai]) => {
        const elemen = document.getElementById(id);

        if (elemen) elemen.textContent = nilai;
    });

    // Nominal pada ringkasan dashboard.
    const ringkasan = [
        ["nilai-tagihan", totalTagihan],
        ["nilai-pembayaran", totalPendapatan],
        ["nilai-piutang", totalPiutang]
    ];

    ringkasan.forEach(([id, nilai]) => {
        const elemen = document.getElementById(id);

        if (elemen) elemen.textContent = rupiah(nilai);
    });

    // Lebar batang grafik.
    const maksimum = Math.max(
        totalTagihan,
        totalPendapatan,
        totalPiutang,
        1
    );

    [
        ["bar-tagihan", totalTagihan],
        ["bar-pembayaran", totalPendapatan],
        ["bar-piutang", totalPiutang]
    ].forEach(([id, nilai]) => {
        const elemen = document.getElementById(id);

        if (elemen) {
            elemen.style.width =
                `${Math.min(angka(nilai) / maksimum * 100, 100)}%`;
        }
    });

    // Tabel transaksi dashboard bila tersedia di HTML.
    const tabelDashboard =
        document.getElementById("dashboardTransaksi");

    if (tabelDashboard) {
        const data = [...state.transaksi]
            .sort((a, b) =>
                String(b.tanggal_transaksi || "")
                    .localeCompare(String(a.tanggal_transaksi || ""))
            )
            .slice(0, 5);

        tabelDashboard.innerHTML = data.length
            ? data.map(item => `
                <tr>
                    <td>${escapeHTML(item.id_transaksi)}</td>
                    <td>${escapeHTML(getNamaPelanggan(item.id_pelanggan))}</td>
                    <td>${escapeHTML(getNamaPaket(item.id_paket))}</td>
                    <td>${rupiah(item.total_transaksi)}</td>
                    <td>${badgeStatus(item.status)}</td>
                </tr>
            `).join("")
            : `<tr><td colspan="5">Belum ada transaksi.</td></tr>`;
    }
}

/* =========================================
   DATA PELANGGAN
   ========================================= */

function renderPelanggan() {
    const html = state.pelanggan.map(item => `
        <tr>
            <td>${escapeHTML(item.nama_pelanggan)}</td>
            <td>${escapeHTML(item.no_telepon)}</td>
            <td>${escapeHTML(item.email)}</td>
            <td>${escapeHTML(item.alamat)}</td>
            <td>${actionButtons("pelanggan", item.id_pelanggan)}</td>
        </tr>
    `).join("");

    setIsiTabel("tabel-pelanggan", html, 5);
}

/* =========================================
   DATA PAKET WEDDING
   ========================================= */

function renderPaket() {
    const html = state.paket.map(item => `
        <tr>
            <td>${escapeHTML(item.nama_paket)}</td>
            <td>${rupiah(item.harga)}</td>
            <td>${escapeHTML(item.deskripsi)}</td>
            <td>${actionButtons("paket", item.id_paket)}</td>
        </tr>
    `).join("");

    setIsiTabel("tabel-paket", html, 4);
}

/* =========================================
   DATA TRANSAKSI WEDDING
   ========================================= */

function renderTransaksi() {
    const html = state.transaksi.map(item => `
        <tr>
            <td>${escapeHTML(item.id_transaksi)}</td>
            <td>${escapeHTML(getNamaPelanggan(item.id_pelanggan))}</td>
            <td>${escapeHTML(getNamaPaket(item.id_paket))}</td>
            <td>${tanggalIndonesia(item.tanggal_acara)}</td>
            <td>${rupiah(item.total_transaksi)}</td>
            <td>${badgeStatus(item.status)}</td>
            <td>${actionButtons("transaksi", item.id_transaksi)}</td>
        </tr>
    `).join("");

    setIsiTabel("tabel-transaksi", html, 7);
}

/* =========================================
   DATA PEMBAYARAN
   ========================================= */

function renderPembayaran() {
    const html = state.pembayaran.map(item => `
        <tr>
            <td>${escapeHTML(item.id_pembayaran)}</td>
            <td>${escapeHTML(item.id_transaksi)}</td>
            <td>${tanggalIndonesia(item.tanggal_pembayaran)}</td>
            <td>${rupiah(item.jumlah_bayar)}</td>
            <td>${escapeHTML(item.metode_pembayaran)}</td>
            <td>${escapeHTML(item.keterangan)}</td>
            <td>${actionButtons("pembayaran", item.id_pembayaran)}</td>
        </tr>
    `).join("");

    setIsiTabel("tabel-pembayaran", html, 7);
}

/* =========================================
   DATA PIUTANG
   ========================================= */

function renderPiutang() {
    const html = state.transaksi.map(item => {
        const totalBayar = getTotalPembayaran(item.id_transaksi);
        const sisa = getPiutang(item);

        return `
            <tr>
                <td>${escapeHTML(item.id_transaksi)}</td>
                <td>${escapeHTML(getNamaPelanggan(item.id_pelanggan))}</td>
                <td>${rupiah(item.total_transaksi)}</td>
                <td>${rupiah(totalBayar)}</td>
                <td>${rupiah(sisa)}</td>
                <td>${badgeStatus(sisa <= 0 ? "Lunas" : "Belum Lunas")}</td>
            </tr>
        `;
    }).join("");

    setIsiTabel("tabel-piutang", html, 6);
}

/* =========================================
   DROPDOWN RELASI
   ========================================= */

function isiDropdown(id, data, kolomID, pembuatLabel) {
    const elemen = document.getElementById(id);

    if (!elemen) return;

    const nilaiLama = elemen.value;

    elemen.innerHTML = `
        <option value="">Pilih data</option>
        ${data.map(item => `
            <option value="${escapeHTML(item[kolomID])}">
                ${escapeHTML(pembuatLabel(item))}
            </option>
        `).join("")}
    `;

    if (nilaiLama) {
        elemen.value = nilaiLama;
    }
}

function renderPilihanDropdown() {
    isiDropdown(
        "pilih-pelanggan",
        state.pelanggan,
        "id_pelanggan",
        item => item.nama_pelanggan
    );

    isiDropdown(
        "pilih-paket",
        state.paket,
        "id_paket",
        item => `${item.nama_paket} - ${rupiah(item.harga)}`
    );

    isiDropdown(
        "pilih-transaksi",
        state.transaksi,
        "id_transaksi",
        item => `${item.id_transaksi} - ${getNamaPelanggan(item.id_pelanggan)}`
    );
}

function isiHargaPaket() {
    const pilihPaket = document.getElementById("pilih-paket");
    const totalInput = document.getElementById("total-transaksi-input");

    if (!pilihPaket || !totalInput) return;

    const paket = state.paket.find(
        item => String(item.id_paket) === String(pilihPaket.value)
    );

    if (paket) {
        totalInput.value = angka(paket.harga);
    }
}

/* =========================================
   RENDER SEMUA BAGIAN
   ========================================= */

function renderLaporan() {
    // Bagian laporan bersifat opsional.
    // Fungsi ini disediakan agar renderAll tidak mengalami error.
}

function renderAll() {
    renderDashboard();
    renderPelanggan();
    renderPaket();
    renderTransaksi();
    renderPembayaran();
    renderPiutang();
    renderPilihanDropdown();
    renderLaporan();
}

/* =========================================
   NAVIGASI HALAMAN
   ========================================= */

function showPage(namaHalaman) {
    document.querySelectorAll(".page").forEach(halaman => {
        halaman.classList.remove("active");
    });

    const target = document.getElementById(`${namaHalaman}-page`);

    if (target) {
        target.classList.add("active");
    }

    document.querySelectorAll("[data-page]").forEach(tombol => {
        tombol.classList.toggle(
            "active",
            tombol.dataset.page === namaHalaman
        );
    });

    const judul = {
        dashboard: "Dashboard",
        pelanggan: "Data Pelanggan",
        paket: "Paket Wedding",
        transaksi: "Transaksi Wedding",
        pembayaran: "Pembayaran",
        piutang: "Piutang"
    };

    const elemenJudul = document.getElementById("page-title");

    if (elemenJudul) {
        elemenJudul.textContent = judul[namaHalaman] || "Lunelle Wedding";
    }
}

function setupNavigation() {
    document.querySelectorAll("[data-page]").forEach(tombol => {
        tombol.addEventListener("click", event => {
            event.preventDefault();
            showPage(tombol.dataset.page);
        });
    });
}

/* =========================================
   FORM: BANTUAN
   ========================================= */

function nilaiForm(form, nama) {
    const elemen = form.elements.namedItem(nama);
    return elemen ? elemen.value.trim() : "";
}

function ambilID(form, nama) {
    const elemen = form.elements.namedItem(nama);
    return elemen ? elemen.value.trim() : "";
}

function dataForm(form, namaKolom) {
    const data = {};

    namaKolom.forEach(nama => {
        const nilai = nilaiForm(form, nama);

        if (nilai !== "") {
            data[nama] = nilai;
        }
    });

    return data;
}

function resetForm(formID) {
    const form = document.getElementById(formID);

    if (form) form.reset();
}

function tampilkanForm(formID, tampil = true) {
    const form = document.getElementById(formID);

    if (!form) return;

    // Menampilkan form atau card pembungkus jika ditemukan.
    const pembungkus =
        form.closest(".form-card") ||
        form.closest(".form-container") ||
        form;

    pembungkus.classList.toggle("hidden", !tampil);
}

function tutupForm(formID) {
    resetForm(formID);
    tampilkanForm(formID, false);
}

/* =========================================
   SIMPAN PELANGGAN
   ========================================= */

async function savePelanggan(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const id = ambilID(form, "id_pelanggan");

    const payload = dataForm(form, [
        "nama_pelanggan",
        "no_telepon",
        "email",
        "alamat"
    ]);

    try {
        if (id) {
            await supabaseRequest("pelanggan", {
                method: "PATCH",
                filters: { id_pelanggan: `eq.${id}` },
                body: payload
            });
        } else {
            await supabaseRequest("pelanggan", {
                method: "POST",
                body: payload
            });
        }

        resetForm("form-pelanggan");
        tampilkanForm("form-pelanggan", false);
        await loadAllData();

        tampilkanPesan("Data pelanggan berhasil disimpan.");
    } catch (error) {
        tampilkanPesan("Gagal menyimpan pelanggan: " + error.message, "error");
    }
}

/* =========================================
   SIMPAN PAKET
   ========================================= */

async function savePaket(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const id = ambilID(form, "id_paket");

    const payload = dataForm(form, [
        "nama_paket",
        "harga",
        "deskripsi"
    ]);

    if (payload.harga !== undefined) {
        payload.harga = angka(payload.harga);
    }

    try {
        if (id) {
            await supabaseRequest("paket_wedding", {
                method: "PATCH",
                filters: { id_paket: `eq.${id}` },
                body: payload
            });
        } else {
            await supabaseRequest("paket_wedding", {
                method: "POST",
                body: payload
            });
        }

        resetForm("form-paket");
        tampilkanForm("form-paket", false);
        await loadAllData();

        tampilkanPesan("Data paket berhasil disimpan.");
    } catch (error) {
        tampilkanPesan("Gagal menyimpan paket: " + error.message, "error");
    }
}

/* =========================================
   SIMPAN TRANSAKSI
   ========================================= */

async function saveTransaksi(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const id = ambilID(form, "id_transaksi");

    const payload = dataForm(form, [
        "id_pelanggan",
        "id_paket",
        "tanggal_transaksi",
        "tanggal_acara",
        "total_transaksi",
        "status"
    ]);

    if (payload.total_transaksi !== undefined) {
        payload.total_transaksi = angka(payload.total_transaksi);
    }

    try {
        if (id) {
            await supabaseRequest("transaksi_wedding", {
                method: "PATCH",
                filters: { id_transaksi: `eq.${id}` },
                body: payload
            });
        } else {
            await supabaseRequest("transaksi_wedding", {
                method: "POST",
                body: payload
            });
        }

        resetForm("form-transaksi");
        tampilkanForm("form-transaksi", false);
        await loadAllData();

        tampilkanPesan("Transaksi berhasil disimpan.");
    } catch (error) {
        tampilkanPesan("Gagal menyimpan transaksi: " + error.message, "error");
    }
}

/* =========================================
   SIMPAN PEMBAYARAN
   ========================================= */

async function savePembayaran(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const id = ambilID(form, "id_pembayaran");

    const payload = dataForm(form, [
        "id_transaksi",
        "tanggal_pembayaran",
        "jumlah_bayar",
        "metode_pembayaran",
        "keterangan"
    ]);

    if (payload.jumlah_bayar !== undefined) {
        payload.jumlah_bayar = angka(payload.jumlah_bayar);
    }

    try {
        if (id) {
            await supabaseRequest("pembayaran", {
                method: "PATCH",
                filters: { id_pembayaran: `eq.${id}` },
                body: payload
            });
        } else {
            await supabaseRequest("pembayaran", {
                method: "POST",
                body: payload
            });
        }

        resetForm("form-pembayaran");
        tampilkanForm("form-pembayaran", false);
        await loadAllData();

        tampilkanPesan("Pembayaran berhasil disimpan.");
    } catch (error) {
        tampilkanPesan("Gagal menyimpan pembayaran: " + error.message, "error");
    }
}

/* =========================================
   EDIT DATA
   ========================================= */

function editPelanggan(id) {
    const item = state.pelanggan.find(
        data => String(data.id_pelanggan) === String(id)
    );

    if (!item) return;

    const form = document.getElementById("form-pelanggan");
    if (!form) return;

    Object.entries(item).forEach(([nama, nilai]) => {
        const input = form.elements.namedItem(nama);
        if (input) input.value = nilai ?? "";
    });

    tampilkanForm("form-pelanggan", true);
}

function editPaket(id) {
    const item = state.paket.find(
        data => String(data.id_paket) === String(id)
    );

    if (!item) return;

    const form = document.getElementById("form-paket");
    if (!form) return;

    Object.entries(item).forEach(([nama, nilai]) => {
        const input = form.elements.namedItem(nama);
        if (input) input.value = nilai ?? "";
    });

    tampilkanForm("form-paket", true);
}

function editTransaksi(id) {
    const item = state.transaksi.find(
        data => String(data.id_transaksi) === String(id)
    );

    if (!item) return;

    const form = document.getElementById("form-transaksi");
    if (!form) return;

    Object.entries(item).forEach(([nama, nilai]) => {
        const input = form.elements.namedItem(nama);
        if (input) input.value = nilai ?? "";
    });

    tampilkanForm("form-transaksi", true);
}

function editPembayaran(id) {
    const item = state.pembayaran.find(
        data => String(data.id_pembayaran) === String(id)
    );

    if (!item) return;

    const form = document.getElementById("form-pembayaran");
    if (!form) return;

    Object.entries(item).forEach(([nama, nilai]) => {
        const input = form.elements.namedItem(nama);
        if (input) input.value = nilai ?? "";
    });

    tampilkanForm("form-pembayaran", true);
}

/* =========================================
   HAPUS DATA
   ========================================= */

async function deleteRecord(jenis, id) {
    const konfigurasi = {
        pelanggan: {
            tabel: "pelanggan",
            kolom: "id_pelanggan"
        },
        paket: {
            tabel: "paket_wedding",
            kolom: "id_paket"
        },
        transaksi: {
            tabel: "transaksi_wedding",
            kolom: "id_transaksi"
        },
        pembayaran: {
            tabel: "pembayaran",
            kolom: "id_pembayaran"
        }
    };

    const item = konfigurasi[jenis];

    if (!item) return;

    const yakin = confirm("Yakin ingin menghapus data ini?");

    if (!yakin) return;

    try {
        await supabaseRequest(item.tabel, {
            method: "DELETE",
            filters: {
                [item.kolom]: `eq.${id}`
            }
        });

        await loadAllData();

        tampilkanPesan("Data berhasil dihapus.");
    } catch (error) {
        tampilkanPesan(
            "Gagal menghapus data: " + error.message,
            "error"
        );
    }
}

/* =========================================
   EVENT FORM DAN TOMBOL
   ========================================= */

function setupForms() {
    const konfigurasiForm = [
        ["form-pelanggan", savePelanggan],
        ["form-paket", savePaket],
        ["form-transaksi", saveTransaksi],
        ["form-pembayaran", savePembayaran]
    ];

    konfigurasiForm.forEach(([id, handler]) => {
        const form = document.getElementById(id);

        if (form) {
            form.addEventListener("submit", handler);
        }
    });

    const tombolTambah = [
        ["tambah-pelanggan", "form-pelanggan"],
        ["tambah-paket", "form-paket"],
        ["tambah-transaksi", "form-transaksi"],
        ["tambah-pembayaran", "form-pembayaran"]
    ];

    tombolTambah.forEach(([tombolID, formID]) => {
        const tombol = document.getElementById(tombolID);

        if (tombol) {
            tombol.addEventListener("click", () => {
                resetForm(formID);
                tampilkanForm(formID, true);
            });
        }
    });

    document.querySelectorAll("[data-cancel], [data-close]").forEach(tombol => {
        tombol.addEventListener("click", () => {
            const form = tombol.closest("form");

            if (form) {
                resetForm(form.id);
                tampilkanForm(form.id, false);
            }
        });
    });

    const pilihPaket = document.getElementById("pilih-paket");

    if (pilihPaket) {
        pilihPaket.addEventListener("change", isiHargaPaket);
    }
}

/* =========================================
   AKSI TABEL
   ========================================= */

function setupTableActions() {
    document.addEventListener("click", event => {
        const tombolEdit = event.target.closest("[data-edit]");
        const tombolHapus = event.target.closest("[data-delete]");

        if (tombolEdit) {
            const jenis = tombolEdit.dataset.edit;
            const id = tombolEdit.dataset.id;

            const fungsiEdit = {
                pelanggan: editPelanggan,
                paket: editPaket,
                transaksi: editTransaksi,
                pembayaran: editPembayaran
            };

            if (fungsiEdit[jenis]) {
                fungsiEdit[jenis](id);
            }
        }

        if (tombolHapus) {
            deleteRecord(
                tombolHapus.dataset.delete,
                tombolHapus.dataset.id
            );
        }
    });
}

/* =========================================
   INISIALISASI APLIKASI
   ========================================= */

async function initializeApp() {
    setupNavigation();
    setupForms();
    setupTableActions();

    showPage("dashboard");

    await loadAllData();
}

document.addEventListener("DOMContentLoaded", initializeApp);
