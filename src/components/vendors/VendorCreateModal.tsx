import { FormEvent, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { banquetQueryKeys } from "@/lib/banquetApi";
import { ApiError } from "@/lib/apiClient";
import {
  createVendorViaApi,
  fetchVendorCategoriesFromApi,
  type VendorCategoryOption,
} from "@/lib/vendorsApi";
import { useT } from "@/i18n";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const NONE_CATEGORY = "__none__";

export const VendorCreateModal = ({ open, onOpenChange }: Props) => {
  const { t } = useT();
  const queryClient = useQueryClient();
  const [vendorName, setVendorName] = useState("");
  const [categoryId, setCategoryId] = useState<string>(NONE_CATEGORY);
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [categories, setCategories] = useState<VendorCategoryOption[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setIsLoadingCategories(true);
    void fetchVendorCategoriesFromApi()
      .then((items) => {
        if (!cancelled) setCategories(items);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingCategories(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  const reset = () => {
    setVendorName("");
    setCategoryId(NONE_CATEGORY);
    setMobile("");
    setEmail("");
    setAddress("");
    setGstNumber("");
    setNotes("");
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmedName = vendorName.trim();

    if (!trimmedName) {
      toast.error(t("toast.fixErrors"));
      return;
    }

    setIsSubmitting(true);
    try {
      await createVendorViaApi({
        vendorName: trimmedName,
        categoryId: categoryId === NONE_CATEGORY ? null : categoryId,
        mobile: mobile.trim() || null,
        email: email.trim() || null,
        address: address.trim() || null,
        gstNumber: gstNumber.trim() || null,
        notes: notes.trim() || null,
      });
      await queryClient.invalidateQueries({ queryKey: banquetQueryKeys.vendors() });
      toast.success(t("vendors.created"));
      reset();
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : t("vendors.createError");
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("vendors.addVendor")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vendor-name">{t("vendors.form.name")}</Label>
            <Input
              id="vendor-name"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              placeholder={t("vendors.form.namePlaceholder")}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vendor-category">{t("vendors.form.category")}</Label>
            <Select
              value={categoryId}
              onValueChange={setCategoryId}
              disabled={isLoadingCategories}
            >
              <SelectTrigger id="vendor-category">
                <SelectValue placeholder={t("vendors.form.categoryPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_CATEGORY}>{t("vendors.form.noCategory")}</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.categoryName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="vendor-mobile">{t("vendors.form.mobile")}</Label>
            <Input
              id="vendor-mobile"
              inputMode="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="9876543210"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vendor-email">{t("vendors.form.email")}</Label>
            <Input
              id="vendor-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vendor-address">{t("vendors.form.address")}</Label>
            <Input
              id="vendor-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vendor-gst">{t("vendors.form.gst")}</Label>
            <Input
              id="vendor-gst"
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vendor-notes">{t("vendors.form.notes")}</Label>
            <Textarea
              id="vendor-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
