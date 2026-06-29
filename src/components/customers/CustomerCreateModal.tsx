import { FormEvent, useState } from "react";
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
import { banquetQueryKeys } from "@/lib/banquetApi";
import { createCustomerViaApi } from "@/lib/customersApi";
import { ApiError } from "@/lib/apiClient";
import { normalizeMobileNo, splitCustomerName } from "@/lib/mappers/enquiryMapper";
import { useT } from "@/i18n";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const CustomerCreateModal = ({ open, onOpenChange }: Props) => {
  const { t } = useT();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setName("");
    setMobileNo("");
    setEmail("");
    setCity("");
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedMobile = normalizeMobileNo(mobileNo);

    if (!trimmedName || trimmedMobile.length !== 10) {
      toast.error(t("toast.fixErrors"));
      return;
    }

    const { firstName, lastName } = splitCustomerName(trimmedName);

    setIsSubmitting(true);
    try {
      await createCustomerViaApi({
        firstName,
        lastName,
        mobileNo: trimmedMobile,
        emailId: email.trim() || null,
        city: city.trim() || null,
      });
      await queryClient.invalidateQueries({ queryKey: banquetQueryKeys.customers() });
      toast.success("Customer created");
      reset();
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Failed to create customer";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("customers.addCustomer")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer-name">Name</Label>
            <Input
              id="customer-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Rahul Sharma"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer-mobile">Mobile</Label>
            <Input
              id="customer-mobile"
              inputMode="numeric"
              value={mobileNo}
              onChange={(e) => setMobileNo(e.target.value)}
              placeholder="9876543210"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer-email">Email</Label>
            <Input
              id="customer-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer-city">City</Label>
            <Input id="customer-city" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
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
