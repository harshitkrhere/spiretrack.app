import React from 'react';
import { 
  ShieldCheckIcon, 
  UserGroupIcon, 
  DocumentTextIcon, 
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

/**
 * RolesPermissionsMatrix - Read-only permission visibility for admins
 * Shows what each role can do across different modules
 */

interface Permission {
  module: string;
  icon: React.ComponentType<{ className?: string }>;
  owner: { read: boolean; write: boolean; manage: boolean };
  admin: { read: boolean; write: boolean; manage: boolean };
  member: { read: boolean; write: boolean; manage: boolean };
}

const permissions: Permission[] = [
  {
    module: 'Team Settings',
    icon: Cog6ToothIcon,
    owner: { read: true, write: true, manage: true },
    admin: { read: true, write: true, manage: false },
    member: { read: false, write: false, manage: false },
  },
  {
    module: 'Members',
    icon: UserGroupIcon,
    owner: { read: true, write: true, manage: true },
    admin: { read: true, write: true, manage: true },
    member: { read: true, write: false, manage: false },
  },
  {
    module: 'Weekly Reports',
    icon: DocumentTextIcon,
    owner: { read: true, write: true, manage: true },
    admin: { read: true, write: true, manage: true },
    member: { read: true, write: true, manage: false },
  },
  {
    module: 'Chat Channels',
    icon: ChatBubbleLeftRightIcon,
    owner: { read: true, write: true, manage: true },
    admin: { read: true, write: true, manage: true },
    member: { read: true, write: true, manage: false },
  },
  {
    module: 'Forms',
    icon: DocumentTextIcon,
    owner: { read: true, write: true, manage: true },
    admin: { read: true, write: true, manage: true },
    member: { read: true, write: false, manage: false },
  },
  {
    module: 'Analytics',
    icon: ChartBarIcon,
    owner: { read: true, write: false, manage: false },
    admin: { read: true, write: false, manage: false },
    member: { read: false, write: false, manage: false },
  },
  {
    module: 'Activity Logs',
    icon: ShieldCheckIcon,
    owner: { read: true, write: false, manage: false },
    admin: { read: true, write: false, manage: false },
    member: { read: false, write: false, manage: false },
  },
];

const PermissionCell: React.FC<{ allowed: boolean }> = ({ allowed }) => (
  <div className="flex justify-center">
    {allowed ? (
      <CheckIcon className="w-5 h-5 text-emerald-600" />
    ) : (
      <XMarkIcon className="w-5 h-5 text-slate-300" />
    )}
  </div>
);

export const RolesPermissionsMatrix: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <ShieldCheckIcon className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Roles & Permissions</h3>
            <p className="text-sm text-slate-500">Overview of what each role can do</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-6 py-3 font-semibold text-slate-700">Module</th>
              <th className="text-center px-4 py-3 font-semibold text-slate-700" colSpan={3}>
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-purple-100 text-purple-700 text-xs">
                  Owner
                </span>
              </th>
              <th className="text-center px-4 py-3 font-semibold text-slate-700" colSpan={3}>
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-xs">
                  Admin
                </span>
              </th>
              <th className="text-center px-4 py-3 font-semibold text-slate-700" colSpan={3}>
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-xs">
                  Member
                </span>
              </th>
            </tr>
            <tr className="bg-slate-50/50 border-b border-slate-100 text-xs text-slate-500">
              <th></th>
              <th className="px-2 py-2">Read</th>
              <th className="px-2 py-2">Write</th>
              <th className="px-2 py-2">Manage</th>
              <th className="px-2 py-2">Read</th>
              <th className="px-2 py-2">Write</th>
              <th className="px-2 py-2">Manage</th>
              <th className="px-2 py-2">Read</th>
              <th className="px-2 py-2">Write</th>
              <th className="px-2 py-2">Manage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {permissions.map((perm) => (
              <tr key={perm.module} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <perm.icon className="w-5 h-5 text-slate-400" />
                    <span className="font-medium text-slate-700">{perm.module}</span>
                  </div>
                </td>
                <td className="px-2 py-4"><PermissionCell allowed={perm.owner.read} /></td>
                <td className="px-2 py-4"><PermissionCell allowed={perm.owner.write} /></td>
                <td className="px-2 py-4"><PermissionCell allowed={perm.owner.manage} /></td>
                <td className="px-2 py-4 bg-slate-50/30"><PermissionCell allowed={perm.admin.read} /></td>
                <td className="px-2 py-4 bg-slate-50/30"><PermissionCell allowed={perm.admin.write} /></td>
                <td className="px-2 py-4 bg-slate-50/30"><PermissionCell allowed={perm.admin.manage} /></td>
                <td className="px-2 py-4"><PermissionCell allowed={perm.member.read} /></td>
                <td className="px-2 py-4"><PermissionCell allowed={perm.member.write} /></td>
                <td className="px-2 py-4"><PermissionCell allowed={perm.member.manage} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
        <div className="flex items-center gap-6 text-xs text-slate-500">
          <span className="flex items-center gap-2">
            <span className="font-medium">Read:</span> View data
          </span>
          <span className="flex items-center gap-2">
            <span className="font-medium">Write:</span> Create & edit
          </span>
          <span className="flex items-center gap-2">
            <span className="font-medium">Manage:</span> Delete & configure
          </span>
        </div>
      </div>
    </div>
  );
};

export default RolesPermissionsMatrix;
