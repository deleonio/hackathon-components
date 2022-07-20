# Table

Beispiel:

```tsx
import React from 'react';

import { KolReactTable } from './component';
import { TABLE_DATA, TABLE_HEADERS, TABLE_HEADERS2 } from './data';

export const MyComponent = () => {
  return <KolReactTable caption="Test" data={TABLE_DATA} headers={TABLE_HEADERS2} pagination></KolReactTable>;
}
```