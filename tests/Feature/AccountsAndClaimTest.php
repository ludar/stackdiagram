<?php

namespace Tests\Feature;

use App\Models\Diagram;
use App\Models\User;
use App\StackDoc\LayoutService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AccountsAndClaimTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->mock(LayoutService::class)
            ->shouldReceive('layout')->andReturn(['nodes' => [], 'groups' => []]);
    }

    private function makeDiagram(): array
    {
        $res = $this->postJson('/api/v1/diagrams', [
            'title' => 'Claimable',
            'nodes' => [['id' => 'a', 'type' => 'service', 'label' => 'App']],
        ]);

        return [$res->json('id'), $res->json('claim_token')];
    }

    public function test_registration_with_email_only(): void
    {
        $this->post('/register', [
            'email' => 'andrey@example.com',
            'password' => 'secret-password-1',
            'password_confirmation' => 'secret-password-1',
        ])->assertRedirect();

        $this->assertNotNull(User::where('email', 'andrey@example.com')->first());
    }

    public function test_claim_attaches_owner_and_cancels_expiry(): void
    {
        [$id, $token] = $this->makeDiagram();
        $user = User::factory()->create();

        $this->actingAs($user)->get("/d/$id/claim?token=$token")
            ->assertRedirect("/d/$id");

        $diagram = Diagram::find($id);
        $this->assertSame($user->id, $diagram->owner_id);
        $this->assertNull($diagram->expires_at);
        $this->assertNull($diagram->claim_token_hash);
    }

    public function test_claim_requires_valid_token_and_verified_user(): void
    {
        [$id] = $this->makeDiagram();

        // guest -> login
        $this->get("/d/$id/claim?token=whatever")->assertRedirect('/login');
        // unverified -> verification notice
        $unverified = User::factory()->unverified()->create();
        $this->actingAs($unverified)->get("/d/$id/claim?token=whatever")->assertRedirect('/email/verify');
        // wrong token -> 403
        $this->actingAs(User::factory()->create())->get("/d/$id/claim?token=ct_wrong")->assertForbidden();
        $this->assertNull(Diagram::find($id)->owner_id);
    }

    public function test_claim_is_single_use(): void
    {
        [$id, $token] = $this->makeDiagram();
        $first = User::factory()->create();
        $second = User::factory()->create();

        $this->actingAs($first)->get("/d/$id/claim?token=$token");
        $this->actingAs($second)->get("/d/$id/claim?token=$token")->assertRedirect("/d/$id");

        $this->assertSame($first->id, Diagram::find($id)->owner_id);
    }

    public function test_fork_copies_into_account(): void
    {
        [$id] = $this->makeDiagram();
        $user = User::factory()->create();

        $res = $this->actingAs($user)->post("/d/$id/fork");

        $fork = Diagram::where('forked_from_id', $id)->first();
        $this->assertNotNull($fork);
        $res->assertRedirect("/d/{$fork->id}");
        $this->assertSame($user->id, $fork->owner_id);
        $this->assertNull($fork->expires_at);
        $this->assertSame('unlisted', $fork->visibility);
    }

    public function test_private_diagram_cannot_be_forked_by_stranger(): void
    {
        [$id, $token] = $this->makeDiagram();
        $owner = User::factory()->create();
        $this->actingAs($owner)->get("/d/$id/claim?token=$token");
        Diagram::whereKey($id)->update(['visibility' => 'private']);

        $this->actingAs(User::factory()->create())->post("/d/$id/fork")->assertNotFound();
    }

    public function test_visibility_and_delete_require_ownership(): void
    {
        [$id, $token] = $this->makeDiagram();
        $owner = User::factory()->create();
        $stranger = User::factory()->create();
        $this->actingAs($owner)->get("/d/$id/claim?token=$token");

        $this->actingAs($stranger)->patch("/d/$id/visibility", ['visibility' => 'public'])->assertForbidden();
        $this->actingAs($stranger)->delete("/d/$id")->assertForbidden();

        $this->actingAs($owner)->patch("/d/$id/visibility", ['visibility' => 'public'])->assertRedirect();
        $this->assertSame('public', Diagram::find($id)->visibility);

        $this->actingAs($owner)->delete("/d/$id")->assertRedirect('/dashboard');
        $this->assertNull(Diagram::find($id));
        $this->assertNotNull(Diagram::withTrashed()->find($id)); // soft-deleted, 7-day grace
    }

    public function test_dashboard_lists_own_diagrams_only(): void
    {
        [$id, $token] = $this->makeDiagram();
        [$otherId] = $this->makeDiagram();
        $user = User::factory()->create();
        $this->actingAs($user)->get("/d/$id/claim?token=$token");

        $this->actingAs($user)->get('/dashboard')
            ->assertOk()
            ->assertSee($id)
            ->assertDontSee($otherId);
    }

    public function test_landing_page_renders(): void
    {
        $this->get('/')->assertOk()->assertSee('Landing');
    }
}
