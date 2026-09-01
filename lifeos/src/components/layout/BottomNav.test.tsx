import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import BottomNav from './BottomNav';
import { primaryMobileNav, secondaryNavGroups } from './navConfig';

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <BottomNav />
    </MemoryRouter>
  );

describe('BottomNav', () => {
  it('renders every pinned destination plus More', () => {
    renderAt('/');
    const bar = screen.getByRole('navigation', { name: 'Primary' });

    for (const item of primaryMobileNav) {
      expect(within(bar).getByRole('button', { name: item.label })).toBeInTheDocument();
    }
    expect(within(bar).getByRole('button', { name: 'More' })).toBeInTheDocument();
  });

  it('marks only the current route as active', () => {
    renderAt('/tasks');
    const bar = screen.getByRole('navigation', { name: 'Primary' });

    expect(within(bar).getByRole('button', { name: 'Tasks' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(within(bar).getByRole('button', { name: 'Home' })).not.toHaveAttribute('aria-current');
  });

  it('does not mark Home active on a nested route', () => {
    renderAt('/settings');
    const bar = screen.getByRole('navigation', { name: 'Primary' });

    expect(within(bar).getByRole('button', { name: 'Home' })).not.toHaveAttribute('aria-current');
  });

  it('opens a sheet listing the remaining destinations', async () => {
    const user = userEvent.setup();
    renderAt('/');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'More' }));

    const sheet = await screen.findByRole('dialog', { name: 'All sections' });
    const firstSecondary = secondaryNavGroups[0].items[0];
    expect(within(sheet).getByRole('button', { name: firstSecondary.label })).toBeInTheDocument();
  });

  it('keeps pinned destinations out of the More sheet', () => {
    const secondaryPaths = secondaryNavGroups.flatMap((g) => g.items.map((i) => i.path));
    for (const item of primaryMobileNav) {
      expect(secondaryPaths).not.toContain(item.path);
    }
  });
});
