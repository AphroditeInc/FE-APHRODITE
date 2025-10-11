# Lib Folder Structure

Professional and scalable library structure for the Aphrodite application.

## 📁 Directory Structure

```
lib/
├── constants/          # Application constants
│   ├── api.constants.ts
│   └── index.ts
├── context/            # React context providers
│   └── ApiContext.tsx
├── hooks/              # Custom React hooks
│   ├── useAuth.ts
│   └── index.ts
├── services/           # API services and external integrations
│   ├── api.service.ts
│   └── index.ts
├── types/              # TypeScript type definitions
│   ├── api.types.ts
│   ├── auth.types.ts
│   └── index.ts
├── utils/              # Utility functions
│   ├── storage.utils.ts
│   ├── validation.utils.ts
│   └── index.ts
└── index.ts            # Central export
```

## 📖 Usage

### Importing Types
```typescript
import { User, AuthTokens, ApiResponse } from '@/lib/types';
```

### Importing Services
```typescript
import { apiService } from '@/lib/services';
```

### Importing Utils
```typescript
import { saveAuthTokens, isValidEmail } from '@/lib/utils';
```

### Importing Constants
```typescript
import { API_ENDPOINTS, STORAGE_KEYS } from '@/lib/constants';
```

### Importing Hooks
```typescript
import { useAuth } from '@/lib/hooks';
```

### Importing Context
```typescript
import { useApi, ApiProvider } from '@/lib/context/ApiContext';
```

## 🎯 Best Practices

1. **Types**: All interfaces and type definitions go in `/types`
2. **Constants**: All constants and configuration go in `/constants`
3. **Services**: All external API calls go in `/services`
4. **Utils**: All helper/utility functions go in `/utils`
5. **Hooks**: All custom React hooks go in `/hooks`
6. **Context**: All React context providers go in `/context`

## 📝 Adding New Features

### Adding a new type:
1. Create/update file in `/types`
2. Export from `/types/index.ts`

### Adding a new service:
1. Create file in `/services`
2. Export from `/services/index.ts`

### Adding a new utility:
1. Create file in `/utils`
2. Export from `/utils/index.ts`

### Adding a new hook:
1. Create file in `/hooks`
2. Export from `/hooks/index.ts`

## 🔒 Type Safety

All exports are fully typed with TypeScript. Use the central `/lib/index.ts` for imports when possible.