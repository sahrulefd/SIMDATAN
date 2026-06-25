<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Lahan;
use App\Models\Komoditas;
use App\Models\ProduksiPanen;
use App\Models\ApprovalWorkflow;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthApprovalTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Seed database
        $this->seed();
    }

    /**
     * Test successful login.
     */
    public function test_user_can_login_with_valid_credentials(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@simdatan.go.id',
            'password' => 'password',
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'access_token',
                     'token_type',
                     'user' => [
                         'id',
                         'name',
                         'email',
                         'role',
                     ]
                 ]);
    }

    /**
     * Test login failure with incorrect credentials.
     */
    public function test_user_cannot_login_with_invalid_credentials(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@simdatan.go.id',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401)
                 ->assertJson([
                     'success' => false,
                     'message' => 'Email atau password salah.',
                 ]);
    }

    /**
     * Test Petugas workflow (submit a crop record and check workflow status).
     */
    public function test_petugas_can_submit_produksi_panen_initiates_workflow(): void
    {
        // Login as petugas
        $petugas = User::where('email', 'petugas@simdatan.go.id')->first();
        $token = auth('api')->login($petugas);

        $lahan = Lahan::first();
        $komoditas = Komoditas::first();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/v1/produksi-panen', [
            'lahan_id' => $lahan->id,
            'komoditas_id' => $komoditas->id,
            'musim_tanam' => 'Musim Kemarau III',
            'tahun_tanam' => 2026,
            'tanggal_tanam' => '2026-06-01',
            'tanggal_panen_estimasi' => '2026-09-10',
            'status_panen' => 'Sedang Tanam',
            'satuan' => $komoditas->satuan,
            'keterangan' => 'Uji Coba Tanam Baru',
        ]);

        $response->assertStatus(201)
                 ->assertJson([
                     'success' => true,
                     'message' => 'Data produksi berhasil disimpan.',
                 ]);

        $produksiId = $response->json('data.id');

        // Check if an ApprovalWorkflow record was created with status 'Submit'
        $this->assertDatabaseHas('approval_workflows', [
            'model_type' => ProduksiPanen::class,
            'model_id' => $produksiId,
            'requester_id' => $petugas->id,
            'status' => 'Submit',
        ]);
    }

    /**
     * Test Supervisor reviewing and Admin approving the workflow.
     */
    public function test_supervisor_and_admin_workflow_actions(): void
    {
        // 1. Create a draft/submit workflow from Petugas
        $petugas = User::where('email', 'petugas@simdatan.go.id')->first();
        $supervisor = User::where('email', 'supervisor@simdatan.go.id')->first();
        $admin = User::where('email', 'admin@simdatan.go.id')->first();

        $lahan = Lahan::first();
        $komoditas = Komoditas::first();

        $produksi = ProduksiPanen::create([
            'lahan_id' => $lahan->id,
            'komoditas_id' => $komoditas->id,
            'musim_tanam' => 'Musim Hujan',
            'tahun_tanam' => 2026,
            'tanggal_tanam' => '2026-01-10',
            'tanggal_panen_estimasi' => '2026-04-20',
            'status_panen' => 'Sedang Tanam',
            'satuan' => $komoditas->satuan,
        ]);

        $workflow = ApprovalWorkflow::create([
            'model_type' => ProduksiPanen::class,
            'model_id' => $produksi->id,
            'requester_id' => $petugas->id,
            'status' => 'Submit',
            'notes' => 'Pendaftaran riwayat tanam/produksi baru.'
        ]);

        // 2. Supervisor reviews
        $tokenSupervisor = auth('api')->login($supervisor);
        $responseReview = $this->withHeaders([
            'Authorization' => 'Bearer ' . $tokenSupervisor,
        ])->postJson("/api/v1/approvals/{$workflow->id}/status", [
            'action' => 'review',
            'notes' => 'Telah diverifikasi lapangan.',
        ]);

        $responseReview->assertStatus(200)
                       ->assertJson([
                           'success' => true,
                           'data' => [
                               'id' => $workflow->id,
                               'status' => 'Review',
                           ]
                       ]);

        // 3. Admin approves
        $tokenAdmin = auth('api')->login($admin);
        $responseApprove = $this->withHeaders([
            'Authorization' => 'Bearer ' . $tokenAdmin,
        ])->postJson("/api/v1/approvals/{$workflow->id}/status", [
            'action' => 'approve',
            'notes' => 'Disetujui untuk diproses ke dashboard.',
        ]);

        $responseApprove->assertStatus(200)
                        ->assertJson([
                            'success' => true,
                            'data' => [
                                'id' => $workflow->id,
                                'status' => 'Approve',
                            ]
                        ]);
    }
}
