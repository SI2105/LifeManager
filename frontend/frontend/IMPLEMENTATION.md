# LifeManager Frontend - Environment Setup

## Environment Variables

Create a `.env.local` file in `/home/si04/repos/LifeManager/frontend/frontend/` with the following:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## Setup Instructions

1. **Install Dependencies** (already done)
   ```bash
   cd frontend/frontend
   npm install zustand axios date-fns
   ```

2. **Configure Environment Variables**
   - Create `.env.local` file with `NEXT_PUBLIC_API_URL`
   - Default: `http://localhost:8000/api/v1`
   - Change this if your backend is running on a different URL

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   - Frontend will run on `http://localhost:3000`

4. **Backend Requirement**
   - Ensure Django backend is running on `http://localhost:8000`
   - CORS must be configured if backend is on a different domain
   - Add `django-cors-headers` to backend if needed

## Key Features Implemented

### Phase 1: Infrastructure ✅
- JWT API client with token refresh interceptors
- TypeScript types for all backend models
- Three Zustand stores: auth, tasks, categories
- Utility modules: validation, constants, localStorage
- Route protection middleware

### Phase 2: Components ✅
- **Layout**: AppLayout (dashboard), AuthLayout (auth pages)
- **Forms**: AuthForm (login/register), TaskForm (create/edit), CategoryForm (create)
- **Input Fields**: TextInput, TextArea, Select, DatePicker, Checkbox
- **Task Display**: TaskCard, TaskList, TaskDetail, SubtaskList, RecurrenceDisplay
- **Filters**: TaskFilters, SearchBar, SortOptions
- **Utilities**: Button, Badge, Modal, Toast (with useToast hook), LoadingSpinner, Header, Sidebar

### Phase 3: Pages ✅
- **`/`** - Home (redirects to dashboard or auth)
- **`/auth`** - Login/Register (toggled UI)
- **`/dashboard`** - Main task list with filters, search, sort
- **`/dashboard/tasks/[id]`** - Task detail view and edit
- **`/dashboard/categories`** - Category management (CRUD)
- **`/dashboard/settings`** - User profile settings and logout

### Phase 4: State Management ✅
- Auth store: login, register, logout, profile update
- Task store: CRUD, filtering, search, status transitions
- Category store: CRUD, lookup functions

### Phase 5-7: Advanced Features
- ✅ Recurrence display
- ✅ Subtask hierarchy
- ✅ Rich filtering (status, priority, category, date range)
- ✅ Real-time search with debounce
- ✅ Sorting options
- ✅ Error handling with Toast notifications
- ✅ Loading states
- ✅ Empty states with helpful CTAs
- ✅ Accessible forms and navigation

## Next Steps for Production

1. **CORS Configuration**
   - If frontend and backend are on different domains, add `django-cors-headers` to backend
   - Configure CORS in Django settings to allow the frontend URL

2. **HTTP-Only Cookies** (Security Upgrade)
   - Replace localStorage tokens with httpOnly cookies
   - Update API client to handle cookies automatically
   - Update backend to send tokens in httpOnly cookies

3. **Error Handling Improvements**
   - Add retry logic for failed network requests
   - Implement error logging/monitoring
   - Add fallback UI for API errors

4. **Performance Optimization**
   - Implement virtual scrolling for large task lists
   - Add pagination UI (currently handled server-side)
   - Optimize images and assets
   - Consider implementing React Query for better server state management

5. **UX Enhancements**
   - Add dark mode support
   - Mobile menu drawer for sidebar
   - Task quick actions (mark done, quick edit)
   - Keyboard shortcuts
   - Drag-and-drop for task reordering
   - Saved filter presets

6. **Testing**
   - Unit tests for stores and utilities
   - Component tests for forms and displays
   - E2E tests for critical flows

7. **Deployment**
   - Build optimization: `npm run build`
   - Deploy to Vercel, Netlify, or similar
   - Set up CI/CD pipeline
   - Configure production environment variables

## File Structure

```
frontend/
├── app/
│   ├── page.tsx (home redirect)
│   ├── auth/
│   │   └── page.tsx (login/register)
│   ├── dashboard/
│   │   ├── page.tsx (task list)
│   │   ├── tasks/
│   │   │   └── [id]/
│   │   │       └── page.tsx (task detail)
│   │   ├── categories/
│   │   │   └── page.tsx (category management)
│   │   └── settings/
│   │       └── page.tsx (profile settings)
│   ├── layout.tsx (root layout with toast)
│   └── globals.css
├── components/
│   ├── common/ (Button, Badge, Modal, Toast, Header, Sidebar, LoadingSpinner)
│   ├── layouts/ (AppLayout, AuthLayout)
│   ├── forms/ (AuthForm, TaskForm, CategoryForm)
│   ├── inputs/ (TextInput, TextArea, Select, DatePicker, Checkbox)
│   ├── tasks/ (TaskCard, TaskList, TaskDetail, SubtaskList, RecurrenceDisplay)
│   └── filters/ (TaskFilters, SearchBar, SortOptions)
├── lib/
│   ├── api/
│   │   ├── client.ts (Axios instance with JWT interceptors)
│   │   ├── endpoints.ts (API functions)
│   │   └── types.ts (TypeScript interfaces)
│   └── utils/
│       ├── localStorage.ts (Token storage)
│       ├── constants.ts (Enums and constants)
│       └── validation.ts (Form validation helpers)
├── store/
│   ├── authStore.ts (Zustand auth state)
│   ├── taskStore.ts (Zustand task state)
│   └── categoryStore.ts (Zustand category state)
├── middleware.ts (Route protection)
├── package.json
├── tsconfig.json
└── next.config.ts
```

## Testing the App

### Critical User Flows

1. **Authentication Flow**
   - Register new account → login → redirect to dashboard ✅
   - Logout → clear tokens → redirect to auth ✅
   - Token refresh on API call ✅

2. **Task Management**
   - Create task → appears in list ✅
   - Edit task → updates immediately ✅
   - Delete task → removed from list ✅
   - Archive task → excluded from default view ✅

3. **Filtering & Search**
   - Filter by status/priority/category ✅
   - Apply date range filters ✅
   - Real-time search ✅
   - Combined filters work together ✅

4. **Categories**
   - Create category → appears in sidebar ✅
   - Assign to task → shows in task card ✅
   - Delete category → tasks unassign ✅

5. **Subtasks**
   - Create subtask with parent ✅
   - Subtasks visible under parent ✅
   - Delete parent cascades ✅

6. **Error Handling**
   - Network error → Toast notification ✅
   - Validation error → Form field highlight ✅
   - 401 unauthorized → redirect to login ✅

## Troubleshooting

### API Connection Issues
- Verify backend is running on correct port (default: 8000)
- Check `NEXT_PUBLIC_API_URL` environment variable
- Ensure CORS is configured if different domain
- Check browser console for network errors

### Auth Issues
- Tokens not persisting → check localStorage in browser DevTools
- Token refresh failing → verify backend token endpoint
- Redirect loops → check auth store initialization

### Component Issues
- Styles not applying → verify Tailwind CSS is compiled
- Forms not working → check input change handlers
- Filters not working → verify store filtering logic

## Support & Documentation

- **Next.js**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Zustand**: https://github.com/pmndrs/zustand
- **Axios**: https://axios-http.com/docs/intro
- **TypeScript**: https://www.typescriptlang.org/docs/
