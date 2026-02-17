import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import "../Employe/DepartementManager.css";
import { MdOutlinePostAdd } from "react-icons/md";
import "bootstrap/dist/css/bootstrap.min.css";
import SSTMedicalRecords from "./SSTMedicalRecords";
import { IoFolderOpenOutline } from "react-icons/io5";
import { FaMinus } from "react-icons/fa6";
import { FaPlus } from "react-icons/fa6";
import Swal from 'sweetalert2';
import { useHeader } from "../../Acceuil/HeaderContext";
import { useOpen } from "../../Acceuil/OpenProvider";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Box } from "@mui/material";

function SSTMedicalRecordsManager() {
    const [departements, setDepartements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditingDepartement, setIsEditingDepartement] = useState(false);
    const [editingDepartementId, setEditingDepartementId] = useState(null);
    const [isAddingVisit, setIsAddingVisit] = useState(false);
    const [selectedDepartementId, setSelectedDepartementId] = useState(null);
    const [selectedDepartementName, setSelectedDepartementName] = useState(null);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [newDepartementName, setNewDepartementName] = useState("");
    const [newSubDepartementName, setNewSubDepartementName] = useState("");
    const [addingSubDepartement, setAddingSubDepartement] = useState(null);
    const [includeSubDepartments, setIncludeSubDepartments] = useState(false);

    const { setTitle, setOnPrint, setOnExportPDF, setOnExportExcel, searchQuery, clearActions } = useHeader();
    const { dynamicStyles, isMobile } = useOpen();
    const [permissions, setPermissions] = useState([]);

    useEffect(() => {
        const fetchPerms = async () => {
            try {
                const resp = await axios.get("http://localhost:8000/api/user", { withCredentials: true });
                const roles = Array.isArray(resp.data) ? resp.data[0]?.roles : resp.data?.roles;
                const perms = roles && roles[0]?.permissions ? roles[0].permissions.map(p => p.name) : [];
                setPermissions(perms);
            } catch (e) {
                setPermissions([]);
            }
        };
        fetchPerms();
    }, []);

    const canCreate = permissions.includes('create_departements');
    const canUpdate = permissions.includes('update_departements');
    const canDelete = permissions.includes('delete_departements');

    const medicalRecordsRef = useRef(null);
    const [expandedDepartements, setExpandedDepartements] = useState({});
    const [contextMenu, setContextMenu] = useState({
        visible: false,
        x: 0,
        y: 0,
        departementId: null,
    });
    const departementRef = useRef({});
    const subDepartementInputRef = useRef(null);
    const [clickOutsideTimeout, setClickOutsideTimeout] = useState(null);
    const [parentDepartementId, setParentDepartementId] = useState(null);
    const [editingDepartement, setEditingDepartement] = useState(null);
    const editInputRef = useRef(null);

    useEffect(() => {
        setTitle("Dossiers Médicaux");
        setOnPrint(() => () => { if (medicalRecordsRef.current) medicalRecordsRef.current.handlePrint(); });
        setOnExportPDF(() => () => { if (medicalRecordsRef.current) medicalRecordsRef.current.exportToPDF(); });
        setOnExportExcel(() => () => { if (medicalRecordsRef.current) medicalRecordsRef.current.exportToExcel(); });
        return () => {
            clearActions();
        };
    }, [setTitle, setOnPrint, setOnExportPDF, setOnExportExcel, clearActions]);

    const fetchDepartmentHierarchy = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/departements/hierarchy');
            setDepartements(response.data);
            localStorage.setItem('departmentHierarchy', JSON.stringify(response.data));
        } catch (error) {
            console.error("Error fetching department hierarchy:", error);
        }
    };

    useEffect(() => {
        const departmentsFromStorage = localStorage.getItem('departmentHierarchy');
        if (departmentsFromStorage) {
            setDepartements(JSON.parse(departmentsFromStorage));
        }
        fetchDepartmentHierarchy();
    }, []);

    const fetchDepartements = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get("http://127.0.0.1:8000/api/departements");
            const departmentsTree = buildDepartementTree(response.data);
            setDepartements(departmentsTree);
        } catch (error) {
            console.error("Error fetching departments:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDepartements();
        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [fetchDepartements]);

    const buildDepartementTree = (flatDepartements) => {
        const departementMap = {};
        const tree = [];
        flatDepartements.forEach((dept) => {
            dept.children = [];
            departementMap[dept.id] = dept;
        });
        flatDepartements.forEach((dept) => {
            if (dept.parent_id && departementMap[dept.parent_id]) {
                departementMap[dept.parent_id].children.push(dept);
            } else {
                tree.push(dept);
            }
        });
        return tree;
    };

    const handleStartEditing = (departementId, departementName) => {
        setEditingDepartement({ id: departementId, name: departementName });
        setContextMenu({ visible: false, x: 0, y: 0, departementId: null });
        setTimeout(() => { if (editInputRef.current) editInputRef.current.focus(); }, 0);
    };

    const handleFinishEditing = async () => {
        if (editingDepartement) {
            try {
                await axios.put(`http://127.0.0.1:8000/api/departements/${editingDepartement.id}`, { nom: editingDepartement.name });
                fetchDepartmentHierarchy();
            } catch (error) {
                console.error("Error updating department:", error);
            }
        }
        setEditingDepartement(null);
    };

    const handleAddSubDepartement = async (parentId) => {
        if (!newSubDepartementName.trim()) {
            setAddingSubDepartement(null);
            return;
        }
        try {
            await axios.post("http://127.0.0.1:8000/api/departements", { nom: newSubDepartementName, parent_id: parentId });
            setExpandedDepartements((prev) => ({ ...prev, [parentId]: true }));
            fetchDepartmentHierarchy();
        } catch (error) {
            console.error("Error adding sub-department:", error);
        }
        setNewSubDepartementName("");
        setAddingSubDepartement(null);
    };

    const handleAddSousDepartement = (parentId) => {
        setAddingSubDepartement(parentId);
        setContextMenu({ visible: false, x: 0, y: 0 });
        setExpandedDepartements((prev) => ({ ...prev, [parentId]: true }));
        setNewSubDepartementName("");
        setTimeout(() => { if (subDepartementInputRef.current) subDepartementInputRef.current.focus(); }, 0);
    };

    const handleClickOutside = (e) => {
        if (!e.target.closest(".context-menu") && !e.target.closest(".edit-form")) {
            setContextMenu({ visible: false, x: 0, y: 0, departementId: null });
            setEditingDepartementId(null);
            setIsEditingDepartement(false);
        }
    };

    const handleDepartementClick = (departementId, departementName) => {
        if (departementId) {
            setSelectedDepartementId(departementId);
            setSelectedDepartementName(departementName);
        }
    };

    const handleAddVisitClick = (id) => {
        setIsAddingVisit(true);
        setSelectedDepartementId(id);
        setContextMenu({ visible: false, x: 0, y: 0 });
    };

    const toggleExpand = (departementId) => {
        setExpandedDepartements((prev) => ({
            ...prev,
            [departementId]: !prev[departementId],
        }));
    };

    const renderDepartement = (departement) => (
        <li key={departement.id} style={{ listStyleType: "none" }}>
            <div
                className={`department-item ${departement.id === selectedDepartementId ? 'selected' : ''}`}
                ref={(el) => (departementRef.current[departement.id] = el)}
            >
                <div className="department-item-content">
                    {departement.children && departement.children.length > 0 && (
                        <button className="expand-button" onClick={() => toggleExpand(departement.id)}>
                            {expandedDepartements[departement.id] ? <FaMinus size={14} /> : <FaPlus size={14} />}
                        </button>
                    )}
                    {departement.children && departement.children.length === 0 && (
                        <div style={{ width: "24px", marginRight: "8px" }}></div>
                    )}
                    {editingDepartement && editingDepartement.id === departement.id ? (
                        <input
                            ref={editInputRef}
                            type="text"
                            value={editingDepartement.name}
                            onChange={(e) => setEditingDepartement({ ...editingDepartement, name: e.target.value })}
                            onBlur={handleFinishEditing}
                            onKeyPress={(e) => { if (e.key === "Enter") handleFinishEditing(); }}
                            className="form-control"
                            style={{ fontSize: "14px" }}
                        />
                    ) : (
                        <span
                            onContextMenu={(e) => handleContextMenu(e, departement.id)}
                            onClick={() => handleDepartementClick(departement.id, departement.nom)}
                            className={`common-text ${selectedDepartementId === departement.id ? 'selected' : ''}`}
                        >
                            <IoFolderOpenOutline size={18} />
                            {departement.nom}
                        </span>
                    )}
                </div>
            </div>
            {addingSubDepartement === departement.id && (
                <div className="sub-departement-input">
                    <input
                        ref={subDepartementInputRef}
                        className="form-control"
                        type="text"
                        value={newSubDepartementName}
                        onChange={(e) => setNewSubDepartementName(e.target.value)}
                        onKeyPress={(e) => { if (e.key === "Enter") handleAddSubDepartement(departement.id); }}
                        placeholder="Nom du sous-département"
                    />
                </div>
            )}
            {expandedDepartements[departement.id] && departement.children && departement.children.length > 0 && (
                <ul className="sub-departments">
                    {departement.children.map((child) => renderDepartement(child))}
                </ul>
            )}
        </li>
    );

    const handleContextMenu = (e, departementId) => {
        e.preventDefault();
        const rect = departementRef.current[departementId].getBoundingClientRect();
        setContextMenu({ visible: true, x: rect.right, y: rect.top, departementId: departementId });
    };

    const getSubDepartmentIds = useCallback((departments, id) => {
        const ids = new Set([id]);
        const addIds = (dept) => {
            if (dept.children && dept.children.length > 0) {
                dept.children.forEach(child => { ids.add(child.id); addIds(child); });
            }
        };
        const findDepartment = (depts, targetId) => {
            for (let dept of depts) {
                if (dept.id === targetId) return dept;
                if (dept.children && dept.children.length > 0) {
                    const found = findDepartment(dept.children, targetId);
                    if (found) return found;
                }
            }
            return null;
        };
        const targetDept = findDepartment(departments, id);
        if (targetDept) addIds(targetDept);
        return Array.from(ids);
    }, []);

    const [filtersVisible, setFiltersVisible] = useState(false);
    const handleFiltersToggle = (isVisible) => {
        if (isVisible) setFiltersVisible(true);
        else setTimeout(() => { setFiltersVisible(false); }, 300);
    };

    return (
        <ThemeProvider theme={createTheme()}>
            <Box sx={{ ...dynamicStyles }}>
                <Box component="main" sx={{ flexGrow: 1, p: 0, mt: 12 }}>
                    <div className="departement_home1">
                        <ul className="departement_list">
                            <li style={{ listStyleType: "none" }}>
                                <div className="checkbox-container" style={{ marginTop: '5%', width: '90%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '5%' }}>
                                    <input
                                        type="checkbox"
                                        checked={includeSubDepartments}
                                        onChange={(e) => setIncludeSubDepartments(e.target.checked)}
                                        id="include-sub-deps"
                                    />
                                    <label htmlFor="include-sub-deps">Inclure les sous-départements</label>
                                </div>
                            </li>
                            <div className="separator" style={{ marginTop: '-1%' }}></div>
                            {departements.map((departement) => renderDepartement(departement))}
                        </ul>

                        {contextMenu.visible && (
                            <div className="context-menu" style={{ top: "15%", left: "16%" }}>
                                <button onClick={() => handleAddVisitClick(contextMenu.departementId)}>Nouvelle Visite</button>
                                <button onClick={() => handleAddSousDepartement(contextMenu.departementId)}>Ajouter sous département</button>
                                <button onClick={() => handleStartEditing(contextMenu.departementId, departements.find(d => d.id === contextMenu.departementId)?.nom)}>Modifier</button>
                                <button onClick={() => setContextMenu({ visible: false, x: 0, y: 0, departementId: null })}>Fermer</button>
                            </div>
                        )}

                        <SSTMedicalRecords
                            departementId={selectedDepartementId}
                            departementName={selectedDepartementName}
                            onClose={() => setSelectedDepartementId(null)}
                            isAddingVisit={isAddingVisit}
                            setIsAddingVisit={setIsAddingVisit}
                            includeSubDepartments={includeSubDepartments}
                            getSubDepartmentIds={getSubDepartmentIds}
                            departements={departements}
                            ref={medicalRecordsRef}
                            filtersVisible={filtersVisible}
                            handleFiltersToggle={handleFiltersToggle}
                        />
                    </div>
                </Box>
            </Box>
        </ThemeProvider>
    );
}

export default SSTMedicalRecordsManager;
