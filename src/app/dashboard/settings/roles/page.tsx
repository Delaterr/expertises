
"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";
import { doc, collection } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { RoleCard } from "@/components/role-card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AddRoleForm } from "@/components/add-role-form";
import { useAuth, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useSettings } from "@/contexts/settings-context";


const allPermissions = {
    dashboard: { view: true },
    pos: { view: true, checkout: true },
    inventory: { view: true, add: true, edit: true, delete: true },
    sales: { view: true, export: true },
    team: { view: true, invite: true, edit: true },
    settings: { view: true, edit: true },
};

export type Permissions = typeof allPermissions;

// This defines the structure of a Role document itself.
export type Role = {
    id: string;
    name: string;
    description: string;
    permissions: Permissions;
};

// Placeholder for a default Admin role if none are fetched
const defaultAdminRole: Role = {
    id: 'admin_placeholder',
    name: 'Admin',
    description: 'Full access to all shop features.',
    permissions: Object.keys(allPermissions).reduce((acc, section) => {
        const sectionKey = section as keyof Permissions;
        acc[sectionKey] = Object.keys(allPermissions[sectionKey]).reduce((pAcc, p) => {
            (pAcc as any)[p] = true;
            return pAcc;
        }, {} as any);
        return acc;
    }, {} as Permissions)
};


export default function SettingsRolesPage() {
    const { settings: initialShopSettings, loading: settingsLoading } = useSettings();
    const { toast } = useToast();
    const auth = useAuth();
    const firestore = useFirestore();

    const [isEditingRoles, setIsEditingRoles] = useState(false);
    const [roleDialogOpen, setRoleDialogOpen] = useState(false);
    
    const shopId = initialShopSettings?.id;

    const rolesDefinitionCollectionRef = useMemoFirebase(() => {
        if (shopId) {
            return collection(firestore, 'shops', shopId, 'role-definitions');
        }
        return null;
    }, [firestore, shopId]);

    const { data: fetchedRoles, isLoading: rolesLoading } = useCollection<Role>(rolesDefinitionCollectionRef);
    const [editedRoles, setEditedRoles] = useState<Role[] | null>(null);

    const roles = useMemo(() => {
        if (fetchedRoles && fetchedRoles.length > 0) {
            return fetchedRoles;
        }
        return [defaultAdminRole];
    }, [fetchedRoles]);

    useEffect(() => {
        if (roles) {
            setEditedRoles(JSON.parse(JSON.stringify(roles)));
        }
    }, [roles]);

    const handleRolePermissionChange = (roleId: string, section: keyof Permissions, perm: string, value: boolean) => {
        setEditedRoles(currentRoles => 
            currentRoles?.map(role => 
                role.id === roleId 
                ? {
                    ...role,
                    permissions: {
                        ...role.permissions,
                        [section]: {
                            ...(role.permissions as any)[section],
                            [perm]: value
                        }
                    }
                  }
                : role
            ) || null
        );
    };

    const handleRoleFieldChange = (roleId: string, field: 'name' | 'description', value: string) => {
        setEditedRoles(currentRoles => 
            currentRoles?.map(role => 
                role.id === roleId ? { ...role, [field]: value } : role
            ) || null
        );
    };

    const handleSaveRoleChanges = () => {
        if (!editedRoles || !rolesDefinitionCollectionRef) return;
        
        editedRoles.forEach(role => {
            if (role.id === 'admin_placeholder') return; // Don't save placeholder
            const roleRef = doc(rolesDefinitionCollectionRef, role.id);
            const { id, ...roleData } = role;
            updateDocumentNonBlocking(roleRef, roleData);
        });

        toast({
            title: "Roles Updated",
            description: "All role permissions have been saved."
        });
        setIsEditingRoles(false);
    };

    const handleAddRole = (newRoleData: Omit<Role, 'id'>) => {
        if (!rolesDefinitionCollectionRef) return;

        addDocumentNonBlocking(rolesDefinitionCollectionRef, newRoleData);
        setRoleDialogOpen(false);
        toast({
            title: "Role Added",
            description: `The role "${newRoleData.name}" has been created.`,
        });
    };
    
    const handleDeleteRole = (roleId: string) => {
        const roleToDelete = editedRoles?.find(r => r.id === roleId);
        if (!roleToDelete || !rolesDefinitionCollectionRef || roleToDelete.id === 'admin_placeholder') return;
        
        const roleRef = doc(rolesDefinitionCollectionRef, roleId);
        deleteDocumentNonBlocking(roleRef);

        setEditedRoles(currentRoles => currentRoles?.filter(r => r.id !== roleId) || null);
        
        toast({
            title: "Role Deleted",
            description: `The role "${roleToDelete.name}" has been deleted.`,
        });
    };

    const handleCancelEdit = () => {
        if (roles) {
            setEditedRoles(JSON.parse(JSON.stringify(roles)));
        }
        setIsEditingRoles(false);
    }

    if (settingsLoading || rolesLoading || !editedRoles) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Roles & Permissions</CardTitle>
                    <CardDescription>Define what each role can access and do in your shop.</CardDescription>
                </div>
                    <div className="flex items-center gap-2">
                    {isEditingRoles ? (
                        <>
                            <Button variant="ghost" onClick={handleCancelEdit}>Cancel</Button>
                            <Button onClick={handleSaveRoleChanges}>Save Changes</Button>
                        </>
                    ) : (
                        <Button onClick={() => setIsEditingRoles(true)}>Edit Roles</Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {editedRoles.map(role => (
                        <div key={role.id} className="relative group">
                            <RoleCard 
                                role={role} 
                                isEditing={isEditingRoles}
                                onPermissionChange={(section, perm, value) => handleRolePermissionChange(role.id, section, perm, value)}
                                onFieldChange={(field, value) => handleRoleFieldChange(role.id, field, value)}
                            />
                            {isEditingRoles && role.name !== "Owner" && role.name !== "Admin" && (
                                <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Delete Role</span>
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will permanently delete the <strong>{role.name}</strong> role. This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteRole(role.id)}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            )}
                        </div>
                    ))}
                     {isEditingRoles && (
                         <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="h-full min-h-[200px] border-dashed text-muted-foreground flex-col gap-2">
                                     <PlusCircle className="h-8 w-8" />
                                     Add New Role
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create New Role</DialogTitle>
                                    <DialogDescription>Define the name, description, and permissions for the new role.</DialogDescription>
                                </DialogHeader>
                                <AddRoleForm onAddRole={handleAddRole} allPermissions={allPermissions} />
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

    