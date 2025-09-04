<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Task;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
        ]);

        Task::create([
            'user_id' => $user->id,
            'title' => 'Design login page',
            'description' => 'Create a mockup for the new login page',
            'column' => 'backlog'
        ]);
        Task::create([
            'user_id' => $user->id,
            'title' => 'Implement authentication',
            'description' => 'Add OAuth2 support for user logins',
            'column' => 'in_progress'
        ]);
        Task::create([
            'user_id' => $user->id,
            'title' => 'Code cleanup',
            'description' => 'Refactor code to improve readability',
            'column' => 'review'
        ]);
        Task::create([
            'user_id' => $user->id,
            'title' => 'Fix login bug',
            'description' => 'Resolve the issue with login errors',
            'column' => 'done'
        ]);
        Task::create([
            'user_id' => $user->id,
            'title' => 'Draft user survey',
            'description' => 'Prepare questions for the user feedback survey',
            'column' => 'backlog'
        ]);
        Task::create([
            'user_id' => $user->id,
            'title' => 'Update dependencies',
            'description' => 'Upgrade project to use latest libraries',
            'column' => 'in_progress'
        ]);
        Task::create([
            'user_id' => $user->id,
            'title' => 'Write documentation',
            'description' => 'Document the API endpoints and usage',
            'column' => 'review'
        ]);
        Task::create([
            'user_id' => $user->id,
            'title' => 'Deploy to production',
            'description' => 'Push the latest changes to the live server',
            'column' => 'done'
        ]);
    }
}
