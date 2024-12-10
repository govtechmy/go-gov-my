import { Dropdown, type Item as StatDropdownItem } from '@/components/Dropdown';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

type Props = {
  className?: string;
  dropdownItems: {
    daily: string;
    weekly: string;
    monthly: string;
    yearly: string;
  };
  selectedItem: string;
  onSelectionChange: (item: StatDropdownItem) => void;
};

export default function StatDropdown(props: Props) {
  const items: StatDropdownItem[] = [
    { id: 'daily', label: props.dropdownItems.daily },
    { id: 'weekly', label: props.dropdownItems.weekly },
    { id: 'monthly', label: props.dropdownItems.monthly },
    { id: 'yearly', label: props.dropdownItems.yearly },
  ];

  const [selectedItem, setSelectedItem] = useState(
    items.find((item) => item.id === props.selectedItem) || items[0]
  );

  useEffect(() => {
    const newSelectedItem = items.find((item) => item.id === props.selectedItem) || items[0];
    setSelectedItem(newSelectedItem);
  }, [props.selectedItem, props.dropdownItems]);

  const handleSelection = (item: StatDropdownItem) => {
    setSelectedItem(item);
    props.onSelectionChange(item);
  };

  return (
    <Dropdown className={cn(props.className)} items={items} onSelection={handleSelection}>
      {selectedItem.label}
    </Dropdown>
  );
}
