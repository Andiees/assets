<script type="text/javascript">
        // Variabel Utama
        var situsiaKeywords = [];
        var situsiaHashMap = {};
        var situsiaInitialCount = 0;
        var situsiaIsRunning = false;
        var situsiaQueryQueue = [];
        var situsiaQueryIndex = 0;
        var situsiaQueryFlag = false;
        var situsiaCurrentFiltered = []; // Simpan data filter terakhir

        function situsiaMulai() {
            if (!situsiaIsRunning) {
                var inputVal = $('#situsia-input').val().trim();
                if(!inputVal) {
                    alert("Silakan masukkan setidaknya 1 kata kunci.");
                    return;
                }

                situsiaKeywords = [];
                situsiaHashMap = {};
                situsiaQueryQueue = [];
                situsiaQueryIndex = 0;
                situsiaHashMap[""] = 1;

                var ks = inputVal.split("\n");
                for (var i = 0; i < ks.length; i++) {
                    var cleanKw = ks[i].trim();
                    if(cleanKw === "") continue;

                    situsiaQueryQueue.push(cleanKw);
                    situsiaKeywords.push(cleanKw);

                    // Alfabet A-Z
                    for (var j = 0; j < 26; j++) {
                        var chr = String.fromCharCode(97 + j);
                        var currentx = cleanKw + ' ' + chr;
                        situsiaQueryQueue.push(currentx);
                        situsiaHashMap[currentx] = 1;
                    }
                }
                situsiaInitialCount = situsiaKeywords.length;
                situsiaFilterData();

                situsiaIsRunning = true;
                $('#situsia-start-btn').html('<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"></path></svg> Stop Generator')
                                     .removeClass('bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200')
                                     .addClass('bg-red-500 hover:bg-red-600 shadow-red-200');
            } else {
                situsiaIsRunning = false;
                $('#situsia-start-btn').html('<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Lanjutkan')
                                     .removeClass('bg-red-500 hover:bg-red-600 shadow-red-200')
                                     .addClass('bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200');
            }
        }

        function situsiaProsesQueue() {
            if (situsiaIsRunning && !situsiaQueryFlag) {
                if (situsiaQueryIndex < situsiaQueryQueue.length) {
                    var currentKw = situsiaQueryQueue[situsiaQueryIndex];
                    situsiaAmbilData(currentKw);
                    situsiaQueryIndex++;
                } else {
                    if (situsiaInitialCount !== situsiaKeywords.length) {
                        situsiaIsRunning = false;
                        $('#situsia-start-btn').html('<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Selesai (Ulangi)')
                                             .removeClass('bg-red-500 hover:bg-red-600 shadow-red-200')
                                             .addClass('bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200');
                    } else {
                        situsiaQueryIndex = 0;
                    }
                }
            }
        }

        function situsiaAmbilData(keyword) {
            situsiaQueryFlag = true;

            $.ajax({
                url: "https://suggestqueries.google.com/complete/search",
                jsonp: "jsonp",
                dataType: "jsonp",
                data: { q: keyword, client: "chrome" },
                success: function(res) {
                    var retList = res[1];
                    for (var i = 0; i < retList.length; i++) {
                        var currents = situsiaBersihkan(retList[i]);
                        if (!situsiaHashMap[currents]) {
                            situsiaHashMap[currents] = 1;
                            situsiaKeywords.push(currents);
                            situsiaQueryQueue.push(currents);
                        }
                    }
                    situsiaQueryFlag = false;
                    situsiaFilterData();
                }
            });
        }

        function situsiaBersihkan(value) {
            return value.replace(/[^\x20-\x7E]/g, '').replace(/\s\s+/g, ' ');
        }

        function situsiaFilterData() {
            var numWords = parseInt($('#situsia-min').val(), 10);
            var searchTxt = $('#situsia-search').val().toLowerCase();
            var posFilter = $('#situsia-positive').val().toLowerCase().split("\n").filter(f => f.trim() !== "");
            var negFilter = $('#situsia-negative').val().toLowerCase().split("\n").filter(f => f.trim() !== "");

            var filtered = situsiaKeywords.filter(function(keyword) {
                if (searchTxt && !keyword.includes(searchTxt)) return false;
                if (numWords > 0 && keyword.split(" ").length < numWords) return false;

                for (var i = 0; i < posFilter.length; i++) {
                    if (!keyword.includes(posFilter[i])) return false;
                }

                for (var i = 0; i < negFilter.length; i++) {
                    if (keyword.includes(negFilter[i])) return false;
                }

                return true;
            });

            // Sorting Logic
            var sortVal = $('#situsia-sort').val();
            if (sortVal === 'az') {
                filtered.sort();
            } else if (sortVal === 'za') {
                filtered.sort().reverse();
            } else if (sortVal === 'len_asc') {
                filtered.sort(function(a, b){ return a.length - b.length });
            } else if (sortVal === 'len_desc') {
                filtered.sort(function(a, b){ return b.length - a.length });
            }

            situsiaCurrentFiltered = filtered;
            $('#situsia-count').html(`Total: <span class="font-bold">${situsiaInitialCount}</span> / <span class="font-bold">${filtered.length}</span>`);

            situsiaTampilkan(filtered);
        }

        function situsiaTampilkan(results) {
            var tbody = $('#situsia-tbody');
            tbody.empty();

            if(results.length === 0) {
                 tbody.append('<tr><td colspan="3" class="px-6 py-8 text-center text-slate-400 italic">Tidak ada kata kunci yang ditemukan.</td></tr>');
                 return;
            }

            for (var i = 0; i < results.length; i++) {
                var encodedKw = encodeURIComponent(results[i]);
                
                tbody.append(`
                    <tr class="hover:bg-indigo-50/50 transition-colors group">
                        <td class="px-6 py-4 text-center font-medium text-slate-400 w-20">${i + 1}</td>
                        <td class="px-6 py-4 text-slate-700 font-medium">${results[i]}</td>
                        <td class="px-6 py-4 w-48 text-center">
                            <div class="flex justify-center gap-2 situsia-row-action">
                                <button onclick="situsiaSalinSatu('${encodedKw}')" title="Copy Keyword" class="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-100 rounded transition-colors">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                </button>
                                <button onclick="situsiaCariGoogle('${encodedKw}')" title="Cari di Google" class="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-100 rounded transition-colors">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                </button>
                                <button onclick="situsiaHapusSatu('${encodedKw}')" title="Hapus Keyword" class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded transition-colors">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </button>
                            </div>
                        </td>
                    </tr>
                `);
            }
        }

        // --- FITUR BARU ---

        // Salin 1 kata kunci
        function situsiaSalinSatu(encodedKw) {
            var keyword = decodeURIComponent(encodedKw);
            navigator.clipboard.writeText(keyword);
        }

        // Buka pencarian Google di tab baru
        function situsiaCariGoogle(encodedKw) {
            var keyword = decodeURIComponent(encodedKw);
            window.open('https://www.google.com/search?q=' + encodeURIComponent(keyword), '_blank');
        }

        // Hapus 1 kata kunci dari daftar
        function situsiaHapusSatu(encodedKw) {
            var keyword = decodeURIComponent(encodedKw);
            situsiaKeywords = situsiaKeywords.filter(function(k) { return k !== keyword });
            delete situsiaHashMap[keyword];
            situsiaFilterData();
        }

        // Salin Semua Hasil (Yang lolos filter)
        function situsiaCopySemua() {
            if(situsiaCurrentFiltered.length === 0) {
                alert("Tidak ada kata kunci untuk disalin.");
                return;
            }
            var text = situsiaCurrentFiltered.join("\n");
            navigator.clipboard.writeText(text).then(function() {
                var btn = $('#situsia-copy-btn');
                var originalHtml = btn.html();
                btn.html('<svg class="w-4 h-4 mr-1.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Berhasil!');
                setTimeout(() => btn.html(originalHtml), 2000);
            });
        }

        // Download data sebagai CSV
        function situsiaDownloadCSV() {
            if(situsiaCurrentFiltered.length === 0) {
                alert("Tidak ada kata kunci untuk diexport.");
                return;
            }
            // Tambahkan header CSV
            var csvContent = "Keyword\n" + situsiaCurrentFiltered.join("\n");
            var element = document.createElement("a");
            element.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent));
            element.setAttribute("download", "situsia-keywords.csv");
            element.style.display = "none";
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        }

        // Membersihkan seluruh data
        function situsiaBersihkanData() {
            if(confirm("Apakah Anda yakin ingin menghapus semua hasil?")) {
                situsiaKeywords = [];
                situsiaHashMap = {};
                situsiaQueryQueue = [];
                situsiaQueryIndex = 0;
                situsiaInitialCount = 0;
                situsiaIsRunning = false;
                
                $('#situsia-start-btn').html('<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Mulai Generate')
                                     .removeClass('bg-red-500 hover:bg-red-600 shadow-red-200')
                                     .addClass('bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200');
                                     
                $('#situsia-input').val('');
                situsiaFilterData();
            }
        }

        // Interval Worker
        setInterval(situsiaProsesQueue, 200);
        
        // Event Listeners
        $('#situsia-start-btn').on('click', situsiaMulai);
        $('#situsia-search, #situsia-min, #situsia-positive, #situsia-negative, #situsia-sort').on('input change', function() {
            situsiaFilterData();
        });
        
        // Mencegah CTRL+U
        document.addEventListener("keydown", function(event) {
            if (event.ctrlKey && event.key === "u") {
                event.preventDefault(); 
            }
        });
    </script>
