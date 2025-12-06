
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useUser, useFirestore, useAuth, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import {
  updateDocumentNonBlocking,
} from "@/firebase/non-blocking-updates";
import { updateProfile } from "firebase/auth";
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


export default function ProfilePage() {
  const { toast } = useToast();
  const { user: authUser, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();

  const [name, setName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [tempPhotoURL, setTempPhotoURL] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (authUser) {
      setName(authUser.displayName || "");
      setPhotoURL(authUser.photoURL || "");
      setTempPhotoURL(authUser.photoURL || "");
    }
  }, [authUser]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };


  const userDocRef = useMemoFirebase(
    () => (firestore && authUser ? doc(firestore, "users", authUser.uid) : null),
    [firestore, authUser]
  );

  const handleSaveChanges = async () => {
    if (!authUser || !userDocRef || !auth.currentUser) return;
    setIsSaving(true);
    
    try {
      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, {
        displayName: name,
        photoURL: photoURL,
      });

      // Update Firestore user document
      updateDocumentNonBlocking(userDocRef, {
        firstName: name.split(" ")[0] || "",
        lastName: name.split(" ").slice(1).join(" ") || "",
        photoURL: photoURL,
      });

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Could not update your profile.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleURLChange = () => {
    setPhotoURL(tempPhotoURL);
  };


  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
        <CardDescription>
          Manage your personal information and profile settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={photoURL || ""} alt={`@${name}`} />
            <AvatarFallback className="text-2xl">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
           <div className="grid gap-1.5">
            <Label htmlFor="picture">Profile Picture</Label>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">Change Picture</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Change Profile Picture</AlertDialogTitle>
                  <AlertDialogDescription>
                    Enter the URL of the image you want to use as your new profile picture.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-2">
                  <Label htmlFor="photo-url">Image URL</Label>
                  <Input 
                    id="photo-url" 
                    value={tempPhotoURL}
                    onChange={(e) => setTempPhotoURL(e.target.value)}
                    placeholder="https://example.com/image.png" 
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleURLChange}>Save</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" value={authUser.email || ""} disabled />
          <p className="text-sm text-muted-foreground">
            Your email address cannot be changed.
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSaveChanges} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
