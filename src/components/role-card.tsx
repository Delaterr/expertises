
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { Role } from "@/app/dashboard/settings/page";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

type Permissions = Role['permissions'];

interface RoleCardProps {
    role: Role;
    isEditing: boolean;
    onPermissionChange: (section: keyof Permissions, perm: string, value: boolean) => void;
    onFieldChange: (field: 'name' | 'description', value: string) => void;
}

const formatPermissionName = (name: string) => {
    return name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
}

export function RoleCard({ role, isEditing, onPermissionChange, onFieldChange }: RoleCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        {isEditing ? (
            <div className="space-y-2">
                <Label htmlFor={`role-name-${role.name}`}>Role Name</Label>
                <Input 
                    id={`role-name-${role.name}`}
                    value={role.name}
                    onChange={(e) => onFieldChange('name', e.target.value)}
                />
            </div>
        ) : (
            <CardTitle>{role.name}</CardTitle>
        )}
        {isEditing ? (
             <div className="space-y-2">
                <Label htmlFor={`role-desc-${role.name}`}>Description</Label>
                <Textarea
                    id={`role-desc-${role.name}`}
                    value={role.description}
                    onChange={(e) => onFieldChange('description', e.target.value)}
                    className="text-sm"
                />
            </div>
        ) : (
            <CardDescription>{role.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4 flex-grow">
        {Object.entries(role.permissions).map(([section, perms]) => (
            <div key={section}>
                <h4 className="font-medium capitalize mb-2">{section}</h4>
                <div className="grid gap-2 pl-2">
                    {Object.entries(perms).map(([perm, value]) => (
                        <div key={`${role.name}-${section}-${perm}`} className="flex items-center space-x-2">
                            <Checkbox 
                                id={`${role.name}-${section}-${perm}`} 
                                checked={value} 
                                disabled={!isEditing}
                                onCheckedChange={(checked) => onPermissionChange(section as keyof Permissions, perm, !!checked)}
                            />
                            <Label 
                                htmlFor={`${role.name}-${section}-${perm}`} 
                                className={`text-sm font-normal ${isEditing ? '' : 'text-muted-foreground'}`}
                            >
                                {formatPermissionName(perm)}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>
        ))}
      </CardContent>
    </Card>
  );
}
