// Mencegah CTRL+U
        document.addEventListener("keydown", function(event) {
            if (event.ctrlKey && event.key === "u") {
                event.preventDefault();
            }
        });

        // Format huruf kapital di awal setiap kata (Title Case)
        function situsiaFormatTitleCase(str) {
            return str.replace(/\w\S*/g, function(txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        }

        // Fungsi Utama Generate
        function situsiaGenerateKombinasi() {
            // Ambil data dan bersihkan array dari elemen kosong
            const situsiaVal1 = document.getElementById('situsia-input-awal').value.split(';').map(i => i.trim()).filter(i => i !== '');
            const situsiaVal2 = document.getElementById('situsia-input-utama').value.split(';').map(i => i.trim()).filter(i => i !== '');
            const situsiaVal3 = document.getElementById('situsia-input-ekor1').value.split(';').map(i => i.trim()).filter(i => i !== '');
            const situsiaVal4 = document.getElementById('situsia-input-ekor2').value.split(';').map(i => i.trim()).filter(i => i !== '');
            
            const situsiaKumpulanHasil = new Set();

            // Aturan fallback agar loop tetap berjalan jika salah satu kotak kosong
            const arr1 = situsiaVal1.length === 0 ? [''] : situsiaVal1;
            const arr2 = situsiaVal2.length === 0 ? [''] : situsiaVal2;
            const arr3 = situsiaVal3.length === 0 ? [''] : situsiaVal3;
            const arr4 = situsiaVal4.length === 0 ? [''] : situsiaVal4;

            // Proses Kombinasi Silang (Cross Join)
            for (let a of arr1) {
                for (let b of arr2) {
                    for (let c of arr3) {
                        for (let d of arr4) {
                            if (a !== '' || b !== '' || c !== '' || d !== '') {
                                const situsiaGabungan = `${a} ${b} ${c} ${d}`.replace(/\s+/g, ' ').trim();
                                if (situsiaGabungan !== '') {
                                    situsiaKumpulanHasil.add(situsiaFormatTitleCase(situsiaGabungan));
                                }
                            }
                        }
                    }
                }
            }

            // Tampilkan Data ke Tabel
            const situsiaTbody = document.getElementById('situsia-tbody-hasil');
            const situsiaArea = document.getElementById('situsia-area-hasil');
            const situsiaTotal = document.getElementById('situsia-total-teks');
            const situsiaTeksRahasia = document.getElementById('situsia-teks-rahasia');
            
            situsiaTbody.innerHTML = '';
            let nomorUrut = 1;
            let teksUntukDisalin = '';

            if (situsiaKumpulanHasil.size === 0) {
                situsiaTbody.innerHTML = `<tr><td colspan="2" class="px-6 py-8 text-center text-slate-400 italic">Isi minimal satu kolom input untuk menghasilkan keyword.</td></tr>`;
                situsiaArea.classList.remove('hidden');
                situsiaTotal.innerText = `Total: 0`;
                situsiaTeksRahasia.value = '';
                return;
            }

            situsiaKumpulanHasil.forEach(keyword => {
                // Render ke tabel (menambahkan ; sesuai format kustom Anda sebelumnya, atau biarkan bersih. Saya biarkan bersih tanpa ; agar lebih SEO friendly jika dicopy, tambahkan ; di teksUntukDisalin jika butuh)
                situsiaTbody.innerHTML += `
                    <tr class="hover:bg-indigo-50/50 transition-colors">
                        <td class="px-6 py-3 text-center font-medium text-slate-400 w-16">${nomorUrut}</td>
                        <td class="px-6 py-3 text-slate-700 font-medium">${keyword}</td>
                    </tr>
                `;
                teksUntukDisalin += `${keyword}\n`;
                nomorUrut++;
            });

            // Update UI
            situsiaTotal.innerText = `Total: ${situsiaKumpulanHasil.size}`;
            situsiaTeksRahasia.value = teksUntukDisalin.trim();
            situsiaArea.classList.remove('hidden');
        }

        // Fungsi Menyalin Hasil
        function situsiaCopyHasil() {
            const situsiaTeks = document.getElementById('situsia-teks-rahasia');
            const situsiaBtnCopy = document.getElementById('situsia-btn-copy');

            if (!situsiaTeks.value || situsiaTeks.value === '') {
                alert('Belum ada keyword yang dihasilkan untuk disalin!');
                return;
            }

            // Un-hide sementara untuk di-select, lalu hide lagi
            situsiaTeks.classList.remove('hidden');
            situsiaTeks.select();
            document.execCommand('copy');
            situsiaTeks.classList.add('hidden');
            
            // Efek visual tombol berhasil disalin
            const originalHTML = situsiaBtnCopy.innerHTML;
            situsiaBtnCopy.innerHTML = `<svg class="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Tersalin!`;
            situsiaBtnCopy.classList.add('bg-green-50', 'text-green-700', 'border-green-300');
            
            setTimeout(() => {
                situsiaBtnCopy.innerHTML = originalHTML;
                situsiaBtnCopy.classList.remove('bg-green-50', 'text-green-700', 'border-green-300');
            }, 2000);
        }
