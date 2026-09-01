// Mencegah klik kanan / View Source dengan CTRL+U
        document.addEventListener("keydown", function(event) {
            if (event.ctrlKey && event.key === "u") {
                event.preventDefault();
            }
        });

        // Fungsi Utama Penghapus Duplikat
        function situsiaHapusDuplikat() {
            const situsiaInputTeks = document.getElementById('situsia-input-teks').value.trim();
            const situsiaInputAwalan = document.getElementById('situsia-input-awalan').value.trim();
            const situsiaInputAkhiran = document.getElementById('situsia-input-akhiran').value.trim();
            
            const situsiaPesanError = document.getElementById('situsia-pesan-error');
            const situsiaAreaHasil = document.getElementById('situsia-area-hasil');
            const situsiaHasilOutput = document.getElementById('situsia-hasil-output');
            const situsiaCounterTeks = document.getElementById('situsia-counter-teks');

            // Reset pesan error
            situsiaPesanError.textContent = '';
            situsiaPesanError.classList.add('hidden');

            // Validasi Input Kosong
            if (situsiaInputTeks === '') {
                situsiaPesanError.textContent = 'Harap masukkan teks sumber terlebih dahulu!';
                situsiaPesanError.classList.remove('hidden');
                situsiaAreaHasil.classList.add('hidden');
                return;
            }

            // Proses pemisahan baris, menghapus spasi ekstra, dan membuang baris kosong
            const situsiaBarisData = situsiaInputTeks.split('\n').map(baris => baris.trim()).filter(baris => baris !== '');
            const situsiaTotalAwal = situsiaBarisData.length;
            
            // Set() digunakan untuk memfilter nilai yang sama secara otomatis (unik)
            const situsiaDataUnik = [...new Set(situsiaBarisData)];
            const situsiaTotalUnik = situsiaDataUnik.length;

            if (situsiaTotalUnik === 0) {
                situsiaPesanError.textContent = 'Tidak ada baris teks unik yang ditemukan!';
                situsiaPesanError.classList.remove('hidden');
                situsiaAreaHasil.classList.add('hidden');
                return;
            }

            // Menerapkan Awalan & Akhiran jika ada
            const situsiaTeksFinal = situsiaDataUnik.map(baris => {
                let situsiaBarisModif = situsiaInputAwalan ? `${situsiaInputAwalan} ${baris}` : baris;
                situsiaBarisModif = situsiaInputAkhiran ? `${situsiaBarisModif} ${situsiaInputAkhiran}` : situsiaBarisModif;
                return situsiaBarisModif;
            }).join('\n');

            // Menampilkan Hasil ke DOM
            situsiaHasilOutput.textContent = situsiaTeksFinal;
            
            // Menampilkan Counter dengan styling Tailwind
            situsiaCounterTeks.innerHTML = `
                <span class="font-semibold text-slate-600">Baris Awal: <span class="text-indigo-600">${situsiaTotalAwal}</span></span> 
                <span class="mx-2 text-slate-300">|</span> 
                <span class="font-semibold text-slate-600">Baris Unik: <span class="text-green-600">${situsiaTotalUnik}</span></span>
            `;
            
            // Memunculkan kotak hasil
            situsiaAreaHasil.classList.remove('hidden');
        }

        // Fungsi Salin Hasil
        function situsiaSalinHasil() {
            const situsiaTeksTersalin = document.getElementById('situsia-hasil-output').textContent;
            const situsiaBtnCopy = document.getElementById('situsia-btn-copy');

            if (situsiaTeksTersalin === '') {
                alert('Tidak ada hasil yang tersedia untuk disalin!');
                return;
            }
            
            // Membuat elemen textarea sementara untuk proses copy
            const situsiaTempTextarea = document.createElement('textarea');
            situsiaTempTextarea.value = situsiaTeksTersalin;
            document.body.appendChild(situsiaTempTextarea);
            situsiaTempTextarea.select();
            document.execCommand('copy');
            document.body.removeChild(situsiaTempTextarea);
            
            // Animasi tombol copy sukses
            const originalHTML = situsiaBtnCopy.innerHTML;
            situsiaBtnCopy.innerHTML = `<svg class="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Tersalin!`;
            situsiaBtnCopy.classList.add('bg-green-50', 'text-green-700', 'border-green-300');
            
            setTimeout(() => {
                situsiaBtnCopy.innerHTML = originalHTML;
                situsiaBtnCopy.classList.remove('bg-green-50', 'text-green-700', 'border-green-300');
            }, 2000);
        }
