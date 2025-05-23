'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAppDispatch, useAppSelector } from '@/services/hooks';
import {
  clearAdminState,
  createUsers,
  selectAdminError,
  selectAdminLoading,
  selectAdminSuccessMessage,
} from '@/services/v1/adminSlice';
import { UserRole } from '@/types/v1/admin';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

/* ───────────────── Schema (no password field) ───────────────── */
const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Enter a valid email address.' }),
  role: z.enum([UserRole.DEMO, UserRole.USER, UserRole.ADMIN]),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  onSuccess?: (name: string, email: string) => void;
  onCancel: () => void;
}

/* ───────────────── Component ───────────────── */
export function CreateDemoUserForm({ onSuccess, onCancel }: Props) {
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const loading = useAppSelector(selectAdminLoading);
  const error = useAppSelector(selectAdminError);
  const successMessage = useAppSelector(selectAdminSuccessMessage);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      role: UserRole.DEMO,
    },
  });

  /* ───────── Slice feedback ───────── */
  useEffect(() => {
    if (successMessage) {
      toast({ description: successMessage });
      const { name, email } = form.getValues();
      onSuccess?.(name, email);
      form.reset();
      dispatch(clearAdminState());
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      toast({ description: error, variant: 'destructive' });
      dispatch(clearAdminState());
    }
  }, [error]);

  /* ───────── Password generator ───────── */
  const generatePassword = () => {
    const sets = {
      lower: 'abcdefghijklmnopqrstuvwxyz',
      upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      num: '0123456789',
      sym: '!@#$%^&*()_+[]{}|;:,.<>?',
    };
    const all = Object.values(sets).join('');

    // at least 12 chars, always include 1 from each set
    let pwd =
      sets.lower[Math.floor(Math.random() * sets.lower.length)] +
      sets.upper[Math.floor(Math.random() * sets.upper.length)] +
      sets.num[Math.floor(Math.random() * sets.num.length)] +
      sets.sym[Math.floor(Math.random() * sets.sym.length)];

    for (let i = 0; i < 8; i++) {
      pwd += all[Math.floor(Math.random() * all.length)];
    }
    return pwd
      .split('')
      .sort(() => 0.5 - Math.random())
      .join('');
  };

  /* ───────── Submit ───────── */
  const handleSubmit = (values: FormValues) => {
    const password = generatePassword(); // admin never sees it
    dispatch(createUsers({ ...values, password }));
  };

  /* ───────── UI ───────── */
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="flex flex-col gap-4">
          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Demo User" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="demo@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Role */}
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={UserRole.DEMO}>Demo</SelectItem>
                    <SelectItem value={UserRole.USER}>User</SelectItem>
                    <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>The role for this user.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create User'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
