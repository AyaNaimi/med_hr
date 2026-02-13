<?php

namespace App\Http\Controllers;

use App\Models\Visite;
use Illuminate\Http\Request;

class VisiteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Visite::with('employes')->orderBy('date', 'desc')->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'type' => 'required|string',
            'statut' => 'string',
            'emplacement' => 'string|nullable',
            'medecin_nom' => 'string|nullable',
            'notes' => 'string|nullable',
            'employe_ids' => 'array',
            'employe_ids.*' => 'exists:employes,id',
        ]);

        $visite = Visite::create($validated);

        if (isset($validated['employe_ids'])) {
            $visite->employes()->attach($validated['employe_ids']);
        }

        return response()->json($visite->load('employes'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $visite = Visite::with('employes')->findOrFail($id);
        return response()->json($visite);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $visite = Visite::findOrFail($id);

        $validated = $request->validate([
            'date' => 'date',
            'type' => 'string',
            'statut' => 'string',
            'emplacement' => 'string|nullable',
            'medecin_nom' => 'string|nullable',
            'notes' => 'string|nullable',
            'employe_ids' => 'array',
            'employe_ids.*' => 'exists:employes,id',
        ]);

        $visite->update($validated);

        if (isset($validated['employe_ids'])) {
            $visite->employes()->sync($validated['employe_ids']);
        }

        return response()->json($visite->load('employes'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $visite = Visite::findOrFail($id);
        $visite->delete();

        return response()->json(null, 204);
    }
}
