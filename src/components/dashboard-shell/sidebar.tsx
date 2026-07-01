"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useWorkspace } from "@/contexts/workspace-context";
import { Avatar } from "@/components/ui/avatar";
import {
  DashboardIcon,
  ProjectsIcon,
  TeamIcon,
  ScheduleIcon,
  GearIcon,
} from "@/components/ui/icons";
import styles from "./sidebar.module.css";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: DashboardIcon },
  { href: "/dashboard/projects", label: "Projects", icon: ProjectsIcon },
  { href: "/dashboard/team", label: "Team", icon: TeamIcon },
  { href: "/dashboard/schedule", label: "Schedule", icon: ScheduleIcon },
];

export function Sidebar({
  companyName,
  initials,
}: {
  companyName: string;
  initials: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { projects } = useWorkspace();
  const [menuOpen, setMenuOpen] = useState(false);
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (footerRef.current && !footerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth");
    router.refresh();
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoRow}>
        <div className={styles.logoPlaceholder}>LOGO</div>
        <span className={styles.logoText}>Doppio</span>
        <span className={styles.betaBadge}>Beta</span>
      </div>

      <div className={styles.sectionLabel}>Workspace</div>
      <nav className={styles.nav}>
        {NAV_ITEMS.map(({ href, label, icon: ItemIcon }) => {
          const active =
            href === "/dashboard" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
            >
              <ItemIcon />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className={styles.sectionLabel}>Active Projects</div>
      <div className={styles.projectList}>
        {projects.length === 0 && (
          <span className={styles.emptyProjects}>No projects yet</span>
        )}
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/dashboard/projects?project=${project.id}`}
            className={styles.projectItem}
          >
            <span
              className={styles.projectDot}
              style={{ background: project.color }}
            />
            {project.name}
          </Link>
        ))}
      </div>

      <div className={styles.footer} ref={footerRef}>
        <Avatar initials={initials} />
        <span className={styles.footerName}>{companyName}</span>
        <button
          type="button"
          className={styles.gearButton}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Account settings"
        >
          <GearIcon />
        </button>

        {menuOpen && (
          <div className={styles.dropdown}>
            <Link
              href="/dashboard/settings"
              className={styles.dropdownItem}
              onClick={() => setMenuOpen(false)}
            >
              Settings
            </Link>
            <Link
              href="/dashboard/billing"
              className={styles.dropdownItem}
              onClick={() => setMenuOpen(false)}
            >
              Billing
            </Link>
            <button
              type="button"
              className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
