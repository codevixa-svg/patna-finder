import {
  Sparkles,
  Wifi,
  Droplets,
  Wrench,
  Truck,
  SprayCan,
  Bug,
  Zap,
  Scissors,
  Stethoscope,
  Pill,
  GraduationCap,
  BookOpen,
  IndianRupee,
  Landmark,
  Scale,
  Car,
  Bike,
  Bus,
  Plane,
  BedDouble,
  PartyPopper,
  Camera,
  Printer,
  Smartphone,
  Laptop,
  Globe,
  Palette,
  Armchair,
  Hammer,
  Paintbrush,
  HardHat,
  Building2,
  ShieldCheck,
  Sun,
  Gift,
  Flower2,
  PawPrint,
  Baby,
  ShoppingBasket,
  Gem,
  Shirt,
  Music,
  Clapperboard,
  Milk,
  Wheat,
  Factory,
  Utensils,
  Pizza,
  Cake,
  Coffee,
  Drumstick,
  Leaf,
  Dumbbell,
  Watch,
  Glasses,
  Microscope,
  AirVent,
  Refrigerator,
} from 'lucide-react';

type IconComponent = React.ComponentType<{
  className?: string;
  strokeWidth?: number | string;
}>;

/**
 * Keyword matchers (tested against the lowercased service name, first match
 * wins). Order matters: specific matchers must come before generic ones.
 */
const MATCHERS: Array<[RegExp, IconComponent]> = [
  [/deliver|shipping|courier|cargo|freight|packers|movers|shifting|relocation|transport|logistic/, Truck],
  [/wifi|internet|broadband|network/, Wifi],
  [/hotel|motel|rooms?\b|lodge|guest|hostel|resort|banquet|stay/, BedDouble],
  [/\bac\b|air.?condition|cooling|chiller/, AirVent],
  [/fridge|refrigerat|freezer/, Refrigerator],
  [/water|\bro\b|purif|plumb|mineral|drinking/, Droplets],
  [/clean|wash|laundry|housekeep|sanitiz|sanitis|dry.?clean/, SprayCan],
  [/pest|mosquito|cockroach|termite|rodent/, Bug],
  [/electric|wiring|inverter|battery|\bups\b|generator/, Zap],
  [/solar|panel|energy|power/, Sun],
  [/astrolog|pandit|puja|pooja|havan|kundli|horoscope|vastu|gemstone/, Sun],
  [/pet|\bdog\b|\bcat\b|veterinary|\bvet\b|animal|bird/, PawPrint],
  [/interior|furniture|furnish|sofa|wardrobe|modular.?kitchen|kitchen.?trolley|almirah/, Armchair],
  [/beauty|salon|\bspa\b|groom|makeup|facial|parlour|parlor|mehndi|bridal/, Sparkles],
  [/tailor|stitch|boutique|alteration/, Scissors],
  [/chicken|non.?veg|kebab|momo|\begg\b|meat/, Drumstick],
  [/catering|tiffin|thali|restaurant|biryani|meal|kitchen|food/, Utensils],
  [/pizza/, Pizza],
  [/cake|bakery|bake|pastry|dessert/, Cake],
  [/coffee|\btea\b|cafe|juice|beverage|shake|lassi/, Coffee],
  [/veg|vegetarian|salad|organic/, Leaf],
  [/gym|fitness|yoga|weight|slimming|zumba/, Dumbbell],
  [/doctor|clinic|medic|health|hospital|dentist|dental|surgeon|physio|therapy/, Stethoscope],
  [/pharmacy|chemist|drugstore/, Pill],
  [/lab|diagnostic|pathology|test\b|x.?ray|\bscan\b|\bmri\b|blood/, Microscope],
  [/optic|spectacle|eyewear|eye.?care|\beye\b/, Glasses],
  [/coach|tuition|tution|class|academy|training|institute|spoken|english/, GraduationCap],
  [/school|course|education|study|abacus/, BookOpen],
  [/loan|financ|insur|invest|\btax(?:es)?\b|\bgst\b|account|audit|\bemi\b/, IndianRupee],
  [/bank|\batm\b|nbfc|microfinance/, Landmark],
  [/legal|lawyer|advocate|court|notary|\blaw\b|registration|licen|affidavit|stamp/, Scale],
  [/\bcab\b|taxi|car.?rent|car.?hire|car.?deal|self.?drive|caravan/, Car],
  [/bike|two.?wheeler|scooter|enfield|bullet/, Bike],
  [/\bbus\b|tempo|minibus/, Bus],
  [/travel|tour|trip|holiday|vacation|flight|air.?ticket|visa|passport/, Plane],
  [/photograph|photoshoot|photo.?shoot|videograph|video.?shoot|drone|pre.?wedding/, Camera],
  [/event|wedding|marriage|party|birthday|decoration|decor|tent|stage/, PartyPopper],
  [/print|xerox|photocopy|lamination|\bflex\b|banner|offset|stationery/, Printer],
  [/mobile|smartphone|phone.?repair|iphone|android/, Smartphone],
  [/computer|laptop|desktop|\bpc\b|hardware/, Laptop],
  [/website|\bweb\b|\bseo\b|digital.?marketing|software|app.?develop|hosting|domain|ecommerce|e.?commerce/, Globe],
  [/design|graphic|logo|branding/, Palette],
  [/carpenter|carpentry|wood|plywood|\bply\b|fabricat|aluminium|grill|railing|welding/, Hammer],
  [/paint|distemper|putty|\bwall\b/, Paintbrush],
  [/construction|builder|contractor|cement|building.?material|renovation|civil/, HardHat],
  [/property|real.?estate|\brent\b|lease|\bflat\b|\bplot\b|\bland\b|broker|dealer|estate/, Building2],
  [/security|guard|cctv|surveillance|alarm/, ShieldCheck],
  [/gift|souvenir|\btrophy\b/, Gift],
  [/flower|bouquet|florist|rose/, Flower2],
  [/\bkid\b|baby|toy|child/, Baby],
  [/grocery|kirana|general.?store|staple|provision|supermarket|retail/, ShoppingBasket],
  [/jewel|gold|silver|ornament/, Gem],
  [/watch|clock|timepiece/, Watch],
  [/garment|dress|saree|cloth|wear|fashion|uniform/, Shirt],
  [/music|dance|orchestra|\bdj\b|sound|sangeet|\bband\b/, Music],
  [/film|video|advert|media|animation|documentary|\bad\b/, Clapperboard],
  [/milk|dairy|paneer|curd|cheese/, Milk],
  [/agri|agricultur|\bfarm\b|seed|fertilizer|tractor|crop|harvest/, Wheat],
  [/export|import|wholesale|manufactur|supplier|distributor|factory|\bpump\b|machinery/, Factory],
  [/\brepair\b|servic|mainten|\bfix\b|install|setup|\bamc\b|labor|labour|consult|agent|\bman\b|worker/, Wrench],
];

const FALLBACK_ICON = Sparkles;

interface ServiceIconProps {
  name?: string | null;
  className?: string;
}

/**
 * Renders a Lucide icon matched to the service's name (keyword-based) with a
 * professional `Sparkles` fallback. Keeps service cards visually consistent
 * without relying on emojis.
 */
export default function ServiceIcon({ name, className = 'w-5 h-5' }: ServiceIconProps) {
  const lower = (name || '').toLowerCase();
  const match = MATCHERS.find(([pattern]) => pattern.test(lower));
  const IconComponent = match ? match[1] : FALLBACK_ICON;

  return <IconComponent className={className} strokeWidth={1.8} aria-hidden="true" />;
}
