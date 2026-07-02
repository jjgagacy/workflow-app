import { useTranslation } from "react-i18next";

interface ListOperatorHeaderProps {
  label?: string;
}

export const ListOperatorHeader = ({ label }: ListOperatorHeaderProps) => {
  const { t } = useTranslation();

  return (
    <div className="rounded-lg bg-muted/20 px-4 py-3">
      <div className="text-sm font-semibold text-foreground">
        {label?.trim() || t('workflow.nodes.list-operator.name')}
      </div>
      <div className="mt-1 text-xs leading-5 text-muted-foreground">
        {t('workflow.nodes.list-operator.description2')}
      </div>
    </div>
  );
};

export default ListOperatorHeader;