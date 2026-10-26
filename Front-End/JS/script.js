"use strict";

/* =========================================
   SIAWO - SISTEM AKUNTANSI WEDDING ORGANIZER
   Frontend JavaScript + Supabase
   ========================================= */

const SUPABASE_URL = "https://kkuwqdluicotbzgdmfjk.supabase.co";
const SUPABASE_KEY = "sb_publishable_Cs1-1HixNDSvTVVJyfp32Q_o1e94vZn";

const state = {
    pelanggan: [],
    paket: [],
    transaksi: [],
    pembayaran: []
};

let sedangMemuat = false;

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
    toast.style.borderLeft = jenis === "error" ? "4px solid #dc3545" : "4px solid #198754";
    toast.style.display = "block";

    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => {
        toast.style.display = "none";
    }, 3500);
}

function showToast(pesan, jenis = "success") {
    tampilkanPesan(pesan, jenis);
}

function getRows(data) {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    return [];
}

async function supabaseRequest(tabel, opsi = {}) {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
        throw new Error("Konfigurasi Supabase belum diisi.");
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

    const url = `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${tabel}?${parameter.toString()}`;

    const headers = {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json"
    };

    if (method === "POST" || method === "PATCH" || method === "DELETE") {
        headers.Prefer = "return=representation";
    }

    const respons = await fetch(url, {
        method,
        headers,
        cache: "no-store", 
        ...(body !== null ? { body: JSON.stringify(body) } : {})
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
        const pesan = hasil?.message || hasil?.details || hasil?.hint || `HTTP ${respons.status}`;
        throw new Error(pesan);
    }

    return hasil;
}

async function loadAllData() {
    if (sedangMemuat) return;
    sedangMemuat = true;

    try {
        const [pelanggan, paket, transaksi, pembayaran] = await Promise.all([
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
        tampilkanPesan("Data gagal dimuat: " + error.message, "error");
    } finally {
        sedangMemuat = false;
    }
}

function getNamaPelanggan(id) {
    const data = state.pelanggan.find(item => String(item.id_pelanggan) === String(id));
    return data?.nama_pelanggan || "-";
}

function getNamaPaket(id) {
    const data = state.paket.find(item => String(item.id_paket) === String(id));
    return data?.nama_paket || "-";
}

function getTotalPembayaran(idTransaksi) {
    return state.pembayaran
        .filter(item => String(item.id_transaksi) === String(idTransaksi))
        .reduce((total, item) => total + angka(item.jumlah_bayar), 0);
}

function getPiutang(transaksi) {
    const totalTagihan = angka(transaksi.total_transaksi);
    const totalBayar = getTotalPembayaran(transaksi.id_transaksi);
    return Math.max(totalTagihan - totalBayar, 0);
}

function badgeStatus(status) {
    const aman = escapeHTML(status || "-");
    let warna = "#b7791f"; // Default kuning
    
    if (String(status).toLowerCase() === "lunas") {
        warna = "#198754"; // Hijau
    } else if (String(status).toLowerCase() === "menunggu pembayaran" || String(status).toLowerCase() === "pending") {
        warna = "#d84a5f"; // Merah
    } else if (String(status).toLowerCase() === "berlangsung termin" || String(status).toLowerCase() === "berlangsung") {
        warna = "#0d6efd"; // Biru
    }

    return `<span style="display:inline-block; padding:5px 10px; border-radius:20px; background:${warna}18; color:${warna}; font-size:12px; font-weight:600;">${aman}</span>`;
}

function actionButtons(jenis, id) {
    return `
        <button type="button" data-edit="${escapeHTML(jenis)}" data-id="${escapeHTML(id)}">Edit</button>
        <button type="button" data-delete="${escapeHTML(jenis)}" data-id="${escapeHTML(id)}">Hapus</button>
    `;
}

function setIsiTabel(id, html, colspan = 1) {
    const tabel = document.getElementById(id);
    if (!tabel) return;
    tabel.innerHTML = html || `<tr><td colspan="${colspan}" style="text-align:center;padding:20px">Belum ada data.</td></tr>`;
}

function renderDashboard() {
    const totalPendapatan = state.pembayaran.reduce((total, item) => total + angka(item.jumlah_bayar), 0);
    const totalTagihan = state.transaksi.reduce((total, item) => total + angka(item.total_transaksi), 0);
    const totalPiutang = state.transaksi.reduce((total, item) => total + getPiutang(item), 0);

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

    const ringkasan = [
        ["nilai-tagihan", totalTagihan],
        ["nilai-pembayaran", totalPendapatan],
        ["nilai-piutang", totalPiutang]
    ];

    ringkasan.forEach(([id, nilai]) => {
        const elemen = document.getElementById(id);
        if (elemen) elemen.textContent = rupiah(nilai);
    });

    const maksimum = Math.max(totalTagihan, totalPendapatan, totalPiutang, 1);
    [["bar-tagihan", totalTagihan], ["bar-pembayaran", totalPendapatan], ["bar-piutang", totalPiutang]].forEach(([id, nilai]) => {
        const elemen = document.getElementById(id);
        if (elemen) elemen.style.width = `${Math.min(angka(nilai) / maksimum * 100, 100)}%`;
    });
}

function renderPelanggan() {
    const keyword = document.getElementById("search-pelanggan")?.value.toLowerCase() || "";
    
    const filteredData = state.pelanggan.filter(item => 
        (item.nama_pelanggan || "").toLowerCase().includes(keyword) ||
        (item.no_telepon || "").toLowerCase().includes(keyword) ||
        (item.email || "").toLowerCase().includes(keyword)
    );

    const html = filteredData.map(item => `
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

function renderPaket() {
    const html = state.paket.map(item => `
        <div class="paket-card">
            <h3>${escapeHTML(item.nama_paket)}</h3>
            <div class="harga">${rupiah(item.harga)}</div>
            <p>${escapeHTML(item.deskripsi)}</p>
            <div class="paket-card-actions">
                <button type="button" data-edit="paket" data-id="${item.id_paket}">Edit</button>
                <button type="button" data-delete="paket" data-id="${item.id_paket}">Hapus</button>
            </div>
        </div>
    `).join("");

    const container = document.getElementById("paket-grid-container");
    if (container) {
        container.innerHTML = html || `<p style="text-align:center; width:100%; color:#96868c;">Belum ada paket.</p>`;
    }
}

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

function renderPembayaran() {
    const html = state.pembayaran.map(item => `
        <tr>
            <td>${escapeHTML(item.id_transaksi)}</td>
            <td>${tanggalIndonesia(item.tanggal_pembayaran)}</td>
            <td>${rupiah(item.jumlah_bayar)}</td>
            <td>${escapeHTML(item.metode_pembayaran)}</td>
            <td>${escapeHTML(item.keterangan)}</td>
            <td>${actionButtons("pembayaran", item.id_pembayaran)}</td>
        </tr>
    `).join("");
    setIsiTabel("tabel-pembayaran", html, 6);
}

function renderPiutang() {
    let totalSeluruhPiutang = 0;
    let transaksiBerhutang = 0;
    
    let akumulasiTotalTagihan = 0;
    let akumulasiTotalDibayar = 0;

    const keyword = document.getElementById("search-piutang")?.value.toLowerCase() || "";

    const filteredData = state.transaksi.filter(item => {
        const namaPelanggan = getNamaPelanggan(item.id_pelanggan).toLowerCase();
        const idTransaksi = String(item.id_transaksi).toLowerCase();
        return namaPelanggan.includes(keyword) || idTransaksi.includes(keyword);
    });

    const html = filteredData.map(item => {
        const totalTagihan = angka(item.total_transaksi);
        const totalBayar = getTotalPembayaran(item.id_transaksi);
        const sisa = Math.max(totalTagihan - totalBayar, 0);

        akumulasiTotalTagihan += totalTagihan;
        akumulasiTotalDibayar += totalBayar;

        if (sisa > 0) {
            totalSeluruhPiutang += sisa;
            transaksiBerhutang++;
        }

        const persen = totalTagihan > 0 ? Math.min((totalBayar / totalTagihan) * 100, 100) : 0;
        const warnaSisa = sisa > 0 ? '#d84a5f' : '#2ca068'; 

        const dataPelanggan = state.pelanggan.find(p => String(p.id_pelanggan) === String(item.id_pelanggan));
        
        let tombolWA = "";
        if (sisa > 0 && dataPelanggan && dataPelanggan.no_telepon) {
            const noWA = dataPelanggan.no_telepon.replace(/[^0-9]/g, '').replace(/^0/, '62');
            const teksPesan = encodeURIComponent(`Halo ${dataPelanggan.nama_pelanggan},\n\nKami dari *SIAWO - Lunelle Wedding* ingin menginformasikan ringkasan tagihan acara Anda.\n\nTotal Tagihan: ${rupiah(totalTagihan)}\nTotal Dibayar: ${rupiah(totalBayar)}\n*Sisa Piutang: ${rupiah(sisa)}*\n\nMohon untuk dapat melakukan pelunasan sisa tagihan tersebut. Terima kasih atas kepercayaannya! ♡`);
            tombolWA = `<a href="https://wa.me/${noWA}?text=${teksPesan}" target="_blank" style="display:inline-block; margin-top:8px; padding:6px 12px; background:#25D366; color:white; border-radius:6px; font-size:11px; font-weight:bold; text-decoration:none; box-shadow: 0 2px 5px rgba(37,211,102,0.3);">💬 Tagih via WA</a>`;
        } else if (sisa > 0) {
            tombolWA = `<span style="display:inline-block; margin-top:8px; font-size:10px; color:var(--muted);">No. HP tidak valid</span>`;
        }

        return `
            <tr>
                <td><strong>#${escapeHTML(item.id_transaksi)}</strong></td>
                <td><strong>${escapeHTML(getNamaPelanggan(item.id_pelanggan))}</strong></td>
                <td>${rupiah(totalTagihan)}</td>
                <td>
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                        <div style="flex:1; height:6px; background:#f0e3e7; border-radius:10px; overflow:hidden;">
                            <div style="width:${persen}%; height:100%; background:var(--pink); border-radius:10px;"></div>
                        </div>
                        <span style="font-size:10px; font-weight:bold; color:var(--pink-dark);">${Math.round(persen)}%</span>
                    </div>
                    <div style="font-size:10px; color:var(--muted);">Terbayar: ${rupiah(totalBayar)}</div>
                </td>
                <td><strong style="color: ${warnaSisa}; font-size: 15px;">${rupiah(sisa)}</strong></td>
                <td style="text-align: center;">
                    ${badgeStatus(sisa <= 0 ? "Lunas" : "Belum Lunas")}
                    <br>
                    ${tombolWA}
                </td>
            </tr>
        `;
    }).join("");

    setIsiTabel("tabel-piutang", html, 6);

    const totalElem = document.getElementById("summary-total-piutang");
