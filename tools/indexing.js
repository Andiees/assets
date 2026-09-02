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
        // VARIABEL DOM & KONFIGURASI
        // ==========================================
        const situsiaEndpointPublish = 'https://indexing.googleapis.com/v3/urlNotifications:publish';
        const situsiaEndpointMetadata = 'https://indexing.googleapis.com/v3/urlNotifications/metadata?url=';
        let situsiaMaxLimit = 200;
        let situsiaIsRunning = false;

        const situsiaDOMJson = document.getElementById('situsia-input-json');
        const situsiaDOMUrls = document.getElementById('situsia-input-url');
        const situsiaDOMAksi = document.getElementById('situsia-input-aksi');
        const situsiaDOMCounter = document.getElementById('situsia-angka-counter');
        const situsiaDOMTgl = document.getElementById('situsia-teks-tanggal');
        const situsiaDOMLog = document.getElementById('situsia-area-log');
        const situsiaBtnEksekusi = document.getElementById('situsia-btn-eksekusi');
        
        const situsiaModal = document.getElementById('situsia-modal-tutorial');
        const situsiaModalKonten = document.getElementById('situsia-modal-konten');

        // ==========================================
        // MODAL TUTORIAL
        // ==========================================
        function situsiaBukaTutorial() {
            situsiaModal.classList.remove('hidden');
            setTimeout(() => {
                situsiaModal.classList.remove('opacity-0');
                situsiaModalKonten.classList.remove('scale-95');
                situsiaModalKonten.classList.add('scale-100');
            }, 10);
        }

        function situsiaTutupTutorial() {
            situsiaModal.classList.add('opacity-0');
            situsiaModalKonten.classList.remove('scale-100');
            situsiaModalKonten.classList.add('scale-95');
            setTimeout(() => {
                situsiaModal.classList.add('hidden');
            }, 300);
        }

        // ==========================================
        // PENYIMPANAN & COUNTER
        // ==========================================
        function situsiaDapatkanTanggal() {
            const d = new Date();
            return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
        }

        function situsiaCekCounter() {
            const hariIni = situsiaDapatkanTanggal();
            const tersimpanTanggal = localStorage.getItem('situsia_gsc_tanggal');
            if (tersimpanTanggal !== hariIni) {
                localStorage.setItem('situsia_gsc_tanggal', hariIni);
                localStorage.setItem('situsia_gsc_counter', '0');
            }
            situsiaDOMTgl.innerText = hariIni;
            situsiaDOMCounter.innerText = localStorage.getItem('situsia_gsc_counter') || '0';
        }

        function situsiaTambahCounter() {
            let count = parseInt(localStorage.getItem('situsia_gsc_counter') || '0');
            count++;
            localStorage.setItem('situsia_gsc_counter', count.toString());
            situsiaDOMCounter.innerText = count;
            return count;
        }

        function situsiaResetCounter() {
            if(confirm("Yakin ingin mereset counter ke 0?")) {
                localStorage.setItem('situsia_gsc_counter', '0');
                situsiaDOMCounter.innerText = '0';
                situsiaCatatLog(">> Counter harian berhasil direset.", 'info');
            }
        }

        function situsiaSimpanPengaturan() {
            const jsonVal = situsiaDOMJson.value.trim();
            if(jsonVal !== "") {
                localStorage.setItem('situsia_gsc_json', jsonVal);
                const notif = document.getElementById('situsia-notif-simpan');
                notif.classList.remove('hidden');
                setTimeout(() => notif.classList.add('hidden'), 2000);
                situsiaCatatLog(">> Kredensial JSON berhasil disimpan.");
            }
        }

        function situsiaMuatPengaturan() {
            const jsonVal = localStorage.getItem('situsia_gsc_json');
            if (jsonVal) situsiaDOMJson.value = jsonVal;
        }

        // ==========================================
        // FUNGSI LOGGING
        // ==========================================
        function situsiaCatatLog(pesan, tipe = 'info') {
            const waktu = new Date().toLocaleTimeString();
            const el = document.createElement('div');
            let formatWaktu = `<span class="text-slate-500">[${waktu}]</span>`;
            
            if (tipe === 'error') el.innerHTML = `${formatWaktu} <span class="text-red-400 font-semibold">${pesan}</span>`;
            else if (tipe === 'sukses') el.innerHTML = `${formatWaktu} <span class="text-green-400 font-semibold">${pesan}</span>`;
            else if (tipe === 'peringatan') el.innerHTML = `${formatWaktu} <span class="text-yellow-400 font-semibold">${pesan}</span>`;
            else el.innerHTML = `${formatWaktu} <span class="text-slate-300">${pesan}</span>`;

            situsiaDOMLog.appendChild(el);
            situsiaDOMLog.scrollTop = situsiaDOMLog.scrollHeight;
        }

        function situsiaBersihkanLog() {
            situsiaDOMLog.innerHTML = '';
            situsiaCatatLog("Log dibersihkan.");
        }

        // ==========================================
        // JWT OAUTH2 GENERATOR
        // ==========================================
        async function situsiaDapatkanTokenAkses(jsonString) {
            try {
                const kredensial = JSON.parse(jsonString);
                if (!kredensial.client_email || !kredensial.private_key) {
                    throw new Error("JSON tidak valid.");
                }

                const header = { alg: 'RS256', typ: 'JWT' };
                const sekarang = Math.floor(Date.now() / 1000);
                const klaim = {
                    iss: kredensial.client_email,
                    scope: 'https://www.googleapis.com/auth/indexing',
                    aud: 'https://oauth2.googleapis.com/token',
                    exp: sekarang + 3600,
                    iat: sekarang
                };

                const sHeader = JSON.stringify(header);
                const sKlaim = JSON.stringify(klaim);
                const tokenJWT = KJUR.jws.JWS.sign("RS256", sHeader, sKlaim, kredensial.private_key);

                const respons = await fetch('https://oauth2.googleapis.com/token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${tokenJWT}`
                });

                const data = await respons.json();
                if (data.access_token) return data.access_token;
                else throw new Error(data.error_description || "Gagal otentikasi Google.");
            } catch (err) { throw err; }
        }

        // ==========================================
        // VALIDASI DOMAIN (CEK AKSES)
        // ==========================================
        async function situsiaValidasiDomain() {
            if (situsiaIsRunning) return;
            const jsonVal = situsiaDOMJson.value.trim();
            const urlVal = situsiaDOMUrls.value.trim();

            if (!jsonVal || !urlVal) {
                situsiaCatatLog("Validasi Gagal: Pastikan JSON dan Daftar URL telah diisi.", "error");
                return;
            }

            situsiaIsRunning = true;
            situsiaCatatLog(">> Memulai Validasi Izin Kepemilikan (Owner) Domain...");

            try {
                const daftarUrl = urlVal.split('\n').map(u => u.trim()).filter(u => u !== '');
                
                const domainUnik = [...new Set(daftarUrl.map(u => {
                    try { return new URL(u).origin; } catch(e) { return null; }
                }).filter(u => u !== null))];

                if (domainUnik.length === 0) {
                    throw new Error("Format URL tidak valid (Gunakan http/https).");
                }

                const accessToken = await situsiaDapatkanTokenAkses(jsonVal);

                for (let i = 0; i < domainUnik.length; i++) {
                    const domainTarget = domainUnik[i];
                    situsiaCatatLog(`Mengecek hak akses pada: ${domainTarget}`);

                    const resMeta = await fetch(`${situsiaEndpointMetadata}${encodeURIComponent(domainTarget)}`, {
                        method: 'GET',
                        headers: { 'Authorization': `Bearer ${accessToken}` }
                    });

                    if (resMeta.status === 403) {
                        situsiaCatatLog(`[DITOLAK] Email JSON belum dijadikan Owner di GSC untuk domain ${domainTarget}`, "error");
                    } else {
                        situsiaCatatLog(`[VALID] Izin GSC terkonfirmasi untuk domain ${domainTarget}`, "sukses");
                    }
                    await new Promise(r => setTimeout(r, 400));
                }
                situsiaCatatLog(">> Proses validasi selesai.");
            } catch (err) {
                situsiaCatatLog(`Validasi Gagal: ${err.message}`, "error");
            }
            situsiaIsRunning = false;
        }

        // ==========================================
        // PROSES EKSEKUSI INDEXING (PUBLISH/REMOVE)
        // ==========================================
        async function situsiaMulaiIndexing() {
            if (situsiaIsRunning) return;

            const jsonVal = situsiaDOMJson.value.trim();
            const urlVal = situsiaDOMUrls.value.trim();
            const tipeAksi = situsiaDOMAksi.value;

            if (!jsonVal || !urlVal) {
                situsiaCatatLog("Proses Gagal: Kotak JSON atau Daftar URL masih kosong!", "error");
                return;
            }

            const daftarUrl = urlVal.split('\n').map(u => u.trim()).filter(u => u !== '');
            const urlUnik = [...new Set(daftarUrl)];
            if (urlUnik.length === 0) return;

            situsiaIsRunning = true;
            situsiaBtnEksekusi.innerHTML = `<svg class="animate-spin w-5 h-5 mr-2 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Memproses...`;
            situsiaBtnEksekusi.classList.replace('bg-indigo-600', 'bg-indigo-400');
            situsiaBtnEksekusi.disabled = true;

            situsiaCatatLog(`>> Menginisialisasi otentikasi OAuth2...`);

            try {
                const accessToken = await situsiaDapatkanTokenAkses(jsonVal);
                situsiaCatatLog(`>> Otentikasi Berhasil. Memulai proses API (${tipeAksi}) untuk ${urlUnik.length} URL.`);

                for (let i = 0; i < urlUnik.length; i++) {
                    const hitunganSaatIni = parseInt(localStorage.getItem('situsia_gsc_counter') || '0');
                    if (hitunganSaatIni >= situsiaMaxLimit) {
                        situsiaCatatLog("PERINGATAN: Batas maksimal 200 URL/hari telah tercapai. Proses dihentikan.", "peringatan");
                        break;
                    }

                    const targetUrl = urlUnik[i];
                    situsiaCatatLog(`Mengirim: ${targetUrl}`);

                    try {
                        const payload = { url: targetUrl, type: tipeAksi };
                        const responsApi = await fetch(situsiaEndpointPublish, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${accessToken}`
                            },
                            body: JSON.stringify(payload)
                        });

                        if (responsApi.ok) {
                            situsiaCatatLog(`[OK] Sukses: ${targetUrl}`, "sukses");
                            situsiaTambahCounter();
                        } else {
                            const dataErr = await responsApi.json();
                            situsiaCatatLog(`[Error ${responsApi.status}] ${dataErr.error?.message || 'Gagal push ke API'}`, "error");
                        }
                    } catch (errApi) {
                        situsiaCatatLog(`[Timeout/Error] ${errApi.message}`, "error");
                    }
                    
                    // Logika Jeda Acak (5 hingga 20 detik) dengan Hitung Mundur
                    if (i < urlUnik.length - 1) {
                        const situsiaJedaMin = 5000;
                        const situsiaJedaMax = 20000;
                        const situsiaJedaRandom = Math.floor(Math.random() * (situsiaJedaMax - situsiaJedaMin + 1)) + situsiaJedaMin;
                        const situsiaJedaDetik = Math.ceil(situsiaJedaRandom / 1000);
                        
                        situsiaCatatLog(`[Jeda Acak] Menunggu ${situsiaJedaDetik} detik...`, 'info');
                        
                        for (let s = situsiaJedaDetik; s > 0; s--) {
                            situsiaBtnEksekusi.innerHTML = `<svg class="animate-spin w-5 h-5 mr-2 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Jeda: ${s} detik...`;
                            await new Promise(r => setTimeout(r, 1000));
                        }
                        
                        situsiaBtnEksekusi.innerHTML = `<svg class="animate-spin w-5 h-5 mr-2 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Memproses...`;
                    }
                }
                situsiaCatatLog(`>> Eksekusi antrean URL selesai.`);
            } catch (errAuth) {
                situsiaCatatLog(`Otentikasi Gagal: ${errAuth.message}`, "error");
            }

            situsiaIsRunning = false;
            situsiaBtnEksekusi.innerHTML = `<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> Mulai Eksekusi API`;
            situsiaBtnEksekusi.classList.replace('bg-indigo-400', 'bg-indigo-600');
            situsiaBtnEksekusi.disabled = false;
        }

        // ==========================================
        // INIT KETIKA DIMUAT
        // ==========================================
        window.onload = () => {
            situsiaCekCounter();
            situsiaMuatPengaturan();
        };
