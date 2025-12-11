"use client";

import { Box, Button, Typography, Menu, MenuItem, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, SelectChangeEvent } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useMemo, useState } from "react";
import {
    GridRowSelectionModel,
    GridRowId,
} from "@mui/x-data-grid";

import { useEmployees } from "@/hooks/useEmployees";
import EmployeeFilters from "@/components/employees/EmployeeFilter";
import EmployeeTable from "@/components/employees/EmployeeTable";
import AddEmployeeModal from "@/components/employees/AddEmployee";
import { departments } from "@/data/departments";

const AVAILABLE_ROLES = ["employee", "manager", "admin", "helper"];

export default function Home() {
    const {
        filteredEmployees,
        searchText,
        departmentFilter,
        setSearchText,
        setDepartmentFilter,
        fetchEmployees,
        loading,
    } = useEmployees();

    const [modalOpen, setModalOpen] = useState(false);

    // MUI v8 selection model structure
    const [rowSelectionModel, setRowSelectionModel] =
        useState<GridRowSelectionModel>({
            type: "include",
            ids: new Set<GridRowId>(),
        });

    // Convert selected Set → array for API calls
    const selectedIds = useMemo(
        () => Array.from(rowSelectionModel.ids) as string[],
        [rowSelectionModel]
    );

    // Menu & role dialog state
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const menuOpen = Boolean(anchorEl);

    const [roleDialogOpen, setRoleDialogOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<string>(AVAILABLE_ROLES[0]);

    const openMenu = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
    const closeMenu = () => setAnchorEl(null);

    const openRoleDialog = () => {
        setSelectedRole(AVAILABLE_ROLES[0]);
        setRoleDialogOpen(true);
        closeMenu();
    };
    const closeRoleDialog = () => setRoleDialogOpen(false);

    const clearSelection = () => {
        setRowSelectionModel({
            type: "include",
            ids: new Set<GridRowId>(),
        });
    };

    // Generic bulk action caller
    const callBulkAction = async (action: "delete" | "changeRole" | "sendWelcome", role?: string) => {
        if (!selectedIds.length) return;

        // Confirm messages tailored per action
        const confirmMsg =
            action === "delete"
                ? `Delete ${selectedIds.length} user(s)? This cannot be undone.`
                : action === "changeRole"
                    ? `Change role of ${selectedIds.length} user(s) to "${role}"?`
                    : `Send welcome email to ${selectedIds.length} user(s)? This will reset their password.`;

        if (!window.confirm(confirmMsg)) return;

        try {
            const res = await fetch("/api/employees/bulk-action", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: selectedIds, action, role, sendEmail: true }),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data?.message || "Bulk action failed");
                return;
            }

            // Refresh list and clear selection
            await fetchEmployees();
            clearSelection();

            // Provide feedback (server response may include more details)
            alert(data?.message || "Bulk action completed");
        } catch (err) {
            console.error("Bulk action error", err);
            alert("Bulk action failed. See console for details.");
        }
    };

    const handleDeleteSelected = async () => {
        closeMenu();
        await callBulkAction("delete");
    };

    const handleSendWelcome = async () => {
        closeMenu();
        await callBulkAction("sendWelcome");
    };

    const handleChangeRoleConfirm = async () => {
        await callBulkAction("changeRole", selectedRole);
        closeRoleDialog();
    };

    const handleRoleSelectChange = (e: SelectChangeEvent<string>) => {
        setSelectedRole(e.target.value as string);
    };

    return (
        <Box>
            <EmployeeFilters
                searchText={searchText}
                setSearchText={setSearchText}
                departments={departments}
                departmentFilter={departmentFilter}
                setDepartmentFilter={setDepartmentFilter}
                onAddClick={() => setModalOpen(true)}
            />

            {selectedIds.length > 0 && (
                <Box
                    sx={{
                        mb: 1.5,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        px: 0.5,
                    }}
                >
                    <Typography variant="body2" color="text.secondary">
                        {selectedIds.length} employee(s) selected
                    </Typography>

                    <Box>
                        <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={handleDeleteSelected}
                            sx={{ mr: 1 }}
                        >
                            Delete
                        </Button>

                        <IconButton
                            aria-label="more actions"
                            id="bulk-action-button"
                            aria-controls={menuOpen ? "bulk-action-menu" : undefined}
                            aria-haspopup="true"
                            aria-expanded={menuOpen ? "true" : undefined}
                            onClick={openMenu}
                            size="small"
                        >
                            <MoreVertIcon />
                        </IconButton>

                        <Menu
                            id="bulk-action-menu"
                            anchorEl={anchorEl}
                            open={menuOpen}
                            onClose={closeMenu}
                            MenuListProps={{
                                "aria-labelledby": "bulk-action-button",
                            }}
                        >
                            <MenuItem onClick={openRoleDialog}>Change Role</MenuItem>
                            <MenuItem onClick={handleSendWelcome}>Send Welcome Email</MenuItem>
                        </Menu>
                    </Box>
                </Box>
            )}

            <Box sx={{ width: "100%" }}>
                <EmployeeTable
                    loading={loading}
                    rows={filteredEmployees}
                    fetchEmployees={fetchEmployees}
                    rowSelectionModel={rowSelectionModel}
                    onSelectionChange={setRowSelectionModel}
                />
            </Box>

            <AddEmployeeModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onAdded={fetchEmployees}
            />

            {/* Change Role Dialog */}
            <Dialog open={roleDialogOpen} onClose={closeRoleDialog}>
                <DialogTitle>Change Role for Selected Users</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 1 }}>
                        <InputLabel id="select-role-label">Role</InputLabel>
                        <Select
                            labelId="select-role-label"
                            value={selectedRole}
                            label="Role"
                            onChange={handleRoleSelectChange}
                        >
                            {AVAILABLE_ROLES.map((r) => (
                                <MenuItem key={r} value={r}>
                                    {r}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeRoleDialog}>Cancel</Button>
                    <Button variant="contained" onClick={handleChangeRoleConfirm}>
                        Change Role
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
