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
    let arusKasInvestasi = 0;

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

        if (debitLower.includes("peralatan") || debitLower.includes("aset tetap")) {
            arusKasInvestasi -= nominal;
        }
        if (kreditLower.includes("peralatan") || kreditLower.includes("aset tetap")) {
            arusKasInvestasi += nominal;
        }
    });

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

    // 3. Laporan Posisi Keuangan (Neraca)
    const saldoKasAkhir = modalAwalTotal + kasMasukPelanggan - totalBebanManual - totalPrive + totalUtang + arusKasInvestasi;
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

    // 4. Laporan Arus Kas Standar (Operasi, Investasi, Pendanaan, Kenaikan Kas, Kas Awal & Akhir)
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
