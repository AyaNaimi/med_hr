import React, { useState, useMemo, useEffect } from 'react';
import { Card, Form, Button, Alert, Spinner, Table, Badge, InputGroup } from 'react-bootstrap';
import { User, Clock, Stethoscope, FileText, Search, Users, Filter, X } from 'lucide-react';

const SSTVisitForm = ({ onSubmit, onCancel, initialData }) => {
    // Mock employees data for selection with last visit dates
    const availableEmployees = [
        { id: 'E001', name: 'Jean Dupont', department: 'Production', status: 'Apte', lastVisitDate: '2024-10-15' }, // Retard
        { id: 'E002', name: 'Marie Dubois', department: 'Logistique', status: 'Apte', lastVisitDate: '2025-12-01' }, // À jour
        { id: 'E003', name: 'Pierre Martin', department: 'RH', status: 'Apte', lastVisitDate: '2025-11-20' }, // À prévoir
        { id: 'E004', name: 'Sophie Laurent', department: 'IT', status: 'Apte', lastVisitDate: '2026-01-05' }, // À jour
        { id: 'E005', name: 'Alain Bernard', department: 'Production', status: 'A suivre', lastVisitDate: '2024-08-12' }, // Retard
        { id: 'E006', name: 'Thomas Petit', department: 'Logistique', status: 'Apte', lastVisitDate: '2025-10-30' }, // À prévoir
        { id: 'E007', name: 'Julie Leroy', department: 'Production', status: 'Apte', lastVisitDate: '2026-01-20' }, // À jour
        { id: 'E008', name: 'Nicolas Roux', department: 'Maintenance', status: 'Attention', lastVisitDate: '2024-06-10' }, // Retard
    ];

    // Helper function to determine priority status based on last visit date
    const getEmployeePriority = (lastVisitDate) => {
        if (!lastVisitDate) return 'overdue';

        const today = new Date();
        const lastVisit = new Date(lastVisitDate);
        const monthsDiff = (today - lastVisit) / (1000 * 60 * 60 * 24 * 30);

        if (monthsDiff > 24) return 'overdue'; // Rouge: Plus de 2 ans (Retard)
        if (monthsDiff > 20) return 'upcoming'; // Orange: Entre 20-24 mois (À prévoir bientôt)
        return 'uptodate'; // Vert: Moins de 20 mois (À jour)
    };

    const getPriorityBadge = (priority) => {
        const badges = {
            overdue: { color: '#ef4444', label: 'RETARD', bgColor: '#fee2e2' },
            upcoming: { color: '#f97316', label: 'À PRÉVOIR', bgColor: '#ffedd5' },
            uptodate: { color: '#22c55e', label: 'À JOUR', bgColor: '#dcfce7' }
        };
        return badges[priority] || badges.overdue;
    };

    const departments = [...new Set(availableEmployees.map(e => e.department))];

    const [formData, setFormData] = useState({
        date: initialData?.date || '',
        doctors: initialData?.doctors || (initialData?.doctor ? initialData.doctor.split(', ') : []),
        type: initialData?.type || '',
        lieu: initialData?.lieu || initialData?.location || '',
        notes: initialData?.notes || '',
        selectedEmployees: initialData?.selectedEmployees ||
            (initialData?.employees?.map(e => typeof e === 'object' ? e.id : e)) ||
            [],
    });

    // Reset form when initialData changes (e.g., switching between different visits to edit)
    useEffect(() => {
        setFormData({
            date: initialData?.date || '',
            doctors: initialData?.doctors || (initialData?.doctor ? initialData.doctor.split(', ') : []),
            type: initialData?.type || '',
            lieu: initialData?.lieu || initialData?.location || '',
            notes: initialData?.notes || '',
            selectedEmployees: initialData?.selectedEmployees ||
                (initialData?.employees?.map(e => typeof e === 'object' ? e.id : e)) ||
                [],
        });
    }, [initialData]);

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

    const handleDoctorToggle = (docName) => {
        setFormData(prev => {
            const isSelected = prev.doctors.includes(docName);
            const newSelection = isSelected
                ? prev.doctors.filter(d => d !== docName)
                : [...prev.doctors, docName];
            return { ...prev, doctors: newSelection };
        });
        if (validationErrors.doctors) {
            setValidationErrors(prev => ({ ...prev, doctors: '' }));
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
        if (formData.doctors.length === 0) errors.doctors = 'Au moins un médecin est requis';
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
            // Re-map doctors to doctor for backward compatibility if needed, 
            // but the parent should handle doctors array now.
            const submissionData = {
                ...formData,
                doctor: formData.doctors.join(', ')
            };
            await onSubmit(submissionData);
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
            overflow: hidden;
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

        .sst-form-content {
            padding: 1.5rem;
            background-color: transparent;
            flex: 1;
            overflow-y: auto;
            min-height: 0;
        }

        .scrollbar-teal::-webkit-scrollbar { width: 4px; }
        .scrollbar-teal::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        .scrollbar-teal::-webkit-scrollbar-thumb { background: #3a8a90; border-radius: 10px; }

        .sst-form-footer {
            padding: 1.25rem 1.5rem;
            background: #ffffff;
            border-top: 1px solid #e5e7eb;
            flex-shrink: 0;
            display: flex;
            gap: 1rem;
            justify-content: center;
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
            font-size: 0.875rem;
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
            display: none; /* Replaced by sst-form-footer */
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
                <Form onSubmit={handleSubmit} className="d-flex flex-column h-100">
                    <div className="sst-form-header">
                        <h5>{initialData ? 'Modifier Visite' : 'Programmer une visite'}</h5>
                    </div>

                    <div className="sst-form-content scrollbar-teal">
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
                            <Form.Label className="form-label-enhanced">Médecins responsables ({formData.doctors.length})</Form.Label>
                            <div className="d-flex flex-wrap gap-2 p-3 bg-light rounded-3 border">
                                {['Dr. Martin', 'Dr. Dupont', 'Dr. Leroy', 'Dr. Bernard'].map(doc => {
                                    const isSelected = formData.doctors.includes(doc);
                                    return (
                                        <Badge
                                            key={doc}
                                            bg={isSelected ? 'light' : 'white'}
                                            text={isSelected ? 'primary' : 'dark'}
                                            className={`rounded-pill px-3 py-2 cursor-pointer border ${isSelected ? 'border-primary shadow-sm' : 'border-light'}`}
                                            onClick={() => handleDoctorToggle(doc)}
                                            style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                                        >
                                            {doc}
                                            {isSelected && <X size={14} className="ms-2" />}
                                        </Badge>
                                    );
                                })}
                            </div>
                            {validationErrors.doctors && <span className="error-message">{validationErrors.doctors}</span>}
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

                        <div className="form-group-wrapper">
                            <Form.Label className="form-label-enhanced">Lieu de la visite</Form.Label>
                            <Form.Control
                                type="text"
                                name="lieu"
                                value={formData.lieu}
                                onChange={handleChange}
                                placeholder="ex: Cabinet Mobile, Infirmerie Centrale..."
                                className="form-control-enhanced"
                            />
                        </div>

                        <div className="form-section-title">
                            <Users size={14} /> Choix des collaborateurs ({formData.selectedEmployees.length} sélectionnés)
                        </div>

                        <div className="filter-bar">
                            <div className="d-flex gap-2 mb-2">
                                <InputGroup size="sm" className="flex-grow-1">
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
                                    style={{ maxWidth: '180px' }}
                                    value={filters.department}
                                    onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                                >
                                    <option value="">Tous les services</option>
                                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                                </Form.Select>
                            </div>

                            <div className="d-flex justify-content-between align-items-center">
                                <div className="text-muted extra-small">
                                    {filteredEmployees.length} trouvé(s)
                                </div>
                                <div className="d-flex gap-2">
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        className="extra-small fw-bold px-3 py-1 bg-white"
                                        onClick={() => {
                                            const idsToSelect = filteredEmployees.map(e => e.id);
                                            setFormData(prev => ({
                                                ...prev,
                                                selectedEmployees: [...new Set([...prev.selectedEmployees, ...idsToSelect])]
                                            }));
                                        }}
                                        disabled={filteredEmployees.length === 0}
                                    >
                                        Tout sélectionner ({filteredEmployees.length})
                                    </Button>
                                    {formData.selectedEmployees.length > 0 && (
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            className="extra-small fw-bold px-3 py-1 bg-white"
                                            onClick={() => setFormData(prev => ({ ...prev, selectedEmployees: [] }))}
                                        >
                                            Tout désélectionner
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Drag & Drop Zones */}
                        <div className="row g-3">
                            {/* Available Employees - Left Column */}
                            <div className="col-md-6">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="extra-small fw-bold text-muted uppercase">Disponibles</span>
                                    <Badge bg="secondary" className="extra-small">{filteredEmployees.filter(e => !formData.selectedEmployees.includes(e.id)).length}</Badge>
                                </div>
                                <div className="selection-box scrollbar-teal" style={{ minHeight: '450px' }}>
                                    {filteredEmployees.filter(emp => !formData.selectedEmployees.includes(emp.id)).length > 0 ? (
                                        filteredEmployees.filter(emp => !formData.selectedEmployees.includes(emp.id)).map(emp => {
                                            const priority = getEmployeePriority(emp.lastVisitDate);
                                            const badge = getPriorityBadge(priority);
                                            return (
                                                <div
                                                    key={emp.id}
                                                    className="employee-item"
                                                    draggable
                                                    onDragStart={(e) => {
                                                        e.dataTransfer.effectAllowed = 'move';
                                                        e.dataTransfer.setData('employeeId', emp.id);
                                                    }}
                                                    onClick={() => handleEmployeeToggle(emp.id)}
                                                    style={{ cursor: 'grab' }}
                                                >
                                                    <div
                                                        style={{
                                                            width: '8px',
                                                            height: '8px',
                                                            borderRadius: '50%',
                                                            backgroundColor: badge.color,
                                                            flexShrink: 0
                                                        }}
                                                    />
                                                    <div className="flex-grow-1">
                                                        <div className="fw-bold small">{emp.name}</div>
                                                        <div className="extra-small text-muted">{emp.id} • {emp.department}</div>
                                                    </div>
                                                    <Badge
                                                        style={{
                                                            backgroundColor: badge.bgColor,
                                                            color: badge.color,
                                                            border: `1px solid ${badge.color}`,
                                                            fontSize: '0.6rem',
                                                            padding: '0.25rem 0.5rem'
                                                        }}
                                                    >
                                                        {badge.label}
                                                    </Badge>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="p-4 text-center text-muted extra-small">Aucun collaborateur disponible</div>
                                    )}
                                </div>
                            </div>

                            {/* Selected Employees - Right Column (Drop Zone) */}
                            <div className="col-md-6">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="extra-small fw-bold text-primary uppercase">Sélectionnés pour cette visite</span>
                                    <Badge bg="primary" className="extra-small">{formData.selectedEmployees.length}</Badge>
                                </div>
                                <div
                                    className="selection-box drop-zone scrollbar-teal"
                                    style={{
                                        minHeight: '450px',
                                        backgroundColor: formData.selectedEmployees.length === 0 ? '#f8fafc' : 'white',
                                        border: formData.selectedEmployees.length === 0 ? '2px dashed #cbd5e1' : '1px solid #e5e7eb'
                                    }}
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        e.dataTransfer.dropEffect = 'move';
                                    }}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        const employeeId = e.dataTransfer.getData('employeeId');
                                        if (employeeId && !formData.selectedEmployees.includes(employeeId)) {
                                            handleEmployeeToggle(employeeId);
                                        }
                                    }}
                                >
                                    {formData.selectedEmployees.length > 0 ? (
                                        availableEmployees
                                            .filter(emp => formData.selectedEmployees.includes(emp.id))
                                            .map(emp => {
                                                const priority = getEmployeePriority(emp.lastVisitDate);
                                                const badge = getPriorityBadge(priority);
                                                return (
                                                    <div
                                                        key={emp.id}
                                                        className="employee-item selected"
                                                        draggable
                                                        onDragStart={(e) => {
                                                            e.dataTransfer.effectAllowed = 'move';
                                                            e.dataTransfer.setData('employeeId', emp.id);
                                                            e.dataTransfer.setData('removeFromSelected', 'true');
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                width: '8px',
                                                                height: '8px',
                                                                borderRadius: '50%',
                                                                backgroundColor: badge.color,
                                                                flexShrink: 0
                                                            }}
                                                        />
                                                        <div className="flex-grow-1">
                                                            <div className="fw-bold small">{emp.name}</div>
                                                            <div className="extra-small text-muted">{emp.id} • {emp.department}</div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-link p-0 text-danger"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEmployeeToggle(emp.id);
                                                            }}
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                );
                                            })
                                    ) : (
                                        <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted p-4">
                                            <Users size={48} className="mb-3 opacity-25" />
                                            <div className="text-center">
                                                <div className="small fw-bold mb-1">Zone de Sélection</div>
                                                <div className="extra-small">Glissez-déposez des collaborateurs ici</div>
                                                <div className="extra-small">ou cliquez sur un nom dans la liste</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
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
                                placeholder="Observations préliminaires ou motifs particuliers..."
                            />
                        </div>

                        {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
                    </div>

                    <div className="sst-form-footer">
                        <Button type="submit" disabled={loading} className="btn-primary-custom">
                            {loading ? <Spinner animation="border" size="sm" /> : (initialData ? 'Modifier' : 'Programmer')}
                        </Button>
                        <Button type="button" onClick={onCancel} className="btn-secondary-custom">
                            Annuler
                        </Button>
                    </div>
                </Form>
            </Card>
        </>
    );
};

export default SSTVisitForm;
