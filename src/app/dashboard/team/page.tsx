
"use client";

import { useMemo, useState } from "react";
import { MoreHorizontal, PlusCircle, Trash2 } from "lucide-react";
import Image from "next/image";
import { collection, doc } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  useAuth,
  useCollection,
  useFirestore,
  useMemoFirebase,
} from "@/firebase";
import { useSettings } from "@/contexts/settings-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { InviteMemberForm } from "@/components/invite-member-form";
import type { Role } from "../settings/roles/page";
import {
  addDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from "@/firebase/non-blocking-updates";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

// This will represent the combined data for display
type TeamMemberDisplay = {
  userShopRoleId: string;
  userId: string;
  name: string;
  email: string;
  roleName: string;
  roleId: string;
  avatar: string;
};

// Firestore document type for userShopRoles
type UserShopRole = {
  id: string;
  userId: string;
  shopId: string;
  roleId: string;
};

// This is a placeholder, in a real app you'd fetch user profiles
// This is a simplified version for display purposes
const placeholderUsers: Record<
  string,
  { name: string; email: string; avatar: string }
> = {
  "user_1": {
    name: "Admin User",
    email: "admin@shopflow.com",
    avatar: "https://picsum.photos/seed/300/100/100",
  },
};

export default function TeamPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { settings } = useSettings();
  const userId = auth.currentUser?.uid;
  const shopId = settings?.id;

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  // 1. Fetch userShopRoles
  const userShopRolesCollectionRef = useMemoFirebase(() => {
    if (shopId) {
      return collection(
        firestore,
        "shops",
        shopId,
        "userShopRoles"
      );
    }
    return null;
  }, [firestore, shopId]);

  const { data: userShopRoles, isLoading: rolesMappingLoading } =
    useCollection<UserShopRole>(userShopRolesCollectionRef);

  // 2. Fetch all available roles for the dropdown
  const rolesCollectionRef = useMemoFirebase(() => {
    if (shopId) {
      return collection(
        firestore,
        "shops",
        shopId,
        "role-definitions"
      );
    }
    return null;
  }, [firestore, shopId]);

  const { data: availableRoles, isLoading: rolesLoading } =
    useCollection<Role>(rolesCollectionRef);

  const teamMembers: TeamMemberDisplay[] = useMemo(() => {
    if (!userShopRoles || !availableRoles) return [];

    return userShopRoles.map((userRole) => {
      const role = availableRoles.find((r) => r.id === userRole.roleId);
      // In a real app, you would fetch user profiles based on userRole.userId
      // For now, we use a placeholder or the current user's info
      const userInfo =
        placeholderUsers[userRole.userId] ||
        (userRole.userId === userId && auth.currentUser
          ? {
              name: auth.currentUser.displayName || "Invited User",
              email: auth.currentUser.email || "",
              avatar:
                auth.currentUser.photoURL ||
                `https://picsum.photos/seed/${userRole.userId}/100/100`,
            }
          : {
              name: "Invited User",
              email: "unknown@example.com",
              avatar: `https://picsum.photos/seed/${userRole.userId}/100/100`,
            });

      return {
        userShopRoleId: userRole.id,
        userId: userRole.userId,
        name: userInfo.name,
        email: userInfo.email,
        roleName: role?.name || "Unknown Role",
        roleId: userRole.roleId,
        avatar: userInfo.avatar,
      };
    });
  }, [userShopRoles, availableRoles, userId, auth.currentUser]);

  const handleInviteMember = (values: { email: string; roleId: string }) => {
    // This is a simplified "invite". In a real app, you'd trigger a cloud function
    // to look up the user by email, get their UID, and then create the role mapping.
    // For now, we'll simulate adding a user by creating a role for the current user.
    if (!userShopRolesCollectionRef || !shopId) return;

    const newMemberRole = {
      // In a real app, this would be the invited user's ID.
      // We are re-adding the current user for demo purposes.
      userId: userId!,
      shopId: shopId,
      roleId: values.roleId,
    };

    addDocumentNonBlocking(userShopRolesCollectionRef, newMemberRole);

    toast({
      title: "Member Added",
      description: `A user has been assigned the new role in the shop.`,
    });

    setInviteDialogOpen(false);
  };

  const handleRemoveMember = (member: TeamMemberDisplay) => {
    if (!userShopRolesCollectionRef) return;
    if (member.userId === userId) {
        toast({ variant: 'destructive', title: "Action not allowed", description: "You cannot remove yourself from the shop." });
        return;
    }
    const docRef = doc(userShopRolesCollectionRef, member.userShopRoleId);
    deleteDocumentNonBlocking(docRef);
    toast({
      title: "Member Removed",
      description: `${member.name} has been removed from the shop.`,
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Team Management</CardTitle>
          <CardDescription>
            Invite and manage your team members and their roles.
          </CardDescription>
        </div>
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Invite Member
              </span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite New Member</DialogTitle>
              <DialogDescription>
                Enter the email and assign a role for the new team member.
              </DialogDescription>
            </DialogHeader>
            <InviteMemberForm
              roles={availableRoles || []}
              onInvite={handleInviteMember}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          {(teamMembers || []).map((member) => (
            <div
              key={member.userShopRoleId}
              className="flex items-center justify-between space-x-4"
            >
              <div className="flex items-center space-x-4">
                <Image
                  alt={`${member.name}'s avatar`}
                  src={member.avatar}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div>
                  <p className="text-sm font-medium leading-none">
                    {member.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {member.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge
                  variant={member.roleName === "Owner" ? "default" : "secondary"}
                >
                  {member.roleName}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem disabled>Change Role</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                          className="text-destructive"
                          onSelect={(e) => e.preventDefault()}
                           disabled={member.userId === userId}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently remove{" "}
                            <strong>{member.name}</strong> from your shop. They
                            will lose all access.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRemoveMember(member)}
                          >
                            Confirm
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

    