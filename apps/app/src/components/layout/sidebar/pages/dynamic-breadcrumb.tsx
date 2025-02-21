'use client';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useAppDispatch, useAppSelector } from '@/services/hooks';
import { fetchNetworksByUserId, selectNetworks } from '@/services/v1/networkSlice';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export function DynamicBreadcrumb() {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter((segment) => segment !== '');
  const dispatch = useAppDispatch();
  const networks = useAppSelector(selectNetworks);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const user = sessionStorage.getItem('user');
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        setUserId(parsedUser.id);
      } catch (e) {
        console.error('Failed to parse user from sessionStorage:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (userId && pathSegments[0] === 'network' && networks.length === 0) {
      dispatch(fetchNetworksByUserId({ userId, page: 1, limit: 10 }));
    }
  }, [dispatch, pathSegments, networks.length, userId]);

  const getNetworkName = (networkId: string) => {
    const network = networks.find((n) => n.id === networkId);
    return network ? network.name : '...';
  };

  const getBreadcrumbItems = () => {
    if (pathSegments.length === 0) {
      return []; // Return empty array when on '/'
    }

    const items = [{ name: 'Home', href: '/' }];

    if (pathSegments[0] === 'network') {
      items.push({ name: 'Networks', href: '/network' });

      if (pathSegments[1]) {
        items.push({
          name: getNetworkName(pathSegments[1]),
          href: `/network/${pathSegments[1]}`,
        });

        if (pathSegments[2] === 'node' && pathSegments[3]) {
          const nodeIndex = pathSegments[3].split('-')[1];
          items.push({
            name: `Node ${nodeIndex}`,
            href: `/${pathSegments.join('/')}`,
          });
        }
      }
    }

    return items;
  };

  const breadcrumbItems = getBreadcrumbItems();

  return breadcrumbItems.length > 0 ? (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => (
          <BreadcrumbItem key={item.href}>
            {index > 0 && <BreadcrumbSeparator />}
            {index === breadcrumbItems.length - 1 ? (
              <BreadcrumbPage>{item.name}</BreadcrumbPage>
            ) : (
              <BreadcrumbLink href={item.href}>{item.name}</BreadcrumbLink>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  ) : (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem key="home">
          <BreadcrumbLink href={'/'} className="text-foreground">
            {' '}
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
