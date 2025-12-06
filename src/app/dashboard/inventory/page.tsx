
"use client";

import { useMemo, useState } from "react";
import { File, PlusCircle, X } from "lucide-react";
import {
  collection,
  doc,
  serverTimestamp,
} from "firebase/firestore";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { DataTable } from "./data-table";
import { columns, type Product } from "./columns";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { AddProductForm } from "@/components/add-product-form";
import { AddCategoryForm } from "@/components/add-category-form";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { useSettings } from "@/contexts/settings-context";
import {
  addDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from "@/firebase/non-blocking-updates";

type Category = {
  id: string;
  name: string;
};

export default function InventoryPage() {
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  const { settings, loading: settingsLoading } = useSettings();

  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);

  const shopId = settings?.id;

  const productsCollectionRef = useMemoFirebase(() => {
    if (shopId) {
      return collection(
        firestore,
        "shops",
        shopId,
        "products"
      );
    }
    return null;
  }, [firestore, shopId]);

  const categoriesCollectionRef = useMemoFirebase(() => {
    if (shopId) {
      return collection(
        firestore,
        "shops",
        shopId,
        "categories"
      );
    }
    return null;
  }, [firestore, shopId]);

  const {
    data: products,
    isLoading: productsLoading,
    error: productsError,
  } = useCollection<Product>(productsCollectionRef);
  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useCollection<Category>(categoriesCollectionRef);

  const handleProductAdded = async (newProduct: any) => {
    if (!productsCollectionRef) return;
    // The 'image' property from the form is a File object, which cannot be stored in Firestore.
    // We will exclude it and use a placeholder URL for now.
    const { image, ...productData } = newProduct;

    const productToAdd = {
      ...productData,
      shopId,
      createdAt: serverTimestamp(),
      // In a real app you might want to use a real image upload service
      imageUrl: "https://picsum.photos/seed/newproduct/400/400",
      imageHint: newProduct.name.split(" ").slice(0, 2).join(" "),
    };
    addDocumentNonBlocking(productsCollectionRef, productToAdd);
    setProductDialogOpen(false);
  };

  const handleCategoryAdded = async (newCategory: { name: string }) => {
    if (!categoriesCollectionRef) return;
    const categoryToAdd = {
      ...newCategory,
      description: `Products in the ${newCategory.name} category.`,
      shopId,
      createdAt: serverTimestamp(),
    };
    addDocumentNonBlocking(categoriesCollectionRef, categoryToAdd);
    setCategoryDialogOpen(false);
  };

  const handleDeleteCategory = async (
    categoryId: string,
    categoryName: string
  ) => {
    if (!categoriesCollectionRef) return;
    const docRef = doc(categoriesCollectionRef, categoryId);
    deleteDocumentNonBlocking(docRef);
    toast({
      title: "Category Deleted",
      description: `Category "${categoryName}" has been successfully deleted.`,
    });
  };

  const productColumns = useMemo(() => columns(), []);
  const productData = products || [];
  const categoryData = categories || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
      <div className="md:col-span-2">
        <Tabs defaultValue="all">
          <div className="flex items-center">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="draft">Draft</TabsTrigger>
              <TabsTrigger value="archived" className="hidden sm:flex">
                Archived
              </TabsTrigger>
            </TabsList>
            <div className="ml-auto flex items-center gap-2">
              <Button size="sm" variant="outline" className="h-8 gap-1">
                <File className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Export
                </span>
              </Button>
              <Dialog
                open={productDialogOpen}
                onOpenChange={setProductDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button size="sm" className="h-8 gap-1">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      Add Product
                    </span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                    <DialogDescription>
                      Fill in the details below to add a new product to your
                      inventory.
                    </DialogDescription>
                  </DialogHeader>
                  <AddProductForm
                    onProductAdded={handleProductAdded}
                    categories={categoryData}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>Products</CardTitle>
                <CardDescription>
                  Manage your products and view their sales performance.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable columns={productColumns} data={productData} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
            <CardDescription>Manage your product categories.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {categoryData.map((category) => (
              <Badge
                key={category.id}
                variant="secondary"
                className="text-sm pl-2 pr-1 flex items-center gap-1"
              >
                {category.name}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="rounded-full hover:bg-muted-foreground/20 p-0.5 focus:outline-none focus:ring-1 focus:ring-ring">
                      <X className="h-3 w-3" />
                      <span className="sr-only">
                        Delete category {category.name}
                      </span>
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the
                        <span className="font-semibold"> {category.name} </span>
                        category. Products in this category will not be
                        deleted.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() =>
                          handleDeleteCategory(category.id, category.name)
                        }
                      >
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </Badge>
            ))}
          </CardContent>
          <CardHeader>
            <Dialog
              open={categoryDialogOpen}
              onOpenChange={setCategoryDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Category
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Category</DialogTitle>
                  <DialogDescription>
                    Enter the name for the new category.
                  </DialogDescription>
                </DialogHeader>
                <AddCategoryForm onCategoryAdded={handleCategoryAdded} />
              </DialogContent>
            </Dialog>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}

    