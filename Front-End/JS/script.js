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
let grafikKeuangan = null;

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

    // ==========================================
    // KODE GRAFIK CHART.JS 
    // ==========================================
    const ctx = document.getElementById('keuanganChart');
    if (ctx) {
        if (grafikKeuangan) {
            grafikKeuangan.destroy();
        }

        grafikKeuangan = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Kas Masuk (Aman)', 'Sisa Piutang (Tagihan)'],
                datasets: [{
                    data: [totalPendapatan, totalPiutang],
                    backgroundColor: [
                        '#198754', // Hijau untuk Kas
                        '#dc3545'  // Merah untuk Piutang
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff',
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: { family: "'Poppins', sans-serif" }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed !== null) {
                                    label += new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(context.parsed);
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }
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
    const html = state.pembayaran.map(item => {
        const transaksi = state.transaksi.find(t => String(t.id_transaksi) === String(item.id_transaksi));
        const namaPelanggan = transaksi ? getNamaPelanggan(transaksi.id_pelanggan) : "-";

        return `
            <tr>
                <td>${escapeHTML(item.id_transaksi)}</td>
                <td><strong>${escapeHTML(namaPelanggan)}</strong></td>
                <td>${tanggalIndonesia(item.tanggal_pembayaran)}</td>
                <td>${rupiah(item.jumlah_bayar)}</td>
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

        if (sisa > 0) {
            totalSeluruhPiutang += sisa;
            transaksiBerhutang++;
        }

        const persen = totalTagihan > 0 ? Math.min((totalBayar / totalTagihan) * 100, 100) : 0;
        
        const tanggalAcara = new Date(item.tanggal_acara);
        const hariIni = new Date();
        hariIni.setHours(0, 0, 0, 0);
        tanggalAcara.setHours(0, 0, 0, 0);

        let statusPiutang = "";
        let warnaStatus = "";
        let warnaTeksSisa = "#2ca068";
        let nilaiPenyisihan = 0; 

        if (sisa <= 0) {
            statusPiutang = "LUNAS";
            warnaStatus = "#198754";
        } else {
            warnaTeksSisa = "#d84a5f";
            const selisihWaktu = hariIni.getTime() - tanggalAcara.getTime();
            const selisihHari = Math.ceil(selisihWaktu / (1000 * 3600 * 24));

            if (selisihHari > 0) {
                statusPiutang = `JATUH TEMPO (${selisihHari} Hari)`;
                warnaStatus = "#dc3545";
                
                if (selisihHari <= 30) {
                    nilaiPenyisihan = sisa * 0.05; 
                } else if (selisihHari <= 60) {
                    nilaiPenyisihan = sisa * 0.10; 
                } else {
                    nilaiPenyisihan = sisa * 0.20; 
                }
            } else if (selisihHari === 0) {
                statusPiutang = `HARI H ACARA!`;
                warnaStatus = "#fd7e14";
            } else {
                statusPiutang = `BELUM JATUH TEMPO`;
                warnaStatus = "#b7791f";
            }
        }
        
        totalPenyisihan += nilaiPenyisihan;

        const badgeJatuhTempo = `<span style="display:inline-block; padding:4px 8px; border-radius:6px; background:${warnaStatus}15; color:${warnaStatus}; font-size:10px; font-weight:700; border: 1px solid ${warnaStatus}40; margin-bottom: 5px;">${statusPiutang}</span>`;
        
        let infoPenyisihan = "";
        if (nilaiPenyisihan > 0) {
            infoPenyisihan = `<div style="font-size:10px; color:var(--pink-dark); margin-top:4px;">⚠️ Risiko Tak Tertagih: <br>${rupiah(nilaiPenyisihan)}</div>`;
        }

        const dataPelanggan = state.pelanggan.find(p => String(p.id_pelanggan) === String(item.id_pelanggan));
        
        let tombolWA = "";
        if (sisa > 0 && dataPelanggan && dataPelanggan.no_telepon) {
            const noWA = dataPelanggan.no_telepon.replace(/[^0-9]/g, '').replace(/^0/, '62');
            let teksPeringatan = statusPiutang.includes("JATUH TEMPO") ? `\n\n⚠️ *PEMBERITAHUAN:* Tagihan ini telah melewati tanggal acara (Jatuh Tempo).` : "";
            const teksPesan = encodeURIComponent(`Halo ${dataPelanggan.nama_pelanggan},\n\nKami dari *SIAWO - Lunelle Wedding* ingin menginformasikan ringkasan tagihan acara Anda.${teksPeringatan}\n\nTotal Tagihan: ${rupiah(totalTagihan)}\nTotal Dibayar: ${rupiah(totalBayar)}\n*Sisa Piutang: ${rupiah(sisa)}*\n\nMohon untuk dapat melakukan pelunasan sisa tagihan tersebut. Terima kasih atas kepercayaannya! ♡`);
            tombolWA = `<a href="https://wa.me/${noWA}?text=${teksPesan}" target="_blank" style="display:inline-block; margin-top:4px; padding:6px 12px; background:#25D366; color:white; border-radius:6px; font-size:11px; font-weight:bold; text-decoration:none; box-shadow: 0 2px 5px rgba(37,211,102,0.3); transition: 0.2s;">💬 Tagih via WA</a>`;
        } else if (sisa > 0) {
            tombolWA = `<span style="display:inline-block; margin-top:4px; font-size:10px; color:var(--muted);">No. HP tidak valid</span>`;
        }

        return `
            <tr>
                <td><strong>#${escapeHTML(item.id_transaksi)}</strong></td>
                <td>
                    <strong>${escapeHTML(getNamaPelanggan(item.id_pelanggan))}</strong><br>
                    <span style="font-size:10px; color:var(--muted);">Acara: ${tanggalIndonesia(item.tanggal_acara)}</span>
                </td>
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
                <td>
                    <strong style="color: ${warnaTeksSisa}; font-size: 15px;">${rupiah(sisa)}</strong>
                    ${infoPenyisihan}
                </td>
                <td style="text-align: center;">
                    ${badgeJatuhTempo}
                    <br>
                    ${tombolWA}
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
    if (bersihElem) bersihElem.textContent = rupiah(totalSeluruhPiutang - totalPenyisihan);
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
    isiDropdown("pilih-transaksi", state.transaksi, "id_transaksi", item => `${item.id_transaksi} - ${getNamaPelanggan(item.id_pelanggan)}`);
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
        transaksi: "Transaksi Wedding", 
        pembayaran: "Pembayaran", 
        piutang: "Piutang",
        laporan: "Laporan Keuangan" 
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
        const tombol = event.target.closest("[data-go]");
        if (tombol) {
            event.preventDefault();
            const targetPage = tombol.dataset.go;
            showPage(targetPage);
            if (targetPage === "pelanggan") {
                resetForm("form-pelanggan");
                tampilkanForm("form-pelanggan", true);
            }
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
        if (id) await supabaseRequest("paket_wedding", { method: "PATCH", filters: { id_paket: `eq.${id}` }, body: payload });
        else await supabaseRequest("paket_wedding", { method: "POST", body: payload });

        resetForm("form-paket");
        tampilkanForm("form-paket", false);
        await loadAllData();
        tampilkanPesan("Data paket berhasil disimpan.");
    } catch (error) {
        tampilkanPesan("Gagal menyimpan paket: " + error.message, "error");
    }
}

// INI FUNGSI YANG TADI HILANG DAN MEMBUAT LAYAR KOSONG:
async function saveTransaksi(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const id = ambilID(form, "id_transaksi");
    const payload = dataForm(form, ["id_pelanggan", "id_paket", "tanggal_transaksi", "tanggal_acara", "total_transaksi", "status"]);
    if (payload.total_transaksi !== undefined) payload.total_transaksi = angka(payload.total_transaksi);

    try {
        if (id) await supabaseRequest("transaksi_wedding", { method: "PATCH", filters: { id_transaksi: `eq.${id}` }, body: payload });
        else await supabaseRequest("transaksi_wedding", { method: "POST", body: payload });

        resetForm("form-transaksi");
        tampilkanForm("form-transaksi", false);
        await loadAllData();
        tampilkanPesan("Transaksi berhasil disimpan.");
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
        if (id) {
            await supabaseRequest("pembayaran", { method: "PATCH", filters: { id_pembayaran: `eq.${id}` }, body: payload });
        } else {
            await supabaseRequest("pembayaran", { method: "POST", body: payload });
        }

        // OTOMATISASI STATUS TRANSAKSI
        const idTransaksiTerkait = payload.id_transaksi;
        const transaksiData = state.transaksi.find(t => String(t.id_transaksi) === String(idTransaksiTerkait));
        
        if (transaksiData) {
            const totalTagihan = angka(transaksiData.total_transaksi);
            
            const pembayaranLama = state.pembayaran
                .filter(p => String(p.id_transaksi) === String(idTransaksiTerkait) && String(p.id_pembayaran) !== String(id))
                .reduce((sum, p) => sum + angka(p.jumlah_bayar), 0);
            
            const totalSudahDibayar = pembayaranLama + angka(payload.jumlah_bayar);

            let statusBaru = transaksiData.status;
            if (totalSudahDibayar >= totalTagihan) {
                statusBaru = "Lunas";
            } else if (totalSudahDibayar > 0) {
                statusBaru = "Berlangsung"; 
            }

            await supabaseRequest("transaksi_wedding", {
                method: "PATCH",
                filters: { id_transaksi: `eq.${idTransaksiTerkait}` },
                body: { status: statusBaru }
            });
        }

        resetForm("form-pembayaran");
        tampilkanForm("form-pembayaran", false);
        await loadAllData();
        tampilkanPesan("Pembayaran berhasil disimpan dan status transaksi diperbarui otomatis.");
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
        pelanggan: { tabel: "pelanggan", kolom: "id_pelanggan" },
        paket: { tabel: "paket_wedding", kolom: "id_paket" },
        transaksi: { tabel: "transaksi_wedding", kolom: "id_transaksi" },
        pembayaran: { tabel: "pembayaran", kolom: "id_pembayaran" }
    };
    const item = konfigurasi[jenis];
    if (!item || !confirm("Yakin ingin menghapus data ini?")) return;

    try {
        await supabaseRequest(item.tabel, { method: "DELETE", filters: { [item.kolom]: `eq.${id}` } });
        await loadAllData();
        tampilkanPesan("Data berhasil dihapus.");
    } catch (error) {
        tampilkanPesan("Gagal menghapus data: " + error.message, "error");
    }
}

function setupSearch() {
    const inputPelanggan = document.getElementById("search-pelanggan");
    if (inputPelanggan) {
        inputPelanggan.addEventListener("input", renderPelanggan);
    }

    const inputPiutang = document.getElementById("search-piutang");
    if (inputPiutang) {
        inputPiutang.addEventListener("input", renderPiutang);
    }
}

function setupForms() {
    const konfigurasiForm = [
        ["form-pelanggan", savePelanggan],
        ["form-paket", savePaket],
        ["form-transaksi", saveTransaksi],
        ["form-pembayaran", savePembayaran]
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
    if (pilihPaket) pilihPaket.addEventListener("change", isiHargaPaket);
}

function setupTableActions() {
    document.addEventListener("click", event => {
        const tombolEdit = event.target.closest("[data-edit]");
        const tombolHapus = event.target.closest("[data-delete]");

        if (tombolEdit) {
            const jenis = tombolEdit.dataset.edit;
            const id = tombolEdit.dataset.id;
            const fungsiEdit = { pelanggan: editPelanggan, paket: editPaket, transaksi: editTransaksi, pembayaran: editPembayaran };
            if (fungsiEdit[jenis]) fungsiEdit[jenis](id);
        }
        if (tombolHapus) deleteRecord(tombolHapus.dataset.delete, tombolHapus.dataset.id);
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

/* =========================================
   FITUR LOGOUT
========================================= */
const btnLogout = document.getElementById('btn-logout');

if (btnLogout) {
    btnLogout.addEventListener('click', function(e) {
        e.preventDefault(); 
        
        const konfirmasi = confirm("Apakah Anda yakin ingin keluar dari sistem SIAWO?");
        
        if (konfirmasi) {
            window.location.href = 'login.html';
        }
    });
}

function renderLaporan() {
    const dataPembayaran = Array.isArray(state.pembayaran) ? state.pembayaran : [];
    const dataTransaksi = Array.isArray(state.transaksi) ? state.transaksi : [];

    const totalKas = dataPembayaran.reduce((sum, item) => sum + angka(item.jumlah_bayar), 0);
    const totalKontrak = dataTransaksi.reduce((sum, item) => sum + angka(item.total_transaksi), 0);
    const totalPiutang = dataTransaksi.reduce((sum, item) => sum + getPiutang(item), 0);

    // 1. Update ke Layar Web (Kartu Warna-Warni)
    const elKas = document.getElementById("laporan-kas-masuk");
    const elKontrak = document.getElementById("laporan-total-kontrak");
    const elPiutang = document.getElementById("laporan-total-piutang");
    if (elKas) elKas.textContent = rupiah(totalKas);
    if (elKontrak) elKontrak.textContent = rupiah(totalKontrak);
    if (elPiutang) elPiutang.textContent = rupiah(totalPiutang);

    // 2. Update ke Area Print (Tersembunyi di web)
    const printKas = document.getElementById("print-kas");
    const printKontrak = document.getElementById("print-kontrak");
    const printPiutang = document.getElementById("print-piutang");
    if (printKas) printKas.textContent = rupiah(totalKas);
    if (printKontrak) printKontrak.textContent = rupiah(totalKontrak);
    if (printPiutang) printPiutang.textContent = rupiah(totalPiutang);

    // 3. Render Tabel
    if (dataPembayaran.length === 0) {
        setIsiTabel("tabel-laporan-kas", "", 5);
        return;
    }

    const html = dataPembayaran.map(item => `
        <tr>
            <td><strong>#${escapeHTML(item.id_transaksi)}</strong></td>
            <td>${tanggalIndonesia(item.tanggal_pembayaran)}</td>
            <td><strong style="color: #198754;">${rupiah(item.jumlah_bayar)}</strong></td>
            <td>${escapeHTML(item.metode_pembayaran)}</td>
            <td>${escapeHTML(item.keterangan)}</td>
        </tr>
    `).join("");

    setIsiTabel("tabel-laporan-kas", html, 5);
}
