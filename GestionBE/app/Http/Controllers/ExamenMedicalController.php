<?php

namespace App\Http\Controllers;

use App\Models\ExamenMedical;
use App\Models\Employe;
use App\Models\Visite;
use Illuminate\Http\Request;

class ExamenMedicalController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return ExamenMedical::with(['employe', 'visite'])->orderBy('date_examen', 'desc')->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'visite_id' => 'nullable|exists:visites,id',
            'employe_id' => 'required|exists:employes,id',
            'date_examen' => 'required|date',
            'motif' => 'nullable|string',
            'poids' => 'nullable|numeric',
            'taille' => 'nullable|numeric',
            'imc' => 'nullable|numeric',
            'ta_systolique' => 'nullable|integer',
            'ta_diastolique' => 'nullable|integer',
            'pouls' => 'nullable|integer',
            'temperature' => 'nullable|numeric',
            'glycemie' => 'nullable|numeric',
            'spo2' => 'nullable|integer',
            'vision_droite' => 'nullable|string',
            'vision_gauche' => 'nullable|string',
            'audition_droite' => 'nullable|string',
            'audition_gauche' => 'nullable|string',
            'tour_taille' => 'nullable|numeric',
            'notes_subjectives' => 'nullable|string',
            'notes_objectives' => 'nullable|string',
            'evaluation' => 'nullable|string',
            'plan' => 'nullable|string',
            'aptitude' => 'nullable|string',
            'date_prochaine_visite' => 'nullable|date',
            'doctor_name' => 'nullable|string',
        ]);

        $examen = ExamenMedical::create($validated);
        return response()->json($examen->load(['employe', 'visite']), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return ExamenMedical::with(['employe', 'visite', 'restrictions', 'documents'])->findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $examen = ExamenMedical::findOrFail($id);

        $validated = $request->validate([
            'visite_id' => 'nullable|exists:visites,id',
            'date_examen' => 'date',
            'motif' => 'nullable|string',
            'poids' => 'nullable|numeric',
            'taille' => 'nullable|numeric',
            'imc' => 'nullable|numeric',
            'ta_systolique' => 'nullable|integer',
            'ta_diastolique' => 'nullable|integer',
            'pouls' => 'nullable|integer',
            'temperature' => 'nullable|numeric',
            'glycemie' => 'nullable|numeric',
            'spo2' => 'nullable|integer',
            'vision_droite' => 'nullable|string',
            'vision_gauche' => 'nullable|string',
            'audition_droite' => 'nullable|string',
            'audition_gauche' => 'nullable|string',
            'tour_taille' => 'nullable|numeric',
            'notes_subjectives' => 'nullable|string',
            'notes_objectives' => 'nullable|string',
            'evaluation' => 'nullable|string',
            'plan' => 'nullable|string',
            'aptitude' => 'nullable|string',
            'date_prochaine_visite' => 'nullable|date',
            'doctor_name' => 'nullable|string',
        ]);

        $examen->update($validated);
        return response()->json($examen->load(['employe', 'visite']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $examen = ExamenMedical::findOrFail($id);
        $examen->delete();
        return response()->json(null, 204);
    }

    public function getByEmploye($employeId)
    {
        return ExamenMedical::with(['visite'])
            ->where('employe_id', $employeId)
            ->orderBy('date_examen', 'desc')
            ->get();
    }
}
