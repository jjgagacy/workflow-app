import { AppTypeItem } from "../constants/appTypes"

interface AppTypeInfoProps {
  typeItem: AppTypeItem;
}

export const AppTypeInfo = ({ typeItem }: AppTypeInfoProps) => {
  const Icon = typeItem.icon;
  return (
    <div className="flex items-center gap-2 px-4">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center">
          <Icon className="w-6 h-6 text-text-primary" />
        </div>
        <span className="font-semibold text-text-primary text-md">{typeItem.name}</span>
      </div>
    </div>
  );
}
