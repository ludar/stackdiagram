<?php

namespace Tests\Feature;

use App\Models\Diagram;
use App\Models\User;
use App\StackDoc\LayoutService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EditorAndContextTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->mock(LayoutService::class)
            ->shouldReceive('layout')->andReturn(['nodes' => ['a' => ['x' => 1, 'y' => 2]], 'groups' => []]);
    }

    private function ownedDiagram(User $user): string
    {
        $id = $this->postJson('/api/v1/diagrams', [
            'title' => 'Editable',
            'nodes' => [
                ['id' => 'a', 'type' => 'service', 'label' => 'App', 'tech' => 'laravel', 'note' => 'Serves everything'],
                ['id' => 'b', 'type' => 'database', 'label' => 'db', 'tech' => 'postgres'],
                ['id' => 'c', 'type' => 'cron', 'label' => 'nightly', 'schedule' => '0 2 * * *'],
            ],
            'edges' => [['from' => 'a', 'to' => 'b', 'label' => 'reads']],
            'groups' => [['id' => 'vm', 'label' => 'origin VM', 'children' => ['a', 'b']]],
        ])->json('id');
        $this->actingAs($user)->get("/d/$id/claim");

        return $id;
    }

    public function test_owner_can_save_doc_and_version_snapshots(): void
    {
        $user = User::factory()->create();
        $id = $this->ownedDiagram($user);

        $this->actingAs($user)->patchJson("/d/$id/doc", [
            'title' => 'Renamed by editor',
            'nodes' => [['id' => 'a', 'type' => 'service', 'label' => 'App v2']],
        ])->assertOk()->assertJsonPath('saved', true);

        $diagram = Diagram::find($id);
        $this->assertSame('Renamed by editor', $diagram->title);
        $this->assertSame(2, $diagram->versions()->count());
    }

    public function test_doc_save_rejects_invalid_and_non_owner(): void
    {
        $user = User::factory()->create();
        $id = $this->ownedDiagram($user);

        $this->actingAs($user)->patchJson("/d/$id/doc", [
            'title' => 'x', 'nodes' => [['id' => 'a', 'type' => 'blimp', 'label' => 'x']],
        ])->assertUnprocessable();

        $this->actingAs(User::factory()->create())->patchJson("/d/$id/doc", [
            'title' => 'x', 'nodes' => [['id' => 'a', 'type' => 'service', 'label' => 'x']],
        ])->assertForbidden();
    }

    public function test_layout_patch_merges_positions(): void
    {
        $user = User::factory()->create();
        $id = $this->ownedDiagram($user);

        $this->actingAs($user)->patchJson("/d/$id/layout", [
            'nodes' => ['a' => ['x' => 111, 'y' => 222]],
        ])->assertOk();

        $layout = Diagram::find($id)->layout;
        $this->assertSame(111, $layout['nodes']['a']['x']);
    }

    public function test_relayout_recomputes(): void
    {
        $user = User::factory()->create();
        $id = $this->ownedDiagram($user);

        $this->actingAs($user)->postJson("/d/$id/relayout")
            ->assertOk()->assertJsonPath('layout.nodes.a.x', 1);
    }

    public function test_context_markdown_export(): void
    {
        $user = User::factory()->create();
        $id = $this->ownedDiagram($user);

        $res = $this->get("/d/$id.md");
        $res->assertOk()->assertHeader('Content-Type', 'text/markdown; charset=utf-8');
        $md = $res->getContent();

        $this->assertStringContainsString('# Editable — system architecture', $md);
        $this->assertStringContainsString('Context for an AI assistant', $md);
        $this->assertStringContainsString('**App** (service, laravel) — in origin VM', $md);
        $this->assertStringContainsString('Serves everything', $md);
        $this->assertStringContainsString('Schedule: `0 2 * * *`', $md);
        $this->assertStringContainsString('App → db — reads', $md);
        $this->assertStringContainsString('**origin VM**: App, db', $md);
        $this->assertStringContainsString('llms.txt', $md);
    }

    public function test_private_context_hidden_from_strangers(): void
    {
        $user = User::factory()->create();
        $id = $this->ownedDiagram($user);
        Diagram::whereKey($id)->update(['visibility' => 'private']);

        $this->actingAs(User::factory()->create())->get("/d/$id.md")->assertNotFound();
        $this->actingAs($user)->get("/d/$id.md")->assertOk();
    }
}
