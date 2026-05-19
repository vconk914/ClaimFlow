import { createContext, useContext, useState, type ReactNode } from "react";
import { TEAM_MEMBERS, ROLE_CONFIGS, type TeamMember, type RoleId } from "@/data/teamRoles";

interface TeamContextValue {
  activeUser: TeamMember;
  setActiveUserId: (id: string) => void;
  roleId: RoleId;
  canView: (permission: keyof TeamMember["role"] extends string ? any : any) => boolean;
  widgetVisible: (widget: string) => boolean;
}

const TeamContext = createContext<TeamContextValue | null>(null);

export function TeamProvider({ children }: { children: ReactNode }) {
  const [activeUserId, setActiveUserId] = useState("sj");

  const activeUser = TEAM_MEMBERS.find(m => m.id === activeUserId) ?? TEAM_MEMBERS[0];
  const roleConfig = ROLE_CONFIGS[activeUser.role];

  function canView(permission: keyof typeof roleConfig.permissions): boolean {
    return roleConfig.permissions[permission] ?? false;
  }

  function widgetVisible(widget: string): boolean {
    return roleConfig.dashboardWidgets.includes(widget);
  }

  return (
    <TeamContext.Provider value={{ activeUser, setActiveUserId, roleId: activeUser.role, canView, widgetVisible }}>
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const ctx = useContext(TeamContext);
  if (!ctx) throw new Error("useTeam must be used within TeamProvider");
  return ctx;
}
