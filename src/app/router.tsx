import { createBrowserRouter, Navigate } from 'react-router-dom'
import { RootLayout } from '@/app/root-layout'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { RequestsListPage } from '@/features/requests/pages/RequestsListPage'
import { CreateRequestPage } from '@/features/requests/pages/CreateRequestPage'
import { ViewRequestPage } from '@/features/requests/pages/ViewRequestPage'

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <RootLayout />,
      children: [
        { index: true, element: <Navigate to="/requests" replace /> },
        { path: 'requests', element: <RequestsListPage /> },
        { path: 'requests/new', element: <CreateRequestPage /> },
        { path: 'requests/:id', element: <ViewRequestPage /> },
        { path: '*', element: <NotFoundPage /> },
      ],
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
    },
  },
)
