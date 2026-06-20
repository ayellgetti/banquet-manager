import { AppShell } from "@/components/layout/AppShell";
import { EnquiryFormV2 } from "@/components/enquiry/EnquiryFormV2";
import { useT } from "@/i18n";

const EnquiryPageV2 = () => {
  const { t } = useT();
  return (
    <AppShell title={t("module.enquiryV2.title")} subtitle={t("module.enquiryV2.subtitle")}>
      <EnquiryFormV2 />
    </AppShell>
  );
};

export default EnquiryPageV2;
