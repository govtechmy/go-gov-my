'use client';

import { useIntlClientHook } from '@/lib/middleware/utils/useI18nClient';
import { debounce } from 'lodash';
import { Download, User } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { CSVLink } from 'react-csv';

interface User {
  id: string;
  name: string;
  email: string;
  agencyCode: string;
  role: string;
  createdAt: string;
  image: string | null;
}

type RoleType = 'staff' | 'agency_admin' | 'super_admin';

const roleDisplay: Record<RoleType, string> = {
  staff: 'Staff',
  agency_admin: 'Agency Administrator',
  super_admin: 'Super Administrator',
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date
    .toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
    .replace(',', '');
}

const Avatar = ({ src, name }: { src: string | null; name: string }) => {
  if (src) {
    return (
      <Image
        src={src}
        alt={`${name}'s avatar`}
        width={40}
        height={40}
        className="rounded-full"
      />
    );
  }
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
      <User className="h-6 w-6 text-gray-500 dark:text-gray-400" />
    </div>
  );
};

export default function MemberLists() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const { messages } = useIntlClientHook();

  const fetchUsers = async (pageNum: number, search: string) => {
    try {
      const response = await fetch(
        `/api/user/agency?page=${pageNum}&search=${search}`,
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setUsers(data.users);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Fetching users failed:', error);
    }
  };

  useEffect(() => {
    fetchUsers(page, searchTerm);
  }, [page, searchTerm]);

  const debouncedSearch = debounce((value: string) => {
    setSearchTerm(value);
    setPage(1);
  }, 300);

  const csvData = users.map((user) => ({
    Name: user.name,
    Email: user.email,
    'Agency Code': user.agencyCode.toUpperCase(),
    Role: roleDisplay[user.role as RoleType] || user.role,
    'Created At': formatDate(user.createdAt),
  }));

  return (
    <div>
      <div className="flex flex-row items-center justify-between space-x-4 bg-white pb-4 dark:bg-gray-900">
        <div className="relative flex-grow">
          <div className="rtl:inset-r-0 pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
            <svg
              className="h-4 w-4 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full rounded-lg border border-gray-300 bg-white ps-10 pt-2 text-sm text-gray-900 focus:border-gray-500 focus:ring-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            placeholder={messages?.admin?.user_management?.user_search}
            onChange={(e) => debouncedSearch(e.target.value)}
          />
        </div>
        <CSVLink
          data={csvData}
          filename={`${new Date().toISOString()}-user-list.csv`}
          className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-center text-sm font-medium text-black hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-500"
        >
          <Download className="h-4 w-4" />
        </CSVLink>
      </div>
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-left text-sm text-gray-500 rtl:text-right dark:text-gray-400">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Avatar
              </th>
              <th scope="col" className="px-6 py-3">
                {messages?.admin?.user_management?.user_full_name}
              </th>
              <th scope="col" className="px-6 py-3">
                {messages?.admin?.user_management?.user_email}
              </th>
              <th scope="col" className="px-6 py-3">
                {messages?.admin?.user_management?.user_agency}
              </th>
              <th scope="col" className="px-6 py-3">
                {messages?.admin?.user_management?.user_role}
              </th>
              <th scope="col" className="px-6 py-3">
                {messages?.admin?.user_management?.user_created}
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
              >
                <td className="px-6 py-4">
                  <Avatar
                    src={(user.image || '').replace(/\s+/g, '-')}
                    name={user.name}
                  />
                </td>
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 dark:text-white"
                >
                  <div className="max-w-[200px] break-words">{user.name}</div>
                </th>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">{user.agencyCode.toUpperCase()}</td>
                <td className="px-6 py-4">
                  {roleDisplay[user.role as RoleType] || user.role}
                </td>
                <td className="px-6 py-4">{formatDate(user.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <nav
        className="flex-column flex flex-wrap items-center justify-between pt-4 md:flex-row"
        aria-label="Table navigation"
      >
        <span className="mb-4 block w-full text-sm font-normal text-gray-500 dark:text-gray-400 md:mb-0 md:inline md:w-auto">
          {messages?.admin?.user_management?.user_showing}{' '}
          <span className="font-semibold text-gray-900 dark:text-white">
            {users.length > 0 ? (page - 1) * 10 + 1 : 0}-
            {Math.min(page * 10, users.length)}
          </span>{' '}
          {messages?.admin?.user_management?.user_of}{' '}
          <span className="font-semibold text-gray-900 dark:text-white">
            {users.length}
          </span>
        </span>
        <ul className="inline-flex h-8 -space-x-px text-sm rtl:space-x-reverse">
          <li>
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="ms-0 flex h-8 items-center justify-center rounded-s-lg border border-gray-300 bg-white px-3 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              {messages?.admin?.user_management?.user_previous}
            </button>
          </li>
          {[...Array(totalPages)].map((_, i) => (
            <li key={i}>
              <button
                onClick={() => setPage(i + 1)}
                aria-current={page === i + 1 ? 'page' : undefined}
                className={`flex h-8 items-center justify-center px-3 leading-tight ${
                  page === i + 1
                    ? 'border border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white'
                    : 'border border-gray-300 bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
                }`}
              >
                {i + 1}
              </button>
            </li>
          ))}
          <li>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="flex h-8 items-center justify-center rounded-e-lg border border-gray-300 bg-white px-3 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              {messages?.admin?.user_management?.user_next}
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
