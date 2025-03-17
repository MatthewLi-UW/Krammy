export const ACCESS = {
    READ: 'READ',
    WRITE: 'WRITE',
  } as const;
  
  export type AccessType = typeof ACCESS[keyof typeof ACCESS]; 