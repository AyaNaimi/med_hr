<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Visite extends Model
{
    use HasFactory;

    protected $fillable = [
        'date',
        'type',
        'statut',
        'emplacement',
        'lieu',
        'medecin_nom',
        'notes',
    ];

    public function employes()
    {
        return $this->belongsToMany(Employe::class, 'employe_visite')
                    ->withPivot('statut_individuel')
                    ->withTimestamps();
    }

    public function medicalExams()
    {
        return $this->hasMany(ExamenMedical::class);
    }
}
