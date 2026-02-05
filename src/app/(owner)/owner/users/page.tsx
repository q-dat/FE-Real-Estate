'use client';
import { UserItem, UserRole, userService } from '@/services/owner/user.service';
import { useEffect, useState } from 'react';

const ROLE_OPTIONS: UserRole[] = ['user', 'admin', 'owner'];

export default function OwnerUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userService.getAll();
      setUsers(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (id: string, role: UserRole) => {
    setUpdatingId(id);
    try {
      await userService.updateRole(id, role);
      await fetchUsers();
    } finally {
      setUpdatingId(null);
    }
  };

  const handleActiveToggle = async (id: string, isActive: boolean) => {
    setUpdatingId(id);
    try {
      await userService.updateActive(id, isActive);
      await fetchUsers();
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return (
    <div className="w-screen border-4 border-white xl:w-full">
      <div className="overflow-x-auto rounded-md border border-primary">
        <table className="table table-zebra">
          <thead>
            <tr className="text-xs uppercase">
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Email Verified</th>
              <th>Last Login</th>
              <th>Created</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td className="font-medium">{user.email}</td>

                <td>
                  <select
                    className="select select-bordered select-sm"
                    value={user.role}
                    disabled={updatingId === user._id}
                    onChange={(e) => handleRoleChange(user._id, e.target.value as UserRole)}
                  >
                    {ROLE_OPTIONS.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </td>

                <td>
                  <input
                    type="checkbox"
                    className="toggle toggle-success"
                    checked={user.isActive}
                    disabled={updatingId === user._id}
                    onChange={(e) => handleActiveToggle(user._id, e.target.checked)}
                  />
                </td>

                <td>{user.emailVerified ? <span className="text-success">Yes</span> : <span className="text-error">No</span>}</td>

                <td>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : '-'}</td>

                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
