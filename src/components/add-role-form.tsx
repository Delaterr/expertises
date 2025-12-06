
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import type { Permissions } from "@/app/dashboard/settings/page";
import { ScrollArea } from "./ui/scroll-area";
import { DialogFooter } from "./ui/dialog";

const formatPermissionName = (name: string) => {
    return name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};

const createRoleSchema = (permissions: Permissions) => {
    const permissionsShape = Object.keys(permissions).reduce((acc, section) => {
        const sectionPermissions = permissions[section as keyof Permissions];
        const sectionShape = Object.keys(sectionPermissions).reduce((permAcc, perm) => {
            (permAcc as any)[perm] = z.boolean().default(false);
            return permAcc;
        }, {});
        (acc as any)[section] = z.object(sectionShape);
        return acc;
    }, {});

    return z.object({
        name: z.string().min(2, { message: "Role name must be at least 2 characters." }),
        description: z.string().optional(),
        permissions: z.object(permissionsShape),
    });
};

interface AddRoleFormProps {
  onAddRole: (values: z.infer<ReturnType<typeof createRoleSchema>>) => void;
  allPermissions: Permissions;
}

export function AddRoleForm({ onAddRole, allPermissions }: AddRoleFormProps) {
  const roleSchema = createRoleSchema(allPermissions);
  type RoleFormValues = z.infer<typeof roleSchema>;

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: "",
      description: "",
      permissions: allPermissions, // Start with all permissions for clarity, though they're checkboxes
    },
  });

  function onSubmit(data: RoleFormValues) {
    onAddRole(data);
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <ScrollArea className="max-h-[60vh] p-1 pr-4">
            <div className="space-y-4 p-1">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Role Name</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., Marketing Manager" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                            <Textarea placeholder="A brief description of this role's responsibilities." {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="permissions"
                    render={() => (
                        <FormItem>
                            <div className="mb-4">
                                <FormLabel className="text-base">Permissions</FormLabel>
                            </div>
                             <div className="space-y-4">
                                {Object.keys(allPermissions).map((section) => (
                                    <div key={section} className="space-y-2 rounded-md border p-4">
                                        <h4 className="font-medium capitalize">{section}</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            {Object.keys(allPermissions[section as keyof Permissions]).map((perm) => (
                                                <FormField
                                                    key={`${section}.${perm}`}
                                                    control={form.control}
                                                    name={`permissions.${section as keyof Permissions}.${perm as never}`}
                                                    render={({ field }) => (
                                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                        <FormControl>
                                                        <Checkbox
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">
                                                            {formatPermissionName(perm)}
                                                        </FormLabel>
                                                    </FormItem>
                                                    )}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </ScrollArea>
        <DialogFooter>
            <Button type="submit">Create Role</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
