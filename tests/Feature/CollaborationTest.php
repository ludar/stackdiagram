<?php

namespace Tests\Feature;

use App\Models\Comment;
use App\Models\Diagram;
use App\Models\User;
use App\StackDoc\LayoutService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CollaborationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->mock(LayoutService::class)
            ->shouldReceive('layout')->andReturn(['nodes' => [], 'groups' => []]);
    }

    private function ownedDiagram(User $owner, string $visibility = 'unlisted'): string
    {
        $id = $this->postJson('/api/v1/diagrams', [
            'title' => 'Team stack',
            'nodes' => [['id' => 'a', 'type' => 'service', 'label' => 'App']],
        ])->json('id');
        $this->actingAs($owner)->get("/d/$id/claim");
        Diagram::whereKey($id)->update(['visibility' => $visibility]);

        return $id;
    }

    public function test_owner_invites_and_collaborator_sees_private(): void
    {
        $owner = User::factory()->create();
        $friend = User::factory()->create();
        $id = $this->ownedDiagram($owner, 'private');

        $this->actingAs($friend)->get("/d/$id")->assertNotFound();

        $this->actingAs($owner)->post("/d/$id/collaborators", [
            'email' => $friend->email, 'role' => 'commenter',
        ])->assertRedirect();

        $this->actingAs($friend)->get("/d/$id")->assertOk();
        $this->actingAs($friend)->get("/d/$id.md")->assertOk();
    }

    public function test_only_owner_invites(): void
    {
        $owner = User::factory()->create();
        $id = $this->ownedDiagram($owner);

        $this->actingAs(User::factory()->create())->post("/d/$id/collaborators", [
            'email' => 'x@example.com', 'role' => 'commenter',
        ])->assertForbidden();
    }

    public function test_editor_can_edit_commenter_cannot(): void
    {
        $owner = User::factory()->create();
        $editor = User::factory()->create();
        $commenter = User::factory()->create();
        $id = $this->ownedDiagram($owner);
        $this->actingAs($owner)->post("/d/$id/collaborators", ['email' => $editor->email, 'role' => 'editor']);
        $this->actingAs($owner)->post("/d/$id/collaborators", ['email' => $commenter->email, 'role' => 'commenter']);

        $doc = ['title' => 'Edited', 'nodes' => [['id' => 'a', 'type' => 'service', 'label' => 'App2']]];
        $this->actingAs($editor)->patchJson("/d/$id/doc", $doc)->assertOk();
        $this->actingAs($commenter)->patchJson("/d/$id/doc", $doc)->assertForbidden();
    }

    public function test_invite_attaches_on_registration(): void
    {
        $owner = User::factory()->create();
        $id = $this->ownedDiagram($owner, 'private');
        $this->actingAs($owner)->post("/d/$id/collaborators", [
            'email' => 'newcomer@example.com', 'role' => 'commenter',
        ]);

        $this->post('/logout');
        $this->post('/register', [
            'email' => 'newcomer@example.com',
            'password' => 'secret-password-1',
            'password_confirmation' => 'secret-password-1',
        ]);
        $newcomer = User::where('email', 'newcomer@example.com')->first();
        $newcomer->markEmailAsVerified();

        $this->actingAs($newcomer)->get("/d/$id")->assertOk();
    }

    public function test_comment_reply_resolve_delete(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $id = $this->ownedDiagram($owner);

        $this->actingAs($other)->post("/d/$id/comments", [
            'body' => 'Why is the cache separate?', 'anchor_type' => 'node', 'anchor_id' => 'a',
        ])->assertRedirect();
        $comment = Comment::first();

        $this->actingAs($owner)->post("/d/$id/comments", [
            'body' => 'Survives API restarts.', 'parent_id' => $comment->id,
        ])->assertRedirect();
        $this->assertSame(1, $comment->replies()->count());

        // owner can resolve someone else's comment; stranger cannot
        $this->actingAs(User::factory()->create())->post("/comments/{$comment->id}/resolve")->assertForbidden();
        $this->actingAs($owner)->post("/comments/{$comment->id}/resolve")->assertRedirect();
        $this->assertNotNull($comment->fresh()->resolved_at);

        $this->actingAs($other)->delete("/comments/{$comment->id}")->assertRedirect();
        $this->assertNull(Comment::find($comment->id));
    }

    public function test_comments_on_private_need_access(): void
    {
        $owner = User::factory()->create();
        $id = $this->ownedDiagram($owner, 'private');

        $this->actingAs(User::factory()->create())->post("/d/$id/comments", ['body' => 'hi'])->assertNotFound();
    }

    public function test_explore_lists_public_only(): void
    {
        $owner = User::factory()->create();
        $public = $this->ownedDiagram($owner, 'public');
        $unlisted = $this->ownedDiagram($owner, 'unlisted');

        $res = $this->get('/explore');
        $res->assertOk()->assertSee($public)->assertDontSee($unlisted);
    }
}
