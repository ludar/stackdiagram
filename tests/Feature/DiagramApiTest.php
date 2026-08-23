<?php

namespace Tests\Feature;

use App\Models\Diagram;
use App\StackDoc\LayoutService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DiagramApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Layout shells out to node; stub it for API tests.
        $this->mock(LayoutService::class)
            ->shouldReceive('layout')->andReturn(['nodes' => [], 'groups' => []]);
    }

    private function validDoc(array $overrides = []): array
    {
        return array_merge([
            'title' => 'Test stack',
            'view' => 'services',
            'nodes' => [
                ['id' => 'a', 'type' => 'service', 'label' => 'App'],
                ['id' => 'b', 'type' => 'database', 'label' => 'db', 'tech' => 'postgres'],
            ],
            'edges' => [['from' => 'a', 'to' => 'b', 'label' => 'reads']],
        ], $overrides);
    }

    public function test_create_returns_url_and_claim_token(): void
    {
        $res = $this->postJson('/api/v1/diagrams', $this->validDoc());

        $res->assertCreated()
            ->assertJsonStructure(['id', 'url', 'claim_token', 'expires_at']);

        $this->assertStringStartsWith('ct_', $res->json('claim_token'));
        $diagram = Diagram::find($res->json('id'));
        $this->assertNotNull($diagram);
        $this->assertSame('unlisted', $diagram->visibility);
        $this->assertTrue($diagram->expires_at->isFuture());
        $this->assertSame(1, $diagram->versions()->count());
    }

    public function test_create_rejects_edge_to_unknown_node(): void
    {
        $doc = $this->validDoc(['edges' => [['from' => 'a', 'to' => 'nope']]]);
        $this->postJson('/api/v1/diagrams', $doc)->assertUnprocessable();
    }

    public function test_create_rejects_bad_node_type(): void
    {
        $doc = $this->validDoc(['nodes' => [['id' => 'a', 'type' => 'blimp', 'label' => 'x']]]);
        $this->postJson('/api/v1/diagrams', $doc)->assertUnprocessable();
    }

    public function test_create_rejects_duplicate_node_ids(): void
    {
        $doc = $this->validDoc(['nodes' => [
            ['id' => 'a', 'type' => 'service', 'label' => 'x'],
            ['id' => 'a', 'type' => 'service', 'label' => 'y'],
        ], 'edges' => []]);
        $this->postJson('/api/v1/diagrams', $doc)->assertUnprocessable();
    }

    public function test_get_returns_doc(): void
    {
        $id = $this->postJson('/api/v1/diagrams', $this->validDoc())->json('id');

        $this->getJson("/api/v1/diagrams/$id")
            ->assertOk()
            ->assertJsonPath('title', 'Test stack')
            ->assertJsonCount(2, 'doc.nodes');
    }

    public function test_update_requires_claim_token(): void
    {
        $create = $this->postJson('/api/v1/diagrams', $this->validDoc());
        $id = $create->json('id');
        $token = $create->json('claim_token');
        $newDoc = $this->validDoc(['title' => 'Renamed']);

        $this->putJson("/api/v1/diagrams/$id", $newDoc)->assertForbidden();
        $this->putJson("/api/v1/diagrams/$id", $newDoc, ['X-Claim-Token' => 'ct_wrong'])->assertForbidden();
        $this->putJson("/api/v1/diagrams/$id", $newDoc, ['X-Claim-Token' => $token])
            ->assertOk()->assertJsonPath('updated', true);

        $this->assertSame('Renamed', Diagram::find($id)->title);
        $this->assertSame(2, Diagram::find($id)->versions()->count());
    }

    public function test_expired_diagram_is_gone(): void
    {
        $id = $this->postJson('/api/v1/diagrams', $this->validDoc())->json('id');
        Diagram::whereKey($id)->update(['expires_at' => now()->subDay()]);

        $this->getJson("/api/v1/diagrams/$id")->assertNotFound();
        $this->get("/d/$id")->assertNotFound();
    }

    public function test_purge_command_deletes_expired(): void
    {
        $keep = $this->postJson('/api/v1/diagrams', $this->validDoc())->json('id');
        $gone = $this->postJson('/api/v1/diagrams', $this->validDoc())->json('id');
        Diagram::whereKey($gone)->update(['expires_at' => now()->subDay()]);

        $this->artisan('diagrams:purge-expired')->assertSuccessful();

        $this->assertNotNull(Diagram::find($keep));
        $this->assertNull(Diagram::find($gone));
        $this->assertSame(0, \App\Models\DiagramVersion::where('diagram_id', $gone)->count());
    }

    public function test_private_diagram_hidden_from_public(): void
    {
        $create = $this->postJson('/api/v1/diagrams', $this->validDoc());
        $id = $create->json('id');
        Diagram::whereKey($id)->update(['visibility' => 'private']);

        $this->getJson("/api/v1/diagrams/$id")->assertNotFound();
        $this->getJson("/api/v1/diagrams/$id", ['X-Claim-Token' => $create->json('claim_token')])->assertOk();
    }

    public function test_viewer_page_renders(): void
    {
        $id = $this->postJson('/api/v1/diagrams', $this->validDoc())->json('id');
        $this->get("/d/$id")->assertOk()->assertSee('Test stack');
    }

    public function test_llms_txt_served(): void
    {
        $this->get('/llms.txt')->assertOk()->assertSee('POST https://stackdiagram.com/api/v1/diagrams');
    }
}
