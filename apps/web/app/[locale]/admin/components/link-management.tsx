'use client';

import { useIntlClientHook } from '@/lib/middleware/utils/useI18nClient';
import { LinkWithTagsProps } from '@/lib/types';
import { useAddEditLinkModal } from '@/ui/modals/add-edit-link-modal';
import { Link as PrismaLink } from '@prisma/client';
import { debounce } from 'lodash';
import { Download, EllipsisVertical, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';
import NextLink from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CSVLink } from 'react-csv';

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

interface LinkWithRelations extends Omit<PrismaLink, 'createdAt'> {
  createdAt: string;
  user: { name: string } | null;
  project: { name: string } | null;
}

// Update the ExtendedLinkWithTagsProps interface
interface ExtendedLinkWithTagsProps
  extends Omit<LinkWithRelations, 'project' | 'user' | 'createdAt'> {
  tags: any[]; // Replace 'any' with the correct type for tags
  projectId: string;
  user: string;
  createdAt: Date; // Change this to Date
}

export default function LinkManagement() {
  const { data: session } = useSession();
  const [links, setLinks] = useState<LinkWithRelations[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLink, setSelectedLink] = useState<LinkWithTagsProps | null>(null);
  const { setShowAddEditLinkModal, AddEditLinkModal } = useAddEditLinkModal({
    props: selectedLink || undefined,
  });

  const params = useParams();
  const locale = params.locale as string;
  const { messages } = useIntlClientHook();

  const handleEditLink = (link: LinkWithRelations) => {
    const linkWithTags: ExtendedLinkWithTagsProps = {
      ...link,
      tags: [], // Add tags if available in your data
      projectId: link.project?.name ?? '',
      user: link.user?.name ?? '',
      createdAt: new Date(link.createdAt), // Convert string to Date
    };
    setSelectedLink(linkWithTags);
    setShowAddEditLinkModal(true);
  };

  const fetchLinks = async (pageNum: number, search: string) => {
    try {
      const response = await fetch(`/api/admin/workspaces?page=${pageNum}&search=${search}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setLinks(data.links);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Fetching links failed:', error);
    }
  };

  useEffect(() => {
    fetchLinks(page, searchTerm);
  }, [page, searchTerm]);

  const debouncedSearch = debounce((value: string) => {
    setSearchTerm(value);
    setPage(1);
  }, 300);

  const csvData = links.map((link) => ({
    Key: link.key,
    URL: link.url,
    Domain: link.domain,
    User: link.user?.name || 'N/A',
    Project: link.project?.name || 'N/A',
    'Created At': formatDate(link.createdAt),
  }));

  const closeModal = () => {
    setSelectedLink(null);
    setShowAddEditLinkModal(false);
  };

  useEffect(() => {
    if (selectedLink) {
      setShowAddEditLinkModal(true);
    }
  }, [selectedLink, setShowAddEditLinkModal]);

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
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full rounded-lg border border-gray-300 bg-white ps-10 pt-2 text-sm text-gray-900 focus:border-gray-500 focus:ring-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            placeholder={messages?.admin?.workspace_management?.workspace_search}
            onChange={(e) => debouncedSearch(e.target.value)}
          />
        </div>
        <CSVLink
          data={csvData}
          filename={`${new Date().toISOString()}-link-list.csv`}
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
                {messages?.admin?.workspace_management?.workspace_short_link}
              </th>
              <th scope="col" className="px-6 py-3">
                {messages?.admin?.workspace_management?.workspace_redirect_url}
              </th>
              <th scope="col" className="px-6 py-3">
                {messages?.admin?.workspace_management?.workspace_workspace}
              </th>
              <th scope="col" className="px-6 py-3">
                {messages?.admin?.workspace_management?.workspace_owner}
              </th>
              <th scope="col" className="px-6 py-3">
                {messages?.admin?.workspace_management?.workspace_banned}
              </th>
              <th scope="col" className="px-6 py-3">
                {messages?.admin?.workspace_management?.workspace_members}
              </th>
              <th scope="col" className="px-6 py-3">
                {messages?.admin?.workspace_management?.workspace_actions}
              </th>
            </tr>
          </thead>
          <tbody>
            {links.map((link) => (
              <tr
                key={link.id}
                className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
              >
                <td className="px-6 py-4 text-blue-500 hover:text-blue-700">
                  <NextLink href={`https://${link.domain}/${link.key}`} target="_blank">
                    {link.domain}/{link.key}
                  </NextLink>
                </td>
                <td className="px-6 py-4 text-blue-500 hover:text-blue-700">
                  <NextLink href={`${link.url}`} target="_blank">
                    {link.url}
                  </NextLink>
                </td>
                <td className="px-6 py-4 font-medium text-gray-800 hover:text-gray-900">
                  {link.project?.name || 'N/A'}
                </td>
                <td className="px-6 py-4">{link.user?.name || 'N/A'}</td>
                <td className="px-6 py-4">{link.banned ? 'Yes' : 'No'}</td>
                <td className="px-6 py-4 text-blue-500 hover:text-blue-700">
                  <div className="flex items-center">
                    <NextLink
                      className="ml-2 rounded-lg border border-gray-300 bg-white p-2 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-500"
                      href={`${
                        process.env.NODE_ENV === 'development'
                          ? `${window.location.origin}/${locale}/${(link.project?.name?.toLowerCase() || '').replace(/\s+/g, '-')}/settings/people`
                          : `https://app.pautan.org/${locale}/${(link.project?.name?.toLowerCase() || '').replace(/\s+/g, '-')}/settings/people`
                      }`}
                      target="_blank"
                      title={link.project?.name || 'N/A'}
                    >
                      <Users className="h-5 w-5" />
                    </NextLink>
                  </div>
                </td>
                <td className="px-6 py-4 text-blue-500 hover:text-blue-700">
                  <div className="flex items-center">
                    <NextLink
                      className="ml-2 rounded-lg border border-gray-300 bg-white p-2 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-500"
                      href={`${
                        process.env.NODE_ENV === 'development'
                          ? `${window.location.origin}/${locale}/${(link.project?.name?.toLowerCase() || '').replace(/\s+/g, '-')}`
                          : `https://${window.location.host}/${locale}/${(link.project?.name?.toLowerCase() || '').replace(/\s+/g, '-')}`
                      }`}
                      target="_blank"
                      title={link.project?.name || 'N/A'}
                    >
                      <EllipsisVertical className="h-5 w-5" />
                    </NextLink>
                  </div>
                </td>
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
          {messages?.admin?.workspace_management?.workspace_showing}{' '}
          <span className="font-semibold text-gray-900 dark:text-white">
            {links.length > 0 ? (page - 1) * 10 + 1 : 0}-{Math.min(page * 10, links.length)}
          </span>{' '}
          {messages?.admin?.workspace_management?.workspace_of}{' '}
          <span className="font-semibold text-gray-900 dark:text-white">{links.length}</span>
        </span>
        <ul className="inline-flex h-8 -space-x-px text-sm rtl:space-x-reverse">
          <li>
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="ms-0 flex h-8 items-center justify-center rounded-s-lg border border-gray-300 bg-white px-3 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              {messages?.admin?.workspace_management?.workspace_previous}
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
              {messages?.admin?.workspace_management?.workspace_next}
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
