<?php

namespace App\Http\Controllers;

use App\Models\CorpsMedical;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CorpsMedicalController extends Controller
{
    public function index()
    {
        return response()->json(CorpsMedical::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string',
            'prenom' => 'required|string',
            'specialite' => 'required|string',
            'type' => 'required|string',
            'telephone' => 'nullable|string',
            'email' => 'nullable|email',
            'photo' => 'nullable|image|max:2048',
            'diplome' => 'nullable|file|mimes:pdf,jpg,png|max:5120',
            'autres_documents.*' => 'nullable|file|mimes:pdf,jpg,png|max:5120',
        ]);

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('corps-medical/photos', 'public');
            $validated['photo'] = $path;
        }

        if ($request->hasFile('diplome')) {
            $path = $request->file('diplome')->store('corps-medical/diplomes', 'public');
            $validated['diplome'] = $path;
        }

        if ($request->hasFile('autres_documents')) {
            $docs = [];
            foreach ($request->file('autres_documents') as $file) {
                $docs[] = $file->store('corps-medical/documents', 'public');
            }
            $validated['autres_documents'] = $docs;
        }

        $practitioner = CorpsMedical::create($validated);
        return response()->json($practitioner, 201);
    }

    public function show($id)
    {
        return response()->json(CorpsMedical::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $practitioner = CorpsMedical::findOrFail($id);
        
        $validated = $request->validate([
            'nom' => 'sometimes|required|string',
            'prenom' => 'sometimes|required|string',
            'specialite' => 'sometimes|required|string',
            'type' => 'sometimes|required|string',
            'telephone' => 'nullable|string',
            'email' => 'nullable|email',
            'status' => 'nullable|string',
        ]);

        if ($request->hasFile('photo')) {
            if ($practitioner->photo) {
                Storage::disk('public')->delete($practitioner->photo);
            }
            $path = $request->file('photo')->store('corps-medical/photos', 'public');
            $validated['photo'] = $path;
        }

        if ($request->hasFile('diplome')) {
            if ($practitioner->diplome) {
                Storage::disk('public')->delete($practitioner->diplome);
            }
            $path = $request->file('diplome')->store('corps-medical/diplomes', 'public');
            $validated['diplome'] = $path;
        }

        $practitioner->update($validated);
        return response()->json($practitioner);
    }

    public function destroy($id)
    {
        $practitioner = CorpsMedical::findOrFail($id);
        
        if ($practitioner->photo) {
            Storage::disk('public')->delete($practitioner->photo);
        }
        if ($practitioner->diplome) {
            Storage::disk('public')->delete($practitioner->diplome);
        }
        if ($practitioner->autres_documents) {
            foreach ($practitioner->autres_documents as $doc) {
                Storage::disk('public')->delete($doc);
            }
        }

        $practitioner->delete();
        return response()->json(null, 204);
    }
}
