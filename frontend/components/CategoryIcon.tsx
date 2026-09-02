import {
  Store,
  Palette,
  Stethoscope,
  Church,
  Utensils,
  Landmark,
  Plane,
  GraduationCap,
  Scale,
  Car,
  Megaphone,
  Trophy,
  Dumbbell,
  Scissors,
  Wheat,
  HardHat,
  SprayCan,
  Beer,
  Fuel,
  Factory,
  Clapperboard,
  ShoppingBasket,
  Hammer,
  Baby,
  PawPrint,
  Building2,
  Ship,
  Fish,
  Music,
  Pill,
  Shirt,
  Cake,
  Zap,
  Truck,
  Bike,
  Laptop,
  Printer,
  Flower2,
  BookOpen,
  ShieldCheck,
  Bus,
  Ticket,
  IceCreamBowl,
  BedDouble,
  HandHeart,
  Coffee,
  Watch,
  Lock,
  Tv,
  Smile,
  Gem,
  Milk,
  Wrench,
  PartyPopper,
  Flame,
  Drumstick,
  Mountain,
  Smartphone,
  Paintbrush,
  Pizza,
  Mail,
  Footprints,
  Sun,
  Camera,
} from 'lucide-react';

type IconComponent = React.ComponentType<{
  className?: string;
  strokeWidth?: number | string;
}>;

/**
 * Map of DB icon keys (kebab-case Lucide names, seeded by GmbCategorySeeder)
 * to Lucide icon components.
 */
const ICON_MAP: Record<string, IconComponent> = {
  store: Store,
  palette: Palette,
  stethoscope: Stethoscope,
  church: Church,
  utensils: Utensils,
  landmark: Landmark,
  plane: Plane,
  'graduation-cap': GraduationCap,
  scale: Scale,
  car: Car,
  megaphone: Megaphone,
  trophy: Trophy,
  dumbbell: Dumbbell,
  scissors: Scissors,
  wheat: Wheat,
  'hard-hat': HardHat,
  'spray-can': SprayCan,
  beer: Beer,
  fuel: Fuel,
  factory: Factory,
  clapperboard: Clapperboard,
  'shopping-basket': ShoppingBasket,
  hammer: Hammer,
  baby: Baby,
  'paw-print': PawPrint,
  'building-2': Building2,
  ship: Ship,
  fish: Fish,
  music: Music,
  pill: Pill,
  shirt: Shirt,
  cake: Cake,
  zap: Zap,
  truck: Truck,
  bike: Bike,
  laptop: Laptop,
  printer: Printer,
  'flower-2': Flower2,
  'book-open': BookOpen,
  'shield-check': ShieldCheck,
  bus: Bus,
  ticket: Ticket,
  'ice-cream-bowl': IceCreamBowl,
  'bed-double': BedDouble,
  'hand-heart': HandHeart,
  coffee: Coffee,
  watch: Watch,
  lock: Lock,
  tv: Tv,
  smile: Smile,
  gem: Gem,
  milk: Milk,
  wrench: Wrench,
  'party-popper': PartyPopper,
  flame: Flame,
  drumstick: Drumstick,
  mountain: Mountain,
  smartphone: Smartphone,
  paintbrush: Paintbrush,
  pizza: Pizza,
  mail: Mail,
  footprints: Footprints,
  sun: Sun,
  camera: Camera,
};

interface CategoryIconProps {
  icon?: string | null;
  className?: string;
}

/**
 * Renders a category's Lucide icon by its DB key with a professional
 * `Store` fallback. Use instead of raw emoji `category.icon` values.
 */
export default function CategoryIcon({
  icon,
  className = 'w-6 h-6',
}: CategoryIconProps) {
  const IconComponent = (icon && ICON_MAP[icon]) || Store;

  return (
    <IconComponent
      className={className}
      strokeWidth={1.8}
      aria-hidden="true"
    />
  );
}
