import z from 'zod';

const locationSchema = z
  .string()
  .refine(
    (data) => {
      const parts = data.split(',');
      return (
        parts.length === 2 && parts.every((part) => !isNaN(parseFloat(part)))
      );
    },
    {
      message:
        "Invalid location format. Correct format is 'longitude,latitude'.",
    },
  )
  .transform((data) => {
    const [latitude, longitude] = data.split(',').map(Number);
    return { longitude, latitude };
  });

const SearchSchema = z.object({
  perPage: z.preprocess(
    (v) => +((v ?? '20') as string),
    z.number().min(1).max(100),
  ),
  page: z.preprocess((v) => +((v ?? '1') as string), z.number().min(1)),
  search: z.string().default(''),
  order: z.enum(['desc', 'asc']).default('desc'),
  orderBy: z.string().default('createdAt'),
  location: locationSchema.optional(),
});

export { SearchSchema };
