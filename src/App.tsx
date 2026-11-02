/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AppLayout } from './components/layout/AppLayout';

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppLayout />
      </NotificationProvider>
    </AuthProvider>
  );
}
