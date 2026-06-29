import { format, parseISO } from "date-fns";
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  Pencil,
  Star,
  User,
  Users,
} from "lucide-react";
import { BookingMenuSelection } from "@/components/bookings/BookingMenuSelection";
import { BookingSummaryPdfButton } from "@/components/bookings/BookingSummaryPdfButton";
import { useQueryClient } from "@tanstack/react-query";
import {
  formatEnquiryBudget,
  formatPaymentAmount,
  getBookingDisplayStatus,
  getBookingRequirementsProgress,
  getPaymentsForBooking,
  type BookingRecord,
} from "@/data/banquetData";
import { toggleBookingRequirement } from "@/data/banquetStore";
import { banquetQueryKeys } from "@/lib/banquetApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n";

const displayStatusClass: Record<ReturnType<typeof getBookingDisplayStatus>, string> = {
  completed: "border-border bg-muted text-muted-foreground",
  confirmed: "border-primary/25 bg-primary/10 text-primary",
  tentative: "border-amber-500/25 bg-amber-500/10 text-amber-800",
  cancelled: "border-border bg-muted text-muted-foreground line-through",
};

type Props = {
  booking: BookingRecord;
  expanded: boolean;
  onExpandedChange: (open: boolean) => void;
  onEdit?: (booking: BookingRecord) => void;
};

const formatVendorRate = (rate: number) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(rate);

export const BookingCard = ({ booking, expanded, onExpandedChange, onEdit }: Props) => {
  const { t } = useT();
  const queryClient = useQueryClient();
  const eventDate = parseISO(booking.date);
  const displayStatus = getBookingDisplayStatus(booking);
  const requirements = booking.requirements ?? [];
  const progress = getBookingRequirementsProgress(requirements);
  const vendors = booking.vendors ?? [];
  const payments = getPaymentsForBooking(booking.id);

  const handleRequirementToggle = (requirementId: string) => {
    toggleBookingRequirement(booking.id, requirementId);
    void queryClient.invalidateQueries({ queryKey: banquetQueryKeys.bookings() });
  };

  return (
    <Collapsible open={expanded} onOpenChange={onExpandedChange}>
      <div className="rounded-xl border border-border/70 bg-card shadow-soft">
        <div className="flex flex-wrap items-start gap-4 p-5 sm:flex-nowrap">
          <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg border border-border/60 bg-muted/30">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {format(eventDate, "MMM")}
            </span>
            <span className="font-display text-xl font-bold leading-none text-foreground">
              {format(eventDate, "d")}
            </span>
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-base font-semibold text-foreground sm:text-lg">{booking.title}</h3>
              <Badge variant="outline" className={cn("font-semibold capitalize", displayStatusClass[displayStatus])}>
                {t(`bookings.displayStatus.${displayStatus}`)}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {booking.venue}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 shrink-0" />
                {booking.guests}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 shrink-0" />
                {booking.clientName}
              </span>
            </div>
          </div>

          <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:flex-col sm:items-end">
            <div className="text-left sm:text-right">
              <p className="font-display text-lg font-bold text-foreground">
                {booking.revenue ? formatEnquiryBudget(booking.revenue) : "—"}
              </p>
              {progress.total > 0 && (
                <p className="text-xs text-muted-foreground">
                  {t("bookings.requirementsProgress")
                    .replace("{done}", String(progress.done))
                    .replace("{total}", String(progress.total))}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1">
              <BookingSummaryPdfButton booking={booking} size="icon" showLabel={false} />
              {onEdit && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  aria-label={t("bookings.view")}
                  onClick={() => onEdit(booking)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  aria-label={expanded ? t("bookings.collapse") : t("bookings.expand")}
                >
                  {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
        </div>

        <CollapsibleContent>
          <div className="space-y-5 border-t border-border/60 px-5 py-5">
            {requirements.length > 0 && (
              <section>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("bookings.requirements")}
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {requirements.map((requirement) => (
                    <label
                      key={requirement.id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5"
                    >
                      <Checkbox
                        checked={requirement.done}
                        onCheckedChange={() => handleRequirementToggle(requirement.id)}
                      />
                      <span
                        className={cn(
                          "text-sm",
                          requirement.done ? "text-muted-foreground line-through" : "text-foreground",
                        )}
                      >
                        {requirement.label}
                      </span>
                    </label>
                  ))}
                </div>
              </section>
            )}

            <Tabs defaultValue="vendors" className="w-full">
              <TabsList className="h-auto flex-wrap justify-start gap-1 bg-muted/50 p-1">
                <TabsTrigger value="vendors">{t("bookings.tab.vendors")}</TabsTrigger>
                <TabsTrigger value="decor">{t("bookings.tab.decor")}</TabsTrigger>
                <TabsTrigger value="menu">{t("bookings.tab.menu")}</TabsTrigger>
                <TabsTrigger value="inventory">{t("bookings.tab.inventory")}</TabsTrigger>
                <TabsTrigger value="discussion">{t("bookings.tab.discussion")}</TabsTrigger>
                <TabsTrigger value="payment">{t("bookings.tab.payment")}</TabsTrigger>
              </TabsList>

              <TabsContent value="vendors" className="mt-4">
                {vendors.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t("bookings.tabEmpty")}</p>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-border/60 scrollbar-subtle">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border/60 bg-muted/30 hover:bg-muted/30">
                          <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                            {t("bookings.vendor.col.name")}
                          </TableHead>
                          <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                            {t("bookings.vendor.col.category")}
                          </TableHead>
                          <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                            {t("bookings.vendor.col.contact")}
                          </TableHead>
                          <TableHead className="text-right text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                            {t("bookings.vendor.col.ratingRate")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {vendors.map((vendor) => (
                          <TableRow key={vendor.id} className="border-border/50">
                            <TableCell className="font-medium">{vendor.name}</TableCell>
                            <TableCell className="text-muted-foreground">{vendor.category}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{vendor.contact}</TableCell>
                            <TableCell className="text-right text-sm">
                              <span className="inline-flex items-center justify-end gap-1">
                                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                {vendor.rating.toFixed(1)} · {formatVendorRate(vendor.rate)}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="decor" className="mt-4">
                {(booking.decorations?.length ?? 0) === 0 ? (
                  <p className="text-sm text-muted-foreground">{t("bookings.tabEmpty")}</p>
                ) : (
                  <ul className="space-y-2">
                    {booking.decorations!.map((item) => (
                      <li
                        key={item}
                        className="rounded-lg border border-border/60 bg-muted/20 px-4 py-2.5 text-sm text-foreground"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </TabsContent>

              <TabsContent value="menu" className="mt-4 space-y-4">
                <div className="flex justify-end">
                  <BookingSummaryPdfButton booking={booking} />
                </div>
                <BookingMenuSelection booking={booking} />
              </TabsContent>

              <TabsContent value="inventory" className="mt-4">
                <p className="text-sm text-muted-foreground">{t("bookings.tabComingSoon")}</p>
              </TabsContent>

              <TabsContent value="discussion" className="mt-4">
                <p className="text-sm text-muted-foreground">{t("bookings.tabComingSoon")}</p>
              </TabsContent>

              <TabsContent value="payment" className="mt-4">
                {payments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t("bookings.noPayments")}</p>
                ) : (
                  <div className="space-y-2">
                    {payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/20 px-4 py-2.5"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {format(parseISO(payment.date), "MMM d, yyyy")} · {t(`payments.method.${payment.method}`)}
                          </p>
                          {payment.note && <p className="text-xs text-muted-foreground">{payment.note}</p>}
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatPaymentAmount(payment.amount)}</p>
                          <p className="text-xs capitalize text-muted-foreground">{t(`payments.status.${payment.status}`)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
