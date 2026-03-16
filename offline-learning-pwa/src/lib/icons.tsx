import {
  BookOpenText,
  Bookmark,
  Bot,
  BrainCircuit,
  Calculator,
  ChartNoAxesCombined,
  FlaskConical,
  Globe2,
  Landmark,
  Languages,
  Laptop2,
  LayoutDashboard,
  LucideIcon,
  NotebookPen,
  Settings,
  Sparkles,
  UserCircle2,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  ChartNoAxesCombined,
  Bot,
  Sparkles,
  NotebookPen,
  Bookmark,
  UserCircle2,
  BookOpenText,
  BrainCircuit,
  Settings,
  Calculator,
  FlaskConical,
  Landmark,
  Languages,
  Laptop2,
  Globe2,
};

export function getIcon(iconName: string): LucideIcon {
  return iconMap[iconName] ?? LayoutDashboard;
}