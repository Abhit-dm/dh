import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AdminRole } from '@/generated/prisma/enums';
import type { AuthenticatedAdmin } from '@/lib/auth';
import { authorizeResource } from '@/lib/admin-api';

const editor: AuthenticatedAdmin = {
  id: '00000000-0000-4000-8000-000000000001',
  email: 'editor@example.test',
  name: 'Editor',
  role: AdminRole.EDITOR,
  isActive: true,
};

test('limits editor access to gallery and blog resources', () => {
  assert.doesNotThrow(() => authorizeResource(editor, 'gallery-images'));
  assert.doesNotThrow(() => authorizeResource(editor, 'blog-posts'));
  assert.throws(
    () => authorizeResource(editor, 'appointments'),
    { code: 'PERMISSION_DENIED' },
  );
  assert.throws(
    () => authorizeResource(editor, 'admin-users'),
    { code: 'PERMISSION_DENIED' },
  );
});

test('allows super administrators to access protected administrative resources', () => {
  assert.doesNotThrow(() =>
    authorizeResource({ ...editor, role: AdminRole.SUPER_ADMIN }, 'admin-users'),
  );
});
