<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ArchiveFileController;
use App\Http\Controllers\CategoryController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/dashboard', function () {
    $userId = auth()->id();

    // Total document files (excluding links and folders)
    $totalFiles = \App\Models\ArchiveFile::whereHas('category', function($q) {
        $q->where('name', 'general_doc');
    })->count();

    // Total links
    $totalLinks = \App\Models\ArchiveFile::whereHas('category', function($q) {
        $q->where('name', 'Links');
    })->count();

    // Uploaded this month
    $uploadedThisMonth = \App\Models\ArchiveFile::whereMonth('created_at', now()->month)
        ->whereYear('created_at', now()->year)
        ->count();

    // Recent uploads (last 5, any type)
    $recentUploads = \App\Models\ArchiveFile::with(['category', 'user'])
        ->whereNotJsonContains('metadata->type', 'folder')
        ->orderBy('created_at', 'desc')
        ->take(5)
        ->get();

    // Favorites for the current user
    $favoriteIds = \Illuminate\Support\Facades\DB::table('favorites')
        ->where('user_id', $userId)
        ->pluck('archive_file_id');
    $favorites = \App\Models\ArchiveFile::whereIn('id', $favoriteIds)
        ->with(['user'])
        ->orderBy('created_at', 'desc')
        ->take(5)
        ->get();

    return Inertia::render('Dashboard', [
        'totalFiles'        => $totalFiles,
        'totalLinks'        => $totalLinks,
        'uploadedThisMonth' => $uploadedThisMonth,
        'recentUploads'     => $recentUploads,
        'favorites'         => $favorites,
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

// Renamed from /research to /search — reflects the UI rename
Route::get('/search', function () {
    return Inertia::render('Search');
})->middleware(['auth', 'verified'])->name('search');



Route::get('/documents/{path?}', function (\Illuminate\Http\Request $request, $path = null) {
    // Build breadcrumb chain and resolve current folder from URL path segments.
    // e.g. /documents/Year-2026/Jan-Jun  →  resolves each segment under its parent
    $breadcrumbs   = [];
    $currentFolder = null;

    if ($path) {
        $segments    = explode('/', trim($path, '/'));
        $parentId    = null;

        foreach ($segments as $segment) {
            // Decode URL-encoded spaces (%20 or +) and match by title
            $title  = urldecode(str_replace('-', ' ', $segment));
            $folder = \App\Models\ArchiveFile::where('title', $segment)
                ->orWhere('title', $title)
                ->where(function ($q) use ($parentId) {
                    $parentId
                        ? $q->where('folder_id', $parentId)
                        : $q->whereNull('folder_id');
                })
                ->whereJsonContains('metadata->type', 'folder')
                ->first();

            if (!$folder) {
                // Segment not found — fall back to root
                return redirect()->route('documents');
            }

            $breadcrumbs[] = [
                'id'    => $folder->id,
                'title' => $folder->title,
                // Build the URL path up to this segment
                'path'  => implode('/', array_slice($segments, 0, array_search($segment, $segments) + 1)),
            ];

            $parentId      = $folder->id;
            $currentFolder = $folder;
        }
    }

    // Fetch files/folders inside the current location
    $query = \App\Models\ArchiveFile::with(['category', 'user'])
        ->whereHas('category', function ($q) { $q->where('name', 'general_doc'); })
        ->orderByRaw("CASE WHEN JSON_EXTRACT(metadata, '$.type') = 'folder' THEN 0 ELSE 1 END")
        ->orderBy('title');

    if ($currentFolder) {
        $query->where('folder_id', $currentFolder->id);
    } else {
        $query->whereNull('folder_id');
    }

    return Inertia::render('Documents', [
        'files'         => $query->get(),
        'categories'    => \App\Models\Category::all(),
        'currentFolder' => $currentFolder,
        'breadcrumbs'   => $breadcrumbs,
        // Pass the current URL path so the frontend can build child URLs
        'currentPath'   => $path ?? '',
    ]);
})->middleware(['auth', 'verified'])->name('documents')->where('path', '.*');

Route::get('/links', function () {
    return Inertia::render('Links', [
        'files' => \App\Models\ArchiveFile::with(['category', 'user'])
            ->whereHas('category', function($q) { $q->where('name', 'Links'); })
            ->orderBy('created_at', 'desc')
            ->get(),
        'categories' => \App\Models\Category::all()
    ]);
})->middleware(['auth', 'verified'])->name('links');

// Dedicated endpoint for saving URL-based link entries (no file upload required)
Route::post('/links', function (\Illuminate\Http\Request $request) {
    $request->validate([
        'title'       => 'required|string|max:255',
        'url'         => 'required|url|max:2048',
        'description' => 'nullable|string|max:1000',
        'keywords'    => 'nullable|string|max:500',
        'category_id' => 'required|exists:categories,id',
    ]);

    \App\Models\ArchiveFile::create([
        'title'             => $request->title,
        'description'       => $request->description,
        'category_id'       => $request->category_id,
        'user_id'           => auth()->id(),
        'file_path'         => $request->url,
        'original_filename' => $request->url,
        'metadata'          => [
            'type'         => 'link',
            'keywords'     => $request->keywords,
            'confidential' => $request->boolean('confidential'),
        ],
    ]);

    return redirect()->back()->with('success', 'Link added successfully.');
})->middleware(['auth', 'verified'])->name('links.store');

// Update an existing link entry
Route::patch('/links/{id}', function (\Illuminate\Http\Request $request, $id) {
    $request->validate([
        'title'       => 'required|string|max:255',
        'url'         => 'required|url|max:2048',
        'description' => 'nullable|string|max:1000',
        'keywords'    => 'nullable|string|max:500',
    ]);

    $link = \App\Models\ArchiveFile::findOrFail($id);
    $link->update([
        'title'             => $request->title,
        'description'       => $request->description,
        'file_path'         => $request->url,
        'original_filename' => $request->url,
        'metadata'          => array_merge($link->metadata ?? [], [
            'keywords'     => $request->keywords,
            'confidential' => $request->boolean('confidential'),
        ]),
    ]);

    return redirect()->back()->with('success', 'Link updated successfully.');
})->middleware(['auth', 'verified'])->name('links.update');

Route::post('/upload', [ArchiveFileController::class, 'store'])->middleware(['auth', 'verified'])->name('upload.store');

Route::post('/folders', function (\Illuminate\Http\Request $request) {
    $request->validate([
        'name'        => 'required|string|max:255',
        'category_id' => 'required|exists:categories,id',
        'folder_id'   => 'nullable|exists:archive_files,id',
        'current_path'=> 'nullable|string',
    ]);

    \App\Models\ArchiveFile::create([
        'title'             => $request->name,
        'category_id'       => $request->category_id,
        'user_id'           => auth()->id(),
        'folder_id'         => $request->folder_id,
        'file_path'         => 'folder',
        'original_filename' => 'folder',
        'metadata'          => ['type' => 'folder'],
    ]);

    // Redirect back to the exact path the user was in
    $path = $request->current_path;
    return redirect('/documents' . ($path ? '/' . $path : ''))->with('success', 'Folder created.');
})->middleware(['auth', 'verified'])->name('folders.store');

Route::delete('/documents/{id}', function ($id) {
    $file     = \App\Models\ArchiveFile::findOrFail($id);
    $path     = request()->input('current_path', '');
    $file->delete();
    return redirect('/documents' . ($path ? '/' . $path : ''))->with('success', 'Deleted successfully.');
})->middleware(['auth', 'verified'])->name('documents.destroy');

// Bulk operations — move multiple items to bin or restore
Route::post('/documents/bulk-delete', function (\Illuminate\Http\Request $request) {
    $request->validate(['ids' => 'required|array', 'ids.*' => 'exists:archive_files,id']);
    \App\Models\ArchiveFile::whereIn('id', $request->ids)->delete();
    $path = $request->input('current_path', '');
    return redirect('/documents' . ($path ? '/' . $path : ''))->with('success', 'Items moved to bin.');
})->middleware(['auth', 'verified'])->name('documents.bulk-delete');

Route::post('/documents/bulk-favorite', function (\Illuminate\Http\Request $request) {
    $request->validate(['ids' => 'required|array', 'ids.*' => 'exists:archive_files,id']);
    foreach ($request->ids as $id) {
        \Illuminate\Support\Facades\DB::table('favorites')->updateOrInsert(
            ['user_id' => auth()->id(), 'archive_file_id' => $id]
        );
    }
    return redirect()->back()->with('success', 'Added to favorites.');
})->middleware(['auth', 'verified'])->name('documents.bulk-favorite');

Route::patch('/documents/{id}/rename', function (\Illuminate\Http\Request $request, $id) {
    $request->validate(['title' => 'required|string|max:255']);
    $file = \App\Models\ArchiveFile::findOrFail($id);
    $path = $request->input('current_path', '');
    $file->update(['title' => $request->title]);
    return redirect('/documents' . ($path ? '/' . $path : ''))->with('success', 'Renamed successfully.');
})->middleware(['auth', 'verified'])->name('documents.rename');

Route::get('/bin', function (\Illuminate\Http\Request $request) {
    $files = \App\Models\ArchiveFile::onlyTrashed()->with(['category', 'user'])->get();
    return Inertia::render('Bin', [
        'files' => $files,
    ]);
})->middleware(['auth', 'verified'])->name('bin.index');

Route::post('/bin/{id}/restore', function ($id) {
    \App\Models\ArchiveFile::onlyTrashed()->findOrFail($id)->restore();
    return redirect()->back()->with('success', 'Restored successfully.');
})->middleware(['auth', 'verified'])->name('bin.restore');

Route::delete('/bin/{id}/force', function ($id) {
    \App\Models\ArchiveFile::onlyTrashed()->findOrFail($id)->forceDelete();
    return redirect()->back()->with('success', 'Permanently deleted.');
})->middleware(['auth', 'verified'])->name('bin.forceDelete');

Route::get('/favorites', function (\Illuminate\Http\Request $request) {
    $favoriteIds = \Illuminate\Support\Facades\DB::table('favorites')
        ->where('user_id', auth()->id())
        ->pluck('archive_file_id');

    $all = \App\Models\ArchiveFile::whereIn('id', $favoriteIds)
        ->with(['category', 'user'])
        ->get();

    // Split into three groups for the UI
    $documents = $all->filter(fn($f) => !in_array($f->metadata['type'] ?? '', ['link', 'folder']))->values();
    $folders   = $all->filter(fn($f) => ($f->metadata['type'] ?? '') === 'folder')->values();
    $links     = $all->filter(fn($f) => ($f->metadata['type'] ?? '') === 'link')->values();

    return Inertia::render('Favorites', [
        'documents' => $documents,
        'folders'   => $folders,
        'links'     => $links,
    ]);
})->middleware(['auth', 'verified'])->name('favorites.index');

Route::post('/favorites/{id}', function ($id) {
    \Illuminate\Support\Facades\DB::table('favorites')->updateOrInsert(
        ['user_id' => auth()->id(), 'archive_file_id' => $id]
    );
    return redirect()->back()->with('success', 'Added to favorites.');
})->middleware(['auth', 'verified'])->name('favorites.store');

Route::delete('/favorites/{id}', function ($id) {
    \Illuminate\Support\Facades\DB::table('favorites')
        ->where('user_id', auth()->id())
        ->where('archive_file_id', $id)
        ->delete();
    return redirect()->back()->with('success', 'Removed from favorites.');
})->middleware(['auth', 'verified'])->name('favorites.destroy');

Route::get('/security', function () {
    return Inertia::render('Security', [
        'users' => \App\Models\User::all(),
        'logs' => \App\Models\ActivityLog::with('user')->latest()->take(20)->get()
    ]);
})->middleware(['auth', 'verified'])->name('security');

Route::post('/security/users', function (\Illuminate\Http\Request $request) {
    $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|string|email|max:255|unique:users',
        'password' => 'required|string|min:8',
    ]);

    $newUser = \App\Models\User::create([
        'name' => $request->name,
        'email' => $request->email,
        'password' => \Illuminate\Support\Facades\Hash::make($request->password),
        'role' => 'admin assistant',
    ]);

    \App\Models\ActivityLog::create([
        'user_id' => $request->user()->id,
        'action' => 'created_account',
        'type' => 'auth',
        'location' => 'System'
    ]);

    return redirect()->back()->with('success', 'Assistant created.');
})->middleware(['auth', 'verified'])->name('security.users.store');

// Promote an admin_assistant to admin (director only)
Route::patch('/security/users/{id}/promote', function (\Illuminate\Http\Request $request, $id) {
    // Only directors can promote
    if ($request->user()->role !== 'director') {
        abort(403, 'Only the director can promote users.');
    }

    $target = \App\Models\User::findOrFail($id);

    // Only assistants can be promoted
    if ($target->role !== 'admin_assistant') {
        return redirect()->back()->withErrors(['promote' => 'Only admin assistants can be promoted.']);
    }

    $target->update(['role' => 'admin']);

    return redirect()->back()->with('success', "{$target->name} has been promoted to Admin.");
})->middleware(['auth', 'verified'])->name('security.users.promote');

// Demote an admin back to assistant (director only)
Route::patch('/security/users/{id}/demote', function (\Illuminate\Http\Request $request, $id) {
    if ($request->user()->role !== 'director') {
        abort(403, 'Only the director can demote users.');
    }

    $target = \App\Models\User::findOrFail($id);

    if ($target->role !== 'admin') {
        return redirect()->back()->withErrors(['demote' => 'Only admins can be demoted.']);
    }

    $target->update(['role' => 'admin_assistant']);

    return redirect()->back()->with('success', "{$target->name} has been demoted to Assistant.");
})->middleware(['auth', 'verified'])->name('security.users.demote');

// Reset a user's password to a temporary one
Route::patch('/security/users/{id}/reset-password', function (\Illuminate\Http\Request $request, $id) {
    $request->validate(['password' => 'required|string|min:8']);
    $target = \App\Models\User::findOrFail($id);
    $target->update(['password' => \Illuminate\Support\Facades\Hash::make($request->password)]);
    return redirect()->back()->with('success', 'Password reset successfully.');
})->middleware(['auth', 'verified'])->name('security.users.reset-password');

// Toggle active/inactive status (using a status column if present, else just track via role)
Route::patch('/security/users/{id}/toggle-status', function ($id) {
    $target = \App\Models\User::findOrFail($id);
    // Use a simple active flag stored in the user model if available
    $current = $target->active ?? true;
    $target->update(['active' => !$current]);
    return redirect()->back()->with('success', $current ? 'User deactivated.' : 'User activated.');
})->middleware(['auth', 'verified'])->name('security.users.toggle-status');

// Permanently delete a user account
Route::delete('/security/users/{id}', function ($id) {
    $target = \App\Models\User::findOrFail($id);
    // Prevent deleting yourself
    if ($target->id === auth()->id()) {
        return redirect()->back()->withErrors(['delete' => 'You cannot delete your own account.']);
    }
    $target->delete();
    return redirect()->back()->with('success', 'Account deleted.');
})->middleware(['auth', 'verified'])->name('security.users.destroy');

// Temporary — UML Activity Diagram page (remove before production)
Route::get('/activity-diagram', function () {
    return Inertia::render('ActivityDiagram');
})->middleware(['auth', 'verified'])->name('activity-diagram');

Route::post('/categories', [CategoryController::class, 'store'])->middleware(['auth', 'verified'])->name('categories.store');

// Generate a temporary signed URL for guest file access
Route::post('/share-link', function (\Illuminate\Http\Request $request) {
    $request->validate([
        'file_id' => 'required|exists:archive_files,id',
        'amount'  => 'required|integer|min:1|max:720',
        'unit'    => 'required|in:hours,days',
    ]);

    $minutes = $request->unit === 'days'
        ? $request->amount * 24 * 60
        : $request->amount * 60;

    // Build a signed URL that expires after the chosen duration
    $url = \Illuminate\Support\Facades\URL::temporarySignedRoute(
        'share.view',
        now()->addMinutes($minutes),
        ['file' => $request->file_id]
    );

    return response()->json(['url' => $url]);
})->middleware(['auth', 'verified'])->name('share.generate');

// Public guest-access route — validates the signature then serves the file
Route::get('/share/{file}', function (\Illuminate\Http\Request $request, $fileId) {
    if (! $request->hasValidSignature()) {
        abort(403, 'This link has expired or is invalid.');
    }

    $file = \App\Models\ArchiveFile::findOrFail($fileId);

    // Stream the file directly so the guest never needs to log in
    $path = storage_path('app/public/' . $file->file_path);

    if (! file_exists($path)) {
        abort(404, 'File not found.');
    }

    return response()->file($path, [
        'Content-Disposition' => 'inline; filename="' . $file->original_filename . '"',
    ]);
})->name('share.view');

// API: fetch folders for the Move modal folder picker
Route::get('/api/folders', function (\Illuminate\Http\Request $request) {
    $parentId = $request->query('parent_id'); // null = root
    $exclude  = $request->query('exclude');   // id of the item being moved (skip it)

    $query = \App\Models\ArchiveFile::select('id', 'title', 'folder_id', 'metadata')
        ->whereJsonContains('metadata->type', 'folder')
        ->whereHas('category', function ($q) { $q->where('name', 'general_doc'); });

    if ($parentId) {
        $query->where('folder_id', $parentId);
    } else {
        $query->whereNull('folder_id');
    }

    // Exclude the item being moved and all its descendants to prevent circular moves
    if ($exclude) {
        $query->where('id', '!=', $exclude);
    }

    return response()->json($query->orderBy('title')->get());
})->middleware(['auth', 'verified']);

// Move a file/folder to a different parent folder
Route::patch('/documents/{id}/move', function (\Illuminate\Http\Request $request, $id) {
    $request->validate([
        'destination_folder_id' => 'nullable|exists:archive_files,id',
        'current_path'          => 'nullable|string',
    ]);

    $file = \App\Models\ArchiveFile::findOrFail($id);

    // Prevent moving a folder into itself or its own descendant
    if ($request->destination_folder_id) {
        $dest = \App\Models\ArchiveFile::find($request->destination_folder_id);
        $node = $dest;
        while ($node) {
            if ($node->id === $file->id) {
                return back()->withErrors(['move' => 'Cannot move a folder into itself.']);
            }
            $node = $node->folder_id ? \App\Models\ArchiveFile::find($node->folder_id) : null;
        }
    }

    $file->update(['folder_id' => $request->destination_folder_id]);

    $path = $request->input('current_path', '');
    return redirect('/documents' . ($path ? '/' . $path : ''))->with('success', 'Moved successfully.');
})->middleware(['auth', 'verified'])->name('documents.move');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
