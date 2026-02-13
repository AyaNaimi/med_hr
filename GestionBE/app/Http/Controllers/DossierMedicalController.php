<?php

namespace App\Http\Controllers;

use App\Models\DossierMedical;
use App\Models\Employe;
use Illuminate\Http\Request;

class DossierMedicalController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return DossierMedical::with('employe')->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'employe_id' => 'required|exists:employes,id|unique:dossier_medicals,employe_id',
            'numero_dossier' => 'nullable|string|unique:dossier_medicals,numero_dossier',
            'groupe_sanguin' => 'nullable|string',
            'antecedents_personnels' => 'nullable|string',
            'antecedents_familiaux' => 'nullable|string',
            'allergies' => 'nullable|string',
            'vaccinations' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $dossier = DossierMedical::create($validated);
        return response()->json($dossier, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $dossier = DossierMedical::with(['employe', 'employe.medicalExams', 'employe.medicalRestrictions', 'employe.medicalDocuments'])->find($id);
        
        if (!$dossier) {
            $dossier = DossierMedical::with(['employe', 'employe.medicalExams', 'employe.medicalRestrictions', 'employe.medicalDocuments'])
                ->where('employe_id', $id)
                ->firstOrFail();
        }

        return response()->json($dossier);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $dossier = DossierMedical::findOrFail($id);

        $validated = $request->validate([
            'numero_dossier' => 'nullable|string|unique:dossier_medicals,numero_dossier,' . $dossier->id,
            'groupe_sanguin' => 'nullable|string',
            'antecedents_personnels' => 'nullable|string',
            'antecedents_familiaux' => 'nullable|string',
            'allergies' => 'nullable|string',
            'vaccinations' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $dossier->update($validated);
        return response()->json($dossier);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $dossier = DossierMedical::findOrFail($id);
        $dossier->delete();
        return response()->json(null, 204);
    }

    public function getByEmploye($employeId)
    {
        $dossier = DossierMedical::where('employe_id', $employeId)->first();
        
        if (!$dossier) {
            return response()->json(['message' => 'Dossier non trouvé'], 404);
        }

        return response()->json($dossier->load(['employe.medicalExams', 'employe.medicalRestrictions', 'employe.medicalDocuments']));
    }
}
