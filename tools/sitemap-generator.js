// ==========================================
        // KEAMANAN ANTI-COPY & INSPECT
        // ==========================================
        document.addEventListener('contextmenu', e => e.preventDefault());
        document.addEventListener('keydown', function(e) {
            if (e.key === 'F12' || e.keyCode === 123) { e.preventDefault(); return false; }
            if (e.ctrlKey) {
                const key = e.key.toLowerCase();
                if (key === 'u' || e.keyCode === 85 || key === 's' || e.keyCode === 83) { e.preventDefault(); return false; }
                if (e.shiftKey && (key === 'i' || key === 'j' || key === 'c')) { e.preventDefault(); return false; }
            }
        });

        // ==========================================
        // VARIABEL DOM
        // ==========================================
        const situsiaDOMUrls = document.getElementById('situsia-input-url');
        const situsiaDOMLastmodOpt = document.getElementById('situsia-input-lastmod');
        const situsiaDOMDate = document.getElementById('situsia-input-date');
        const situsiaDOMFreq = document.getElementById('situsia-input-freq');
        const situsiaDOMPriority = document.getElementById('situsia-input-priority');
        const situsiaDOMHasil = document.getElementById('situsia-hasil-xml');
        const situsiaDOMTotal = document.getElementById('situsia-total-url');

        // Logic memunculkan Datepicker jika Custom dipilih
        situsiaDOMLastmodOpt.addEventListener('change', function() {
            if(this.value === 'custom') {
                situsiaDOMDate.classList.remove('hidden');
            } else {
                situsiaDOMDate.classList.add('hidden');
            }
        });

        // ==========================================
        // FUNGSI HELPER: ESCAPE XML
        // Wajib dilakukan agar '&' pada URL diubah menjadi '&amp;'
        // ==========================================
        function situsiaEscapeXml(unsafeStr) {
            return unsafeStr.replace(/[<>&'"]/g, function (c) {
                switch (c) {
                    case '<': return '&lt;';
                    case '>': return '&gt;';
                    case '&': return '&amp;';
                    case '\'': return '&apos;';
                    case '"': return '&quot;';
                }
            });
        }

        // ==========================================
        // FUNGSI UTAMA: GENERATE XML SITEMAP
        // ==========================================
        function situsiaBuatXML() {
            const teksUrlMentah = situsiaDOMUrls.value.trim();
            if (!teksUrlMentah) {
                alert("Harap masukkan daftar URL terlebih dahulu!");
                return;
            }

            // Pisahkan per baris, buang spasi, hapus baris kosong, dan hilangkan duplikat
            let daftarUrlArray = teksUrlMentah.split('\n').map(u => u.trim()).filter(u => u !== '');
            daftarUrlArray = [...new Set(daftarUrlArray)];

            if (daftarUrlArray.length === 0) return;

            // Ambil Nilai Pengaturan
            const optLastmod = situsiaDOMLastmodOpt.value;
            const valFreq = situsiaDOMFreq.value;
            const valPriority = situsiaDOMPriority.value;

            // Hitung Tanggal (Format W3C: YYYY-MM-DD)
            let tanggalFix = "";
            if (optLastmod === 'today') {
                const date = new Date();
                tanggalFix = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            } else if (optLastmod === 'custom') {
                tanggalFix = situsiaDOMDate.value;
                if (!tanggalFix) {
                    alert("Harap pilih tanggal manual yang Anda inginkan!");
                    return;
                }
            }

            // Mulai Meracik Struktur XML
            let xmlOutput = `<?xml version="1.0" encoding="UTF-8"?>\n`;
            xmlOutput += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

            daftarUrlArray.forEach(url => {
                // Pastikan format URL dasar (tambahkan https jika belum ada)
                if (!url.startsWith('http://') && !url.startsWith('https://')) {
                    url = 'https://' + url;
                }
                
                const urlAman = situsiaEscapeXml(url);

                xmlOutput += `  <url>\n`;
                xmlOutput += `    <loc>${urlAman}</loc>\n`;
                
                if (optLastmod !== 'skip' && tanggalFix !== "") {
                    xmlOutput += `    <lastmod>${tanggalFix}</lastmod>\n`;
                }
                if (valFreq !== 'skip') {
                    xmlOutput += `    <changefreq>${valFreq}</changefreq>\n`;
                }
                if (valPriority !== 'skip') {
                    xmlOutput += `    <priority>${valPriority}</priority>\n`;
                }
                
                xmlOutput += `  </url>\n`;
            });

            xmlOutput += `</urlset>`;

            // Lempar ke Antarmuka
            situsiaDOMHasil.value = xmlOutput;
            situsiaDOMTotal.innerText = `Total URL: ${daftarUrlArray.length}`;
        }

        // ==========================================
        // FUNGSI COPY KE CLIPBOARD
        // ==========================================
        function situsiaSalinXML() {
            const hasilXML = situsiaDOMHasil.value.trim();
            if (!hasilXML || hasilXML.startsWith('<?xml') === false) {
                alert("Tidak ada kode XML valid untuk disalin. Generate terlebih dahulu.");
                return;
            }

            situsiaDOMHasil.select();
            document.execCommand('copy');
            window.getSelection().removeAllRanges(); // Deselect
            
            alert("Kode XML berhasil disalin ke clipboard!");
        }

        // ==========================================
        // FUNGSI DOWNLOAD FILE (.XML)
        // ==========================================
        function situsiaUnduhXML() {
            const hasilXML = situsiaDOMHasil.value.trim();
            if (!hasilXML || hasilXML.startsWith('<?xml') === false) {
                alert("Tidak ada kode XML valid untuk diunduh. Generate terlebih dahulu.");
                return;
            }

            // Buat objek Blob untuk file XML
            const blob = new Blob([hasilXML], { type: 'application/xml' });
            const urlBlob = URL.createObjectURL(blob);
            
            // Buat elemen <a> maya untuk memicu download
            const elemenUnduh = document.createElement('a');
            elemenUnduh.href = urlBlob;
            elemenUnduh.download = 'sitemap.xml';
            elemenUnduh.style.display = 'none';
            
            document.body.appendChild(elemenUnduh);
            elemenUnduh.click();
            
            // Bersihkan sisa elemen
            document.body.removeChild(elemenUnduh);
            URL.revokeObjectURL(urlBlob);
        }
