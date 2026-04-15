import { cn } from "@/utils/classnames";
import { AppIconSource } from "../../base/app-icon";
import { Input } from "@/app/ui/input";
import Button from "../../base/button";
import { useTranslation } from "react-i18next";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { Tabs } from "../../base/tabs";
import { allIconPickerIcons } from "./constants";
import Icon from "../../base/icon";
import { getThemeHoverClass, ThemeType } from "@/types/theme";
import { useCustomTheme } from "../../provider/customThemeProvider";
import { defaultIconSet, IconName } from "../../base/app-icon/icons";
import { isEmojiSupported } from "is-emoji-supported";
import { Dice6 } from "lucide-react";


interface AppIconPickerProps {
  onSelect?: (payload: AppIconSource) => void;
  onClose?: () => void;
  className?: string;
  value?: AppIconSource;
  containerRef?: React.RefObject<HTMLDivElement | null>;  // 自定义 ref prop
}

// Emoji 范围
const emojiRanges = [
  [0x1f600, 0x1f64f], // Emoticons
  [0x1f300, 0x1f5ff], // Symbols & Pictographs
  [0x1f680, 0x1f6ff], // Transport & Map Symbols
  [0x2600, 0x26ff], // Miscellaneous Symbols
  [0x2700, 0x27bf], // Dingbats
  [0x1f900, 0x1f9ff], // Supplemental Symbols
  [0x1f1e6, 0x1f1ff], // Regional Indicator Symbols
  [0x1f400, 0x1f4ff], // Additional pictographs
];

export default function AppIconPicker({ onSelect, onClose, className, value, containerRef }: AppIconPickerProps) {
  const { t } = useTranslation();
  const { activeColorTheme } = useCustomTheme();
  const [internalValue, setInternalValue] = useState<AppIconSource>(value || { type: 'icon', icon: defaultIconSet });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState<string>('icon');
  const [emojiMetadataMap, setEmojiMetadataMap] = useState<Map<string, { label: string; tags: string[]; hexcode: string }> | 'loading' | null>(null);
  const tabs = [
    { value: 'icon', label: t('app.newApp.icon') },
    { value: 'emoji', label: t('app.newApp.emoji') },
  ];
  const defaultRef = useRef<HTMLDivElement>(null);
  const usedRef = containerRef || defaultRef;
  const searchInputRef = useRef<HTMLInputElement>(null);
  const currentValue = value !== undefined ? value : internalValue;

  const emojis = useMemo(() => {
    const emojiList: string[] = [];
    emojiRanges.forEach(([start, end]) => {
      for (let codePoint = start; codePoint <= end; codePoint++) {
        const emoji = String.fromCodePoint(codePoint);
        if (isEmojiSupported(emoji) && !emojiList.includes(emoji)) {
          emojiList.push(emoji);
        }
      }
    });
    return emojiList;
  }, []);

  const filteredIcons = useMemo(() => {
    if (!searchTerm) return allIconPickerIcons;
    return allIconPickerIcons.filter(icon => icon.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm]);

  // 加载 emoji 元数据
  const loadEmojiMetadata = async () => {
    if (emojiMetadataMap) return;

    setEmojiMetadataMap('loading');
    const emojibaseData = await import('emojibase-data/en/compact.json');
    const metadataMap = new Map<string, { label: string; tags: string[]; hexcode: string }>();
    (emojibaseData.default as any[]).forEach((emoji: any) => {
      metadataMap.set(emoji.unicode, {
        label: emoji.label,
        tags: emoji.tags || [],
        hexcode: emoji.hexcode,
      });
    });
    setEmojiMetadataMap(metadataMap);
  }

  const filteredEmojis = useMemo(() => {
    if (!searchTerm) return emojis;
    return emojis.filter((emoji) => {
      const metadata = emojiMetadataMap instanceof Map ? emojiMetadataMap.get(emoji) : null;
      const searchLower = searchTerm.toLowerCase();
      return (
        metadata?.label.toLowerCase().includes(searchLower) ||
        metadata?.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    });
  }, [searchTerm, emojis, emojiMetadataMap]);

  // 搜索结果
  const searchResults = useMemo(() => {
    if (!searchTerm) return [];
    const iconResults = filteredIcons.map<AppIconSource>(icon => ({ type: 'icon' as const, icon }));
    const emojiResults = filteredEmojis.map<AppIconSource>(emoji => ({ type: 'emoji' as const, icon: emoji }));
    return [...iconResults, ...emojiResults];
  }, [searchTerm, filteredIcons, filteredEmojis]);

  const setValue = (newValue: AppIconSource) => {
    if (onSelect) {
      onSelect(newValue);
    } else {
      setInternalValue(newValue);
    }
  };

  const handleChangeSelectedTab = (tab: string) => {
    setSelectedTab(tab);
    if (tab === 'emoji') {
      loadEmojiMetadata();
    }
  }

  const allIconsList = useMemo(() => {
    const icons = allIconPickerIcons.map<AppIconSource>(icon => ({ type: 'icon', icon }));
    const emojiList = emojis.map<AppIconSource>(emoji => ({ type: 'emoji', icon: emoji }));
    return [...icons, ...emojiList];
  }, [emojis]);

  const selectRandom = useCallback(() => {
    if (allIconsList.length === 0) return;
    const randomIndex = Math.floor(Math.random() * allIconsList.length);
    setValue(allIconsList[randomIndex]);
  }, [allIconsList, setValue]);

  const EmojiElement = ({ emoji, className, onClick }: { emoji: string; className?: string; onClick?: () => void }) => {
    return (
      <span
        className={cn(
          `cursor-pointer p-1 rounded ${getThemeHoverClass(activeColorTheme as ThemeType)} text-gray-500 hover:text-gray-600 hover:text-300 dark:hover:text-gray-200`,
          'font-emoji',
          className
        )}
        onClick={onClick}
      >
        {emoji}
      </span>
    );
  };

  const IconElement = ({ icon, className, onClick }: { icon: IconName; className?: string; onClick?: () => void }) => {
    return (
      <Icon
        icon={icon}
        className={cn(
          `cursor-pointer p-1 rounded ${getThemeHoverClass(activeColorTheme as ThemeType)} text-gray-500 hover:text-gray-600 hover:text-300 dark:hover:text-gray-200`,
          className
        )}
        onClick={onClick}
      />
    );
  }

  return (
    <div
      ref={usedRef}
      className={cn(
        "absolute top-full left-0 mt-2 w-80 bg-background min-h-[300px] dark:bg-neutral-800 border border-[var(--border)] rounded-md shadow-lg z-70 p-2",
        className
      )}>
      <div className="flex gap-1 p-2 pb-2">
        <Input
          ref={searchInputRef}
          className="flex-1"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button
          className="shrink-0"
          variant={'secondary'}
          size={'large'}
          onClick={selectRandom}
        >
          <Dice6 className="mr-1" size={16} />
          {t('app.newApp.random')}
        </Button>
      </div>
      {!searchTerm && (
        <div className="px-2 pb-1">
          <Tabs
            value={selectedTab}
            options={tabs}
            onChange={(value) => handleChangeSelectedTab(value)}
          />
        </div>
      )}
      <div className="flex flex-wrap p-2 overflow-y-auto max-h-[200px]">
        {searchTerm ? (
          searchResults.map((result, index) => (
            <React.Fragment key={`${result.type}-${result.icon}-${index}`}>
              {result.type === 'icon' ? (
                <IconElement
                  key={result.icon}
                  icon={result.icon as IconName}
                  onClick={() => setValue({ type: 'icon', icon: result.icon })}
                />
              ) : (
                <EmojiElement
                  emoji={result.icon}
                  onClick={() => setValue({ type: 'emoji', icon: result.icon })}
                />
              )}
            </React.Fragment>
          ))
        ) : (
          <>
            {selectedTab === 'icon' ? (
              allIconPickerIcons.map((icon) => (
                <IconElement
                  key={icon}
                  icon={icon}
                  onClick={() => setValue({ type: 'icon', icon })}
                />
              ))
            ) : (
              emojis.map((emoji) => (
                <EmojiElement
                  key={emoji}
                  emoji={emoji}
                  onClick={() => setValue({ type: 'emoji', icon: emoji })}
                />
              ))
            )}
          </>
        )}
      </div>
    </div >
  );
}