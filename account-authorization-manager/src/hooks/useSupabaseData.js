import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase, isSupabaseEnabled } from '../services/supabaseClient';
import { mockAccounts } from '../data/mockAccounts';
import { mockAdmins } from '../data/mockAdmins';

const normalizeAccount = (account) => ({
    id: account.id,
    name: account.name,
    authorizedBy: account.authorized_by ?? account.authorizedBy,
    startDate: account.start_date ?? account.startDate,
    expirationDate: account.end_date ?? account.expirationDate,
});

const normalizeAdmin = (admin) => ({
    id: admin.id,
    name: admin.name,
    startDate: admin.start_date ?? admin.startDate,
    expirationDate: admin.end_date ?? admin.expirationDate,
    specialization: admin.specialization ?? '',
});

export const useSupabaseData = () => {
    const [accounts, setAccounts] = useState(() => mockAccounts);
    const [admins, setAdmins] = useState(() => mockAdmins);
    const [isLoading, setIsLoading] = useState(() => isSupabaseEnabled);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        if (!isSupabaseEnabled) {
            setIsLoading(false);
            setError(null);
            setAccounts(mockAccounts);
            setAdmins(mockAdmins);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const [
                { data: adminRows, error: adminError },
                { data: accountRows, error: accountError },
            ] = await Promise.all([
                supabase.from('admins_table').select('*').order('start_date'),
                supabase.from('accounts_table').select('*').order('start_date'),
            ]);

            if (adminError || accountError) {
                throw adminError ?? accountError;
            }

            setAdmins((adminRows ?? []).map(normalizeAdmin));
            setAccounts((accountRows ?? []).map(normalizeAccount));
        } catch (err) {
            console.error('Failed to fetch Supabase data', err);
            setError(err);
            setAccounts(mockAccounts);
            setAdmins(mockAdmins);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!isSupabaseEnabled) {
            setIsLoading(false);
            return;
        }
        fetchData();
    }, [fetchData]);

    const stats = useMemo(
        () => ({
            totalAccounts: accounts.length,
            totalAdmins: admins.length,
        }),
        [accounts, admins]
    );

    return {
        accounts,
        admins,
        stats,
        isLoading,
        error,
        refresh: fetchData,
        isSupabaseEnabled,
    };
};
