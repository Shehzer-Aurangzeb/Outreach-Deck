import {
  BuildingIcon,
  CalendarIcon,
  UserIcon,
  UsersIcon,
} from "@/components/icons";

export const NAV_ITEMS = [
  { href: "/", label: "Today", icon: CalendarIcon },
  { href: "/pipeline", label: "Pipeline", icon: UsersIcon },
  { href: "/companies", label: "Companies", icon: BuildingIcon },
  { href: "/profile", label: "Profile", icon: UserIcon },
];
