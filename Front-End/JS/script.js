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
            {
                id_pelanggan: 101,
                nama_pelanggan: "Clarissa Putri & Dimas Pratama",
                no_telepon: "081234567890",
                email: "clarissa.dimas@gmail.com",
                alamat: "Jl. Pandanaran No. 45, Semarang"
            },
            {
                id_pelanggan: 102,
                nama_pelanggan: "Alya Rahma & Kevin Wijaya",
                no_telepon: "085711223344",
                email: "alya.kevin@gmail.com",
                alamat: "Jl. Sultan Agung No. 88, Semarang"
            },
            {
                id_pelanggan: 103,
                nama_pelanggan: "Nadia Kusuma & Reza Mahendra",
                no_telepon: "082199887766",
                email: "nadia.reza@gmail.com",
                alamat: "Perum Graha Estetika Blok C-12, Tembalang"
            },
            {
                id_pelanggan: 104,
                nama_pelanggan: "Salsa Maharani & Bagas Saputra",
                no_telepon: "081355667788",
                email: "salsa.bagas@gmail.com",
                alamat: "Jl. Pemuda No. 102, Semarang"
            }
        ],
        paket: [
            {
                id_paket: 1,
                nama_paket: "Intimate Garden Package",
                harga: 25000000,
                deskripsi: "Full WO Crew (6 orang), Dekorasi Akad & Resepsi Intimate (150 pax), MC, Makeup Pengantin, & Dokumentasi Foto."
            },
            {
                id_paket: 2,
                nama_paket: "Royal Elegance Package",
                harga: 45000000,
                deskripsi: "Full WO Crew (10 orang), Dekorasi Ballroom Mewah (300 pax), Band Akustik, Foto & Cinematic Video, serta Buku Tamu Digital."
            },
            {
                id_paket: 3,
                nama_paket: "Grand Luxury Wedding",
                harga: 75000000,
                deskripsi: "All-In Luxury Wedding (500 pax), Dekorasi Custom Full Bunga Segar, 12 Crew WO, Photobooth, Live Streaming, & Prewedding."
            }
        ],
        transaksi: [
            {
                id_transaksi: 201,
                id_pelanggan: 101,
                id_paket: 2,
                tanggal_transaksi: "2026-09-10",
                tanggal_acara: "2026-10-18",
                total_transaksi: 45000000,
                status: "Lunas"
            },
            {
                id_transaksi: 202,
                id_pelanggan: 102,
                id_paket: 3,
                tanggal_transaksi: "2026-10-05",
                tanggal_acara: "2026-11-12",
                total_transaksi: 75000000,
                status: "Berlangsung"
            },
            {
                id_transaksi: 203,
                id_pelanggan: 103,
                id_paket: 1,
                tanggal_transaksi: "2026-11-01",
                tanggal_acara: "2026-12-20",
                total_transaksi: 25000000,
                status: "Berlangsung"
            },
            {
                id_transaksi: 204,
                id_pelanggan: 104,
                id_paket: 2,
                tanggal_transaksi: "2026-11-15",
                tanggal_acara: "2027-01-24",
                total_transaksi: 45000000,
                status: "Menunggu Pembayaran"
            }
        ],
        pembayaran: [
            {
                id_pembayaran: 301,
                id_transaksi: 201,
                tanggal_pembayaran: "2026-09-12",
                jumlah_bayar: 15000000,
                metode_pembayaran: "Transfer Bank",
                keterangan: "Booking Fee & DP 1 (33%)"
            },
            {
                id_pembayaran: 302,
                id_transaksi: 201,
                tanggal_pembayaran: "2026-10-10",
                jumlah_bayar: 30000000,
                metode_pembayaran: "Transfer Bank",
                keterangan: "Pelunasan H-7 Acara"
            },
            {
                id_pembayaran: 303,
                id_transaksi: 202,
                tanggal_pembayaran: "2026-10-08",
                jumlah_bayar: 30000000,
                metode_pembayaran: "Transfer Bank",
                keterangan: "DP 40% Paket Grand Luxury"
            },
            {
                id_pembayaran: 304,
                id_transaksi: 202,
                tanggal_pembayaran: "2026-11-05",
                jumlah_bayar: 25000000,
                metode_pembayaran: "QRIS",
                keterangan: "Termin ke-2 (Sisa Rp20.000.000)"
            },
            {
                id_pembayaran: 305,
                id_transaksi: 203,
                tanggal_pembayaran: "2026-11-04",
                jumlah_bayar: 10000000,
                metode_pembayaran: "Transfer Bank",
                keterangan: "DP Awal 40% Intimate Package"
            }
        ],
        jurnalManual: [
            {
                id_jurnal: "JRN-DEMO-1",
                tanggal_jurnal: "2026-10-15",
                no_referensi: "BKK-001",
                akun_debit: "Beban Perlengkapan & Dekorasi",
                akun_kredit: "Kas",
                nominal_jurnal: 18500000,
                keterangan_jurnal: "Pembayaran vendor dekorasi bunga & lighting acara Clarissa & Dimas"
            },
            {
                id_jurnal: "JRN-DEMO-2",
                tanggal_jurnal: "2026-10-19",
                no_referensi: "BKK-002",
                akun_debit: "Beban Crew & Freelance",
                akun_kredit: "Kas",
                nominal_jurnal: 6500000,
                keterangan_jurnal: "Honorarium 10 crew WO, koordinator lapangan & MC"
            },
            {
                id_jurnal: "JRN-DEMO-3",
                tanggal_jurnal: "2026-11-10",
                no_referensi: "BKK-003",
                akun_debit: "Beban Operasional & Transportasi",
                akun_kredit: "Kas",
                nominal_jurnal: 2400000,
                keterangan_jurnal: "Biaya transportasi loading barang, konsumsi tim & administrasi kantor"
            }
        ]
    };
}

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

function kurungRupiah(nilai) {
    const val = angka(nilai);
    return val === 0 ? "Rp0" : `(${rupiah(Math.abs(val))})`;
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

function simpanDemoKeStorage() {
    if (!state.isDemoMode) return;
    try {
        localStorage.setItem(STORAGE_DEMO_DATA, JSON.stringify({
            pelanggan: state.pelanggan,
            paket: state.paket,
            transaksi: state.transaksi,
            pembayaran: state.pembayaran
        }));
    } catch (e) {
        console.error("Gagal menyimpan state demo:", e);
    }
}

function muatDataSimulasiSekarang(tampilkanNotif = true) {
    const demo = buatDataSimulasiDefault();
    state.pelanggan = demo.pelanggan;
    state.paket = demo.paket;
    state.transaksi = demo.transaksi;
    state.pembayaran = demo.pembayaran;
    state.jurnalManual = demo.jurnalManual;
    state.modalAwal = 50000000;
    state.isDemoMode = true;

    localStorage.setItem(STORAGE_JURNAL_MANUAL, JSON.stringify(state.jurnalManual));
    localStorage.setItem(STORAGE_MODAL_AWAL, String(state.modalAwal));
    simpanDemoKeStorage();

    const inputModal = document.getElementById("input-modal-awal");
    if (inputModal) inputModal.value = state.modalAwal;

    renderAll();
    if (tampilkanNotif) {
        tampilkanPesan("Data simulasi Lunelle Wedding berhasil dimuat ke seluruh modul & laporan!");
    }
}

function loadJurnalManual() {
    try {
        const raw = localStorage.getItem(STORAGE_JURNAL_MANUAL);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function simpanJurnalManualStorage() {
    try {
        localStorage.setItem(STORAGE_JURNAL_MANUAL, JSON.stringify(state.jurnalManual));
    } catch (error) {
        console.error("Gagal menyimpan jurnal manual:", error);
    }
}

function loadModalAwal() {
    const raw = localStorage.getItem(STORAGE_MODAL_AWAL);
    return raw !== null ? angka(raw) : 50000000;
}

function simpanModalAwal(nilai) {
    state.modalAwal = Math.max(angka(nilai), 0);
    localStorage.setItem(STORAGE_MODAL_AWAL, String(state.modalAwal));
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
            boxShadow: "0 4px 20px rgba(0,0,0,.15)",
            maxWidth: "min(390px, calc(100vw - 40px))",
            fontSize: "13.5px",
            fontWeight: "500"
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

        const rowsPelanggan = getRows(pelanggan);
        const rowsPaket = getRows(paket);
        const rowsTransaksi = getRows(transaksi);
        const rowsPembayaran = getRows(pembayaran);

        if (rowsPelanggan.length === 0 && rowsTransaksi.length === 0) {
            const savedDemoRaw = localStorage.getItem(STORAGE_DEMO_DATA);
            if (savedDemoRaw) {
                const parsedDemo = JSON.parse(savedDemoRaw);
                state.pelanggan = parsedDemo.pelanggan || [];
                state.paket = parsedDemo.paket || [];
                state.transaksi = parsedDemo.transaksi || [];
                state.pembayaran = parsedDemo.pembayaran || [];
                state.jurnalManual = loadJurnalManual();
                state.modalAwal = loadModalAwal();
                state.isDemoMode = true;
                renderAll();
            } else {
                muatDataSimulasiSekarang(false);
            }
        } else {
            state.pelanggan = rowsPelanggan;
            state.paket = rowsPaket;
            state.transaksi = rowsTransaksi;
            state.pembayaran = rowsPembayaran;
            state.jurnalManual = loadJurnalManual();
            state.modalAwal = loadModalAwal();
            state.isDemoMode = false;
            renderAll();
        }

        const inputModal = document.getElementById("input-modal-awal");
        if (inputModal) inputModal.value = state.modalAwal;
    } catch (error) {
        console.warn("Supabase tidak merespons, beralih ke mode simulasi:", error);
        muatDataSimulasiSekarang(false);
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

function hitungTotalPenyisihanPiutang() {
    const hariIni = new Date();
    hariIni.setHours(0, 0, 0, 0);

    return state.transaksi.reduce((total, item) => {
        const sisa = getPiutang(item);
        if (sisa <= 0 || !item.tanggal_acara) return total;

        const tanggalAcara = new Date(item.tanggal_acara + "T00:00:00");
        const selisihHari = Math.ceil((hariIni.getTime() - tanggalAcara.getTime()) / (1000 * 3600 * 24));

        if (selisihHari > 0) {
            if (selisihHari <= 30) return total + sisa * 0.05;
            if (selisihHari <= 60) return total + sisa * 0.10;
            return total + sisa * 0.20;
        }
        return total;
    }, 0);
}

function badgeStatus(status) {
    const aman = escapeHTML(status || "-");
    let warna = "#b7791f";

    if (String(status).toLowerCase() === "lunas") {
        warna = "#198754";
    } else if (String(status).toLowerCase() === "menunggu pembayaran" || String(status).toLowerCase() === "pending") {
        warna = "#d84a5f";
    } else if (String(status).toLowerCase().includes("berlangsung")) {
        warna = "#0d6efd";
    }

    return `<span style="display:inline-block; padding:4px 10px; border-radius:20px; background:${warna}18; color:${warna}; font-size:11.5px; font-weight:700;">${aman}</span>`;
}

function actionButtons(jenis, id, ekstraHTML = "") {
    return `
        <div class="action-group">
            ${ekstraHTML}
            <button type="button" class="btn-sm" data-edit="${escapeHTML(jenis)}" data-id="${escapeHTML(id)}">Edit</button>
            <button type="button" class="btn-sm btn-danger" data-delete="${escapeHTML(jenis)}" data-id="${escapeHTML(id)}">Hapus</button>
        </div>
    `;
}

function setIsiTabel(id, html, colspan = 1) {
    const tabel = document.getElementById(id);
    if (!tabel) return;
    tabel.innerHTML = html || `<tr><td colspan="${colspan}" style="text-align:center; padding:24px; color:#8c737b;">Belum ada data yang tercatat.</td></tr>`;
}

function bukaInvoiceModal(idTransaksi) {
    const trx = state.transaksi.find(t => String(t.id_transaksi) === String(idTransaksi));
    if (!trx) {
        tampilkanPesan("Data transaksi tidak ditemukan.", "error");
        return;
    }

    const pelanggan = state.pelanggan.find(p => String(p.id_pelanggan) === String(trx.id_pelanggan)) || {};
    const paket = state.paket.find(pk => String(pk.id_paket) === String(trx.id_paket)) || {};
    const riwayatBayar = state.pembayaran.filter(b => String(b.id_transaksi) === String(trx.id_transaksi));

    const totalKontrak = angka(trx.total_transaksi);
    const totalDibayar = riwayatBayar.reduce((sum, b) => sum + angka(b.jumlah_bayar), 0);
    const sisaTagihan = Math.max(totalKontrak - totalDibayar, 0);
    const isLunas = sisaTagihan <= 0 && totalKontrak > 0;

    const nomorInv = `INV/LW/${new Date().getFullYear()}/${String(trx.id_transaksi).padStart(4, "0")}`;
    document.getElementById("inv-number").textContent = nomorInv;
    document.getElementById("inv-issue-date").textContent = tanggalIndonesia(trx.tanggal_transaksi || new Date().toISOString().slice(0, 10));
    document.getElementById("inv-event-date").textContent = tanggalIndonesia(trx.tanggal_acara);

    const statusBadge = document.getElementById("inv-status-badge");
    statusBadge.textContent = isLunas ? "LUNAS (PAID)" : "BELUM LUNAS (OUTSTANDING)";
    statusBadge.className = `inv-status-stamp ${isLunas ? "lunas" : "belum"}`;

    document.getElementById("inv-client-name").textContent = pelanggan.nama_pelanggan || "Pelanggan Umum";
    document.getElementById("inv-client-phone").textContent = pelanggan.no_telepon ? `Telp/WA: ${pelanggan.no_telepon}` : "-";
    document.getElementById("inv-client-email").textContent = pelanggan.email || "-";
    document.getElementById("inv-client-address").textContent = pelanggan.alamat || "-";

    document.getElementById("inv-package-name").textContent = paket.nama_paket || "Paket Layanan Wedding";
    document.getElementById("inv-package-desc").textContent = paket.deskripsi || "Layanan koordinasi & manajemen acara pernikahan.";
    document.getElementById("inv-package-price").textContent = rupiah(totalKontrak);
    document.getElementById("inv-package-total").textContent = rupiah(totalKontrak);

    const tbodyHistory = document.getElementById("inv-payment-history");
    if (riwayatBayar.length === 0) {
        tbodyHistory.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#888;">Belum ada pembayaran masuk.</td></tr>`;
    } else {
        tbodyHistory.innerHTML = riwayatBayar.map(b => `
            <tr>
                <td>${tanggalIndonesia(b.tanggal_pembayaran)}</td>
                <td>${escapeHTML(b.metode_pembayaran || "-")}</td>
                <td>${escapeHTML(b.keterangan || "-")}</td>
                <td style="text-align:right; font-weight:600;">${rupiah(b.jumlah_bayar)}</td>
            </tr>
        `).join("");
    }

    document.getElementById("inv-subtotal").textContent = rupiah(totalKontrak);
    document.getElementById("inv-paid").textContent = rupiah(totalDibayar);
    document.getElementById("inv-balance").textContent = rupiah(sisaTagihan);

    document.getElementById("invoice-modal").classList.remove("hidden");
}

function tutupInvoiceModal() {
    document.getElementById("invoice-modal").classList.add("hidden");
}

function cetakInvoiceSekarang() {
    const isiInvoice = document.getElementById("invoice-printable-area")?.innerHTML;
    const noInv = document.getElementById("inv-number")?.textContent || "Invoice";
    if (!isiInvoice) return;

    const jendelaPrint = window.open("", "_blank", "width=900,height=750");
    if (!jendelaPrint) {
        tampilkanPesan("Pop-up diblokir browser. Izinkan pop-up untuk mencetak invoice.", "error");
        return;
    }

    jendelaPrint.document.write(`
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <title>${escapeHTML(noInv)} - Lunelle Wedding</title>
            <style>
                * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                @page { size: A4; margin: 1.4cm; }
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    color: #222;
                    margin: 0;
                    padding: 10px;
                    background: #fff;
                }
                .inv-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    border-bottom: 2.5px solid #d66d8e;
                    padding-bottom: 16px;
                    margin-bottom: 22px;
                }
                .inv-brand h2 { margin: 0; color: #a84464; font-size: 22px; letter-spacing: 0.04em; }
                .inv-brand p { margin: 3px 0 0; font-size: 12px; color: #555; }
                .inv-meta { text-align: right; }
                .inv-meta h1 { margin: 0 0 6px; font-size: 24px; letter-spacing: 0.1em; color: #222; }
                .inv-meta p { margin: 2px 0; font-size: 12.5px; color: #333; }
                .inv-status-stamp {
                    display: inline-block;
                    margin-top: 6px;
                    padding: 4px 12px;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 800;
                    text-transform: uppercase;
                }
                .inv-status-stamp.lunas { background: #dcfce7; color: #15803d; border: 1.5px solid #16a34a; }
                .inv-status-stamp.belum { background: #fef3c7; color: #b45309; border: 1.5px solid #d97706; }
                .inv-grid-info {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 18px;
                    margin-bottom: 22px;
                    font-size: 12.5px;
                }
                .inv-info-box {
                    background: #fdf9fa;
                    border: 1px solid #ead4dc;
                    border-radius: 8px;
                    padding: 12px 16px;
                }
                .inv-info-box h4 {
                    margin: 0 0 6px;
                    font-size: 10.5px;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    color: #9e7b86;
                }
                .inv-info-box p { margin: 3px 0; color: #222; }
                .inv-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                    font-size: 12.5px;
                }
                .inv-table th {
                    background: #fdf2f6;
                    color: #7d3149;
                    text-align: left;
                    padding: 9px 11px;
                    border-top: 1px solid #e5c6d0;
                    border-bottom: 1px solid #e5c6d0;
                }
                .inv-table td {
                    padding: 9px 11px;
                    border-bottom: 1px solid #f0e1e6;
                }
                .inv-summary { width: 310px; margin-left: auto; font-size: 13px; }
                .inv-summary-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 6px 0;
                    border-bottom: 1px dashed #dcc6ce;
                }
                .inv-summary-row.total {
                    font-weight: 800;
                    font-size: 15px;
                    color: #a84464;
                    border-top: 2px solid #222;
                    border-bottom: 2px solid #222;
                    padding: 9px 0;
                    margin-top: 4px;
                }
                .inv-footer {
                    margin-top: 40px;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    font-size: 12px;
                    color: #444;
                }
            </style>
        </head>
        <body>
            ${isiInvoice}
            <script>
                window.onload = function() {
                    window.focus();
                    window.print();
                };
            <\/script>
        </body>
        </html>
    `);
    jendelaPrint.document.close();
}

function buildDaftarJurnal() {
    const entri = [];

    state.transaksi.forEach((trx, index) => {
        const nominal = angka(trx.total_transaksi);
        if (nominal <= 0) return;

        entri.push({
            tanggal: trx.tanggal_transaksi || trx.tanggal_acara || "",
            ref: `TRX-${trx.id_transaksi ?? index + 1}`,
            jenis: "transaksi",
            akunDebit: "Piutang Usaha",
            akunKredit: "Pendapatan Jasa Wedding",
            nominal,
            keterangan: `Kontrak paket ${getNamaPaket(trx.id_paket)} - ${getNamaPelanggan(trx.id_pelanggan)}`,
            isManual: false
        });
    });

    state.pembayaran.forEach((byr, index) => {
        const nominal = angka(byr.jumlah_bayar);
        if (nominal <= 0) return;

        const trx = state.transaksi.find(t => String(t.id_transaksi) === String(byr.id_transaksi));
        const namaPelanggan = trx ? getNamaPelanggan(trx.id_pelanggan) : "-";
        const ket = byr.keterangan ? ` (${byr.keterangan})` : "";

        entri.push({
            tanggal: byr.tanggal_pembayaran || "",
            ref: `BYR-${byr.id_pembayaran ?? byr.id_transaksi ?? index + 1}`,
            jenis: "pembayaran",
            akunDebit: "Kas",
            akunKredit: "Piutang Usaha",
            nominal,
            keterangan: `Penerimaan via ${byr.metode_pembayaran || "-"} - ${namaPelanggan}${ket}`,
            isManual: false
        });
    });

    state.jurnalManual.forEach((jrn, index) => {
        const nominal = angka(jrn.nominal_jurnal);
        if (nominal <= 0) return;

        entri.push({
            idManual: jrn.id_jurnal,
            tanggal: jrn.tanggal_jurnal || "",
            ref: jrn.no_referensi || `ADJ-${index + 1}`,
            jenis: "manual",
            akunDebit: jrn.akun_debit || "Akun Debit",
            akunKredit: jrn.akun_kredit || "Akun Kredit",
            nominal,
            keterangan: jrn.keterangan_jurnal || "-",
            isManual: true
        });
    });

    entri.sort((a, b) => String(b.tanggal || "").localeCompare(String(a.tanggal || "")));
    return entri;
}

function renderJurnal() {
    const semuaJurnal = buildDaftarJurnal();
    const keyword = (document.getElementById("search-jurnal")?.value || "").toLowerCase().trim();
    const filterJenis = document.getElementById("filter-jenis-jurnal")?.value || "all";

    const difilter = semuaJurnal.filter(item => {
        const cocokJenis = filterJenis === "all" || item.jenis === filterJenis;
        const teks = `${item.ref} ${item.akunDebit} ${item.akunKredit} ${item.keterangan}`.toLowerCase();
        return cocokJenis && (!keyword || teks.includes(keyword));
    });

    let totalDebit = 0;
    let totalKredit = 0;

    const rowsHTML = difilter.map(item => {
        totalDebit += item.nominal;
        totalKredit += item.nominal;

        const badgeSumber = item.jenis === "transaksi"
            ? `<span style="font-size:10px; padding:2px 7px; border-radius:10px; background:#eff6ff; color:#1d4ed8; font-weight:600;">Transaksi</span>`
            : item.jenis === "pembayaran"
                ? `<span style="font-size:10px; padding:2px 7px; border-radius:10px; background:#f0fdf4; color:#198754; font-weight:600;">Pembayaran</span>`
                : `<span style="font-size:10px; padding:2px 7px; border-radius:10px; background:#fdf2f8; color:#be185d; font-weight:600;">Beban/Penyesuaian</span>`;

        const tombolHapusManual = item.isManual
            ? `<button type="button" class="btn-sm btn-danger" data-delete-jurnal="${escapeHTML(item.idManual)}" style="margin-left:8px; padding:2px 7px; font-size:10.5px;">Hapus</button>`
            : "";

        return `
            <tr>
                <td style="white-space:nowrap;">${tanggalIndonesia(item.tanggal)}</td>
                <td style="white-space:nowrap;"><strong>${escapeHTML(item.ref)}</strong><br>${badgeSumber}</td>
                <td>
                    <div><strong>${escapeHTML(item.akunDebit)}</strong></div>
                    <div style="padding-left:24px; color:#555;">${escapeHTML(item.akunKredit)}</div>
                    <div style="font-size:11px; color:var(--muted); margin-top:3px;">
                        <em>${escapeHTML(item.keterangan)}</em>${tombolHapusManual}
                    </div>
                </td>
                <td style="text-align:right; vertical-align:top; font-weight:600; color:#1d4ed8;">
                    <div>${rupiah(item.nominal)}</div>
                    <div style="color:transparent;">-</div>
                </td>
                <td style="text-align:right; vertical-align:top; font-weight:600; color:#be185d;">
                    <div style="color:transparent;">-</div>
                    <div>${rupiah(item.nominal)}</div>
                </td>
            </tr>
        `;
    }).join("");

    setIsiTabel("tabel-jurnal", rowsHTML, 5);

    const selisih = Math.abs(totalDebit - totalKredit);
    const elDebit = document.getElementById("jurnal-total-debit");
    const elKredit = document.getElementById("jurnal-total-kredit");
    const elStatus = document.getElementById("jurnal-status-balance");
    const elSelisih = document.getElementById("jurnal-selisih");

    if (elDebit) elDebit.textContent = rupiah(totalDebit);
    if (elKredit) elKredit.textContent = rupiah(totalKredit);
    if (elStatus) {
        elStatus.textContent = selisih === 0 ? "Seimbang (Balance)" : "Tidak Seimbang";
        elStatus.style.color = selisih === 0 ? "#2ca068" : "#dc3545";
    }
    if (elSelisih) elSelisih.textContent = `Selisih: ${rupiah(selisih)}`;
}

function saveJurnalManual(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = dataForm(form, [
        "tanggal_jurnal",
        "no_referensi",
        "akun_debit",
        "akun_kredit",
        "nominal_jurnal",
        "keterangan_jurnal"
    ]);

    payload.nominal_jurnal = angka(payload.nominal_jurnal);
    if (payload.nominal_jurnal <= 0) {
        tampilkanPesan("Nominal jurnal harus lebih dari 0.", "error");
        return;
    }

    state.jurnalManual.push({
        id_jurnal: "JRN-" + Date.now(),
        ...payload
    });

    simpanJurnalManualStorage();
    resetForm("form-jurnal");
    tampilkanForm("form-jurnal", false);
    renderAll();
    tampilkanPesan("Jurnal penyesuaian/beban berhasil disimpan & diperbarui ke laporan.");
}

function deleteJurnalManual(idJurnal) {
    if (!confirm("Yakin ingin menghapus entri jurnal ini?")) return;
    state.jurnalManual = state.jurnalManual.filter(item => String(item.id_jurnal) !== String(idJurnal));
    simpanJurnalManualStorage();
    renderAll();
    tampilkanPesan("Entri jurnal berhasil dihapus.");
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

    [["nilai-tagihan", totalTagihan], ["nilai-pembayaran", totalPendapatan], ["nilai-piutang", totalPiutang]].forEach(([id, nilai]) => {
        const elemen = document.getElementById(id);
        if (elemen) elemen.textContent = rupiah(nilai);
    });

    const maksimum = Math.max(totalTagihan, totalPendapatan, totalPiutang, 1);
    [["bar-tagihan", totalTagihan], ["bar-pembayaran", totalPendapatan], ["bar-piutang", totalPiutang]].forEach(([id, nilai]) => {
        const elemen = document.getElementById(id);
        if (elemen) elemen.style.width = `${Math.min((angka(nilai) / maksimum) * 100, 100)}%`;
    });

    const ctx = document.getElementById("keuanganChart");
    if (ctx) {
        if (grafikKeuangan) grafikKeuangan.destroy();
        grafikKeuangan = new Chart(ctx, {
            type: "doughnut",
            data: {
                labels: ["Kas Masuk (Aman)", "Sisa Piutang (Tagihan)"],
                datasets: [{
                    data: [totalPendapatan, totalPiutang],
                    backgroundColor: ["#198754", "#dc3545"],
                    borderWidth: 2,
                    borderColor: "#ffffff",
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: "bottom" },
                    tooltip: {
                        callbacks: {
                            label: context => `${context.label}: ${rupiah(context.parsed)}`
                        }
                    }
                }
            }
        });
    }
}

function renderPelanggan() {
    const keyword = (document.getElementById("search-pelanggan")?.value || "").toLowerCase();
    const filteredData = state.pelanggan.filter(item =>
        (item.nama_pelanggan || "").toLowerCase().includes(keyword) ||
        (item.no_telepon || "").toLowerCase().includes(keyword) ||
        (item.email || "").toLowerCase().includes(keyword) ||
        (item.alamat || "").toLowerCase().includes(keyword)
    );

    const html = filteredData.map(item => `
        <tr>
            <td><strong>${escapeHTML(item.nama_pelanggan)}</strong></td>
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
        container.innerHTML = html || `<p style="text-align:center; width:100%; color:#96868c;">Belum ada paket wedding.</p>`;
    }
}

function renderTransaksi() {
    const keyword = (document.getElementById("search-transaksi")?.value || "").toLowerCase();
    const filteredData = state.transaksi.filter(item => {
        const nama = getNamaPelanggan(item.id_pelanggan).toLowerCase();
        const paket = getNamaPaket(item.id_paket).toLowerCase();
        const status = (item.status || "").toLowerCase();
        const idStr = String(item.id_transaksi).toLowerCase();
        return nama.includes(keyword) || paket.includes(keyword) || status.includes(keyword) || idStr.includes(keyword);
    });

    const html = filteredData.map(item => {
        const sisa = getPiutang(item);
        const tombolInvoice = `<button type="button" class="btn-sm btn-invoice" data-invoice="${escapeHTML(item.id_transaksi)}"><i class="fa-solid fa-file-invoice"></i> Invoice</button>`;
        const tombolBayar = sisa > 0
            ? `<button type="button" class="btn-sm btn-pay" data-quick-pay="${escapeHTML(item.id_transaksi)}"><i class="fa-solid fa-money-bill-wave"></i> Bayar</button>`
            : "";

        return `
            <tr>
                <td><strong>#${escapeHTML(item.id_transaksi)}</strong></td>
                <td><strong>${escapeHTML(getNamaPelanggan(item.id_pelanggan))}</strong></td>
                <td>${escapeHTML(getNamaPaket(item.id_paket))}</td>
                <td>${tanggalIndonesia(item.tanggal_acara)}</td>
                <td>${rupiah(item.total_transaksi)}</td>
                <td style="font-weight:700; color:${sisa > 0 ? "#d84a5f" : "#198754"};">${rupiah(sisa)}</td>
                <td>${badgeStatus(item.status)}</td>
                <td>${actionButtons("transaksi", item.id_transaksi, tombolInvoice + tombolBayar)}</td>
            </tr>
        `;
    }).join("");

    setIsiTabel("tabel-transaksi", html, 8);
}

function renderPembayaran() {
    const keyword = (document.getElementById("search-pembayaran")?.value || "").toLowerCase();
    const filteredData = state.pembayaran.filter(item => {
        const transaksi = state.transaksi.find(t => String(t.id_transaksi) === String(item.id_transaksi));
        const nama = transaksi ? getNamaPelanggan(transaksi.id_pelanggan).toLowerCase() : "";
        const metode = (item.metode_pembayaran || "").toLowerCase();
        const ket = (item.keterangan || "").toLowerCase();
        const idStr = String(item.id_transaksi).toLowerCase();
        return nama.includes(keyword) || metode.includes(keyword) || ket.includes(keyword) || idStr.includes(keyword);
    });

    const html = filteredData.map(item => {
        const transaksi = state.transaksi.find(t => String(t.id_transaksi) === String(item.id_transaksi));
        const namaPelanggan = transaksi ? getNamaPelanggan(transaksi.id_pelanggan) : "-";

        return `
            <tr>
                <td><strong>#${escapeHTML(item.id_transaksi)}</strong></td>
                <td><strong>${escapeHTML(namaPelanggan)}</strong></td>
                <td>${tanggalIndonesia(item.tanggal_pembayaran)}</td>
                <td style="color:#198754; font-weight:700;">${rupiah(item.jumlah_bayar)}</td>
                <td>${escapeHTML(item.metode_pembayaran)}</td>
                <td>${escapeHTML(item.keterangan)}</td>
                <td>${actionButtons("pembayaran", item.id_pembayaran)}</td>
            </tr>
        `;
    }).join("");

    setIsiTabel("tabel-pembayaran", html, 7);
}

function renderPiutang() {
    let totalSeluruhPiutang = 0;
    let transaksiBerhutang = 0;
    let totalPenyisihan = 0;

    const keyword = (document.getElementById("search-piutang")?.value || "").toLowerCase();

    const filteredData = state.transaksi.filter(item => {
        const namaPelanggan = getNamaPelanggan(item.id_pelanggan).toLowerCase();
        const idTransaksi = String(item.id_transaksi).toLowerCase();
        return namaPelanggan.includes(keyword) || idTransaksi.includes(keyword);
    });

    const html = filteredData.map(item => {
        const totalTagihan = angka(item.total_transaksi);
        const totalBayar = getTotalPembayaran(item.id_transaksi);
        const sisa = Math.max(totalTagihan - totalBayar, 0);

        if (sisa > 0) {
            totalSeluruhPiutang += sisa;
            transaksiBerhutang++;
        }

        const persen = totalTagihan > 0 ? Math.min((totalBayar / totalTagihan) * 100, 100) : 0;
        const tanggalAcara = new Date(item.tanggal_acara + "T00:00:00");
        const hariIni = new Date();
        hariIni.setHours(0, 0, 0, 0);

        let statusPiutang = "";
        let warnaStatus = "";
        let warnaTeksSisa = "#2ca068";
        let nilaiPenyisihan = 0;

        if (sisa <= 0) {
            statusPiutang = "LUNAS";
            warnaStatus = "#198754";
        } else {
            warnaTeksSisa = "#d84a5f";
            const selisihHari = Math.ceil((hariIni.getTime() - tanggalAcara.getTime()) / (1000 * 3600 * 24));

            if (selisihHari > 0) {
                statusPiutang = `JATUH TEMPO (${selisihHari} Hari)`;
                warnaStatus = "#dc3545";
                if (selisihHari <= 30) nilaiPenyisihan = sisa * 0.05;
                else if (selisihHari <= 60) nilaiPenyisihan = sisa * 0.10;
                else nilaiPenyisihan = sisa * 0.20;
            } else if (selisihHari === 0) {
                statusPiutang = "HARI H ACARA!";
                warnaStatus = "#fd7e14";
            } else {
                statusPiutang = "BELUM JATUH TEMPO";
                warnaStatus = "#b7791f";
            }
        }

        totalPenyisihan += nilaiPenyisihan;

        const badgeJatuhTempo = `<span style="display:inline-block; padding:4px 8px; border-radius:6px; background:${warnaStatus}15; color:${warnaStatus}; font-size:10px; font-weight:700; border: 1px solid ${warnaStatus}40; margin-bottom: 5px;">${statusPiutang}</span>`;
        const infoPenyisihan = nilaiPenyisihan > 0
            ? `<div style="font-size:10px; color:var(--pink-dark); margin-top:4px;">⚠️ Cadangan: ${rupiah(nilaiPenyisihan)}</div>`
            : "";

        const dataPelanggan = state.pelanggan.find(p => String(p.id_pelanggan) === String(item.id_pelanggan));
        let tombolWA = "";
        if (sisa > 0 && dataPelanggan && dataPelanggan.no_telepon) {
            const noWA = dataPelanggan.no_telepon.replace(/[^0-9]/g, "").replace(/^0/, "62");
            const teksPeringatan = statusPiutang.includes("JATUH TEMPO") ? `\n\n⚠️ *PEMBERITAHUAN:* Tagihan ini telah melewati tanggal acara (Jatuh Tempo).` : "";
            const teksPesan = encodeURIComponent(`Halo ${dataPelanggan.nama_pelanggan},\n\nKami dari *SIAWO - Lunelle Wedding* menginformasikan ringkasan tagihan acara Anda.${teksPeringatan}\n\nTotal Tagihan: ${rupiah(totalTagihan)}\nTotal Dibayar: ${rupiah(totalBayar)}\n*Sisa Piutang: ${rupiah(sisa)}*\n\nMohon untuk dapat melakukan pelunasan sisa tagihan tersebut. Terima kasih! ♡`);
            tombolWA = `<a href="https://wa.me/${noWA}?text=${teksPesan}" target="_blank" style="display:inline-block; margin-top:4px; padding:5px 10px; background:#25D366; color:white; border-radius:6px; font-size:11px; font-weight:bold; text-decoration:none;">💬 Tagih WA</a>`;
        }

        return `
            <tr>
                <td><strong>#${escapeHTML(item.id_transaksi)}</strong></td>
                <td>
                    <strong>${escapeHTML(getNamaPelanggan(item.id_pelanggan))}</strong><br>
                    <span style="font-size:10.5px; color:var(--muted);">Acara: ${tanggalIndonesia(item.tanggal_acara)}</span>
                </td>
                <td>${rupiah(totalTagihan)}</td>
                <td>
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                        <div style="flex:1; height:6px; background:#f0e3e7; border-radius:10px; overflow:hidden;">
                            <div style="width:${persen}%; height:100%; background:var(--pink); border-radius:10px;"></div>
                        </div>
                        <span style="font-size:10.5px; font-weight:bold; color:var(--pink-dark);">${Math.round(persen)}%</span>
                    </div>
                    <div style="font-size:10.5px; color:var(--muted);">Terbayar: ${rupiah(totalBayar)}</div>
                </td>
                <td>
                    <strong style="color:${warnaTeksSisa}; font-size:14.5px;">${rupiah(sisa)}</strong>
                    ${infoPenyisihan}
                </td>
                <td style="text-align:center;">
                    ${badgeJatuhTempo}<br>${tombolWA}
                </td>
            </tr>
        `;
    }).join("");

    setIsiTabel("tabel-piutang", html, 6);

    const totalElem = document.getElementById("summary-total-piutang");
    if (totalElem) totalElem.textContent = rupiah(totalSeluruhPiutang);
    const orangElem = document.getElementById("summary-orang-piutang");
    if (orangElem) orangElem.textContent = `${transaksiBerhutang} Transaksi Berhutang`;
    const penyisihanElem = document.getElementById("summary-penyisihan");
    if (penyisihanElem) penyisihanElem.textContent = rupiah(totalPenyisihan);
    const bersihElem = document.getElementById("summary-piutang-bersih");
    if (bersihElem) bersihElem.textContent = rupiah(Math.max(totalSeluruhPiutang - totalPenyisihan, 0));
}

function renderLaporan() {
    const hariIniTeks = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    const tahunTeks = `31 Desember ${new Date().getFullYear()}`;

    document.querySelectorAll(".tanggal-cetak-teks").forEach(el => el.textContent = hariIniTeks);
    document.querySelectorAll(".periode-laporan-teks").forEach(el => el.textContent = tahunTeks);

    const pendapatanJasa = state.transaksi.reduce((sum, t) => sum + angka(t.total_transaksi), 0);
    const kasMasukPelanggan = state.pembayaran.reduce((sum, p) => sum + angka(p.jumlah_bayar), 0);
    const piutangBruto = state.transaksi.reduce((sum, t) => sum + getPiutang(t), 0);
    const cadanganPiutang = hitungTotalPenyisihanPiutang();
    const piutangNeto = Math.max(piutangBruto - cadanganPiutang, 0);

    const kelompokBeban = {};
    let totalBebanManual = 0;
    let totalPrive = 0;
    let totalUtang = 0;
    let setoranModalJurnal = 0;

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
        if (debitLower.includes("utang")) totalUtang = Math.max(totalUtang - nominal, 0);
        if (kreditLower.includes("modal")) setoranModalJurnal += nominal;
    });

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

    const modalAwalTotal = state.modalAwal + setoranModalJurnal;
    const kenaikanEkuitas = labaBersih - totalPrive;
    const modalAkhir = modalAwalTotal + kenaikanEkuitas;

    if (document.getElementById("pe-modal-awal")) document.getElementById("pe-modal-awal").textContent = rupiah(modalAwalTotal);
    if (document.getElementById("pe-laba-bersih")) document.getElementById("pe-laba-bersih").textContent = labaBersih < 0 ? kurungRupiah(labaBersih) : rupiah(labaBersih);
    if (document.getElementById("pe-prive")) document.getElementById("pe-prive").textContent = kurungRupiah(totalPrive);
    if (document.getElementById("pe-kenaikan-ekuitas")) document.getElementById("pe-kenaikan-ekuitas").textContent = kenaikanEkuitas < 0 ? kurungRupiah(kenaikanEkuitas) : rupiah(kenaikanEkuitas);
    if (document.getElementById("pe-modal-akhir")) document.getElementById("pe-modal-akhir").textContent = rupiah(modalAkhir);

    const saldoKasAkhir = modalAwalTotal + kasMasukPelanggan - totalBebanManual - totalPrive + totalUtang;
    const totalAset = saldoKasAkhir + piutangNeto;
    const totalPasiva = totalUtang + modalAkhir;

    if (document.getElementById("nr-kas")) document.getElementById("nr-kas").textContent = rupiah(saldoKasAkhir);
    if (document.getElementById("nr-piutang-bruto")) document.getElementById("nr-piutang-bruto").textContent = rupiah(piutangBruto);
    if (document.getElementById("nr-cadangan-piutang")) document.getElementById("nr-cadangan-piutang").textContent = kurungRupiah(cadanganPiutang);
    if (document.getElementById("nr-piutang-neto")) document.getElementById("nr-piutang-neto").textContent = rupiah(piutangNeto);
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

    const arusKasOperasi = kasMasukPelanggan - totalBebanManual;
    const arusKasPendanaan = modalAwalTotal - totalPrive;

    if (document.getElementById("ak-kas-masuk")) document.getElementById("ak-kas-masuk").textContent = rupiah(kasMasukPelanggan);
    if (document.getElementById("ak-kas-keluar-beban")) document.getElementById("ak-kas-keluar-beban").textContent = kurungRupiah(totalBebanManual);
    if (document.getElementById("ak-operasi-bersih")) document.getElementById("ak-operasi-bersih").textContent = rupiah(arusKasOperasi);
    if (document.getElementById("ak-modal-awal")) document.getElementById("ak-modal-awal").textContent = rupiah(modalAwalTotal);
    if (document.getElementById("ak-prive")) document.getElementById("ak-prive").textContent = kurungRupiah(totalPrive);
    if (document.getElementById("ak-pendanaan-bersih")) document.getElementById("ak-pendanaan-bersih").textContent = rupiah(arusKasPendanaan);
    if (document.getElementById("ak-saldo-akhir")) document.getElementById("ak-saldo-akhir").textContent = rupiah(arusKasOperasi + arusKasPendanaan);

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

function isiDropdown(id, data, kolomID, pembuatLabel) {
    const elemen = document.getElementById(id);
    if (!elemen) return;
    const nilaiLama = elemen.value;
    elemen.innerHTML = `<option value="">Pilih data</option>` + data.map(item => `<option value="${escapeHTML(item[kolomID])}">${escapeHTML(pembuatLabel(item))}</option>`).join("");
    if (nilaiLama) elemen.value = nilaiLama;
}

function renderPilihanDropdown() {
    isiDropdown("pilih-pelanggan", state.pelanggan, "id_pelanggan", item => item.nama_pelanggan);
    isiDropdown("pilih-paket", state.paket, "id_paket", item => `${item.nama_paket} - ${rupiah(item.harga)}`);
    isiDropdown("pilih-transaksi", state.transaksi, "id_transaksi", item => `#${item.id_transaksi} - ${getNamaPelanggan(item.id_pelanggan)} (Sisa: ${rupiah(getPiutang(item))})`);
}

function isiHargaPaket() {
    const pilihPaket = document.getElementById("pilih-paket");
    const totalInput = document.getElementById("total-transaksi-input");
    if (!pilihPaket || !totalInput) return;
    const paket = state.paket.find(item => String(item.id_paket) === String(pilihPaket.value));
    if (paket) totalInput.value = angka(paket.harga);
}

function renderAll() {
    renderDashboard();
    renderPelanggan();
    renderPaket();
    renderTransaksi();
    renderPembayaran();
    renderJurnal();
    renderPiutang();
    renderLaporan();
    renderPilihanDropdown();
}

function showPage(namaHalaman) {
    document.querySelectorAll(".page").forEach(halaman => halaman.classList.remove("active"));
    const target = document.getElementById(`${namaHalaman}-page`);
    if (target) target.classList.add("active");

    document.querySelectorAll("[data-page]").forEach(tombol => {
        tombol.classList.toggle("active", tombol.dataset.page === namaHalaman);
    });

    const judul = {
        dashboard: "Dashboard",
        pelanggan: "Data Pelanggan",
        paket: "Paket Wedding",
        transaksi: "Transaksi & Invoice",
        pembayaran: "Penerimaan Pembayaran",
        jurnal: "Jurnal Umum",
        piutang: "Buku Piutang",
        laporan: "Laporan Keuangan (SAK)"
    };
    const elemenJudul = document.getElementById("page-title");
    if (elemenJudul) elemenJudul.textContent = judul[namaHalaman] || "SIAWO";
}

function setupNavigation() {
    document.querySelectorAll("[data-page]").forEach(tombol => {
        tombol.addEventListener("click", event => {
            event.preventDefault();
            showPage(tombol.dataset.page);
        });
    });

    document.addEventListener("click", event => {
        const tombolGo = event.target.closest("[data-go]");
        if (tombolGo) {
            event.preventDefault();
            const targetPage = tombolGo.dataset.go;
            showPage(targetPage);
            if (targetPage === "pelanggan") {
                resetForm("form-pelanggan");
                tampilkanForm("form-pelanggan", true);
            } else if (targetPage === "transaksi") {
                resetForm("form-transaksi");
                tampilkanForm("form-transaksi", true);
            }
        }

        const tombolTab = event.target.closest("[data-report-tab]");
        if (tombolTab) {
            const tabKey = tombolTab.dataset.reportTab;
            document.querySelectorAll(".report-tab-btn").forEach(btn => btn.classList.toggle("active", btn === tombolTab));
            document.querySelectorAll(".report-panel").forEach(panel => {
                panel.classList.toggle("active", panel.id === `panel-${tabKey}`);
            });
        }
    });
}

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
        if (nilai !== "") data[nama] = nilai;
    });
    return data;
}

function resetForm(formID) {
    const form = document.getElementById(formID);
    if (form) {
        form.reset();
        form.querySelectorAll("input[type='hidden']").forEach(input => input.value = "");
    }
}

function tampilkanForm(formID, tampil = true) {
    const form = document.getElementById(formID);
    if (!form) return;
    const pembungkus = form.closest(".form-card") || form.closest(".form-container") || form;
    pembungkus.classList.toggle("hidden", !tampil);
}

async function savePelanggan(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const id = ambilID(form, "id_pelanggan");
    const payload = dataForm(form, ["nama_pelanggan", "no_telepon", "email", "alamat"]);

    try {
        if (state.isDemoMode) {
            if (id) {
                const idx = state.pelanggan.findIndex(p => String(p.id_pelanggan) === String(id));
                if (idx !== -1) state.pelanggan[idx] = { ...state.pelanggan[idx], ...payload };
            } else {
                state.pelanggan.push({ id_pelanggan: Date.now(), ...payload });
            }
            simpanDemoKeStorage();
            resetForm("form-pelanggan");
            tampilkanForm("form-pelanggan", false);
            renderAll();
            tampilkanPesan("Data pelanggan berhasil disimpan.");
            return;
        }

        if (id) await supabaseRequest("pelanggan", { method: "PATCH", filters: { id_pelanggan: `eq.${id}` }, body: payload });
        else await supabaseRequest("pelanggan", { method: "POST", body: payload });

        resetForm("form-pelanggan");
        tampilkanForm("form-pelanggan", false);
        await loadAllData();
        tampilkanPesan("Data pelanggan berhasil disimpan.");
    } catch (error) {
        tampilkanPesan("Gagal menyimpan pelanggan: " + error.message, "error");
    }
}

async function savePaket(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const id = ambilID(form, "id_paket");
    const payload = dataForm(form, ["nama_paket", "harga", "deskripsi"]);
    if (payload.harga !== undefined) payload.harga = angka(payload.harga);

    try {
        if (state.isDemoMode) {
            if (id) {
                const idx = state.paket.findIndex(p => String(p.id_paket) === String(id));
                if (idx !== -1) state.paket[idx] = { ...state.paket[idx], ...payload };
            } else {
                state.paket.push({ id_paket: Date.now(), ...payload });
            }
            simpanDemoKeStorage();
            resetForm("form-paket");
            tampilkanForm("form-paket", false);
            renderAll();
            tampilkanPesan("Data paket wedding berhasil disimpan.");
            return;
        }

        if (id) await supabaseRequest("paket_wedding", { method: "PATCH", filters: { id_paket: `eq.${id}` }, body: payload });
        else await supabaseRequest("paket_wedding", { method: "POST", body: payload });

        resetForm("form-paket");
        tampilkanForm("form-paket", false);
        await loadAllData();
        tampilkanPesan("Data paket wedding berhasil disimpan.");
    } catch (error) {
        tampilkanPesan("Gagal menyimpan paket: " + error.message, "error");
    }
}

async function saveTransaksi(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const id = ambilID(form, "id_transaksi");
    const payload = dataForm(form, ["id_pelanggan", "id_paket", "tanggal_transaksi", "tanggal_acara", "total_transaksi", "status"]);
    if (payload.total_transaksi !== undefined) payload.total_transaksi = angka(payload.total_transaksi);

    try {
        if (state.isDemoMode) {
            if (id) {
                const idx = state.transaksi.findIndex(t => String(t.id_transaksi) === String(id));
                if (idx !== -1) state.transaksi[idx] = { ...state.transaksi[idx], ...payload };
            } else {
                const nextId = state.transaksi.reduce((max, t) => Math.max(max, angka(t.id_transaksi)), 200) + 1;
                state.transaksi.push({ id_transaksi: nextId, ...payload });
            }
            simpanDemoKeStorage();
            resetForm("form-transaksi");
            tampilkanForm("form-transaksi", false);
            renderAll();
            tampilkanPesan("Transaksi berhasil disimpan. Silakan klik Invoice untuk cetak tagihan.");
            return;
        }

        if (id) await supabaseRequest("transaksi_wedding", { method: "PATCH", filters: { id_transaksi: `eq.${id}` }, body: payload });
        else await supabaseRequest("transaksi_wedding", { method: "POST", body: payload });

        resetForm("form-transaksi");
        tampilkanForm("form-transaksi", false);
        await loadAllData();
        tampilkanPesan("Transaksi berhasil disimpan. Anda dapat langsung mencetak invoice pada tabel.");
    } catch (error) {
        tampilkanPesan("Gagal menyimpan transaksi: " + error.message, "error");
    }
}

async function savePembayaran(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const id = ambilID(form, "id_pembayaran");
    const payload = dataForm(form, ["id_transaksi", "tanggal_pembayaran", "jumlah_bayar", "metode_pembayaran", "keterangan"]);
    if (payload.jumlah_bayar !== undefined) payload.jumlah_bayar = angka(payload.jumlah_bayar);

    try {
        if (state.isDemoMode) {
            if (id) {
                const idx = state.pembayaran.findIndex(p => String(p.id_pembayaran) === String(id));
                if (idx !== -1) state.pembayaran[idx] = { ...state.pembayaran[idx], ...payload };
            } else {
                state.pembayaran.push({ id_pembayaran: Date.now(), ...payload });
            }

            const trx = state.transaksi.find(t => String(t.id_transaksi) === String(payload.id_transaksi));
            if (trx) {
                const totalTagihan = angka(trx.total_transaksi);
                const totalSudahDibayar = getTotalPembayaran(trx.id_transaksi);
                if (totalSudahDibayar >= totalTagihan) trx.status = "Lunas";
                else if (totalSudahDibayar > 0) trx.status = "Berlangsung";
            }

            simpanDemoKeStorage();
            resetForm("form-pembayaran");
            tampilkanForm("form-pembayaran", false);
            renderAll();
            tampilkanPesan("Pembayaran tercatat & status transaksi otomatis diperbarui.");
            return;
        }

        if (id) {
            await supabaseRequest("pembayaran", { method: "PATCH", filters: { id_pembayaran: `eq.${id}` }, body: payload });
        } else {
            await supabaseRequest("pembayaran", { method: "POST", body: payload });
        }

        const idTransaksiTerkait = payload.id_transaksi;
        const transaksiData = state.transaksi.find(t => String(t.id_transaksi) === String(idTransaksiTerkait));

        if (transaksiData) {
            const totalTagihan = angka(transaksiData.total_transaksi);
            const pembayaranLama = state.pembayaran
                .filter(p => String(p.id_transaksi) === String(idTransaksiTerkait) && String(p.id_pembayaran) !== String(id))
                .reduce((sum, p) => sum + angka(p.jumlah_bayar), 0);

            const totalSudahDibayar = pembayaranLama + angka(payload.jumlah_bayar);
            let statusBaru = transaksiData.status;
            if (totalSudahDibayar >= totalTagihan) statusBaru = "Lunas";
            else if (totalSudahDibayar > 0) statusBaru = "Berlangsung";

            await supabaseRequest("transaksi_wedding", {
                method: "PATCH",
                filters: { id_transaksi: `eq.${idTransaksiTerkait}` },
                body: { status: statusBaru }
            });
        }

        resetForm("form-pembayaran");
        tampilkanForm("form-pembayaran", false);
        await loadAllData();
        tampilkanPesan("Pembayaran tercatat & status transaksi otomatis diperbarui.");
    } catch (error) {
        tampilkanPesan("Gagal menyimpan pembayaran: " + error.message, "error");
    }
}

function editPelanggan(id) {
    const item = state.pelanggan.find(data => String(data.id_pelanggan) === String(id));
    if (!item) return;
    const form = document.getElementById("form-pelanggan");
    Object.entries(item).forEach(([nama, nilai]) => {
        const input = form.elements.namedItem(nama);
        if (input) input.value = nilai ?? "";
    });
    tampilkanForm("form-pelanggan", true);
    form.scrollIntoView({ behavior: "smooth", block: "center" });
}

function editPaket(id) {
    const item = state.paket.find(data => String(data.id_paket) === String(id));
    if (!item) return;
    const form = document.getElementById("form-paket");
    Object.entries(item).forEach(([nama, nilai]) => {
        const input = form.elements.namedItem(nama);
        if (input) input.value = nilai ?? "";
    });
    tampilkanForm("form-paket", true);
    form.scrollIntoView({ behavior: "smooth", block: "center" });
}

function editTransaksi(id) {
    const item = state.transaksi.find(data => String(data.id_transaksi) === String(id));
    if (!item) return;
    const form = document.getElementById("form-transaksi");
    Object.entries(item).forEach(([nama, nilai]) => {
        const input = form.elements.namedItem(nama);
        if (input) input.value = nilai ?? "";
    });
    tampilkanForm("form-transaksi", true);
    form.scrollIntoView({ behavior: "smooth", block: "center" });
}

function editPembayaran(id) {
    const item = state.pembayaran.find(data => String(data.id_pembayaran) === String(id));
    if (!item) return;
    const form = document.getElementById("form-pembayaran");
    Object.entries(item).forEach(([nama, nilai]) => {
        const input = form.elements.namedItem(nama);
        if (input) input.value = nilai ?? "";
    });
    tampilkanForm("form-pembayaran", true);
    form.scrollIntoView({ behavior: "smooth", block: "center" });
}

async function deleteRecord(jenis, id) {
    const konfigurasi = {
        pelanggan: { tabel: "pelanggan", kolom: "id_pelanggan", key: "pelanggan" },
        paket: { tabel: "paket_wedding", kolom: "id_paket", key: "paket" },
        transaksi: { tabel: "transaksi_wedding", kolom: "id_transaksi", key: "transaksi" },
        pembayaran: { tabel: "pembayaran", kolom: "id_pembayaran", key: "pembayaran" }
    };
    const item = konfigurasi[jenis];
    if (!item || !confirm("Yakin ingin menghapus data ini?")) return;

    try {
        if (state.isDemoMode) {
            state[item.key] = state[item.key].filter(row => String(row[item.kolom]) !== String(id));
            simpanDemoKeStorage();
            renderAll();
            tampilkanPesan("Data berhasil dihapus.");
            return;
        }

        await supabaseRequest(item.tabel, { method: "DELETE", filters: { [item.kolom]: `eq.${id}` } });
        await loadAllData();
        tampilkanPesan("Data berhasil dihapus.");
    } catch (error) {
        tampilkanPesan("Gagal menghapus data: " + error.message, "error");
    }
}

function setupSearch() {
    document.getElementById("search-pelanggan")?.addEventListener("input", renderPelanggan);
    document.getElementById("search-transaksi")?.addEventListener("input", renderTransaksi);
    document.getElementById("search-pembayaran")?.addEventListener("input", renderPembayaran);
    document.getElementById("search-piutang")?.addEventListener("input", renderPiutang);
    document.getElementById("search-jurnal")?.addEventListener("input", renderJurnal);
    document.getElementById("filter-jenis-jurnal")?.addEventListener("change", renderJurnal);
}

function setupForms() {
    const konfigurasiForm = [
        ["form-pelanggan", savePelanggan],
        ["form-paket", savePaket],
        ["form-transaksi", saveTransaksi],
        ["form-pembayaran", savePembayaran],
        ["form-jurnal", saveJurnalManual]
    ];
    konfigurasiForm.forEach(([id, handler]) => {
        const form = document.getElementById(id);
        if (form) form.addEventListener("submit", handler);
    });

    ["pelanggan", "paket", "transaksi", "pembayaran"].forEach(jenis => {
        const tombol = document.getElementById(`tambah-${jenis}`);
        if (tombol) {
            tombol.addEventListener("click", () => {
                resetForm(`form-${jenis}`);
                tampilkanForm(`form-${jenis}`, true);
            });
        }
    });

    document.getElementById("tambah-jurnal-manual")?.addEventListener("click", () => {
        resetForm("form-jurnal");
        tampilkanForm("form-jurnal", true);
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

    document.getElementById("pilih-paket")?.addEventListener("change", isiHargaPaket);

    document.getElementById("btn-simpan-modal")?.addEventListener("click", () => {
        const val = document.getElementById("input-modal-awal")?.value;
        simpanModalAwal(val);
        renderLaporan();
        tampilkanPesan("Saldo modal awal berhasil diterapkan ke laporan keuangan.");
    });

    document.getElementById("btn-muat-simulasi")?.addEventListener("click", () => {
        if (confirm("Muat ulang data simulasi demo Lunelle Wedding untuk presentasi?")) {
            muatDataSimulasiSekarang(true);
        }
    });

    document.getElementById("btn-close-invoice")?.addEventListener("click", tutupInvoiceModal);
    document.getElementById("btn-print-invoice")?.addEventListener("click", cetakInvoiceSekarang);
    document.getElementById("invoice-modal")?.addEventListener("click", event => {
        if (event.target.id === "invoice-modal") tutupInvoiceModal();
    });
}

function setupTableActions() {
    document.addEventListener("click", event => {
        const tombolInvoice = event.target.closest("[data-invoice]");
        if (tombolInvoice) {
            bukaInvoiceModal(tombolInvoice.dataset.invoice);
            return;
        }

        const tombolQuickPay = event.target.closest("[data-quick-pay]");
        if (tombolQuickPay) {
            const idTrx = tombolQuickPay.dataset.quickPay;
            const trx = state.transaksi.find(t => String(t.id_transaksi) === String(idTrx));
            showPage("pembayaran");
            resetForm("form-pembayaran");
            tampilkanForm("form-pembayaran", true);
            const form = document.getElementById("form-pembayaran");
            if (form) {
                const selectTrx = form.elements.namedItem("id_transaksi");
                const inputTgl = form.elements.namedItem("tanggal_pembayaran");
                const inputJml = form.elements.namedItem("jumlah_bayar");
                if (selectTrx) selectTrx.value = idTrx;
                if (inputTgl) inputTgl.value = new Date().toISOString().slice(0, 10);
                if (inputJml && trx) inputJml.value = getPiutang(trx);
            }
            return;
        }

        const tombolEdit = event.target.closest("[data-edit]");
        const tombolHapus = event.target.closest("[data-delete]");
        const tombolHapusJurnal = event.target.closest("[data-delete-jurnal]");

        if (tombolEdit) {
            const jenis = tombolEdit.dataset.edit;
            const id = tombolEdit.dataset.id;
            const fungsiEdit = { pelanggan: editPelanggan, paket: editPaket, transaksi: editTransaksi, pembayaran: editPembayaran };
            if (fungsiEdit[jenis]) fungsiEdit[jenis](id);
        }
        if (tombolHapus) deleteRecord(tombolHapus.dataset.delete, tombolHapus.dataset.id);
        if (tombolHapusJurnal) deleteJurnalManual(tombolHapusJurnal.dataset.deleteJurnal);
    });
}

async function initializeApp() {
    setupNavigation();
    setupForms();
    setupTableActions();
    setupSearch();
    showPage("dashboard");
    await loadAllData();
}

document.addEventListener("DOMContentLoaded", initializeApp);

const btnLogout = document.getElementById("btn-logout");
if (btnLogout) {
    btnLogout.addEventListener("click", function (e) {
        e.preventDefault();
        if (confirm("Apakah Anda yakin ingin keluar dari sistem SIAWO?")) {
            window.location.href = "login.html";
        }
    });
}
