<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Research', 'description' => 'Research repository documents'],
            ['name' => 'general_doc', 'description' => 'General archive for office memos, reports, and administrative files'],
            ['name' => 'Proficiency', 'description' => 'Internal performance evaluations and rating periods'],
            ['name' => 'Links', 'description' => 'Important links and resources'],
        ];

        foreach ($categories as $category) {
            \App\Models\Category::firstOrCreate(['name' => $category['name']], $category);
        }
    }
}
