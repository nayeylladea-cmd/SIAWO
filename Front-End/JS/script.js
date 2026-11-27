"use strict";

const SUPABASE_URL = "https://kkuwqdluicotbzgdmfjk.supabase.co";
const SUPABASE_KEY = "sb_publishable_Cs1-1HixNDSvTVVJyfp32Q_o1e94vZn";
const STORAGE_JURNAL_MANUAL = "siawo_jurnal_manual_v1";
const STORAGE_MODAL_AWAL = "siawo_modal_awal_v1";
const STORAGE_DEMO_DATA = "siawo_demo_data_v1";

const state = {
    pelanggan: [],
    paket: [],
    transaksi: [],
    pembayaran: [],
    jurnalManual: [],
    modalAwal: 50000000,
    isDemoMode: false
};

let sedangMemuat = false;
let grafikKeuangan = null;

function buatDataSimulasiDefault() {
    return {
        pelanggan: [
            { id_pelanggan: 101, nama_pelanggan: "Clarissa Putri & Dimas Pratama", no_telepon: "081234567890", email: "clarissa.dimas@gmail.com", alamat: "Jl. Pandanaran No. 45, Semarang" },
            { id_pelanggan: 102, nama_pelanggan: "Alya Rahma & Kevin Wijaya", no_telepon: "085711223344", email: "alya.kevin@gmail.com", alamat: "Jl. Sultan Agung No. 88, Semarang" },
            { id_pelanggan: 103, nama_pelanggan: "Nadia Kusuma & Reza Mahendra", no_telepon: "082199887766", email: "nadia.reza@gmail.com", alamat: "Perum Graha Estetika Blok C-12, Tembalang" },
            { id_pelanggan: 104, nama_pelanggan: "Salsa Maharani & Bagas Saputra", no_telepon: "081355667788", email: "salsa.bagas@gmail.com", alamat: "Jl. Pemuda No. 102, Semarang" },
            { id_pelanggan: 105, nama_pelanggan: "Dinda Kirana & Farhan Hakim", no_telepon: "085644332211", email: "dinda.farhan@gmail.com", alamat: "Jl. Sisingamangaraja No. 29, Semarang" },
            { id_pelanggan: 106, nama_pelanggan: "Vania Aurelia & Raka Pratama", no_telepon: "081977665544", email: "vania.raka@gmail.com", alamat: "Jl. Gajahmada No. 64, Semarang" },
            { id_pelanggan: 107, nama_pelanggan: "Tiara Anindita & Yoga Santoso", no_telepon: "085822334455", email: "tiara.yoga@gmail.com", alamat: "Jl. Setiabudi No. 19, Banyumanik, Semarang" }
        ],
        paket: [
            { id_paket: 1, nama_paket: "Intimate Garden Package", harga: 25000000, deskripsi: "Full WO Crew (6 orang), Dekorasi Akad & Resepsi Intimate (150 pax), MC, Makeup Pengantin, & Dokumentasi Foto." },
            { id_paket: 2, nama_paket: "Royal Elegance Package", harga: 45000000, deskripsi: "Full WO Crew (10 orang), Dekorasi Ballroom Mewah (300 pax), Band Akustik, Foto & Cinematic Video, serta Buku Tamu Digital." },
            { id_paket: 3, nama_paket: "Grand Luxury Wedding", harga: 75000000, deskripsi: "All-In Luxury Wedding (500 pax), Dekorasi Custom Full Bunga Segar, 12 Crew WO, Photobooth, Live Streaming, & Prewedding." }
        ],
        transaksi: [
            { id_transaksi: 201, id_pelanggan: 101, id_paket: 2, tanggal_transaksi: "2026-08-15", tanggal_acara: "2026-09-20", total_transaksi: 45000000, status: "Lunas" },
            { id_transaksi: 202, id_pelanggan: 102, id_paket: 3, tanggal_transaksi: "2026-09-01", tanggal_acara: "2026-10-18", total_transaksi: 75000000, status: "Berlangsung" },
            { id_transaksi: 203, id_pelanggan: 103, id_paket: 1, tanggal_transaksi: "2026-09-25", tanggal_acara: "2026-11-15", total_transaksi: 25000000, status: "Berlangsung" },
            { id_transaksi: 204, id_pelanggan: 104, id_paket: 2, tanggal_transaksi: "2026-10-10", tanggal_acara: "2026-12-20", total_transaksi: 45000000, status: "Menunggu Pembayaran" },
            { id_transaksi: 205, id_pelanggan: 105, id_paket: 3, tanggal_transaksi: "2026-11-01", tanggal_acara: "2027-01-25", total_transaksi: 75000000, status: "Lunas" }
        ],
        pembayaran: [
            { id_pembayaran: 301, id_transaksi: 201, tanggal_pembayaran: "2026-08-15", jumlah_bayar: 15000000, metode_pembayaran: "Transfer Bank", keterangan: "Booking Fee & DP 1" },
            { id_pembayaran: 302, id_transaksi: 201, tanggal_pembayaran: "2026-09-12", jumlah_bayar: 30000000, metode_pembayaran: "Transfer Bank", keterangan: "Pelunasan H-8 Acara" },
            { id_pembayaran: 303, id_transaksi: 202, tanggal_pembayaran: "2026-09-01", jumlah_bayar: 30000000, metode_pembayaran: "Transfer Bank", keterangan: "DP 40% Paket Grand Luxury" },
            { id_pembayaran: 304, id_transaksi: 202, tanggal_pembayaran: "2026-10-05", jumlah_bayar: 25000000, metode_pembayaran: "QRIS", keterangan: "Termin ke-2 (Sisa Rp20.000.000)" },
            { id_pembayaran: 305, id_transaksi: 203, tanggal_pembayaran: "2026-09-25", jumlah_bayar: 10000000, metode_pembayaran: "Transfer Bank", keterangan: "DP Awal 40% Intimate Package" },
            { id_pembayaran: 306, id_transaksi: 204, tanggal_pembayaran: "2026-10-10", jumlah_bayar: 10000000, metode_pembayaran: "Tunai", keterangan: "Booking Fee Kontrak" },
            { id_pembayaran: 307, id_transaksi: 205, tanggal_pembayaran: "2026-11-01", jumlah_bayar: 75000000, metode_pembayaran: "Transfer Bank", keterangan: "Pembayaran Penuh di Muka" }
        ],
        jurnalManual: [
            { id_jurnal: "JRN-DEMO-1", tanggal_jurnal: "2026-08-20", no_referensi: "BKM-01", akun_debit: "Kas", akun_kredit: "Modal Pemilik", nominal_jurnal: 25000000, keterangan_jurnal: "Tambahan setoran modal awal ekspansi dekorasi" },
            { id_jurnal: "JRN-DEMO-2", tanggal_jurnal: "2026-08-25", no_referensi: "BKK-01", akun_debit: "Peralatan Wedding", akun_kredit: "Kas", nominal_jurnal: 18000000, keterangan_jurnal: "Pembelian sound system portable & standing flower besi" },
            { id_jurnal: "JRN-DEMO-3", tanggal_jurnal: "2026-09-18", no_referensi: "BKK-02", akun_debit: "Beban Perlengkapan & Dekorasi", akun_kredit: "Kas", nominal_jurnal: 22500000, keterangan_jurnal: "Pembayaran vendor bunga segar & lighting acara Clarissa & Dimas" },
            { id_jurnal: "JRN-DEMO-4", tanggal_jurnal: "2026-09-20", no_referensi: "BKK-03", akun_debit: "Beban Crew & Freelance", akun_kredit: "Kas", nominal_jurnal: 8500000, keterangan_jurnal: "Honor 10 crew WO, koordinator lapangan & MC acara #201" },
            { id_jurnal: "JRN-DEMO-5", tanggal_jurnal: "2026-10-12", no_referensi: "BKK-04", akun_debit: "Beban Operasional & Transportasi", akun_kredit: "Kas", nominal_jurnal: 4200000, keterangan_jurnal: "BBM operasional, survey venue & administrasi kantor" },
            { id_jurnal: "JRN-DEMO-6", tanggal_jurnal: "2026-10-19", no_referensi: "BKK-05", akun_debit: "Beban Pemasaran & Promosi", akun_kredit: "Kas", nominal_jurnal: 3500000, keterangan_jurnal: "Promosi digital, katalog cetak & bridal expo" },
            { id_jurnal: "JRN-DEMO-7", tanggal_jurnal: "2026-11-05", no_referensi: "BKK-06", akun_debit: "Prive Pemilik", akun_kredit: "Kas", nominal_jurnal: 5000000, keterangan_jurnal: "Penarikan prive pemilik untuk keperluan pribadi" }
        ]
    };
}

function simpanSimulasiKeStorage() {
    localStorage.setItem(STORAGE_DEMO_DATA, JSON.stringify({
        pelanggan: state.pelanggan,
        paket: state.paket,
        transaksi: state.transaksi,
        pembayaran: state.pembayaran,
        jurnalManual: state.jurnalManual
    }));
}

function muatSimulasiKeState(data) {
    state.pelanggan = data.pelanggan || [];
    state.paket = data.paket || [];
    state.transaksi = data.transaksi || [];
    state.pembayaran = data.pembayaran || [];
    state.jurnalManual = data.jurnalManual || [];
    state.isDemoMode = true;
}

function resetKeDataSimulasiDefault() {
    const fresh = buatDataSimulasiDefault();
    muatSimulasiKeState(fresh);
    state.modalAwal = 50000000;
    localStorage.setItem(STORAGE_MODAL_AWAL, String(state.modalAwal));
    simpanSimulasiKeStorage();
    renderSemua();
}

function angka(nilai) {
    const n = Number(nilai);
    return Number.isFinite(n) ? n : 0;
}

function rupiah(nilai) {
    return "Rp" + Math.round(angka(nilai)).toLocaleString("id-ID");
}

function kurungRupiah(nilai) {
    const absVal = Math.abs(Math.round(angka(nilai)));
    return `(Rp${absVal.toLocaleString("id-ID")})`;
}

function escapeHTML(teks) {
    return String(teks ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function tanggalIndonesia(tanggal) {
    if (!tanggal) return "-";
    const d = new Date(tanggal);
    return Number.isNaN(d.getTime())
        ? escapeHTML(tanggal)
        : d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

function formatNomorInvoice(idTransaksi) {
    return `INV-LUN-${String(idTransaksi).padStart(4, "0")}`;
}

async function querySupabase(table, options = {}) {
    const { method = "GET", params = "", body = null } = options;
    const url = `${SUPABASE_URL}/rest/v1/${table}${params}`;
    const headers = {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json"
    };
    if (method === "POST" || method === "PATCH") headers.Prefer = "return=representation";

    const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Supabase ${table} (${response.status}): ${errorText}`);
    }
    return method === "DELETE" ? null : response.json();
}

function muatJurnalManual() {
    try {
        const tersimpan = localStorage.getItem(STORAGE_JURNAL_MANUAL);
        return tersimpan ? JSON.parse(tersimpan) : [];
    } catch (e) {
        return [];
    }
}

function simpanJurnalManual() {
    localStorage.setItem(STORAGE_JURNAL_MANUAL, JSON.stringify(state.jurnalManual));
    if (state.isDemoMode) simpanSimulasiKeStorage();
}

function muatModalAwal() {
    const tersimpan = localStorage.getItem(STORAGE_MODAL_AWAL);
    if (tersimpan !== null && tersimpan !== "") {
        return angka(tersimpan);
    }
    return 50000000;
}

function getNamaPelanggan(id) {
    const item = state.pelanggan.find(p => String(p.id_pelanggan) === String(id));
    return item ? item.nama_pelanggan : "Pelanggan #" + id;
}

function getPelangganById(id) {
    return state.pelanggan.find(p => String(p.id_pelanggan) === String(id)) || null;
}

function getNamaPaket(id) {
    const item = state.paket.find(p => String(p.id_paket) === String(id));
    return item ? item.nama_paket : "Paket #" + id;
}

function getPaketById(id) {
    return state.paket.find(p => String(p.id_paket) === String(id)) || null;
}

function getTotalBayarTransaksi(idTransaksi) {
    return state.pembayaran
        .filter(p => String(p.id_transaksi) === String(idTransaksi))
        .reduce((sum, p) => sum + angka(p.jumlah_bayar), 0);
}

function getPiutang(transaksi) {
    if (transaksi.status === "Dibatalkan") return 0;
    const sisa = angka(transaksi.total_transaksi) - getTotalBayarTransaksi(transaksi.id_transaksi);
    return Math.max(sisa, 0);
}

function hitungUmurPiutang(transaksi) {
    const patokan = transaksi.tanggal_transaksi || transaksi.tanggal_acara;
    if (!patokan) return 15;
    const tgl = new Date(patokan);
    if (Number.isNaN(tgl.getTime())) return 15;
    const diffDays = Math.floor((Date.now() - tgl.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(diffDays, 0);
}

function hitungPenyisihanItem(transaksi) {
    const sisa = getPiutang(transaksi);
    if (sisa <= 0) return 0;
    const umur = hitungUmurPiutang(transaksi);
    if (umur > 60) return sisa * 0.20;
    if (umur > 30) return sisa * 0.10;
    return sisa * 0.05;
}

function hitungTotalPenyisihanPiutang() {
    return state.transaksi.reduce((sum, t) => sum + hitungPenyisihanItem(t), 0);
}

function setIsiTabel(idTbody, isiHTML, jumlahKolom) {
    const tbody = document.getElementById(idTbody);
    if (!tbody) return;
    tbody.innerHTML = isiHTML || `<tr><td colspan="${jumlahKolom}" class="empty-row">Belum ada data</td></tr>`;
}

function renderDashboard() {
    const totalKontrak = state.transaksi
        .filter(t => t.status !== "Dibatalkan")
        .reduce((sum, t) => sum + angka(t.total_transaksi), 0);
    const totalKasMasuk = state.pembayaran.reduce((sum, p) => sum + angka(p.jumlah_bayar), 0);
    const totalPiutang = state.transaksi.reduce((sum, t) => sum + getPiutang(t), 0);

    document.getElementById("total-pelanggan").textContent = state.pelanggan.length;
    document.getElementById("total-paket").textContent = state.paket.length;
    document.getElementById("total-transaksi").textContent = state.transaksi.length;
    document.getElementById("total-pendapatan").textContent = rupiah(totalKasMasuk);
    document.getElementById("total-piutang").textContent = rupiah(totalPiutang);

    const nilaiMax = Math.max(totalKontrak, totalKasMasuk, totalPiutang, 1);
    document.getElementById("bar-tagihan").style.width = `${(totalKontrak / nilaiMax) * 100}%`;
    document.getElementById("bar-pembayaran").style.width = `${(totalKasMasuk / nilaiMax) * 100}%`;
    document.getElementById("bar-piutang").style.width = `${(totalPiutang / nilaiMax) * 100}%`;

    document.getElementById("nilai-tagihan").textContent = rupiah(totalKontrak);
    document.getElementById("nilai-pembayaran").textContent = rupiah(totalKasMasuk);
    document.getElementById("nilai-piutang").textContent = rupiah(totalPiutang);

    renderGrafikKeuangan(totalKasMasuk, totalPiutang);
}

function renderGrafikKeuangan(kasMasuk, piutang) {
    const canvas = document.getElementById("keuanganChart");
    if (!canvas || typeof Chart === "undefined") return;
    const ctx = canvas.getContext("2d");
    if (grafikKeuangan) grafikKeuangan.destroy();

    grafikKeuangan = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Kas Masuk (Diterima)", "Sisa Piutang Usaha"],
            datasets: [{
                data: [Math.max(kasMasuk, 0), Math.max(piutang, 0)],
                backgroundColor: ["#2ca068", "#d66d8e"],
                borderColor: "#ffffff",
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: "62%",
            plugins: {
                legend: { position: "bottom", labels: { boxWidth: 12, padding: 14, font: { size: 12 } } }
            }
        }
    });
}

function renderPelanggan() {
    const keyword = (document.getElementById("search-pelanggan")?.value || "").toLowerCase().trim();
    const filtered = state.pelanggan.filter(p =>
        (p.nama_pelanggan || "").toLowerCase().includes(keyword) ||
        (p.no_telepon || "").toLowerCase().includes(keyword) ||
        (p.email || "").toLowerCase().includes(keyword) ||
        (p.alamat || "").toLowerCase().includes(keyword)
    );

    const html = filtered.map(p => `
        <tr>
            <td><strong>${escapeHTML(p.nama_pelanggan)}</strong></td>
            <td>${escapeHTML(p.no_telepon || "-")}</td>
            <td>${escapeHTML(p.email || "-")}</td>
            <td>${escapeHTML(p.alamat || "-")}</td>
            <td>
                <div class="action-group">
                    <button class="btn-sm" type="button" data-edit-pelanggan="${escapeHTML(p.id_pelanggan)}">Edit</button>
                    <button class="btn-sm btn-danger" type="button" data-hapus-pelanggan="${escapeHTML(p.id_pelanggan)}">Hapus</button>
                </div>
            </td>
        </tr>
    `).join("");

    setIsiTabel("tabel-pelanggan", html, 5);
}

function renderPaket() {
    const container = document.getElementById("paket-grid-container");
    if (!container) return;

    if (state.paket.length === 0) {
        container.innerHTML = `<p class="empty-row">Belum ada paket wedding</p>`;
        return;
    }

    container.innerHTML = state.paket.map(pkt => `
        <article class="paket-card">
            <div class="paket-top">
                <span class="paket-badge">PAKET WEDDING</span>
                <strong class="paket-price">${rupiah(pkt.harga)}</strong>
            </div>
            <h3>${escapeHTML(pkt.nama_paket)}</h3>
            <p>${escapeHTML(pkt.deskripsi || "Fasilitas lengkap sesuai kesepakatan.")}</p>
        </article>
    `).join("");
}

function renderTransaksi() {
    const keyword = (document.getElementById("search-transaksi")?.value || "").toLowerCase().trim();
    const filtered = state.transaksi.filter(t => {
        const namaPelanggan = getNamaPelanggan(t.id_pelanggan).toLowerCase();
        const namaPaket = getNamaPaket(t.id_paket).toLowerCase();
        const noInv = formatNomorInvoice(t.id_transaksi).toLowerCase();
        return String(t.id_transaksi).includes(keyword) ||
            noInv.includes(keyword) ||
            namaPelanggan.includes(keyword) ||
            namaPaket.includes(keyword) ||
            (t.status || "").toLowerCase().includes(keyword);
    });

    const html = filtered.map(t => {
        const sisa = getPiutang(t);
        const statusTampil = sisa === 0 && t.status !== "Dibatalkan" ? "Lunas" : t.status;
        return `
            <tr>
                <td><strong>${escapeHTML(formatNomorInvoice(t.id_transaksi))}</strong></td>
                <td>${escapeHTML(getNamaPelanggan(t.id_pelanggan))}</td>
                <td>${escapeHTML(getNamaPaket(t.id_paket))}</td>
                <td>${tanggalIndonesia(t.tanggal_acara)}</td>
                <td><strong>${rupiah(t.total_transaksi)}</strong></td>
                <td style="color:${sisa > 0 ? "#d84a5f" : "#198754"}; font-weight:700;">${rupiah(sisa)}</td>
                <td><span class="status-pill">${escapeHTML(statusTampil)}</span></td>
                <td>
                    <button class="btn-invoice-only" type="button" data-invoice-transaksi="${escapeHTML(t.id_transaksi)}">
                        <i class="fa-solid fa-file-invoice"></i> Invoice
                    </button>
                </td>
                <td>
                    <div class="action-group">
                        <button class="btn-sm" type="button" data-edit-transaksi="${escapeHTML(t.id_transaksi)}">Edit</button>
                        <button class="btn-sm btn-danger" type="button" data-hapus-transaksi="${escapeHTML(t.id_transaksi)}">Hapus</button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");

    setIsiTabel("tabel-transaksi", html, 9);
}

function renderPembayaran() {
    const keyword = (document.getElementById("search-pembayaran")?.value || "").toLowerCase().trim();
    const filtered = state.pembayaran.filter(p => {
        const trx = state.transaksi.find(t => String(t.id_transaksi) === String(p.id_transaksi));
        const namaPelanggan = trx ? getNamaPelanggan(trx.id_pelanggan).toLowerCase() : "";
        return String(p.id_transaksi).includes(keyword) ||
            namaPelanggan.includes(keyword) ||
            (p.metode_pembayaran || "").toLowerCase().includes(keyword) ||
            (p.keterangan || "").toLowerCase().includes(keyword);
    });

    const html = filtered.map(p => {
        const trx = state.transaksi.find(t => String(t.id_transaksi) === String(p.id_transaksi));
        const namaPelanggan = trx ? getNamaPelanggan(trx.id_pelanggan) : "-";
        return `
            <tr>
                <td><strong>#${escapeHTML(p.id_transaksi)}</strong></td>
                <td>${escapeHTML(namaPelanggan)}</td>
                <td>${tanggalIndonesia(p.tanggal_pembayaran)}</td>
                <td><strong style="color:#198754;">${rupiah(p.jumlah_bayar)}</strong></td>
                <td>${escapeHTML(p.metode_pembayaran || "-")}</td>
                <td>${escapeHTML(p.keterangan || "-")}</td>
                <td>
                    <div class="action-group">
                        <button class="btn-sm btn-danger" type="button" data-hapus-pembayaran="${escapeHTML(p.id_pembayaran)}">Hapus</button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");

    setIsiTabel("tabel-pembayaran", html, 7);
}

function renderPiutang() {
    const keyword = (document.getElementById("search-piutang")?.value || "").toLowerCase().trim();
    const daftarPiutang = state.transaksi.filter(t => {
        const sisa = getPiutang(t);
        const nama = getNamaPelanggan(t.id_pelanggan).toLowerCase();
        return sisa > 0 && (nama.includes(keyword) || String(t.id_transaksi).includes(keyword));
    });

    const totalBruto = daftarPiutang.reduce((sum, t) => sum + getPiutang(t), 0);
    const totalCadangan = daftarPiutang.reduce((sum, t) => sum + hitungPenyisihanItem(t), 0);
    const totalBersih = Math.max(totalBruto - totalCadangan, 0);

    document.getElementById("summary-total-piutang").textContent = rupiah(totalBruto);
    document.getElementById("summary-orang-piutang").textContent = `${daftarPiutang.length} Transaksi`;
    document.getElementById("summary-penyisihan").textContent = rupiah(totalCadangan);
    document.getElementById("summary-piutang-bersih").textContent = rupiah(totalBersih);

    const html = daftarPiutang.map(t => {
        const totalTagihan = angka(t.total_transaksi);
        const sudahBayar = getTotalBayarTransaksi(t.id_transaksi);
        const sisa = getPiutang(t);
        const persen = totalTagihan > 0 ? Math.min(Math.round((sudahBayar / totalTagihan) * 100), 100) : 0;
        const umur = hitungUmurPiutang(t);
        const pelanggan = getPelangganById(t.id_pelanggan);
        const noWa = (pelanggan?.no_telepon || "").replace(/[^0-9]/g, "");
        const waFormatted = noWa.startsWith("0") ? "62" + noWa.slice(1) : noWa;
        const pesanWA = encodeURIComponent(
            `Halo ${pelanggan?.nama_pelanggan || "Kak"}, pengingat tagihan ${formatNomorInvoice(t.id_transaksi)} di Lunelle Wedding. Sisa tagihan: ${rupiah(sisa)} dari total ${rupiah(totalTagihan)}. Terima kasih.`
        );
        const linkWA = waFormatted ? `https://wa.me/${waFormatted}?text=${pesanWA}` : "";

        return `
            <tr>
                <td><strong>#${escapeHTML(t.id_transaksi)}</strong></td>
                <td><strong>${escapeHTML(getNamaPelanggan(t.id_pelanggan))}</strong><br><small style="color:#888;">Umur: ${umur} hari</small></td>
                <td>${rupiah(totalTagihan)}</td>
                <td>
                    <div style="font-size:11px; margin-bottom:4px;">${persen}% (${rupiah(sudahBayar)})</div>
                    <div class="chart-track" style="height:8px;"><div class="chart-bar pembayaran" style="width:${persen}%;"></div></div>
                </td>
                <td><strong style="color:#d84a5f;">${rupiah(sisa)}</strong></td>
                <td>
                    <div class="action-group">
                        ${linkWA ? `<a href="${linkWA}" target="_blank" rel="noopener" class="btn-sm" style="text-decoration:none; color:#15803d; border-color:#bbf7d0; background:#f0fdf4;"><i class="fa-brands fa-whatsapp"></i> WA</a>` : `<span style="font-size:11px; color:#999;">No. WA kosong</span>`}
                    </div>
                </td>
            </tr>
        `;
    }).join("");

    setIsiTabel("tabel-piutang", html, 6);
}

function susunDaftarJurnal() {
    const entri = [];

    state.transaksi.forEach(t => {
        if (t.status === "Dibatalkan") return;
        const total = angka(t.total_transaksi);
        if (total <= 0) return;
        const nama = getNamaPelanggan(t.id_pelanggan);
        const inv = formatNomorInvoice(t.id_transaksi);

        entri.push({
            jenis: "transaksi",
            tanggal: t.tanggal_transaksi || t.tanggal_acara,
            ref: inv,
            akunDebit: "Piutang Usaha",
            akunKredit: "Pendapatan Jasa Wedding",
            nominal: total,
            keterangan: `Kontrak paket ${getNamaPaket(t.id_paket)} - ${nama}`
        });
    });

    state.pembayaran.forEach(p => {
        const jumlah = angka(p.jumlah_bayar);
        if (jumlah <= 0) return;
        const trx = state.transaksi.find(t => String(t.id_transaksi) === String(p.id_transaksi));
        const nama = trx ? getNamaPelanggan(trx.id_pelanggan) : `Trx #${p.id_transaksi}`;

        entri.push({
            jenis: "pembayaran",
            tanggal: p.tanggal_pembayaran,
            ref: `PAY-${p.id_pembayaran}`,
            akunDebit: "Kas",
            akunKredit: "Piutang Usaha",
            nominal: jumlah,
            keterangan: `${p.keterangan || "Penerimaan pembayaran"} (${nama}) via ${p.metode_pembayaran || "-"}`
        });
    });

    state.jurnalManual.forEach(j => {
        const nominal = angka(j.nominal_jurnal);
        if (nominal <= 0) return;
        entri.push({
            jenis: "manual",
            tanggal: j.tanggal_jurnal,
            ref: j.no_referensi || j.id_jurnal || "JRN",
            akunDebit: j.akun_debit,
            akunKredit: j.akun_kredit,
            nominal,
            keterangan: j.keterangan_jurnal
        });
    });

    const cadangan = hitungTotalPenyisihanPiutang();
    if (cadangan > 0) {
        entri.push({
            jenis: "manual",
            tanggal: new Date().toISOString().slice(0, 10),
            ref: "ADJ-AGING",
            akunDebit: "Beban Kerugian Piutang",
            akunKredit: "Cadangan Kerugian Piutang",
            nominal: cadangan,
            keterangan: "Estimasi penyisihan kerugian piutang berdasarkan umur piutang"
        });
    }

    return entri.sort((a, b) => String(a.tanggal || "").localeCompare(String(b.tanggal || "")));
}

function renderJurnal() {
    const keyword = (document.getElementById("search-jurnal")?.value || "").toLowerCase().trim();
    const filterJenis = document.getElementById("filter-jenis-jurnal")?.value || "all";
    const semuaEntri = susunDaftarJurnal();

    const totalDebit = semuaEntri.reduce((sum, item) => sum + angka(item.nominal), 0);
    const totalKredit = totalDebit;
    const selisih = Math.abs(totalDebit - totalKredit);

    document.getElementById("jurnal-total-debit").textContent = rupiah(totalDebit);
    document.getElementById("jurnal-total-kredit").textContent = rupiah(totalKredit);
    document.getElementById("jurnal-status-balance").textContent = selisih === 0 ? "Seimbang (Balance)" : "Tidak Seimbang";
    document.getElementById("jurnal-selisih").textContent = `Selisih: ${rupiah(selisih)}`;

    const filtered = semuaEntri.filter(item => {
        const cocokJenis = filterJenis === "all" || item.jenis === filterJenis;
        const cocokTeks = !keyword ||
            (item.akunDebit || "").toLowerCase().includes(keyword) ||
            (item.akunKredit || "").toLowerCase().includes(keyword) ||
            (item.ref || "").toLowerCase().includes(keyword) ||
            (item.keterangan || "").toLowerCase().includes(keyword);
        return cocokJenis && cocokTeks;
    });

    const html = filtered.map(item => `
        <tr style="background:#fdf9fa;">
            <td>${tanggalIndonesia(item.tanggal)}</td>
            <td><strong>${escapeHTML(item.ref)}</strong></td>
            <td><strong>${escapeHTML(item.akunDebit)}</strong></td>
            <td style="text-align:right; font-weight:700; color:#1d4ed8;">${rupiah(item.nominal)}</td>
            <td style="text-align:right;">-</td>
        </tr>
        <tr>
            <td></td>
            <td></td>
            <td style="padding-left:28px;">
                ${escapeHTML(item.akunKredit)}<br>
                <small style="color:#7e6870;"><em>${escapeHTML(item.keterangan)}</em></small>
            </td>
            <td style="text-align:right;">-</td>
            <td style="text-align:right; font-weight:700; color:#be185d;">${rupiah(item.nominal)}</td>
        </tr>
    `).join("");

    setIsiTabel("tabel-jurnal", html, 5);
}

function renderLaporan() {
    const hariIniTeks = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    const tahunTeks = `31 Desember ${new Date().getFullYear()}`;

    document.querySelectorAll(".tanggal-cetak-teks").forEach(el => el.textContent = hariIniTeks);
    document.querySelectorAll(".periode-laporan-teks").forEach(el => el.textContent = tahunTeks);

    const pendapatanJasa = state.transaksi
        .filter(t => t.status !== "Dibatalkan")
        .reduce((sum, t) => sum + angka(t.total_transaksi), 0);
    const kasMasukPelanggan = state.pembayaran.reduce((sum, p) => sum + angka(p.jumlah_bayar), 0);
    const piutangBruto = state.transaksi.reduce((sum, t) => sum + getPiutang(t), 0);
    const cadanganPiutang = hitungTotalPenyisihanPiutang();
    const piutangNeto = Math.max(piutangBruto - cadanganPiutang, 0);

    const kelompokBeban = {};
    let totalBebanManual = 0;
    let totalPrive = 0;
    let totalUtang = 0;
    let setoranModalJurnal = 0;
    let arusKasInvestasi = 0;
    let nilaiAsetTetap = 0;

    state.jurnalManual.forEach(jrn => {
        const nominal = angka(jrn.nominal_jurnal);
        const debitLower = (jrn.akun_debit || "").toLowerCase();
        const kreditLower = (jrn.akun_kredit || "").toLowerCase();

        if (debitLower.includes("beban") && !debitLower.includes("kerugian piutang")) {
            const namaAkun = jrn.akun_debit.trim();
            kelompokBeban[namaAkun] = (kelompokBeban[namaAkun] || 0) + nominal;
            totalBebanManual += nominal;
        }
        if (debitLower.includes("prive")) totalPrive += nominal;
        if (kreditLower.includes("utang")) totalUtang += nominal;
        if (debitLower.includes("utang")) totalUtang -= nominal;
        if (kreditLower.includes("modal")) setoranModalJurnal += nominal;

        if (debitLower.includes("peralatan") || debitLower.includes("aset tetap")) {
            arusKasInvestasi -= nominal;
            nilaiAsetTetap += nominal;
        }
        if (kreditLower.includes("peralatan") || kreditLower.includes("aset tetap")) {
            arusKasInvestasi += nominal;
            nilaiAsetTetap -= nominal;
        }
    });

    totalUtang = Math.max(totalUtang, 0);
    nilaiAsetTetap = Math.max(nilaiAsetTetap, 0);

    // 1. Laporan Laba Rugi
    const totalBeban = totalBebanManual + cadanganPiutang;
    const labaBersih = pendapatanJasa - totalBeban;

    const elPendapatanJasa = document.getElementById("lr-pendapatan-jasa");
    const elTotalPendapatan = document.getElementById("lr-total-pendapatan");
    const elBebanPenyisihan = document.getElementById("lr-beban-penyisihan");
    const elTotalBeban = document.getElementById("lr-total-beban");
    const elLabaBersih = document.getElementById("lr-laba-bersih");
    const tbodyBeban = document.getElementById("lr-daftar-beban");

    if (elPendapatanJasa) elPendapatanJasa.textContent = rupiah(pendapatanJasa);
    if (elTotalPendapatan) elTotalPendapatan.textContent = rupiah(pendapatanJasa);
    if (tbodyBeban) {
        const entriBeban = Object.entries(kelompokBeban);
        tbodyBeban.innerHTML = entriBeban.length === 0
            ? `<tr class="indent"><td style="color:#8c737b;"><em>Belum ada jurnal beban operasional dicatat</em></td><td class="nominal">Rp0</td></tr>`
            : entriBeban.map(([akun, nom]) => `<tr class="indent"><td>${escapeHTML(akun)}</td><td class="nominal">${rupiah(nom)}</td></tr>`).join("");
    }
    if (elBebanPenyisihan) elBebanPenyisihan.textContent = rupiah(cadanganPiutang);
    if (elTotalBeban) elTotalBeban.textContent = rupiah(totalBeban);
    if (elLabaBersih) {
        elLabaBersih.textContent = labaBersih < 0 ? kurungRupiah(labaBersih) : rupiah(labaBersih);
        elLabaBersih.style.color = labaBersih < 0 ? "#dc2626" : "#15803d";
    }

    // 2. Laporan Perubahan Ekuitas
    const modalAwalTotal = state.modalAwal + setoranModalJurnal;
    const kenaikanEkuitas = labaBersih - totalPrive;
    const modalAkhir = modalAwalTotal + kenaikanEkuitas;

    if (document.getElementById("pe-modal-awal")) document.getElementById("pe-modal-awal").textContent = rupiah(modalAwalTotal);
    if (document.getElementById("pe-laba-bersih")) document.getElementById("pe-laba-bersih").textContent = labaBersih < 0 ? kurungRupiah(labaBersih) : rupiah(labaBersih);
    if (document.getElementById("pe-prive")) document.getElementById("pe-prive").textContent = kurungRupiah(totalPrive);
    if (document.getElementById("pe-kenaikan-ekuitas")) document.getElementById("pe-kenaikan-ekuitas").textContent = kenaikanEkuitas < 0 ? kurungRupiah(kenaikanEkuitas) : rupiah(kenaikanEkuitas);
    if (document.getElementById("pe-modal-akhir")) document.getElementById("pe-modal-akhir").textContent = rupiah(modalAkhir);

    // 3. Laporan Arus Kas Standar (Operasi, Investasi, Pendanaan, Kenaikan Kas, Kas Awal & Akhir)
    const arusKasOperasi = kasMasukPelanggan - totalBebanManual;
    const arusKasPendanaan = setoranModalJurnal - totalPrive;
    const kenaikanBersihKas = arusKasOperasi + arusKasInvestasi + arusKasPendanaan;
    const kasAwalPeriode = state.modalAwal;
    const saldoKasAkhirArusKas = kasAwalPeriode + kenaikanBersihKas;

    if (document.getElementById("ak-kas-masuk")) document.getElementById("ak-kas-masuk").textContent = rupiah(kasMasukPelanggan);
    if (document.getElementById("ak-kas-keluar-beban")) document.getElementById("ak-kas-keluar-beban").textContent = kurungRupiah(totalBebanManual);
    if (document.getElementById("ak-operasi-bersih")) document.getElementById("ak-operasi-bersih").textContent = arusKasOperasi < 0 ? kurungRupiah(arusKasOperasi) : rupiah(arusKasOperasi);

    if (document.getElementById("ak-kas-investasi")) document.getElementById("ak-kas-investasi").textContent = arusKasInvestasi < 0 ? kurungRupiah(arusKasInvestasi) : rupiah(arusKasInvestasi);
    if (document.getElementById("ak-investasi-bersih")) document.getElementById("ak-investasi-bersih").textContent = arusKasInvestasi < 0 ? kurungRupiah(arusKasInvestasi) : rupiah(arusKasInvestasi);

    if (document.getElementById("ak-modal-setoran")) document.getElementById("ak-modal-setoran").textContent = rupiah(setoranModalJurnal);
    if (document.getElementById("ak-prive")) document.getElementById("ak-prive").textContent = kurungRupiah(totalPrive);
    if (document.getElementById("ak-pendanaan-bersih")) document.getElementById("ak-pendanaan-bersih").textContent = arusKasPendanaan < 0 ? kurungRupiah(arusKasPendanaan) : rupiah(arusKasPendanaan);

    if (document.getElementById("ak-kenaikan-bersih")) document.getElementById("ak-kenaikan-bersih").textContent = kenaikanBersihKas < 0 ? kurungRupiah(kenaikanBersihKas) : rupiah(kenaikanBersihKas);
    if (document.getElementById("ak-kas-awal")) document.getElementById("ak-kas-awal").textContent = rupiah(kasAwalPeriode);
    if (document.getElementById("ak-saldo-akhir")) document.getElementById("ak-saldo-akhir").textContent = rupiah(saldoKasAkhirArusKas);

    // 4. Laporan Posisi Keuangan (Neraca)
    const saldoKasAkhir = saldoKasAkhirArusKas;
    const totalAset = saldoKasAkhir + piutangNeto + nilaiAsetTetap;
    const totalPasiva = totalUtang + modalAkhir;

    if (document.getElementById("nr-kas")) document.getElementById("nr-kas").textContent = rupiah(saldoKasAkhir);
    if (document.getElementById("nr-piutang-bruto")) document.getElementById("nr-piutang-bruto").textContent = rupiah(piutangBruto);
    if (document.getElementById("nr-cadangan-piutang")) document.getElementById("nr-cadangan-piutang").textContent = kurungRupiah(cadanganPiutang);
    if (document.getElementById("nr-piutang-neto")) document.getElementById("nr-piutang-neto").textContent = rupiah(piutangNeto);
    if (document.getElementById("nr-aset-tetap")) document.getElementById("nr-aset-tetap").textContent = rupiah(nilaiAsetTetap);
    if (document.getElementById("nr-total-aset")) document.getElementById("nr-total-aset").textContent = rupiah(totalAset);
    if (document.getElementById("nr-liabilitas")) document.getElementById("nr-liabilitas").textContent = rupiah(totalUtang);
    if (document.getElementById("nr-ekuitas-akhir")) document.getElementById("nr-ekuitas-akhir").textContent = rupiah(modalAkhir);
    if (document.getElementById("nr-total-pasiva")) document.getElementById("nr-total-pasiva").textContent = rupiah(totalPasiva);

    const elNrBalance = document.getElementById("nr-status-balance");
    if (elNrBalance) {
        const isBalance = Math.round(totalAset) === Math.round(totalPasiva);
        elNrBalance.textContent = isBalance
            ? "✓ Posisi Keuangan Seimbang (Total Aset = Total Liabilitas & Ekuitas)"
            : `⚠ Selisih Neraca: ${rupiah(Math.abs(totalAset - totalPasiva))}`;
    }

    const rowsKasHTML = state.pembayaran.map(item => {
        const trx = state.transaksi.find(t => String(t.id_transaksi) === String(item.id_transaksi));
        const nama = trx ? getNamaPelanggan(trx.id_pelanggan) : "-";
        return `
            <tr>
                <td><strong>#${escapeHTML(item.id_transaksi)}</strong></td>
                <td>${escapeHTML(nama)}</td>
                <td>${tanggalIndonesia(item.tanggal_pembayaran)}</td>
                <td>${escapeHTML(item.metode_pembayaran)}</td>
                <td>${escapeHTML(item.keterangan)}</td>
                <td style="text-align:right; font-weight:700; color:#198754;">${rupiah(item.jumlah_bayar)}</td>
            </tr>
        `;
    }).join("");
    setIsiTabel("tabel-laporan-kas", rowsKasHTML, 6);
}

function isiPilihanTransaksi() {
    const selectPelanggan = document.getElementById("pilih-pelanggan");
    const selectPaket = document.getElementById("pilih-paket");
    const selectTransaksi = document.getElementById("pilih-transaksi");

    if (selectPelanggan) {
        selectPelanggan.innerHTML = `<option value="">Pilih pelanggan</option>` +
            state.pelanggan.map(p => `<option value="${escapeHTML(p.id_pelanggan)}">${escapeHTML(p.nama_pelanggan)}</option>`).join("");
    }
    if (selectPaket) {
        selectPaket.innerHTML = `<option value="">Pilih paket</option>` +
            state.paket.map(pkt => `<option value="${escapeHTML(pkt.id_paket)}" data-harga="${angka(pkt.harga)}">${escapeHTML(pkt.nama_paket)} (${rupiah(pkt.harga)})</option>`).join("");
    }
    if (selectTransaksi) {
        selectTransaksi.innerHTML = `<option value="">Pilih transaksi</option>` +
            state.transaksi.map(t => `<option value="${escapeHTML(t.id_transaksi)}">#${escapeHTML(t.id_transaksi)} - ${escapeHTML(getNamaPelanggan(t.id_pelanggan))} (Sisa: ${rupiah(getPiutang(t))})</option>`).join("");
    }
}

function renderSemua() {
    renderDashboard();
    renderPelanggan();
    renderPaket();
    renderTransaksi();
    renderPembayaran();
    renderPiutang();
    renderJurnal();
    renderLaporan();
    isiPilihanTransaksi();
}

function bukaInvoiceModal(idTransaksi) {
    const trx = state.transaksi.find(t => String(t.id_transaksi) === String(idTransaksi));
    if (!trx) return;

    const pelanggan = getPelangganById(trx.id_pelanggan);
    const paket = getPaketById(trx.id_paket);
    const riwayatBayar = state.pembayaran.filter(p => String(p.id_transaksi) === String(trx.id_transaksi));
    const totalKontrak = angka(trx.total_transaksi);
    const totalBayar = riwayatBayar.reduce((sum, p) => sum + angka(p.jumlah_bayar), 0);
    const sisaTagihan = Math.max(totalKontrak - totalBayar, 0);
    const isLunas = sisaTagihan === 0 && trx.status !== "Dibatalkan";

    document.getElementById("inv-number").textContent = formatNomorInvoice(trx.id_transaksi);
    document.getElementById("inv-issue-date").textContent = tanggalIndonesia(trx.tanggal_transaksi || new Date().toISOString().slice(0, 10));
    document.getElementById("inv-event-date").textContent = tanggalIndonesia(trx.tanggal_acara);

    const badge = document.getElementById("inv-status-badge");
    badge.textContent = isLunas ? "LUNAS" : (trx.status || "BELUM LUNAS");
    badge.className = `inv-status-stamp ${isLunas ? "lunas" : "belum"}`;

    document.getElementById("inv-client-name").textContent = pelanggan?.nama_pelanggan || getNamaPelanggan(trx.id_pelanggan);
    document.getElementById("inv-client-phone").textContent = `Telp/WA: ${pelanggan?.no_telepon || "-"}`;
    document.getElementById("inv-client-email").textContent = `Email: ${pelanggan?.email || "-"}`;
    document.getElementById("inv-client-address").textContent = `Alamat: ${pelanggan?.alamat || "-"}`;

    const namaPaket = paket?.nama_paket || getNamaPaket(trx.id_paket);
    const hargaPaket = paket ? angka(paket.harga) : totalKontrak;

    document.getElementById("inv-package-name").textContent = namaPaket;
    document.getElementById("inv-package-desc").textContent = paket?.deskripsi || "Layanan Wedding Organizer sesuai kontrak.";
    document.getElementById("inv-package-price").textContent = rupiah(hargaPaket);
    document.getElementById("inv-package-total").textContent = rupiah(totalKontrak);

    const tbodyBayar = document.getElementById("inv-payment-history");
    tbodyBayar.innerHTML = riwayatBayar.length === 0
        ? `<tr><td colspan="4" style="text-align:center; color:#888;">Belum ada pembayaran diterima</td></tr>`
        : riwayatBayar.map(b => `
            <tr>
                <td>${tanggalIndonesia(b.tanggal_pembayaran)}</td>
                <td>${escapeHTML(b.metode_pembayaran || "-")}</td>
                <td>${escapeHTML(b.keterangan || "-")}</td>
                <td style="text-align:right; white-space:nowrap; font-weight:600; color:#15803d;">${rupiah(b.jumlah_bayar)}</td>
            </tr>
        `).join("");

    document.getElementById("inv-subtotal").textContent = rupiah(totalKontrak);
    document.getElementById("inv-paid").textContent = rupiah(totalBayar);
    document.getElementById("inv-balance").textContent = rupiah(sisaTagihan);

    document.getElementById("invoice-modal").classList.remove("hidden");
}

function tutupInvoiceModal() {
    document.getElementById("invoice-modal").classList.add("hidden");
}

function cetakInvoiceDariModal() {
    const area = document.getElementById("invoice-printable-area");
    if (!area) return;

    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) {
        window.print();
        return;
    }

    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <title>Cetak Invoice - Lunelle Wedding</title>
            <style>
                * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 24px; color: #222; background: #fff; }
                .inv-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; border-bottom: 2px solid #d66d8e; padding-bottom: 16px; margin-bottom: 20px; }
                .inv-brand h2 { margin: 0; color: #a84464; font-size: 22px; }
                .inv-brand p { margin: 3px 0 0; font-size: 12px; color: #555; }
                .inv-meta { text-align: right; }
                .inv-meta h1 { margin: 0 0 6px; font-size: 24px; letter-spacing: 0.1em; }
                .inv-meta p { margin: 2px 0; font-size: 12px; }
                .inv-status-stamp { display: inline-block; margin-top: 6px; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 800; }
                .inv-status-stamp.lunas { background: #dcfce7; color: #15803d; border: 1.5px solid #16a34a; }
                .inv-status-stamp.belum { background: #fef3c7; color: #b45309; border: 1.5px solid #d97706; }
                .inv-grid-info { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; font-size: 12.5px; }
                .inv-info-box { background: #fdf9fa; border: 1px solid #f1dfe5; border-radius: 8px; padding: 12px 14px; }
                .inv-info-box h4 { margin: 0 0 6px; font-size: 11px; text-transform: uppercase; color: #9e7b86; }
                .inv-info-box p { margin: 3px 0; }
                .inv-table { width: 100%; border-collapse: collapse; margin-bottom: 18px; font-size: 12px; }
                .inv-table th { background: #fdf2f6; color: #7d3149; text-align: left; padding: 9px 10px; border-top: 1px solid #e5c6d0; border-bottom: 1px solid #e5c6d0; }
                .inv-table td { padding: 9px 10px; border-bottom: 1px solid #f2e6ea; vertical-align: top; }
                .inv-bottom-grid { display: grid; grid-template-columns: 1.35fr 0.9fr; gap: 22px; align-items: start; }
                .inv-summary { background: #fdf9fa; border: 1px solid #edd6de; border-radius: 8px; padding: 14px 16px; font-size: 12.5px; }
                .inv-summary-row { display: flex; justify-content: space-between; gap: 12px; padding: 7px 0; border-bottom: 1px dashed #e3ced5; }
                .inv-summary-row:last-child { border-bottom: none; }
                .inv-summary-row.total { font-weight: 800; font-size: 14px; color: #a84464; border-top: 2px solid #222; border-bottom: 2px solid #222; padding: 9px 0; margin-top: 4px; }
                .inv-footer { margin-top: 32px; padding-top: 14px; border-top: 1px solid #eee; display: flex; justify-content: space-between; align-items: flex-end; font-size: 12px; color: #555; }
                @page { size: A4; margin: 1.2cm; }
            </style>
        </head>
        <body>
            ${area.innerHTML}
            <script>window.onload = function() { window.print(); };<\/script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

async function muatSemuaData() {
    if (sedangMemuat) return;
    sedangMemuat = true;
    state.modalAwal = muatModalAwal();
    state.jurnalManual = muatJurnalManual();

    try {
        const [pelanggan, paket, transaksi, pembayaran] = await Promise.all([
            querySupabase("pelanggan", { params: "?select=*&order=id_pelanggan.asc" }),
            querySupabase("paket_wedding", { params: "?select=*&order=id_paket.asc" }),
            querySupabase("transaksi", { params: "?select=*&order=id_transaksi.desc" }),
            querySupabase("pembayaran", { params: "?select=*&order=id_pembayaran.desc" })
        ]);

        const adaDataDiSupabase =
            (pelanggan && pelanggan.length > 0) ||
            (paket && paket.length > 0) ||
            (transaksi && transaksi.length > 0) ||
            (pembayaran && pembayaran.length > 0);

        if (adaDataDiSupabase) {
            state.pelanggan = pelanggan || [];
            state.paket = paket || [];
            state.transaksi = transaksi || [];
            state.pembayaran = pembayaran || [];
            state.isDemoMode = false;
            if (state.jurnalManual.length === 0) {
                state.jurnalManual = buatDataSimulasiDefault().jurnalManual;
                simpanJurnalManual();
            }
        } else {
            const tersimpanDemo = localStorage.getItem(STORAGE_DEMO_DATA);
            if (tersimpanDemo) {
                muatSimulasiKeState(JSON.parse(tersimpanDemo));
            } else {
                const defaultDemo = buatDataSimulasiDefault();
                muatSimulasiKeState(defaultDemo);
                simpanSimulasiKeStorage();
            }
        }
    } catch (error) {
        console.warn("Menggunakan mode data simulasi lokal:", error.message);
        const tersimpanDemo = localStorage.getItem(STORAGE_DEMO_DATA);
        if (tersimpanDemo) {
            muatSimulasiKeState(JSON.parse(tersimpanDemo));
        } else {
            const defaultDemo = buatDataSimulasiDefault();
            muatSimulasiKeState(defaultDemo);
            simpanSimulasiKeStorage();
        }
    } finally {
        sedangMemuat = false;
        renderSemua();
    }
}

function pindahHalaman(namaHalaman) {
    document.querySelectorAll(".page").forEach(page => page.classList.remove("active"));
    document.querySelectorAll(".nav-link").forEach(link => link.classList.remove("active"));

    const target = document.getElementById(`${namaHalaman}-page`);
    const navAktif = document.querySelector(`.nav-link[data-page="${namaHalaman}"]`);
    if (target) target.classList.add("active");
    if (navAktif) navAktif.classList.add("active");

    const judulHalaman = {
        dashboard: "Dashboard",
        pelanggan: "Data Pelanggan",
        paket: "Paket Wedding",
        transaksi: "Transaksi & Invoice",
        pembayaran: "Penerimaan Pembayaran",
        piutang: "Buku Piutang",
        jurnal: "Jurnal Umum",
        laporan: "Laporan Keuangan (SAK)"
    };
    document.getElementById("page-title").textContent = judulHalaman[namaHalaman] || "SIAWO";
    renderSemua();
}

function pasangEventListener() {
    document.querySelectorAll(".nav-link[data-page]").forEach(link => {
        link.addEventListener("click", event => {
            event.preventDefault();
            pindahHalaman(link.dataset.page);
        });
    });

    document.querySelectorAll("[data-go]").forEach(btn => {
        btn.addEventListener("click", () => pindahHalaman(btn.dataset.go));
    });

    document.getElementById("btn-muat-simulasi")?.addEventListener("click", () => {
        resetKeDataSimulasiDefault();
        alert("Data simulasi lengkap Lunelle Wedding telah dimuat ulang!");
    });

    document.querySelectorAll(".report-tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const tabKey = btn.dataset.reportTab;
            document.querySelectorAll(".report-tab-btn").forEach(b => b.classList.remove("active"));
            document.querySelectorAll(".report-panel").forEach(p => p.classList.remove("active"));
            btn.classList.add("active");
            document.getElementById(`panel-${tabKey}`)?.classList.add("active");
        });
    });

    document.getElementById("btn-close-invoice")?.addEventListener("click", tutupInvoiceModal);
    document.getElementById("btn-print-invoice")?.addEventListener("click", cetakInvoiceDariModal);
    document.getElementById("invoice-modal")?.addEventListener("click", e => {
        if (e.target.id === "invoice-modal") tutupInvoiceModal();
    });

    document.getElementById("tambah-pelanggan")?.addEventListener("click", () => {
        const form = document.getElementById("form-pelanggan");
        form.reset();
        form.elements.id_pelanggan.value = "";
        form.classList.remove("hidden");
    });

    document.getElementById("tambah-transaksi")?.addEventListener("click", () => {
        isiPilihanTransaksi();
        const form = document.getElementById("form-transaksi");
        form.reset();
        form.elements.id_transaksi.value = "";
        form.elements.tanggal_transaksi.value = new Date().toISOString().slice(0, 10);
        form.classList.remove("hidden");
    });

    document.getElementById("tambah-pembayaran")?.addEventListener("click", () => {
        isiPilihanTransaksi();
        const form = document.getElementById("form-pembayaran");
        form.reset();
        form.elements.id_pembayaran.value = "";
        form.elements.tanggal_pembayaran.value = new Date().toISOString().slice(0, 10);
        form.classList.remove("hidden");
    });

    document.getElementById("tambah-jurnal-manual")?.addEventListener("click", () => {
        const form = document.getElementById("form-jurnal");
        form.reset();
        form.elements.tanggal_jurnal.value = new Date().toISOString().slice(0, 10);
        form.classList.remove("hidden");
    });

    document.querySelectorAll("[data-cancel]").forEach(btn => {
        btn.addEventListener("click", () => {
            document.getElementById(`form-${btn.dataset.cancel}`)?.classList.add("hidden");
        });
    });

    document.getElementById("pilih-paket")?.addEventListener("change", event => {
        const terpilih = event.target.selectedOptions[0];
        const harga = terpilih?.dataset?.harga;
        const inputTotal = document.getElementById("total-transaksi-input");
        if (harga && inputTotal && !inputTotal.value) {
            inputTotal.value = harga;
        }
    });

    document.getElementById("search-pelanggan")?.addEventListener("input", renderPelanggan);
    document.getElementById("search-transaksi")?.addEventListener("input", renderTransaksi);
    document.getElementById("search-pembayaran")?.addEventListener("input", renderPembayaran);
    document.getElementById("search-piutang")?.addEventListener("input", renderPiutang);
    document.getElementById("search-jurnal")?.addEventListener("input", renderJurnal);
    document.getElementById("filter-jenis-jurnal")?.addEventListener("change", renderJurnal);

    document.getElementById("form-pelanggan")?.addEventListener("submit", async event => {
        event.preventDefault();
        const form = event.target;
        const id = form.elements.id_pelanggan.value;
        const payload = {
            nama_pelanggan: form.elements.nama_pelanggan.value.trim(),
            no_telepon: form.elements.no_telepon.value.trim(),
            email: form.elements.email.value.trim(),
            alamat: form.elements.alamat.value.trim()
        };

        try {
            if (state.isDemoMode) {
                if (id) {
                    const idx = state.pelanggan.findIndex(p => String(p.id_pelanggan) === String(id));
                    if (idx !== -1) state.pelanggan[idx] = { ...state.pelanggan[idx], ...payload };
                } else {
                    const nextId = Math.max(0, ...state.pelanggan.map(p => angka(p.id_pelanggan))) + 1;
                    state.pelanggan.push({ id_pelanggan: nextId, ...payload });
                }
                simpanSimulasiKeStorage();
                renderSemua();
            } else if (id) {
                await querySupabase("pelanggan", { method: "PATCH", params: `?id_pelanggan=eq.${encodeURIComponent(id)}`, body: payload });
                await muatSemuaData();
            } else {
                await querySupabase("pelanggan", { method: "POST", body: payload });
                await muatSemuaData();
            }
            form.classList.add("hidden");
            form.reset();
        } catch (err) {
            alert("Gagal menyimpan pelanggan: " + err.message);
        }
    });

    document.getElementById("form-transaksi")?.addEventListener("submit", async event => {
        event.preventDefault();
        const form = event.target;
        const id = form.elements.id_transaksi.value;
        const payload = {
            id_pelanggan: angka(form.elements.id_pelanggan.value),
            id_paket: angka(form.elements.id_paket.value),
            tanggal_transaksi: form.elements.tanggal_transaksi.value,
            tanggal_acara: form.elements.tanggal_acara.value,
            total_transaksi: angka(form.elements.total_transaksi.value),
            status: form.elements.status.value
        };

        try {
            if (state.isDemoMode) {
                if (id) {
                    const idx = state.transaksi.findIndex(t => String(t.id_transaksi) === String(id));
                    if (idx !== -1) state.transaksi[idx] = { ...state.transaksi[idx], ...payload };
                } else {
                    const nextId = Math.max(200, ...state.transaksi.map(t => angka(t.id_transaksi))) + 1;
                    state.transaksi.unshift({ id_transaksi: nextId, ...payload });
                }
                simpanSimulasiKeStorage();
                renderSemua();
            } else if (id) {
                await querySupabase("transaksi", { method: "PATCH", params: `?id_transaksi=eq.${encodeURIComponent(id)}`, body: payload });
                await muatSemuaData();
            } else {
                await querySupabase("transaksi", { method: "POST", body: payload });
                await muatSemuaData();
            }
            form.classList.add("hidden");
            form.reset();
        } catch (err) {
            alert("Gagal menyimpan transaksi: " + err.message);
        }
    });

    document.getElementById("form-pembayaran")?.addEventListener("submit", async event => {
        event.preventDefault();
        const form = event.target;
        const payload = {
            id_transaksi: angka(form.elements.id_transaksi.value),
            tanggal_pembayaran: form.elements.tanggal_pembayaran.value,
            jumlah_bayar: angka(form.elements.jumlah_bayar.value),
            metode_pembayaran: form.elements.metode_pembayaran.value,
            keterangan: form.elements.keterangan.value.trim()
        };

        try {
            if (state.isDemoMode) {
                const nextId = Math.max(300, ...state.pembayaran.map(p => angka(p.id_pembayaran))) + 1;
                state.pembayaran.unshift({ id_pembayaran: nextId, ...payload });
                const trx = state.transaksi.find(t => String(t.id_transaksi) === String(payload.id_transaksi));
                if (trx && getPiutang(trx) === 0) trx.status = "Lunas";
                simpanSimulasiKeStorage();
                renderSemua();
            } else {
                await querySupabase("pembayaran", { method: "POST", body: payload });
                const trx = state.transaksi.find(t => String(t.id_transaksi) === String(payload.id_transaksi));
                if (trx && getPiutang(trx) - payload.jumlah_bayar <= 0) {
                    await querySupabase("transaksi", {
                        method: "PATCH",
                        params: `?id_transaksi=eq.${encodeURIComponent(payload.id_transaksi)}`,
                        body: { status: "Lunas" }
                    });
                }
                await muatSemuaData();
            }
            form.classList.add("hidden");
            form.reset();
        } catch (err) {
            alert("Gagal menyimpan pembayaran: " + err.message);
        }
    });

    document.getElementById("form-jurnal")?.addEventListener("submit", event => {
        event.preventDefault();
        const form = event.target;
        const entriBaru = {
            id_jurnal: "JRN-" + Date.now(),
            tanggal_jurnal: form.elements.tanggal_jurnal.value,
            no_referensi: form.elements.no_referensi.value.trim() || "JRN-MAN",
            akun_debit: form.elements.akun_debit.value.trim(),
            akun_kredit: form.elements.akun_kredit.value.trim(),
            nominal_jurnal: angka(form.elements.nominal_jurnal.value),
            keterangan_jurnal: form.elements.keterangan_jurnal.value.trim()
        };

        state.jurnalManual.push(entriBaru);
        simpanJurnalManual();
        form.classList.add("hidden");
        form.reset();
        renderJurnal();
        renderLaporan();
    });

    document.addEventListener("click", async event => {
        const target = event.target.closest("button");
        if (!target) return;

        if (target.dataset.invoiceTransaksi) {
            bukaInvoiceModal(target.dataset.invoiceTransaksi);
            return;
        }

        if (target.dataset.editPelanggan) {
            const p = state.pelanggan.find(item => String(item.id_pelanggan) === String(target.dataset.editPelanggan));
            if (!p) return;
            const form = document.getElementById("form-pelanggan");
            form.elements.id_pelanggan.value = p.id_pelanggan;
            form.elements.nama_pelanggan.value = p.nama_pelanggan || "";
            form.elements.no_telepon.value = p.no_telepon || "";
            form.elements.email.value = p.email || "";
            form.elements.alamat.value = p.alamat || "";
            form.classList.remove("hidden");
            return;
        }

        if (target.dataset.hapusPelanggan) {
            if (!confirm("Hapus data pelanggan ini?")) return;
            const id = target.dataset.hapusPelanggan;
            if (state.isDemoMode) {
                state.pelanggan = state.pelanggan.filter(p => String(p.id_pelanggan) !== String(id));
                simpanSimulasiKeStorage();
                renderSemua();
            } else {
                await querySupabase("pelanggan", { method: "DELETE", params: `?id_pelanggan=eq.${encodeURIComponent(id)}` });
                await muatSemuaData();
            }
            return;
        }

        if (target.dataset.editTransaksi) {
            const t = state.transaksi.find(item => String(item.id_transaksi) === String(target.dataset.editTransaksi));
            if (!t) return;
            isiPilihanTransaksi();
            const form = document.getElementById("form-transaksi");
            form.elements.id_transaksi.value = t.id_transaksi;
            form.elements.id_pelanggan.value = t.id_pelanggan;
            form.elements.id_paket.value = t.id_paket;
            form.elements.tanggal_transaksi.value = (t.tanggal_transaksi || "").slice(0, 10);
            form.elements.tanggal_acara.value = (t.tanggal_acara || "").slice(0, 10);
            form.elements.total_transaksi.value = t.total_transaksi;
            form.elements.status.value = t.status;
            form.classList.remove("hidden");
            return;
        }

        if (target.dataset.hapusTransaksi) {
            if (!confirm("Hapus transaksi ini?")) return;
            const id = target.dataset.hapusTransaksi;
            if (state.isDemoMode) {
                state.transaksi = state.transaksi.filter(t => String(t.id_transaksi) !== String(id));
                simpanSimulasiKeStorage();
                renderSemua();
            } else {
                await querySupabase("transaksi", { method: "DELETE", params: `?id_transaksi=eq.${encodeURIComponent(id)}` });
                await muatSemuaData();
            }
            return;
        }

        if (target.dataset.hapusPembayaran) {
            if (!confirm("Hapus catatan pembayaran ini?")) return;
            const id = target.dataset.hapusPembayaran;
            if (state.isDemoMode) {
                state.pembayaran = state.pembayaran.filter(p => String(p.id_pembayaran) !== String(id));
                simpanSimulasiKeStorage();
                renderSemua();
            } else {
                await querySupabase("pembayaran", { method: "DELETE", params: `?id_pembayaran=eq.${encodeURIComponent(id)}` });
                await muatSemuaData();
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    pasangEventListener();
    muatSemuaData();
});
