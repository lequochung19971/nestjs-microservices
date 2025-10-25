import { useState } from "react";
import { CategoriesTable } from "@/modules/categories/components/categories-table";
import { CreateCategoryDialog } from "@/modules/categories/components/create-category-dialog";
import { EditCategoryDialog } from "@/modules/categories/components/edit-category-dialog";
import type { ApiSchema } from "@/http-clients";

type CategoryDto = ApiSchema["CategoryDto"];

export function CategoriesPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<CategoryDto | null>(
    null,
  );

  const handleCreateCategory = () => {
    setCreateDialogOpen(true);
  };

  const handleEditCategory = (category: CategoryDto) => {
    setCategoryToEdit(category);
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setCategoryToEdit(null);
  };

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Categories</h2>
          <p className="text-muted-foreground">
            Organize your products with categories
          </p>
        </div>
      </div>

      <CategoriesTable
        onCreateCategory={handleCreateCategory}
        onEditCategory={handleEditCategory}
      />

      <CreateCategoryDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      <EditCategoryDialog
        category={categoryToEdit}
        open={editDialogOpen}
        onOpenChange={handleEditDialogClose}
      />
    </div>
  );
}
