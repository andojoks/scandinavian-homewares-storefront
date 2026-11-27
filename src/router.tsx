import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter } from 'react-router'
import { DashboardSkeleton } from './components/DashboardSkeleton'
import { ProtectedRoute } from './components/ProtectedRoute'
import { StoreLayout } from './components/StoreLayout'
import Home from './pages/Home'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import ProductPage from './pages/Product'
import RouteError from './pages/RouteError'
import Shop from './pages/Shop'
import { Root } from './Root'

const Checkout = lazy(() => import('./pages/Checkout'))
const Account = lazy(() => import('./pages/Account'))
const DashboardLayout = lazy(() => import('./pages/dashboard/DashboardLayout'))
const Overview = lazy(() => import('./pages/dashboard/Overview'))
const Orders = lazy(() => import('./pages/dashboard/Orders'))
const Products = lazy(() => import('./pages/dashboard/Products'))
const Categories = lazy(() => import('./pages/dashboard/Categories'))

const storeSuspense = (node: ReactNode) => (
  <Suspense fallback={<div className="min-h-[70vh]" />}>{node}</Suspense>
)

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

export const router = createBrowserRouter(
  [
    {
      element: <Root />,
      errorElement: <RouteError />,
      children: [
        {
          element: <StoreLayout />,
          children: [
            { index: true, element: <Home /> },
            { path: 'shop', element: <Shop /> },
            { path: 'product/:id', element: <ProductPage /> },
            { path: 'login', element: <Login /> },
            {
              path: 'checkout',
              element: <ProtectedRoute>{storeSuspense(<Checkout />)}</ProtectedRoute>,
            },
            {
              path: 'account',
              element: <ProtectedRoute>{storeSuspense(<Account />)}</ProtectedRoute>,
            },
            { path: '*', element: <NotFound /> },
          ],
        },
        {
          path: 'dashboard',
          element: (
            <ProtectedRoute admin>
              <Suspense fallback={<DashboardSkeleton />}>
                <DashboardLayout />
              </Suspense>
            </ProtectedRoute>
          ),
          children: [
            {
              index: true,
              element: (
                <Suspense fallback={null}>
                  <Overview />
                </Suspense>
              ),
            },
            {
              path: 'orders',
              element: (
                <Suspense fallback={null}>
                  <Orders />
                </Suspense>
              ),
            },
            {
              path: 'products',
              element: (
                <Suspense fallback={null}>
                  <Products />
                </Suspense>
              ),
            },
            {
              path: 'categories',
              element: (
                <Suspense fallback={null}>
                  <Categories />
                </Suspense>
              ),
            },
          ],
        },
      ],
    },
  ],
  { basename },
)
