<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Settings
        DB::table('settings')->insert([
            ['key' => 'nama_instansi', 'value' => 'Dinas Pertanian Daerah SIMDATAN', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'logo_path', 'value' => '/images/logo-dinas.png', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'alamat', 'value' => 'Jl. Jenderal Sudirman No. 45, Kompleks Perkantoran Pemda', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'kontak', 'value' => '021-5551234 / info@simdatan.go.id', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'tahun_aktif', 'value' => '2026', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'tema_sistem', 'value' => 'dark', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // 2. Seed Users
        $defaultPassword = Hash::make('password');
        DB::table('users')->insert([
            [
                'name' => 'Administrator Utama',
                'email' => 'admin@simdatan.go.id',
                'password' => $defaultPassword,
                'role' => 'admin',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Supervisor Dinas',
                'email' => 'supervisor@simdatan.go.id',
                'password' => $defaultPassword,
                'role' => 'supervisor',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Petugas Lapangan Riau',
                'email' => 'petugas@simdatan.go.id',
                'password' => $defaultPassword,
                'role' => 'petugas',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
        ]);

        // 3. Seed 10 Wilayah (Kecamatan & Desa di Riau)
        $wilayahNames = [
            'Pekanbaru Kota' => 'Kota Tinggi',
            'Tampan' => 'Simpang Baru',
            'Rumbai' => 'Sri Meranti',
            'Bukit Raya' => 'Simpang Tiga',
            'Tenayan Raya' => 'Rejosari',
            'Siak' => 'Kampung Dalam',
            'Minas' => 'Minas Jaya',
            'Tualang' => 'Perawang',
            'Bangkinang' => 'Bangkinang Kota',
            'Tapung' => 'Petapahan'
        ];

        $kecamatanIds = [];
        $desaIds = [];
        $i = 1;
        foreach ($wilayahNames as $kecName => $desaName) {
            $kecId = DB::table('kecamatan')->insertGetId([
                'kode_kecamatan' => 'KEC-' . str_pad($i, 3, '0', STR_PAD_LEFT),
                'nama_kecamatan' => $kecName,
                'created_at' => now(),
                'updated_at' => now()
            ]);
            $kecamatanIds[] = $kecId;

            $desaId = DB::table('desa')->insertGetId([
                'kecamatan_id' => $kecId,
                'kode_desa' => 'DES-' . str_pad($i, 3, '0', STR_PAD_LEFT),
                'nama_desa' => $desaName,
                'created_at' => now(),
                'updated_at' => now()
            ]);
            $desaIds[] = $desaId;
            $i++;
        }

        // 4. Seed 20 Kelompok Tani (2 Kelompok per Desa)
        $kelompokIds = [];
        for ($k = 1; $k <= 20; $k++) {
            $desaId = $desaIds[($k - 1) % 10];
            $kelompokId = DB::table('kelompok_tani')->insertGetId([
                'desa_id' => $desaId,
                'nama_kelompok' => 'Kelompok Tani ' . ($k % 2 == 0 ? 'Maju Bersama ' : 'Sumber Rejeki ') . $k,
                'ketua_nama' => 'Ketua ' . ['Budi', 'Asep', 'Dadang', 'Agus', 'Sutisna', 'Wawan'][$k % 6] . ' ' . $k,
                'tahun_berdiri' => 2010 + ($k % 15),
                'alamat' => 'Kampung Sawah No. ' . $k . ', Desa ' . $desaId,
                'created_at' => now(),
                'updated_at' => now()
            ]);
            $kelompokIds[] = $kelompokId;
        }

        // 5. Seed 50 Petani
        $petaniIds = [];
        $firstNames = ['Agus', 'Budi', 'Candra', 'Dadang', 'Eko', 'Fajar', 'Gunawan', 'Heri', 'Iwan', 'Joko', 'Kurnia', 'Laksana', 'Mulyono', 'Novi', 'Oki', 'Prabowo', 'Rian', 'Sutisna', 'Teguh', 'Ujang', 'Wawan', 'Yanto', 'Siti', 'Dewi', 'Sri', 'Ani', 'Lilis', 'Ratna', 'Euis', 'Yati'];
        $lastNames = ['Pratama', 'Hidayat', 'Santoso', 'Wijaya', 'Kusuma', 'Saputra', 'Setiawan', 'Nugroho', 'Gunawan', 'Sutrisno', 'Bahar', 'Siregar', 'Lubis', 'Hadi', 'Mulyadi'];
        
        for ($p = 1; $p <= 50; $p++) {
            $kelompokId = $kelompokIds[($p - 1) % 20];
            $fn = $firstNames[($p * 7) % count($firstNames)];
            $ln = $lastNames[($p * 11) % count($lastNames)];
            $jk = (($p * 3) % 2 === 0) ? 'L' : 'P';
            
            $petaniId = DB::table('petani')->insertGetId([
                'kelompok_tani_id' => $kelompokId,
                'nik' => '32010' . str_pad($p, 11, '0', STR_PAD_LEFT),
                'nama' => $fn . ' ' . $ln,
                'jenis_kelamin' => $jk,
                'tanggal_lahir' => '1965-05-' . str_pad(($p % 28) + 1, 2, '0', STR_PAD_LEFT),
                'nomor_hp' => '0812' . str_pad($p * 1234, 8, '0', STR_PAD_LEFT),
                'alamat' => 'Kampung Tani No. ' . $p,
                'foto_path' => null,
                'status' => 'aktif',
                'tanggal_bergabung' => '2018-01-10',
                'created_at' => now(),
                'updated_at' => now()
            ]);
            $petaniIds[] = $petaniId;
        }

        // 6. Seed 100 Lahan (2 per Petani)
        $lahanIds = [];
        $luasOptions = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0];
        // Latitude Longitude centered near Pekanbaru, Riau (0.507000, 101.447000)
        for ($l = 1; $l <= 100; $l++) {
            $petaniId = $petaniIds[($l - 1) % 50];
            $luas = $luasOptions[$l % count($luasOptions)];
            $lat = 0.507000 + ($l * 0.002);
            $lng = 101.447000 + ($l * 0.003);
            
            $lahanId = DB::table('lahan')->insertGetId([
                'pemilik_petani_id' => $petaniId,
                'kode_lahan' => 'LHN-' . str_pad($l, 3, '0', STR_PAD_LEFT),
                'nama_lahan' => 'Sawah ' . ['Blok Utara', 'Blok Selatan', 'Blok Kulon', 'Blok Wetan'][$l % 4] . ' L-' . $l,
                'luas_ha' => $luas,
                'status_kepemilikan' => ['Milik Sendiri', 'Sewa', 'Bagi Hasil'][$l % 3],
                'latitude' => $lat,
                'longitude' => $lng,
                'foto_path' => null,
                'dokumen_pendukung_path' => null,
                'created_at' => now(),
                'updated_at' => now()
            ]);
            $lahanIds[] = [
                'id' => $lahanId,
                'luas' => $luas
            ];
        }

        // 7. Seed 15 Komoditas
        $commodities = [
            ['kode' => 'KMD-PADI', 'nama' => 'Padi Sawah', 'kategori' => 'Pangan', 'satuan' => 'Ton', 'harga' => 6500000.00],
            ['kode' => 'KMD-JAGUNG', 'nama' => 'Jagung Pakan', 'kategori' => 'Pangan', 'satuan' => 'Ton', 'harga' => 4200000.00],
            ['kode' => 'KMD-KEDELAI', 'nama' => 'Kedelai Lokal', 'kategori' => 'Pangan', 'satuan' => 'Ton', 'harga' => 9800000.00],
            ['kode' => 'KMD-CABE-M', 'nama' => 'Cabai Merah', 'kategori' => 'Hortikultura', 'satuan' => 'Kg', 'harga' => 35000.00],
            ['kode' => 'KMD-CABE-R', 'nama' => 'Cabai Rawit', 'kategori' => 'Hortikultura', 'satuan' => 'Kg', 'harga' => 45000.00],
            ['kode' => 'KMD-BAWANG-M', 'nama' => 'Bawang Merah', 'kategori' => 'Hortikultura', 'satuan' => 'Kg', 'harga' => 28000.00],
            ['kode' => 'KMD-BAWANG-P', 'nama' => 'Bawang Putih', 'kategori' => 'Hortikultura', 'satuan' => 'Kg', 'harga' => 32000.00],
            ['kode' => 'KMD-KENTANG', 'nama' => 'Kentang Granola', 'kategori' => 'Hortikultura', 'satuan' => 'Kg', 'harga' => 15000.00],
            ['kode' => 'KMD-TOMAT', 'nama' => 'Tomat Apel', 'kategori' => 'Hortikultura', 'satuan' => 'Kg', 'harga' => 12000.00],
            ['kode' => 'KMD-KUBIS', 'nama' => 'Kubis Bulat', 'kategori' => 'Hortikultura', 'satuan' => 'Kg', 'harga' => 8000.00],
            ['kode' => 'KMD-WORTEL', 'nama' => 'Wortel Lokal', 'kategori' => 'Hortikultura', 'satuan' => 'Kg', 'harga' => 10000.00],
            ['kode' => 'KMD-SINGKONG', 'nama' => 'Singkong Mentega', 'kategori' => 'Pangan', 'satuan' => 'Ton', 'harga' => 2000000.00],
            ['kode' => 'KMD-KELAPA', 'nama' => 'Kelapa Dalam', 'kategori' => 'Perkebunan', 'satuan' => 'Kg', 'harga' => 6000.00],
            ['kode' => 'KMD-KOPI', 'nama' => 'Kopi Arabika', 'kategori' => 'Perkebunan', 'satuan' => 'Kg', 'harga' => 95000.00],
            ['kode' => 'KMD-KAKAO', 'nama' => 'Kakao Kering', 'kategori' => 'Perkebunan', 'satuan' => 'Kg', 'harga' => 48000.00]
        ];

        $komoditasIds = [];
        foreach ($commodities as $c) {
            $komoditasId = DB::table('komoditas')->insertGetId([
                'kode_komoditas' => $c['kode'],
                'nama_komoditas' => $c['nama'],
                'kategori' => $c['kategori'],
                'satuan' => $c['satuan'],
                'harga_acuan' => $c['harga'],
                'foto_path' => null,
                'deskripsi' => 'Komoditas unggul binaan Dinas Pertanian untuk ketahanan pangan.',
                'created_at' => now(),
                'updated_at' => now()
            ]);
            $komoditasIds[] = [
                'id' => $komoditasId,
                'satuan' => $c['satuan']
            ];
        }

        // 8. Seed 500 Produksi Panen (5 cycles per Lahan)
        // Cycles will span 2024 (Season 1, 2, 3), 2025 (Season 1, 2, 3), and 2026 (Active)
        $statusOptions = ['Sudah Panen', 'Sudah Panen', 'Sudah Panen', 'Gagal Panen'];
        $musimOptions = ['Musim Hujan', 'Musim Kemarau I', 'Musim Kemarau II'];
        
        $produksiRecords = [];
        $recordCounter = 0;
        
        for ($cycle = 0; $cycle < 5; $cycle++) {
            $year = 2024 + intval($cycle / 2); // 2024, 2024, 2025, 2025, 2026
            $musim = $musimOptions[$cycle % 3];
            
            foreach ($lahanIds as $lInfo) {
                if ($recordCounter >= 500) {
                    break;
                }
                
                $lId = $lInfo['id'];
                $luas = $lInfo['luas'];
                
                // Select commodity based on land ID to keep patterns
                $cIndex = ($lId + $cycle) % 15;
                $komoditasId = $komoditasIds[$cIndex]['id'];
                $satuan = $komoditasIds[$cIndex]['satuan'];
                
                // Define dates
                $tanamOffset = ($cycle * 100) + 10;
                $tglTanam = date('Y-m-d', strtotime("2024-01-15 +{$tanamOffset} days"));
                $tglPanenEst = date('Y-m-d', strtotime("{$tglTanam} +100 days"));
                
                $status = 'Sudah Panen';
                // Active cycle is 2026 (cycle 4)
                if ($cycle === 4) {
                    $status = ['Sedang Tanam', 'Akan Panen', 'Belum Tanam'][$lId % 3];
                } else {
                    $status = $statusOptions[$lId % count($statusOptions)];
                }
                
                $hasil = null;
                $prod = null;
                $tglPanenAktual = null;
                
                if ($status === 'Sudah Panen') {
                    // Normal Yield: Padi produces ~5-8 Tons per Hectare
                    // If Kg (like Cabai), produces ~10,000-15,000 Kg (10-15 Tons) per Hectare
                    $yieldPerHa = ($satuan === 'Ton') ? (4.0 + ($lId % 4)) : (8000 + ($lId % 4000));
                    $hasil = round($luas * $yieldPerHa, 2);
                    $prod = round($hasil / $luas, 2);
                    $tglPanenAktual = date('Y-m-d', strtotime("{$tglPanenEst} +" . ($lId % 5) . " days"));
                } elseif ($status === 'Gagal Panen') {
                    $hasil = 0.00;
                    $prod = 0.00;
                    $tglPanenAktual = $tglPanenEst;
                }
                
                $produksiRecords[] = [
                    'lahan_id' => $lId,
                    'komoditas_id' => $komoditasId,
                    'musim_tanam' => $musim,
                    'tahun_tanam' => $year,
                    'tanggal_tanam' => $tglTanam,
                    'tanggal_panen_estimasi' => $tglPanenEst,
                    'tanggal_panen_aktual' => $tglPanenAktual,
                    'status_panen' => $status,
                    'hasil_panen' => $hasil,
                    'satuan' => $satuan,
                    'produktivitas' => $prod,
                    'keterangan' => ($status === 'Gagal Panen') ? 'Terserang hama wereng coklat.' : 'Hasil panen melimpah, kualitas prima.',
                    'created_at' => now(),
                    'updated_at' => now()
                ];
                
                $recordCounter++;
            }
        }
        
        // Bulk insert in chunks of 100 to optimize performance
        foreach (array_chunk($produksiRecords, 100) as $chunk) {
            DB::table('produksi_panen')->insert($chunk);
        }
    }
}
