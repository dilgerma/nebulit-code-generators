import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Download, FileText, Loader2 } from "lucide-react";
import { Menu } from "@/types";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useMenus, useUploadMenu, useDeleteMenu } from "@/hooks/api";
import { Skeleton } from "@/components/ui/skeleton";

const documentTypes = [
  { value: "primary", label: "Primary" },
  { value: "secondary", label: "Secondary" },
  { value: "report", label: "Report" },
  { value: "template", label: "Template" },
  { value: "archive", label: "Archive" },
  { value: "other", label: "Other" },
];

export default function Menus() {
  const { data: menus = [], isLoading, error } = useMenus();
  const uploadMenuMutation = useUploadMenu();
  const deleteMenuMutation = useDeleteMenu();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    menuName: "",
    menuType: "",
    file: "",
  });

  const handleAddMenu = async () => {
    if (!formData.menuName || !formData.menuType) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await uploadMenuMutation.mutateAsync({
        menuName: formData.menuName,
        menuType: formData.menuType,
        file: formData.file,
        restaurantId: "", // Will be set from context headers
      });
      setFormData({ menuName: "", menuType: "", file: "" });
      setIsAddOpen(false);
      toast.success("Document uploaded successfully");
    } catch (err) {
      toast.error(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  const deleteMenu = async (menu: Menu) => {
    try {
      await deleteMenuMutation.mutateAsync(menu.menuId);
      toast.success(`"${menu.menuName}" deleted`);
    } catch (err) {
      toast.error(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      primary: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
      secondary: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
      report: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
      template: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      archive: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
      other: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    };
    return colors[type] || "bg-muted text-muted-foreground";
  };

  const getTypeLabel = (type: string) => {
    const docType = documentTypes.find((t) => t.value === type);
    return docType?.label || type;
  };

  if (error) {
    return (
      <DashboardLayout title="Documents" subtitle="Manage your documents">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-destructive">Error loading: {error.message}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Check the API settings (Settings icon in the header)
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Documents" subtitle="Manage your documents">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-muted-foreground">
          {isLoading ? "Loading..." : `${menus.length} document${menus.length !== 1 ? "s" : ""} uploaded`}
        </p>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Upload document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload new document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="menuName">Document name *</Label>
                <Input
                  id="menuName"
                  value={formData.menuName}
                  onChange={(e) => setFormData({ ...formData, menuName: e.target.value })}
                  placeholder="e.g. Q1 Report"
                />
              </div>
              <div>
                <Label htmlFor="menuType">Document type *</Label>
                <Select
                  value={formData.menuType}
                  onValueChange={(value) => setFormData({ ...formData, menuType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="file">File</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0]?.name || "" })}
                />
                <p className="mt-1 text-xs text-muted-foreground">PDF or Word documents are accepted</p>
              </div>
              <Button
                onClick={handleAddMenu}
                className="w-full"
                disabled={uploadMenuMutation.isPending}
              >
                {uploadMenuMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Upload document
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {menus.map((menu) => (
            <Card key={menu.menuId} className="group transition-shadow hover:shadow-md animate-fade-in">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{menu.menuName}</h3>
                      <p className="text-sm text-muted-foreground">{menu.file || "No file"}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <Badge className={getTypeColor(menu.menuType)}>
                    {getTypeLabel(menu.menuType)}
                  </Badge>
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => deleteMenu(menu)}
                      disabled={deleteMenuMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
