# API Migration Guide

This project has been migrated to use Redux Toolkit Query (RTK Query) following the same pattern as the `Web` folder.

## Structure

### Core Files
- `app/api/apiSlice.ts` - Main API slice with base query and token refresh logic
- `app/store.ts` - Redux store configuration
- `app/rootReducer.ts` - Root reducer combining all slices
- `app/utils/endpoints.ts` - Centralized endpoint definitions
- `app/utils/config.ts` - Environment configuration
- `app/hooks.ts` - Typed Redux hooks

### Feature API Slices
- `feature/authentication/authSlice.ts` - Auth state management
- `feature/authentication/authApiSlice.ts` - Auth API endpoints
- `feature/profile/profileApiSlice.ts` - Profile API endpoints
- `feature/chat/chatApiSlice.ts` - Chat API endpoints

## Usage Examples

### Authentication

```typescript
import { useLoginMutation, useGetAuthProfileQuery } from '@/feature/authentication/authApiSlice';
import { useAppDispatch } from '@/app/hooks';
import { setCredentials, logOut } from '@/feature/authentication/authSlice';

function LoginComponent() {
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const { data: profile } = useGetAuthProfileQuery();

  const handleLogin = async () => {
    try {
      const result = await login({ email, password }).unwrap();
      // Handle response
      dispatch(setCredentials({
        access_token: result.tokens.accessToken,
        refresh_token: result.tokens.refreshToken,
        user: result.user,
        uid: result.user.id,
      }));
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    // Your component JSX
  );
}
```

### Profile

```typescript
import { useGetEnrichedProfileQuery, useUpdateProfilePricingMutation } from '@/feature/profile/profileApiSlice';

function ProfileComponent({ userId }: { userId: string }) {
  const { data: profile, isLoading } = useGetEnrichedProfileQuery(userId);
  const [updatePricing] = useUpdateProfilePricingMutation();

  const handleUpdatePricing = async () => {
    try {
      await updatePricing({ userId, price: 100 }).unwrap();
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  // Component JSX
}
```

### Chat

```typescript
import { useGetUserRoomsQuery, useSendMessageMutation } from '@/feature/chat/chatApiSlice';

function ChatComponent() {
  const { data: rooms } = useGetUserRoomsQuery({ limit: 10, offset: 0 });
  const [sendMessage] = useSendMessageMutation();

  const handleSendMessage = async () => {
    try {
      await sendMessage({
        receiverId: 'user-id',
        content: 'Hello',
        type: 'text',
      }).unwrap();
    } catch (error) {
      console.error('Send failed:', error);
    }
  };

  // Component JSX
}
```

### Accessing Auth State

```typescript
import { useAppSelector } from '@/app/hooks';
import { selectCurrentUser, selectIsAuthenticated } from '@/feature/authentication/authSlice';

function MyComponent() {
  const user = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Use user and isAuthenticated
}
```

## Key Differences from Old ApiContext

1. **RTK Query Hooks**: Use generated hooks like `useLoginMutation()` instead of `apiContext.loginUser()`
2. **Automatic Caching**: RTK Query automatically caches and refetches data
3. **Loading States**: Use `isLoading`, `isFetching` from query hooks
4. **Error Handling**: Errors are returned in the mutation/query result
5. **Token Refresh**: Handled automatically by the base query

## Migration Checklist

- [x] Install Redux Toolkit and RTK Query
- [x] Create API slice structure
- [x] Create auth slice
- [x] Create feature API slices
- [x] Set up Redux store
- [x] Update app layout with Redux Provider
- [ ] Migrate components from ApiContext to RTK Query hooks (in progress)

## Notes

- The old `ApiContext` is still available for backward compatibility
- New code should use RTK Query hooks
- Token refresh is handled automatically
- All API calls go through the centralized `apiSlice`








