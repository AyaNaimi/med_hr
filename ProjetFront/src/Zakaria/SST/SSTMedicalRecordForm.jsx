import React, { useState, useMemo } from 'react';
import { Card, Form, Button, Alert, Spinner, Badge, InputGroup } from 'react-bootstrap';
import { Clock, User, Stethoscope, FileText, Search, Users } from 'lucide-react';

const SSTMedicalRecordForm = ({ onSubmit, onCancel, initialData }) => {
    // Mock employees data for selection
    const availableEmployees = [
        { id: 'E001', name: 'Jean Dupont', department: 'Production', status: 'Apte' },
        { id: 'E002', name: 'Marie Dubois', department: 'Logistique', status: 'Apte' },
        { id: 'E003', name: 'Pierre Martin', department: 'RH', status: 'Apte' },
        { id: 'E004', name: 'Sophie Laurent', department: 'IT', status: 'Apte' },
        { id: 'E005', name: 'Alain Bernard', department: 'Production', status: 'A suivre' },
        { id: 'E006', name: 'Thomas Petit', department: 'Logistique', status: 'Apte' },
        { id: 'E007', name: 'Julie Leroy', department: 'Production', status: 'Apte' },
        { id: 'E008', name: 'Nicolas Roux', department: 'Maintenance', status: 'Attention' },
    ];

    const departments = [...new Set(availableEmployees.map(e => e.department))];

    const [formData, setFormData] = useState({
        date: initialData?.date || '',
        doctor: initialData?.doctor || '',
        type: initialData?.type || '',
        notes: initialData?.notes || '',
        selectedEmployees: initialData?.selectedEmployees || [],
    });

    const [filters, setFilters] = useState({
        search: '',
        department: '',
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    const filteredEmployees = useMemo(() => {
        return availableEmployees.filter(emp => {
            const matchesSearch = emp.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                emp.id.toLowerCase().includes(filters.search.toLowerCase());
            const matchesDept = !filters.department || emp.department === filters.department;
            return matchesSearch && matchesDept;
        });
    }, [filters]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleEmployeeToggle = (employeeId) => {
        setFormData(prev => {
            const isSelected = prev.selectedEmployees.includes(employeeId);
            const newSelection = isSelected
                ? prev.selectedEmployees.filter(id => id !== employeeId)
                : [...prev.selectedEmployees, employeeId];
            return { ...prev, selectedEmployees: newSelection };
        });
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.date) errors.date = 'La date est requise';
        if (!formData.doctor) errors.doctor = 'Le médecin est requis';
        if (!formData.type) errors.type = 'Le type de visite est requis';
        if (formData.selectedEmployees.length === 0) errors.selection = 'Veuillez sélectionner au moins un collaborateur';
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        if (!validateForm()) return;
        try {
            setLoading(true);
            await onSubmit(formData);
        } catch (err) {
            setError(err.response?.data?.message || "Une erreur est survenue");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>
                {`
        .sst-form-container {
            border: none;
            border-radius: 0;
            background-color: transparent;
            box-shadow: none;
            height: 100%;
            display: flex;
            flex-direction: column;
            overflow: hidden; /* Prevent container level scrolling */
        }

        .sst-form-header {
            padding: 1.25rem 1.5rem;
            letter-spacing: 0.5px;
            margin: 0;
            background: #f9fafb;
            border-bottom: 1px solid #e9ecef;
            flex-shrink: 0;
        }

        .sst-form-header h5 {
            display: flex;
            justify-content: center;
            letter-spacing: 0.2px;
            font-size: 1.1rem;
            font-weight: 700;
            color: #4b5563;
            margin: 0;
        }

        .sst-form-body {
            padding: 1.5rem;
            background-color: transparent;
            flex: 1;
            overflow-y: auto;
            min-height: 0; /* Important for flex-overflow */
        }

        .form-section-title {
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #94a3b8;
            margin: 1.5rem 0 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .form-section-title:first-of-type {
            margin-top: 0;
        }

        .form-group-wrapper {
            margin-bottom: 1.25rem;
            position: relative;
        }

        .form-label-enhanced {
            font-size: 0.875rem;
            font-weight: 500;
            color: #4b5563;
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
        }

        .form-control-enhanced {
            width: 100%;
            padding: 0.75rem 1rem;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            font-size:0.875rem;
            color: #111827;
            background-color: #ffffff;
            transition: all 0.2s ease;
        }

        .form-control-enhanced:focus {
            outline: none;
            border-color: #00afaa;
            box-shadow: 0 0 0 2px rgba(0, 175, 170, 0.1);
        }

        .selection-box {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            background: white;
            max-height: 400px;
            overflow-y: auto;
        }

        .employee-item {
            padding: 0.75rem 1rem;
            border-bottom: 1px solid #f3f4f6;
            transition: all 0.2s;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .employee-item:last-child {
            border-bottom: none;
        }

        .employee-item:hover {
            background-color: #f9fafb;
        }

        .employee-item.selected {
            background-color: #f0fdfa;
            border-left: 3px solid #00afaa;
        }

        .filter-bar {
            background: #f8fafc;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }

        .icon-accent {
            color: #4b5563;
            margin-right: 0.5rem;
        }

        .error-message {
            color: #ef4444;
            font-size: 0.75rem;
            margin-top: 0.25rem;
            display: block;
        }

        .form-actions {
            margin-top: 2rem;
            padding-top: 1.5rem;
            border-top: 1px solid #e5e7eb;
            display: flex;
            gap: 1rem;
            justify-content: center;
        }

        .btn-primary-custom {
            background-color: #00afaa;
            border: 1px solid #00afaa;
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 6px;
            font-size: 0.875rem;
            font-weight: 500;
            min-width: 120px;
            transition: all 0.2s ease;
        }

        .btn-primary-custom:hover:not(:disabled) {
            background-color: #009691;
            border-color: #009691;
        }

        .btn-secondary-custom {
            background-color: #f3f4f6;
            border: 1px solid #d1d5db;
            color: #4b5563;
            padding: 0.75rem 1.5rem;
            border-radius: 6px;
            font-size: 0.875rem;
            font-weight: 500;
            min-width: 120px;
            transition: all 0.2s ease;
        }

        .selected-badge {
            background: #00afaa !important;
            font-size: 0.65rem;
            padding: 0.35rem 0.6rem;
        }
        `}
            </style>

            <Card className="sst-form-container">
                <div className="sst-form-header">
                    <h5>{initialData ? 'Modifier Visite' : 'Nouvelle Visite Médicale'}</h5>
                </div>

                <div className="sst-form-body">
                    <Form onSubmit={handleSubmit}>
                        <div className="form-section-title">
                            <Clock size={14} /> Informations Générales
                        </div>

                        <div className="form-group-wrapper">
                            <Form.Label className="form-label-enhanced">Date de visite</Form.Label>
                            <Form.Control
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                className={`form-control-enhanced ${validationErrors.date ? 'is-invalid' : ''}`}
                            />
                            {validationErrors.date && <span className="error-message">{validationErrors.date}</span>}
                        </div>

                        <div className="form-group-wrapper">
                            <Form.Label className="form-label-enhanced">Médecin responsable</Form.Label>
                            <Form.Select
                                name="doctor"
                                value={formData.doctor}
                                onChange={handleChange}
                                className={`form-control-enhanced ${validationErrors.doctor ? 'is-invalid' : ''}`}
                            >
                                <option value="">Sélectionner un médecin</option>
                                <option value="Dr. Martin">Dr. Martin</option>
                                <option value="Dr. Dupont">Dr. Dupont</option>
                            </Form.Select>
                            {validationErrors.doctor && <span className="error-message">{validationErrors.doctor}</span>}
                        </div>

                        <div className="form-group-wrapper">
                            <Form.Label className="form-label-enhanced">Type de visite</Form.Label>
                            <Form.Select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className={`form-control-enhanced ${validationErrors.type ? 'is-invalid' : ''}`}
                            >
                                <option value="">Sélectionner un type</option>
                                <option value="Périodique">Visite Périodique</option>
                                <option value="Reprise">Visite de Reprise</option>
                                <option value="Embauche">Visite d'Embauche</option>
                            </Form.Select>
                            {validationErrors.type && <span className="error-message">{validationErrors.type}</span>}
                        </div>

                        <div className="form-section-title">
                            <Users size={14} /> Choix des collaborateurs ({formData.selectedEmployees.length} sélectionnés)
                        </div>

                        <div className="filter-bar">
                            <InputGroup size="sm">
                                <InputGroup.Text className="bg-white border-end-0"><Search size={14} /></InputGroup.Text>
                                <Form.Control
                                    placeholder="Rechercher par nom ou ID..."
                                    className="border-start-0"
                                    value={filters.search}
                                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                />
                            </InputGroup>

                            <Form.Select
                                size="sm"
                                value={filters.department}
                                onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                            >
                                <option value="">Tous les départements</option>
                                {departments.map(d => <option key={d} value={d}>{d}</option>)}
                            </Form.Select>
                        </div>

                        <div className="selection-box">
                            {filteredEmployees.length > 0 ? (
                                filteredEmployees.map(emp => (
                                    <div
                                        key={emp.id}
                                        className={`employee-item ${formData.selectedEmployees.includes(emp.id) ? 'selected' : ''}`}
                                        onClick={() => handleEmployeeToggle(emp.id)}
                                    >
                                        <div className="flex-grow-1">
                                            <div className="fw-bold small">{emp.name}</div>
                                            <div className="extra-small text-muted">{emp.id} • {emp.department}</div>
                                        </div>
                                        {formData.selectedEmployees.includes(emp.id) && (
                                            <Badge pill className="selected-badge">Sélectionné</Badge>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 text-center text-muted extra-small">Aucun collaborateur trouvé</div>
                            )}
                        </div>
                        {validationErrors.selection && <span className="error-message">{validationErrors.selection}</span>}

                        <div className="form-section-title">
                            <FileText size={14} /> Observations
                        </div>

                        <div className="form-group-wrapper">
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                className="form-control-enhanced"
                                placeholder="Observations ou motifs particuliers..."
                            />
                        </div>

                        {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

                        <div className="form-actions">
                            <Button type="submit" disabled={loading} className="btn-primary-custom">
                                {loading ? <Spinner animation="border" size="sm" /> : (initialData ? 'Modifier' : 'Enregistrer')}
                            </Button>
                            <Button type="button" onClick={onCancel} className="btn-secondary-custom">
                                Annuler
                            </Button>
                        </div>
                    </Form>
                </div>
            </Card>
        </>
    );
};

export default SSTMedicalRecordForm;
